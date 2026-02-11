/**
 * Task Scheduler Module
 * 
 * Implements the TaskScheduler class for scheduling tasks.
 * Supports delayed execution, recurring tasks, cron-like scheduling, and task dependencies.
 */

import type { Task, ScheduledTaskConfig } from './types.js';

/**
 * Scheduled task entry
 */
interface ScheduledTaskEntry<T = unknown> {
  task: Task<T>;
  config: ScheduledTaskConfig;
  timeoutId?: NodeJS.Timeout;
  intervalId?: NodeJS.Timeout;
  executionCount: number;
  nextExecutionTime: number;
}

/**
 * TaskScheduler class for scheduling tasks
 */
export class TaskScheduler<T = unknown> {
  private scheduledTasks: Map<string, ScheduledTaskEntry<T>> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private completedTasks: Set<string> = new Set();

  /**
   * Creates a new TaskScheduler instance
   */
  constructor() {
    this.scheduledTasks = new Map();
    this.dependencyGraph = new Map();
    this.completedTasks = new Set();
  }

  /**
   * Schedules a task for delayed execution
   * @param task - The task to schedule
   * @param delay - Delay in milliseconds before execution
   * @returns The scheduled task entry
   */
  scheduleDelayed(task: Task<T>, delay: number): ScheduledTaskEntry<T> {
    const config: ScheduledTaskConfig = { delay };
    return this.schedule(task, config);
  }

  /**
   * Schedules a recurring task
   * @param task - The task to schedule
   * @param interval - Interval in milliseconds between executions
   * @param immediate - Whether to execute immediately
   * @returns The scheduled task entry
   */
  scheduleRecurring(
    task: Task<T>,
    interval: number,
    immediate: boolean = false,
  ): ScheduledTaskEntry<T> {
    const config: ScheduledTaskConfig = { interval, immediate };
    return this.schedule(task, config);
  }

  /**
   * Schedules a task with a cron-like expression
   * @param task - The task to schedule
   * @param cron - Cron expression in simplified format
   * @returns The scheduled task entry
   */
  scheduleCron(task: Task<T>, cron: string): ScheduledTaskEntry<T> {
    const config: ScheduledTaskConfig = { cron };
    return this.schedule(task, config);
  }

  /**
   * Schedules a task with the given configuration
   * @param task - The task to schedule
   * @param config - Scheduling configuration
   * @returns The scheduled task entry
   */
  schedule(task: Task<T>, config: ScheduledTaskConfig): ScheduledTaskEntry<T> {
    const entry: ScheduledTaskEntry<T> = {
      task,
      config,
      executionCount: 0,
      nextExecutionTime: this.calculateNextExecution(config),
    };

    this.scheduledTasks.set(task.id, entry);

    // Set up task dependencies
    if (task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        if (!this.dependencyGraph.has(depId)) {
          this.dependencyGraph.set(depId, new Set());
        }
        this.dependencyGraph.get(depId)!.add(task.id);
      }
    }

    // Schedule the task
    this.setupTaskSchedule(entry);

