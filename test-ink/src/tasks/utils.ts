/**
 * Task Utilities Module
 * 
 * Provides utility functions for task management.
 * Includes factory functions, delay, retry, timeout, and task execution helpers.
 */

import type { Task, TaskOptions, TaskResult, RetryOptions } from './types.js';
import { TaskStatus, TaskPriority } from './types.js';

/**
 * Task counter for generating unique IDs
 */
let taskCounter = 0;

/**
 * Creates a new task
 * @param name - Task name
 * @param fn - Task function
 * @param options - Task options
 * @returns The created task
 */
export function createTask<T = unknown>(
  name: string,
  fn: () => Promise<T>,
  options?: TaskOptions,
): Task<T> {
  const taskId = `task-${taskCounter++}`;
  return {
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
}

/**
 * Creates a delay promise
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise resolving to the function result
 */
export async function retry<T = unknown>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  const retryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    ...options,
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry based on retry condition
      if (
        retryOptions.retryCondition &&
        !retryOptions.retryCondition(lastError)
      ) {
        throw lastError;
      }

      if (attempt < retryOptions.maxRetries) {
        const delayMs = calculateRetryDelay(attempt, retryOptions);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Calculates retry delay with exponential backoff
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
function calculateRetryDelay(attempt: number, options: RetryOptions): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Wraps a promise with a timeout
 * @param promise - Promise to wrap
 * @param ms - Timeout in milliseconds
 * @returns Promise that rejects if timeout is exceeded
 */
export function timeout<T = unknown>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Promise timeout after ${ms}ms`));
      }, ms);
    }),
  ]);
}

/**
 * Executes tasks in parallel with a concurrency limit
 * @param tasks - Array of task functions
 * @param limit - Maximum number of concurrent tasks
 * @returns Promise resolving to array of results
 */
export async function parallel<T = unknown>(
  tasks: Array<() => Promise<T>>,
  limit: number = Infinity,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Set<Promise<void>> = new Set();

  for (const task of tasks) {
    const promise = task()
      .then((result) => {
        results.push(result);
      })
      .finally(() => {
        executing.delete(promise);
      });

    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Executes tasks in series (one after another)
 * @param tasks - Array of task functions
 * @returns Promise resolving to array of results
 */
export async function series<T = unknown>(
  tasks: Array<() => Promise<T>>,
): Promise<T[]> {
  const results: T[] = [];

  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }

  return results;
}

/**
 * Races multiple tasks and returns the first to complete
 * @param tasks - Array of task functions
 * @returns Promise resolving to the first result
 */
export async function race<T = unknown>(
  tasks: Array<() => Promise<T>>,
): Promise<T> {
  return Promise.race(tasks.map((task) => task()));
}

/**
 * Executes tasks with a waterfall pattern (each task receives previous result)
 * @param tasks - Array of task functions where each receives previous result
 * @param initial - Initial value
 * @returns Promise resolving to final result
 */
export async function waterfall<T = unknown>(
  tasks: Array<(result: unknown) => Promise<T>>,
  initial?: unknown,
): Promise<T> {
  let result: unknown = initial;

  for (const task of tasks) {
    result = await task(result);
  }

  return result as T;
}

/**
 * Executes tasks with a map pattern (applies function to each item)
 * @param items - Array of items
 * @param fn - Function to apply to each item
 * @param limit - Concurrency limit
 * @returns Promise resolving to array of results
 */
export async function map<T = unknown, R = unknown>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit?: number,
): Promise<R[]> {
  const tasks = items.map((item, index) => () => fn(item, index));

  if (limit !== undefined) {
    return parallel(tasks, limit);
  }

  return Promise.all(tasks.map((t) => t()));
}

/**
 * Executes tasks with a filter pattern
 * @param items - Array of items
 * @param fn - Filter function
 * @param limit - Concurrency limit
 * @returns Promise resolving to filtered array
 */
export async function filter<T = unknown>(
  items: T[],
  fn: (item: T) => Promise<boolean>,
  limit?: number,
): Promise<T[]> {
  const results = await map(
    items,
    async (item) => ({ item, pass: await fn(item) }),
    limit,
  );

  return results.filter((r) => r.pass).map((r) => r.item);
}

/**
 * Executes tasks with a reduce pattern
 * @param items - Array of items
 * @param fn - Reduce function
 * @param initial - Initial value
 * @returns Promise resolving to reduced value
 */
export async function reduce<T = unknown, R = unknown>(
  items: T[],
  fn: (accumulator: R, item: T, index: number) => Promise<R>,
  initial: R,
): Promise<R> {
  let accumulator = initial;

  for (let i = 0; i < items.length; i++) {
    accumulator = await fn(accumulator, items[i], i);
  }

  return accumulator;
}

/**
 * Executes tasks with a each pattern (iterates without collecting results)
 * @param items - Array of items
 * @param fn - Function to apply to each item
 * @param limit - Concurrency limit
 * @returns Promise resolving when all items are processed
 */
export async function each<T = unknown>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  limit?: number,
): Promise<void> {
  const tasks = items.map((item, index) => () => fn(item, index));

  if (limit !== undefined) {
    await parallel(tasks, limit);
  } else {
    await Promise.all(tasks);
  }
}

/**
 * Debounces a function
 * @param fn - Function to debounce
 * @param ms - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}

/**
 * Throttles a function
 * @param fn - Function to throttle
 * @param ms - Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= ms) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, ms - timeSinceLastCall);
    }
  };
}

/**
 * Memoizes a function
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
): T {
  const cache = new Map<string, unknown>();

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result as ReturnType<T>;
  } as T;
}

/**
 * Creates a task result
 * @param success - Whether the task succeeded
 * @param data - Result data
 * @param error - Error if failed
 * @returns Task result
 */
export function createTaskResult<T = unknown>(
  success: boolean,
  data?: T,
  error?: Error,
): TaskResult<T> {
  return {
    success,
    data,
    error,
  };
}

/**
 * Generates a unique task ID
 * @returns Unique task ID
 */
export function generateTaskId(): string {
  return `task-${taskCounter++}`;
}

/**
 * Resets the task counter
 */
export function resetTaskCounter(): void {
  taskCounter = 0;
}

/**
 * Checks if a value is a promise
 * @param value - Value to check
 * @returns True if value is a promise
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

/**
 * Converts a callback-based function to a promise-based function
 * @param fn - Callback-based function
 * @returns Promise-based function
 */
export function promisify<T extends (...args: unknown[]) => unknown>(
  fn: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return function (this: unknown, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      try {
        const result = fn.apply(this, [...args, (err: Error | null, res: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve(res as ReturnType<T>);
          }
        }] as unknown as Parameters<T>);

        // Handle synchronous return
        if (isPromise(result)) {
          (result as Promise<ReturnType<T>>).then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
}
