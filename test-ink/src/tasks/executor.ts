/**
 * Task Executor Module
 * 
 * Implements the TaskExecutor class for executing tasks asynchronously.
 * Supports timeout, retry with exponential backoff, and task cancellation.
 */

import type {
  Task,
  TaskResult,
  TaskStatus,
  RetryOptions,
} from './types.js';
import { TaskStatus as Status } from './types.js';

/**
 * TaskExecutor class for executing tasks asynchronously
 */
export class TaskExecutor<T = unknown> {
  private activeExecutions: Map<string, AbortController> = new Map();
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 30000,
  };

  /**
   * Creates a new TaskExecutor instance
   * @param retryOptions - Default retry options for all tasks
   */
  constructor(retryOptions?: Partial<RetryOptions>) {
    if (retryOptions) {
      this.defaultRetryOptions = { ...this.defaultRetryOptions, ...retryOptions };
    }
  }

  /**
   * Executes a task with timeout and retry support
   * @param task - The task to execute
   * @param onProgress - Optional callback for progress updates
   * @returns Promise resolving to the task result
   */
  async execute(
    task: Task<T>,
    onProgress?: (progress: { current: number; total: number; percentage: number }) => void,
  ): Promise<TaskResult<T>> {
    const startTime = Date.now();
    task.status = Status.RUNNING;
    task.startedAt = startTime;

    const abortController = new AbortController();
    this.activeExecutions.set(task.id, abortController);

    try {
      const result = await this.executeWithRetry(
        task,
        abortController.signal,
        onProgress,
      );

      const executionTime = Date.now() - startTime;
      task.status = Status.COMPLETED;
      task.completedAt = Date.now();
      task.result = {
        success: true,
        data: result,
        executionTime,
      };

      return task.result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (task.cancelled) {
        task.status = Status.CANCELLED;
        task.completedAt = Date.now();
        task.result = {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime,
        };
      } else {
        task.status = Status.FAILED;
        task.completedAt = Date.now();
        task.result = {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          executionTime,
        };
      }

      return task.result;
    } finally {
      this.activeExecutions.delete(task.id);
    }
  }

  /**
   * Cancels a running task
   * @param taskId - The ID of the task to cancel
   * @returns True if task was cancelled, false if not found or already completed
   */
  cancel(taskId: string): boolean {
    const abortController = this.activeExecutions.get(taskId);
    if (abortController) {
      abortController.abort();
      return true;
    }
    return false;
  }

  /**
   * Gets the number of currently executing tasks
   * @returns The number of active executions
   */
  getActiveCount(): number {
    return this.activeExecutions.size;
  }

  /**
   * Checks if a task is currently executing
   * @param taskId - The ID of the task to check
   * @returns True if task is executing, false otherwise
   */
  isExecuting(taskId: string): boolean {
    return this.activeExecutions.has(taskId);
  }

  /**
   * Cancels all currently executing tasks
   */
  cancelAll(): void {
    for (const abortController of this.activeExecutions.values()) {
      abortController.abort();
    }
    this.activeExecutions.clear();
  }

  /**
   * Executes a task with retry logic
   * @param task - The task to execute
   * @param signal - AbortSignal for cancellation
   * @param onProgress - Optional progress callback
   * @returns Promise resolving to the task result
   */
  private async executeWithRetry(
    task: Task<T>,
    signal: AbortSignal,
    onProgress?: (progress: { current: number; total: number; percentage: number }) => void,
  ): Promise<T> {
    const maxRetries = task.options.retries ?? this.defaultRetryOptions.maxRetries;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      this.checkCancellation(signal);

      try {
        const result = await this.executeWithTimeout(task, signal, onProgress);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries && !task.cancelled) {
          const delay = this.calculateRetryDelay(attempt);
          await this.delay(delay, signal);
        }
      }
    }

    throw lastError || new Error('Task execution failed');
  }

  /**
   * Executes a task with timeout support
   * @param task - The task to execute
   * @param signal - AbortSignal for cancellation
   * @param onProgress - Optional progress callback
   * @returns Promise resolving to the task result
   */
  private async executeWithTimeout(
    task: Task<T>,
    signal: AbortSignal,
    onProgress?: (progress: { current: number; total: number; percentage: number }) => void,
  ): Promise<T> {
    const timeout = task.options.timeout;

    if (!timeout) {
      return await task.fn();
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task timeout after ${timeout}ms`));
      }, timeout);

      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Task cancelled'));
      });
    });

    return await Promise.race([task.fn(), timeoutPromise]);
  }

  /**
   * Calculates the delay for retry with exponential backoff
   * @param attempt - The current attempt number (0-indexed)
   * @returns The delay in milliseconds
   */
  private calculateRetryDelay(attempt: number): number {
    const { initialDelay, backoffMultiplier, maxDelay } = this.defaultRetryOptions;
    const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxDelay);
  }

  /**
   * Creates a delay promise that can be cancelled
   * @param ms - Delay in milliseconds
   * @param signal - AbortSignal for cancellation
   * @returns Promise that resolves after delay
   */
  private delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve();
      }, ms);

      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Delay cancelled'));
      });
    });
  }

  /**
   * Checks if the task has been cancelled and throws if so
   * @param signal - AbortSignal to check
   * @throws Error if task was cancelled
   */
  private checkCancellation(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error('Task cancelled');
    }
  }

  /**
   * Updates the default retry options
   * @param options - New retry options
   */
  setRetryOptions(options: Partial<RetryOptions>): void {
    this.defaultRetryOptions = { ...this.defaultRetryOptions, ...options };
  }

  /**
   * Gets the current retry options
   * @returns The current retry options
   */
  getRetryOptions(): RetryOptions {
    return { ...this.defaultRetryOptions };
  }
}
