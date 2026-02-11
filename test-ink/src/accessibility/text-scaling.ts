/**
 * Text Scaling Module
 *
 * Provides text scaling functionality for the TUI framework.
 * Supports text size scaling, line spacing adjustment, and font weight adjustment.
 *
 * @module accessibility/text-scaling
 */

import type {TextScalingConfig} from './types.js';

/**
 * Text scaling preset
 */
export enum TextScalingPreset {
	/** Small text (0.8x) */
	SMALL = 'small',

	/** Normal text (1.0x) */
	NORMAL = 'normal',

	/** Large text (1.2x) */
	LARGE = 'large',

	/** Extra large text (1.5x) */
	EXTRA_LARGE = 'extra-large',

	/** Very large text (2.0x) */
	VERY_LARGE = 'very-large',

	/** Custom preset */
	CUSTOM = 'custom',
}

/**
 * Text scaling configuration with additional options
 */
export interface TextScalingOptions extends TextScalingConfig {
	/** The current preset */
	preset: TextScalingPreset;

	/** Minimum scale factor */
	minScale: number;

	/** Maximum scale factor */
	maxScale: number;

	/** Scale step for increment/decrement */
	scaleStep: number;

	/** Minimum line spacing */
	minLineSpacing: number;

	/** Maximum line spacing */
	maxLineSpacing: number;

	/** Line spacing step for increment/decrement */
	lineSpacingStep: number;
}

/**
 * Text scaling class
 */
export class TextScaling {
	/** Current configuration */
	private _config: TextScalingOptions;

	/** Preset configurations */
	private readonly _presets: Map<TextScalingPreset, TextScalingConfig>;

	/** Event listeners for configuration changes */
	private _listeners: Set<() => void>;

	/**
	 * Creates a new TextScaling instance
	 *
	 * @param options - Optional initial options
	 */
	constructor(options?: Partial<TextScalingOptions>) {
		this._presets = new Map();
		this._listeners = new Set();

		// Initialize presets
		this._initializePresets();

		// Initialize configuration
		this._config = {
			scale: 1.0,
			lineSpacing: 1.0,
			fontWeight: 'normal',
			preset: TextScalingPreset.NORMAL,
			minScale: 0.5,
			maxScale: 3.0,
			scaleStep: 0.1,
			minLineSpacing: 0.8,
			maxLineSpacing: 2.0,
			lineSpacingStep: 0.1,
			...options,
		};

		// Apply preset if specified
		if (options?.preset && options.preset !== TextScalingPreset.CUSTOM) {
			this.applyPreset(options.preset);
		}
	}

	/**
	 * Gets the current scale factor
	 */
	get scale(): number {
		return this._config.scale;
	}

	/**
	 * Sets the scale factor
	 */
	set scale(value: number) {
		this.setScale(value);
	}

	/**
	 * Gets the current line spacing
	 */
	get lineSpacing(): number {
		return this._config.lineSpacing;
	}

	/**
	 * Sets the line spacing
	 */
	set lineSpacing(value: number) {
		this.setLineSpacing(value);
	}

	/**
	 * Gets the current font weight
	 */
	get fontWeight(): 'normal' | 'bold' | 'light' {
		return this._config.fontWeight;
	}

	/**
	 * Sets the font weight
	 */
	set fontWeight(value: 'normal' | 'bold' | 'light') {
		this.setFontWeight(value);
	}

	/**
	 * Gets the current preset
	 */
	get preset(): TextScalingPreset {
		return this._config.preset;
	}

	/**
	 * Gets the current configuration
	 */
	get config(): TextScalingOptions {
		return {...this._config};
	}

	/**
	 * Sets the scale factor
	 *
	 * @param scale - The scale factor
	 */
	setScale(scale: number): void {
		const clampedScale = Math.max(
			this._config.minScale,
			Math.min(this._config.maxScale, scale),
		);

		if (this._config.scale !== clampedScale) {
			this._config.scale = clampedScale;
			this._config.preset = TextScalingPreset.CUSTOM;
			this._notifyListeners();
		}
	}

	/**
	 * Increases the scale factor
	 */
	increaseScale(): void {
		this.setScale(this._config.scale + this._config.scaleStep);
	}

	/**
	 * Decreases the scale factor
	 */
	decreaseScale(): void {
		this.setScale(this._config.scale - this._config.scaleStep);
	}

	/**
	 * Resets the scale factor to normal
	 */
	resetScale(): void {
		this.setScale(1.0);
	}

	/**
	 * Sets the line spacing
	 *
	 * @param spacing - The line spacing multiplier
	 */
	setLineSpacing(spacing: number): void {
		const clampedSpacing = Math.max(
			this._config.minLineSpacing,
			Math.min(this._config.maxLineSpacing, spacing),
		);

		if (this._config.lineSpacing !== clampedSpacing) {
			this._config.lineSpacing = clampedSpacing;
			this._config.preset = TextScalingPreset.CUSTOM;
			this._notifyListeners();
		}
	}

