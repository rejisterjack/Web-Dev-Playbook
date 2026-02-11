/**
 * High Contrast Mode Module
 *
 * Provides high contrast mode functionality for the TUI framework.
 * Detects high contrast mode, applies high contrast themes, and supports
 * custom high contrast colors.
 *
 * @module accessibility/high-contrast
 */

import type {HighContrastPalette} from './types.js';
import {DEFAULT_HIGH_CONTRAST_PALETTE} from './types.js';

/**
 * High contrast mode detection method
 */
export enum HighContrastDetectionMethod {
	/** Environment variable detection */
	ENVIRONMENT = 'environment',

	/** Terminal capability detection */
	TERMINAL = 'terminal',

	/** Manual override */
	MANUAL = 'manual',

	/** Auto-detection */
	AUTO = 'auto',
}

/**
 * High contrast theme preset
 */
export enum HighContrastPreset {
	/** Black on white (light mode) */
	LIGHT = 'light',

	/** White on black (dark mode) */
	DARK = 'dark',

	/** Yellow on black (high visibility) */
	HIGH_VISIBILITY = 'high-visibility',

	/** Green on black (terminal style) */
	TERMINAL = 'terminal',

	/** Blue on white (low vision) */
	LOW_VISION = 'low-vision',

	/** Custom palette */
	CUSTOM = 'custom',
}

/**
 * High contrast mode configuration
 */
export interface HighContrastConfig {
	/** Whether high contrast mode is enabled */
	enabled: boolean;

	/** The detection method */
	detectionMethod: HighContrastDetectionMethod;

	/** The current preset */
	preset: HighContrastPreset;

	/** Custom palette (if preset is CUSTOM) */
	customPalette?: HighContrastPalette;

	/** Whether to automatically detect high contrast mode */
	autoDetect: boolean;

	/** Environment variable to check for high contrast preference */
	envVariable?: string;
}

/**
 * High contrast mode class
 */
export class HighContrastMode {
	/** Current configuration */
	private _config: HighContrastConfig;

	/** Current palette */
	private _palette: HighContrastPalette;

	/** Preset palettes */
	private readonly _presets: Map<HighContrastPreset, HighContrastPalette>;

	/** Event listeners for mode changes */
	private _listeners: Set<() => void>;

	/**
	 * Creates a new HighContrastMode instance
	 *
	 * @param config - Optional initial configuration
	 */
	constructor(config?: Partial<HighContrastConfig>) {
		this._presets = new Map();
		this._listeners = new Set();

		// Initialize presets
		this._initializePresets();

		// Initialize configuration
		this._config = {
			enabled: false,
			detectionMethod: HighContrastDetectionMethod.AUTO,
			preset: HighContrastPreset.DARK,
			autoDetect: true,
			envVariable: 'HIGH_CONTRAST',
			...config,
		};

		// Set initial palette
		this._palette = this._presets.get(this._config.preset) ?? DEFAULT_HIGH_CONTRAST_PALETTE;

		// Auto-detect if enabled
		if (this._config.autoDetect) {
			this.detect();
		}
	}

	/**
	 * Gets whether high contrast mode is enabled
	 */
	get enabled(): boolean {
		return this._config.enabled;
	}

	/**
	 * Gets the current palette
	 */
	get palette(): HighContrastPalette {
		return {...this._palette};
	}

	/**
	 * Gets the current preset
	 */
	get preset(): HighContrastPreset {
		return this._config.preset;
	}

	/**
	 * Gets the detection method
	 */
	get detectionMethod(): HighContrastDetectionMethod {
		return this._config.detectionMethod;
	}

	/**
	 * Enables high contrast mode
	 */
	enable(): void {
		if (!this._config.enabled) {
			this._config.enabled = true;
			this._notifyListeners();
		}
	}

	/**
	 * Disables high contrast mode
	 */
	disable(): void {
		if (this._config.enabled) {
			this._config.enabled = false;
			this._notifyListeners();
		}
	}

	/**
	 * Toggles high contrast mode
	 */
	toggle(): void {
		this._config.enabled = !this._config.enabled;
		this._notifyListeners();
	}