    return entry;
  }

  /**
   * Calculates the next execution time based on configuration
   * @param config - Scheduling configuration
   * @returns Next execution timestamp
   */
  private calculateNextExecution(config: ScheduledTaskConfig): number {
    const now = Date.now();

    if (config.delay) {
      return now + config.delay;
    }

    if (config.interval) {
      return now + config.interval;
    }

    if (config.cron) {
      // Simplified cron parsing - in production, use a proper cron library
      return this.parseCronExpression(config.cron, now);
    }

    return now;
  }

  /**
   * Parses a simplified cron expression
   * @param cron - Cron expression
   * @param from - Base timestamp
   * @returns Next execution timestamp
   */
  private parseCronExpression(cron: string, from: number): number {
    // Simplified implementation - supports "*/N * * * *" format
    // In production, use a proper cron library like node-cron
    const parts = cron.split(' ');
    if (parts.length !== 5) {
      return from + 60000; // Default to 1 minute
    }

    const minutePart = parts[0];
    if (minutePart.startsWith('*/')) {
      const interval = parseInt(minutePart.slice(2), 10);
      const date = new Date(from);
      const currentMinute = date.getMinutes();
      const nextMinute = Math.ceil((currentMinute + 1) / interval) * interval;
      date.setMinutes(nextMinute, 0, 0);
      return date.getTime();
    }

    return from + 60000; // Default to 1 minute
  }

  /**
   * Sets up the scheduling for a task entry
   * @param entry - The scheduled task entry
   */
  private setupTaskSchedule(entry: ScheduledTaskEntry<T>): void {
    const { task, config } = entry;

    // Check if dependencies are satisfied
    if (!this.areDependenciesSatisfied(task)) {
      // Will be triggered when dependencies complete
      return;
    }

    if (config.delay) {
      // One-time delayed execution
      entry.timeoutId = setTimeout(() => {
        this.executeScheduledTask(entry);
      }, config.delay);
    } else if (config.interval) {
      // Recurring execution
      if (config.immediate) {
        this.executeScheduledTask(entry);
      }

      entry.intervalId = setInterval(() => {
        this.executeScheduledTask(entry);
      }, config.interval);
    } else if (config.cron) {
      // Cron-like execution
      const delay = entry.nextExecutionTime - Date.now();
      entry.timeoutId = setTimeout(() => {
        this.executeScheduledTask(entry);
        // Reschedule for next occurrence
        entry.nextExecutionTime = this.parseCronExpression(config.cron!, Date.now());
        this.setupTaskSchedule(entry);
      }, delay);
    }
  }

  /**
   * Executes a scheduled task
   * @param entry - The scheduled task entry
   */
  private async executeScheduledTask(entry: ScheduledTaskEntry<T>): Promise<void> {
    const { task, config } = entry;

    // Check max executions
    if (config.maxExecutions && entry.executionCount >= config.maxExecutions) {
      this.unschedule(task.id);
      return;
    }

    entry.executionCount++;

    try {
      await task.fn();
      this.markTaskCompleted(task.id);
    } catch (error) {
      // Error handling - task failed but may retry
      console.error(`Scheduled task ${task.id} failed:`, error);
    }
  }

  /**
   * Checks if a task's dependencies are satisfied
   * @param task - The task to check
   * @returns True if all dependencies are satisfied
   */
  private areDependenciesSatisfied(task: Task<T>): boolean {
    return task.dependencies.every((depId) => this.completedTasks.has(depId));
  }

  /**
   * Marks a task as completed and triggers dependent tasks
   * @param taskId - The ID of the completed task
   */
  private markTaskCompleted(taskId: string): void {
    this.completedTasks.add(taskId);

    // Trigger dependent tasks
    const dependents = this.dependencyGraph.get(taskId);
    if (dependents) {
      for (const depId of dependents) {
        const entry = this.scheduledTasks.get(depId);
        if (entry && this.areDependenciesSatisfied(entry.task)) {
          this.setupTaskSchedule(entry);
        }
      }
    }
  }

  /**
   * Unschedules a task
   * @param taskId - The ID of the task to unschedule
   * @returns True if task was unscheduled, false if not found
   */
  unschedule(taskId: string): boolean {
    const entry = this.scheduledTasks.get(taskId);
    if (!entry) {
      return false;
    }

    // Clear timeout/interval
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
    if (entry.intervalId) {
      clearInterval(entry.intervalId);
    }

    // Remove from dependency graph
    for (const depId of entry.task.dependencies) {
      const dependents = this.dependencyGraph.get(depId);
      if (dependents) {
        dependents.delete(taskId);
      }
    }

    this.scheduledTasks.delete(taskId);
    return true;
  }

  /**
   * Gets a scheduled task entry
   * @param taskId - The ID of the task
   * @returns The scheduled task entry, or undefined if not found
   */
  get(taskId: string): ScheduledTaskEntry<T> | undefined {
    return this.scheduledTasks.get(taskId);
  }

  /**
   * Gets all scheduled tasks
   * @returns Array of scheduled task entries
   */
  getAll(): ScheduledTaskEntry<T>[] {
    return Array.from(this.scheduledTasks.values());
  }

  /**
   * Gets the number of scheduled tasks
   * @returns The number of scheduled tasks
   */
  size(): number {
    return this.scheduledTasks.size;
  }

  /**
   * Checks if a task is scheduled
   * @param taskId - The ID of the task to check
   * @returns True if task is scheduled, false otherwise
   */
  has(taskId: string): boolean {
    return this.scheduledTasks.has(taskId);
  }

  /**
   * Clears all scheduled tasks
   */
  clear(): void {
    for (const entry of this.scheduledTasks.values()) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }
      if (entry.intervalId) {
        clearInterval(entry.intervalId);
      }
    }

    this.scheduledTasks.clear();
    this.dependencyGraph.clear();
    this.completedTasks.clear();
  }

  /**
   * Pauses all scheduled tasks
   */
  pause(): void {
    for (const entry of this.scheduledTasks.values()) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
        entry.timeoutId = undefined;
      }
      if (entry.intervalId) {
        clearInterval(entry.intervalId);
        entry.intervalId = undefined;
      }
    }
  }

  /**
   * Resumes all paused scheduled tasks
   */
  resume(): void {
    for (const entry of this.scheduledTasks.values()) {
      this.setupTaskSchedule(entry);
    }
  }

  /**
   * Gets tasks that are ready to execute
   * @returns Array of tasks with satisfied dependencies
   */
  getReadyTasks(): Task<T>[] {
    return this.getAll()
      .filter((entry) => this.areDependenciesSatisfied(entry.task))
      .map((entry) => entry.task);
  }

  /**
   * Gets tasks that are waiting for dependencies
   * @returns Array of tasks with unsatisfied dependencies
   */
  getWaitingTasks(): Task<T>[] {
    return this.getAll()
      .filter((entry) => !this.areDependenciesSatisfied(entry.task))
      .map((entry) => entry.task);
  }

  /**
   * Gets the dependency graph
   * @returns Map of task IDs to their dependent task IDs
   */
  getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph);
  }
}
