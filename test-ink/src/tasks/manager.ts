/**
 * Task Manager Module
 * 
 * Implements the TaskManager class - the main task management system.
 * Integrates queue, executor, pool, and scheduler for comprehensive task management.
 */

import type {
  Task,
  TaskResult,
  TaskOptions,
  TaskProgress,
  TaskEvent,
  TaskStatistics,
} from './types.js';
import { TaskStatus, TaskEventType, TaskPriority } from './types.js';
import { TaskQueue } from './queue.js';
import { TaskExecutor } from './executor.js';
import { TaskPool } from './pool.js';
import { TaskScheduler } from './scheduler.js';
import { TaskHistory } from './history.js';
import { ProgressReporter } from './progress.js';

/**
 * Event listener type for task events
 */
type TaskEventListener<T = unknown> = (event: TaskEvent<T>) => void;

/**
 * TaskManager class - the main task management system
 */
export class TaskManager<T = unknown> {
  private queue: TaskQueue<T>;
  private executor: TaskExecutor<T>;
  private pool: TaskPool<T>;
  private scheduler: TaskScheduler<T>;
  private history: TaskHistory<T>;
  private progressReporter: ProgressReporter;
  private eventListeners: Map<TaskEventType, Set<TaskEventListener<T>>> = new Map();
  private taskCounter: number = 0;
  private isPaused: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  /**
   * Creates a new TaskManager instance
   * @param poolSize - Maximum number of concurrent workers
   */
  constructor(poolSize: number = 4) {
    this.queue = new TaskQueue();
    this.executor = new TaskExecutor();
    this.pool = new TaskPool({ maxWorkers: poolSize });
    this.scheduler = new TaskScheduler();
    this.history = new TaskHistory();
    this.progressReporter = new ProgressReporter();

    this.initializeEventListeners();
    this.startProcessing();
  }

  /**
   * Initializes event listeners for task events
   */
  private initializeEventListeners(): void {
    for (const eventType of Object.values(TaskEventType)) {
      this.eventListeners.set(eventType, new Set());
    }
  }

  /**
   * Starts the task processing loop
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 100);
  }

  /**
   * Stops the task processing loop
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
  }

  /**
   * Processes tasks from the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isPaused) {
      return;
    }

    const completedTaskIds = this.history.getCompletedTaskIds();
    const readyTasks = this.queue.getReadyTasks(completedTaskIds);

    for (const task of readyTasks) {
      if (this.pool.getAvailableCount() > 0) {
        this.pool.execute(task).catch((error) => {
          console.error(`Task ${task.id} failed:`, error);
        });
      }
    }
  }

  /**
   * Executes a task
   * @param task - The task to execute
   * @returns Promise resolving to the task result
   */
  async execute(task: Task<T>): Promise<TaskResult<T>> {
    this.queue.enqueue(task);
    this.emitEvent({
      type: TaskEventType.STARTED,
      task,
      timestamp: Date.now(),
    });

    const result = await this.pool.execute(task);
    this.history.add(task);
    this.emitEvent({
      type: result.success ? TaskEventType.COMPLETED : TaskEventType.FAILED,
      task,
      timestamp: Date.now(),
      data: result,
    });

    return result;
  }

  /**
   * Executes a task directly without queuing
   * @param task - The task to execute
   * @returns Promise resolving to the task result
   */
  async executeDirect(task: Task<T>): Promise<TaskResult<T>> {
    this.emitEvent({
      type: TaskEventType.STARTED,
      task,
      timestamp: Date.now(),
    });

    const result = await this.executor.execute(task);
    this.history.add(task);
    this.emitEvent({
      type: result.success ? TaskEventType.COMPLETED : TaskEventType.FAILED,
      task,
      timestamp: Date.now(),
      data: result,
    });

    return result;
  }

  /**
   * Schedules a task for delayed execution
   * @param task - The task to schedule
   * @param delay - Delay in milliseconds
   * @returns The scheduled task
   */
  schedule(task: Task<T>, delay: number): Task<T> {
    this.scheduler.scheduleDelayed(task, delay);
    return task;
  }

  /**
   * Schedules a recurring task
   * @param task - The task to schedule
   * @param interval - Interval in milliseconds
   * @param immediate - Whether to execute immediately
   * @returns The scheduled task
   */
  scheduleRecurring(
    task: Task<T>,
    interval: number,
    immediate: boolean = false,
  ): Task<T> {
    this.scheduler.scheduleRecurring(task, interval, immediate);
    return task;
  }

