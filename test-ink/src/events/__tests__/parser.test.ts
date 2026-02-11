/**
 * Input Parser Tests
 */

import test from 'ava';
import { InputParser } from '../parser.js';
import { MouseAction, MouseButton } from '../types.js';

test('InputParser can be instantiated', (t) => {
	const parser = new InputParser();
	t.true(parser instanceof InputParser);
});

test('InputParser parses regular characters', (t) => {
	const parser = new InputParser();
	const result = parser.parse('a');

	t.true(result.success);
	t.is(result.events.length, 1);
	t.is(result.events[0]?.type, 'key');
	t.is((result.events[0] as any).key, 'a');
});

test('InputParser parses escape key', (t) => {
	const parser = new InputParser();
	const result = parser.parse('\u001B');

	t.true(result.success);
	t.is(result.events.length, 1);
	t.is((result.events[0] as any).key, 'escape');
});

test('InputParser parses cursor keys', (t) => {
	const parser = new InputParser();

	const up = parser.parse('\u001B[A');
	t.is((up.events[0] as any).key, 'up');

	const down = parser.parse('\u001B[B');
	t.is((down.events[0] as any).key, 'down');

	const right = parser.parse('\u001B[C');
	t.is((right.events[0] as any).key, 'right');

	const left = parser.parse('\u001B[D');
	t.is((left.events[0] as any).key, 'left');
});

test('InputParser parses function keys', (t) => {
	const parser = new InputParser();

	const f1 = parser.parse('\u001BOP');
	t.is((f1.events[0] as any).key, 'f1');

	const f5 = parser.parse('\u001B[15~');
	t.is((f5.events[0] as any).key, 'f5');
});

test('InputParser parses SGR mouse events', (t) => {
	const parser = new InputParser({ mouseSupport: true });

	// SGR format: ESC [ < Cb ; Cx ; Cy M/m
	// Button 0 (left), x=10, y=20, pressed
	const result = parser.parse('\u001B[<0;10;20M');

	t.true(result.success);
	t.is(result.events.length, 1);
	t.is(result.events[0]?.type, 'mouse');

	const mouseEvent = result.events[0] as any;
	t.is(mouseEvent.action, MouseAction.PRESS);
	t.is(mouseEvent.button, MouseButton.LEFT);
	t.is(mouseEvent.x, 10);
	t.is(mouseEvent.y, 20);
});

test('InputParser parses SGR mouse release', (t) => {
	const parser = new InputParser({ mouseSupport: true });

	// SGR format with lowercase 'm' for release
	const result = parser.parse('\u001B[<0;10;20m');

	t.is((result.events[0] as any).action, MouseAction.RELEASE);
});

test('InputParser parses X10 mouse events', (t) => {
	const parser = new InputParser({ mouseSupport: true });

	// X10 format: ESC [ M Cb Cx Cy
	// Each coordinate is char code + 32
	const buttonCode = String.fromCharCode(0 + 32); // left button
	const x = String.fromCharCode(10 + 32); // x=10
	const y = String.fromCharCode(20 + 32); // y=20

	const result = parser.parse(`\u001B[M${buttonCode}${x}${y}`);

	t.true(result.success);
	t.is(result.events[0]?.type, 'mouse');
});

test('InputParser handles bracketed paste', (t) => {
	const parser = new InputParser({ bracketedPaste: true });

	const result = parser.parse('\u001B[200~hello world\u001B[201~');

	t.true(result.success);
	t.is(result.events.length, 1);
	t.is(result.events[0]?.type, 'paste');
	t.is((result.events[0] as any).text, 'hello world');
});

test('InputParser handles focus events', (t) => {
	const parser = new InputParser({ focusEvents: true });

	const focusIn = parser.parse('\u001B[I');
	t.is((focusIn.events[0] as any).focusType, 'gained');

	const focusOut = parser.parse('\u001B[O');
	t.is((focusOut.events[0] as any).focusType, 'lost');
});

test('InputParser handles incomplete sequences', (t) => {
	const parser = new InputParser();

	// Incomplete escape sequence
	const result = parser.parse('\u001B[');

	t.true(result.incomplete);
	t.is(result.events.length, 0);
});

test('InputParser resets state', (t) => {
	const parser = new InputParser();

	parser.parse('\u001B['); // Start incomplete sequence
	parser.reset();

	t.is(parser.getBuffer(), '');
	t.false(parser.isInPasteMode());
});

test('InputParser parses control characters', (t) => {
	const parser = new InputParser();

	const tab = parser.parse('\t');
	t.is((tab.events[0] as any).key, 'tab');

	const enter = parser.parse('\r');
	t.is((enter.events[0] as any).key, 'return');

	const backspace = parser.parse('\x7f');
	t.is((backspace.events[0] as any).key, 'backspace');
});

test('InputParser parses multiple characters at once', (t) => {
	const parser = new InputParser();
	const result = parser.parse('abc');

	t.is(result.events.length, 3);
	t.is((result.events[0] as any).key, 'a');
	t.is((result.events[1] as any).key, 'b');
	t.is((result.events[2] as any).key, 'c');
});
