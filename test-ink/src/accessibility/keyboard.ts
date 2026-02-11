/**
 * Keyboard Navigation Module
 *
 * Provides keyboard navigation functionality for the TUI framework.
 * Implements keyboard shortcuts for common actions, global shortcuts,
 * widget-specific shortcuts, and shortcut conflict resolution.
 *
 * @module accessibility/keyboard
 */

import type {Widget} from '../widgets/types.js';
import type {KeyEvent} from '../events/types.js';
import type {KeyboardShortcut} from './types.js';

/**
 * Keyboard shortcut scope
 */
export enum ShortcutScope {
	/** Global shortcut (works anywhere) */
	GLOBAL = 'global',

	/** Widget-specific shortcut */
	WIDGET = 'widget',

	/** Context-specific shortcut */
	CONTEXT = 'context',
}

/**
 * Keyboard shortcut conflict resolution strategy
 */
export enum ConflictResolution {
	/** First registered shortcut wins */
	FIRST_WINS = 'first-wins',

	/** Last registered shortcut wins */
	LAST_WINS = 'last-wins',

	/** Highest priority shortcut wins */
	PRIORITY = 'priority',

	/** All shortcuts are executed */
	ALL = 'all',
}

/**
 * Keyboard shortcut match result
 */
export interface ShortcutMatch {
	/** The matched shortcut */
	shortcut: KeyboardShortcut;

	/** Whether the shortcut was handled */
	handled: boolean;

	/** Error if handling failed */
	error?: Error;
}

/**
 * Keyboard navigation class
 */
export class KeyboardNavigation {
	/** Registered keyboard shortcuts */
	private _shortcuts: Map<string, KeyboardShortcut[]>;

	/** Global shortcuts */
	private _globalShortcuts: KeyboardShortcut[];

	/** Widget-specific shortcuts */
	private _widgetShortcuts: Map<string, KeyboardShortcut[]>;

	/** Conflict resolution strategy */
	private _conflictResolution: ConflictResolution;

	/** Whether keyboard navigation is enabled */
	private _enabled: boolean;

	/** Currently active widget */
	private _activeWidget: Widget | null;

	/** Key combination separator */
	private static readonly KEY_SEPARATOR = '+';

	/**
	 * Creates a new KeyboardNavigation instance
	 */
	constructor() {
		this._shortcuts = new Map();
		this._globalShortcuts = [];
		this._widgetShortcuts = new Map();
		this._conflictResolution = ConflictResolution.PRIORITY;
		this._enabled = true;
		this._activeWidget = null;
	}

	/**
	 * Gets whether keyboard navigation is enabled
	 */
	get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Sets whether keyboard navigation is enabled
	 */
	set enabled(value: boolean) {
		this._enabled = value;
	}

	/**
	 * Gets the conflict resolution strategy
	 */
	get conflictResolution(): ConflictResolution {
		return this._conflictResolution;
	}

	/**
	 * Sets the conflict resolution strategy
	 */
	set conflictResolution(strategy: ConflictResolution) {
		this._conflictResolution = strategy;
	}

	/**
	 * Gets the currently active widget
	 */
	get activeWidget(): Widget | null {
		return this._activeWidget;
	}

	/**
	 * Sets the currently active widget
	 */
	set activeWidget(widget: Widget | null) {
		this._activeWidget = widget;
	}

	/**
	 * Registers a keyboard shortcut
	 *
	 * @param shortcut - The shortcut to register
	 */
	registerShortcut(shortcut: KeyboardShortcut): void {
		const normalizedKey = this._normalizeKey(shortcut.keys);

		if (!this._shortcuts.has(normalizedKey)) {
			this._shortcuts.set(normalizedKey, []);
		}

		this._shortcuts.get(normalizedKey)!.push(shortcut);

		// Add to global shortcuts if global
		if (shortcut.global) {
			this._globalShortcuts.push(shortcut);
		}

		// Add to widget shortcuts if widget-specific
		if (shortcut.widgetId) {
			if (!this._widgetShortcuts.has(shortcut.widgetId)) {
				this._widgetShortcuts.set(shortcut.widgetId, []);
			}
			this._widgetShortcuts.get(shortcut.widgetId)!.push(shortcut);
		}
	}

