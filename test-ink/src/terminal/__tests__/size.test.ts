/**
 * Terminal Size Module Tests
 */

import test from 'ava';
import {
	TerminalSizeManager,
	getTerminalSize,
	watchTerminalSize,
	isTerminalSizeAvailable,
	getGlobalSizeManager,
} from '../size.js';

test('TerminalSizeManager can be instantiated', (t) => {
	const sizeManager = new TerminalSizeManager();
	t.true(sizeManager instanceof TerminalSizeManager);
});

test('TerminalSizeManager returns size object', (t) => {
	const sizeManager = new TerminalSizeManager();
	const size = sizeManager.getSize();

	t.is(typeof size, 'object');
	t.is(typeof size.columns, 'number');
	t.is(typeof size.rows, 'number');
	t.true(size.columns > 0);
	t.true(size.rows > 0);
});

test('TerminalSizeManager getPreviousSize returns previous size', (t) => {
	const sizeManager = new TerminalSizeManager();
	const prevSize = sizeManager.getPreviousSize();

	t.is(typeof prevSize, 'object');
	t.is(typeof prevSize.columns, 'number');
	t.is(typeof prevSize.rows, 'number');
});

test('TerminalSizeManager isAvailable returns boolean', (t) => {
	const sizeManager = new TerminalSizeManager();
	t.is(typeof sizeManager.isAvailable(), 'boolean');
});

test('TerminalSizeManager emits start event', (t) => {
	const sizeManager = new TerminalSizeManager();
	let eventEmitted = false;

	sizeManager.on('start', () => {
		eventEmitted = true;
	});

	sizeManager.start();
	t.is(eventEmitted, true);
});

test('TerminalSizeManager emits stop event', (t) => {
	const sizeManager = new TerminalSizeManager();
	let eventEmitted = false;

	sizeManager.on('stop', () => {
		eventEmitted = true;
	});

	sizeManager.stop();
	t.is(eventEmitted, true);
});

test('TerminalSizeManager respects defaultSize option', (t) => {
	const sizeManager = new TerminalSizeManager({
		defaultSize: { columns: 100, rows: 50 },
	});

	const size = sizeManager.getSize();
	t.is(size.columns, 100);
	t.is(size.rows, 50);
});

test('getTerminalSize returns size object', (t) => {
	const size = getTerminalSize();

	t.is(typeof size, 'object');
	t.is(typeof size.columns, 'number');
	t.is(typeof size.rows, 'number');
});

test('isTerminalSizeAvailable returns boolean', (t) => {
	t.is(typeof isTerminalSizeAvailable(), 'boolean');
});

test('getGlobalSizeManager returns singleton', (t) => {
	const manager1 = getGlobalSizeManager();
	const manager2 = getGlobalSizeManager();

	t.is(manager1, manager2);
});

test('watchTerminalSize returns unsubscribe function', (t) => {
	const unsubscribe = watchTerminalSize(() => {});

	t.is(typeof unsubscribe, 'function');

	// Should not throw
	unsubscribe();
	t.pass();
});

test('TerminalSizeManager refresh updates size', (t) => {
	const sizeManager = new TerminalSizeManager();
	const size = sizeManager.refresh();

	t.is(typeof size, 'object');
	t.is(typeof size.columns, 'number');
	t.is(typeof size.rows, 'number');
});

test('TerminalSizeManager destroy cleans up', (t) => {
	const sizeManager = new TerminalSizeManager();

	// Should not throw
	sizeManager.destroy();
	t.pass();
});
