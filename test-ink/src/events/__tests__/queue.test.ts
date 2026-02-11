/**
 * Event Queue Tests
 */

import test from 'ava';
import { EventQueue } from '../queue.js';
import { EventPriority, MouseAction, createBaseEvent } from '../types.js';

test('EventQueue can be instantiated', (t) => {
	const queue = new EventQueue();
	t.true(queue instanceof EventQueue);
});

test('EventQueue starts empty', (t) => {
	const queue = new EventQueue();
	t.is(queue.size(), 0);
	t.true(queue.isEmpty());
});

test('EventQueue can enqueue events', (t) => {
	const queue = new EventQueue();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event);
	t.is(queue.size(), 1);
	t.false(queue.isEmpty());
});

test('EventQueue can dequeue events', (t) => {
	const queue = new EventQueue();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event);
	const dequeued = queue.dequeue();

	t.deepEqual(dequeued, event);
	t.is(queue.size(), 0);
});

test('EventQueue dequeue returns undefined when empty', (t) => {
	const queue = new EventQueue();
	const dequeued = queue.dequeue();
	t.is(dequeued, undefined);
});

test('EventQueue peek returns next event without removing', (t) => {
	const queue = new EventQueue();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event);
	const peeked = queue.peek();

	t.deepEqual(peeked, event);
	t.is(queue.size(), 1);
});

test('EventQueue peek returns undefined when empty', (t) => {
	const queue = new EventQueue();
	t.is(queue.peek(), undefined);
});

test('EventQueue respects priority order', (t) => {
	const queue = new EventQueue();

	const lowEvent = { ...createBaseEvent('custom', EventPriority.LOW), type: 'custom' as const, name: 'low', data: null, timestamp: Date.now() };
	const highEvent = { ...createBaseEvent('custom', EventPriority.HIGH), type: 'custom' as const, name: 'high', data: null, timestamp: Date.now() };
	const normalEvent = { ...createBaseEvent('custom', EventPriority.NORMAL), type: 'custom' as const, name: 'normal', data: null, timestamp: Date.now() };

	queue.enqueue(lowEvent, EventPriority.LOW);
	queue.enqueue(highEvent, EventPriority.HIGH);
	queue.enqueue(normalEvent, EventPriority.NORMAL);

	const first = queue.dequeue() as any;
	const second = queue.dequeue() as any;
	const third = queue.dequeue() as any;

	t.is(first?.name, 'high');
	t.is(second?.name, 'normal');
	t.is(third?.name, 'low');
});

test('EventQueue can clear all events', (t) => {
	const queue = new EventQueue();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event);
	queue.enqueue(event);
	queue.clear();

	t.is(queue.size(), 0);
	t.true(queue.isEmpty());
});

test('EventQueue can remove events matching predicate', (t) => {
	const queue = new EventQueue();
	const event1 = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const event2 = { ...createBaseEvent('key'), type: 'key' as const, key: 'b', sequence: 'b', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event1);
	queue.enqueue(event2);

	const removed = queue.removeWhere((e) => (e as any).key === 'a');

	t.is(removed, 1);
	t.is(queue.size(), 1);
	t.is((queue.peek() as any).key, 'b');
});

test('EventQueue findByType returns events of specific type', (t) => {
	const queue = new EventQueue();
	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	queue.enqueue(keyEvent);
	queue.enqueue(mouseEvent);

	const keyEvents = queue.findByType('key');

	t.is(keyEvents.length, 1);
	t.is(keyEvents[0]?.type, 'key');
});

test('EventQueue batchEnqueue adds multiple events', (t) => {
	const queue = new EventQueue();
	const events = [
		{ ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() },
		{ ...createBaseEvent('key'), type: 'key' as const, key: 'b', sequence: 'b', ctrl: false, alt: false, shift: false, timestamp: Date.now() },
	];

	const added = queue.batchEnqueue(events);

	t.is(added, 2);
	t.is(queue.size(), 2);
});

test('EventQueue respects max size', (t) => {
	const queue = new EventQueue({ maxSize: 2, dropLowPriorityOnOverflow: true });
	const event = { ...createBaseEvent('custom', EventPriority.LOW), type: 'custom' as const, name: 'test', data: null, timestamp: Date.now() };

	queue.enqueue(event, EventPriority.LOW);
	queue.enqueue(event, EventPriority.LOW);
	const result = queue.enqueue(event, EventPriority.LOW);

	t.false(result);
	t.is(queue.size(), 2);
});

test('EventQueue getStats returns statistics', (t) => {
	const queue = new EventQueue();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	queue.enqueue(event);
	queue.dequeue();

	const stats = queue.getStats();

	t.is(stats.enqueued, 1);
	t.is(stats.dequeued, 1);
});
