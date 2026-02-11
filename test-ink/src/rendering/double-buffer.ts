/**
 * Double Buffer Manager Module
 *
 * This module provides the DoubleBufferManager class for managing two screen buffers:
 * a front buffer (currently visible) and a back buffer (being rendered).
 * This technique minimizes flickering and optimizes rendering performance.
 *
 * @module rendering/double-buffer
 */

import {ScreenBuffer} from './buffer.js';

/**
 * Double buffer configuration options
 */
export interface DoubleBufferOptions {
	/** Initial buffer width */
	width: number;

	/** Initial buffer height */
	height: number;

	/** Whether to preserve front buffer content when resizing */
	preserveOnResize?: boolean;
}

/**
 * Buffer swap statistics
 */
export interface SwapStats {
	/** Number of swaps performed */
	swapCount: number;

	/** Timestamp of last swap */
	lastSwapTime: number;

	/** Average time between swaps in ms */
	averageSwapInterval: number;
}

/**
 * Manages two screen buffers for double buffering.
 *
 * The front buffer represents what's currently visible on screen.
 * The back buffer is where new content is rendered.
 * After rendering, buffers are swapped to show the new content.
 */
export class DoubleBufferManager {
	/** Front buffer (currently visible) */
	private frontBuffer: ScreenBuffer;

	/** Back buffer (being rendered) */
	private backBuffer: ScreenBuffer;

	/** Whether buffers have been swapped at least once */
	private hasSwapped = false;

	/** Swap statistics */
	private swapStats: SwapStats;

	/** Swap history for calculating average */
	private swapTimes: number[] = [];

	/** Maximum swap history to keep */
	private readonly maxSwapHistory = 10;

	/** Whether to preserve content on resize */
	private preserveOnResize: boolean;

	/**
	 * Create a new double buffer manager
	 *
	 * @param options - Configuration options
	 */
	constructor(options: DoubleBufferOptions) {
		const {width, height, preserveOnResize = true} = options;

		this.frontBuffer = new ScreenBuffer(width, height);
		this.backBuffer = new ScreenBuffer(width, height);
		this.preserveOnResize = preserveOnResize;

		this.swapStats = {
			swapCount: 0,
			lastSwapTime: 0,
			averageSwapInterval: 0,
		};
	}

	/**
	 * Get the front buffer (currently visible)
	 */
	getFrontBuffer(): ScreenBuffer {
		return this.frontBuffer;
	}

	/**
	 * Get the back buffer (for rendering)
	 */
	getBackBuffer(): ScreenBuffer {
		return this.backBuffer;
	}

	/**
	 * Swap the front and back buffers
	 *
	 * After swapping, the back buffer becomes the front buffer (visible),
	 * and the old front buffer becomes the new back buffer (ready for rendering).
	 *
	 * @returns Statistics about the swap
	 */
	swapBuffers(): SwapStats {
		// Swap references
		const temp = this.frontBuffer;
		this.frontBuffer = this.backBuffer;
		this.backBuffer = temp;

		// Clear the new back buffer (old front buffer) for fresh rendering
		this.backBuffer.clear();

		// Update statistics
		const now = Date.now();
		this.swapStats.swapCount++;

		if (this.hasSwapped) {
			const interval = now - this.swapStats.lastSwapTime;
			this.swapTimes.push(interval);

			// Keep only recent history
			if (this.swapTimes.length > this.maxSwapHistory) {
				this.swapTimes.shift();
			}

			// Calculate average
			const sum = this.swapTimes.reduce((a, b) => a + b, 0);
			this.swapStats.averageSwapInterval = sum / this.swapTimes.length;
		}

		this.swapStats.lastSwapTime = now;
		this.hasSwapped = true;

		return {...this.swapStats};
	}

	/**
	 * Check if buffers have been swapped at least once
	 */
	hasEverSwapped(): boolean {
		return this.hasSwapped;
	}

	/**
	 * Get swap statistics
	 */
	getSwapStats(): SwapStats {
		return {...this.swapStats};
	}

	/**
	 * Get current buffer dimensions
	 */
	getDimensions(): {width: number; height: number} {
		return {
			width: this.frontBuffer.getWidth(),
			height: this.frontBuffer.getHeight(),
		};
	}

	/**
	 * Resize both buffers
	 *
	 * @param width - New width
	 * @param height - New height
	 */
	resize(width: number, height: number): void {
		if (width <= 0 || height <= 0) {
			throw new Error(`Invalid buffer dimensions: ${width}x${height}`);
		}

		const currentDimensions = this.getDimensions();
		if (
			width === currentDimensions.width &&
			height === currentDimensions.height
		) {
			return;
		}

		// Resize both buffers
		this.frontBuffer.resize(width, height, this.preserveOnResize);
		this.backBuffer.resize(width, height, false); // Don't preserve back buffer
	}

	/**
	 * Clear both buffers
	 */
	clearBoth(): void {
		this.frontBuffer.clear();
		this.backBuffer.clear();
	}

	/**
	 * Reset the manager with new dimensions
	 *
	 * @param width - New width
	 * @param height - New height
	 */
	reset(width: number, height: number): void {
		this.frontBuffer = new ScreenBuffer(width, height);
		this.backBuffer = new ScreenBuffer(width, height);
		this.hasSwapped = false;
		this.swapStats = {
			swapCount: 0,
			lastSwapTime: 0,
			averageSwapInterval: 0,
		};
		this.swapTimes = [];
	}

	/**
	 * Copy front buffer content to back buffer
	 * Useful for incremental rendering where you want to preserve the previous frame
	 */
	syncBackToFront(): void {
		this.backBuffer.copyFrom(this.frontBuffer);
	}

	/**
	 * Check if a coordinate is valid in the current buffers
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 */
	isValidPosition(x: number, y: number): boolean {
		return this.frontBuffer.isValidPosition(x, y);
	}

	/**
	 * Get the difference between front and back buffers
	 *
	 * @returns Array of changes between buffers
	 */
	getDifferences() {
		return this.frontBuffer.compare(this.backBuffer);
	}

	/**
	 * Calculate the percentage of cells that have changed between buffers
	 *
	 * @returns Percentage (0-100) of changed cells
	 */
	getChangePercentage(): number {
		const {width, height} = this.getDimensions();
		const totalCells = width * height;

		if (totalCells === 0) return 0;

		let changedCount = 0;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const frontCell = this.frontBuffer.getCell(x, y);
				const backCell = this.backBuffer.getCell(x, y);

				// Simple reference check first, then deep comparison if needed
				if (frontCell !== backCell) {
					// If one is undefined and the other isn't, it's a change
					if (!frontCell || !backCell) {
						changedCount++;
					}
					// Otherwise need to compare content
				}
			}
		}

		return (changedCount / totalCells) * 100;
	}

	/**
	 * Destroy the manager and release resources
	 */
	destroy(): void {
		this.frontBuffer.clear();
		this.backBuffer.clear();
		this.swapTimes = [];
	}
}

/**
 * Create a new double buffer manager
 *
 * @param options - Configuration options
 * @returns New double buffer manager
 */
export function createDoubleBufferManager(
	options: DoubleBufferOptions,
): DoubleBufferManager {
	return new DoubleBufferManager(options);
}
