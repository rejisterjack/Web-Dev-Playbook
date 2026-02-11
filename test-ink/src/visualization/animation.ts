/**
 * Animation Manager Module
 *
 * Provides the AnimationManager class for chart animations.
 * Supports transitions between data states and easing functions.
 *
 * @module visualization/animation
 */

import type {EasingFunction} from './types.js';

/**
 * Animation state
 */
export interface AnimationState {
	/** Current progress (0-1) */
	progress: number;

	/** Whether animation is running */
	running: boolean;

	/** Animation start time */
	startTime: number;

	/** Animation duration */
	duration: number;

	/** Easing function */
	easing: EasingFunction;
}

/**
 * Animation frame callback
 */
export type AnimationFrameCallback = (progress: number, easedProgress: number) => void;

/**
 * Animation complete callback
 */
export type AnimationCompleteCallback = () => void;

/**
 * Animation configuration
 */
export interface AnimationConfig {
	/** Animation duration in milliseconds */
	duration: number;

	/** Easing function */
	easing: EasingFunction;

	/** Frame callback */
	onFrame: AnimationFrameCallback;

	/** Complete callback */
	onComplete?: AnimationCompleteCallback;
}

/**
 * Animation manager for chart animations
 */
export class AnimationManager {
	/** Active animations */
	private animations: Map<string, AnimationConfig> = new Map();

	/** Animation states */
	private states: Map<string, AnimationState> = new Map();

	/** Animation interval ID */
	private intervalId: NodeJS.Timeout | null = null;

	/** Last timestamp */
	private lastTimestamp: number = 0;

	/** Animation frame rate (ms) */
	private readonly frameRate = 16; // ~60fps

	/**
	 * Create a new animation manager
	 */
	constructor() {
		// Start animation loop
		this.startAnimationLoop();
	}

	/**
	 * Start an animation
	 *
	 * @param id - Animation ID
	 * @param config - Animation configuration
	 */
	start(id: string, config: AnimationConfig): void {
		this.animations.set(id, config);
		this.states.set(id, {
			progress: 0,
			running: true,
			startTime: Date.now(),
			duration: config.duration,
			easing: config.easing,
		});

		// Start animation loop if not running
		if (!this.intervalId) {
			this.startAnimationLoop();
		}
	}

	/**
	 * Stop an animation
	 *
	 * @param id - Animation ID
	 */
	stop(id: string): void {
		const state = this.states.get(id);
		if (state) {
			state.running = false;
		}
	}

	/**
	 * Remove an animation
	 *
	 * @param id - Animation ID
	 */
	remove(id: string): void {
		this.animations.delete(id);
		this.states.delete(id);
	}

	/**
	 * Check if an animation is running
	 *
	 * @param id - Animation ID
	 * @returns True if animation is running
	 */
	isRunning(id: string): boolean {
		const state = this.states.get(id);
		return state?.running ?? false;
	}

	/**
	 * Get animation progress
	 *
	 * @param id - Animation ID
	 * @returns Animation progress (0-1)
	 */
	getProgress(id: string): number {
		const state = this.states.get(id);
		return state?.progress ?? 0;
	}

	/**
	 * Clear all animations
	 */
	clear(): void {
		this.animations.clear();
		this.states.clear();
	}

	/**
	 * Get number of active animations
	 */
	getActiveCount(): number {
		let count = 0;
		for (const state of this.states.values()) {
			if (state.running) {
				count++;
			}
		}
		return count;
	}

	/**
	 * Start animation loop
	 */
	private startAnimationLoop(): void {
		if (this.intervalId) {
			return;
		}

		const loop = () => {
			// Update all animations
			let hasRunning = false;
			const now = Date.now();

			for (const [id, config] of this.animations.entries()) {
				const state = this.states.get(id);
				if (!state || !state.running) {
					continue;
				}

				hasRunning = true;

				// Calculate progress
				const elapsed = now - state.startTime;
				state.progress = Math.min(1, elapsed / state.duration);

				// Apply easing
				const easedProgress = this.applyEasing(state.progress, state.easing);

				// Call frame callback
				config.onFrame(state.progress, easedProgress);

				// Check if animation is complete
				if (state.progress >= 1) {
					state.running = false;
					if (config.onComplete) {
						config.onComplete();
					}
				}
			}

			// Continue loop if there are running animations
			if (hasRunning) {
				this.intervalId = setTimeout(loop, this.frameRate);
			} else {
				this.intervalId = null;
			}
		};

		this.intervalId = setTimeout(loop, this.frameRate);
	}

