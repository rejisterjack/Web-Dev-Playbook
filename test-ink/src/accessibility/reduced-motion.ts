/**
 * Reduced Motion Module
 *
 * Provides reduced motion functionality for the TUI framework.
 * Detects reduced motion preference and disables animations when enabled.
 *
 * @module accessibility/reduced-motion
 */

import {ReducedMotionPreference} from './types.js';

/**
 * Reduced motion detection method
 */
export enum ReducedMotionDetectionMethod {
	/** Environment variable detection */
	ENVIRONMENT = 'environment',

	/** System preference detection */
	SYSTEM = 'system',

	/** Manual override */
	MANUAL = 'manual',

	/** Auto-detection */
	AUTO = 'auto',
}

/**
 * Animation type
 */
export enum AnimationType {
	/** Fade animation */
	FADE = 'fade',

	/** Slide animation */
	SLIDE = 'slide',

	/** Scale animation */
	SCALE = 'scale',

	/** Rotate animation */
	ROTATE = 'rotate',

	/** Bounce animation */
	BOUNCE = 'bounce',

	/** Pulse animation */
	PULSE = 'pulse',

	/** Custom animation */
	CUSTOM = 'custom',
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
	/** Animation type */
	type: AnimationType;

	/** Animation duration in milliseconds */
	duration: number;

	/** Animation easing function */
	easing: string;

	/** Whether the animation is enabled */
	enabled: boolean;
}

/**
 * Reduced motion configuration
 */
export interface ReducedMotionConfig {
	/** Whether reduced motion is enabled */
	enabled: boolean;

	/** The detection method */
	detectionMethod: ReducedMotionDetectionMethod;

	/** The current preference */
	preference: ReducedMotionPreference;

	/** Whether to automatically detect reduced motion */
	autoDetect: boolean;

	/** Environment variable to check for reduced motion preference */
	envVariable?: string;

	/** Default animation duration when reduced motion is enabled */
	reducedDuration: number;

	/** Whether to skip animations entirely when reduced motion is enabled */
	skipAnimations: boolean;
}

/**
 * Reduced motion class
 */
export class ReducedMotion {
	/** Current configuration */
	private _config: ReducedMotionConfig;

	/** Registered animations */
	private _animations: Map<string, AnimationConfig>;

	/** Event listeners for preference changes */
	private _listeners: Set<() => void>;

	/**
	 * Creates a new ReducedMotion instance
	 *
	 * @param config - Optional initial configuration
	 */
	constructor(config?: Partial<ReducedMotionConfig>) {
		this._animations = new Map();
		this._listeners = new Set();

		// Initialize configuration
		this._config = {
			enabled: false,
			detectionMethod: ReducedMotionDetectionMethod.AUTO,
			preference: ReducedMotionPreference.NORMAL,
			autoDetect: true,
			envVariable: 'REDUCED_MOTION',
			reducedDuration: 0,
			skipAnimations: true,
			...config,
		};

		// Auto-detect if enabled
		if (this._config.autoDetect) {
			this.detect();
		}
	}

	/**
	 * Gets whether reduced motion is enabled
	 */
	get enabled(): boolean {
		return this._config.enabled;
	}

	/**
	 * Gets the current preference
	 */
	get preference(): ReducedMotionPreference {
		return this._config.preference;
	}

	/**
	 * Gets the detection method
	 */
	get detectionMethod(): ReducedMotionDetectionMethod {
		return this._config.detectionMethod;
	}

	/**
	 * Gets whether animations should be skipped
	 */
	get skipAnimations(): boolean {
		return this._config.enabled && this._config.skipAnimations;
	}

	/**
	 * Enables reduced motion
	 */
	enable(): void {
		if (!this._config.enabled) {
			this._config.enabled = true;
			this._config.preference = ReducedMotionPreference.REDUCED;
			this._notifyListeners();
		}
	}

	/**
	 * Disables reduced motion
	 */
	disable(): void {
		if (this._config.enabled) {
			this._config.enabled = false;
			this._config.preference = ReducedMotionPreference.NORMAL;
			this._notifyListeners();
		}
	}

	/**
	 * Toggles reduced motion
	 */
	toggle(): void {
		if (this._config.enabled) {
			this.disable();
		} else {
			this.enable();
		}
	}

	/**
	 * Detects reduced motion preference
	 *
	 * @returns Whether reduced motion is detected
	 */
	detect(): boolean {
		switch (this._config.detectionMethod) {
			case ReducedMotionDetectionMethod.ENVIRONMENT:
				return this._detectFromEnvironment();

			case ReducedMotionDetectionMethod.SYSTEM:
				return this._detectFromSystem();

			case ReducedMotionDetectionMethod.AUTO:
				return this._detectAuto();

			default:
				return false;
		}
	}

