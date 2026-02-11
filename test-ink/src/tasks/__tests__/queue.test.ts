/**
 * Task Queue Module Tests
 */

import test from 'ava';
import { TaskQueue } from '../queue.js';
import { TaskStatus, TaskPriority } from '../types.js';

test('TaskQueue should enqueue and dequeue tasks', (t) => {
  const queue = new TaskQueue();
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

  queue.enqueue(task);
  t.is(queue.size(), 1);

  const dequeued = queue.dequeue();
  t.is(dequeued?.id, 'task-1');
  t.is(queue.size(), 0);
});

test('TaskQueue should respect priority ordering', (t) => {
  const queue = new TaskQueue();
  const lowTask = {
    id: 'low',
    name: 'Low Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    fn: async () => 'low',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };
  const highTask = {
    id: 'high',
    name: 'High Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    fn: async () => 'high',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };

  queue.enqueue(lowTask);
  queue.enqueue(highTask);

  const first = queue.dequeue();
  t.is(first?.id, 'high');

  const second = queue.dequeue();
  t.is(second?.id, 'low');
});

test('TaskQueue should peek at the next task', (t) => {
  const queue = new TaskQueue();
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

  queue.enqueue(task);
  const peeked = queue.peek();

  t.is(peeked?.id, 'task-1');
  t.is(queue.size(), 1);
});

test('TaskQueue should clear all tasks', (t) => {
  const queue = new TaskQueue();
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

  queue.enqueue(task);
  queue.clear();

  t.is(queue.size(), 0);
  t.true(queue.isEmpty());
});

test('TaskQueue should check if task exists', (t) => {
  const queue = new TaskQueue();
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

  t.false(queue.has('task-1'));
  queue.enqueue(task);
  t.true(queue.has('task-1'));
});

test('TaskQueue should remove specific task', (t) => {
  const queue = new TaskQueue();
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

  queue.enqueue(task);
  const removed = queue.remove('task-1');

  t.is(removed?.id, 'task-1');
  t.is(queue.size(), 0);
});

test('TaskQueue should get ready tasks based on dependencies', (t) => {
  const queue = new TaskQueue();
  const task1 = {
    id: 'task-1',
    name: 'Task 1',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result1',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
  };
  const task2 = {
    id: 'task-2',
    name: 'Task 2',
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result2',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: ['task-1'],
    metadata: {},
    createdAt: Date.now(),
  };

  queue.enqueue(task1);
  queue.enqueue(task2);

  const readyTasks = queue.getReadyTasks(new Set());
  t.is(readyTasks.length, 1);
  t.is(readyTasks[0].id, 'task-1');

  const readyTasks2 = queue.getReadyTasks(new Set(['task-1']));
  t.is(readyTasks2.length, 1);
  t.is(readyTasks2[0].id, 'task-2');
});