	/**
	 * Unregisters a keyboard shortcut
	 *
	 * @param keys - The key combination of the shortcut to unregister
	 * @param widgetId - Optional widget ID for widget-specific shortcuts
	 */
	unregisterShortcut(keys: string, widgetId?: string): void {
		const normalizedKey = this._normalizeKey(keys);

		// Remove from main shortcuts map
		const shortcuts = this._shortcuts.get(normalizedKey);
		if (shortcuts) {
			const filtered = shortcuts.filter(
				(s) => !widgetId || s.widgetId !== widgetId,
			);
			if (filtered.length === 0) {
				this._shortcuts.delete(normalizedKey);
			} else {
				this._shortcuts.set(normalizedKey, filtered);
			}
		}

		// Remove from global shortcuts
		this._globalShortcuts = this._globalShortcuts.filter(
			(s) => this._normalizeKey(s.keys) !== normalizedKey || (widgetId && s.widgetId !== widgetId),
		);

		// Remove from widget shortcuts
		if (widgetId) {
			const widgetShortcuts = this._widgetShortcuts.get(widgetId);
			if (widgetShortcuts) {
				const filtered = widgetShortcuts.filter(
					(s) => this._normalizeKey(s.keys) !== normalizedKey,
				);
				if (filtered.length === 0) {
					this._widgetShortcuts.delete(widgetId);
				} else {
					this._widgetShortcuts.set(widgetId, filtered);
				}
			}
		}
	}

	/**
	 * Handles a key event
	 *
	 * @param event - The key event to handle
	 * @returns Whether the event was handled
	 */
	handleKeyEvent(event: KeyEvent): boolean {
		if (!this._enabled) {
			return false;
		}

		const normalizedKey = this._normalizeKeyEvent(event);
		const shortcuts = this._shortcuts.get(normalizedKey);

		if (!shortcuts || shortcuts.length === 0) {
			return false;
		}

		// Filter shortcuts based on context
		const contextShortcuts = this._filterShortcutsByContext(shortcuts);

		if (contextShortcuts.length === 0) {
			return false;
		}

		// Resolve conflicts and execute shortcuts
		return this._executeShortcuts(contextShortcuts);
	}

	/**
	 * Gets all registered shortcuts
	 *
	 * @returns Map of key combinations to shortcuts
	 */
	getAllShortcuts(): Map<string, KeyboardShortcut[]> {
		return new Map(this._shortcuts);
	}

	/**
	 * Gets global shortcuts
	 *
	 * @returns List of global shortcuts
	 */
	getGlobalShortcuts(): KeyboardShortcut[] {
		return [...this._globalShortcuts];
	}

	/**
	 * Gets shortcuts for a specific widget
	 *
	 * @param widgetId - The widget ID
	 * @returns List of shortcuts for the widget
	 */
	getWidgetShortcuts(widgetId: string): KeyboardShortcut[] {
		return this._widgetShortcuts.get(widgetId) ?? [];
	}

	/**
	 * Checks if a key combination is registered
	 *
	 * @param keys - The key combination to check
	 * @returns Whether the key combination is registered
	 */
	hasShortcut(keys: string): boolean {
		const normalizedKey = this._normalizeKey(keys);
		return this._shortcuts.has(normalizedKey);
	}

	/**
	 * Gets the description for a shortcut
	 *
	 * @param keys - The key combination
	 * @returns The description, or undefined if not found
	 */
	getShortcutDescription(keys: string): string | undefined {
		const normalizedKey = this._normalizeKey(keys);
		const shortcuts = this._shortcuts.get(normalizedKey);
		return shortcuts?.[0]?.description;
	}

	/**
	 * Clears all shortcuts
	 */
	clearAllShortcuts(): void {
		this._shortcuts.clear();
		this._globalShortcuts = [];
		this._widgetShortcuts.clear();
	}

