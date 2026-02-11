/**
 * Task History Module
 * 
 * Implements the TaskHistory class for tracking completed tasks.
 * Stores task execution history with filtering and statistics support.
 */

import type { Task, TaskFilter, HistoryStatistics } from './types.js';
import { TaskStatus, TaskPriority } from './types.js';

/**
 * TaskHistory class for tracking completed tasks
 */
export class TaskHistory<T = unknown> {
  private history: Map<string, Task<T>> = new Map();
  private maxHistorySize: number = 1000;

  /**
   * Creates a new TaskHistory instance
   * @param maxHistorySize - Maximum number of tasks to store in history
   */
  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Adds a task to history
   * @param task - The task to add
   */
  add(task: Task<T>): void {
    this.history.set(task.id, task);

    // Enforce max history size
    if (this.history.size > this.maxHistorySize) {
      this.evictOldest();
    }
  }

  /**
   * Gets a task from history
   * @param taskId - The ID of the task
   * @returns The task, or undefined if not found
   */
  get(taskId: string): Task<T> | undefined {
    return this.history.get(taskId);
  }

  /**
   * Gets all tasks in history
   * @returns Array of all tasks
   */
  getAll(): Task<T>[] {
    return Array.from(this.history.values());
  }

  /**
   * Filters tasks based on criteria
   * @param filter - Filter criteria
   * @returns Array of filtered tasks
   */
  filter(filter: TaskFilter): Task<T>[] {
    let tasks = Array.from(this.history.values());

    // Filter by status
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      tasks = tasks.filter((task) => statuses.includes(task.status));
    }

    // Filter by name pattern
    if (filter.namePattern) {
      const pattern = new RegExp(filter.namePattern, 'i');
      tasks = tasks.filter((task) => pattern.test(task.name));
    }

    // Filter by date range
    if (filter.dateRange) {
      tasks = tasks.filter(
        (task) =>
          task.createdAt >= filter.dateRange!.start &&
          task.createdAt <= filter.dateRange!.end,
      );
    }

