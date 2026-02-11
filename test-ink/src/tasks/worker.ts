/**
 * Task Worker Module
 *
 * Implements the TaskWorker class for worker thread integration.
 * Supports Node.js worker threads for CPU-intensive task execution.
 */

import type { Task, TaskResult } from './types.js';
import { TaskStatus } from './types.js';

// Type for Node.js Worker (will be undefined in non-Node environments)
type NodeWorker = {
  postMessage: (message: unknown) => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  terminate: () => void;
};

// Global Worker type
declare const Worker: {
  new (script: string, options?: { eval?: boolean }): NodeWorker;
} | undefined;

/**
 * Worker message types
 */
enum WorkerMessageType {
  TASK = 'task',
  RESULT = 'result',
  PROGRESS = 'progress',
  ERROR = 'error',
  CANCEL = 'cancel',
  PING = 'ping',
  PONG = 'pong',
}

/**
 * Worker message interface
 */
interface WorkerMessage {
  type: WorkerMessageType;
  taskId?: string;
  data?: unknown;
  error?: Error;
}

/**
 * Task worker configuration
 */
interface TaskWorkerConfig {
  /** Worker script path */
  scriptPath?: string;
  /** Maximum memory in MB */
  maxMemory?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * TaskWorker class for worker thread integration
 */
export class TaskWorker<T = unknown> {
  private worker?: NodeWorker;
  private config: TaskWorkerConfig;
  private activeTasks: Map<string, (result: TaskResult<T>) => void> = new Map();
  private isInitialized: boolean = false;
  private isTerminated: boolean = false;

  /**
   * Creates a new TaskWorker instance
   * @param config - Worker configuration
   */
  constructor(config?: TaskWorkerConfig) {
    this.config = {
      maxMemory: 512,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Initializes the worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || this.isTerminated) {
      return;
    }

    try {
      // Check if Worker is available (Node.js environment)
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(this.config.scriptPath || '', {
          eval: true,
        });

        this.setupWorkerListeners();
        this.isInitialized = true;
      } else {
        // Worker not available, use fallback
        console.warn('Worker threads not available, using fallback execution');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.isInitialized = true; // Continue with fallback
    }
  }

  /**
   * Sets up worker event listeners
   */
  private setupWorkerListeners(): void {
    if (!this.worker) {
      return;
    }

    this.worker.on('message', (...args: unknown[]) => {
      const message = args[0] as WorkerMessage;
      this.handleWorkerMessage(message);
    });

    this.worker.on('error', (...args: unknown[]) => {
      const error = args[0] as Error;
      console.error('Worker error:', error);
      this.handleWorkerError(error);
    });

    this.worker.on('exit', (...args: unknown[]) => {
      const code = args[0] as number;
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      this.isTerminated = true;
    });
  }

  /**
   * Handles messages from the worker
   * @param message - The message from the worker
   */
  private handleWorkerMessage(message: WorkerMessage): void {
    switch (message.type) {
      case WorkerMessageType.RESULT:
        this.handleTaskResult(message);
        break;
      case WorkerMessageType.PROGRESS:
        this.handleTaskProgress(message);
        break;
      case WorkerMessageType.ERROR:
        this.handleTaskError(message);
        break;
      case WorkerMessageType.PONG:
        // Worker is alive
        break;
      default:
        console.warn('Unknown worker message type:', message.type);
    }
  }

