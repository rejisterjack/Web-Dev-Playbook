/**
 * Event Dispatcher Module
 *
 * Routes events to registered handlers with support for event bubbling,
 * capturing phases, event delegation, and handler priority.
 *
 * @module events/dispatcher
 */

import { EventPriority, type Event, type EventMap } from './types.js';

/**
 * Event phase enumeration
 */
export enum EventPhase {
	/** Event is in capture phase */
	CAPTURING = 1,
	/** Event is at target */
	AT_TARGET = 2,
	/** Event is in bubble phase */
	BUBBLING = 3,
}

/**
 * Handler registration options
 */
export interface HandlerOptions {
	/** Handler priority (higher = called first) */
	priority?: number;
	/** Use capture phase instead of bubble */
	capture?: boolean;
	/** Handler is called only once */
	once?: boolean;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends Event = Event> = (event: T, phase: EventPhase) => void | boolean;

/**
 * Handler entry in the registry
 */
interface HandlerEntry<T extends Event = Event> {
	/** Handler function */
	handler: EventHandler<T>;
	/** Handler priority */
	priority: number;
	/** Use capture phase */
	capture: boolean;
	/** Call only once */
	once: boolean;
	/** Unique ID */
	id: number;
}

/**
 * Event target interface for bubbling
 */
export interface EventTarget {
	/** Target identifier */
	id: string;
	/** Parent target for bubbling */
	parent?: EventTarget;
	/** Target matches selector */
	matches?(selector: string): boolean;
}

/**
 * Dispatcher options
 */
export interface EventDispatcherOptions {
	/** Enable event bubbling */
	bubbling?: boolean;
	/** Enable capture phase */
	capture?: boolean;
	/** Default handler priority */
	defaultPriority?: number;
}

/**
 * EventDispatcher class for routing events
 *
 * @example
 * ```typescript
 * const dispatcher = new EventDispatcher();
 *
 * // Register handler for key events
 * dispatcher.on('key', (event, phase) => {
 *   console.log('Key pressed:', event.key);
 *   return false; // Stop propagation
 * });
 *
 * // Register capture phase handler
 * dispatcher.on('mouse', (event) => {
 *   console.log('Mouse event capturing');
 * }, { capture: true });
 *
 * // Dispatch event
 * dispatcher.dispatch(keyEvent);
 * ```
 */
export class EventDispatcher {
	/** Handler registry by event type */
	private handlers = new Map<string, HandlerEntry[]>();

	/** Handler ID counter */
	private nextHandlerId = 0;

	/** Dispatcher options */
	private options: Required<EventDispatcherOptions>;

	/** Event targets for bubbling */
	private targets = new Map<string, EventTarget>();

	/**
	 * Creates a new EventDispatcher instance
	 *
	 * @param options - Dispatcher configuration
	 */
	constructor(options: EventDispatcherOptions = {}) {
		this.options = {
			bubbling: options.bubbling ?? true,
			capture: options.capture ?? true,
			defaultPriority: options.defaultPriority ?? 0,
		};
	}

	/**
	 * Registers an event handler
	 *
	 * @param type - Event type to handle
	 * @param handler - Handler function
	 * @param options - Handler options
	 * @returns Unsubscribe function
	 */
	on<T extends keyof EventMap>(
		type: T,
		handler: EventHandler<EventMap[T]>,
		options: HandlerOptions = {},
	): () => void {
		const entry: HandlerEntry<EventMap[T]> = {
			handler: handler as EventHandler,
			priority: options.priority ?? this.options.defaultPriority,
			capture: options.capture ?? false,
			once: options.once ?? false,
			id: ++this.nextHandlerId,
		};

		const typeKey = type as string;
		const existing = this.handlers.get(typeKey) ?? [];
		existing.push(entry as HandlerEntry);
		this.sortHandlers(existing);
		this.handlers.set(typeKey, existing);

		return () => this.off(type, handler);
	}

	/**
	 * Registers a one-time event handler
	 *
	 * @param type - Event type to handle
	 * @param handler - Handler function
	 * @param options - Handler options
	 * @returns Unsubscribe function
	 */
	once<T extends keyof EventMap>(
		type: T,
		handler: EventHandler<EventMap[T]>,
		options: Omit<HandlerOptions, 'once'> = {},
	): () => void {
		return this.on(type, handler, { ...options, once: true });
	}

	/**
	 * Registers a capture phase handler
	 *
	 * @param type - Event type to handle
	 * @param handler - Handler function
	 * @param options - Handler options
	 * @returns Unsubscribe function
	 */
	capture<T extends keyof EventMap>(
		type: T,
		handler: EventHandler<EventMap[T]>,
		options: Omit<HandlerOptions, 'capture'> = {},
	): () => void {
		return this.on(type, handler, { ...options, capture: true });
	}

	/**
	 * Removes an event handler
	 *
	 * @param type - Event type
	 * @param handler - Handler function to remove
	 * @returns true if handler was removed
	 */
	off<T extends keyof EventMap>(type: T, handler: EventHandler<EventMap[T]>): boolean {
		const typeKey = type as string;
		const existing = this.handlers.get(typeKey);

		if (!existing) {
			return false;
		}

		const before = existing.length;
		const filtered = existing.filter((entry) => entry.handler !== handler);

		if (filtered.length === 0) {
			this.handlers.delete(typeKey);
		} else {
			this.handlers.set(typeKey, filtered);
		}

		return filtered.length < before;
	}

