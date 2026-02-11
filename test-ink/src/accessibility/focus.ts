/**
 * Focus Management Module
 *
 * Provides focus management functionality for keyboard navigation.
 * Manages focus order, tab navigation, arrow key navigation, and focus trapping.
 *
 * @module accessibility/focus
 */

import type {Widget} from '../widgets/types.js';
import {FocusDirection, type FocusTrap} from './types.js';

/**
 * Focus event type
 */
export enum FocusEventType {
	/** Focus gained event */
	FOCUS_GAINED = 'focus-gained',

	/** Focus lost event */
	FOCUS_LOST = 'focus-lost',

	/** Focus moved event */
	FOCUS_MOVED = 'focus-moved',

	/** Focus trapped event */
	FOCUS_TRAPPED = 'focus-trapped',

	/** Focus released event */
	FOCUS_RELEASED = 'focus-released',
}

/**
 * Focus event handler
 */
export type FocusEventHandler = (event: FocusEvent) => void;

/**
 * Focus event
 */
export interface FocusEvent {
	/** Event type */
	type: FocusEventType;

	/** Widget that gained focus */
	target: Widget;

	/** Widget that lost focus (if applicable) */
	relatedTarget?: Widget;

	/** Focus direction (if applicable) */
	direction?: FocusDirection;

	/** Timestamp */
	timestamp: number;
}

/**
 * Focus order strategy
 */
export enum FocusOrderStrategy {
	/** Use DOM order (tab index) */
	DOM_ORDER = 'dom-order',

	/** Use visual order (left to right, top to bottom) */
	VISUAL_ORDER = 'visual-order',

	/** Use custom order */
	CUSTOM_ORDER = 'custom-order',
}

/**
 * Focus indicator style
 */
export enum FocusIndicatorStyle {
	/** Underline */
	UNDERLINE = 'underline',

	/** Box */
	BOX = 'box',

	/** Invert colors */
	INVERT = 'invert',

	/** Bright colors */
	BRIGHT = 'bright',

	/** Custom */
	CUSTOM = 'custom',
}

/**
 * Focus indicator configuration
 */
export interface FocusIndicatorConfig {
	/** Whether focus indicators are enabled */
	enabled: boolean;

	/** The focus indicator style */
	style: FocusIndicatorStyle;

	/** Custom character for custom style */
	customChar?: string;

	/** Custom color for custom style */
	customColor?: string;
}

/**
 * Accessibility Focus Manager class
 */
export class AccessibilityFocusManager {
	/** Currently focused widget */
	private _focusedWidget: Widget | null;

	/** List of focusable widgets */
	private _focusableWidgets: Widget[];

	/** Focus order strategy */
	private _focusOrderStrategy: FocusOrderStrategy;

	/** Custom focus order (widget IDs in order) */
	private _customFocusOrder: string[];

	/** Active focus traps */
	private _focusTraps: FocusTrap[];

	/** Focus indicator configuration */
	private _focusIndicator: FocusIndicatorConfig;

	/** Focus event handlers */
	private _eventHandlers: Map<FocusEventType, Set<FocusEventHandler>>;

	/** Whether focus management is enabled */
	private _enabled: boolean;

	/**
	 * Creates a new AccessibilityFocusManager instance
	 */
	constructor() {
		this._focusedWidget = null;
		this._focusableWidgets = [];
		this._focusOrderStrategy = FocusOrderStrategy.DOM_ORDER;
		this._customFocusOrder = [];
		this._focusTraps = [];
		this._focusIndicator = {
			enabled: true,
			style: FocusIndicatorStyle.BOX,
		};
		this._eventHandlers = new Map();
		this._enabled = true;
	}

	/**
	 * Gets the currently focused widget
	 */
	get focusedWidget(): Widget | null {
		return this._focusedWidget;
	}

	/**
	 * Gets the list of focusable widgets
	 */
	get focusableWidgets(): Widget[] {
		return [...this._focusableWidgets];
	}

	/**
	 * Gets the focus order strategy
	 */
	get focusOrderStrategy(): FocusOrderStrategy {
		return this._focusOrderStrategy;
	}

	/**
	 * Sets the focus order strategy
	 */
	set focusOrderStrategy(strategy: FocusOrderStrategy) {
		this._focusOrderStrategy = strategy;
	}

	/**
	 * Gets the custom focus order
	 */
	get customFocusOrder(): string[] {
		return [...this._customFocusOrder];
	}