	/**
	 * Increases the line spacing
	 */
	increaseLineSpacing(): void {
		this.setLineSpacing(this._config.lineSpacing + this._config.lineSpacingStep);
	}

	/**
	 * Decreases the line spacing
	 */
	decreaseLineSpacing(): void {
		this.setLineSpacing(this._config.lineSpacing - this._config.lineSpacingStep);
	}

	/**
	 * Resets the line spacing to normal
	 */
	resetLineSpacing(): void {
		this.setLineSpacing(1.0);
	}

	/**
	 * Sets the font weight
	 *
	 * @param weight - The font weight
	 */
	setFontWeight(weight: 'normal' | 'bold' | 'light'): void {
		if (this._config.fontWeight !== weight) {
			this._config.fontWeight = weight;
			this._config.preset = TextScalingPreset.CUSTOM;
			this._notifyListeners();
		}
	}

	/**
	 * Toggles bold font weight
	 */
	toggleBold(): void {
		this.setFontWeight(
			this._config.fontWeight === 'bold' ? 'normal' : 'bold',
		);
	}

	/**
	 * Applies a preset configuration
	 *
	 * @param preset - The preset to apply
	 */
	applyPreset(preset: TextScalingPreset): void {
		const presetConfig = this._presets.get(preset);
		if (presetConfig) {
			this._config.scale = presetConfig.scale;
			this._config.lineSpacing = presetConfig.lineSpacing;
			this._config.fontWeight = presetConfig.fontWeight;
			this._config.preset = preset;
			this._notifyListeners();
		}
	}

	/**
	 * Sets a custom configuration
	 *
	 * @param config - The custom configuration
	 */
	setCustomConfig(config: Partial<TextScalingConfig>): void {
		if (config.scale !== undefined) {
			this.setScale(config.scale);
		}
		if (config.lineSpacing !== undefined) {
			this.setLineSpacing(config.lineSpacing);
		}
		if (config.fontWeight !== undefined) {
			this.setFontWeight(config.fontWeight);
		}
		this._config.preset = TextScalingPreset.CUSTOM;
	}

	/**
	 * Resets all settings to normal
	 */
	reset(): void {
		this.applyPreset(TextScalingPreset.NORMAL);
	}

	/**
	 * Calculates the scaled line height
	 *
	 * @param baseLineHeight - The base line height
	 * @returns The scaled line height
	 */
	calculateLineHeight(baseLineHeight: number): number {
		return baseLineHeight * this._config.lineSpacing;
	}

	/**
	 * Calculates the scaled font size
	 *
	 * @param baseFontSize - The base font size
	 * @returns The scaled font size
	 */
	calculateFontSize(baseFontSize: number): number {
		return baseFontSize * this._config.scale;
	}

	/**
	 * Gets the effective font weight for rendering
	 *
	 * @returns The effective font weight
	 */
	getEffectiveFontWeight(): number {
		switch (this._config.fontWeight) {
			case 'bold':
				return 700;
			case 'light':
				return 300;
			case 'normal':
			default:
				return 400;
		}
	}

	/**
	 * Registers a listener for configuration changes
	 *
	 * @param listener - The listener function
	 */
	onChange(listener: () => void): void {
		this._listeners.add(listener);
	}

	/**
	 * Unregisters a listener for configuration changes
	 *
	 * @param listener - The listener function
	 */
	offChange(listener: () => void): void {
		this._listeners.delete(listener);
	}

	/**
	 * Destroys the text scaling and cleans up resources
	 */
	destroy(): void {
		this._listeners.clear();
		this.reset();
	}

	/**
	 * Initializes the preset configurations
	 */
	private _initializePresets(): void {
		// Small preset
		this._presets.set(TextScalingPreset.SMALL, {
			scale: 0.8,
			lineSpacing: 1.0,
			fontWeight: 'normal',
		});

		// Normal preset
		this._presets.set(TextScalingPreset.NORMAL, {
			scale: 1.0,
			lineSpacing: 1.0,
			fontWeight: 'normal',
		});

		// Large preset
		this._presets.set(TextScalingPreset.LARGE, {
			scale: 1.2,
			lineSpacing: 1.2,
			fontWeight: 'normal',
		});

		// Extra large preset
		this._presets.set(TextScalingPreset.EXTRA_LARGE, {
			scale: 1.5,
			lineSpacing: 1.3,
			fontWeight: 'normal',
		});

		// Very large preset
		this._presets.set(TextScalingPreset.VERY_LARGE, {
			scale: 2.0,
			lineSpacing: 1.5,
			fontWeight: 'bold',
		});
	}

	/**
	 * Notifies all listeners of a configuration change
	 */
	private _notifyListeners(): void {
		for (const listener of this._listeners) {
			try {
				listener();
			} catch (error) {
				console.error('Error in text scaling listener:', error);
			}
		}
	}
}
