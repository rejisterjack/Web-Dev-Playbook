/**
 * Unit tests for the DoubleBufferManager module
 */

import test from 'ava';
import {
	DoubleBufferManager,
	createDoubleBufferManager,
} from '../double-buffer.js';
import {createCell} from '../cell.js';

test('DoubleBufferManager creates front and back buffers', t => {
	const manager = new DoubleBufferManager({width: 80, height: 24});

	t.is(manager.getFrontBuffer().getWidth(), 80);
	t.is(manager.getFrontBuffer().getHeight(), 24);
	t.is(manager.getBackBuffer().getWidth(), 80);
	t.is(manager.getBackBuffer().getHeight(), 24);
});

test('swapBuffers swaps front and back buffers', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	// Set content in back buffer
	manager.getBackBuffer().setCell(1, 1, createCell('A'));

	// Swap
	manager.swapBuffers();

	// Front buffer should now have the content
	t.is(manager.getFrontBuffer().getCell(1, 1)?.char, 'A');

	// Back buffer should be cleared
	t.is(manager.getBackBuffer().getCell(1, 1), undefined);
});

test('swapBuffers returns stats', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	const stats1 = manager.swapBuffers();
	t.is(stats1.swapCount, 1);
	t.true(stats1.lastSwapTime > 0);

	const stats2 = manager.swapBuffers();
	t.is(stats2.swapCount, 2);
});

test('hasEverSwapped returns correct value', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	t.false(manager.hasEverSwapped());

	manager.swapBuffers();

	t.true(manager.hasEverSwapped());
});

test('getSwapStats returns current stats', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	const stats = manager.getSwapStats();
	t.is(stats.swapCount, 0);

	manager.swapBuffers();

	const stats2 = manager.getSwapStats();
	t.is(stats2.swapCount, 1);
});

test('getDimensions returns buffer dimensions', t => {
	const manager = new DoubleBufferManager({width: 80, height: 24});

	const dims = manager.getDimensions();
	t.is(dims.width, 80);
	t.is(dims.height, 24);
});

test('resize changes buffer dimensions', t => {
	const manager = new DoubleBufferManager({width: 80, height: 24});

	manager.resize(100, 30);

	const dims = manager.getDimensions();
	t.is(dims.width, 100);
	t.is(dims.height, 30);
});

test('resize throws on invalid dimensions', t => {
	const manager = new DoubleBufferManager({width: 80, height: 24});

	t.throws(() => manager.resize(0, 24));
	t.throws(() => manager.resize(80, 0));
});

test('clearBoth clears both buffers', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	manager.getFrontBuffer().setCell(1, 1, createCell('A'));
	manager.getBackBuffer().setCell(2, 2, createCell('B'));

	manager.clearBoth();

	t.is(manager.getFrontBuffer().getCell(1, 1), undefined);
	t.is(manager.getBackBuffer().getCell(2, 2), undefined);
});

test('reset creates new buffers', t => {
	const manager = new DoubleBufferManager({width: 80, height: 24});

	manager.swapBuffers();
	manager.reset(100, 30);

	t.is(manager.getDimensions().width, 100);
	t.is(manager.getDimensions().height, 30);
	t.false(manager.hasEverSwapped());
	t.is(manager.getSwapStats().swapCount, 0);
});

test('syncBackToFront copies front to back', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	manager.getFrontBuffer().setCell(1, 1, createCell('A'));
	manager.syncBackToFront();

	t.is(manager.getBackBuffer().getCell(1, 1)?.char, 'A');
});

test('isValidPosition checks both buffers', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	t.true(manager.isValidPosition(5, 2));
	t.false(manager.isValidPosition(10, 0));
	t.false(manager.isValidPosition(0, 5));
});

test('getDifferences returns changes between buffers', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	manager.getBackBuffer().setCell(1, 1, createCell('A'));

	const differences = manager.getDifferences();
	t.true(differences.length > 0);
});

test('getChangePercentage returns percentage of changed cells', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	// Initially both are empty, so 0% change
	const percent1 = manager.getChangePercentage();
	t.is(percent1, 0);

	// Add a cell to back buffer
	manager.getBackBuffer().setCell(0, 0, createCell('A'));

	// Should be 2% (1 out of 50 cells)
	const percent2 = manager.getChangePercentage();
	t.is(percent2, 2);
});

test('destroy cleans up resources', t => {
	const manager = new DoubleBufferManager({width: 10, height: 5});

	manager.getFrontBuffer().setCell(1, 1, createCell('A'));
	manager.destroy();

	t.is(manager.getFrontBuffer().getCellCount(), 0);
});

test('createDoubleBufferManager factory creates manager', t => {
	const manager = createDoubleBufferManager({width: 80, height: 24});

	t.is(manager.getDimensions().width, 80);
	t.is(manager.getDimensions().height, 24);
});
