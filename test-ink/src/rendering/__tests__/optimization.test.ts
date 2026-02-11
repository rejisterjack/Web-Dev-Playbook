/**
 * Unit tests for the Optimization module
 */

import test from 'ava';
import {
	RenderCache,
	DirtyRegionTracker,
	AnsiSequenceBatcher,
	StringBuilder,
	CellPool,
	PerformanceMonitor,
	createRenderCache,
	createDirtyRegionTracker,
	createAnsiSequenceBatcher,
	createStringBuilder,
	createCellPool,
	createPerformanceMonitor,
} from '../optimization.js';

test('RenderCache stores and retrieves content', t => {
	const cache = new RenderCache();

	cache.set('key1', 'content1');
	t.is(cache.get('key1'), 'content1');
});

test('RenderCache returns undefined for missing keys', t => {
	const cache = new RenderCache();

	t.is(cache.get('missing'), undefined);
});

test('RenderCache has checks for key existence', t => {
	const cache = new RenderCache();

	t.false(cache.has('key'));
	cache.set('key', 'content');
	t.true(cache.has('key'));
});

test('RenderCache delete removes entry', t => {
	const cache = new RenderCache();

	cache.set('key', 'content');
	t.true(cache.has('key'));

	cache.delete('key');
	t.false(cache.has('key'));
});

test('RenderCache clear removes all entries', t => {
	const cache = new RenderCache();

	cache.set('key1', 'content1');
	cache.set('key2', 'content2');

	cache.clear();

	t.false(cache.has('key1'));
	t.false(cache.has('key2'));
});

test('RenderCache getStats returns statistics', t => {
	const cache = new RenderCache();

	cache.set('key1', 'content1');
	cache.get('key1'); // hit
	cache.get('key2'); // miss

	const stats = cache.getStats();

	t.is(stats.entries, 1);
	t.is(stats.hits, 1);
	t.is(stats.misses, 1);
	t.is(stats.hitRate, 0.5);
});

test('RenderCache resetStats clears statistics', t => {
	const cache = new RenderCache();

	cache.set('key1', 'content1');
	cache.get('key1');
	cache.resetStats();

	const stats = cache.getStats();
	t.is(stats.hits, 0);
	t.is(stats.misses, 0);
});

test('RenderCache respects maxEntries', t => {
	const cache = new RenderCache({maxEntries: 2});

	cache.set('key1', 'content1');
	cache.set('key2', 'content2');
	cache.set('key3', 'content3'); // Should evict key1

	t.false(cache.has('key1'));
	t.true(cache.has('key2'));
	t.true(cache.has('key3'));
});

test('createRenderCache factory creates cache', t => {
	const cache = createRenderCache({maxEntries: 100});

	cache.set('key', 'content');
	t.is(cache.get('key'), 'content');
});

// DirtyRegionTracker tests
test('DirtyRegionTracker marks regions as dirty', t => {
	const tracker = new DirtyRegionTracker();
	tracker.setDimensions(100, 50);

	tracker.markDirty(10, 10, 20, 15);

	const regions = tracker.getDirtyRegions();
	t.is(regions.length, 1);
	t.is(regions[0].left, 10);
	t.is(regions[0].top, 10);
	t.is(regions[0].right, 30);
	t.is(regions[0].bottom, 25);
});

test('DirtyRegionTracker hasDirtyRegions returns correct value', t => {
	const tracker = new DirtyRegionTracker();

	t.false(tracker.hasDirtyRegions());

	tracker.markDirty(0, 0, 10, 10);
	t.true(tracker.hasDirtyRegions());
});

test('DirtyRegionTracker clear removes all regions', t => {
	const tracker = new DirtyRegionTracker();

	tracker.markDirty(0, 0, 10, 10);
	tracker.clear();

	t.false(tracker.hasDirtyRegions());
});

test('DirtyRegionTracker markAllDirty marks entire area', t => {
	const tracker = new DirtyRegionTracker();
	tracker.setDimensions(100, 50);

	tracker.markAllDirty();

	const regions = tracker.getDirtyRegions();
	t.is(regions.length, 1);
	t.is(regions[0].left, 0);
	t.is(regions[0].top, 0);
	t.is(regions[0].right, 100);
	t.is(regions[0].bottom, 50);
});

