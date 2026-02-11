/**
 * Event Dispatcher Tests
 */

import test from 'ava';
import { EventDispatcher, EventPhase } from '../dispatcher.js';
import { MouseAction, createBaseEvent } from '../types.js';

test('EventDispatcher can be instantiated', (t) => {
	const dispatcher = new EventDispatcher();
	t.true(dispatcher instanceof EventDispatcher);
});

test('EventDispatcher can register and dispatch events', (t) => {
	const dispatcher = new EventDispatcher();
	let received = false;

	dispatcher.on('key', () => {
		received = true;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.true(received);
});

test('EventDispatcher passes event and phase to handler', (t) => {
	const dispatcher = new EventDispatcher();
	let receivedEvent: any;
	let receivedPhase: any;

	dispatcher.on('key', (event, phase) => {
		receivedEvent = event;
		receivedPhase = phase;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.is(receivedEvent?.key, 'a');
	t.is(receivedPhase, EventPhase.AT_TARGET);
});

test('EventDispatcher once handler only fires once', (t) => {
	const dispatcher = new EventDispatcher();
	let count = 0;

	dispatcher.once('key', () => {
		count++;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);
	dispatcher.dispatch(event);

	t.is(count, 1);
});

test('EventDispatcher off removes handler', (t) => {
	const dispatcher = new EventDispatcher();
	let count = 0;

	const handler = () => { count++; };

	dispatcher.on('key', handler);
	dispatcher.off('key', handler);

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.is(count, 0);
});

test('EventDispatcher capture phase works', (t) => {
	const dispatcher = new EventDispatcher();
	const phases: EventPhase[] = [];

	dispatcher.capture('key', (_, phase) => {
		phases.push(phase);
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.true(phases.includes(EventPhase.AT_TARGET));
});

test('EventDispatcher handlerCount returns correct count', (t) => {
	const dispatcher = new EventDispatcher();

	t.is(dispatcher.handlerCount('key'), 0);

	const unsubscribe = dispatcher.on('key', () => {});
	t.is(dispatcher.handlerCount('key'), 1);

	unsubscribe();
	t.is(dispatcher.handlerCount('key'), 0);
});

test('EventDispatcher hasHandlers returns correct state', (t) => {
	const dispatcher = new EventDispatcher();

	t.false(dispatcher.hasHandlers('key'));

	dispatcher.on('key', () => {});
	t.true(dispatcher.hasHandlers('key'));
});

test('EventDispatcher removeAllHandlers clears handlers', (t) => {
	const dispatcher = new EventDispatcher();
	let count = 0;

	dispatcher.on('key', () => { count++; });
	dispatcher.on('mouse', () => { count++; });

	dispatcher.removeAllHandlers();

	const keyEvent = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const mouseEvent = { ...createBaseEvent('mouse'), type: 'mouse' as const, action: MouseAction.PRESS, button: 0, x: 1, y: 1, ctrl: false, alt: false, shift: false, sequence: '', timestamp: Date.now() };

	dispatcher.dispatch(keyEvent);
	dispatcher.dispatch(mouseEvent);

	t.is(count, 0);
});

test('EventDispatcher dispatch returns false when propagation stopped', (t) => {
	const dispatcher = new EventDispatcher();

	dispatcher.on('key', (event) => {
		event.propagationStopped = true;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	const result = dispatcher.dispatch(event);

	t.false(result);
});

test('EventDispatcher stopPropagation stops propagation', (t) => {
	const dispatcher = new EventDispatcher();
	let count = 0;

	dispatcher.on('key', (event) => {
		dispatcher.stopPropagation(event);
	});

	dispatcher.on('key', () => {
		count++;
	});

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.is(count, 0);
});

test('EventDispatcher preventDefault prevents default', (t) => {
	const dispatcher = new EventDispatcher();

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.preventDefault(event);

	t.true(event.defaultPrevented);
});

test('EventDispatcher eventTypes returns all types with handlers', (t) => {
	const dispatcher = new EventDispatcher();

	dispatcher.on('key', () => {});
	dispatcher.on('mouse', () => {});

	const types = dispatcher.eventTypes();

	t.true(types.includes('key'));
	t.true(types.includes('mouse'));
});

test('EventDispatcher respects priority', (t) => {
	const dispatcher = new EventDispatcher();
	const order: number[] = [];

	dispatcher.on('key', () => { order.push(1); }, { priority: 1 });
	dispatcher.on('key', () => { order.push(2); }, { priority: 2 });
	dispatcher.on('key', () => { order.push(3); }, { priority: 0 });

	const event = { ...createBaseEvent('key'), type: 'key' as const, key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() };
	dispatcher.dispatch(event);

	t.deepEqual(order, [2, 1, 3]);
});
