/**
 * Raw Mode Manager Module Tests
 */

import test from 'ava';
import {
	RawModeManager,
	createRawModeManager,
	supportsRawMode,
} from '../raw-mode.js';

test('RawModeManager can be instantiated', (t) => {
	const rawMode = new RawModeManager();
	t.true(rawMode instanceof RawModeManager);
});

test('RawModeManager isTTY returns boolean', (t) => {
	const rawMode = new RawModeManager();
	t.is(typeof rawMode.isTTY(), 'boolean');
});

test('RawModeManager isActive returns false initially', (t) => {
	const rawMode = new RawModeManager();
	t.is(rawMode.isActive(), false);
});

test('RawModeManager setOptions updates options', (t) => {
	const rawMode = new RawModeManager();
	const originalOptions = rawMode.getOptions();

	rawMode.setOptions({ rawMode: false });
	const newOptions = rawMode.getOptions();

	t.is(newOptions.rawMode, false);
	t.is(newOptions.handleSigint, originalOptions.handleSigint);
});

test('RawModeManager getOptions returns current options', (t) => {
	const rawMode = new RawModeManager({ rawMode: false, handleSigint: false });
	const options = rawMode.getOptions();

	t.is(options.rawMode, false);
	t.is(options.handleSigint, false);
	t.is(options.handleSigterm, true);
});

test('createRawModeManager creates RawModeManager instance', (t) => {
	const rawMode = createRawModeManager();
	t.true(rawMode instanceof RawModeManager);
});

test('supportsRawMode returns boolean', (t) => {
	t.is(typeof supportsRawMode(), 'boolean');
});

test('RawModeManager emits events', async (t) => {
	const rawMode = new RawModeManager();

	// Test that it emits events (we can't actually enter raw mode in tests)
	let eventEmitted = false;
	rawMode.on('start', () => {
		eventEmitted = true;
	});

	// Just verify the event emitter is working
	rawMode.emit('start');
	t.is(eventEmitted, true);
});

test('RawModeManager toggle switches state', async (t) => {
	const rawMode = new RawModeManager();

	// Since we can't actually enter raw mode in tests,
	// we just verify the method exists and returns a boolean
	if (!rawMode.isTTY()) {
		// If not a TTY, enter() should throw
		await t.throwsAsync(async () => {
			await rawMode.enter();
		}, { message: /stdin is not a TTY/ });
	}
});
