/**
 * Events Module
 *
 * This module provides the event loop system for the TUI framework.
 * It includes event types, queue management, input parsing, signal handling,
 * debouncing/throttling, key bindings, and the main event loop.
 *
 * @module events
 *
 * @example
 * ```typescript
 * import { EventLoop, KeyBindings, EventPriority } from './events';
 *
 * // Create and start the event loop
 * const loop = new EventLoop({
 *   mouseSupport: true,
 *   bracketedPaste: true
 * });
 *
 * // Listen for key events
 * loop.on('key', (event) => {
 *   console.log('Key pressed:', event.key);
 * });
 *
 * // Set up key bindings
 * const bindings = new KeyBindings();
 * bindings.register({
 *   id: 'quit',
 *   chords: { key: 'q', ctrl: true },
 *   callback: () => loop.stop()
 * });
 *
 * // Start the loop
 * await loop.start();
 * ```
 */

// Event Types
export {
	EventPriority,
	MouseButton,
	MouseAction,
	FocusType,
	SignalType,
	createBaseEvent,
	isKeyEvent,
	isMouseEvent,
	isResizeEvent,
	isFocusEvent,
	isPasteEvent,
	isSignalEvent,
	isIdleEvent,
	isCustomEvent,
} from './types.js';

export type {
	BaseEvent,
	KeyEvent,
	MouseEvent,
	ResizeEvent,
	FocusEvent,
	PasteEvent,
	SignalEvent,
	IdleEvent,
	CustomEvent,
	Event,
	EventMap,
} from './types.js';

// Event Queue
export { EventQueue } from './queue.js';
export type { EventQueueOptions } from './queue.js';

// Event Emitter
export { EventEmitter } from './emitter.js';
export type { EventListener, EmitOptions } from './emitter.js';

// Input Parser
export { InputParser } from './parser.js';
export type { InputParserOptions, ParseResult } from './parser.js';

// Debouncer
export { Debouncer } from './debounce.js';
export type { DebouncerOptions, DebouncedFunction } from './debounce.js';

// Throttler
export { Throttler } from './throttle.js';
export type { ThrottlerOptions, ThrottledFunction } from './throttle.js';

// Signal Handler
export { SignalHandler } from './signals.js';
export type {
	SignalHandlerOptions,
	SignalCallback,
	ResizeCallback,
} from './signals.js';

// Event Dispatcher
export { EventDispatcher, EventPhase } from './dispatcher.js';
export type {
	HandlerOptions,
	EventHandler,
	EventTarget,
	EventDispatcherOptions,
} from './dispatcher.js';

// Key Bindings
export { KeyBindings } from './keybindings.js';
export type {
	KeyBindingCallback,
	KeyChord,
	KeyBinding,
	KeyBindingsOptions,
} from './keybindings.js';

// Event History
export { EventHistory } from './history.js';
export type {
	HistoryEntry,
	EventHistoryOptions,
	ReplayOptions,
} from './history.js';

// Event Loop
export { EventLoop, EventLoopState } from './loop.js';
export type { EventLoopOptions, IdleCallback } from './loop.js';
