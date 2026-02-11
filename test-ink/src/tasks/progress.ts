/**
 * Progress Reporter Module
 * 
 * Implements the ProgressReporter class for reporting task progress.
 * Supports progress updates, stages, and ETA calculation.
 */

import type { TaskProgress } from './types.js';

/**
 * Progress entry for tracking task progress
 */
interface ProgressEntry {
  taskId: string;
  progress: TaskProgress;
  startTime: number;
  lastUpdateTime: number;
  progressHistory: Array<{ time: number; value: number }>;
}

/**
 * ProgressReporter class for reporting task progress
 */
export class ProgressReporter {
  private progressMap: Map<string, ProgressEntry> = new Map();

  /**
   * Creates a new ProgressReporter instance
   */
  constructor() {
    this.progressMap = new Map();
  }

  /**
   * Updates progress for a task
   * @param taskId - The ID of the task
   * @param progress - Progress information
   */
  update(taskId: string, progress: TaskProgress): void {
    const now = Date.now();
    let entry = this.progressMap.get(taskId);

    if (!entry) {
      entry = {
        taskId,
        progress: { ...progress },
        startTime: now,
        lastUpdateTime: now,
        progressHistory: [{ time: now, value: progress.current }],
      };
      this.progressMap.set(taskId, entry);
    } else {
      entry.progress = { ...progress };
      entry.lastUpdateTime = now;
      entry.progressHistory.push({ time: now, value: progress.current });

      // Keep only last 100 history entries
      if (entry.progressHistory.length > 100) {
        entry.progressHistory = entry.progressHistory.slice(-100);
      }
    }

    // Calculate ETA if we have enough history
    if (entry.progressHistory.length >= 2) {
      entry.progress.eta = this.calculateETA(entry);
    }
  }

  /**
   * Gets progress for a task
   * @param taskId - The ID of the task
   * @returns Progress information, or undefined if not found
   */
  get(taskId: string): TaskProgress | undefined {
    const entry = this.progressMap.get(taskId);
    return entry ? { ...entry.progress } : undefined;
  }

  /**
   * Gets all progress entries
   * @returns Map of task IDs to progress information
   */
  getAll(): Map<string, TaskProgress> {
    const result = new Map<string, TaskProgress>();
    for (const [taskId, entry] of this.progressMap.entries()) {
      result.set(taskId, { ...entry.progress });
    }
    return result;
  }

  /**
   * Removes progress for a task
   * @param taskId - The ID of the task
   * @returns True if progress was removed, false otherwise
   */
  remove(taskId: string): boolean {
    return this.progressMap.delete(taskId);
  }

  /**
   * Clears all progress entries
   */
  clear(): void {
    this.progressMap.clear();
  }

  /**
   * Gets the number of tasks being tracked
   * @returns The number of tracked tasks
   */
  size(): number {
    return this.progressMap.size;
  }

  /**
   * Checks if a task is being tracked
   * @param taskId - The ID of the task
   * @returns True if task is being tracked, false otherwise
   */
  has(taskId: string): boolean {
    return this.progressMap.has(taskId);
  }

  /**
   * Calculates ETA based on progress history
   * @param entry - The progress entry
   * @returns Estimated time to completion in milliseconds
   */
  private calculateETA(entry: ProgressEntry): number {
    const history = entry.progressHistory;
    if (history.length < 2) {
      return 0;
    }

    const { current, total } = entry.progress;
    if (total <= 0 || current >= total) {
      return 0;
    }

    // Calculate average speed from recent history
    const recentHistory = history.slice(-10);
    let totalProgress = 0;
    let totalTime = 0;

    for (let i = 1; i < recentHistory.length; i++) {
      const progressDiff = recentHistory[i].value - recentHistory[i - 1].value;
      const timeDiff = recentHistory[i].time - recentHistory[i - 1].time;

      if (timeDiff > 0 && progressDiff > 0) {
        totalProgress += progressDiff;
        totalTime += timeDiff;
      }
    }

    if (totalTime === 0 || totalProgress === 0) {
      return 0;
    }

    const speed = totalProgress / totalTime; // progress per millisecond
    const remainingProgress = total - current;

    return Math.round(remainingProgress / speed);
  }

  /**
   * Gets the elapsed time for a task
   * @param taskId - The ID of the task
   * @returns Elapsed time in milliseconds, or 0 if not found
   */
  getElapsedTime(taskId: string): number {
    const entry = this.progressMap.get(taskId);
    if (!entry) {
      return 0;
    }
    return entry.lastUpdateTime - entry.startTime;
  }

  /**
   * Gets the average progress rate for a task
   * @param taskId - The ID of the task
   * @returns Average progress rate (progress per millisecond), or 0 if not found
   */
  getAverageRate(taskId: string): number {
    const entry = this.progressMap.get(taskId);
    if (!entry || entry.progressHistory.length < 2) {
      return 0;
    }

    const first = entry.progressHistory[0];
    const last = entry.progressHistory[entry.progressHistory.length - 1];
    const timeDiff = last.time - first.time;

    if (timeDiff === 0) {
      return 0;
    }

    return (last.value - first.value) / timeDiff;
  }

  /**
   * Gets tasks that are currently in progress
   * @returns Array of task IDs with progress > 0 and < 100
   */
  getInProgressTasks(): string[] {
    const result: string[] = [];
    for (const [taskId, entry] of this.progressMap.entries()) {
      const { current, total } = entry.progress;
      if (current > 0 && current < total) {
        result.push(taskId);
      }
    }
    return result;
  }

  /**
   * Gets tasks that are completed
   * @returns Array of task IDs with progress at 100%
   */
  getCompletedTasks(): string[] {
    const result: string[] = [];
    for (const [taskId, entry] of this.progressMap.entries()) {
      const { current, total } = entry.progress;
      if (total > 0 && current >= total) {
        result.push(taskId);
      }
    }
    return result;
  }

  /**
   * Gets tasks that haven't started
   * @returns Array of task IDs with progress at 0
   */
  getNotStartedTasks(): string[] {
    const result: string[] = [];
    for (const [taskId, entry] of this.progressMap.entries()) {
      if (entry.progress.current === 0) {
        result.push(taskId);
      }
    }
    return result;
  }

  /**
   * Gets the overall progress across all tasks
   * @returns Overall progress percentage (0-100)
   */
  getOverallProgress(): number {
    if (this.progressMap.size === 0) {
      return 0;
    }

    let totalCurrent = 0;
    let totalMax = 0;

    for (const entry of this.progressMap.values()) {
      totalCurrent += entry.progress.current;
      totalMax += entry.progress.total;
    }

    if (totalMax === 0) {
      return 0;
    }

    return Math.round((totalCurrent / totalMax) * 100);
  }

  /**
   * Gets a summary of all progress
   * @returns Progress summary object
   */
  getSummary(): {
    totalTasks: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    overallProgress: number;
  } {
    const notStarted = this.getNotStartedTasks().length;
    const inProgress = this.getInProgressTasks().length;
    const completed = this.getCompletedTasks().length;

    return {
      totalTasks: this.progressMap.size,
      notStarted,
      inProgress,
      completed,
      overallProgress: this.getOverallProgress(),
    };
  }
}