	/**
	 * Apply easing function
	 *
	 * @param progress - Progress value (0-1)
	 * @param easing - Easing function
	 * @returns Eased progress value
	 */
	private applyEasing(progress: number, easing: EasingFunction): number {
		switch (easing) {
			case 'linear':
				return progress;

			case 'easeIn':
				return progress * progress;

			case 'easeOut':
				return progress * (2 - progress);

			case 'easeInOut':
				return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

			case 'elastic':
				if (progress === 0 || progress === 1) {
					return progress;
				}
				return Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

			case 'bounce':
				if (progress < 1 / 2.75) {
					return 7.5625 * progress * progress;
				} else if (progress < 2 / 2.75) {
					const p = progress - 1.5 / 2.75;
					return 7.5625 * p * p + 0.75;
				} else if (progress < 2.5 / 2.75) {
					const p = progress - 2.25 / 2.75;
					return 7.5625 * p * p + 0.9375;
				} else {
					const p = progress - 2.625 / 2.75;
					return 7.5625 * p * p + 0.984375;
				}

			case 'backIn':
				return progress * progress * ((1.70158 + 1) * progress - 1.70158);

			case 'backOut':
				return --progress * progress * ((1.70158 + 1) * progress + 1.70158) + 1;

			default:
				return progress;
		}
	}

	/**
	 * Interpolate between two values
	 *
	 * @param start - Start value
	 * @param end - End value
	 * @param progress - Progress (0-1)
	 * @returns Interpolated value
	 */
	interpolate(start: number, end: number, progress: number): number {
		return start + (end - start) * progress;
	}

	/**
	 * Interpolate between two arrays
	 *
	 * @param start - Start array
	 * @param end - End array
	 * @param progress - Progress (0-1)
	 * @returns Interpolated array
	 */
	interpolateArray(start: number[], end: number[], progress: number): number[] {
		const result: number[] = [];
		const maxLength = Math.max(start.length, end.length);

		for (let i = 0; i < maxLength; i++) {
			const startVal = start[i] ?? 0;
			const endVal = end[i] ?? 0;
			result.push(this.interpolate(startVal, endVal, progress));
		}

		return result;
	}

	/**
	 * Create a transition animation
	 *
	 * @param id - Animation ID
	 * @param from - Start value
	 * @param to - End value
	 * @param duration - Duration in milliseconds
	 * @param easing - Easing function
	 * @param onUpdate - Update callback
	 * @param onComplete - Complete callback
	 */
	transition(
		id: string,
		from: number,
		to: number,
		duration: number,
		easing: EasingFunction,
		onUpdate: (value: number) => void,
		onComplete?: () => void,
	): void {
		this.start(id, {
			duration,
			easing,
			onFrame: (progress, easedProgress) => {
				const value = this.interpolate(from, to, easedProgress);
				onUpdate(value);
			},
			onComplete,
		});
	}

	/**
	 * Create a transition animation for arrays
	 *
	 * @param id - Animation ID
	 * @param from - Start array
	 * @param to - End array
	 * @param duration - Duration in milliseconds
	 * @param easing - Easing function
	 * @param onUpdate - Update callback
	 * @param onComplete - Complete callback
	 */
	transitionArray(
		id: string,
		from: number[],
		to: number[],
		duration: number,
		easing: EasingFunction,
		onUpdate: (values: number[]) => void,
		onComplete?: () => void,
	): void {
		this.start(id, {
			duration,
			easing,
			onFrame: (progress, easedProgress) => {
				const values = this.interpolateArray(from, to, easedProgress);
				onUpdate(values);
			},
			onComplete,
		});
	}

	/**
	 * Destroy the animation manager
	 */
	destroy(): void {
		if (this.intervalId) {
			clearTimeout(this.intervalId);
			this.intervalId = null;
		}
		this.clear();
	}
}
