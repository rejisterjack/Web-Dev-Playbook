/**
 * Renderer Core Module
 *
 * This module provides the main Renderer class that integrates all rendering
 * components including double buffering, differential rendering, and render strategies.
 * It provides a high-level API for rendering with features like frame rate limiting,
 * render queue batching, and performance statistics.
 *
 * @module rendering/renderer
 */

import {EventEmitter} from 'events';
import {ScreenBuffer} from './buffer.js';
import {DoubleBufferManager} from './double-buffer.js';
import {RenderInstruction, RenderStats} from './strategy.js';
import {SmartRenderStrategy, RenderStrategy} from './strategy.js';
import {TerminalOutput} from '../terminal/output.js';
import {Cursor} from '../terminal/ansi.js';

/**
 * Renderer configuration options
 */
export interface RendererOptions {
	/** Terminal output stream */
	output?: TerminalOutput;

	/** Initial terminal width */
	width: number;

	/** Initial terminal height */
	height: number;

	/** Target frame rate (FPS) */
	targetFps?: number;

	/** Whether to enable frame rate limiting */
	frameRateLimiting?: boolean;

	/** Render strategy to use */
	strategy?: RenderStrategy;

	/** Whether to hide cursor during rendering */
	hideCursor?: boolean;

	/** Whether to show render statistics */
	showStats?: boolean;

	/** Maximum render queue size */
	maxQueueSize?: number;
}

/**
 * Frame statistics
 */
export interface FrameStats {
	/** Frame number */
	frameNumber: number;

	/** Timestamp when frame started */
	startTime: number;

	/** Timestamp when frame completed */
	endTime: number;

	/** Time spent rendering in milliseconds */
	renderTime: number;

	/** Time spent waiting for frame rate limit */
	waitTime: number;

	/** Number of cells rendered */
	cellsRendered: number;

	/** Number of ANSI sequences sent */
	sequencesSent: number;

	/** Strategy used for this frame */
	strategy: string;

	/** Whether this was a full render */
	isFullRender: boolean;
}

/**
 * Renderer performance metrics
 */
export interface RendererMetrics {
	/** Total frames rendered */
	totalFrames: number;

	/** Average frame time in milliseconds */
	avgFrameTime: number;

	/** Average render time in milliseconds */
	avgRenderTime: number;

	/** Current FPS */
	currentFps: number;

	/** Average FPS over last 60 frames */
	avgFps: number;

	/** Peak FPS */
	peakFps: number;

	/** Minimum FPS */
	minFps: number;

	/** Total cells rendered */
	totalCellsRendered: number;

	/** Render strategy changes */
	strategyChanges: number;
}

/**
 * Render queue item
 */
interface RenderQueueItem {
	/** Buffer to render */
	buffer: ScreenBuffer;

	/** Resolve function for promise */
	resolve: () => void;

	/** Reject function for promise */
	reject: (error: Error) => void;
}

/**
 * Main Renderer class - the core rendering engine
 *
 * The Renderer integrates double buffering, differential rendering, and render
 * strategies to provide efficient screen updates. It supports frame rate limiting,
 * render queue batching, and comprehensive performance metrics.
 *
 * @example
 * ```typescript
 * const renderer = new Renderer({
 *   width: 80,
 *   height: 24,
 *   targetFps: 60,
 * });
 *
 * // Render a buffer
 * await renderer.render(myBuffer);
 *
 * // Get performance metrics
 * const metrics = renderer.getMetrics();
 * console.log(`FPS: ${metrics.currentFps}`);
 * ```
 */
export class Renderer extends EventEmitter {
	/** Terminal output stream */
	private output: TerminalOutput;

	/** Double buffer manager */
	private doubleBuffer: DoubleBufferManager;

	/** Current render strategy */
	private strategy: RenderStrategy;

	/** Target frame rate */
	private targetFps: number;

	/** Frame rate limiting enabled */
	private frameRateLimiting: boolean;

	/** Whether to hide cursor */
	private hideCursor: boolean;

	/** Whether to show stats */
	private showStats: boolean;

	/** Maximum queue size */
	private maxQueueSize: number;

	/** Render queue */
	private renderQueue: RenderQueueItem[] = [];

	/** Whether currently rendering */
	private isRendering = false;

	/** Frame number counter */
	private frameNumber = 0;

	/** Frame timing history */
	private frameTimes: number[] = [];

	/** Render timing history */
	private renderTimes: number[] = [];

	/** Maximum history to keep */
	private readonly maxHistory = 60;

	/** Total cells rendered */
	private totalCellsRendered = 0;

	/** Strategy change count */
	private strategyChanges = 0;

	/** Last frame timestamp */
	private lastFrameTime = 0;

	/** Animation frame ID */
	private animationFrameId: ReturnType<typeof setTimeout> | null = null;

	/** Whether renderer is destroyed */
	private destroyed = false;

	/** Current frame stats */
	private currentFrameStats: FrameStats | null = null;

