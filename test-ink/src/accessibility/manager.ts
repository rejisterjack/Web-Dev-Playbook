/**
 * Accessibility Manager Module
 *
 * Main accessibility system that integrates all accessibility features.
 * Provides a unified interface for managing accessibility across the TUI framework.
 *
 * @module accessibility/manager
 */

import type {Widget} from '../widgets/types.js';
import type {AccessibilitySettings, FocusDirection} from './types.js';
import {DEFAULT_ACCESSIBILITY_SETTINGS} from './types.js';
import {ScreenReader} from './screen-reader.js';
import {AccessibilityFocusManager} from './focus.js';
import {KeyboardNavigation} from './keyboard.js';
import {HighContrastMode} from './high-contrast.js';
import {TextScaling} from './text-scaling.js';
import {ReducedMotion} from './reduced-motion.js';
import {AccessibilityTree} from './tree.js';

/**
 * Accessibility Manager class
 * The main accessibility system that integrates all accessibility features
 */
export class AccessibilityManager {
	/** Screen reader instance */
	private _screenReader: ScreenReader;

	/** Focus manager instance */
	private _focusManager: AccessibilityFocusManager;

	/** Keyboard navigation instance */
	private _keyboardNavigation: KeyboardNavigation;

	/** High contrast mode instance */
	private _highContrastMode: HighContrastMode;

	/** Text scaling instance */
	private _textScaling: TextScaling;

	/** Reduced motion instance */
	private _reducedMotion: ReducedMotion;

	/** Accessibility tree instance */
	private _accessibilityTree: AccessibilityTree;

	/** Current accessibility settings */
	private _settings: AccessibilitySettings;

	/** Whether the manager is initialized */
	private _initialized: boolean;

	/**
	 * Creates a new AccessibilityManager instance
	 *
	 * @param settings - Optional initial accessibility settings
	 */
	constructor(settings?: Partial<AccessibilitySettings>) {
		// Initialize settings
		this._settings = {
			...DEFAULT_ACCESSIBILITY_SETTINGS,
			...settings,
		};

		// Initialize components
		this._screenReader = new ScreenReader();
		this._focusManager = new AccessibilityFocusManager();
		this._keyboardNavigation = new KeyboardNavigation();
		this._highContrastMode = new HighContrastMode();
		this._textScaling = new TextScaling();
		this._reducedMotion = new ReducedMotion();
		this._accessibilityTree = new AccessibilityTree();

		this._initialized = false;

		// Apply initial settings
		this._applySettings();
	}

	/**
	 * Gets the screen reader instance
	 */
	get screenReader(): ScreenReader {
		return this._screenReader;
	}

	/**
	 * Gets the focus manager instance
	 */
	get focusManager(): AccessibilityFocusManager {
		return this._focusManager;
	}

	/**
	 * Gets the keyboard navigation instance
	 */
	get keyboardNavigation(): KeyboardNavigation {
		return this._keyboardNavigation;
	}

	/**
	 * Gets the high contrast mode instance
	 */
	get highContrastMode(): HighContrastMode {
		return this._highContrastMode;
	}

	/**
	 * Gets the text scaling instance
	 */
	get textScaling(): TextScaling {
		return this._textScaling;
	}

	/**
	 * Gets the reduced motion instance
	 */
	get reducedMotion(): ReducedMotion {
		return this._reducedMotion;
	}

	/**
	 * Gets the accessibility tree instance
	 */
	get accessibilityTree(): AccessibilityTree {
		return this._accessibilityTree;
	}

	/**
	 * Gets the current accessibility settings
	 */
	get settings(): AccessibilitySettings {
		return {...this._settings};
	}

	/**
	 * Gets whether the manager is initialized
	 */
	get initialized(): boolean {
		return this._initialized;
	}

	/**
	 * Initializes the accessibility manager
	 *
	 * @param rootWidget - The root widget of the application
	 */
	initialize(rootWidget: Widget): void {
		if (this._initialized) {
			return;
		}

		// Build accessibility tree
		this._accessibilityTree.build(rootWidget);

		// Register common keyboard shortcuts
		this._keyboardNavigation.registerCommonShortcuts();

		this._initialized = true;
	}

