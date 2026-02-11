/**
 * Animation Frame System Module
 *
 * This module provides an animation frame system similar to browser's
 * requestAnimationFrame API. It manages animation callbacks, frame timing,
 * and delta time calculation for smooth animations.
 *
 * @module rendering/animation
 */

import {EventEmitter} from 'events';

/**
 * Animation callback function type
 */
export type AnimationCallback = (deltaTime: number, timestamp: number) => void;

/**
 * Animation frame options
 */
export interface AnimationFrameOptions {
	/** Target FPS (default: 60) */
	targetFps?: number;

	/** Whether to start automatically (default: false) */
	autoStart?: boolean;

	/** Maximum delta time in ms (default: 100) - prevents large jumps */
	maxDeltaTime?: number;

	/** Whether to pause when tab is not visible (simulated) (default: true) */
	pauseWhenHidden?: boolean;
}

/**
 * Animation frame information
 */
export interface AnimationFrame {
	/** Frame number */
	frameNumber: number;

	/** Timestamp when frame started */
	timestamp: number;

	/** Time since last frame in milliseconds */
	deltaTime: number;

	/** Actual FPS */
	fps: number;

	/** Whether frame was skipped */
	skipped: boolean;
}

/**
 * Animation statistics
 */
export interface AnimationStats {
	/** Total frames rendered */
	totalFrames: number;

	/** Frames skipped due to timing */
	framesSkipped: number;

	/** Average FPS */
	averageFps: number;

	/** Current FPS */
	currentFps: number;

	/** Minimum FPS recorded */
	minFps: number;

	/** Maximum FPS recorded */
	maxFps: number;

	/** Average delta time */
	averageDeltaTime: number;

	/** Total running time in milliseconds */
	totalTime: number;
}

/**
 * Animation frame system for managing animations
 *
 * Provides a requestAnimationFrame-like API for the TUI framework.
 * Manages animation callbacks, frame timing, and delta time calculation.
 *
 * @example
 * ```typescript
 * const animation = new AnimationFrameSystem({ targetFps: 60 });
 *
 * // Register an animation callback
 * const id = animation.requestAnimationFrame((deltaTime, timestamp) => {
 *   console.log(`Frame at ${timestamp}, delta: ${deltaTime}ms`);
 * });
 *
 * // Start the animation loop
 * animation.start();
 *
 * // Later, cancel the animation
 * animation.cancelAnimationFrame(id);
 * ```
 */
export class AnimationFrameSystem extends EventEmitter {
	/** Target frame time in milliseconds */
	private targetFrameTime: number;

	/** Maximum delta time */
	private maxDeltaTime: number;

	/** Animation callbacks */
	private callbacks = new Map<number, AnimationCallback>();

	/** Next callback ID */
	private nextId = 1;

	/** Whether animation loop is running */
	private isRunning = false;

	/** Whether animation is paused */
	private isPaused = false;

	/** Current frame number */
	private frameNumber = 0;

	/** Last frame timestamp */
	private lastTimestamp = 0;

	/** Animation frame ID */
	private animationId: ReturnType<typeof setTimeout> | null = null;

	/** FPS history for averaging */
	private fpsHistory: number[] = [];

	/** Maximum FPS history to keep */
	private readonly maxFpsHistory = 60;

	/** Delta time history */
	private deltaTimeHistory: number[] = [];

	/** Start time */
	private startTime = 0;

	/** Total frames skipped */
	private framesSkipped = 0;

	/** Whether to pause when hidden */
	private pauseWhenHidden: boolean;

	/** Simulated visibility state */
	private isVisible = true;

	/** Frame skipping counter */
	private skipCounter = 0;

	/**
	 * Create a new animation frame system
	 *
	 * @param options - Animation options
	 */
	constructor(options: AnimationFrameOptions = {}) {
		super();

		const targetFps = options.targetFps ?? 60;
		this.targetFrameTime = 1000 / targetFps;
		this.maxDeltaTime = options.maxDeltaTime ?? 100;
		this.pauseWhenHidden = options.pauseWhenHidden ?? true;

		if (options.autoStart) {
			this.start();
		}
	}

	/**
	 * Request an animation frame callback
	 *
	 * @param callback - Function to call on each frame
	 * @returns Frame ID that can be used to cancel
	 */
	requestAnimationFrame(callback: AnimationCallback): number {
		const id = this.nextId++;
		this.callbacks.set(id, callback);
		return id;
	}

