/**
 * Unit tests for the Primitives module
 */

import test from 'ava';
import {
	drawText,
	drawAlignedText,
	drawLine,
	drawVLine,
	drawBox,
	drawDoubleBox,
	drawRoundedBox,
	drawFill,
	drawClear,
	drawProgressBar,
	drawShadow,
	drawBoxWithShadow,
	drawGrid,
	drawScrollBar,
	drawCheckbox,
	drawRadioButton,
	drawSeparator,
} from '../primitives.js';
import {createRenderContext} from '../context.js';
import {createBuffer} from '../buffer.js';

test('drawText draws text at position', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawText(ctx, 'Hello', 10, 5);

	t.is(buffer.getCell(10, 5)?.char, 'H');
	t.is(buffer.getCell(14, 5)?.char, 'o');
});

test('drawText applies options', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawText(ctx, 'Hello', 10, 5, {fg: 'red', bg: 'blue', styles: {bold: true}});

	const cell = buffer.getCell(10, 5);
	t.is(cell?.fg, 'red');
	t.is(cell?.bg, 'blue');
	t.true(cell?.styles.bold);
});

test('drawAlignedText aligns text left', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawAlignedText(ctx, 'Hi', 10, 5, 10, 'left');

	t.is(buffer.getCell(10, 5)?.char, 'H');
});

test('drawAlignedText aligns text center', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawAlignedText(ctx, 'Hi', 10, 5, 10, 'center');

	// "Hi" centered in width 10 starting at 10 = positions 13, 14
	t.is(buffer.getCell(13, 5)?.char, 'H');
	t.is(buffer.getCell(14, 5)?.char, 'i');
});

test('drawAlignedText aligns text right', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawAlignedText(ctx, 'Hi', 10, 5, 10, 'right');

	// "Hi" right-aligned in width 10 starting at 10 = positions 18, 19
	t.is(buffer.getCell(18, 5)?.char, 'H');
	t.is(buffer.getCell(19, 5)?.char, 'i');
});

test('drawAlignedText truncates long text', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawAlignedText(ctx, 'Hello World', 10, 5, 5, 'left');

	// Should be truncated with ellipsis
	t.is(buffer.getCell(10, 5)?.char, 'H');
	t.is(buffer.getCell(13, 5)?.char, 'l');
	t.is(buffer.getCell(14, 5)?.char, '…');
});

test('drawLine draws horizontal line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawLine(ctx, 10, 5, 5, '-');

	for (let i = 0; i < 5; i++) {
		t.is(buffer.getCell(10 + i, 5)?.char, '-');
	}
});

test('drawLine applies color', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawLine(ctx, 10, 5, 3, '-', 'red');

	t.is(buffer.getCell(10, 5)?.fg, 'red');
});

test('drawVLine draws vertical line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawVLine(ctx, 10, 5, 5, '|', 'blue');

	for (let i = 0; i < 5; i++) {
		t.is(buffer.getCell(10, 5 + i)?.char, '|');
		t.is(buffer.getCell(10, 5 + i)?.fg, 'blue');
	}
});

test('drawBox draws box outline', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawBox(ctx, {x: 0, y: 0, width: 5, height: 5}, undefined, 'red');

	// Check corners
	t.is(buffer.getCell(0, 0)?.char, '┌');
	t.is(buffer.getCell(4, 0)?.char, '┐');
	t.is(buffer.getCell(0, 4)?.char, '└');
	t.is(buffer.getCell(4, 4)?.char, '┘');

	// Check color applied
	t.is(buffer.getCell(0, 0)?.fg, 'red');
});

test('drawDoubleBox draws double-line box', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawDoubleBox(ctx, {x: 0, y: 0, width: 5, height: 5});

	t.is(buffer.getCell(0, 0)?.char, '╔');
	t.is(buffer.getCell(4, 4)?.char, '╝');
});

test('drawRoundedBox draws rounded box', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawRoundedBox(ctx, {x: 0, y: 0, width: 5, height: 5});

	t.is(buffer.getCell(0, 0)?.char, '╭');
	t.is(buffer.getCell(4, 4)?.char, '╯');
});

test('drawFill fills rectangle', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawFill(ctx, {x: 0, y: 0, width: 3, height: 3}, 'X', 'red', 'blue');

	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			const cell = buffer.getCell(x, y);
			t.is(cell?.char, 'X');
			t.is(cell?.fg, 'red');
			t.is(cell?.bg, 'blue');
		}
	}
});