	/**
	 * Sets the custom focus order
	 */
	set customFocusOrder(order: string[]) {
		this._customFocusOrder = [...order];
	}

	/**
	 * Gets the focus indicator configuration
	 */
	get focusIndicator(): FocusIndicatorConfig {
		return {...this._focusIndicator};
	}

	/**
	 * Sets the focus indicator configuration
	 */
	set focusIndicator(config: Partial<FocusIndicatorConfig>) {
		this._focusIndicator = {...this._focusIndicator, ...config};
	}

	/**
	 * Gets whether focus management is enabled
	 */
	get enabled(): boolean {
		return this._enabled;
	}

	/**
	 * Sets whether focus management is enabled
	 */
	set enabled(value: boolean) {
		this._enabled = value;
	}

	/**
	 * Registers a focusable widget
	 *
	 * @param widget - The widget to register
	 */
	registerFocusable(widget: Widget): void {
		if (!this._focusableWidgets.includes(widget)) {
			this._focusableWidgets.push(widget);
		}
	}

	/**
	 * Unregisters a focusable widget
	 *
	 * @param widget - The widget to unregister
	 */
	unregisterFocusable(widget: Widget): void {
		const index = this._focusableWidgets.indexOf(widget);
		if (index !== -1) {
			this._focusableWidgets.splice(index, 1);
		}

		// Remove from focus if it was focused
		if (this._focusedWidget === widget) {
			this._focusedWidget = null;
		}
	}

	/**
	 * Sets focus to a widget
	 *
	 * @param widget - The widget to focus
	 * @returns Whether focus was successfully set
	 */
	setFocus(widget: Widget): boolean {
		if (!this._enabled) {
			return false;
		}

		// Check if widget is focusable
		if (!this.isFocusable(widget)) {
			return false;
		}

		// Check if focus is trapped
		if (this._isFocusTrapped(widget)) {
			return false;
		}

		const previous = this._focusedWidget;
		this._focusedWidget = widget;

		// Emit focus events
		if (previous) {
			this._emitEvent({
				type: FocusEventType.FOCUS_LOST,
				target: previous,
				relatedTarget: widget,
				timestamp: Date.now(),
			});
		}

		this._emitEvent({
			type: FocusEventType.FOCUS_GAINED,
			target: widget,
			relatedTarget: previous ?? undefined,
			timestamp: Date.now(),
		});

		this._emitEvent({
			type: FocusEventType.FOCUS_MOVED,
			target: widget,
			relatedTarget: previous ?? undefined,
			timestamp: Date.now(),
		});

		return true;
	}

	/**
	 * Removes focus from the current widget
	 */
	removeFocus(): void {
		if (this._focusedWidget) {
			const previous = this._focusedWidget;
			this._focusedWidget = null;

			this._emitEvent({
				type: FocusEventType.FOCUS_LOST,
				target: previous,
				timestamp: Date.now(),
			});
		}
	}

	/**
	 * Moves focus in the specified direction
	 *
	 * @param direction - The direction to move focus
	 * @returns Whether focus was successfully moved
	 */
	moveFocus(direction: FocusDirection): boolean {
		if (!this._enabled || !this._focusedWidget) {
			return false;
		}

		const nextWidget = this.getNextFocusableWidget(this._focusedWidget, direction);
		if (nextWidget) {
			return this.setFocus(nextWidget);
		}

		return false;
	}

	/**
	 * Moves focus to the next widget (tab navigation)
	 *
	 * @returns Whether focus was successfully moved
	 */
	moveFocusNext(): boolean {
		return this.moveFocus(FocusDirection.NEXT);
	}

	/**
	 * Moves focus to the previous widget (shift+tab navigation)
	 *
	 * @returns Whether focus was successfully moved
	 */
	moveFocusPrevious(): boolean {
		return this.moveFocus(FocusDirection.PREVIOUS);
	}

	/**
	 * Moves focus to the first widget
	 *
	 * @returns Whether focus was successfully moved
	 */
	moveFocusFirst(): boolean {
		return this.moveFocus(FocusDirection.FIRST);
	}

	/**
	 * Moves focus to the last widget
	 *
	 * @returns Whether focus was successfully moved
	 */
	moveFocusLast(): boolean {
		return this.moveFocus(FocusDirection.LAST);
	}

