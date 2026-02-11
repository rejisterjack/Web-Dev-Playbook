/**
 * Event Emitter Tests
 */

import test from 'ava';
import { EventEmitter } from '../emitter.js';
import { MouseAction, createBaseEvent } from '../types.js';

test('EventEmitter can be instantiated', (t) => {
	const emitter = new EventEmitter();
	t.true(emitter instanceof EventEmitter);
});

test('EventEmitter can register and emit events', (t) => {
	const emitter = new EventEmitter();
	let received = false;

	emitter.on('key', () => {
		received = true;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	emitter.emit(event);

	t.true(received);
});

test('EventEmitter passes event to listener', (t) => {
	const emitter = new EventEmitter();
	let receivedEvent: any;

	emitter.on('key', (event) => {
		receivedEvent = event;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	emitter.emit(event);

	t.is(receivedEvent?.key, 'a');
});

test('EventEmitter once listener only fires once', (t) => {
	const emitter = new EventEmitter();
	let count = 0;

	emitter.once('key', () => {
		count++;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	emitter.emit(event);
	emitter.emit(event);

	t.is(count, 1);
});

test('EventEmitter off removes listener', (t) => {
	const emitter = new EventEmitter();
	let count = 0;

	const listener = () => {
		count++;
	};

	emitter.on('key', listener);
	emitter.off('key', listener);

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	emitter.emit(event);

	t.is(count, 0);
});

test('EventEmitter wildcard listener receives all events', (t) => {
	const emitter = new EventEmitter();
	const received: string[] = [];

	emitter.on('*', (event) => {
		received.push(event.type);
	});

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	emitter.emit(keyEvent);
	emitter.emit(mouseEvent);

	t.deepEqual(received, ['key', 'mouse']);
});

test('EventEmitter listenerCount returns correct count', (t) => {
	const emitter = new EventEmitter();

	t.is(emitter.listenerCount('key'), 0);

	const unsubscribe = emitter.on('key', () => {});
	t.is(emitter.listenerCount('key'), 1);

	unsubscribe();
	t.is(emitter.listenerCount('key'), 0);
});

test('EventEmitter hasListeners returns correct state', (t) => {
	const emitter = new EventEmitter();

	t.false(emitter.hasListeners('key'));

	emitter.on('key', () => {});
	t.true(emitter.hasListeners('key'));
});

test('EventEmitter removeAllListeners clears all listeners', (t) => {
	const emitter = new EventEmitter();
	let count = 0;

	emitter.on('key', () => { count++; });
	emitter.on('mouse', () => { count++; });

	emitter.removeAllListeners();

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	emitter.emit(keyEvent);
	emitter.emit(mouseEvent);

	t.is(count, 0);
});

test('EventEmitter emit returns false when propagation stopped', (t) => {
	const emitter = new EventEmitter();

	emitter.on('key', (event) => {
		event.propagationStopped = true;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const result = emitter.emit(event);

	t.false(result);
});

test('EventEmitter emitAsync works with async listeners', async (t) => {
	const emitter = new EventEmitter();
	let received = false;

	emitter.on('key', async () => {
		await Promise.resolve();
		received = true;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	await emitter.emitAsync(event);

	t.true(received);
});

test('EventEmitter destroyed emitter throws on use', (t) => {
	const emitter = new EventEmitter();
	emitter.destroy();

	t.throws(() => emitter.on('key', () => {}));
	t.true(emitter.isDestroyed());
});

test('EventEmitter eventTypes returns all types with listeners', (t) => {
	const emitter = new EventEmitter();

	emitter.on('key', () => {});
	emitter.on('mouse', () => {});

	const types = emitter.eventTypes();

	t.true(types.includes('key'));
	t.true(types.includes('mouse'));
});
