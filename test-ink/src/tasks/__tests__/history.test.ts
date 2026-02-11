/**
 * Task History Module Tests
 */

import test from 'ava';
import { TaskHistory } from '../history.js';
import { TaskStatus, TaskPriority } from '../types.js';

test('TaskHistory should add and retrieve tasks', (t) => {
  const history = new TaskHistory();
  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(task);
  t.is(history.size(), 1);

  const retrieved = history.get('task-1');
  t.is(retrieved?.id, 'task-1');
});

test('TaskHistory should filter by status', (t) => {
  const history = new TaskHistory();

  const completedTask = {
    id: 'task-1',
    name: 'Completed Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  const failedTask = {
    id: 'task-2',
    name: 'Failed Task',
    status: TaskStatus.FAILED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: false,
      error: new Error('Failed'),
      executionTime: 50,
    },
  };

  history.add(completedTask);
  history.add(failedTask);

  const completed = history.getByStatus(TaskStatus.COMPLETED);
  t.is(completed.length, 1);
  t.is(completed[0].id, 'task-1');

  const failed = history.getByStatus(TaskStatus.FAILED);
  t.is(failed.length, 1);
  t.is(failed[0].id, 'task-2');
});

test('TaskHistory should filter by priority', (t) => {
  const history = new TaskHistory();

  const lowTask = {
    id: 'task-1',
    name: 'Low Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  const highTask = {
    id: 'task-2',
    name: 'High Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(lowTask);
  history.add(highTask);

  const highPriority = history.getByPriority(TaskPriority.HIGH);
  t.is(highPriority.length, 1);
  t.is(highPriority[0].id, 'task-2');
});

test('TaskHistory should get recent tasks', (t) => {
  const history = new TaskHistory();
  const now = Date.now();

  const oldTask = {
    id: 'task-1',
    name: 'Old Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: now - 10000,
    startedAt: now - 10000,
    completedAt: now - 10000,
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  const newTask = {
    id: 'task-2',
    name: 'New Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: now,
    startedAt: now,
    completedAt: now,
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(oldTask);
  history.add(newTask);

  const recent = history.getRecent(1);
  t.is(recent.length, 1);
  t.is(recent[0].id, 'task-2');
});

test('TaskHistory should get statistics', (t) => {
  const history = new TaskHistory();

  const completedTask = {
    id: 'task-1',
    name: 'Completed Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  const failedTask = {
    id: 'task-2',
    name: 'Failed Task',
    status: TaskStatus.FAILED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: false,
      error: new Error('Failed'),
      executionTime: 50,
    },
  };

  history.add(completedTask);
  history.add(failedTask);

  const stats = history.getStatistics();
  t.is(stats.totalTasks, 2);
  t.is(stats.byStatus[TaskStatus.COMPLETED], 1);
  t.is(stats.byStatus[TaskStatus.FAILED], 1);
  t.is(stats.averageExecutionTime, 75);
  t.is(stats.totalExecutionTime, 150);
  t.is(stats.successRate, 0.5);
});

test('TaskHistory should enforce max history size', (t) => {
  const history = new TaskHistory(3);

  for (let i = 0; i < 5; i++) {
    const task = {
      id: `task-${i}`,
      name: `Task ${i}`,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.NORMAL,
      fn: async () => `result-${i}`,
      options: {},
      retryCount: 0,
      cancelled: false,
      dependencies: [],
      metadata: {},
      createdAt: Date.now(),
      startedAt: Date.now(),
      completedAt: Date.now(),
      result: {
        success: true,
        data: `result-${i}`,
        executionTime: 100,
      },
    };
    history.add(task);
  }

  t.is(history.size(), 3);
});

test('TaskHistory should export and import JSON', (t) => {
  const history = new TaskHistory();

  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(task);

  const json = history.exportJSON();
  t.true(json.includes('task-1'));

  const newHistory = new TaskHistory();
  newHistory.importJSON(json);

  t.is(newHistory.size(), 1);
  t.is(newHistory.get('task-1')?.name, 'Test Task');
});

test('TaskHistory should remove tasks', (t) => {
  const history = new TaskHistory();

  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(task);
  t.true(history.remove('task-1'));
  t.is(history.size(), 0);
});

test('TaskHistory should clear all tasks', (t) => {
  const history = new TaskHistory();

  const task = {
    id: 'task-1',
    name: 'Test Task',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.NORMAL,
    fn: async () => 'result',
    options: {},
    retryCount: 0,
    cancelled: false,
    dependencies: [],
    metadata: {},
    createdAt: Date.now(),
    startedAt: Date.now(),
    completedAt: Date.now(),
    result: {
      success: true,
      data: 'result',
      executionTime: 100,
    },
  };

  history.add(task);
  history.clear();

  t.is(history.size(), 0);
});
