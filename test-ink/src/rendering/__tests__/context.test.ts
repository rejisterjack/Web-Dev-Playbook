/**
 * Unit tests for the RenderContext module
 */

import test from 'ava';
import {
	createRenderContext,
	DEFAULT_BOX_CHARS,
	DOUBLE_BOX_CHARS,
	ROUNDED_BOX_CHARS,
} from '../context.js';
import {createBuffer} from '../buffer.js';
import {createCell} from '../cell.js';

test('createRenderContext creates context with buffer', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	t.is(ctx.buffer, buffer);
});

test('setFg and get fg work correctly', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setFg('red');
	t.is(ctx.fg, 'red');

	ctx.setFg({rgb: [255, 0, 0]});
	t.deepEqual(ctx.fg, {rgb: [255, 0, 0]});
});

test('setBg and get bg work correctly', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setBg('blue');
	t.is(ctx.bg, 'blue');
});

test('setColors sets both fg and bg', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setColors('red', 'blue');
	t.is(ctx.fg, 'red');
	t.is(ctx.bg, 'blue');
});

test('setStyles replaces all styles', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setStyles({bold: true, italic: true});
	t.deepEqual(ctx.styles, {bold: true, italic: true});

	ctx.setStyles({underline: true});
	t.deepEqual(ctx.styles, {underline: true});
});

test('addStyles merges with existing styles', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setStyles({bold: true});
	ctx.addStyles({italic: true});

	t.deepEqual(ctx.styles, {bold: true, italic: true});
});

test('removeStyles removes specific styles', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setStyles({bold: true, italic: true, underline: true});
	ctx.removeStyles({bold: true, italic: false});

	t.deepEqual(ctx.styles, {italic: true, underline: true});
});

test('resetStyles resets to defaults', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setColors('red', 'blue');
	ctx.setStyles({bold: true});
	ctx.resetStyles();

	t.is(ctx.fg, 'default');
	t.is(ctx.bg, 'default');
	t.deepEqual(ctx.styles, {});
});

test('moveTo sets cursor position', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.moveTo(10, 5);
	t.is(ctx.cursorX, 10);
	t.is(ctx.cursorY, 5);
});

test('moveTo clamps to buffer bounds', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.moveTo(100, 50);
	t.is(ctx.cursorX, 79);
	t.is(ctx.cursorY, 23);

	ctx.moveTo(-10, -5);
	t.is(ctx.cursorX, 0);
	t.is(ctx.cursorY, 0);
});

test('moveBy moves cursor relative to current position', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.moveTo(10, 5);
	ctx.moveBy(5, 3);

	t.is(ctx.cursorX, 15);
	t.is(ctx.cursorY, 8);
});

test('drawChar draws a character at position', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawChar('A', 10, 5);

	t.is(buffer.getCell(10, 5)?.char, 'A');
});

test('drawChar uses cursor position when not specified', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.moveTo(10, 5);
	ctx.drawChar('A');

	t.is(buffer.getCell(10, 5)?.char, 'A');
	t.is(ctx.cursorX, 11); // Cursor advanced
});

test('drawChar respects clipping', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.pushClip({x: 0, y: 0, width: 5, height: 5});
	ctx.drawChar('A', 10, 5);

	t.is(buffer.getCell(10, 5), undefined);
});

test('drawText draws multiple characters', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawText('Hello', 10, 5);

	t.is(buffer.getCell(10, 5)?.char, 'H');
	t.is(buffer.getCell(14, 5)?.char, 'o');
});

test('drawHLine draws horizontal line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawHLine(10, 5, 5, '-');

	for (let i = 0; i < 5; i++) {
		t.is(buffer.getCell(10 + i, 5)?.char, '-');
	}
});

test('drawVLine draws vertical line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawVLine(10, 5, 5, '|');

	for (let i = 0; i < 5; i++) {
		t.is(buffer.getCell(10, 5 + i)?.char, '|');
	}
});