test('drawClear clears rectangle', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	// Fill first
	drawFill(ctx, {x: 0, y: 0, width: 3, height: 3}, 'X');

	// Then clear
	drawClear(ctx, {x: 0, y: 0, width: 3, height: 3});

	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			t.is(buffer.getCell(x, y), undefined);
		}
	}
});

test('drawProgressBar draws progress bar', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawProgressBar(ctx, 0, 0, {
		width: 10,
		progress: 0.5,
		fillChar: '█',
		emptyChar: '░',
		showPercentage: false,
	});

	// Check first 5 are filled
	for (let i = 0; i < 5; i++) {
		t.is(buffer.getCell(i, 0)?.char, '█');
	}

	// Check last 5 are empty
	for (let i = 5; i < 10; i++) {
		t.is(buffer.getCell(i, 0)?.char, '░');
	}
});

test('drawProgressBar shows percentage on right', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawProgressBar(ctx, 0, 0, {
		width: 15,
		progress: 0.5,
		showPercentage: true,
		percentagePosition: 'right',
	});

	// Should have " 50%" at the end
	t.is(buffer.getCell(11, 0)?.char, ' ');
	t.is(buffer.getCell(12, 0)?.char, '5');
	t.is(buffer.getCell(13, 0)?.char, '0');
	t.is(buffer.getCell(14, 0)?.char, '%');
});

test('drawShadow draws shadow effect', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawShadow(ctx, {x: 0, y: 0, width: 5, height: 5}, {color: 'gray'});

	// Check right shadow
	for (let y = 0; y < 5; y++) {
		t.is(buffer.getCell(5, y + 1)?.char, '░');
	}

	// Check bottom shadow
	for (let x = 0; x < 5; x++) {
		t.is(buffer.getCell(x + 1, 5)?.char, '░');
	}
});

test('drawBoxWithShadow draws box and shadow', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawBoxWithShadow(ctx, {x: 0, y: 0, width: 5, height: 5});

	// Check box is drawn
	t.is(buffer.getCell(0, 0)?.char, '┌');

	// Check shadow is drawn
	t.is(buffer.getCell(5, 1)?.char, '░');
});

test('drawGrid draws table grid', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawGrid(ctx, 0, 0, [5, 5], 3, 'red');

	// Check corners
	t.is(buffer.getCell(0, 0)?.char, '┌');
	t.is(buffer.getCell(6, 0)?.char, '┬');
	t.is(buffer.getCell(12, 0)?.char, '┐');
});

test('drawScrollBar draws scrollbar', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawScrollBar(ctx, 0, 0, 10, 0.2, 0.3, 'white', 'gray');

	// Check track is drawn
	t.is(buffer.getCell(0, 0)?.char, '│');

	// Check thumb is drawn (should be around position 2-4)
	let thumbFound = false;
	for (let y = 0; y < 10; y++) {
		if (buffer.getCell(0, y)?.char === '┃') {
			thumbFound = true;
			break;
		}
	}
	t.true(thumbFound);
});

test('drawCheckbox draws unchecked box', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawCheckbox(ctx, 0, 0, false, 'Option', 'red');

	t.is(buffer.getCell(0, 0)?.char, '☐');
	t.is(buffer.getCell(2, 0)?.char, 'O');
});

test('drawCheckbox draws checked box', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawCheckbox(ctx, 0, 0, true);

	t.is(buffer.getCell(0, 0)?.char, '☑');
});

test('drawRadioButton draws unselected', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawRadioButton(ctx, 0, 0, false, 'Option', 'red');

	t.is(buffer.getCell(0, 0)?.char, '○');
	t.is(buffer.getCell(2, 0)?.char, 'O');
});

test('drawRadioButton draws selected', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawRadioButton(ctx, 0, 0, true);

	t.is(buffer.getCell(0, 0)?.char, '◉');
});

test('drawSeparator draws simple line', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawSeparator(ctx, 0, 0, 10, undefined, 'red');

	for (let i = 0; i < 10; i++) {
		t.is(buffer.getCell(i, 0)?.char, '─');
		t.is(buffer.getCell(i, 0)?.fg, 'red');
	}
});

test('drawSeparator draws line with label', t => {
	const buffer = createBuffer(80, 24);
	const ctx = createRenderContext(buffer);

	drawSeparator(ctx, 0, 0, 20, 'Title', 'red');

	// Should have "Title" in the middle
	let foundTitle = false;
	for (let i = 0; i < 20; i++) {
		if (buffer.getCell(i, 0)?.char === 'T') {
			foundTitle = true;
			break;
		}
	}
	t.true(foundTitle);
});
