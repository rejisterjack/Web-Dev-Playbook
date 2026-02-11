/**
 * Event Types Tests
 */

import test from 'ava';
import {
	EventPriority,
	MouseButton,
	MouseAction,
	FocusType,
	SignalType,
	createBaseEvent,
	isKeyEvent,
	isMouseEvent,
	isResizeEvent,
	isFocusEvent,
	isPasteEvent,
	isSignalEvent,
	isIdleEvent,
	isCustomEvent,
} from '../types.js';

test('EventPriority has correct values', (t) => {
	t.is(EventPriority.HIGH, 0);
	t.is(EventPriority.NORMAL, 1);
	t.is(EventPriority.LOW, 2);
});

test('MouseButton has correct values', (t) => {
	t.is(MouseButton.LEFT, 0);
	t.is(MouseButton.MIDDLE, 1);
	t.is(MouseButton.RIGHT, 2);
	t.is(MouseButton.SCROLL_UP, 4);
	t.is(MouseButton.SCROLL_DOWN, 5);
});

test('MouseAction has correct values', (t) => {
	t.is(MouseAction.PRESS, MouseAction.PRESS);
	t.is(MouseAction.RELEASE, MouseAction.RELEASE);
	t.is(MouseAction.DRAG, MouseAction.DRAG);
	t.is(MouseAction.MOVE, MouseAction.MOVE);
	t.is(MouseAction.SCROLL, MouseAction.SCROLL);
});

test('FocusType has correct values', (t) => {
	t.is(FocusType.GAINED, FocusType.GAINED);
	t.is(FocusType.LOST, FocusType.LOST);
});

test('SignalType has correct values', (t) => {
	t.is(SignalType.SIGWINCH, SignalType.SIGWINCH);
	t.is(SignalType.SIGINT, SignalType.SIGINT);
	t.is(SignalType.SIGTERM, SignalType.SIGTERM);
	t.is(SignalType.SIGHUP, SignalType.SIGHUP);
});

test('createBaseEvent creates event with default priority', (t) => {
	const event = createBaseEvent('test');
	t.is(event.type, 'test');
	t.is(event.priority, EventPriority.NORMAL);
	t.is(event.propagationStopped, false);
	t.is(event.defaultPrevented, false);
});

test('createBaseEvent creates event with custom priority', (t) => {
	const event = createBaseEvent('test', EventPriority.HIGH);
	t.is(event.priority, EventPriority.HIGH);
});

test('isKeyEvent identifies key events', (t) => {
	const keyEvent = { type: 'key' } as const;
	const mouseEvent = { type: 'mouse' } as const;

	t.true(isKeyEvent(keyEvent as any));
	t.false(isKeyEvent(mouseEvent as any));
});

test('isMouseEvent identifies mouse events', (t) => {
	const mouseEvent = { type: 'mouse' } as const;
	const resizeEvent = { type: 'resize' } as const;

	t.true(isMouseEvent(mouseEvent as any));
	t.false(isMouseEvent(resizeEvent as any));
});

test('isResizeEvent identifies resize events', (t) => {
	const resizeEvent = { type: 'resize' } as const;
	const focusEvent = { type: 'focus' } as const;

	t.true(isResizeEvent(resizeEvent as any));
	t.false(isResizeEvent(focusEvent as any));
});

test('isFocusEvent identifies focus events', (t) => {
	const focusEvent = { type: 'focus' } as const;
	const pasteEvent = { type: 'paste' } as const;

	t.true(isFocusEvent(focusEvent as any));
	t.false(isFocusEvent(pasteEvent as any));
});

test('isPasteEvent identifies paste events', (t) => {
	const pasteEvent = { type: 'paste' } as const;
	const signalEvent = { type: 'signal' } as const;

	t.true(isPasteEvent(pasteEvent as any));
	t.false(isPasteEvent(signalEvent as any));
});

test('isSignalEvent identifies signal events', (t) => {
	const signalEvent = { type: 'signal' } as const;
	const idleEvent = { type: 'idle' } as const;

	t.true(isSignalEvent(signalEvent as any));
	t.false(isSignalEvent(idleEvent as any));
});

test('isIdleEvent identifies idle events', (t) => {
	const idleEvent = { type: 'idle' } as const;
	const customEvent = { type: 'custom' } as const;

	t.true(isIdleEvent(idleEvent as any));
	t.false(isIdleEvent(customEvent as any));
});

test('isCustomEvent identifies custom events', (t) => {
	const customEvent = { type: 'custom' } as const;
	const keyEvent = { type: 'key' } as const;

	t.true(isCustomEvent(customEvent as any));
	t.false(isCustomEvent(keyEvent as any));
});