	/**
	 * Clears shortcuts for a specific widget
	 *
	 * @param widgetId - The widget ID
	 */
	clearWidgetShortcuts(widgetId: string): void {
		// Remove from widget shortcuts map
		this._widgetShortcuts.delete(widgetId);

		// Remove from main shortcuts map
		for (const [key, shortcuts] of this._shortcuts) {
			const filtered = shortcuts.filter((s) => s.widgetId !== widgetId);
			if (filtered.length === 0) {
				this._shortcuts.delete(key);
			} else {
				this._shortcuts.set(key, filtered);
			}
		}

		// Remove from global shortcuts
		this._globalShortcuts = this._globalShortcuts.filter(
			(s) => s.widgetId !== widgetId,
		);
	}

	/**
	 * Registers common accessibility shortcuts
	 */
	registerCommonShortcuts(): void {
		// Tab navigation
		this.registerShortcut({
			keys: 'Tab',
			action: () => this._handleTabNavigation(false),
			description: 'Move focus to next widget',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'Shift+Tab',
			action: () => this._handleTabNavigation(true),
			description: 'Move focus to previous widget',
			global: true,
			priority: 10,
		});

		// Arrow key navigation
		this.registerShortcut({
			keys: 'Up',
			action: () => this._handleArrowNavigation('up'),
			description: 'Move focus up',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'Down',
			action: () => this._handleArrowNavigation('down'),
			description: 'Move focus down',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'Left',
			action: () => this._handleArrowNavigation('left'),
			description: 'Move focus left',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'Right',
			action: () => this._handleArrowNavigation('right'),
			description: 'Move focus right',
			global: true,
			priority: 10,
		});

		// Enter/Space for activation
		this.registerShortcut({
			keys: 'Enter',
			action: () => this._handleActivation(),
			description: 'Activate focused widget',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'Space',
			action: () => this._handleActivation(),
			description: 'Activate focused widget',
			global: true,
			priority: 10,
		});

		// Escape for cancellation
		this.registerShortcut({
			keys: 'Escape',
			action: () => this._handleEscape(),
			description: 'Cancel or close',
			global: true,
			priority: 10,
		});

		// Home/End for navigation
		this.registerShortcut({
			keys: 'Home',
			action: () => this._handleHome(),
			description: 'Move to first item',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'End',
			action: () => this._handleEnd(),
			description: 'Move to last item',
			global: true,
			priority: 10,
		});

		// Page Up/Down for navigation
		this.registerShortcut({
			keys: 'PageUp',
			action: () => this._handlePageUp(),
			description: 'Move up one page',
			global: true,
			priority: 10,
		});

		this.registerShortcut({
			keys: 'PageDown',
			action: () => this._handlePageDown(),
			description: 'Move down one page',
			global: true,
			priority: 10,
		});
	}

	/**
	 * Destroys the keyboard navigation and cleans up resources
	 */
	destroy(): void {
		this._shortcuts.clear();
		this._globalShortcuts = [];
		this._widgetShortcuts.clear();
		this._enabled = false;
		this._activeWidget = null;
	}

	/**
	 * Normalizes a key combination string
	 *
	 * @param keys - The key combination to normalize
	 * @returns Normalized key combination
	 */
	private _normalizeKey(keys: string): string {
		return keys
			.toLowerCase()
			.split(KeyboardNavigation.KEY_SEPARATOR)
			.map((k) => k.trim())
			.sort()
			.join(KeyboardNavigation.KEY_SEPARATOR);
	}

	/**
	 * Normalizes a key event to a key combination string
	 *
	 * @param event - The key event to normalize
	 * @returns Normalized key combination
	 */
	private _normalizeKeyEvent(event: KeyEvent): string {
		const parts: string[] = [];

		if (event.ctrl) {
			parts.push('ctrl');
		}
		if (event.alt) {
			parts.push('alt');
		}
		if (event.shift) {
			parts.push('shift');
		}

		parts.push(event.key.toLowerCase());

		return parts.join(KeyboardNavigation.KEY_SEPARATOR);
	}

