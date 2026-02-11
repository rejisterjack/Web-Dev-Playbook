/**
 * Task Pool Module
 * 
 * Implements the TaskPool class for managing concurrent task execution.
 * Uses a worker pool pattern for parallel execution with configurable pool size.
 */

import type { Task, TaskResult, WorkerConfig } from './types.js';
import { TaskExecutor } from './executor.js';

/**
 * Worker state for tracking individual workers
 */
interface WorkerState {
  id: string;
  busy: boolean;
  taskCount: number;
  lastUsed: number;
  currentTask?: Task;
}

/**
 * TaskPool class for managing concurrent task execution
 */
export class TaskPool<T = unknown> {
  private workers: Map<string, WorkerState> = new Map();
  private executor: TaskExecutor<T>;
  private config: WorkerConfig;
  private workerCounter: number = 0;
  private idleTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private pendingQueue: Task<T>[] = [];

  /**
   * Creates a new TaskPool instance
   * @param config - Worker pool configuration
   */
  constructor(config?: Partial<WorkerConfig>) {
    this.config = {
      minWorkers: 1,
      maxWorkers: 4,
      idleTimeout: 30000,
      maxTasksPerWorker: 100,
      ...config,
    };
    this.executor = new TaskExecutor();

    // Initialize minimum workers
    this.initializeWorkers();
  }

  /**
   * Initializes the minimum number of workers
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * Creates a new worker
   * @returns The worker state
   */
  private createWorker(): WorkerState {
    const workerId = `worker-${this.workerCounter++}`;
    const worker: WorkerState = {
      id: workerId,
      busy: false,
      taskCount: 0,
      lastUsed: Date.now(),
    };
    this.workers.set(workerId, worker);
    return worker;
  }

  /**
   * Gets an available worker or creates a new one if needed
   * @returns An available worker, or undefined if pool is full
   */
  private getAvailableWorker(): WorkerState | undefined {
    // Find an idle worker
    for (const worker of this.workers.values()) {
      if (!worker.busy) {
        return worker;
      }
    }

    // Create a new worker if under max limit
    if (this.workers.size < this.config.maxWorkers) {
      return this.createWorker();
    }

    return undefined;
  }

  /**
   * Executes a task using the worker pool
   * @param task - The task to execute
   * @returns Promise resolving to the task result
   */
  async execute(task: Task<T>): Promise<TaskResult<T>> {
    const worker = this.getAvailableWorker();

    if (!worker) {
      // Pool is full, add to pending queue
      return new Promise((resolve, reject) => {
        this.pendingQueue.push(task);
        // Store the resolve/reject handlers for this task
        (task as any)._resolve = resolve;
        (task as any)._reject = reject;
      });
    }

    return this.executeWithWorker(task, worker);
  }

  /**
   * Executes a task with a specific worker
   * @param task - The task to execute
   * @param worker - The worker to use
   * @returns Promise resolving to the task result
   */
  private async executeWithWorker(
    task: Task<T>,
    worker: WorkerState,
  ): Promise<TaskResult<T>> {
    // Clear any idle timeout for this worker
    this.clearIdleTimeout(worker.id);

    // Mark worker as busy
    worker.busy = true;
    worker.currentTask = task;
    worker.lastUsed = Date.now();

    try {
      const result = await this.executor.execute(task);
      worker.taskCount++;

      // Check if worker should be recycled
      if (worker.taskCount >= this.config.maxTasksPerWorker) {
        this.recycleWorker(worker.id);
      } else {
        worker.busy = false;
        worker.currentTask = undefined;
        this.scheduleIdleTimeout(worker.id);
      }

      // Resolve the task's promise if it was pending
      const resolve = (task as any)._resolve;
      if (resolve) {
        resolve(result);
        delete (task as any)._resolve;
        delete (task as any)._reject;
      }

      // Process pending queue
      this.processPendingQueue();

      return result;
    } catch (error) {
      worker.busy = false;
      worker.currentTask = undefined;
      this.scheduleIdleTimeout(worker.id);

      // Reject the task's promise if it was pending
      const reject = (task as any)._reject;
      if (reject) {
        reject(error);
        delete (task as any)._resolve;
        delete (task as any)._reject;
      }

      // Process pending queue
      this.processPendingQueue();

      throw error;
    }
  }

  /**
   * Processes tasks in the pending queue
   */
  private processPendingQueue(): void {
    while (this.pendingQueue.length > 0) {
      const worker = this.getAvailableWorker();
      if (!worker) {
        break;
      }

      const task = this.pendingQueue.shift();
      if (task) {
        // Execute without awaiting - the promise handlers will be called
        this.executeWithWorker(task, worker).catch(() => {
          // Error is already handled in executeWithWorker
        });
      }
    }
  }

