/**
 * Performance Optimizations Module
 *
 * This module provides various performance optimizations for the rendering engine
 * including render caching, dirty region tracking, batched ANSI sequence generation,
 * and efficient string building patterns.
 *
 * @module rendering/optimization
 */

import {Cell} from './cell.js';
import {ScreenBuffer, DirtyRegion} from './buffer.js';

/**
 * Cache entry for rendered content
 */
export interface CacheEntry {
	/** Cached content */
	content: string;

	/** Timestamp when cached */
	timestamp: number;

	/** Hash of source data */
	hash: string;

	/** Size in bytes */
	size: number;
}

/**
 * Render cache options
 */
export interface RenderCacheOptions {
	/** Maximum cache size in entries */
	maxEntries?: number;

	/** Maximum cache size in bytes */
	maxBytes?: number;

	/** TTL in milliseconds */
	ttl?: number;
}

/**
 * Render cache for static content
 *
 * Caches rendered output to avoid recomputing unchanged content.
 */
export class RenderCache {
	/** Cache storage */
	private cache = new Map<string, CacheEntry>();

	/** Current size in bytes */
	private currentBytes = 0;

	/** Configuration */
	private maxEntries: number;
	private maxBytes: number;
	private ttl: number;

	/** Cache hits and misses */
	private hits = 0;
	private misses = 0;

	constructor(options: RenderCacheOptions = {}) {
		this.maxEntries = options.maxEntries ?? 1000;
		this.maxBytes = options.maxBytes ?? 1024 * 1024; // 1MB
		this.ttl = options.ttl ?? 60000; // 1 minute
	}

	/**
	 * Get cached content
	 *
	 * @param key - Cache key
	 * @returns Cached content or undefined
	 */
	get(key: string): string | undefined {
		const entry = this.cache.get(key);

		if (!entry) {
			this.misses++;
			return undefined;
		}

		// Check TTL
		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			this.currentBytes -= entry.size;
			this.misses++;
			return undefined;
		}

