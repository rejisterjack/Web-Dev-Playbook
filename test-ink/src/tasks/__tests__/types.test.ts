/**
 * Task Types Module Tests
 */

import test from 'ava';
import {
  TaskStatus,
  TaskPriority,
  TaskEventType,
} from '../types.js';

test('TaskStatus should have all expected status values', (t) => {
  t.is(TaskStatus.PENDING, 'pending' as TaskStatus);
  t.is(TaskStatus.RUNNING, 'running' as TaskStatus);
  t.is(TaskStatus.COMPLETED, 'completed' as TaskStatus);
  t.is(TaskStatus.FAILED, 'failed' as TaskStatus);
  t.is(TaskStatus.CANCELLED, 'cancelled' as TaskStatus);
});

test('TaskPriority should have all expected priority values', (t) => {
  t.is(TaskPriority.LOW, 0);
  t.is(TaskPriority.NORMAL, 1);
  t.is(TaskPriority.HIGH, 2);
  t.is(TaskPriority.CRITICAL, 3);
});

test('TaskPriority should have correct priority ordering', (t) => {
  t.true(TaskPriority.LOW < TaskPriority.NORMAL);
  t.true(TaskPriority.NORMAL < TaskPriority.HIGH);
  t.true(TaskPriority.HIGH < TaskPriority.CRITICAL);
});

test('TaskEventType should have all expected event types', (t) => {
  t.is(TaskEventType.STARTED, 'started' as TaskEventType);
  t.is(TaskEventType.PROGRESS, 'progress' as TaskEventType);
  t.is(TaskEventType.COMPLETED, 'completed' as TaskEventType);
  t.is(TaskEventType.FAILED, 'failed' as TaskEventType);
  t.is(TaskEventType.CANCELLED, 'cancelled' as TaskEventType);
  t.is(TaskEventType.RETRIED, 'retried' as TaskEventType);
});
