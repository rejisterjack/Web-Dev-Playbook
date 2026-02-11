/**
 * Unit tests for the Cell module
 */

import test from 'ava';
import {
	Cell,
	Color,
	CellStyles,
	createCell,
	cloneCell,
	mergeCells,
	cellsEqual,
	colorsEqual,
	stylesEqual,
	resetCell,
	copyCell,
	DEFAULT_CELL,
} from '../cell.js';

test('createCell creates a cell with default values', t => {
	const cell = createCell();

	t.is(cell.char, ' ');
	t.is(cell.fg, 'default');
	t.is(cell.bg, 'default');
	t.deepEqual(cell.styles, {});
	t.is(cell.width, 1);
});

test('createCell creates a cell with specified values', t => {
	const cell = createCell('A', 'red', 'blue', {bold: true});

	t.is(cell.char, 'A');
	t.is(cell.fg, 'red');
	t.is(cell.bg, 'blue');
	t.deepEqual(cell.styles, {bold: true});
	t.is(cell.width, 1);
});

test('createCell calculates width for wide characters', t => {
	const cell = createCell('中'); // CJK character
	t.is(cell.width, 2);
});

test('cloneCell creates a deep copy', t => {
	const original = createCell(
		'A',
		{rgb: [255, 0, 0]},
		{index: 5},
		{bold: true},
	);
	const cloned = cloneCell(original);

	// Values should be equal
	t.is(cloned.char, original.char);
	t.deepEqual(cloned.fg, original.fg);
	t.deepEqual(cloned.bg, original.bg);
	t.deepEqual(cloned.styles, original.styles);

	// But references should be different for objects
	cloned.styles.bold = false;
	t.is(original.styles.bold, true);
});

test('cellsEqual returns true for identical cells', t => {
	const cell1 = createCell('A', 'red', 'blue', {bold: true});
	const cell2 = createCell('A', 'red', 'blue', {bold: true});

	t.true(cellsEqual(cell1, cell2));
});

test('cellsEqual returns false for different cells', t => {
	const cell1 = createCell('A', 'red', 'blue', {bold: true});
	const cell2 = createCell('B', 'red', 'blue', {bold: true});

	t.false(cellsEqual(cell1, cell2));
});

test('cellsEqual handles undefined cells', t => {
	const cell = createCell();

	t.false(cellsEqual(undefined, cell));
	t.false(cellsEqual(cell, undefined));
	t.true(cellsEqual(undefined, undefined));
});

test('colorsEqual compares named colors', t => {
	t.true(colorsEqual('red', 'red'));
	t.false(colorsEqual('red', 'blue'));
});

test('colorsEqual compares RGB colors', t => {
	t.true(colorsEqual({rgb: [255, 0, 0]}, {rgb: [255, 0, 0]}));
	t.false(colorsEqual({rgb: [255, 0, 0]}, {rgb: [0, 255, 0]}));
});

test('colorsEqual compares indexed colors', t => {
	t.true(colorsEqual({index: 5}, {index: 5}));
	t.false(colorsEqual({index: 5}, {index: 10}));
});

test('stylesEqual compares style objects', t => {
	t.true(stylesEqual({bold: true}, {bold: true}));
	t.false(stylesEqual({bold: true}, {bold: false}));
	t.false(stylesEqual({bold: true}, {italic: true}));
});

test('mergeCells inherits from parent', t => {
	const parent = createCell('A', 'red', 'blue', {bold: true, italic: true});
	const child = createCell('B', 'default', 'default', {underline: true});

	const merged = mergeCells(parent, child);

	t.is(merged.char, 'B'); // Child's char
	t.is(merged.fg, 'red'); // Inherited from parent
	t.is(merged.bg, 'blue'); // Inherited from parent
	t.true(merged.styles.bold); // Inherited from parent
	t.true(merged.styles.italic); // Inherited from parent
	t.true(merged.styles.underline); // From child
});

test('resetCell resets to defaults', t => {
	const cell = createCell('A', 'red', 'blue', {bold: true});
	resetCell(cell);

	t.is(cell.char, ' ');
	t.is(cell.fg, 'default');
	t.is(cell.bg, 'default');
	t.deepEqual(cell.styles, {});
	t.is(cell.width, 1);
});

test('copyCell copies values from source to target', t => {
	const source = createCell('A', 'red', 'blue', {bold: true});
	const target = createCell();

	copyCell(target, source);

	t.is(target.char, 'A');
	t.is(target.fg, 'red');
	t.is(target.bg, 'blue');
	t.deepEqual(target.styles, {bold: true});
});

test('DEFAULT_CELL is immutable', t => {
	t.is(DEFAULT_CELL.char, ' ');
	t.is(DEFAULT_CELL.fg, 'default');
	t.is(DEFAULT_CELL.bg, 'default');
	t.deepEqual(DEFAULT_CELL.styles, {});
	t.is(DEFAULT_CELL.width, 1);
});