	/**
	 * Gets the next focusable widget in the specified direction
	 *
	 * @param current - The current widget
	 * @param direction - The direction to move
	 * @returns The next focusable widget, or null if none found
	 */
	getNextFocusableWidget(
		current: Widget,
		direction: FocusDirection,
	): Widget | null {
		const orderedWidgets = this._getOrderedFocusableWidgets();
		const currentIndex = orderedWidgets.indexOf(current);

		if (currentIndex === -1) {
			return null;
		}

		switch (direction) {
			case FocusDirection.NEXT:
				return orderedWidgets[currentIndex + 1] ?? null;
			case FocusDirection.PREVIOUS:
				return orderedWidgets[currentIndex - 1] ?? null;
			case FocusDirection.FIRST:
				return orderedWidgets[0] ?? null;
			case FocusDirection.LAST:
				return orderedWidgets[orderedWidgets.length - 1] ?? null;
			case FocusDirection.UP:
			case FocusDirection.DOWN:
			case FocusDirection.LEFT:
			case FocusDirection.RIGHT:
				return this._getSpatialNextWidget(current, direction);
			default:
				return null;
		}
	}

	/**
	 * Checks if a widget is focusable
	 *
	 * @param widget - The widget to check
	 * @returns Whether the widget is focusable
	 */
	isFocusable(widget: Widget): boolean {
		// Check if widget is registered
		if (!this._focusableWidgets.includes(widget)) {
			return false;
		}

		// Check if widget is disabled
		if (widget.props.disabled) {
			return false;
		}

		// Check if widget is visible
		if (widget.props.visible === false) {
			return false;
		}

		// Check if widget has a tab index
		if (widget.props.tabIndex !== undefined && widget.props.tabIndex < 0) {
			return false;
		}

		return true;
	}

	/**
	 * Activates a focus trap
	 *
	 * @param trap - The focus trap configuration
	 */
	activateFocusTrap(trap: FocusTrap): void {
		this._focusTraps.push(trap);
		this._emitEvent({
			type: FocusEventType.FOCUS_TRAPPED,
			target: trap.container,
			timestamp: Date.now(),
		});
	}

	/**
	 * Deactivates a focus trap
	 *
	 * @param container - The container widget of the trap
	 */
	deactivateFocusTrap(container: Widget): void {
		const index = this._focusTraps.findIndex((t) => t.container === container);
		if (index !== -1) {
			const trap = this._focusTraps[index];
			this._focusTraps.splice(index, 1);

			// Return focus to the specified widget
			if (trap.returnFocusTo) {
				this.setFocus(trap.returnFocusTo);
			}

			this._emitEvent({
				type: FocusEventType.FOCUS_RELEASED,
				target: container,
				timestamp: Date.now(),
			});
		}
	}

	/**
	 * Checks if focus is currently trapped
	 *
	 * @param widget - The widget to check
	 * @returns Whether focus is trapped for this widget
	 */
	isFocusTrapped(widget: Widget): boolean {
		return this._focusTraps.some((trap) => trap.active);
	}

	/**
	 * Registers a focus event handler
	 *
	 * @param eventType - The event type
	 * @param handler - The event handler
	 */
	on(eventType: FocusEventType, handler: FocusEventHandler): void {
		if (!this._eventHandlers.has(eventType)) {
			this._eventHandlers.set(eventType, new Set());
		}
		this._eventHandlers.get(eventType)!.add(handler);
	}

	/**
	 * Unregisters a focus event handler
	 *
	 * @param eventType - The event type
	 * @param handler - The event handler
	 */
	off(eventType: FocusEventType, handler: FocusEventHandler): void {
		const handlers = this._eventHandlers.get(eventType);
		if (handlers) {
			handlers.delete(handler);
		}
	}

	/**
	 * Clears all focusable widgets
	 */
	clearFocusableWidgets(): void {
		this._focusableWidgets = [];
		this._focusedWidget = null;
	}

	/**
	 * Destroys the focus manager and cleans up resources
	 */
	destroy(): void {
		this._focusableWidgets = [];
		this._focusedWidget = null;
		this._customFocusOrder = [];
		this._focusTraps = [];
		this._eventHandlers.clear();
		this._enabled = false;
	}

