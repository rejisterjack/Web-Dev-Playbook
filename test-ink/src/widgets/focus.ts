/**
 * Focus Manager Module
 *
 * Provides the FocusManager class for managing widget focus in the TUI.
 * Tracks focused widget, supports tab navigation, and focus trapping.
 *
 * @module widgets/focus
 */

import type {Widget, FocusableWidget} from './types.js';
import {WidgetEventType} from './types.js';
import {BaseWidget} from './base.js';

/**
 * Focus change event callback
 */
export type FocusChangeCallback = (
	previousWidget: Widget | null,
	currentWidget: Widget | null,
) => void;

/**
 * Focus manager for handling widget focus
 *
 * Provides:
 * - Track current focused widget
 * - Support for tab navigation
 * - Support for focus trapping
 * - Focus change notifications
 */
export class FocusManager {
	/** Currently focused widget */
	private focusedWidget: Widget | null = null;

	/** Root widget of the focus scope */
	private rootWidget: Widget | null = null;

	/** Whether focus is trapped within the scope */
	private trapped = false;

	/** Focus change callbacks */
	private changeCallbacks: Set<FocusChangeCallback> = new Set();

	/** Tab order cache */
	private tabOrder: Widget[] = [];

	/** Whether tab order needs recalculation */
	private tabOrderDirty = true;

	/**
	 * Create a new focus manager
	 *
	 * @param rootWidget - Root widget of the focus scope
	 * @param trapped - Whether to trap focus within the scope
	 */
	constructor(rootWidget?: Widget, trapped = false) {
		if (rootWidget) {
			this.setRootWidget(rootWidget);
		}
		this.trapped = trapped;
	}

	/**
	 * Get the currently focused widget
	 */
	get currentFocus(): Widget | null {
		return this.focusedWidget;
	}

	/**
	 * Get the root widget
	 */
	get root(): Widget | null {
		return this.rootWidget;
	}

	/**
	 * Check if focus is trapped
	 */
	get isTrapped(): boolean {
		return this.trapped;
	}

	/**
	 * Set whether focus is trapped
	 */
	setTrap(trapped: boolean): void {
		this.trapped = trapped;
	}

	/**
	 * Set the root widget for this focus manager
	 *
	 * @param widget - Root widget
	 */
	setRootWidget(widget: Widget): void {
		// Clear focus if current focus is outside new root
		if (this.focusedWidget && !this.isInScope(this.focusedWidget)) {
			this.blur();
		}

		this.rootWidget = widget;
		this.tabOrderDirty = true;
	}

	/**
	 * Check if a widget is within the focus scope
	 *
	 * @param widget - Widget to check
	 */
	isInScope(widget: Widget): boolean {
		if (!this.rootWidget) {
			return true;
		}

		// Check if widget is the root or a descendant
		let current: Widget | null = widget;
		while (current) {
			if (current === this.rootWidget) {
				return true;
			}
			current = current.parent;
		}

		return false;
	}

	/**
	 * Focus a specific widget
	 *
	 * @param widget - Widget to focus
	 * @returns True if focus was successful
	 */
	focus(widget: Widget): boolean {
		// Check if widget is focusable
		if (!this.canReceiveFocus(widget)) {
			return false;
		}

		// Check if widget is in scope
		if (!this.isInScope(widget)) {
			return false;
		}

		// Don't refocus if already focused
		if (this.focusedWidget === widget) {
			return true;
		}

		// Blur current focus
		const previousWidget = this.focusedWidget;
		if (previousWidget) {
			this.blur();
		}

		// Set new focus
		this.focusedWidget = widget;
		(widget as FocusableWidget).onFocus?.();

		// Notify listeners
		this.notifyChange(previousWidget, widget);

		return true;
	}

	/**
	 * Remove focus from the current widget
	 */
	blur(): void {
		if (!this.focusedWidget) {
			return;
		}

		const previousWidget = this.focusedWidget;
		this.focusedWidget = null;

		(previousWidget as FocusableWidget).onBlur?.();

		// Notify listeners
		this.notifyChange(previousWidget, null);
	}

	/**
	 * Move focus to the next widget in tab order
	 *
	 * @returns True if focus moved successfully
	 */
	next(): boolean {
		const tabOrder = this.getTabOrder();

		if (tabOrder.length === 0) {
			return false;
		}

		// Find current index
		let currentIndex = -1;
		if (this.focusedWidget) {
			currentIndex = tabOrder.indexOf(this.focusedWidget);
		}

		// Find next focusable widget
		const startIndex = currentIndex;
		let nextIndex = currentIndex;

		do {
			nextIndex = (nextIndex + 1) % tabOrder.length;

			// If we've wrapped around
			if (nextIndex === startIndex) {
				// If trapped, stay at current; otherwise return false
				return this.trapped ? false : false;
			}

			const candidate = tabOrder[nextIndex];
			if (this.canReceiveFocus(candidate)) {
				return this.focus(candidate);
			}
		} while (nextIndex !== startIndex);

		return false;
	}

	/**
	 * Move focus to the previous widget in tab order
	 *
	 * @returns True if focus moved successfully
	 */
	previous(): boolean {
		const tabOrder = this.getTabOrder();

		if (tabOrder.length === 0) {
			return false;
		}

		// Find current index
		let currentIndex = tabOrder.length;
		if (this.focusedWidget) {
			currentIndex = tabOrder.indexOf(this.focusedWidget);
		}

		// Find previous focusable widget
		const startIndex = currentIndex;
		let prevIndex = currentIndex;

		do {
			prevIndex =
				(prevIndex - 1 + tabOrder.length) % tabOrder.length;

			// If we've wrapped around
			if (prevIndex === startIndex) {
				return false;
			}

			const candidate = tabOrder[prevIndex];
			if (this.canReceiveFocus(candidate)) {
				return this.focus(candidate);
			}
		} while (prevIndex !== startIndex);

		return false;
	}