	/**
	 * Filters shortcuts based on current context
	 *
	 * @param shortcuts - The shortcuts to filter
	 * @returns Filtered shortcuts
	 */
	private _filterShortcutsByContext(shortcuts: KeyboardShortcut[]): KeyboardShortcut[] {
		const result: KeyboardShortcut[] = [];

		for (const shortcut of shortcuts) {
			// Global shortcuts always apply
			if (shortcut.global) {
				result.push(shortcut);
				continue;
			}

			// Widget-specific shortcuts apply if widget is active
			if (shortcut.widgetId && this._activeWidget) {
				if (this._activeWidget.id === shortcut.widgetId) {
					result.push(shortcut);
				}
				continue;
			}

			// Context-specific shortcuts
			if (!shortcut.global && !shortcut.widgetId) {
				result.push(shortcut);
			}
		}

		return result;
	}

	/**
	 * Executes shortcuts with conflict resolution
	 *
	 * @param shortcuts - The shortcuts to execute
	 * @returns Whether any shortcut was handled
	 */
	private _executeShortcuts(shortcuts: KeyboardShortcut[]): boolean {
		if (shortcuts.length === 0) {
			return false;
		}

		switch (this._conflictResolution) {
			case ConflictResolution.FIRST_WINS:
				return this._executeShortcut(shortcuts[0]);

			case ConflictResolution.LAST_WINS:
				return this._executeShortcut(shortcuts[shortcuts.length - 1]);

			case ConflictResolution.PRIORITY: {
				const sorted = [...shortcuts].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
				return this._executeShortcut(sorted[0]);
			}

			case ConflictResolution.ALL: {
				let handled = false;
				for (const shortcut of shortcuts) {
					if (this._executeShortcut(shortcut)) {
						handled = true;
					}
				}
				return handled;
			}

			default:
				return false;
		}
	}

	/**
	 * Executes a single shortcut
	 *
	 * @param shortcut - The shortcut to execute
	 * @returns Whether the shortcut was handled
	 */
	private _executeShortcut(shortcut: KeyboardShortcut): boolean {
		try {
			const result = shortcut.action();
			if (result instanceof Promise) {
				result.catch((error) => {
					console.error('Error executing keyboard shortcut:', error);
				});
			}
			return true;
		} catch (error) {
			console.error('Error executing keyboard shortcut:', error);
			return false;
		}
	}

	/**
	 * Handles tab navigation
	 *
	 * @param reverse - Whether to navigate in reverse
	 */
	private _handleTabNavigation(reverse: boolean): void {
		// This would be implemented by the focus manager
		// For now, just emit a custom event
		console.log(`Tab navigation: ${reverse ? 'previous' : 'next'}`);
	}

	/**
	 * Handles arrow key navigation
	 *
	 * @param direction - The direction to navigate
	 */
	private _handleArrowNavigation(direction: string): void {
		// This would be implemented by the focus manager
		console.log(`Arrow navigation: ${direction}`);
	}

	/**
	 * Handles widget activation
	 */
	private _handleActivation(): void {
		// This would be implemented by the widget system
		console.log('Widget activation');
	}

	/**
	 * Handles escape key
	 */
	private _handleEscape(): void {
		// This would be implemented by the widget system
		console.log('Escape pressed');
	}

	/**
	 * Handles home key
	 */
	private _handleHome(): void {
		// This would be implemented by the widget system
		console.log('Home pressed');
	}

	/**
	 * Handles end key
	 */
	private _handleEnd(): void {
		// This would be implemented by the widget system
		console.log('End pressed');
	}

	/**
	 * Handles page up key
	 */
	private _handlePageUp(): void {
		// This would be implemented by the widget system
		console.log('Page Up pressed');
	}

	/**
	 * Handles page down key
	 */
	private _handlePageDown(): void {
		// This would be implemented by the widget system
		console.log('Page Down pressed');
	}
}
