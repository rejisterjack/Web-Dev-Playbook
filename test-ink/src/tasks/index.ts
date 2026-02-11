/**
 * Task System Module
 * 
 * Main export file for the async task processing system.
 * Provides comprehensive task management capabilities including:
 * - Task queue with priority support
 * - Task execution with timeout and retry
 * - Worker pool for parallel execution
 * - Task scheduling (delayed, recurring, cron-like)
 * - Progress reporting
 * - Task history tracking
 * - Worker thread integration
 * - Utility functions
 * - Task decorators
 */

// Types
export type {
  Task,
  TaskOptions,
  TaskResult,
  TaskProgress,
  TaskEvent,
  TaskStatistics,
  RetryOptions,
  WorkerConfig,
  ScheduledTaskConfig,
  TaskFilter,
  HistoryStatistics,
} from './types.js';

export {
  TaskStatus,
  TaskPriority,
  TaskEventType,
} from './types.js';

// Core classes
export { TaskQueue } from './queue.js';
export { TaskExecutor } from './executor.js';
export { TaskPool } from './pool.js';
export { TaskScheduler } from './scheduler.js';
export { TaskManager } from './manager.js';
export { ProgressReporter } from './progress.js';
export { TaskHistory } from './history.js';
export { TaskWorker, createWorkerPool } from './worker.js';

// Utility functions
export {
  createTask,
  delay,
  retry,
  timeout,
  parallel,
  series,
  race,
  waterfall,
  map,
  filter,
  reduce,
  each,
  debounce,
  throttle,
  memoize,
  createTaskResult,
  generateTaskId,
  resetTaskCounter,
  isPromise,
  promisify,
} from './utils.js';

// Decorators
export {
  Retry,
  Timeout,
  Throttle,
  Debounce,
  Memoize,
  Async,
  Catch,
  Log,
  Measure,
  Once,
  RateLimit,
  CircuitBreaker,
  Cache,
  Validate,
  Compose,
} from './decorators.js';
