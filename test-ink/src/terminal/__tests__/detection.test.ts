/**
 * Terminal Detection Module Tests
 */

import test from 'ava';
import {
	detectCapabilities,
	isTTY,
	isCI,
	describeCapabilities,
	ColorSupport,
	MouseMode,
} from '../detection.js';

// Save original env
const originalEnv = process.env;

test.beforeEach(() => {
	// Reset env before each test
	process.env = { ...originalEnv };
});

test.after(() => {
	// Restore original env
	process.env = originalEnv;
});

test('detectCapabilities returns terminal capabilities object', (t) => {
	const caps = detectCapabilities();

	t.is(typeof caps, 'object');
	t.is(typeof caps.termType, 'string');
	t.is(typeof caps.colorSupport, 'number');
	t.is(typeof caps.maxColors, 'number');
	t.is(typeof caps.mouseMode, 'number');
	t.is(typeof caps.unicodeSupported, 'boolean');
	t.is(typeof caps.hyperlinksSupported, 'boolean');
	t.is(typeof caps.bracketedPasteSupported, 'boolean');
	t.is(typeof caps.focusEventsSupported, 'boolean');
	t.is(typeof caps.trueColorSupported, 'boolean');
});

test('detectCapabilities detects TrueColor support from COLORTERM', (t) => {
	process.env.COLORTERM = 'truecolor';
	process.env.TERM = 'xterm';

	const caps = detectCapabilities();
	t.is(caps.colorSupport, ColorSupport.TRUECOLOR);
	t.is(caps.trueColorSupported, true);
	t.is(caps.maxColors, 16_777_216);
});

test('detectCapabilities detects 256 color support from TERM', (t) => {
	process.env.COLORTERM = '';
	process.env.TERM = 'xterm-256color';

	const caps = detectCapabilities();
	t.is(caps.colorSupport, ColorSupport.TRUECOLOR);
	t.is(caps.maxColors, 16_777_216);
});

test('detectCapabilities respects NO_COLOR', (t) => {
	process.env.NO_COLOR = '1';
	process.env.TERM = 'xterm-256color';

	const caps = detectCapabilities();
	t.is(caps.colorSupport, ColorSupport.NONE);
	t.is(caps.maxColors, 0);
	t.is(caps.trueColorSupported, false);
});

test('detectCapabilities respects FORCE_COLOR', (t) => {
	process.env.FORCE_COLOR = '3';

	const caps = detectCapabilities();
	t.is(caps.colorSupport, ColorSupport.TRUECOLOR);
});

test('detectCapabilities detects mouse support', (t) => {
	process.env.TERM = 'xterm-256color';
	process.env.TERM_PROGRAM = 'iTerm.app';

	const caps = detectCapabilities();
	t.is(caps.mouseMode, MouseMode.SGR);
});

test('detectCapabilities detects Unicode support', (t) => {
	process.env.LANG = 'en_US.UTF-8';

	const caps = detectCapabilities();
	t.is(caps.unicodeSupported, true);
});

test('isTTY returns boolean', (t) => {
	const result = isTTY();
	t.is(typeof result, 'boolean');
});

test('isCI returns boolean', (t) => {
	const result = isCI();
	t.is(typeof result, 'boolean');
});

test('isCI returns true when CI environment variable is set', (t) => {
	process.env.CI = 'true';
	t.is(isCI(), true);
});

test('describeCapabilities returns formatted string', (t) => {
	const caps = detectCapabilities();
	const description = describeCapabilities(caps);

	t.is(typeof description, 'string');
	t.true(description.includes('Terminal Type:'));
	t.true(description.includes('Color Support:'));
	t.true(description.includes('Mouse Mode:'));
});

test('ColorSupport enum has correct values', (t) => {
	t.is(ColorSupport.NONE, 0);
	t.is(ColorSupport.BASIC, 1);
	t.is(ColorSupport.ANSI256, 2);
	t.is(ColorSupport.TRUECOLOR, 3);
});

test('MouseMode enum has correct values', (t) => {
	t.is(MouseMode.NONE, 0);
	t.is(MouseMode.X10, 1);
	t.is(MouseMode.UTF8, 2);
	t.is(MouseMode.SGR, 3);
});
