/**
 * Widget Types Module
 *
 * Core type definitions for the widget system.
 * Provides fundamental interfaces for widget props, state, context,
 * lifecycle, and events used throughout the widget system.
 *
 * @module widgets/types
 */

import type {Color, CellStyles} from '../rendering/cell.js';
import type {KeyEvent, MouseEvent, BaseEvent} from '../events/types.js';
import type {LayoutNode} from '../layout/node.js';
import type {Rect, Size} from '../layout/types.js';

/**
 * Generic props interface for all widgets
 */
export interface WidgetProps {
	/** Unique identifier for the widget */
	id?: string;

	/** CSS class-like identifier for styling */
	className?: string;

	/** Whether the widget is visible */
	visible?: boolean;

	/** Whether the widget is disabled */
	disabled?: boolean;

	/** Custom styles */
	style?: WidgetStyle;

	/** Tab index for focus navigation */
	tabIndex?: number;

	/** Additional data attributes */
	data?: Record<string, unknown>;
}

/**
 * Style properties for widgets
 */
export interface WidgetStyle {
	/** Foreground color */
	color?: Color;

	/** Background color */
	backgroundColor?: Color;

	/** Text styles (bold, italic, etc.) */
	styles?: CellStyles;

	/** Width dimension */
	width?: number | string;

	/** Height dimension */
	height?: number | string;

	/** Padding in cells */
	padding?: number | EdgeValues;

	/** Margin in cells */
	margin?: number | EdgeValues;

	/** Border style */
	border?: BorderStyle;

	/** Flex grow factor */
	flexGrow?: number;

	/** Flex shrink factor */
	flexShrink?: number;

	/** Flex basis size */
	flexBasis?: number | 'auto';

	/** Alignment */
	align?: 'left' | 'center' | 'right';

	/** Vertical alignment */
	verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * Edge values for padding/margin (top, right, bottom, left)
 */
export interface EdgeValues {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
}

/**
 * Border style configuration
 */
export interface BorderStyle {
	/** Border style type */
	style?: 'single' | 'double' | 'rounded' | 'thick' | 'none';

	/** Border color */
	color?: Color;

	/** Which edges to show border on */
	sides?: {
		top?: boolean;
		right?: boolean;
		bottom?: boolean;
		left?: boolean;
	};
}

/**
 * Generic state interface for all widgets
 */
export interface WidgetState {
	/** Whether the widget is currently focused */
	focused?: boolean;

	/** Whether the widget is currently hovered */
	hovered?: boolean;

	/** Whether the widget is currently active (pressed) */
	active?: boolean;

	/** Whether the widget is currently disabled */
	disabled?: boolean;

	/** Whether the widget is currently visible */
	visible?: boolean;

	/** Custom state properties */
	[key: string]: unknown;
}

/**
 * Theme configuration for widgets
 */
export interface WidgetTheme {
	/** Primary color */
	primary: Color;

	/** Secondary color */
	secondary: Color;

	/** Success color */
	success: Color;

	/** Warning color */
	warning: Color;

	/** Error/danger color */
	error: Color;

	/** Info color */
	info: Color;

	/** Background color */
	background: Color;

	/** Surface color for elevated elements */
	surface: Color;

	/** Text color */
	text: Color;

	/** Muted text color */
	textMuted: Color;

	/** Border color */
	border: Color;

	/** Focus indicator color */
	focus: Color;

	/** Whether to use high contrast mode */
	highContrast?: boolean;
}

/**
 * Default theme
 */
export const DEFAULT_THEME: WidgetTheme = {
	primary: {rgb: [59, 130, 246]}, // blue-500
	secondary: {rgb: [107, 114, 128]}, // gray-500
	success: {rgb: [34, 197, 94]}, // green-500
	warning: {rgb: [234, 179, 8]}, // yellow-500
	error: {rgb: [239, 68, 68]}, // red-500
	info: {rgb: [59, 130, 246]}, // blue-500
	background: 'default',
	surface: {rgb: [31, 41, 55]}, // gray-800
	text: 'default',
	textMuted: 'gray',
	border: 'gray',
	focus: {rgb: [59, 130, 246]}, // blue-500
	highContrast: false,
};

/**
 * Context passed to widgets during rendering and event handling
 */
export interface WidgetContext {
	/** Current theme */
	theme: WidgetTheme;