    // Filter by priority
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority)
        ? filter.priority
        : [filter.priority];
      tasks = tasks.filter((task) => priorities.includes(task.priority));
    }

    // Apply limit and offset
    if (filter.offset) {
      tasks = tasks.slice(filter.offset);
    }
    if (filter.limit) {
      tasks = tasks.slice(0, filter.limit);
    }

    return tasks;
  }

  /**
   * Removes a task from history
   * @param taskId - The ID of the task to remove
   * @returns True if task was removed, false otherwise
   */
  remove(taskId: string): boolean {
    return this.history.delete(taskId);
  }

  /**
   * Clears all history
   */
  clear(): void {
    this.history.clear();
  }

  /**
   * Gets the number of tasks in history
   * @returns The number of tasks
   */
  size(): number {
    return this.history.size;
  }

  /**
   * Checks if a task is in history
   * @param taskId - The ID of the task
   * @returns True if task is in history, false otherwise
   */
  has(taskId: string): boolean {
    return this.history.has(taskId);
  }

  /**
   * Gets completed task IDs
   * @returns Set of completed task IDs
   */
  getCompletedTaskIds(): Set<string> {
    const result = new Set<string>();
    for (const [taskId, task] of this.history.entries()) {
      if (task.status === TaskStatus.COMPLETED) {
        result.add(taskId);
      }
    }
    return result;
  }

  /**
   * Gets tasks by status
   * @param status - The status to filter by
   * @returns Array of tasks with the specified status
   */
  getByStatus(status: TaskStatus): Task<T>[] {
    return Array.from(this.history.values()).filter(
      (task) => task.status === status,
    );
  }

  /**
   * Gets tasks by priority
   * @param priority - The priority to filter by
   * @returns Array of tasks with the specified priority
   */
  getByPriority(priority: TaskPriority): Task<T>[] {
    return Array.from(this.history.values()).filter(
      (task) => task.priority === priority,
    );
  }

  /**
   * Gets tasks by name
   * @param name - The name to filter by
   * @returns Array of tasks with the specified name
   */
  getByName(name: string): Task<T>[] {
    return Array.from(this.history.values()).filter(
      (task) => task.name === name,
    );
  }

  /**
   * Gets the most recent tasks
   * @param count - Number of recent tasks to return
   * @returns Array of recent tasks
   */
  getRecent(count: number): Task<T>[] {
    return Array.from(this.history.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count);
  }

  /**
   * Gets the oldest tasks
   * @param count - Number of old tasks to return
   * @returns Array of old tasks
   */
  getOldest(count: number): Task<T>[] {
    return Array.from(this.history.values())
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, count);
  }

  /**
   * Gets tasks that failed
   * @returns Array of failed tasks
   */
  getFailed(): Task<T>[] {
    return this.getByStatus(TaskStatus.FAILED);
  }

  /**
   * Gets tasks that were cancelled
   * @returns Array of cancelled tasks
   */
  getCancelled(): Task<T>[] {
    return this.getByStatus(TaskStatus.CANCELLED);
  }

  /**
   * Gets tasks that completed successfully
   * @returns Array of completed tasks
   */
  getCompleted(): Task<T>[] {
    return this.getByStatus(TaskStatus.COMPLETED);
  }

  /**
   * Gets statistics about the history
   * @returns History statistics
   */
  getStatistics(): HistoryStatistics {
    const tasks = Array.from(this.history.values());
    const totalTasks = tasks.length;

    // Count by status
    const byStatus: Record<TaskStatus, number> = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.RUNNING]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.FAILED]: 0,
      [TaskStatus.CANCELLED]: 0,
    };

    // Count by priority
    const byPriority: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.NORMAL]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.CRITICAL]: 0,
    };

    let totalExecutionTime = 0;
    let completedCount = 0;
    const failureReasons: Map<string, number> = new Map();

    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;

      if (task.result?.executionTime) {
        totalExecutionTime += task.result.executionTime;
      }

      if (task.status === TaskStatus.COMPLETED) {
        completedCount++;
      }

      if (task.status === TaskStatus.FAILED && task.result?.error) {
        const errorMsg = task.result.error.message;
        failureReasons.set(errorMsg, (failureReasons.get(errorMsg) || 0) + 1);
      }
    }

    // Calculate common failures
    const commonFailures = Array.from(failureReasons.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTasks,
      byStatus,
      byPriority,
      averageExecutionTime: completedCount > 0 ? totalExecutionTime / completedCount : 0,
      totalExecutionTime,
      successRate: totalTasks > 0 ? completedCount / totalTasks : 0,
      commonFailures,
    };
  }

  /**
   * Evicts the oldest task from history
   */
  private evictOldest(): void {
    let oldestTaskId: string | undefined;
    let oldestTime = Infinity;

    for (const [taskId, task] of this.history.entries()) {
      if (task.createdAt < oldestTime) {
        oldestTime = task.createdAt;
        oldestTaskId = taskId;
      }
    }

    if (oldestTaskId) {
      this.history.delete(oldestTaskId);
    }
  }

  /**
   * Sets the maximum history size
   * @param size - New maximum size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;

    // Evict tasks if necessary
    while (this.history.size > this.maxHistorySize) {
      this.evictOldest();
    }
  }

  /**
   * Gets the maximum history size
   * @returns The maximum history size
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * Exports history as JSON
   * @returns JSON string of history
   */
  exportJSON(): string {
    const tasks = Array.from(this.history.values());
    return JSON.stringify(tasks, null, 2);
  }

  /**
   * Imports history from JSON
   * @param json - JSON string to import
   */
  importJSON(json: string): void {
    try {
      const tasks = JSON.parse(json) as Task<T>[];
      for (const task of tasks) {
        this.add(task);
      }
    } catch (error) {
      console.error('Failed to import history:', error);
    }
  }
}