  /**
   * Handles task result from worker
   * @param message - The result message
   */
  private handleTaskResult(message: WorkerMessage): void {
    const { taskId, data } = message;
    if (!taskId) {
      return;
    }

    const callback = this.activeTasks.get(taskId);
    if (callback) {
      callback({
        success: true,
        data: data as T,
      });
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Handles task progress from worker
   * @param message - The progress message
   */
  private handleTaskProgress(message: WorkerMessage): void {
    // Progress updates can be emitted via event emitter
    // For now, just log
    console.log('Task progress:', message.data);
  }

  /**
   * Handles task error from worker
   * @param message - The error message
   */
  private handleTaskError(message: WorkerMessage): void {
    const { taskId, error } = message;
    if (!taskId) {
      return;
    }

    const callback = this.activeTasks.get(taskId);
    if (callback) {
      callback({
        success: false,
        error: error || new Error('Unknown worker error'),
      });
      this.activeTasks.delete(taskId);
    }
  }

  /**
   * Handles worker errors
   * @param error - The error
   */
  private handleWorkerError(error: Error): void {
    // Fail all active tasks
    for (const [taskId, callback] of this.activeTasks.entries()) {
      callback({
        success: false,
        error,
      });
    }
    this.activeTasks.clear();
  }

  /**
   * Executes a task in the worker
   * @param task - The task to execute
   * @returns Promise resolving to the task result
   */
  async execute(task: Task<T>): Promise<TaskResult<T>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isTerminated) {
      return {
        success: false,
        error: new Error('Worker has been terminated'),
      };
    }

    // If worker is not available, execute directly
    if (!this.worker) {
      return this.executeDirect(task);
    }

    return new Promise((resolve) => {
      this.activeTasks.set(task.id, resolve);

      const message: WorkerMessage = {
        type: WorkerMessageType.TASK,
        taskId: task.id,
        data: {
          name: task.name,
          fn: task.fn.toString(),
          options: task.options,
        },
      };

      this.worker!.postMessage(message);

      // Set timeout
      if (this.config.timeout) {
        setTimeout(() => {
          if (this.activeTasks.has(task.id)) {
            this.activeTasks.delete(task.id);
            resolve({
              success: false,
              error: new Error(`Task timeout after ${this.config.timeout}ms`),
            });
          }
        }, this.config.timeout);
      }
    });
  }

  /**
   * Executes a task directly (fallback when worker is not available)
   * @param task - The task to execute
   * @returns Promise resolving to the task result
   */
  private async executeDirect(task: Task<T>): Promise<TaskResult<T>> {
    try {
      const startTime = Date.now();
      const result = await task.fn();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Cancels a task
   * @param taskId - The ID of the task to cancel
   * @returns True if task was cancelled, false otherwise
   */
  cancel(taskId: string): boolean {
    if (!this.worker) {
      return false;
    }

    const callback = this.activeTasks.get(taskId);
    if (callback) {
      this.activeTasks.delete(taskId);
      callback({
        success: false,
        error: new Error('Task cancelled'),
      });

      // Send cancel message to worker
      const message: WorkerMessage = {
        type: WorkerMessageType.CANCEL,
        taskId,
      };
      this.worker.postMessage(message);

      return true;
    }

    return false;
  }

  /**
   * Pings the worker to check if it's alive
   * @returns Promise resolving to true if worker is alive
   */
  async ping(): Promise<boolean> {
    if (!this.worker || this.isTerminated) {
      return false;
    }

    return new Promise((resolve) => {
      const message: WorkerMessage = {
        type: WorkerMessageType.PING,
      };

      const timeout = setTimeout(() => {
        resolve(false);
      }, 1000);

      const handler = (...args: unknown[]) => {
        const msg = args[0] as WorkerMessage;
        if (msg.type === WorkerMessageType.PONG) {
          clearTimeout(timeout);
          this.worker!.removeListener('message', handler);
          resolve(true);
        }
      };

      this.worker!.on('message', handler);
      this.worker!.postMessage(message);
    });
  }

  /**
   * Gets the number of active tasks
   * @returns The number of active tasks
   */
  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  /**
   * Checks if the worker is initialized
   * @returns True if worker is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !this.isTerminated;
  }

  /**
   * Terminates the worker
   */
  async terminate(): Promise<void> {
    if (this.worker && !this.isTerminated) {
      this.worker.terminate();
      this.isTerminated = true;
    }

    // Fail all active tasks
    for (const [taskId, callback] of this.activeTasks.entries()) {
      callback({
        success: false,
        error: new Error('Worker terminated'),
      });
    }
    this.activeTasks.clear();
  }

  /**
   * Restarts the worker
   */
  async restart(): Promise<void> {
    await this.terminate();
    this.isTerminated = false;
    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Gets the worker configuration
   * @returns The worker configuration
   */
  getConfig(): TaskWorkerConfig {
    return { ...this.config };
  }

  /**
   * Updates the worker configuration
   * @param config - New configuration options
   */
  updateConfig(config: Partial<TaskWorkerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Creates a worker pool for parallel task execution
 * @param size - Number of workers in the pool
 * @param config - Worker configuration
 * @returns Array of TaskWorker instances
 */
export function createWorkerPool<T = unknown>(
  size: number,
  config?: TaskWorkerConfig,
): TaskWorker<T>[] {
  const workers: TaskWorker<T>[] = [];

  for (let i = 0; i < size; i++) {
    workers.push(new TaskWorker<T>(config));
  }

  return workers;
}
