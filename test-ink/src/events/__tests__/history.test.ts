/**
 * Event History Tests
 */

import test from 'ava';
import { EventHistory } from '../history.js';
import { MouseAction, createBaseEvent } from '../types.js';

test('EventHistory can be instantiated', (t) => {
	const history = new EventHistory();
	t.true(history instanceof EventHistory);
});

test('EventHistory starts empty', (t) => {
	const history = new EventHistory();
	t.is(history.size(), 0);
	t.true(history.isEmpty());
});

test('EventHistory records events', (t) => {
	const history = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	const entry = history.record(event);

	t.is(history.size(), 1);
	t.is(entry?.event, event);
});

test('EventHistory getRecent returns recent events', (t) => {
	const history = new EventHistory();

	for (let i = 0; i < 5; i++) {
		const event = { ...createBaseEvent('key'), type: 'key' as const, key: String(i), sequence: String(i), ctrl: false, alt: false, shift: false, timestamp: Date.now() };
		history.record(event);
	}

	const recent = history.getRecent(3);
	t.is(recent.length, 3);
});

test('EventHistory getByType filters by type', (t) => {
	const history = new EventHistory();

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	history.record(keyEvent);
	history.record(mouseEvent);

	const keyEvents = history.getByType('key');
	t.is(keyEvents.length, 1);
	t.is(keyEvents[0]?.event.type, 'key');
});

test('EventHistory clear removes all events', (t) => {
	const history = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history.record(event);
	history.clear();

	t.is(history.size(), 0);
	t.true(history.isEmpty());
});

test('EventHistory respects max size', (t) => {
	const history = new EventHistory({ maxSize: 3 });

	for (let i = 0; i < 5; i++) {
		const event = { ...createBaseEvent('key'), type: 'key' as const, key: String(i), sequence: String(i), ctrl: false, alt: false, shift: false, timestamp: Date.now() };
		history.record(event);
	}

	t.is(history.size(), 3);
});

test('EventHistory filterTypes only records matching types', (t) => {
	const history = new EventHistory({ filterTypes: ['key'] });

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	history.record(keyEvent);
	history.record(mouseEvent);

	t.is(history.size(), 1);
	t.is(history.getByType('key').length, 1);
});

test('EventHistory excludeTypes excludes matching types', (t) => {
	const history = new EventHistory({ excludeTypes: ['mouse'] });

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	history.record(keyEvent);
	history.record(mouseEvent);

	t.is(history.size(), 1);
	t.is(history.getByType('key').length, 1);
});

test('EventHistory recording can be stopped and started', (t) => {
	const history = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history.stopRecording();
	history.record(event);
	t.is(history.size(), 0);

	history.startRecording();
	history.record(event);
	t.is(history.size(), 1);
});

test('EventHistory isRecording returns correct state', (t) => {
	const history = new EventHistory();

	t.true(history.isRecording());

	history.stopRecording();
	t.false(history.isRecording());
});

test('EventHistory getStats returns statistics', (t) => {
	const history = new EventHistory();

	for (let i = 0; i < 3; i++) {
		const event = { ...createBaseEvent('key'), type: 'key' as const, key: String(i), sequence: String(i), ctrl: false, alt: false, shift: false, timestamp: Date.now() };
		history.record(event);
	}

	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };
	history.record(mouseEvent);

	const stats = history.getStats();

	t.is(stats.totalEvents, 4);
	t.is(stats.eventTypes['key'], 3);
	t.is(stats.eventTypes['mouse'], 1);
});

test('EventHistory export returns serializable data', (t) => {
	const history = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history.record(event);

	const exported = history.export();

	t.is(exported.entries.length, 1);
	t.is(exported.entries[0]?.event.type, 'key');
});

test('EventHistory import restores data', (t) => {
	const history1 = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history1.record(event);

	const exported = history1.export();

	const history2 = new EventHistory();
	history2.import(exported);

	t.is(history2.size(), 1);
});

test('EventHistory replay executes events', async (t) => {
	const history = new EventHistory();
	const received: string[] = [];

	for (let i = 0; i < 3; i++) {
		const event = { ...createBaseEvent('key'), type: 'key' as const, key: String(i), sequence: String(i), ctrl: false, alt: false, shift: false, timestamp: Date.now() };
		history.record(event);
	}

	await history.replay((event) => {
		received.push((event as any).key);
	});

	t.deepEqual(received, ['0', '1', '2']);
});

test('EventHistory replay can be stopped', async (t) => {
	const history = new EventHistory();
	let count = 0;

	for (let i = 0; i < 10; i++) {
		const event = { ...createBaseEvent('key'), type: 'key' as const, key: String(i), sequence: String(i), ctrl: false, alt: false, shift: false, timestamp: Date.now() };
		history.record(event);
	}

	const replayPromise = history.replay((event) => {
		count++;
		if (count === 3) {
			history.stopReplay();
		}
	}, { delay: 10 });

	await t.throwsAsync(replayPromise);
	t.is(count, 3);
});

test('EventHistory find filters entries', (t) => {
	const history = new EventHistory();

	const event1 = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const event2 = { ...createBaseEvent('key'), type: 'key' as const, key: 'b', sequence: 'b', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history.record(event1);
	history.record(event2);

	const found = history.find((entry) => (entry.event as any).key === 'a');

	t.is(found.length, 1);
	t.is((found[0]?.event as any).key, 'a');
});

test('EventHistory iterator works', (t) => {
	const history = new EventHistory();
	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };

	history.record(event);

	let count = 0;
	for (const entry of history) {
		count++;
		t.is(entry.event.type, 'key');
	}

	t.is(count, 1);
});