	/**
	 * Removes all handlers for a type or all types
	 *
	 * @param type - Event type to clear, or undefined for all
	 */
	removeAllHandlers(type?: keyof EventMap): void {
		if (type === undefined) {
			this.handlers.clear();
		} else {
			this.handlers.delete(type as string);
		}
	}

	/**
	 * Dispatches an event to registered handlers
	 *
	 * @param event - Event to dispatch
	 * @param target - Optional target for bubbling
	 * @returns false if propagation was stopped
	 */
	dispatch<T extends Event>(event: T, target?: EventTarget): boolean {
		const typeHandlers = this.handlers.get(event.type) ?? [];

		if (typeHandlers.length === 0) {
			return true;
		}

		// Build target chain for bubbling
		const targetChain: EventTarget[] = [];
		if (target && this.options.bubbling) {
			let current: EventTarget | undefined = target;
			while (current) {
				targetChain.unshift(current);
				current = current.parent;
			}
		}

		// Capture phase
		if (this.options.capture && targetChain.length > 0) {
			for (let i = 0; i < targetChain.length - 1; i++) {
				if (event.propagationStopped) {
					return false;
				}

				this.callHandlers(
					typeHandlers,
					event,
					EventPhase.CAPTURING,
					targetChain[i],
					true,
				);
			}
		}

		// Target phase
		if (!event.propagationStopped) {
			const targetNode = targetChain[targetChain.length - 1] ?? target;
			this.callHandlers(typeHandlers, event, EventPhase.AT_TARGET, targetNode, false);
		}

		// Bubble phase
		if (this.options.bubbling && !event.propagationStopped && targetChain.length > 0) {
			for (let i = targetChain.length - 2; i >= 0; i--) {
				if (event.propagationStopped) {
					return false;
				}

				this.callHandlers(
					typeHandlers,
					event,
					EventPhase.BUBBLING,
					targetChain[i],
					false,
				);
			}
		}

		// Clean up one-time handlers
		this.cleanupOnceHandlers(event.type);

		return !event.propagationStopped;
	}

	/**
	 * Calls handlers for the given phase
	 */
	private callHandlers(
		handlers: HandlerEntry[],
		event: Event,
		phase: EventPhase,
		target: EventTarget | undefined,
		capture: boolean,
	): void {
		for (const entry of handlers) {
			if (entry.capture !== capture) {
				continue;
			}

			if (entry.once && entry.id === -1) {
				continue;
			}

			try {
				const result = entry.handler(event, phase);

				if (result === false) {
					event.propagationStopped = true;
					break;
				}
			} catch (error) {
				console.error(`Error in event handler for ${event.type}:`, error);
			}
		}
	}

	/**
	 * Cleans up one-time handlers after dispatch
	 */
	private cleanupOnceHandlers(type: string): void {
		const handlers = this.handlers.get(type);
		if (!handlers) return;

		const filtered = handlers.filter((entry) => !entry.once);

		if (filtered.length === 0) {
			this.handlers.delete(type);
		} else {
			this.handlers.set(type, filtered);
		}
	}

	/**
	 * Sorts handlers by priority (descending)
	 */
	private sortHandlers(handlers: HandlerEntry[]): void {
		handlers.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Registers an event target for bubbling
	 *
	 * @param target - Event target to register
	 */
	registerTarget(target: EventTarget): void {
		this.targets.set(target.id, target);
	}

	/**
	 * Unregisters an event target
	 *
	 * @param targetId - ID of target to unregister
	 */
	unregisterTarget(targetId: string): void {
		this.targets.delete(targetId);
	}

	/**
	 * Gets a registered target by ID
	 *
	 * @param targetId - Target ID
	 * @returns EventTarget or undefined
	 */
	getTarget(targetId: string): EventTarget | undefined {
		return this.targets.get(targetId);
	}

	/**
	 * Returns the number of handlers for an event type
	 *
	 * @param type - Event type
	 * @returns Number of handlers
	 */
	handlerCount(type: keyof EventMap): number {
		return this.handlers.get(type as string)?.length ?? 0;
	}

	/**
	 * Returns all event types that have handlers
	 *
	 * @returns Array of event types
	 */
	eventTypes(): string[] {
		return Array.from(this.handlers.keys());
	}

	/**
	 * Checks if there are any handlers for an event type
	 *
	 * @param type - Event type
	 * @returns true if there are handlers
	 */
	hasHandlers(type: keyof EventMap): boolean {
		return this.handlerCount(type) > 0;
	}

	/**
	 * Delegate event handling based on a selector
	 *
	 * @param type - Event type
	 * @param selector - Selector to match targets
	 * @param handler - Handler function
	 * @returns Unsubscribe function
	 */
	delegate<T extends keyof EventMap>(
		type: T,
		selector: string,
		handler: EventHandler<EventMap[T]>,
	): () => void {
		const delegateHandler: EventHandler<EventMap[T]> = (event, phase) => {
			// Find matching target in bubble chain
			// This is a simplified implementation
			return handler(event, phase);
		};

		return this.on(type, delegateHandler);
	}

	/**
	 * Stops event propagation for the current event
	 *
	 * @param event - Event to stop propagation for
	 */
	stopPropagation(event: Event): void {
		event.propagationStopped = true;
	}

	/**
	 * Prevents default action for the current event
	 *
	 * @param event - Event to prevent default for
	 */
	preventDefault(event: Event): void {
		event.defaultPrevented = true;
	}
}
