/**
 * Progress Reporter Module Tests
 */

import test from 'ava';
import { ProgressReporter } from '../progress.js';

test('ProgressReporter should update and retrieve progress', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  const progress = reporter.get('task-1');
  t.is(progress?.current, 50);
  t.is(progress?.total, 100);
  t.is(progress?.percentage, 50);
});

test('ProgressReporter should calculate ETA', async (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  const progress = reporter.get('task-1');
  t.true(progress?.eta !== undefined);
  t.true(progress!.eta! > 0);
});

test('ProgressReporter should track multiple tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 25,
    total: 100,
    percentage: 25,
  });

  reporter.update('task-2', {
    current: 75,
    total: 100,
    percentage: 75,
  });

  t.is(reporter.size(), 2);
  t.true(reporter.has('task-1'));
  t.true(reporter.has('task-2'));
});

test('ProgressReporter should remove tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  t.true(reporter.remove('task-1'));
  t.false(reporter.has('task-1'));
  t.is(reporter.size(), 0);
});

test('ProgressReporter should clear all tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  reporter.update('task-2', {
    current: 75,
    total: 100,
    percentage: 75,
  });

  reporter.clear();

  t.is(reporter.size(), 0);
});

test('ProgressReporter should get in-progress tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  reporter.update('task-2', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  reporter.update('task-3', {
    current: 100,
    total: 100,
    percentage: 100,
  });

  const inProgress = reporter.getInProgressTasks();
  t.is(inProgress.length, 1);
  t.is(inProgress[0], 'task-2');
});

test('ProgressReporter should get completed tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  reporter.update('task-2', {
    current: 100,
    total: 100,
    percentage: 100,
  });

  const completed = reporter.getCompletedTasks();
  t.is(completed.length, 1);
  t.is(completed[0], 'task-2');
});

test('ProgressReporter should get not started tasks', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  reporter.update('task-2', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  const notStarted = reporter.getNotStartedTasks();
  t.is(notStarted.length, 1);
  t.is(notStarted[0], 'task-1');
});

test('ProgressReporter should calculate overall progress', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 25,
    total: 100,
    percentage: 25,
  });

  reporter.update('task-2', {
    current: 75,
    total: 100,
    percentage: 75,
  });

  const overall = reporter.getOverallProgress();
  t.is(overall, 50);
});

test('ProgressReporter should get summary', (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  reporter.update('task-2', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  reporter.update('task-3', {
    current: 100,
    total: 100,
    percentage: 100,
  });

  const summary = reporter.getSummary();
  t.is(summary.totalTasks, 3);
  t.is(summary.notStarted, 1);
  t.is(summary.inProgress, 1);
  t.is(summary.completed, 1);
  t.is(summary.overallProgress, 50);
});

test('ProgressReporter should get elapsed time', async (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  const elapsed = reporter.getElapsedTime('task-1');
  t.true(elapsed >= 90);
});

test('ProgressReporter should get average rate', async (t) => {
  const reporter = new ProgressReporter();

  reporter.update('task-1', {
    current: 0,
    total: 100,
    percentage: 0,
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  reporter.update('task-1', {
    current: 50,
    total: 100,
    percentage: 50,
  });

  const rate = reporter.getAverageRate('task-1');
  t.true(rate > 0);
});