	/**
	 * Announces text to the screen reader
	 *
	 * @param text - The text to announce
	 * @param priority - The announcement priority
	 */
	announce(text: string, priority?: 'polite' | 'assertive'): void {
		if (priority === 'assertive') {
			this._screenReader.announceAssertive(text);
		} else {
			this._screenReader.announcePolite(text);
		}
	}

	/**
	 * Sets focus to a widget
	 *
	 * @param widget - The widget to focus
	 * @returns Whether focus was successfully set
	 */
	setFocus(widget: Widget): boolean {
		return this._focusManager.setFocus(widget);
	}

	/**
	 * Removes focus from the current widget
	 */
	removeFocus(): void {
		this._focusManager.removeFocus();
	}

	/**
	 * Moves focus in the specified direction
	 *
	 * @param direction - The direction to move focus
	 * @returns Whether focus was successfully moved
	 */
	moveFocus(direction: FocusDirection): boolean {
		return this._focusManager.moveFocus(direction);
	}

	/**
	 * Enables high contrast mode
	 */
	enableHighContrast(): void {
		this._highContrastMode.enable();
		this._settings.highContrastEnabled = true;
	}

	/**
	 * Disables high contrast mode
	 */
	disableHighContrast(): void {
		this._highContrastMode.disable();
		this._settings.highContrastEnabled = false;
	}

	/**
	 * Toggles high contrast mode
	 */
	toggleHighContrast(): void {
		this._highContrastMode.toggle();
		this._settings.highContrastEnabled = this._highContrastMode.enabled;
	}

	/**
	 * Enables reduced motion
	 */
	enableReducedMotion(): void {
		this._reducedMotion.enable();
		this._settings.reducedMotionEnabled = true;
	}

	/**
	 * Disables reduced motion
	 */
	disableReducedMotion(): void {
		this._reducedMotion.disable();
		this._settings.reducedMotionEnabled = false;
	}

	/**
	 * Toggles reduced motion
	 */
	toggleReducedMotion(): void {
		this._reducedMotion.toggle();
		this._settings.reducedMotionEnabled = this._reducedMotion.enabled;
	}

	/**
	 * Disables animations
	 */
	disableAnimations(): void {
		this._reducedMotion.enable();
		this._settings.reducedMotionEnabled = true;
	}

	/**
	 * Enables animations
	 */
	enableAnimations(): void {
		this._reducedMotion.disable();
		this._settings.reducedMotionEnabled = false;
	}

	/**
	 * Sets the text scale
	 *
	 * @param scale - The scale factor
	 */
	setTextScale(scale: number): void {
		this._textScaling.setScale(scale);
		this._settings.textScaling.scale = scale;
	}

	/**
	 * Increases the text scale
	 */
	increaseTextScale(): void {
		this._textScaling.increaseScale();
		this._settings.textScaling.scale = this._textScaling.scale;
	}

	/**
	 * Decreases the text scale
	 */
	decreaseTextScale(): void {
		this._textScaling.decreaseScale();
		this._settings.textScaling.scale = this._textScaling.scale;
	}

	/**
	 * Resets the text scale to normal
	 */
	resetTextScale(): void {
		this._textScaling.resetScale();
		this._settings.textScaling.scale = 1.0;
	}

	/**
	 * Registers a focusable widget
	 *
	 * @param widget - The widget to register
	 */
	registerFocusable(widget: Widget): void {
		this._focusManager.registerFocusable(widget);
	}

	/**
	 * Unregisters a focusable widget
	 *
	 * @param widget - The widget to unregister
	 */
	unregisterFocusable(widget: Widget): void {
		this._focusManager.unregisterFocusable(widget);
	}

	/**
	 * Registers a keyboard shortcut
	 *
	 * @param keys - The key combination
	 * @param action - The action to perform
	 * @param description - Optional description
	 */
	registerShortcut(
		keys: string,
		action: () => void | Promise<void>,
		description?: string,
	): void {
		this._keyboardNavigation.registerShortcut({
			keys,
			action,
			description,
			global: true,
			priority: 10,
		});
	}

	/**
	 * Unregisters a keyboard shortcut
	 *
	 * @param keys - The key combination
	 */
	unregisterShortcut(keys: string): void {
		this._keyboardNavigation.unregisterShortcut(keys);
	}