	/**
	 * Sets the detection method
	 *
	 * @param method - The detection method
	 */
	setDetectionMethod(method: ReducedMotionDetectionMethod): void {
		this._config.detectionMethod = method;
	}

	/**
	 * Registers an animation
	 *
	 * @param id - Unique identifier for the animation
	 * @param config - Animation configuration
	 */
	registerAnimation(id: string, config: AnimationConfig): void {
		this._animations.set(id, {...config});
	}

	/**
	 * Unregisters an animation
	 *
	 * @param id - The animation ID
	 */
	unregisterAnimation(id: string): void {
		this._animations.delete(id);
	}

	/**
	 * Gets an animation configuration
	 *
	 * @param id - The animation ID
	 * @returns The animation configuration, or undefined if not found
	 */
	getAnimation(id: string): AnimationConfig | undefined {
		return this._animations.get(id);
	}

	/**
	 * Gets the effective animation duration
	 *
	 * @param id - The animation ID
	 * @returns The effective duration
	 */
	getEffectiveDuration(id: string): number {
		const animation = this._animations.get(id);
		if (!animation) {
			return 0;
		}

		if (this._config.enabled) {
			if (this._config.skipAnimations) {
				return 0;
			}
			return this._config.reducedDuration;
		}

		return animation.duration;
	}

	/**
	 * Checks if an animation should play
	 *
	 * @param id - The animation ID
	 * @returns Whether the animation should play
	 */
	shouldPlayAnimation(id: string): boolean {
		const animation = this._animations.get(id);
		if (!animation) {
			return false;
		}

		if (!animation.enabled) {
			return false;
		}

		if (this._config.enabled && this._config.skipAnimations) {
			return false;
		}

		return true;
	}

	/**
	 * Gets all registered animations
	 *
	 * @returns Map of animation IDs to configurations
	 */
	getAllAnimations(): Map<string, AnimationConfig> {
		return new Map(this._animations);
	}

	/**
	 * Clears all registered animations
	 */
	clearAnimations(): void {
		this._animations.clear();
	}

	/**
	 * Registers a listener for preference changes
	 *
	 * @param listener - The listener function
	 */
	onChange(listener: () => void): void {
		this._listeners.add(listener);
	}

	/**
	 * Unregisters a listener for preference changes
	 *
	 * @param listener - The listener function
	 */
	offChange(listener: () => void): void {
		this._listeners.delete(listener);
	}

	/**
	 * Gets the current configuration
	 *
	 * @returns The current configuration
	 */
	getConfig(): ReducedMotionConfig {
		return {...this._config};
	}

	/**
	 * Destroys the reduced motion and cleans up resources
	 */
	destroy(): void {
		this._listeners.clear();
		this._animations.clear();
		this._config.enabled = false;
	}

	/**
	 * Detects reduced motion preference from environment variables
	 *
	 * @returns Whether reduced motion is detected
	 */
	private _detectFromEnvironment(): boolean {
		const envVar = this._config.envVariable ?? 'REDUCED_MOTION';
		const value = process.env[envVar];
		const detected = value === '1' || value === 'true' || value === 'yes';

		if (detected) {
			this._config.enabled = true;
			this._config.preference = ReducedMotionPreference.REDUCED;
		} else {
			this._config.enabled = false;
			this._config.preference = ReducedMotionPreference.NORMAL;
		}

		return detected;
	}

	/**
	 * Detects reduced motion preference from system settings
	 *
	 * @returns Whether reduced motion is detected
	 */
	private _detectFromSystem(): boolean {
		// In a terminal environment, we can't directly access system preferences
		// This is a placeholder for platform-specific implementations

		// On macOS, we could check: defaults read -g AppleReduceMotion
		// On Windows, we could check registry settings
		// On Linux, we could check GNOME/KDE accessibility settings

		// For now, return false
		return false;
	}

	/**
	 * Auto-detects reduced motion preference
	 *
	 * @returns Whether reduced motion is detected
	 */
	private _detectAuto(): boolean {
		// Try environment detection first
		if (this._detectFromEnvironment()) {
			return true;
		}

		// Try system detection
		if (this._detectFromSystem()) {
			return true;
		}

		return false;
	}

	/**
	 * Notifies all listeners of a preference change
	 */
	private _notifyListeners(): void {
		for (const listener of this._listeners) {
			try {
				listener();
			} catch (error) {
				console.error('Error in reduced motion listener:', error);
			}
		}
	}
}