  /**
   * Schedules an idle timeout for a worker
   * @param workerId - The worker ID
   */
  private scheduleIdleTimeout(workerId: string): void {
    // Don't timeout if we're at minimum workers
    if (this.workers.size <= this.config.minWorkers) {
      return;
    }

    this.clearIdleTimeout(workerId);

    const timeoutId = setTimeout(() => {
      this.removeWorker(workerId);
    }, this.config.idleTimeout);

    this.idleTimeouts.set(workerId, timeoutId);
  }

  /**
   * Clears an idle timeout for a worker
   * @param workerId - The worker ID
   */
  private clearIdleTimeout(workerId: string): void {
    const timeoutId = this.idleTimeouts.get(workerId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.idleTimeouts.delete(workerId);
    }
  }

  /**
   * Removes a worker from the pool
   * @param workerId - The worker ID to remove
   */
  private removeWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (worker && !worker.busy && this.workers.size > this.config.minWorkers) {
      this.clearIdleTimeout(workerId);
      this.workers.delete(workerId);
    }
  }

  /**
   * Recycles a worker by removing and recreating it
   * @param workerId - The worker ID to recycle
   */
  private recycleWorker(workerId: string): void {
    this.clearIdleTimeout(workerId);
    this.workers.delete(workerId);

    // Create a new worker if needed
    if (this.workers.size < this.config.minWorkers) {
      this.createWorker();
    }
  }

  /**
   * Gets the current pool statistics
   * @returns Pool statistics object
   */
  getStats(): {
    totalWorkers: number;
    busyWorkers: number;
    idleWorkers: number;
    pendingTasks: number;
    totalTasksExecuted: number;
  } {
    let busyWorkers = 0;
    let totalTasksExecuted = 0;

    for (const worker of this.workers.values()) {
      if (worker.busy) {
        busyWorkers++;
      }
      totalTasksExecuted += worker.taskCount;
    }

    return {
      totalWorkers: this.workers.size,
      busyWorkers,
      idleWorkers: this.workers.size - busyWorkers,
      pendingTasks: this.pendingQueue.length,
      totalTasksExecuted,
    };
  }

  /**
   * Gets the number of available workers
   * @returns The number of idle workers
   */
  getAvailableCount(): number {
    let count = 0;
    for (const worker of this.workers.values()) {
      if (!worker.busy) {
        count++;
      }
    }
    return count;
  }

  /**
   * Checks if the pool is at capacity
   * @returns True if pool is full, false otherwise
   */
  isFull(): boolean {
    return this.workers.size >= this.config.maxWorkers;
  }

  /**
   * Waits for all pending tasks to complete
   * @returns Promise resolving when all tasks are complete
   */
  async drain(): Promise<void> {
    while (this.pendingQueue.length > 0 || this.hasBusyWorkers()) {
      await this.delay(100);
    }
  }

  /**
   * Checks if there are any busy workers
   * @returns True if any workers are busy, false otherwise
   */
  private hasBusyWorkers(): boolean {
    for (const worker of this.workers.values()) {
      if (worker.busy) {
        return true;
      }
    }
    return false;
  }

  /**
   * Cancels all pending tasks
   */
  cancelPending(): void {
    for (const task of this.pendingQueue) {
      task.cancelled = true;
    }
    this.pendingQueue = [];
  }

  /**
   * Shuts down the pool, cancelling all tasks
   */
  async shutdown(): Promise<void> {
    this.cancelPending();
    this.executor.cancelAll();

    // Clear all idle timeouts
    for (const timeoutId of this.idleTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.idleTimeouts.clear();

    // Wait for busy workers to complete
    await this.drain();

    // Clear all workers
    this.workers.clear();
  }

  /**
   * Updates the pool configuration
   * @param config - New configuration options
   */
  updateConfig(config: Partial<WorkerConfig>): void {
    this.config = { ...this.config, ...config };

    // Adjust worker count if needed
    if (this.workers.size < this.config.minWorkers) {
      while (this.workers.size < this.config.minWorkers) {
        this.createWorker();
      }
    } else if (this.workers.size > this.config.maxWorkers) {
      const workersToRemove = this.workers.size - this.config.maxWorkers;
      let removed = 0;
      for (const [workerId, worker] of this.workers.entries()) {
        if (removed >= workersToRemove) {
          break;
        }
        if (!worker.busy) {
          this.removeWorker(workerId);
          removed++;
        }
      }
    }
  }

  /**
   * Gets the current configuration
   * @returns The current configuration
   */
  getConfig(): WorkerConfig {
    return { ...this.config };
  }

  /**
   * Creates a delay promise
   * @param ms - Delay in milliseconds
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
