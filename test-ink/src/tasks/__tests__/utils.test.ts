/**
 * Task Utilities Module Tests
 */

import test from 'ava';
import {
  createTask,
  delay,
  retry,
  timeout,
  parallel,
  series,
  race,
  createTaskResult,
  generateTaskId,
  resetTaskCounter,
  isPromise,
  debounce,
  throttle,
  memoize,
} from '../utils.js';
import { TaskStatus, TaskPriority } from '../types.js';

test('createTask should create a valid task', (t) => {
  const task = createTask('Test Task', async () => 'result', {
    priority: TaskPriority.HIGH,
  });

  t.is(task.name, 'Test Task');
  t.is(task.status, TaskStatus.PENDING);
  t.is(task.priority, TaskPriority.HIGH);
  t.true(task.id.startsWith('task-'));
});

test('delay should resolve after specified time', async (t) => {
  const start = Date.now();
  await delay(100);
  const elapsed = Date.now() - start;
  t.true(elapsed >= 90);
});

test('retry should retry on failure', async (t) => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Not yet');
    }
    return 'success';
  };

  const result = await retry(fn, { maxRetries: 5 });
  t.is(result, 'success');
  t.is(attempts, 3);
});

test('retry should fail after max retries', async (t) => {
  const fn = async () => {
    throw new Error('Always fails');
  };

  await t.throwsAsync(
    async () => retry(fn, { maxRetries: 2 }),
    { message: 'Always fails' },
  );
});

test('timeout should reject after specified time', async (t) => {
  const fn = async () => {
    await delay(1000);
    return 'result';
  };

  await t.throwsAsync(
    async () => timeout(fn(), 100),
    { message: /timeout/i },
  );
});

test('timeout should resolve if promise completes in time', async (t) => {
  const fn = async () => {
    await delay(50);
    return 'result';
  };

  const result = await timeout(fn(), 100);
  t.is(result, 'result');
});

test('parallel should execute tasks concurrently', async (t) => {
  const tasks = [
    async () => {
      await delay(50);
      return 1;
    },
    async () => {
      await delay(50);
      return 2;
    },
    async () => {
      await delay(50);
      return 3;
    },
  ];

  const start = Date.now();
  const results = await parallel(tasks);
  const elapsed = Date.now() - start;

  t.deepEqual(results, [1, 2, 3]);
  t.true(elapsed < 200);
});

test('parallel should respect concurrency limit', async (t) => {
  let concurrent = 0;
  let maxConcurrent = 0;

  const tasks = Array.from({ length: 10 }, (_, i) => async () => {
    concurrent++;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
    await delay(50);
    concurrent--;
    return i;
  });

  await parallel(tasks, 3);
  t.is(maxConcurrent, 3);
});

test('series should execute tasks sequentially', async (t) => {
  const order: number[] = [];
  const tasks = [
    async () => {
      order.push(1);
      await delay(50);
      return 1;
    },
    async () => {
      order.push(2);
      await delay(50);
      return 2;
    },
    async () => {
      order.push(3);
      await delay(50);
      return 3;
    },
  ];

  const results = await series(tasks);
  t.deepEqual(results, [1, 2, 3]);
  t.deepEqual(order, [1, 2, 3]);
});

test('race should return first completed task', async (t) => {
  const tasks = [
    async () => {
      await delay(100);
      return 'slow';
    },
    async () => {
      await delay(50);
      return 'fast';
    },
    async () => {
      await delay(200);
      return 'slowest';
    },
  ];

  const result = await race(tasks);
  t.is(result, 'fast');
});

test('createTaskResult should create a valid result', (t) => {
  const successResult = createTaskResult(true, 'data');
  t.true(successResult.success);
  t.is(successResult.data, 'data');

  const failureResult = createTaskResult(false, undefined, new Error('error'));
  t.false(failureResult.success);
  t.is(failureResult.error?.message, 'error');
});

test('generateTaskId should generate unique IDs', (t) => {
  const id1 = generateTaskId();
  const id2 = generateTaskId();

  t.not(id1, id2);
  t.true(id1.startsWith('task-'));
  t.true(id2.startsWith('task-'));
});

test('resetTaskCounter should reset the counter', (t) => {
  resetTaskCounter();
  const id1 = generateTaskId();
  const id2 = generateTaskId();

  t.is(id1, 'task-0');
  t.is(id2, 'task-1');
});

test('isPromise should identify promises', (t) => {
  t.true(isPromise(Promise.resolve()));
  t.true(isPromise(delay(100)));
  t.false(isPromise('not a promise'));
  t.false(isPromise(123));
  t.false(isPromise(null));
});

test('debounce should delay function calls', async (t) => {
  let calls = 0;
  const debouncedFn = debounce(() => {
    calls++;
  }, 100);

  debouncedFn();
  debouncedFn();
  debouncedFn();

  t.is(calls, 0);
  await delay(150);
  t.is(calls, 1);
});

test('throttle should limit function calls', async (t) => {
  let calls = 0;
  const throttledFn = throttle(() => {
    calls++;
  }, 100);

  throttledFn();
  throttledFn();
  throttledFn();

  t.is(calls, 1);
  await delay(150);
  throttledFn();
  t.is(calls, 2);
});

test('memoize should cache function results', (t) => {
  let calls = 0;
  const memoizedFn = memoize((...args: unknown[]) => {
    calls++;
    const x = args[0] as number;
    return x * 2;
  });

  t.is(memoizedFn(5), 10);
  t.is(calls, 1);

  t.is(memoizedFn(5), 10);
  t.is(calls, 1);

  t.is(memoizedFn(10), 20);
  t.is(calls, 2);
});
