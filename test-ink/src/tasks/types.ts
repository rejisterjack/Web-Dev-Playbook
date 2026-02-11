/**
 * Task Types Module
 * 
 * Defines core task interfaces and types for the async task processing system.
 * This module provides the foundational types used throughout the task system.
 */

/**
 * Enumeration of possible task statuses
 */
export enum TaskStatus {
  /** Task is waiting to be executed */
  PENDING = 'pending',
  /** Task is currently running */
  RUNNING = 'running',
  /** Task completed successfully */
  COMPLETED = 'completed',
  /** Task failed with an error */
  FAILED = 'failed',
  /** Task was cancelled before completion */
  CANCELLED = 'cancelled',
}

/**
 * Enumeration of task priority levels
 */
export enum TaskPriority {
  /** Low priority - executed when no higher priority tasks exist */
  LOW = 0,
  /** Normal priority - default execution order */
  NORMAL = 1,
  /** High priority - executed before normal and low priority tasks */
  HIGH = 2,
  /** Critical priority - executed immediately */
  CRITICAL = 3,
}

/**
 * Configuration options for task execution
 */
export interface TaskOptions {
  /** Maximum time in milliseconds before task is cancelled */
  timeout?: number;
  /** Maximum number of retry attempts on failure */
  retries?: number;
  /** Task priority level */
  priority?: TaskPriority;
  /** Delay in milliseconds before task execution */
  delay?: number;
  /** List of task IDs that must complete before this task can run */
  dependencies?: string[];
  /** Whether the task can be cancelled */
  cancellable?: boolean;
  /** Custom metadata for the task */
  metadata?: Record<string, unknown>;
}

/**
 * Result wrapper for task execution
 */
export interface TaskResult<T = unknown> {
  /** Whether the task completed successfully */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** Error message if failed */
  error?: Error;
  /** Execution time in milliseconds */
  executionTime?: number;
}

/**
 * Progress information for a task
 */
export interface TaskProgress {
  /** Current progress value */
  current: number;
  /** Total value for progress calculation */
  total: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Current stage or step description */
  stage?: string;
  /** Estimated time to completion in milliseconds */
  eta?: number;
}

/**
 * Core task interface
 */
export interface Task<T = unknown> {
  /** Unique identifier for the task */
  id: string;
  /** Human-readable name for the task */
  name: string;
  /** Current status of the task */
  status: TaskStatus;
  /** Task priority level */
  priority: TaskPriority;
  /** The async function to execute */
  fn: () => Promise<T>;
  /** Task execution options */
  options: TaskOptions;
  /** Task result (populated after completion) */
  result?: TaskResult<T>;
  /** Current progress information */
  progress?: TaskProgress;
  /** Timestamp when task was created */
  createdAt: number;
  /** Timestamp when task started execution */
  startedAt?: number;
  /** Timestamp when task completed */
  completedAt?: number;
  /** Number of retry attempts made */
  retryCount: number;
  /** Whether the task has been cancelled */
  cancelled: boolean;
  /** List of task IDs that must complete before this task */
  dependencies: string[];
  /** Custom metadata */
  metadata: Record<string, unknown>;
}

/**
 * Task event types
 */
export enum TaskEventType {
  /** Task started execution */
  STARTED = 'started',
  /** Task progress updated */
  PROGRESS = 'progress',
  /** Task completed successfully */
  COMPLETED = 'completed',
  /** Task failed */
  FAILED = 'failed',
  /** Task was cancelled */
  CANCELLED = 'cancelled',
  /** Task was retried */
  RETRIED = 'retried',
}

/**
 * Task event payload
 */
export interface TaskEvent<T = unknown> {
  /** Type of event */
  type: TaskEventType;
  /** Task that triggered the event */
  task: Task<T>;
  /** Event timestamp */
  timestamp: number;
  /** Additional event data */
  data?: unknown;
}

/**
 * Task statistics
 */
export interface TaskStatistics {
  /** Total number of tasks */
  total: number;
  /** Number of pending tasks */
  pending: number;
  /** Number of running tasks */
  running: number;
  /** Number of completed tasks */
  completed: number;
  /** Number of failed tasks */
  failed: number;
  /** Number of cancelled tasks */
  cancelled: number;
  /** Average execution time in milliseconds */
  averageExecutionTime: number;
  /** Total execution time in milliseconds */
  totalExecutionTime: number;
}

/**
 * Retry options for retry logic
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Whether to retry on specific error types */
  retryCondition?: (error: Error) => boolean;
}

/**
 * Worker configuration
 */
export interface WorkerConfig {
  /** Minimum number of workers */
  minWorkers: number;
  /** Maximum number of workers */
  maxWorkers: number;
  /** Idle timeout in milliseconds before worker is terminated */
  idleTimeout: number;
  /** Maximum tasks a worker can handle before being recycled */
  maxTasksPerWorker: number;
}

/**
 * Scheduled task configuration
 */
export interface ScheduledTaskConfig {
  /** Delay in milliseconds before execution */
  delay?: number;
  /** Interval in milliseconds for recurring tasks */
  interval?: number;
  /** Cron expression for scheduling */
  cron?: string;
  /** Maximum number of executions */
  maxExecutions?: number;
  /** Whether to execute immediately on schedule */
  immediate?: boolean;
}

/**
 * Task filter options for history queries
 */
export interface TaskFilter {
  /** Filter by task status */
  status?: TaskStatus | TaskStatus[];
  /** Filter by task name pattern */
  namePattern?: string;
  /** Filter by creation date range */
  dateRange?: {
    start: number;
    end: number;
  };
  /** Filter by priority */
  priority?: TaskPriority | TaskPriority[];
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * History statistics
 */
export interface HistoryStatistics {
  /** Total tasks in history */
  totalTasks: number;
  /** Tasks by status */
  byStatus: Record<TaskStatus, number>;
  /** Tasks by priority */
  byPriority: Record<TaskPriority, number>;
  /** Average execution time */
  averageExecutionTime: number;
  /** Total execution time in milliseconds */
  totalExecutionTime: number;
  /** Success rate (0-1) */
  successRate: number;
  /** Most common failure reasons */
  commonFailures: Array<{ error: string; count: number }>;
}