	/**
	 * Cancel an animation frame callback
	 *
	 * @param id - Frame ID returned by requestAnimationFrame
	 */
	cancelAnimationFrame(id: number): void {
		this.callbacks.delete(id);
	}

	/**
	 * Start the animation loop
	 */
	start(): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this.isPaused = false;
		this.startTime = performance.now();
		this.lastTimestamp = this.startTime;
		this.frameNumber = 0;

		this.emit('start');
		this.scheduleFrame();
	}

	/**
	 * Stop the animation loop
	 */
	stop(): void {
		if (!this.isRunning) return;

		this.isRunning = false;

		if (this.animationId) {
			clearTimeout(this.animationId);
			this.animationId = null;
		}

		this.emit('stop');
	}

	/**
	 * Pause the animation loop
	 */
	pause(): void {
		if (!this.isRunning || this.isPaused) return;

		this.isPaused = true;

		if (this.animationId) {
			clearTimeout(this.animationId);
			this.animationId = null;
		}

		this.emit('pause');
	}

	/**
	 * Resume the animation loop
	 */
	resume(): void {
		if (!this.isRunning || !this.isPaused) return;

		this.isPaused = false;
		this.lastTimestamp = performance.now();

		this.emit('resume');
		this.scheduleFrame();
	}

	/**
	 * Check if animation is running
	 */
	getIsRunning(): boolean {
		return this.isRunning;
	}

	/**
	 * Check if animation is paused
	 */
	getIsPaused(): boolean {
		return this.isPaused;
	}

	/**
	 * Set target FPS
	 *
	 * @param fps - Target frames per second
	 */
	setTargetFps(fps: number): void {
		this.targetFrameTime = 1000 / Math.max(1, Math.min(144, fps));
	}

	/**
	 * Get target FPS
	 */
	getTargetFps(): number {
		return 1000 / this.targetFrameTime;
	}

	/**
	 * Get current animation statistics
	 */
	getStats(): AnimationStats {
		const totalTime = performance.now() - this.startTime;
		const averageFps =
			this.fpsHistory.length > 0
				? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
				: 0;

		const averageDeltaTime =
			this.deltaTimeHistory.length > 0
				? this.deltaTimeHistory.reduce((a, b) => a + b, 0) /
				  this.deltaTimeHistory.length
				: 0;

		return {
			totalFrames: this.frameNumber,
			framesSkipped: this.framesSkipped,
			averageFps,
			currentFps: this.fpsHistory[this.fpsHistory.length - 1] ?? 0,
			minFps: this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0,
			maxFps: this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0,
			averageDeltaTime,
			totalTime,
		};
	}

	/**
	 * Set visibility state (simulates tab visibility)
	 *
	 * @param visible - Whether the animation should be visible
	 */
	setVisible(visible: boolean): void {
		if (this.isVisible === visible) return;

		this.isVisible = visible;

		if (this.pauseWhenHidden) {
			if (visible && this.isPaused) {
				this.resume();
			} else if (!visible && this.isRunning && !this.isPaused) {
				this.pause();
			}
		}

		this.emit('visibilityChange', {visible});
	}

	/**
	 * Get visibility state
	 */
	getIsVisible(): boolean {
		return this.isVisible;
	}

	/**
	 * Get number of active callbacks
	 */
	getCallbackCount(): number {
		return this.callbacks.size;
	}

	/**
	 * Schedule the next animation frame
	 */
	private scheduleFrame(): void {
		if (!this.isRunning || this.isPaused) return;

		// Use setTimeout for Node.js environment
		// In a browser, we'd use requestAnimationFrame
		this.animationId = setTimeout(
			() => this.onAnimationFrame(),
			this.targetFrameTime,
		);
	}

	/**
	 * Handle animation frame
	 */
	private onAnimationFrame(): void {
		if (!this.isRunning || this.isPaused) return;

		const timestamp = performance.now();
		let deltaTime = timestamp - this.lastTimestamp;

		// Cap delta time to prevent large jumps
		if (deltaTime > this.maxDeltaTime) {
			deltaTime = this.maxDeltaTime;
		}

		// Calculate FPS
		const fps = deltaTime > 0 ? 1000 / deltaTime : 0;

		// Update history
		this.fpsHistory.push(fps);
		this.deltaTimeHistory.push(deltaTime);

		if (this.fpsHistory.length > this.maxFpsHistory) {
			this.fpsHistory.shift();
			this.deltaTimeHistory.shift();
		}

		// Determine if we should skip this frame
		let skipped = false;
		if (deltaTime < this.targetFrameTime * 0.5) {
			// Running too fast, skip occasional frames to maintain target
			this.skipCounter++;
			if (this.skipCounter < 2) {
				skipped = true;
				this.framesSkipped++;
			} else {
				this.skipCounter = 0;
			}
		}

		// Create frame info
		const frame: AnimationFrame = {
			frameNumber: ++this.frameNumber,
			timestamp,
			deltaTime,
			fps,
			skipped,
		};

		// Emit frame event
		this.emit('frame', frame);

		// Call all registered callbacks
		if (!skipped) {
			for (const callback of this.callbacks.values()) {
				try {
					callback(deltaTime, timestamp);
				} catch (error) {
					this.emit('error', error);
				}
			}
		}

		this.lastTimestamp = timestamp;

		// Schedule next frame
		this.scheduleFrame();
	}

	/**
	 * Reset all statistics
	 */
	resetStats(): void {
		this.frameNumber = 0;
		this.framesSkipped = 0;
		this.fpsHistory = [];
		this.deltaTimeHistory = [];
		this.startTime = performance.now();
		this.lastTimestamp = this.startTime;
	}

	/**
	 * Clear all callbacks
	 */
	clearCallbacks(): void {
		this.callbacks.clear();
	}

	/**
	 * Destroy the animation system
	 */
	destroy(): void {
		this.stop();
		this.clearCallbacks();
		this.removeAllListeners();
	}
}

