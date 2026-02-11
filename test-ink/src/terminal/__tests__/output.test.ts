/**
 * Terminal Output Stream Module Tests
 */

import test from 'ava';
import { TerminalOutput, createTerminalOutput, getGlobalOutput } from '../output.js';
import { PassThrough } from 'stream';

test('TerminalOutput can be instantiated', (t) => {
	const output = new TerminalOutput();
	t.true(output instanceof TerminalOutput);
});

test('TerminalOutput write returns this for chaining', (t) => {
	const output = new TerminalOutput();
	const result = output.write('test');
	t.is(result, output);
});

test('TerminalOutput batch returns this for chaining', (t) => {
	const output = new TerminalOutput();
	const result = output.batch(['a', 'b', 'c']);
	t.is(result, output);
});

test('TerminalOutput writeLine adds newline', (t) => {
	const stream = new PassThrough();
	const output = new TerminalOutput({ stream });

	output.writeLine('test');
	t.is(output.getBufferSize(), 5); // 'test\n'
});

test('TerminalOutput clear clears buffer', (t) => {
	const output = new TerminalOutput();
	output.write('test');
	t.is(output.getBufferSize(), 4);

	output.clear();
	t.is(output.getBufferSize(), 0);
});

test('TerminalOutput hasPendingData returns correct state', (t) => {
	const output = new TerminalOutput();
	t.is(output.hasPendingData(), false);

	output.write('test');
	t.is(output.hasPendingData(), true);
});

test('TerminalOutput getBufferSize returns correct size', (t) => {
	const output = new TerminalOutput();
	t.is(output.getBufferSize(), 0);

	output.write('hello');
	t.is(output.getBufferSize(), 5);

	output.write(' world');
	t.is(output.getBufferSize(), 11);
});

test('TerminalOutput isWritable returns boolean', (t) => {
	const output = new TerminalOutput();
	t.is(typeof output.isWritable(), 'boolean');
});

test('TerminalOutput getStream returns the stream', (t) => {
	const stream = new PassThrough();
	const output = new TerminalOutput({ stream });

	t.is(output.getStream(), stream);
});

test('TerminalOutput emits write event', (t) => {
	const output = new TerminalOutput();
	let eventEmitted = false;

	output.on('write', (data) => {
		eventEmitted = true;
		t.is(data, 'test');
	});

	output.write('test');
	t.is(eventEmitted, true);
});

test('TerminalOutput emits clear event', (t) => {
	const output = new TerminalOutput();
	let eventEmitted = false;

	output.on('clear', (size) => {
		eventEmitted = true;
		t.is(size, 4);
	});

	output.write('test');
	output.clear();
	t.is(eventEmitted, true);
});

test('createTerminalOutput creates TerminalOutput instance', (t) => {
	const output = createTerminalOutput();
	t.true(output instanceof TerminalOutput);
});

test('getGlobalOutput returns singleton', (t) => {
	const output1 = getGlobalOutput();
	const output2 = getGlobalOutput();

	t.is(output1, output2);
});

test('TerminalOutput respects bufferSize option', (t) => {
	const stream = new PassThrough();
	const output = new TerminalOutput({
		stream,
		bufferSize: 10,
	});

	// Write less than buffer size
	output.write('12345');
	t.is(output.getBufferSize(), 5);
});

test('TerminalOutput flush clears buffer', async (t) => {
	const stream = new PassThrough();
	const output = new TerminalOutput({ stream });

	output.write('test');
	t.is(output.getBufferSize(), 4);

	await output.flush();
	t.is(output.getBufferSize(), 0);
});

test('TerminalOutput getTotalBytesWritten returns cumulative count', async (t) => {
	const stream = new PassThrough();
	const output = new TerminalOutput({ stream });

	t.is(output.getTotalBytesWritten(), 0);

	output.write('test');
	await output.flush();

	t.is(output.getTotalBytesWritten(), 4);
});

test('TerminalOutput stopFlushInterval stops the interval', (t) => {
	const output = new TerminalOutput({
		flushInterval: 100,
	});

	// Should not throw
	output.stopFlushInterval();
	t.pass();
});

test('TerminalOutput destroy cleans up', (t) => {
	const output = new TerminalOutput();

	// Should not throw
	output.destroy();
	t.pass();
});
