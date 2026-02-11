/**
 * Event Types Module
 *
 * Defines all event interfaces for the TUI framework's event system.
 * Includes keyboard, mouse, resize, focus, paste, and custom events.
 *
 * @module events/types
 */

/**
 * Event priority levels for the event queue
 */
export enum EventPriority {
	/** High priority events processed first */
	HIGH = 0,
	/** Normal priority events */
	NORMAL = 1,
	/** Low priority events processed last */
	LOW = 2,
}

/**
 * Base interface for all events
 */
export interface BaseEvent {
	/** Event type identifier */
	type: string;

	/** Timestamp when the event was created */
	timestamp: number;

	/** Event priority level */
	priority?: EventPriority;

	/** Whether propagation should stop */
	propagationStopped?: boolean;

	/** Whether default action should be prevented */
	defaultPrevented?: boolean;
}

/**
 * Key press event interface
 */
export interface KeyEvent extends BaseEvent {
	type: 'key';

	/** The key name (e.g., 'a', 'up', 'return', 'escape') */
	key: string;

	/** The raw character sequence */
	sequence: string;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Alt/Meta was held */
	alt: boolean;

	/** Whether Shift was held */
	shift: boolean;

	/** The character code */
	code?: number;

	/** Whether this is a repeat from holding the key */
	repeat?: boolean;
}

/**
 * Mouse button types
 */
export enum MouseButton {
	LEFT = 0,
	MIDDLE = 1,
	RIGHT = 2,
	RELEASE = 3,
	SCROLL_UP = 4,
	SCROLL_DOWN = 5,
	SCROLL_LEFT = 6,
	SCROLL_RIGHT = 7,
	BUTTON_8 = 8,
	BUTTON_9 = 9,
	BUTTON_10 = 10,
	BUTTON_11 = 11,
}

/**
 * Mouse action types
 */
export enum MouseAction {
	PRESS = 'press',
	RELEASE = 'release',
	DRAG = 'drag',
	MOVE = 'move',
	SCROLL = 'scroll',
}

/**
 * Mouse event interface
 */
export interface MouseEvent extends BaseEvent {
	type: 'mouse';

	/** Mouse action type */
	action: MouseAction;

	/** Button number (0 = left, 1 = middle, 2 = right, etc.) */
	button: MouseButton;

	/** X coordinate (1-indexed) */
	x: number;

	/** Y coordinate (1-indexed) */
	y: number;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Alt/Meta was held */
	alt: boolean;

	/** Whether Shift was held */
	shift: boolean;

	/** Raw escape sequence */
	sequence: string;
}

/**
 * Terminal resize event interface
 */
export interface ResizeEvent extends BaseEvent {
	type: 'resize';

	/** New number of columns */
	columns: number;

	/** New number of rows */
	rows: number;

	/** Previous number of columns */
	previousColumns: number;

	/** Previous number of rows */
	previousRows: number;
}

/**
 * Focus event type
 */
export enum FocusType {
	GAINED = 'gained',
	LOST = 'lost',
}

/**
 * Focus event interface
 */
export interface FocusEvent extends BaseEvent {
	type: 'focus';

	/** Focus change type */
	focusType: FocusType;
}

/**
 * Bracketed paste event interface
 */
export interface PasteEvent extends BaseEvent {
	type: 'paste';

	/** The pasted text content */
	text: string;

	/** Length of the pasted text */
	length: number;
}

/**
 * Signal event types
 */
export enum SignalType {
	SIGWINCH = 'SIGWINCH',
	SIGINT = 'SIGINT',
	SIGTERM = 'SIGTERM',
	SIGHUP = 'SIGHUP',
	SIGQUIT = 'SIGQUIT',
	SIGTSTP = 'SIGTSTP',
	SIGCONT = 'SIGCONT',
}

/**
 * Signal event interface
 */
export interface SignalEvent extends BaseEvent {
	type: 'signal';

	/** Signal type */
	signal: SignalType;
}

/**
 * Idle event interface - emitted when event loop has no pending events
 */
export interface IdleEvent extends BaseEvent {
	type: 'idle';

	/** Time since last event in milliseconds */
	deltaTime: number;
}

/**
 * Custom event interface for user-defined events
 */
export interface CustomEvent extends BaseEvent {
	type: 'custom';

	/** Custom event name */
	name: string;

	/** Custom event data */
	data: unknown;
}

/**
 * Union type of all event types
 */
export type Event =
	| KeyEvent
	| MouseEvent
	| ResizeEvent
	| FocusEvent
	| PasteEvent
	| SignalEvent
	| IdleEvent
	| CustomEvent;

/**
 * Event type to interface mapping for type-safe event handling
 */
export interface EventMap {
	key: KeyEvent;
	mouse: MouseEvent;
	resize: ResizeEvent;
	focus: FocusEvent;
	paste: PasteEvent;
	signal: SignalEvent;
	idle: IdleEvent;
	custom: CustomEvent;
}

/**
 * Type guard to check if an event is a KeyEvent
 */
export function isKeyEvent(event: Event): event is KeyEvent {
	return event.type === 'key';
}

/**
 * Type guard to check if an event is a MouseEvent
 */
export function isMouseEvent(event: Event): event is MouseEvent {
	return event.type === 'mouse';
}

/**
 * Type guard to check if an event is a ResizeEvent
 */
export function isResizeEvent(event: Event): event is ResizeEvent {
	return event.type === 'resize';
}

/**
 * Type guard to check if an event is a FocusEvent
 */
export function isFocusEvent(event: Event): event is FocusEvent {
	return event.type === 'focus';
}

/**
 * Type guard to check if an event is a PasteEvent
 */
export function isPasteEvent(event: Event): event is PasteEvent {
	return event.type === 'paste';
}

/**
 * Type guard to check if an event is a SignalEvent
 */
export function isSignalEvent(event: Event): event is SignalEvent {
	return event.type === 'signal';
}

/**
 * Type guard to check if an event is an IdleEvent
 */
export function isIdleEvent(event: Event): event is IdleEvent {
	return event.type === 'idle';
}

/**
 * Type guard to check if an event is a CustomEvent
 */
export function isCustomEvent(event: Event): event is CustomEvent {
	return event.type === 'custom';
}

/**
 * Creates a base event with common properties
 *
 * @param type - Event type
 * @param priority - Event priority
 * @returns Base event object
 */
export function createBaseEvent(
	type: string,
	priority: EventPriority = EventPriority.NORMAL,
): Omit<BaseEvent, 'timestamp'> {
	return {
		type,
		priority,
		propagationStopped: false,
		defaultPrevented: false,
	};
}
