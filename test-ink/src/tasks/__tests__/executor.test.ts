/**
 * Task Executor Module Tests
 */

import test from 'ava';
import { TaskExecutor } from '../executor.js';
import { TaskStatus, TaskPriority } from '../types.js';

test('TaskExecutor should execute a task successfully', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const result = await executor.execute(task);

  t.true(result.success);
  t.is(result.data, 'result');
  t.is(task.status, TaskStatus.COMPLETED);
});

test('TaskExecutor should handle task failure', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      throw new Error('Task failed');
    },
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const result = await executor.execute(task);

  t.false(result.success);
  t.is(result.error?.message, 'Task failed');
  t.is(task.status, TaskStatus.FAILED);
});

test('TaskExecutor should retry on failure', async (t) => {
  const executor = new TaskExecutor({ maxRetries: 3 });
  let attempts = 0;

  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Not yet');
      }
      return 'success';
    },
    options: { retries: 3 },
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const result = await executor.execute(task);

  t.true(result.success);
  t.is(result.data, 'success');
  t.is(attempts, 3);
});

test('TaskExecutor should timeout a task', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'result';
    },
    options: { timeout: 100 },
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const result = await executor.execute(task);

  t.false(result.success);
  t.true(result.error?.message.includes('timeout'));
});

test('TaskExecutor should cancel a task', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'result';
    },
    options: { timeout: 5000 },
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  // Start execution
  const execution = executor.execute(task);

  // Cancel after a short delay
  setTimeout(() => {
    executor.cancel('task-1');
  }, 50);

  const result = await execution;

  t.false(result.success);
  t.is(task.status, TaskStatus.CANCELLED);
});

test('TaskExecutor should get active count', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'result';
    },
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const execution = executor.execute(task);

  // Task should be executing
  t.is(executor.getActiveCount(), 1);

  await execution;

  // Task should be done
  t.is(executor.getActiveCount(), 0);
});

test('TaskExecutor should check if task is executing', async (t) => {
  const executor = new TaskExecutor();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'result';
    },
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const execution = executor.execute(task);

  t.true(executor.isExecuting('task-1'));

  await execution;

  t.false(executor.isExecuting('task-1'));
});

test('TaskExecutor should cancel all tasks', async (t) => {
  const executor = new TaskExecutor();
  const task1 = {
    id: 'task-1',
    name: 'Test Task 1',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'result1';
    },
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const task2 = {
    id: 'task-2',
    name: 'Test Task 2',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return 'result2';
    },
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  const execution1 = executor.execute(task1);
  const execution2 = executor.execute(task2);

  setTimeout(() => {
    executor.cancelAll();
  }, 50);

  const [result1, result2] = await Promise.all([execution1, execution2]);

  t.false(result1.success);
  t.false(result2.success);
});

test('TaskExecutor should set and get retry options', (t) => {
  const executor = new TaskExecutor();

  executor.setRetryOptions({ maxRetries: 5, initialDelay: 2000 });

  const options = executor.getRetryOptions();

  t.is(options.maxRetries, 5);
  t.is(options.initialDelay, 2000);
});
