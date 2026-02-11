/**
 * Unit tests for the ScreenBuffer module
 */

import test from 'ava';
import {ScreenBuffer, createBuffer} from '../buffer.js';
import {createCell} from '../cell.js';

test('ScreenBuffer constructor creates buffer with correct dimensions', t => {
	const buffer = new ScreenBuffer(80, 24);

	t.is(buffer.getWidth(), 80);
	t.is(buffer.getHeight(), 24);
	t.is(buffer.getCellCount(), 0);
});

test('ScreenBuffer constructor throws on invalid dimensions', t => {
	t.throws(() => new ScreenBuffer(0, 24));
	t.throws(() => new ScreenBuffer(80, 0));
	t.throws(() => new ScreenBuffer(-1, 24));
});

test('isValidPosition returns correct values', t => {
	const buffer = new ScreenBuffer(80, 24);

	t.true(buffer.isValidPosition(0, 0));
	t.true(buffer.isValidPosition(79, 23));
	t.false(buffer.isValidPosition(80, 0));
	t.false(buffer.isValidPosition(0, 24));
	t.false(buffer.isValidPosition(-1, 0));
});

test('setCell and getCell work correctly', t => {
	const buffer = new ScreenBuffer(80, 24);
	const cell = createCell('A', 'red', 'blue');

	const result = buffer.setCell(10, 5, cell);

	t.true(result);
	t.is(buffer.getCellCount(), 1);

	const retrieved = buffer.getCell(10, 5);
	t.is(retrieved?.char, 'A');
	t.is(retrieved?.fg, 'red');
	t.is(retrieved?.bg, 'blue');
});

test('setCell returns false for invalid position', t => {
	const buffer = new ScreenBuffer(80, 24);
	const cell = createCell('A');

	t.false(buffer.setCell(80, 0, cell));
	t.false(buffer.setCell(0, 24, cell));
});

test('setCell returns false when cell is unchanged', t => {
	const buffer = new ScreenBuffer(80, 24);
	const cell = createCell('A', 'red', 'blue');

	buffer.setCell(10, 5, cell);
	const result = buffer.setCell(10, 5, createCell('A', 'red', 'blue'));

	t.false(result);
});

test('getCell returns undefined for empty cells', t => {
	const buffer = new ScreenBuffer(80, 24);

	t.is(buffer.getCell(10, 5), undefined);
});

test('getCell returns undefined for invalid position', t => {
	const buffer = new ScreenBuffer(80, 24);

	t.is(buffer.getCell(80, 0), undefined);
});

test('getCellOrDefault returns default for empty cells', t => {
	const buffer = new ScreenBuffer(80, 24);

	const cell = buffer.getCellOrDefault(10, 5);
	t.is(cell.char, ' ');
	t.is(cell.fg, 'default');
	t.is(cell.bg, 'default');
});

test('clearCell removes cell', t => {
	const buffer = new ScreenBuffer(80, 24);
	const cell = createCell('A');

	buffer.setCell(10, 5, cell);
	t.is(buffer.getCellCount(), 1);

	const result = buffer.clearCell(10, 5);
	t.true(result);
	t.is(buffer.getCellCount(), 0);
	t.is(buffer.getCell(10, 5), undefined);
});

test('clearCell returns false for empty cell', t => {
	const buffer = new ScreenBuffer(80, 24);

	t.false(buffer.clearCell(10, 5));
});

test('clear removes all cells', t => {
	const buffer = new ScreenBuffer(80, 24);

	buffer.setCell(10, 5, createCell('A'));
	buffer.setCell(20, 10, createCell('B'));
	t.is(buffer.getCellCount(), 2);

	buffer.clear();

	t.is(buffer.getCellCount(), 0);
	t.is(buffer.getCell(10, 5), undefined);
	t.is(buffer.getCell(20, 10), undefined);
});

test('fill fills buffer with cell', t => {
	const buffer = new ScreenBuffer(10, 5);

	buffer.fill('X', 'red', 'blue');

	t.is(buffer.getCellCount(), 50);

	const cell = buffer.getCell(5, 2);
	t.is(cell?.char, 'X');
	t.is(cell?.fg, 'red');
	t.is(cell?.bg, 'blue');
});

test('resize changes buffer dimensions', t => {
	const buffer = new ScreenBuffer(80, 24);
	buffer.setCell(10, 5, createCell('A'));

	buffer.resize(100, 30);

	t.is(buffer.getWidth(), 100);
	t.is(buffer.getHeight(), 30);
});

test('resize preserves content when possible', t => {
	const buffer = new ScreenBuffer(80, 24);
	buffer.setCell(10, 5, createCell('A'));

	buffer.resize(100, 30, true);

	const cell = buffer.getCell(10, 5);
	t.is(cell?.char, 'A');
});

test('resize without preserve clears content', t => {
	const buffer = new ScreenBuffer(80, 24);
	buffer.setCell(10, 5, createCell('A'));

	buffer.resize(100, 30, false);

	t.is(buffer.getCell(10, 5), undefined);
});

test('compare returns differences between buffers', t => {
	const buffer1 = new ScreenBuffer(10, 5);
	const buffer2 = new ScreenBuffer(10, 5);

	buffer1.setCell(1, 1, createCell('A', 'red'));
	buffer2.setCell(1, 1, createCell('B', 'blue'));
	buffer2.setCell(2, 2, createCell('C'));

	const changes = buffer1.compare(buffer2);

	t.is(changes.length, 2);
});

test('compare throws for different dimensions', t => {
	const buffer1 = new ScreenBuffer(80, 24);
	const buffer2 = new ScreenBuffer(100, 30);

	t.throws(() => buffer1.compare(buffer2));
});

test('clone creates independent copy', t => {
	const buffer = new ScreenBuffer(10, 5);
	buffer.setCell(5, 2, createCell('A'));

	const cloned = buffer.clone();

	t.is(cloned.getWidth(), 10);
	t.is(cloned.getHeight(), 5);
	t.is(cloned.getCell(5, 2)?.char, 'A');

	// Modifying clone should not affect original
	cloned.setCell(5, 2, createCell('B'));
	t.is(buffer.getCell(5, 2)?.char, 'A');
});

test('copyFrom copies content from another buffer', t => {
	const source = new ScreenBuffer(10, 5);
	const target = new ScreenBuffer(10, 5);

	source.setCell(2, 2, createCell('A'));
	target.copyFrom(source);

	t.is(target.getCell(2, 2)?.char, 'A');
});

test('getNonEmptyCells iterates only non-empty cells', t => {
	const buffer = new ScreenBuffer(10, 5);
	buffer.setCell(1, 1, createCell('A'));
	buffer.setCell(3, 3, createCell('B'));

	const cells = [...buffer.getNonEmptyCells()];

	t.is(cells.length, 2);
	t.true(cells.some(c => c.x === 1 && c.y === 1 && c.cell.char === 'A'));
	t.true(cells.some(c => c.x === 3 && c.y === 3 && c.cell.char === 'B'));
});

test('iterateCells iterates all cells', t => {
	const buffer = new ScreenBuffer(3, 2);
	buffer.setCell(1, 1, createCell('A'));

	const cells = [...buffer.iterateCells()];

	t.is(cells.length, 6); // 3 * 2
	t.true(cells.some(c => c.x === 1 && c.y === 1 && c.cell?.char === 'A'));
});

test('createBuffer factory creates buffer', t => {
	const buffer = createBuffer(80, 24);

	t.is(buffer.getWidth(), 80);
	t.is(buffer.getHeight(), 24);
});