	/** Whether the widget or its parent has focus */
	isFocused: boolean;

	/** Whether the widget is currently hovered */
	isHovered: boolean;

	/** Whether the widget is currently disabled */
	isDisabled: boolean;

	/** The widget's layout node */
	layoutNode: LayoutNode;

	/** Available size for rendering */
	availableSize: Size;

	/** The root widget context */
	root: WidgetContext;

	/** Parent widget context */
	parent?: WidgetContext;

	/** Get a widget by ID */
	getWidgetById(id: string): Widget | undefined;

	/** Request focus for a widget */
	requestFocus(widget: Widget): boolean;

	/** Release focus from a widget */
	releaseFocus(widget: Widget): void;
}

/**
 * Widget lifecycle phases
 */
export enum WidgetLifecyclePhase {
	/** Widget is being created and attached to the hierarchy */
	MOUNT = 'mount',

	/** Widget's props or state have changed */
	UPDATE = 'update',

	/** Widget is being removed from the hierarchy */
	UNMOUNT = 'unmount',
}

/**
 * Widget lifecycle event
 */
export interface WidgetLifecycle {
	/** Current lifecycle phase */
	phase: WidgetLifecyclePhase;

	/** Previous props (only for update phase) */
	previousProps?: WidgetProps;

	/** Previous state (only for update phase) */
	previousState?: WidgetState;
}

/**
 * Widget-specific event types
 */
export enum WidgetEventType {
	/** Focus gained */
	FOCUS_GAINED = 'focus-gained',

	/** Focus lost */
	FOCUS_LOST = 'focus-lost',

	/** Mouse enter */
	MOUSE_ENTER = 'mouse-enter',

	/** Mouse leave */
	MOUSE_LEAVE = 'mouse-leave',

	/** Mouse down */
	MOUSE_DOWN = 'mouse-down',

	/** Mouse up */
	MOUSE_UP = 'mouse-up',

	/** Click */
	CLICK = 'click',

	/** Double click */
	DOUBLE_CLICK = 'double-click',

	/** Key down */
	KEY_DOWN = 'key-down',

	/** Key up */
	KEY_UP = 'key-up',

	/** Value changed */
	CHANGE = 'change',

	/** Selection changed */
	SELECT = 'select',

	/** Scroll position changed */
	SCROLL = 'scroll',

	/** Widget shown */
	SHOW = 'show',

	/** Widget hidden */
	HIDE = 'hide',

	/** Widget enabled */
	ENABLE = 'enable',

	/** Widget disabled */
	DISABLE = 'disable',
}

/**
 * Widget event interface
 */
export interface WidgetEvent extends BaseEvent {
	type: string;

	/** Event type category */
	widgetEventType: WidgetEventType;

	/** Target widget */
	target: Widget;

	/** Current widget in propagation path */
	currentTarget?: Widget;

	/** Original DOM-like event (if applicable) */
	originalEvent?: KeyEvent | MouseEvent;
}

/**
 * Focus event for widgets
 */
export interface WidgetFocusEvent extends WidgetEvent {
	widgetEventType: WidgetEventType.FOCUS_GAINED | WidgetEventType.FOCUS_LOST;

	/** Related widget (previous/next focus) */
	relatedTarget?: Widget;
}

/**
 * Mouse event for widgets
 */
export interface WidgetMouseEvent extends WidgetEvent {
	widgetEventType:
		| WidgetEventType.MOUSE_ENTER
		| WidgetEventType.MOUSE_LEAVE
		| WidgetEventType.MOUSE_DOWN
		| WidgetEventType.MOUSE_UP
		| WidgetEventType.CLICK
		| WidgetEventType.DOUBLE_CLICK;

	/** Mouse X coordinate relative to widget */
	localX: number;

	/** Mouse Y coordinate relative to widget */
	localY: number;

	/** Mouse button */
	button: number;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Alt was held */
	alt: boolean;

	/** Whether Shift was held */
	shift: boolean;
}

/**
 * Keyboard event for widgets
 */
export interface WidgetKeyEvent extends WidgetEvent {
	widgetEventType: WidgetEventType.KEY_DOWN | WidgetEventType.KEY_UP;

	/** Key name */
	key: string;

	/** Character code */
	code?: number;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Alt was held */
	alt: boolean;