	/**
	 * Updates the accessibility tree
	 *
	 * @param rootWidget - The root widget
	 */
	updateTree(rootWidget: Widget): void {
		this._accessibilityTree.build(rootWidget);
	}

	/**
	 * Gets the accessible label for a widget
	 *
	 * @param widget - The widget
	 * @returns The accessible label
	 */
	getAccessibleLabel(widget: Widget): string {
		const node = this._accessibilityTree.getNode(widget.id);
		return node?.label ?? widget.id;
	}

	/**
	 * Gets the accessible description for a widget
	 *
	 * @param widget - The widget
	 * @returns The accessible description, or undefined
	 */
	getAccessibleDescription(widget: Widget): string | undefined {
		const node = this._accessibilityTree.getNode(widget.id);
		return node?.description;
	}

	/**
	 * Checks if a widget is focusable
	 *
	 * @param widget - The widget
	 * @returns Whether the widget is focusable
	 */
	isFocusable(widget: Widget): boolean {
		return this._focusManager.isFocusable(widget);
	}

	/**
	 * Gets all focusable widgets
	 *
	 * @returns Array of focusable widgets
	 */
	getFocusableWidgets(): Widget[] {
		return this._focusManager.focusableWidgets;
	}

	/**
	 * Gets the next focusable widget
	 *
	 * @param current - The current widget
	 * @param direction - The direction to move
	 * @returns The next focusable widget, or null
	 */
	getNextFocusableWidget(
		current: Widget,
		direction: FocusDirection,
	): Widget | null {
		return this._focusManager.getNextFocusableWidget(current, direction);
	}

	/**
	 * Updates accessibility settings
	 *
	 * @param settings - The settings to update
	 */
	updateSettings(settings: Partial<AccessibilitySettings>): void {
		this._settings = {...this._settings, ...settings};
		this._applySettings();
	}

	/**
	 * Resets all accessibility settings to defaults
	 */
	resetSettings(): void {
		this._settings = {...DEFAULT_ACCESSIBILITY_SETTINGS};
		this._applySettings();
	}

	/**
	 * Enables all accessibility features
	 */
	enableAll(): void {
		this._settings.screenReaderEnabled = true;
		this._settings.keyboardNavigationEnabled = true;
		this._settings.focusIndicatorsEnabled = true;
		this._screenReader.enabled = true;
		this._focusManager.enabled = true;
		this._keyboardNavigation.enabled = true;
	}

	/**
	 * Disables all accessibility features
	 */
	disableAll(): void {
		this._settings.screenReaderEnabled = false;
		this._settings.keyboardNavigationEnabled = false;
		this._settings.focusIndicatorsEnabled = false;
		this._screenReader.enabled = false;
		this._focusManager.enabled = false;
		this._keyboardNavigation.enabled = false;
	}

	/**
	 * Destroys the accessibility manager and cleans up resources
	 */
	destroy(): void {
		this._screenReader.destroy();
		this._focusManager.destroy();
		this._keyboardNavigation.destroy();
		this._highContrastMode.destroy();
		this._textScaling.destroy();
		this._reducedMotion.destroy();
		this._accessibilityTree.destroy();
		this._initialized = false;
	}

	/**
	 * Applies the current settings to all components
	 */
	private _applySettings(): void {
		// Apply screen reader setting
		this._screenReader.enabled = this._settings.screenReaderEnabled;

		// Apply high contrast setting
		if (this._settings.highContrastEnabled) {
			this._highContrastMode.enable();
		} else {
			this._highContrastMode.disable();
		}

		// Apply reduced motion setting
		if (this._settings.reducedMotionEnabled) {
			this._reducedMotion.enable();
		} else {
			this._reducedMotion.disable();
		}

		// Apply text scaling setting
		this._textScaling.scale = this._settings.textScaling.scale;
		this._textScaling.lineSpacing = this._settings.textScaling.lineSpacing;
		this._textScaling.fontWeight = this._settings.textScaling.fontWeight;

		// Apply focus indicator setting
		this._focusManager.focusIndicator = {
			enabled: this._settings.focusIndicatorsEnabled,
			style: this._focusManager.focusIndicator.style,
		};

		// Apply keyboard navigation setting
		this._keyboardNavigation.enabled = this._settings.keyboardNavigationEnabled;
	}
}