/**
 * Create a new animation frame system
 *
 * @param options - Animation options
 * @returns New animation frame system
 */
export function createAnimationFrameSystem(
	options?: AnimationFrameOptions,
): AnimationFrameSystem {
	return new AnimationFrameSystem(options);
}

/**
 * Easing functions for animations
 */
export const Easing = {
	/** Linear interpolation */
	linear: (t: number): number => t,

	/** Quadratic ease in */
	easeInQuad: (t: number): number => t * t,

	/** Quadratic ease out */
	easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),

	/** Quadratic ease in-out */
	easeInOutQuad: (t: number): number =>
		t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

	/** Cubic ease in */
	easeInCubic: (t: number): number => t * t * t,

	/** Cubic ease out */
	easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

	/** Cubic ease in-out */
	easeInOutCubic: (t: number): number =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

	/** Elastic ease out */
	easeOutElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0
			? 0
			: t === 1
			? 1
			: Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},

	/** Bounce ease out */
	easeOutBounce: (t: number): number => {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (t < 1 / d1) {
			return n1 * t * t;
		} else if (t < 2 / d1) {
			const t2 = t - 1.5 / d1;
			return n1 * t2 * t2 + 0.75;
		} else if (t < 2.5 / d1) {
			const t2 = t - 2.25 / d1;
			return n1 * t2 * t2 + 0.9375;
		} else {
			const t2 = t - 2.625 / d1;
			return n1 * t2 * t2 + 0.984375;
		}
	},
} as const;

/**
 * Interpolate between two values
 *
 * @param start - Start value
 * @param end - End value
 * @param progress - Progress (0-1)
 * @param easing - Easing function
 * @returns Interpolated value
 */
export function interpolate(
	start: number,
	end: number,
	progress: number,
	easing: (t: number) => number = Easing.linear,
): number {
	const t = Math.max(0, Math.min(1, progress));
	return start + (end - start) * easing(t);
}

/**
 * Interpolate between two colors
 *
 * @param start - Start color [r, g, b]
 * @param end - End color [r, g, b]
 * @param progress - Progress (0-1)
 * @returns Interpolated color [r, g, b]
 */
export function interpolateColor(
	start: [number, number, number],
	end: [number, number, number],
	progress: number,
): [number, number, number] {
	const t = Math.max(0, Math.min(1, progress));
	return [
		Math.round(start[0] + (end[0] - start[0]) * t),
		Math.round(start[1] + (end[1] - start[1]) * t),
		Math.round(start[2] + (end[2] - start[2]) * t),
	];
}
