/**
 * Base Widget Module
 *
 * Provides the abstract BaseWidget class that all widgets must extend.
 * Implements the widget lifecycle, props/state management, event handling,
 * and layout node integration.
 *
 * @module widgets/base
 */

import type {
	Widget,
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetEventType,
	WidgetLifecycle,
	WidgetEventHandler,
	FocusableWidget,
} from './types.js';
import {WidgetLifecyclePhase, DEFAULT_THEME} from './types.js';
import type {LayoutNode} from '../layout/node.js';
import type {Rect} from '../layout/types.js';
import {LayoutNode as LayoutNodeClass} from '../layout/node.js';

/**
 * Counter for generating unique widget IDs
 */
let widgetIdCounter = 0;

/**
 * Generates a unique widget ID
 */
function generateWidgetId(): string {
	return `widget_${++widgetIdCounter}_${Date.now().toString(36)}`;
}

/**
 * Abstract base class for all widgets
 *
 * Provides:
 * - Lifecycle management (mount, update, unmount)
 * - Props and state management with immutability
 * - Event handling delegation
 * - Layout node integration
 * - Focus management hooks
 */
export abstract class BaseWidget implements Widget, FocusableWidget {
	/** Unique identifier for this widget */
	readonly id: string;

	/** Widget type name (set by subclasses) */
	abstract readonly type: string;

	/** Current props */
	protected _props: Required<WidgetProps>;

	/** Current state */
	protected _state: WidgetState;

	/** Parent widget */
	protected _parent: Widget | null = null;

	/** Child widgets */
	protected _children: Widget[] = [];

	/** Layout node associated with this widget */
	protected _layoutNode: LayoutNode | null = null;

	/** Whether the widget is mounted */
	protected _isMounted = false;

	/** Whether the widget currently has focus */
	protected _hasFocus = false;

	/** Tab index for focus navigation */
	tabIndex = 0;

	/** Event handlers registry */
	protected eventHandlers: Map<WidgetEventType, Set<WidgetEventHandler>> =
		new Map();

	/** Default props for all widgets */
	static defaultProps: Required<WidgetProps> = {
		id: '',
		className: '',
		visible: true,
		disabled: false,
		style: {},
		tabIndex: 0,
		data: {},
	};

	/**
	 * Create a new widget
	 *
	 * @param props - Initial props for the widget
	 */
	constructor(props: WidgetProps = {}) {
		this.id = props.id || generateWidgetId();
		this._props = this.mergeProps(props);
		this._state = this.getInitialState();
		this.tabIndex = this._props.tabIndex;
	}

	/**
	 * Get current props (read-only)
	 */
	get props(): Required<WidgetProps> {
		return this._props;
	}

	/**
	 * Get current state (read-only)
	 */
	get state(): WidgetState {
		return {...this._state};
	}

	/**
	 * Get parent widget
	 */
	get parent(): Widget | null {
		return this._parent;
	}

	/**
	 * Get child widgets (read-only array)
	 */
	get children(): Widget[] {
		return [...this._children];
	}

	/**
	 * Get layout node
	 */
	get layoutNode(): LayoutNode | null {
		return this._layoutNode;
	}

	/**
	 * Set layout node
	 */
	set layoutNode(node: LayoutNode | null) {
		this._layoutNode = node;
	}

	/**
	 * Check if widget is mounted
	 */
	get isMounted(): boolean {
		return this._isMounted;
	}

	/**
	 * Check if widget has focus
	 */
	get hasFocus(): boolean {
		return this._hasFocus;
	}

	/**
	 * Merge provided props with defaults
	 *
	 * @param props - Props to merge
	 * @returns Merged props with defaults
	 */
	protected mergeProps(props: WidgetProps): Required<WidgetProps> {
		const widgetConstructor = this.constructor as typeof BaseWidget;
		return {
			...BaseWidget.defaultProps,
			...widgetConstructor.defaultProps,
			...props,
			id: props.id || generateWidgetId(),
			style: {
				...BaseWidget.defaultProps.style,
				...(widgetConstructor.defaultProps.style || {}),
				...props.style,
			},
			data: {
				...BaseWidget.defaultProps.data,
				...(widgetConstructor.defaultProps.data || {}),
				...props.data,
			},
		};
	}

	/**
	 * Get initial state for the widget
	 * Subclasses can override this
	 */
	protected getInitialState(): WidgetState {
		return {
			focused: false,
			hovered: false,
			active: false,
			disabled: this._props.disabled,
			visible: this._props.visible,
		};
	}

	/**
	 * Mount the widget to the hierarchy
	 *
	 * @param parent - Parent widget (null for root)
	 */
	mount(parent: Widget | null = null): void {
		if (this._isMounted) {
			return;
		}

		this._parent = parent;
		this._isMounted = true;

		// Create layout node if not exists
		if (!this._layoutNode) {
			this._layoutNode = this.createLayoutNode();
		}

		// Call lifecycle hook
		this.onMount();

		// Mount children
		for (const child of this._children) {
			child.mount(this);
		}
	}