	/**
	 * Create a new renderer
	 *
	 * @param options - Renderer configuration
	 */
	constructor(options: RendererOptions) {
		super();

		// Set up output stream
		this.output = options.output ?? new TerminalOutput();

		// Initialize double buffer
		this.doubleBuffer = new DoubleBufferManager({
			width: options.width,
			height: options.height,
			preserveOnResize: true,
		});

		// Set up strategy
		this.strategy = options.strategy ?? new SmartRenderStrategy();

		// Configuration
		this.targetFps = options.targetFps ?? 60;
		this.frameRateLimiting = options.frameRateLimiting ?? true;
		this.hideCursor = options.hideCursor ?? true;
		this.showStats = options.showStats ?? false;
		this.maxQueueSize = options.maxQueueSize ?? 10;

		// Initialize
		this.initialize();
	}

	/**
	 * Initialize the renderer
	 */
	private initialize(): void {
		// Hide cursor if requested
		if (this.hideCursor) {
			this.output.write(Cursor.hide());
		}

		this.emit('initialized');
	}

	/**
	 * Get the back buffer for rendering
	 */
	getBackBuffer(): ScreenBuffer {
		return this.doubleBuffer.getBackBuffer();
	}

	/**
	 * Get the front buffer (currently visible)
	 */
	getFrontBuffer(): ScreenBuffer {
		return this.doubleBuffer.getFrontBuffer();
	}

	/**
	 * Render a buffer to the screen
	 *
	 * @param buffer - Buffer to render (if not provided, uses back buffer)
	 * @returns Promise that resolves when render is complete
	 */
	async render(buffer?: ScreenBuffer): Promise<void> {
		if (this.destroyed) {
			throw new Error('Renderer has been destroyed');
		}

		return new Promise((resolve, reject) => {
			// Add to queue
			if (this.renderQueue.length >= this.maxQueueSize) {
				// Remove oldest item if queue is full
				const removed = this.renderQueue.shift();
				removed?.resolve(); // Resolve as if rendered
				this.emit('queueDrop', {dropped: removed});
			}

			this.renderQueue.push({
				buffer: buffer ?? this.doubleBuffer.getBackBuffer(),
				resolve,
				reject,
			});

			// Start processing if not already
			if (!this.isRendering) {
				this.processQueue();
			}
		});
	}

	/**
	 * Process the render queue
	 */
	private async processQueue(): Promise<void> {
		if (this.isRendering || this.renderQueue.length === 0) {
			return;
		}

		this.isRendering = true;

		try {
			while (this.renderQueue.length > 0) {
				const item = this.renderQueue.shift();
				if (!item) continue;

				try {
					await this.renderFrame(item.buffer);
					item.resolve();
				} catch (error) {
					item.reject(
						error instanceof Error ? error : new Error(String(error)),
					);
				}
			}
		} finally {
			this.isRendering = false;
		}
	}

	/**
	 * Render a single frame
	 *
	 * @param buffer - Buffer to render
	 */
	private async renderFrame(buffer: ScreenBuffer): Promise<void> {
		const frameStartTime = performance.now();
		this.frameNumber++;

		// Apply frame rate limiting
		if (this.frameRateLimiting && this.lastFrameTime > 0) {
			const elapsed = frameStartTime - this.lastFrameTime;
			const targetFrameTime = 1000 / this.targetFps;

			if (elapsed < targetFrameTime) {
				const waitTime = targetFrameTime - elapsed;
				await this.sleep(waitTime);
			}
		}

		const renderStartTime = performance.now();

		// Copy buffer to back buffer if different
		if (buffer !== this.doubleBuffer.getBackBuffer()) {
			this.doubleBuffer.getBackBuffer().copyFrom(buffer);
		}

		// Generate render instructions
		const frontBuffer = this.doubleBuffer.getFrontBuffer();
		const backBuffer = this.doubleBuffer.getBackBuffer();

		const result = this.strategy.render(frontBuffer, backBuffer);

		// Execute render instructions
		await this.executeInstructions(result.instructions);

		// Swap buffers
		this.doubleBuffer.swapBuffers();

		const renderEndTime = performance.now();

		// Update metrics
		this.updateMetrics(
			frameStartTime,
			renderStartTime,
			renderEndTime,
			result.stats,
		);

		// Emit frame event
		this.emit('frame', this.currentFrameStats);

		this.lastFrameTime = performance.now();
	}

	/**
	 * Execute render instructions
	 *
	 * @param instructions - Instructions to execute
	 */
	private async executeInstructions(
		instructions: RenderInstruction,
	): Promise<void> {
		if (instructions.sequences.length === 0) {
			return;
		}

		// Batch sequences for efficiency
		const batchSize = 100;
		for (let i = 0; i < instructions.sequences.length; i += batchSize) {
			const batch = instructions.sequences.slice(i, i + batchSize);
			this.output.write(batch.join(''));
		}

		await this.output.flush();
	}