	/**
	 * Focus the first focusable widget
	 *
	 * @returns True if a widget was focused
	 */
	focusFirst(): boolean {
		const tabOrder = this.getTabOrder();

		for (const widget of tabOrder) {
			if (this.canReceiveFocus(widget)) {
				return this.focus(widget);
			}
		}

		return false;
	}

	/**
	 * Focus the last focusable widget
	 *
	 * @returns True if a widget was focused
	 */
	focusLast(): boolean {
		const tabOrder = this.getTabOrder();

		for (let i = tabOrder.length - 1; i >= 0; i--) {
			const widget = tabOrder[i];
			if (this.canReceiveFocus(widget)) {
				return this.focus(widget);
			}
		}

		return false;
	}

	/**
	 * Check if a widget can receive focus
	 *
	 * @param widget - Widget to check
	 */
	canReceiveFocus(widget: Widget): boolean {
		// Check if widget is focusable
		if (!widget.isFocusable || !widget.isFocusable()) {
			return false;
		}

		// Check visibility
		if (widget.state.visible === false) {
			return false;
		}

		// Check if disabled
		if (widget.state.disabled) {
			return false;
		}

		return true;
	}

	/**
	 * Get the tab order of focusable widgets
	 */
	getTabOrder(): Widget[] {
		if (!this.tabOrderDirty && this.tabOrder.length > 0) {
			return [...this.tabOrder];
		}

		this.tabOrder = this.calculateTabOrder();
		this.tabOrderDirty = false;

		return [...this.tabOrder];
	}

	/**
	 * Calculate the tab order of focusable widgets
	 */
	private calculateTabOrder(): Widget[] {
		if (!this.rootWidget) {
			return [];
		}

		const order: Widget[] = [];

		const collectWidgets = (widget: Widget) => {
			if (widget.isFocusable && widget.isFocusable()) {
				order.push(widget);
			}

			for (const child of widget.children) {
				collectWidgets(child);
			}
		};

		collectWidgets(this.rootWidget);

		// Sort by tabIndex, then by DOM order
		order.sort((a, b) => {
			const tabIndexA = (a as FocusableWidget).tabIndex ?? 0;
			const tabIndexB = (b as FocusableWidget).tabIndex ?? 0;
			return tabIndexA - tabIndexB;
		});

		return order;
	}

	/**
	 * Mark the tab order as needing recalculation
	 */
	invalidateTabOrder(): void {
		this.tabOrderDirty = true;
	}

	/**
	 * Register a focus change callback
	 *
	 * @param callback - Callback function
	 * @returns Function to unregister the callback
	 */
	onChange(callback: FocusChangeCallback): () => void {
		this.changeCallbacks.add(callback);

		return () => {
			this.changeCallbacks.delete(callback);
		};
	}

	/**
	 * Notify listeners of focus change
	 */
	private notifyChange(
		previousWidget: Widget | null,
		currentWidget: Widget | null,
	): void {
		for (const callback of this.changeCallbacks) {
			callback(previousWidget, currentWidget);
		}
	}

	/**
	 * Handle a key event for focus navigation
	 *
	 * @param key - Key name
	 * @param shift - Whether shift is held
	 * @returns True if the event was handled
	 */
	handleKey(key: string, shift = false): boolean {
		switch (key) {
			case 'tab':
				return shift ? this.previous() : this.next();

			default:
				return false;
		}
	}

	/**
	 * Find the next focusable widget from a starting point
	 *
	 * @param startWidget - Widget to start from
	 * @param forward - Whether to search forward
	 */
	findNextFocusable(
		startWidget: Widget,
		forward = true,
	): Widget | null {
		const tabOrder = this.getTabOrder();
		const startIndex = tabOrder.indexOf(startWidget);

		if (startIndex === -1) {
			return null;
		}

		const step = forward ? 1 : -1;
		let index = startIndex;

		do {
			index = (index + step + tabOrder.length) % tabOrder.length;

			if (index === startIndex) {
				return null; // Wrapped around
			}

			const candidate = tabOrder[index];
			if (this.canReceiveFocus(candidate)) {
				return candidate;
			}
		} while (index !== startIndex);

		return null;
	}

	/**
	 * Reset the focus manager
	 */
	reset(): void {
		this.blur();
		this.rootWidget = null;
		this.tabOrder = [];
		this.tabOrderDirty = true;
		this.changeCallbacks.clear();
	}

	/**
	 * Destroy the focus manager and cleanup
	 */
	destroy(): void {
		this.reset();
	}
}

/**
 * Global focus manager instance
 */
let globalFocusManager: FocusManager | null = null;

/**
 * Get the global focus manager instance
 */
export function getGlobalFocusManager(): FocusManager {
	if (!globalFocusManager) {
		globalFocusManager = new FocusManager();
	}
	return globalFocusManager;
}

/**
 * Set the global focus manager instance
 */
export function setGlobalFocusManager(manager: FocusManager): void {
	globalFocusManager = manager;
}

/**
 * Reset the global focus manager
 */
export function resetGlobalFocusManager(): void {
	globalFocusManager?.destroy();
	globalFocusManager = null;
}