test('drawLine draws diagonal line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawLine(0, 0, 4, 4);

	for (let i = 0; i <= 4; i++) {
		t.is(buffer.getCell(i, i)?.char, '╲');
	}
});

test('drawRect draws rectangle outline', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawRect({x: 0, y: 0, width: 5, height: 5}, DEFAULT_BOX_CHARS);

	// Check corners
	t.is(buffer.getCell(0, 0)?.char, '┌');
	t.is(buffer.getCell(4, 0)?.char, '┐');
	t.is(buffer.getCell(0, 4)?.char, '└');
	t.is(buffer.getCell(4, 4)?.char, '┘');
});

test('drawRect with double box chars', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawRect({x: 0, y: 0, width: 5, height: 5}, DOUBLE_BOX_CHARS);

	t.is(buffer.getCell(0, 0)?.char, '╔');
	t.is(buffer.getCell(4, 4)?.char, '╝');
});

test('drawRect with rounded box chars', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.drawRect({x: 0, y: 0, width: 5, height: 5}, ROUNDED_BOX_CHARS);

	t.is(buffer.getCell(0, 0)?.char, '╭');
	t.is(buffer.getCell(4, 4)?.char, '╯');
});

test('fillRect fills rectangle', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.fillRect({x: 0, y: 0, width: 3, height: 3}, 'X');

	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			t.is(buffer.getCell(x, y)?.char, 'X');
		}
	}
});

test('clearRect clears rectangle', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.fillRect({x: 0, y: 0, width: 3, height: 3}, 'X');
	ctx.clearRect({x: 0, y: 0, width: 3, height: 3});

	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			t.is(buffer.getCell(x, y), undefined);
		}
	}
});

test('pushClip and popClip manage clip stack', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.pushClip({x: 0, y: 0, width: 10, height: 10});
	t.not(ctx.clipRegion, null);

	ctx.popClip();
	t.is(ctx.clipRegion, null);
});

test('clip regions are intersected', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.pushClip({x: 0, y: 0, width: 10, height: 10});
	ctx.pushClip({x: 5, y: 5, width: 10, height: 10});

	const clip = ctx.clipRegion;
	t.is(clip?.x, 5);
	t.is(clip?.y, 5);
	t.is(clip?.width, 5);
	t.is(clip?.height, 5);
});

test('isInClip checks if point is in clip region', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.pushClip({x: 5, y: 5, width: 10, height: 10});

	t.true(ctx.isInClip(5, 5));
	t.true(ctx.isInClip(14, 14));
	t.false(ctx.isInClip(4, 5));
	t.false(ctx.isInClip(15, 5));
});

test('save and restore preserve state', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setColors('red', 'blue');
	ctx.setStyles({bold: true});
	ctx.moveTo(10, 5);

	ctx.save();

	ctx.setColors('green', 'yellow');
	ctx.setStyles({italic: true});
	ctx.moveTo(20, 10);

	ctx.restore();

	t.is(ctx.fg, 'red');
	t.is(ctx.bg, 'blue');
	t.deepEqual(ctx.styles, {bold: true});
	t.is(ctx.cursorX, 10);
	t.is(ctx.cursorY, 5);
});

test('getState returns current state', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	ctx.setColors('red', 'blue');
	ctx.setStyles({bold: true});
	ctx.moveTo(10, 5);

	const state = ctx.getState();

	t.is(state.fg, 'red');
	t.is(state.bg, 'blue');
	t.deepEqual(state.styles, {bold: true});
	t.is(state.cursorX, 10);
	t.is(state.cursorY, 5);
});

test('setState restores state', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	const state = {
		fg: 'red' as const,
		bg: 'blue' as const,
		styles: {bold: true},
		cursorX: 10,
		cursorY: 5,
		clipStack: [],
	};

	ctx.setState(state);

	t.is(ctx.fg, 'red');
	t.is(ctx.bg, 'blue');
	t.deepEqual(ctx.styles, {bold: true});
	t.is(ctx.cursorX, 10);
	t.is(ctx.cursorY, 5);
});
