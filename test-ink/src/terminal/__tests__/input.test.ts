/**
 * Terminal Input Stream Module Tests
 */

import test from 'ava';
import { TerminalInput, createTerminalInput, isStdinTTY } from '../input.js';
import { PassThrough } from 'stream';

test('TerminalInput can be instantiated', (t) => {
	const input = new TerminalInput();
	t.true(input instanceof TerminalInput);
});

test('TerminalInput isActive returns false initially', (t) => {
	const input = new TerminalInput();
	t.is(input.isActive(), false);
});

test('TerminalInput start/stop changes active state', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	t.is(input.isActive(), false);

	input.start();
	t.is(input.isActive(), true);

	input.stop();
	t.is(input.isActive(), false);
});

test('TerminalInput emits start event', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });
	let eventEmitted = false;

	input.on('start', () => {
		eventEmitted = true;
	});

	input.start();
	t.is(eventEmitted, true);
});

test('TerminalInput emits stop event', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });
	let eventEmitted = false;

	input.on('stop', () => {
		eventEmitted = true;
	});

	input.start();
	input.stop();
	t.is(eventEmitted, true);
});

test('TerminalInput getStream returns the stream', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream });

	t.is(input.getStream(), stream);
});

test('TerminalInput parses simple key', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	let keyEvent: any;
	input.on('key', (key) => {
		keyEvent = key;
	});

	input.start();
	stream.emit('data', 'a');

	t.truthy(keyEvent);
	t.is(keyEvent.sequence, 'a');
	t.is(keyEvent.name, undefined);
});

test('TerminalInput parses escape key', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	let keyEvent: any;
	input.on('key', (key) => {
		keyEvent = key;
	});

	input.start();
	stream.emit('data', '\u001B');

	t.truthy(keyEvent);
	t.is(keyEvent.sequence, '\u001B');
	t.is(keyEvent.name, 'escape');
});

test('TerminalInput parses cursor keys', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	const events: any[] = [];
	input.on('key', (key) => {
		events.push(key);
	});

	input.start();
	stream.emit('data', '\u001B[A'); // Up
	stream.emit('data', '\u001B[B'); // Down
	stream.emit('data', '\u001B[C'); // Right
	stream.emit('data', '\u001B[D'); // Left

	t.is(events.length, 4);
	t.is(events[0].name, 'up');
	t.is(events[1].name, 'down');
	t.is(events[2].name, 'right');
	t.is(events[3].name, 'left');
});

test('TerminalInput parses function keys', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	const events: any[] = [];
	input.on('key', (key) => {
		events.push(key);
	});

	input.start();
	stream.emit('data', '\u001BOP'); // F1
	stream.emit('data', '\u001BOQ'); // F2

	t.is(events.length, 2);
	t.is(events[0].name, 'f1');
	t.is(events[1].name, 'f2');
});

test('TerminalInput parses focus events', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	const events: any[] = [];
	input.on('focus', (focus) => {
		events.push(focus);
	});

	input.start();
	stream.emit('data', '\u001B[I'); // Focus in
	stream.emit('data', '\u001B[O'); // Focus out

	t.is(events.length, 2);
	t.is(events[0].focused, true);
	t.is(events[1].focused, false);
});

test('TerminalInput emits pause/resume events', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	let pauseEmitted = false;
	let resumeEmitted = false;

	input.on('pause', () => {
		pauseEmitted = true;
	});

	input.on('resume', () => {
		resumeEmitted = true;
	});

	input.pause();
	t.is(pauseEmitted, true);

	input.resume();
	t.is(resumeEmitted, true);
});

test('createTerminalInput creates TerminalInput instance', (t) => {
	const input = createTerminalInput();
	t.true(input instanceof TerminalInput);
});

test('isStdinTTY returns boolean', (t) => {
	t.is(typeof isStdinTTY(), 'boolean');
});

test('TerminalInput destroy cleans up', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({ stream, rawMode: false });

	input.start();

	// Should not throw
	input.destroy();
	t.pass();
});

test('TerminalInput respects encoding option', (t) => {
	const stream = new PassThrough();
	const input = new TerminalInput({
		stream,
		encoding: 'utf8',
		rawMode: false,
	});

	t.is((stream as any).readableEncoding, 'utf8');
});

test('TerminalInput respects autoResume option', (t) => {
	const stream = new PassThrough();
	// Pause the stream initially
	stream.pause();

	const input = new TerminalInput({
		stream,
		autoResume: false,
		rawMode: false,
	});

	input.start();

	// Stream should still be paused
	t.is(stream.isPaused(), true);
});