		this.hits++;
		return entry.content;
	}

	/**
	 * Set cached content
	 *
	 * @param key - Cache key
	 * @param content - Content to cache
	 */
	set(key: string, content: string): void {
		const size = Buffer.byteLength(content, 'utf8');

		// Don't cache if too large
		if (size > this.maxBytes * 0.1) {
			return;
		}

		// Evict entries if needed
		while (
			this.cache.size >= this.maxEntries ||
			(this.currentBytes + size > this.maxBytes && this.cache.size > 0)
		) {
			this.evictLRU();
		}

		// Remove old entry if exists
		const oldEntry = this.cache.get(key);
		if (oldEntry) {
			this.currentBytes -= oldEntry.size;
		}

		// Add new entry
		this.cache.set(key, {
			content,
			timestamp: Date.now(),
			hash: this.hash(content),
			size,
		});

		this.currentBytes += size;
	}

	/**
	 * Check if key exists in cache
	 *
	 * @param key - Cache key
	 */
	has(key: string): boolean {
		return this.cache.has(key);
	}

	/**
	 * Delete cached entry
	 *
	 * @param key - Cache key
	 */
	delete(key: string): void {
		const entry = this.cache.get(key);
		if (entry) {
			this.currentBytes -= entry.size;
			this.cache.delete(key);
		}
	}

	/**
	 * Clear all cached entries
	 */
	clear(): void {
		this.cache.clear();
		this.currentBytes = 0;
	}

	/**
	 * Get cache statistics
	 */
	getStats(): {
		entries: number;
		bytes: number;
		hits: number;
		misses: number;
		hitRate: number;
	} {
		const total = this.hits + this.misses;
		return {
			entries: this.cache.size,
			bytes: this.currentBytes,
			hits: this.hits,
			misses: this.misses,
			hitRate: total > 0 ? this.hits / total : 0,
		};
	}

	/**
	 * Reset statistics
	 */
	resetStats(): void {
		this.hits = 0;
		this.misses = 0;
	}

	/**
	 * Evict least recently used entry
	 */
	private evictLRU(): void {
		let oldestKey: string | undefined;
		let oldestTime = Infinity;

		for (const [key, entry] of this.cache) {
			if (entry.timestamp < oldestTime) {
				oldestTime = entry.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.delete(oldestKey);
		}
	}

	/**
	 * Simple hash function for content
	 */
	private hash(content: string): string {
		let hash = 0;
		for (let i = 0; i < content.length; i++) {
			const char = content.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return hash.toString(36);
	}
}

/**
 * Dirty region tracker for efficient partial updates
 *
 * Tracks which regions of the screen have changed and need redrawing.
 */
export class DirtyRegionTracker {
	/** Dirty regions */
	private regions: DirtyRegion[] = [];

	/** Maximum regions to track before merging */
	private maxRegions = 10;

	/** Buffer dimensions */
	private width = 0;
	private height = 0;

	/**
	 * Set buffer dimensions
	 */
	setDimensions(width: number, height: number): void {
		this.width = width;
		this.height = height;
	}

	/**
	 * Mark a region as dirty
	 */
	markDirty(x: number, y: number, width = 1, height = 1): void {
		const newRegion: DirtyRegion = {
			left: x,
			top: y,
			right: x + width,
			bottom: y + height,
		};

		// Try to merge with existing regions
		for (const region of this.regions) {
			if (this.canMerge(region, newRegion)) {
				this.merge(region, newRegion);
				return;
			}
		}

		// Add as new region
		this.regions.push(newRegion);

		// Merge regions if too many
		if (this.regions.length > this.maxRegions) {
			this.mergeAll();
		}
	}

	/**
	 * Mark entire buffer as dirty
	 */
	markAllDirty(): void {
		this.regions = [
			{
				left: 0,
				top: 0,
				right: this.width,
				bottom: this.height,
			},
		];
	}

	/**
	 * Get dirty regions
	 */
	getDirtyRegions(): DirtyRegion[] {
		return [...this.regions];
	}

	/**
	 * Check if there are any dirty regions
	 */
	hasDirtyRegions(): boolean {
		return this.regions.length > 0;
	}

	/**
	 * Clear all dirty regions
	 */
	clear(): void {
		this.regions = [];
	}

	/**
	 * Get bounding box of all dirty regions
	 */
	getBoundingBox(): DirtyRegion | null {
		if (this.regions.length === 0) return null;

		return this.regions.reduce(
			(acc, region) => ({
				left: Math.min(acc.left, region.left),
				top: Math.min(acc.top, region.top),
				right: Math.max(acc.right, region.right),
				bottom: Math.max(acc.bottom, region.bottom),
			}),
			{...this.regions[0]},
		);
	}

	/**
	 * Check if two regions can be merged
	 */
	private canMerge(a: DirtyRegion, b: DirtyRegion): boolean {
		// Check if regions overlap or are adjacent
		return !(
			a.right < b.left - 1 ||
			a.left > b.right + 1 ||
			a.bottom < b.top - 1 ||
			a.top > b.bottom + 1
		);
	}

	/**
	 * Merge two regions (modifies first region)
	 */
	private merge(target: DirtyRegion, source: DirtyRegion): void {
		target.left = Math.min(target.left, source.left);
		target.top = Math.min(target.top, source.top);
		target.right = Math.max(target.right, source.right);
		target.bottom = Math.max(target.bottom, source.bottom);
	}

	/**
	 * Merge all regions into one
	 */
	private mergeAll(): void {
		const bounding = this.getBoundingBox();
		if (bounding) {
			this.regions = [bounding];
		}
	}
}

/**
 * ANSI sequence batcher for efficient output
 *
 * Batches multiple ANSI sequences together to reduce write calls.
 */
export class AnsiSequenceBatcher {
	/** Buffer for sequences */
	private buffer: string[] = [];

	/** Current buffer size in characters */
	private bufferSize = 0;

	/** Maximum buffer size before flush */
	private maxBufferSize: number;

	/** Callback when buffer should be flushed */
	private onFlush: (sequences: string) => void;

	constructor(onFlush: (sequences: string) => void, maxBufferSize = 4096) {
		this.onFlush = onFlush;
		this.maxBufferSize = maxBufferSize;
	}

	/**
	 * Add a sequence to the batch
	 */
	add(sequence: string): void {
		this.buffer.push(sequence);
		this.bufferSize += sequence.length;

		if (this.bufferSize >= this.maxBufferSize) {
			this.flush();
		}
	}

	/**
	 * Add multiple sequences
	 */
	addAll(sequences: string[]): void {
		for (const seq of sequences) {
			this.add(seq);
		}
	}

	/**
	 * Flush the buffer
	 */
	flush(): void {
		if (this.buffer.length === 0) return;

		const combined = this.buffer.join('');
		this.onFlush(combined);

		this.buffer = [];
		this.bufferSize = 0;
	}

	/**
	 * Clear the buffer without flushing
	 */
	clear(): void {
		this.buffer = [];
		this.bufferSize = 0;
	}

	/**
	 * Get current buffer size
	 */
	getBufferSize(): number {
		return this.bufferSize;
	}

	/**
	 * Check if buffer is empty
	 */
	isEmpty(): boolean {
		return this.buffer.length === 0;
	}
}

/**
 * Efficient string builder for concatenating many strings
 *
 * Uses an array internally and joins only when needed.
 */
export class StringBuilder {
	/** String parts */
	private parts: string[] = [];

	/** Total length */
	private totalLength = 0;

	/**
	 * Append a string
	 */
	append(str: string): this {
		this.parts.push(str);
		this.totalLength += str.length;
		return this;
	}

	/**
	 * Append a character
	 */
	appendChar(char: string): this {
		this.parts.push(char);
		this.totalLength += 1;
		return this;
	}

	/**
	 * Append multiple strings
	 */
	appendAll(strs: string[]): this {
		for (const str of strs) {
			this.append(str);
		}
		return this;
	}

	/**
	 * Prepend a string
	 */
	prepend(str: string): this {
		this.parts.unshift(str);
		this.totalLength += str.length;
		return this;
	}

	/**
	 * Get the built string
	 */
	toString(): string {
		return this.parts.join('');
	}

	/**
	 * Get current length
	 */
	length(): number {
		return this.totalLength;
	}

	/**
	 * Check if empty
	 */
	isEmpty(): boolean {
		return this.parts.length === 0;
	}

	/**
	 * Clear the builder
	 */
	clear(): void {
		this.parts = [];
		this.totalLength = 0;
	}

	/**
	 * Get a substring
	 */
	substring(start: number, end?: number): string {
		return this.toString().substring(start, end);
	}
}

/**
 * Object pool for reusing cell objects
 *
 * Reduces garbage collection pressure by reusing cell objects.
 */
export class CellPool {
	/** Available cells */
	private pool: Cell[] = [];

	/** Maximum pool size */
	private maxSize: number;

	/** Cells created */
	private created = 0;

	/** Cells reused */
	private reused = 0;

	constructor(maxSize = 1000) {
		this.maxSize = maxSize;
	}

	/**
	 * Acquire a cell from the pool
	 */
	acquire(): Cell {
		if (this.pool.length > 0) {
			this.reused++;
			return this.pool.pop()!;
		}

		this.created++;
		return {
			char: ' ',
			fg: 'default',
			bg: 'default',
			styles: {},
			width: 1,
		};
	}

	/**
	 * Release a cell back to the pool
	 */
	release(cell: Cell): void {
		if (this.pool.length < this.maxSize) {
			// Reset cell to default state
			cell.char = ' ';
			cell.fg = 'default';
			cell.bg = 'default';
			cell.styles = {};
			cell.width = 1;

			this.pool.push(cell);
		}
	}

	/**
	 * Release multiple cells
	 */
	releaseAll(cells: Cell[]): void {
		for (const cell of cells) {
			this.release(cell);
		}
	}

	/**
	 * Get pool statistics
	 */
	getStats(): {
		available: number;
		created: number;
		reused: number;
		reuseRate: number;
	} {
		const total = this.created + this.reused;
		return {
			available: this.pool.length,
			created: this.created,
			reused: this.reused,
			reuseRate: total > 0 ? this.reused / total : 0,
		};
	}

	/**
	 * Clear the pool
	 */
	clear(): void {
		this.pool = [];
		this.created = 0;
		this.reused = 0;
	}
}

/**
 * Performance monitor for tracking render performance
 */
export class PerformanceMonitor {
	/** Timing samples */
	private samples: Array<{
		operation: string;
		duration: number;
		timestamp: number;
	}> = [];

	/** Maximum samples to keep */
	private maxSamples = 1000;

	/**
	 * Record a timing sample
	 */
	record(operation: string, duration: number): void {
		this.samples.push({
			operation,
			duration,
			timestamp: Date.now(),
		});

		if (this.samples.length > this.maxSamples) {
			this.samples.shift();
		}
	}

	/**
	 * Time an operation
	 */
	time<T>(operation: string, fn: () => T): T {
		const start = performance.now();
		const result = fn();
		const duration = performance.now() - start;
		this.record(operation, duration);
		return result;
	}

	/**
	 * Get average time for an operation
	 */
	getAverageTime(operation: string): number {
		const operationSamples = this.samples.filter(
			s => s.operation === operation,
		);

		if (operationSamples.length === 0) return 0;

		const sum = operationSamples.reduce((acc, s) => acc + s.duration, 0);
		return sum / operationSamples.length;
	}

	/**
	 * Get all statistics
	 */
	getStats(): Record<
		string,
		{count: number; average: number; min: number; max: number}
	> {
		const stats: Record<
			string,
			{count: number; average: number; min: number; max: number}
		> = {};

		const operations = [...new Set(this.samples.map(s => s.operation))];

		for (const operation of operations) {
			const operationSamples = this.samples.filter(
				s => s.operation === operation,
			);
			const durations = operationSamples.map(s => s.duration);

			stats[operation] = {
				count: operationSamples.length,
				average: durations.reduce((a, b) => a + b, 0) / durations.length,
				min: Math.min(...durations),
				max: Math.max(...durations),
			};
		}

		return stats;
	}

	/**
	 * Clear all samples
	 */
	clear(): void {
		this.samples = [];
	}
}

/**
 * Create a render cache
 */
export function createRenderCache(options?: RenderCacheOptions): RenderCache {
	return new RenderCache(options);
}

/**
 * Create a dirty region tracker
 */
export function createDirtyRegionTracker(): DirtyRegionTracker {
	return new DirtyRegionTracker();
}

/**
 * Create an ANSI sequence batcher
 */
export function createAnsiSequenceBatcher(
	onFlush: (sequences: string) => void,
	maxBufferSize?: number,
): AnsiSequenceBatcher {
	return new AnsiSequenceBatcher(onFlush, maxBufferSize);
}

/**
 * Create a string builder
 */
export function createStringBuilder(): StringBuilder {
	return new StringBuilder();
}

/**
 * Create a cell pool
 */
export function createCellPool(maxSize?: number): CellPool {
	return new CellPool(maxSize);
}

/**
 * Create a performance monitor
 */
export function createPerformanceMonitor(): PerformanceMonitor {
	return new PerformanceMonitor();
}