	/**
	 * Unmount the widget from the hierarchy
	 */
	unmount(): void {
		if (!this._isMounted) {
			return;
		}

		// Release focus if we have it
		if (this._hasFocus) {
			this.blur();
		}

		// Unmount children first
		for (const child of this._children) {
			child.unmount();
		}

		// Call lifecycle hook
		this.onUnmount();

		this._isMounted = false;
		this._parent = null;
	}

	/**
	 * Update the widget with new props
	 *
	 * @param newProps - New props to merge
	 */
	update(newProps: Partial<WidgetProps>): void {
		const previousProps = {...this._props};
		const previousState = {...this._state};

		// Merge new props
		this._props = this.mergeProps({...this._props, ...newProps});

		// Update state if disabled/visible changed in props
		if (newProps.disabled !== undefined) {
			this._state.disabled = newProps.disabled;
		}
		if (newProps.visible !== undefined) {
			this._state.visible = newProps.visible;
		}
		if (newProps.tabIndex !== undefined) {
			this.tabIndex = newProps.tabIndex;
		}

		// Call lifecycle hook
		const lifecycle: WidgetLifecycle = {
			phase: WidgetLifecyclePhase.UPDATE,
			previousProps,
			previousState,
		};
		this.onUpdate(lifecycle);

		// Request re-render
		this.invalidate();
	}

	/**
	 * Set widget state (immutable update)
	 *
	 * @param newState - Partial state to merge
	 */
	setState(newState: Partial<WidgetState>): void {
		const previousState = {...this._state};

		// Merge new state immutably
		this._state = {
			...this._state,
			...newState,
		};

		// Call lifecycle hook
		const lifecycle: WidgetLifecycle = {
			phase: WidgetLifecyclePhase.UPDATE,
			previousState,
			previousProps: this._props,
		};
		this.onUpdate(lifecycle);

		// Request re-render
		this.invalidate();
	}

	/**
	 * Create layout node for this widget
	 * Subclasses can override to customize layout behavior
	 */
	protected createLayoutNode(): LayoutNode {
		return new LayoutNodeClass({
			id: this.id,
			data: {widget: this},
		});
	}

	/**
	 * Mark widget as needing re-render
	 */
	protected invalidate(): void {
		// This would trigger a re-render in the application layer
		// For now, it's a placeholder
		this.onInvalidate();
	}

	/**
	 * Render the widget
	 *
	 * @param context - Widget context for rendering
	 */
	abstract render(context: WidgetContext): void;

	/**
	 * Handle an event
	 *
	 * @param event - Widget event to handle
	 * @returns Whether the event was handled
	 */
	handleEvent(event: WidgetEvent): boolean {
		// Call event handlers registered for this event type
		const handlers = this.eventHandlers.get(
			event.widgetEventType as WidgetEventType,
		);
		if (handlers) {
			for (const handler of handlers) {
				const result = handler(event);
				if (result === false) {
					return true; // Event was handled and propagation stopped
				}
			}
		}

		// Call specific handler method
		return this.onEvent(event);
	}

	/**
	 * Register an event handler
	 *
	 * @param type - Event type
	 * @param handler - Event handler function
	 */
	on<T extends WidgetEvent>(
		type: WidgetEventType,
		handler: WidgetEventHandler<T>,
	): void {
		if (!this.eventHandlers.has(type)) {
			this.eventHandlers.set(type, new Set());
		}
		this.eventHandlers.get(type)!.add(handler as WidgetEventHandler);
	}

	/**
	 * Remove an event handler
	 *
	 * @param type - Event type
	 * @param handler - Event handler function
	 */
	off<T extends WidgetEvent>(
		type: WidgetEventType,
		handler: WidgetEventHandler<T>,
	): void {
		const handlers = this.eventHandlers.get(type);
		if (handlers) {
			handlers.delete(handler as WidgetEventHandler);
		}
	}

	/**
	 * Get widget bounds
	 */
	getBounds(): Rect | null {
		if (!this._layoutNode) {
			return null;
		}

		const layout = this._layoutNode.computedLayout;
		if (!layout) {
			return null;
		}

		return {
			x: layout.position.x,
			y: layout.position.y,
			width: layout.size.width,
			height: layout.size.height,
		};
	}

	/**
	 * Check if a point is inside this widget
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 */
	containsPoint(x: number, y: number): boolean {
		const bounds = this.getBounds();
		if (!bounds) {
			return false;
		}

		return (
			x >= bounds.x &&
			x < bounds.x + bounds.width &&
			y >= bounds.y &&
			y < bounds.y + bounds.height
		);
	}

	/**
	 * Request focus for this widget
	 */
	focus(): boolean {
		if (!this.isFocusable() || this._state.disabled) {
			return false;
		}

		if (this._hasFocus) {
			return true;
		}

		this._hasFocus = true;
		this._state.focused = true;
		this.onFocus();
		this.invalidate();

		return true;
	}