	/**
	 * Update performance metrics
	 */
	private updateMetrics(
		frameStartTime: number,
		renderStartTime: number,
		renderEndTime: number,
		stats: RenderStats,
	): void {
		const frameTime = renderEndTime - frameStartTime;
		const renderTime = renderEndTime - renderStartTime;
		const waitTime = renderStartTime - frameStartTime;

		// Update history
		this.frameTimes.push(frameTime);
		this.renderTimes.push(renderTime);

		if (this.frameTimes.length > this.maxHistory) {
			this.frameTimes.shift();
			this.renderTimes.shift();
		}

		// Update totals
		this.totalCellsRendered += stats.changedCells;

		// Create frame stats
		this.currentFrameStats = {
			frameNumber: this.frameNumber,
			startTime: frameStartTime,
			endTime: renderEndTime,
			renderTime,
			waitTime,
			cellsRendered: stats.changedCells,
			sequencesSent: stats.sequences,
			strategy: stats.strategy,
			isFullRender: stats.isFullRender,
		};
	}

	/**
	 * Clear the screen
	 */
	async clear(): Promise<void> {
		if (this.destroyed) {
			throw new Error('Renderer has been destroyed');
		}

		this.output.write('\u001B[2J\u001B[H\u001B[0m');
		await this.output.flush();

		this.doubleBuffer.clearBoth();

		this.emit('clear');
	}

	/**
	 * Flush any pending output
	 */
	async flush(): Promise<void> {
		if (this.destroyed) {
			throw new Error('Renderer has been destroyed');
		}

		await this.output.flush();
	}

	/**
	 * Resize the renderer
	 *
	 * @param width - New width
	 * @param height - New height
	 */
	resize(width: number, height: number): void {
		if (this.destroyed) {
			throw new Error('Renderer has been destroyed');
		}

		this.doubleBuffer.resize(width, height);
		this.emit('resize', {width, height});
	}

	/**
	 * Get current dimensions
	 */
	getDimensions(): {width: number; height: number} {
		return this.doubleBuffer.getDimensions();
	}

	/**
	 * Get performance metrics
	 */
	getMetrics(): RendererMetrics {
		const avgFrameTime =
			this.frameTimes.length > 0
				? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
				: 0;

		const avgRenderTime =
			this.renderTimes.length > 0
				? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
				: 0;

		const currentFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

		const fpsValues = this.frameTimes.map(t => (t > 0 ? 1000 / t : 0));

		return {
			totalFrames: this.frameNumber,
			avgFrameTime,
			avgRenderTime,
			currentFps,
			avgFps:
				fpsValues.length > 0
					? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length
					: 0,
			peakFps: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
			minFps: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
			totalCellsRendered: this.totalCellsRendered,
			strategyChanges: this.strategyChanges,
		};
	}

	/**
	 * Get current frame statistics
	 */
	getCurrentFrameStats(): FrameStats | null {
		return this.currentFrameStats;
	}

	/**
	 * Set the render strategy
	 *
	 * @param strategy - New strategy to use
	 */
	setStrategy(strategy: RenderStrategy): void {
		if (this.strategy !== strategy) {
			this.strategy = strategy;
			this.strategyChanges++;
			this.emit('strategyChange', {strategy: strategy.name});
		}
	}

	/**
	 * Get current render strategy
	 */
	getStrategy(): RenderStrategy {
		return this.strategy;
	}

	/**
	 * Set target FPS
	 *
	 * @param fps - Target frames per second
	 */
	setTargetFps(fps: number): void {
		this.targetFps = Math.max(1, Math.min(144, fps));
	}

	/**
	 * Get target FPS
	 */
	getTargetFps(): number {
		return this.targetFps;
	}

	/**
	 * Enable or disable frame rate limiting
	 *
	 * @param enabled - Whether to enable limiting
	 */
	setFrameRateLimiting(enabled: boolean): void {
		this.frameRateLimiting = enabled;
	}

	/**
	 * Check if frame rate limiting is enabled
	 */
	isFrameRateLimitingEnabled(): boolean {
		return this.frameRateLimiting;
	}

	/**
	 * Sleep for a given number of milliseconds
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise(resolve => {
			this.animationFrameId = setTimeout(resolve, ms);
		});
	}

	/**
	 * Destroy the renderer and clean up resources
	 */
	async destroy(): Promise<void> {
		if (this.destroyed) {
			return;
		}

		this.destroyed = true;

		// Cancel any pending animation frame
		if (this.animationFrameId) {
			clearTimeout(this.animationFrameId);
			this.animationFrameId = null;
		}

		// Show cursor if it was hidden
		if (this.hideCursor) {
			this.output.write(Cursor.show());
			await this.output.flush();
		}

		// Clear queue
		this.renderQueue = [];

		// Destroy double buffer
		this.doubleBuffer.destroy();

		this.emit('destroyed');
	}

	/**
	 * Check if renderer is destroyed
	 */
	isDestroyed(): boolean {
		return this.destroyed;
	}
}

/**
 * Create a new renderer
 *
 * @param options - Renderer options
 * @returns New renderer instance
 */
export function createRenderer(options: RendererOptions): Renderer {
	return new Renderer(options);
}