	/**
	 * Sets the high contrast preset
	 *
	 * @param preset - The preset to use
	 */
	setPreset(preset: HighContrastPreset): void {
		this._config.preset = preset;
		const palette = this._presets.get(preset);
		if (palette) {
			this._palette = {...palette};
		}
		this._notifyListeners();
	}

	/**
	 * Sets a custom high contrast palette
	 *
	 * @param palette - The custom palette
	 */
	setCustomPalette(palette: HighContrastPalette): void {
		this._config.preset = HighContrastPreset.CUSTOM;
		this._config.customPalette = {...palette};
		this._palette = {...palette};
		this._notifyListeners();
	}

	/**
	 * Detects high contrast mode preference
	 *
	 * @returns Whether high contrast mode is detected
	 */
	detect(): boolean {
		switch (this._config.detectionMethod) {
			case HighContrastDetectionMethod.ENVIRONMENT:
				return this._detectFromEnvironment();

			case HighContrastDetectionMethod.TERMINAL:
				return this._detectFromTerminal();

			case HighContrastDetectionMethod.AUTO:
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
	setDetectionMethod(method: HighContrastDetectionMethod): void {
		this._config.detectionMethod = method;
	}

	/**
	 * Gets a color from the palette
	 *
	 * @param colorName - The color name
	 * @returns The color value, or undefined if not found
	 */
	getColor(colorName: keyof HighContrastPalette): string | undefined {
		return this._palette[colorName];
	}

	/**
	 * Checks if a color meets WCAG contrast requirements
	 *
	 * @param foreground - Foreground color
	 * @param background - Background color
	 * @param level - WCAG level (AA or AAA)
	 * @returns Whether the contrast meets the requirement
	 */
	checkContrast(
		foreground: string,
		background: string,
		level: 'AA' | 'AAA' = 'AA',
	): boolean {
		const ratio = this._calculateContrastRatio(foreground, background);
		const threshold = level === 'AAA' ? 7.0 : 4.5;
		return ratio >= threshold;
	}

	/**
	 * Calculates the contrast ratio between two colors
	 *
	 * @param foreground - Foreground color
	 * @param background - Background color
	 * @returns The contrast ratio
	 */
	calculateContrastRatio(foreground: string, background: string): number {
		return this._calculateContrastRatio(foreground, background);
	}

	/**
	 * Registers a listener for mode changes
	 *
	 * @param listener - The listener function
	 */
	onChange(listener: () => void): void {
		this._listeners.add(listener);
	}

	/**
	 * Unregisters a listener for mode changes
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
	getConfig(): HighContrastConfig {
		return {...this._config};
	}

	/**
	 * Destroys the high contrast mode and cleans up resources
	 */
	destroy(): void {
		this._listeners.clear();
		this._config.enabled = false;
	}

	/**
	 * Initializes the preset palettes
	 */
	private _initializePresets(): void {
		// Light preset (black on white)
		this._presets.set(HighContrastPreset.LIGHT, {
			foreground: '#000000',
			background: '#FFFFFF',
			highlight: '#000080',
			highlightText: '#FFFFFF',
			border: '#000000',
			focus: '#0000FF',
			success: '#006400',
			warning: '#B8860B',
			error: '#8B0000',
		});

		// Dark preset (white on black)
		this._presets.set(HighContrastPreset.DARK, {
			foreground: '#FFFFFF',
			background: '#000000',
			highlight: '#FFFF00',
			highlightText: '#000000',
			border: '#FFFFFF',
			focus: '#FFFF00',
			success: '#00FF00',
			warning: '#FFFF00',
			error: '#FF0000',
		});

		// High visibility preset (yellow on black)
		this._presets.set(HighContrastPreset.HIGH_VISIBILITY, {
			foreground: '#FFFF00',
			background: '#000000',
			highlight: '#FFFFFF',
			highlightText: '#000000',
			border: '#FFFF00',
			focus: '#FFFFFF',
			success: '#00FF00',
			warning: '#FFFF00',
			error: '#FF0000',
		});

		// Terminal preset (green on black)
		this._presets.set(HighContrastPreset.TERMINAL, {
			foreground: '#00FF00',
			background: '#000000',
			highlight: '#FFFFFF',
			highlightText: '#000000',
			border: '#00FF00',
			focus: '#FFFFFF',
			success: '#00FF00',
			warning: '#FFFF00',
			error: '#FF0000',
		});

		// Low vision preset (blue on white)
		this._presets.set(HighContrastPreset.LOW_VISION, {
			foreground: '#0000FF',
			background: '#FFFFFF',
			highlight: '#000080',
			highlightText: '#FFFFFF',
			border: '#0000FF',
			focus: '#FF0000',
			success: '#006400',
			warning: '#B8860B',
			error: '#8B0000',
		});
	}

	/**
	 * Detects high contrast mode from environment variables
	 *
	 * @returns Whether high contrast mode is detected
	 */
	private _detectFromEnvironment(): boolean {
		const envVar = this._config.envVariable ?? 'HIGH_CONTRAST';
		const value = process.env[envVar];
		return value === '1' || value === 'true' || value === 'yes';
	}

	/**
	 * Detects high contrast mode from terminal capabilities
	 *
	 * @returns Whether high contrast mode is detected
	 */
	private _detectFromTerminal(): boolean {
		// Check terminal type
		const term = process.env.TERM;
		if (term) {
			// Some terminals indicate high contrast mode
			return term.includes('high-contrast') || term.includes('hc');
		}

		// Check color support
		const colorTerm = process.env.COLORTERM;
		if (colorTerm) {
			// Truecolor terminals may support high contrast
			return colorTerm === 'truecolor' || colorTerm === '24bit';
		}

		return false;
	}

	/**
	 * Auto-detects high contrast mode
	 *
	 * @returns Whether high contrast mode is detected
	 */
	private _detectAuto(): boolean {
		// Try environment detection first
		if (this._detectFromEnvironment()) {
			return true;
		}

		// Try terminal detection
		if (this._detectFromTerminal()) {
			return true;
		}

		return false;
	}

	/**
	 * Calculates the contrast ratio between two colors
	 *
	 * @param foreground - Foreground color
	 * @param background - Background color
	 * @returns The contrast ratio
	 */
	private _calculateContrastRatio(foreground: string, background: string): number {
		const fgLuminance = this._getLuminance(foreground);
		const bgLuminance = this._getLuminance(background);

		const lighter = Math.max(fgLuminance, bgLuminance);
		const darker = Math.min(fgLuminance, bgLuminance);

		return (lighter + 0.05) / (darker + 0.05);
	}

	/**
	 * Gets the relative luminance of a color
	 *
	 * @param color - The color (hex format)
	 * @returns The relative luminance
	 */
	private _getLuminance(color: string): number {
		const rgb = this._hexToRgb(color);
		if (!rgb) {
			return 0;
		}

		const [r, g, b] = rgb.map((c) => {
			const sRGB = c / 255;
			return sRGB <= 0.03928
				? sRGB / 12.92
				: Math.pow((sRGB + 0.055) / 1.055, 2.4);
		});

		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	/**
	 * Converts a hex color to RGB
	 *
	 * @param hex - The hex color
	 * @returns The RGB values, or null if invalid
	 */
	private _hexToRgb(hex: string): [number, number, number] | null {
		// Remove # if present
		const cleanHex = hex.replace('#', '');

		// Parse hex
		if (cleanHex.length === 3) {
			const r = parseInt(cleanHex[0] + cleanHex[0], 16);
			const g = parseInt(cleanHex[1] + cleanHex[1], 16);
			const b = parseInt(cleanHex[2] + cleanHex[2], 16);
			return [r, g, b];
		}

		if (cleanHex.length === 6) {
			const r = parseInt(cleanHex.substring(0, 2), 16);
			const g = parseInt(cleanHex.substring(2, 4), 16);
			const b = parseInt(cleanHex.substring(4, 6), 16);
			return [r, g, b];
		}

		return null;
	}

	/**
	 * Notifies all listeners of a mode change
	 */
	private _notifyListeners(): void {
		for (const listener of this._listeners) {
			try {
				listener();
			} catch (error) {
				console.error('Error in high contrast mode listener:', error);
			}
		}
	}
}