	/**
	 * Release focus from this widget
	 */
	blur(): void {
		if (!this._hasFocus) {
			return;
		}

		this._hasFocus = false;
		this._state.focused = false;
		this.onBlur();
		this.invalidate();
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}

	/**
	 * Destroy the widget and cleanup resources
	 */
	destroy(): void {
		this.unmount();

		// Clean up event handlers
		this.eventHandlers.clear();

		// Destroy children
		for (const child of this._children) {
			child.destroy();
		}
		this._children = [];

		// Clean up layout node
		this._layoutNode = null;

		this.onDestroy();
	}

	/**
	 * Add a child widget
	 *
	 * @param child - Child widget to add
	 */
	addChild(child: Widget): void {
		if (child.parent === this) {
			return;
		}

		// Remove from previous parent
		if (child.parent) {
			child.parent.children.splice(child.parent.children.indexOf(child), 1);
		}

		this._children.push(child);
		(child as BaseWidget)._parent = this;

		if (this._isMounted) {
			child.mount(this);
		}

		// Add child's layout node to our layout node
		if (this._layoutNode && child.layoutNode) {
			this._layoutNode.addChild(child.layoutNode);
		}

		this.invalidate();
	}

	/**
	 * Remove a child widget
	 *
	 * @param child - Child widget to remove
	 */
	removeChild(child: Widget): void {
		const index = this._children.indexOf(child);
		if (index === -1) {
			return;
		}

		this._children.splice(index, 1);
		(child as BaseWidget)._parent = null;

		if (child.isMounted) {
			child.unmount();
		}

		// Remove child's layout node from our layout node
		if (this._layoutNode && child.layoutNode) {
			this._layoutNode.removeChild(child.layoutNode);
		}

		this.invalidate();
	}

	/**
	 * Insert a child at a specific index
	 *
	 * @param index - Index to insert at
	 * @param child - Child widget to insert
	 */
	insertChild(index: number, child: Widget): void {
		if (child.parent === this) {
			return;
		}

		// Remove from previous parent
		if (child.parent) {
			child.parent.children.splice(child.parent.children.indexOf(child), 1);
		}

		this._children.splice(index, 0, child);
		(child as BaseWidget)._parent = this;

		if (this._isMounted) {
			child.mount(this);
		}

		// Insert child's layout node in our layout node
		if (this._layoutNode && child.layoutNode) {
			this._layoutNode.insertChild(index, child.layoutNode);
		}

		this.invalidate();
	}

	/**
	 * Remove all children
	 */
	clearChildren(): void {
		for (const child of this._children) {
			(child as BaseWidget)._parent = null;
			child.unmount();

			if (this._layoutNode && child.layoutNode) {
				this._layoutNode.removeChild(child.layoutNode);
			}
		}
		this._children = [];
		this.invalidate();
	}

	/**
	 * Get child at index
	 *
	 * @param index - Child index
	 */
	getChildAt(index: number): Widget | undefined {
		return this._children[index];
	}

	/**
	 * Find child by predicate
	 *
	 * @param predicate - Function to test each child
	 */
	findChild(predicate: (child: Widget) => boolean): Widget | undefined {
		return this._children.find(predicate);
	}

	/**
	 * Find widget by ID recursively
	 *
	 * @param id - Widget ID to find
	 */
	findWidgetById(id: string): Widget | undefined {
		if (this.id === id) {
			return this;
		}

		for (const child of this._children) {
			const found = (child as BaseWidget).findWidgetById(id);
			if (found) {
				return found;
			}
		}

		return undefined;
	}

	/**
	 * Handle tab navigation
	 *
	 * @param forward - Whether navigating forward (Tab) or backward (Shift+Tab)
	 * @returns Whether navigation was handled
	 */
	onTab(forward: boolean): boolean {
		// Default implementation - subclasses can override
		return false;
	}

	// Lifecycle hooks - subclasses can override

	/**
	 * Called when widget is mounted
	 */
	protected onMount(): void {
		// Override in subclass
	}

	/**
	 * Called when widget is unmounted
	 */
	protected onUnmount(): void {
		// Override in subclass
	}

	/**
	 * Called when widget props or state changes
	 *
	 * @param lifecycle - Lifecycle information
	 */
	protected onUpdate(lifecycle: WidgetLifecycle): void {
		// Override in subclass
	}

	/**
	 * Called when widget needs to be re-rendered
	 */
	protected onInvalidate(): void {
		// Override in subclass
	}

	/**
	 * Called when widget receives focus
	 */
	onFocus(): void {
		// Override in subclass
	}

	/**
	 * Called when widget loses focus
	 */
	onBlur(): void {
		// Override in subclass
	}

	/**
	 * Called when an event is received
	 *
	 * @param event - Widget event
	 * @returns Whether the event was handled
	 */
	protected onEvent(event: WidgetEvent): boolean {
		// Override in subclass
		return false;
	}

	/**
	 * Called when widget is destroyed
	 */
	protected onDestroy(): void {
		// Override in subclass
	}
}