  /**
   * Cancels a task
   * @param taskId - The ID of the task to cancel
   * @returns True if task was cancelled, false otherwise
   */
  cancel(taskId: string): boolean {
    // Cancel in executor
    this.executor.cancel(taskId);

    // Remove from queue
    const queuedTask = this.queue.remove(taskId);
    if (queuedTask) {
      queuedTask.cancelled = true;
      this.emitEvent({
        type: TaskEventType.CANCELLED,
        task: queuedTask,
        timestamp: Date.now(),
      });
      return true;
    }

    // Unschedule from scheduler
    const unscheduled = this.scheduler.unschedule(taskId);
    if (unscheduled) {
      return true;
    }

    return false;
  }

  /**
   * Pauses task processing
   */
  pause(): void {
    this.isPaused = true;
    this.scheduler.pause();
  }

  /**
   * Resumes task processing
   */
  resume(): void {
    this.isPaused = false;
    this.scheduler.resume();
  }

  /**
   * Updates task progress
   * @param taskId - The ID of the task
   * @param progress - Progress information
   */
  updateProgress(taskId: string, progress: TaskProgress): void {
    this.progressReporter.update(taskId, progress);
    this.emitEvent({
      type: TaskEventType.PROGRESS,
      task: { id: taskId } as Task<T>,
      timestamp: Date.now(),
      data: progress,
    });
  }

  /**
   * Gets task progress
   * @param taskId - The ID of the task
   * @returns Progress information, or undefined if not found
   */
  getProgress(taskId: string): TaskProgress | undefined {
    return this.progressReporter.get(taskId);
  }

  /**
   * Adds an event listener
   * @param eventType - The type of event to listen for
   * @param listener - The event listener callback
   */
  on(eventType: TaskEventType, listener: TaskEventListener<T>): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Removes an event listener
   * @param eventType - The type of event
   * @param listener - The event listener callback
   */
  off(eventType: TaskEventType, listener: TaskEventListener<T>): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emits a task event
   * @param event - The event to emit
   */
  private emitEvent(event: TaskEvent<T>): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }

  /**
   * Gets task statistics
   * @returns Task statistics
   */
  getStatistics(): TaskStatistics {
    const historyStats = this.history.getStatistics();
    const poolStats = this.pool.getStats();

    return {
      total: historyStats.totalTasks + this.queue.size(),
      pending: this.queue.size(),
      running: poolStats.busyWorkers,
      completed: historyStats.byStatus[TaskStatus.COMPLETED],
      failed: historyStats.byStatus[TaskStatus.FAILED],
      cancelled: historyStats.byStatus[TaskStatus.CANCELLED],
      averageExecutionTime: historyStats.averageExecutionTime,
      totalExecutionTime: historyStats.totalExecutionTime,
    };
  }

  /**
   * Gets a task by ID
   * @param taskId - The ID of the task
   * @returns The task, or undefined if not found
   */
  getTask(taskId: string): Task<T> | undefined {
    // Check queue
    if (this.queue.has(taskId)) {
      const tasks = this.queue.toArray();
      return tasks.find((t) => t.id === taskId);
    }

    // Check history
    return this.history.get(taskId);
  }

  /**
   * Gets all tasks
   * @returns Array of all tasks
   */
  getAllTasks(): Task<T>[] {
    return [...this.queue.toArray(), ...this.history.getAll()];
  }

  /**
   * Clears all tasks
   */
  clear(): void {
    this.queue.clear();
    this.scheduler.clear();
    this.history.clear();
    this.progressReporter.clear();
  }

  /**
   * Shuts down the task manager
   */
  async shutdown(): Promise<void> {
    this.stopProcessing();
    this.pause();
    await this.pool.shutdown();
    this.clear();
  }

  /**
   * Creates a new task
   * @param name - Task name
   * @param fn - Task function
   * @param options - Task options
   * @returns The created task
   */
  createTask(
    name: string,
    fn: () => Promise<T>,
    options?: TaskOptions,
  ): Task<T> {
    const taskId = `task-${this.taskCounter++}`;
    const task: Task<T> = {
      id: taskId,
      name,
      status: TaskStatus.PENDING,
      priority: options?.priority ?? TaskPriority.NORMAL,
      fn,
      options: options ?? {},
      retryCount: 0,
      cancelled: false,
      dependencies: options?.dependencies ?? [],
      metadata: options?.metadata ?? {},
      createdAt: Date.now(),
    };

    return task;
  }

  /**
   * Gets the task queue
   * @returns The task queue
   */
  getQueue(): TaskQueue<T> {
    return this.queue;
  }

  /**
   * Gets the task pool
   * @returns The task pool
   */
  getPool(): TaskPool<T> {
    return this.pool;
  }

  /**
   * Gets the task scheduler
   * @returns The task scheduler
   */
  getScheduler(): TaskScheduler<T> {
    return this.scheduler;
  }

  /**
   * Gets the task history
   * @returns The task history
   */
  getHistory(): TaskHistory<T> {
    return this.history;
  }

  /**
   * Gets the progress reporter
   * @returns The progress reporter
   */
  getProgressReporter(): ProgressReporter {
    return this.progressReporter;
  }
}