test('DirtyRegionTracker getBoundingBox returns combined region', t => {
	const tracker = new DirtyRegionTracker();

	tracker.markDirty(10, 10, 10, 10);
	tracker.markDirty(30, 30, 10, 10);

	const bbox = tracker.getBoundingBox();
	t.is(bbox?.left, 10);
	t.is(bbox?.top, 10);
	t.is(bbox?.right, 40);
	t.is(bbox?.bottom, 40);
});

test('createDirtyRegionTracker factory creates tracker', t => {
	const tracker = createDirtyRegionTracker();

	tracker.markDirty(0, 0, 10, 10);
	t.true(tracker.hasDirtyRegions());
});

// AnsiSequenceBatcher tests
test('AnsiSequenceBatcher batches sequences', t => {
	let flushed = '';
	const batcher = new AnsiSequenceBatcher(seq => {
		flushed = seq;
	});

	batcher.add('seq1');
	batcher.add('seq2');
	batcher.flush();

	t.is(flushed, 'seq1seq2');
});

test('AnsiSequenceBatcher auto-flushes when buffer full', t => {
	let flushCount = 0;
	const batcher = new AnsiSequenceBatcher(() => {
		flushCount++;
	}, 10);

	batcher.add('12345');
	t.is(flushCount, 0);

	batcher.add('123456'); // This should trigger flush
	t.is(flushCount, 1);
});

test('AnsiSequenceBatcher addAll adds multiple sequences', t => {
	let flushed = '';
	const batcher = new AnsiSequenceBatcher(seq => {
		flushed = seq;
	});

	batcher.addAll(['seq1', 'seq2', 'seq3']);
	batcher.flush();

	t.is(flushed, 'seq1seq2seq3');
});

test('AnsiSequenceBatcher clear clears buffer', t => {
	let flushed = '';
	const batcher = new AnsiSequenceBatcher(seq => {
		flushed = seq;
	});

	batcher.add('seq1');
	batcher.clear();
	batcher.flush();

	t.is(flushed, '');
});

test('AnsiSequenceBatcher isEmpty returns correct value', t => {
	const batcher = new AnsiSequenceBatcher(() => {});

	t.true(batcher.isEmpty());

	batcher.add('seq');
	t.false(batcher.isEmpty());
});

test('createAnsiSequenceBatcher factory creates batcher', t => {
	let flushed = '';
	const batcher = createAnsiSequenceBatcher(seq => {
		flushed = seq;
	});

	batcher.add('seq');
	batcher.flush();

	t.is(flushed, 'seq');
});

// StringBuilder tests
test('StringBuilder appends strings', t => {
	const builder = new StringBuilder();

	builder.append('Hello').append(' ').append('World');

	t.is(builder.toString(), 'Hello World');
});

test('StringBuilder appends characters', t => {
	const builder = new StringBuilder();

	builder.appendChar('H').appendChar('i');

	t.is(builder.toString(), 'Hi');
});

test('StringBuilder appendAll adds multiple strings', t => {
	const builder = new StringBuilder();

	builder.appendAll(['Hello', ' ', 'World']);

	t.is(builder.toString(), 'Hello World');
});

test('StringBuilder prepend adds to beginning', t => {
	const builder = new StringBuilder();

	builder.append('World').prepend('Hello ');

	t.is(builder.toString(), 'Hello World');
});

test('StringBuilder length returns total length', t => {
	const builder = new StringBuilder();

	builder.append('Hello').append(' World');

	t.is(builder.length(), 11);
});

test('StringBuilder isEmpty returns correct value', t => {
	const builder = new StringBuilder();

	t.true(builder.isEmpty());

	builder.append('text');
	t.false(builder.isEmpty());
});

test('StringBuilder clear empties builder', t => {
	const builder = new StringBuilder();

	builder.append('text');
	builder.clear();

	t.is(builder.toString(), '');
	t.is(builder.length(), 0);
});

test('StringBuilder substring returns substring', t => {
	const builder = new StringBuilder();

	builder.append('Hello World');

	t.is(builder.substring(0, 5), 'Hello');
	t.is(builder.substring(6), 'World');
});