	/**
	 * Gets focusable widgets in order
	 *
	 * @returns Ordered list of focusable widgets
	 */
	private _getOrderedFocusableWidgets(): Widget[] {
		const widgets = [...this._focusableWidgets];

		switch (this._focusOrderStrategy) {
			case FocusOrderStrategy.DOM_ORDER:
				return widgets.sort((a, b) => {
					const tabIndexA = a.props.tabIndex ?? 0;
					const tabIndexB = b.props.tabIndex ?? 0;
					return tabIndexA - tabIndexB;
				});

			case FocusOrderStrategy.VISUAL_ORDER:
				return widgets.sort((a, b) => {
					const boundsA = a.getBounds();
					const boundsB = b.getBounds();
					if (!boundsA || !boundsB) return 0;
					return boundsA.y - boundsB.y || boundsA.x - boundsB.x;
				});

			case FocusOrderStrategy.CUSTOM_ORDER:
				return widgets.sort((a, b) => {
					const indexA = this._customFocusOrder.indexOf(a.id);
					const indexB = this._customFocusOrder.indexOf(b.id);
					return indexA - indexB;
				});

			default:
				return widgets;
		}
	}

	/**
	 * Gets the next widget in spatial order
	 *
	 * @param current - The current widget
	 * @param direction - The direction to move
	 * @returns The next widget, or null if none found
	 */
	private _getSpatialNextWidget(
		current: Widget,
		direction: FocusDirection,
	): Widget | null {
		const currentBounds = current.getBounds();
		if (!currentBounds) {
			return null;
		}

		const widgets = this._focusableWidgets.filter((w) => w !== current);
		let closest: Widget | null = null;
		let closestDistance = Infinity;

		for (const widget of widgets) {
			const bounds = widget.getBounds();
			if (!bounds) {
				continue;
			}

			const distance = this._calculateSpatialDistance(
				currentBounds,
				bounds,
				direction,
			);

			if (distance < closestDistance) {
				closestDistance = distance;
				closest = widget;
			}
		}

		return closest;
	}

	/**
	 * Calculates spatial distance between two widgets in a direction
	 *
	 * @param a - First widget bounds
	 * @param b - Second widget bounds
	 * @param direction - The direction
	 * @returns The distance
	 */
	private _calculateSpatialDistance(
		a: {x: number; y: number; width: number; height: number},
		b: {x: number; y: number; width: number; height: number},
		direction: FocusDirection,
	): number {
		const aCenterX = a.x + a.width / 2;
		const aCenterY = a.y + a.height / 2;
		const bCenterX = b.x + b.width / 2;
		const bCenterY = b.y + b.height / 2;

		switch (direction) {
			case FocusDirection.UP:
				if (bCenterY >= aCenterY) return Infinity;
				return Math.abs(aCenterY - bCenterY) + Math.abs(aCenterX - bCenterX) * 0.1;
			case FocusDirection.DOWN:
				if (bCenterY <= aCenterY) return Infinity;
				return Math.abs(bCenterY - aCenterY) + Math.abs(aCenterX - bCenterX) * 0.1;
			case FocusDirection.LEFT:
				if (bCenterX >= aCenterX) return Infinity;
				return Math.abs(aCenterX - bCenterX) + Math.abs(aCenterY - bCenterY) * 0.1;
			case FocusDirection.RIGHT:
				if (bCenterX <= aCenterX) return Infinity;
				return Math.abs(bCenterX - aCenterX) + Math.abs(aCenterY - bCenterY) * 0.1;
			default:
				return Infinity;
		}
	}

	/**
	 * Checks if a widget is affected by a focus trap
	 *
	 * @param widget - The widget to check
	 * @returns Whether the widget is affected by a focus trap
	 */
	private _isFocusTrapped(widget: Widget): boolean {
		if (this._focusTraps.length === 0) {
			return false;
		}

		const activeTrap = this._focusTraps[this._focusTraps.length - 1];
		if (!activeTrap.active) {
			return false;
		}

		// Check if widget is inside the trap container
		return this._isWidgetInContainer(widget, activeTrap.container);
	}

	/**
	 * Checks if a widget is inside a container
	 *
	 * @param widget - The widget to check
	 * @param container - The container widget
	 * @returns Whether the widget is inside the container
	 */
	private _isWidgetInContainer(widget: Widget, container: Widget): boolean {
		if (widget === container) {
			return true;
		}

		let current = widget.parent;
		while (current) {
			if (current === container) {
				return true;
			}
			current = current.parent;
		}

		return false;
	}

	/**
	 * Emits a focus event
	 *
	 * @param event - The event to emit
	 */
	private _emitEvent(event: FocusEvent): void {
		const handlers = this._eventHandlers.get(event.type);
		if (handlers) {
			for (const handler of handlers) {
				handler(event);
			}
		}
	}
}