	/** Whether Shift was held */
	shift: boolean;

	/** Whether this is a repeat */
	repeat?: boolean;
}

/**
 * Change event for widgets
 */
export interface WidgetChangeEvent<T = unknown> extends WidgetEvent {
	widgetEventType: WidgetEventType.CHANGE;

	/** Previous value */
	previousValue: T;

	/** New value */
	value: T;
}

/**
 * Select event for widgets
 */
export interface WidgetSelectEvent<T = unknown> extends WidgetEvent {
	widgetEventType: WidgetEventType.SELECT;

	/** Selected item(s) */
	selected: T | T[];

	/** Selection index (if applicable) */
	index?: number;
}

/**
 * Widget interface - all widgets must implement this
 */
export interface Widget {
	/** Unique identifier */
	readonly id: string;

	/** Widget type name */
	readonly type: string;

	/** Current props */
	props: WidgetProps;

	/** Current state */
	state: WidgetState;

	/** Parent widget (null for root) */
	parent: Widget | null;

	/** Child widgets */
	children: Widget[];

	/** Layout node associated with this widget */
	layoutNode: LayoutNode | null;

	/** Whether the widget is mounted */
	isMounted: boolean;

	/** Mount the widget */
	mount(parent?: Widget | null): void;

	/** Update the widget with new props */
	update(newProps: Partial<WidgetProps>): void;

	/** Unmount the widget */
	unmount(): void;

	/** Render the widget to the screen buffer */
	render(context: WidgetContext): void;

	/** Handle an event */
	handleEvent(event: WidgetEvent): boolean;

	/** Set widget state */
	setState(newState: Partial<WidgetState>): void;

	/** Get widget bounds */
	getBounds(): Rect | null;

	/** Check if point is inside widget */
	containsPoint(x: number, y: number): boolean;

	/** Request focus */
	focus(): boolean;

	/** Release focus */
	blur(): void;

	/** Check if widget can receive focus */
	isFocusable(): boolean;

	/** Destroy the widget and cleanup */
	destroy(): void;
}

/**
 * Widget constructor interface
 */
export interface WidgetConstructor {
	/** Widget type name */
	readonly widgetType: string;

	/** Create a new widget instance */
	new (props?: WidgetProps): Widget;
}

/**
 * Widget registration entry
 */
export interface WidgetRegistration {
	/** Widget type name */
	type: string;

	/** Widget constructor */
	constructor: WidgetConstructor;

	/** Default props */
	defaultProps?: Partial<WidgetProps>;
}

/**
 * Focusable widget interface
 */
export interface FocusableWidget extends Widget {
	/** Tab index for navigation order */
	tabIndex: number;

	/** Whether the widget currently has focus */
	hasFocus: boolean;

	/** Handle focus gain */
	onFocus(): void;

	/** Handle focus loss */
	onBlur(): void;

	/** Handle tab navigation */
	onTab(forward: boolean): boolean;
}

/**
 * Container widget interface
 */
export interface ContainerWidget extends Widget {
	/** Add a child widget */
	addChild(child: Widget): void;

	/** Remove a child widget */
	removeChild(child: Widget): void;

	/** Insert a child at specific index */
	insertChild(index: number, child: Widget): void;

	/** Remove all children */
	clearChildren(): void;

	/** Get child at index */
	getChildAt(index: number): Widget | undefined;

	/** Find child by predicate */
	findChild(predicate: (child: Widget) => boolean): Widget | undefined;
}

/**
 * Scrollable widget interface
 */
export interface ScrollableWidget extends Widget {
	/** Current scroll position */
	scrollPosition: {x: number; y: number};

	/** Maximum scroll position */
	maxScroll: {x: number; y: number};

	/** Scroll to position */
	scrollTo(x: number, y: number): void;

	/** Scroll by delta */
	scrollBy(dx: number, dy: number): void;

	/** Scroll to top */
	scrollToTop(): void;

	/** Scroll to bottom */
	scrollToBottom(): void;
}

/**
 * Widget event handler type
 */
export type WidgetEventHandler<T extends WidgetEvent = WidgetEvent> = (
	event: T,
) => void | boolean;

/**
 * Widget change handler type
 */
export type WidgetChangeHandler<T = unknown> = (
	value: T,
	previousValue: T,
) => void;