test('createStringBuilder factory creates builder', t => {
	const builder = createStringBuilder();

	builder.append('Hello');
	t.is(builder.toString(), 'Hello');
});

// CellPool tests
test('CellPool acquire returns cell', t => {
	const pool = new CellPool();

	const cell = pool.acquire();

	t.is(cell.char, ' ');
	t.is(cell.fg, 'default');
	t.is(cell.bg, 'default');
});

test('CellPool reuses released cells', t => {
	const pool = new CellPool();

	const cell1 = pool.acquire();
	pool.release(cell1);
	const cell2 = pool.acquire();

	// Should be the same object
	t.is(cell1, cell2);

	const stats = pool.getStats();
	t.is(stats.reused, 1);
});

test('CellPool release resets cell state', t => {
	const pool = new CellPool();

	const cell = pool.acquire();
	cell.char = 'A';
	cell.fg = 'red';
	cell.styles.bold = true;

	pool.release(cell);

	t.is(cell.char, ' ');
	t.is(cell.fg, 'default' as unknown as 'red');
	t.deepEqual(cell.styles, {});
});

test('CellPool releaseAll releases multiple cells', t => {
	const pool = new CellPool();

	const cell1 = pool.acquire();
	const cell2 = pool.acquire();

	pool.releaseAll([cell1, cell2]);

	const stats = pool.getStats();
	t.is(stats.reused, 0); // First release doesn't count as reuse
});

test('CellPool getStats returns statistics', t => {
	const pool = new CellPool();

	pool.acquire();
	pool.acquire();

	const stats = pool.getStats();
	t.is(stats.created, 2);
	t.is(stats.reused, 0);
	t.is(stats.reuseRate, 0);
});

test('CellPool clear resets pool', t => {
	const pool = new CellPool();

	const cell = pool.acquire();
	pool.release(cell);
	pool.clear();

	const stats = pool.getStats();
	t.is(stats.created, 0);
	t.is(stats.reused, 0);
});

test('CellPool respects maxSize', t => {
	const pool = new CellPool(2);

	const cell1 = pool.acquire();
	const cell2 = pool.acquire();
	const cell3 = pool.acquire();

	pool.release(cell1);
	pool.release(cell2);
	pool.release(cell3); // Should not be added to pool (max size reached)

	const stats = pool.getStats();
	t.is(stats.available, 2);
});

test('createCellPool factory creates pool', t => {
	const pool = createCellPool(10);

	const cell = pool.acquire();
	t.is(cell.char, ' ');
});

// PerformanceMonitor tests
test('PerformanceMonitor records timing', t => {
	const monitor = new PerformanceMonitor();

	monitor.record('operation1', 10);
	monitor.record('operation1', 20);
	monitor.record('operation2', 5);

	const stats = monitor.getStats();
	t.is(stats.operation1.count, 2);
	t.is(stats.operation2.count, 1);
});

test('PerformanceMonitor time measures function', t => {
	const monitor = new PerformanceMonitor();

	const result = monitor.time('test', () => {
		return 42;
	});

	t.is(result, 42);

	const stats = monitor.getStats();
	t.is(stats.test.count, 1);
});

test('PerformanceMonitor getAverageTime returns average', t => {
	const monitor = new PerformanceMonitor();

	monitor.record('op', 10);
	monitor.record('op', 20);

	t.is(monitor.getAverageTime('op'), 15);
});

test('PerformanceMonitor getAverageTime returns 0 for unknown operation', t => {
	const monitor = new PerformanceMonitor();

	t.is(monitor.getAverageTime('unknown'), 0);
});

test('PerformanceMonitor clear removes all samples', t => {
	const monitor = new PerformanceMonitor();

	monitor.record('op', 10);
	monitor.clear();

	const stats = monitor.getStats();
	t.deepEqual(stats, {});
});

test('createPerformanceMonitor factory creates monitor', t => {
	const monitor = createPerformanceMonitor();

	monitor.record('op', 10);
	const stats = monitor.getStats();
	t.is(stats.op.count, 1);
});
