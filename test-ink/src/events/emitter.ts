/**
 * Event Emitter Module
 *
 * Custom event emitter implementation with support for wildcards,
 * one-time listeners, and event propagation control.
 *
 * @module events/emitter
 */

import type { Event, EventMap } from './types.js';

/**
 * Event listener function type
 */
export type EventListener<T extends Event = Event> = (event: T) => void | boolean | Promise<void | boolean>;

/**
 * Listener entry in the registry
 */
interface ListenerEntry<T extends Event = Event> {
	/** The listener function */
	listener: EventListener<T>;
	/** Whether this is a one-time listener */
	once: boolean;
	/** Priority (higher = called first) */
	priority: number;
	/** Unique identifier */
	id: number;
}

/**
 * Options for event emission
 */
export interface EmitOptions {
	/** Whether to stop on first listener that returns false */
	stopOnFalse?: boolean;
	/** Whether to capture phase (vs bubble) */
	capture?: boolean;
}

/**
 * Custom EventEmitter with advanced features
 *
 * @example
 * ```typescript
 * const emitter = new EventEmitter();
 *
 * // Basic listener
 * emitter.on('key', (event) => {
 *   console.log('Key pressed:', event.key);
 * });
 *
 * // One-time listener
 * emitter.once('resize', (event) => {
 *   console.log('Resized once:', event.columns, event.rows);
 * });
 *
 * // Wildcard listener
 * emitter.on('*', (event) => {
 *   console.log('Any event:', event.type);
 * });
 *
 * // Emit event
 * emitter.emit({ type: 'key', key: 'enter', /* ... * / });
 * ```
 */
export class EventEmitter {
	/** Listener registry by event type */
	private listeners = new Map<string, ListenerEntry[]>();

	/** Wildcard listeners */
	private wildcardListeners: ListenerEntry[] = [];

	/** Global listener ID counter */
	private nextListenerId = 0;

	/** Whether the emitter has been destroyed */
	private destroyed = false;

	/**
	 * Registers an event listener
	 *
	 * @param type - Event type or wildcard '*'
	 * @param listener - Event listener function
	 * @param priority - Listener priority (higher = called first)
	 * @returns Unsubscribe function
	 */
	on<T extends keyof EventMap>(
		type: T | '*',
		listener: EventListener<EventMap[T]>,
		priority = 0,
	): () => void {
		this.checkDestroyed();

		const entry: ListenerEntry = {
			listener: listener as EventListener,
			once: false,
			priority,
			id: this.nextListenerId++,
		};

		if (type === '*') {
			this.wildcardListeners.push(entry);
			this.sortListeners(this.wildcardListeners);
		} else {
			const existing = this.listeners.get(type as string) ?? [];
			existing.push(entry);
			this.sortListeners(existing);
			this.listeners.set(type as string, existing);
		}

		return () => this.off(type, listener);
	}

	/**
	 * Registers a one-time event listener
	 *
	 * @param type - Event type or wildcard '*'
	 * @param listener - Event listener function
	 * @param priority - Listener priority (higher = called first)
	 * @returns Unsubscribe function
	 */
	once<T extends keyof EventMap>(
		type: T | '*',
		listener: EventListener<EventMap[T]>,
		priority = 0,
	): () => void {
		this.checkDestroyed();

		const entry: ListenerEntry = {
			listener: listener as EventListener,
			once: true,
			priority,
			id: this.nextListenerId++,
		};

		if (type === '*') {
			this.wildcardListeners.push(entry);
			this.sortListeners(this.wildcardListeners);
		} else {
			const existing = this.listeners.get(type as string) ?? [];
			existing.push(entry);
			this.sortListeners(existing);
			this.listeners.set(type as string, existing);
		}

		return () => this.off(type, listener);
	}

	/**
	 * Removes an event listener
	 *
	 * @param type - Event type or wildcard '*'
	 * @param listener - Event listener function to remove
	 * @returns true if a listener was removed
	 */
	off<T extends keyof EventMap>(type: T | '*', listener: EventListener<EventMap[T]>): boolean {
		this.checkDestroyed();

		if (type === '*') {
			const before = this.wildcardListeners.length;
			this.wildcardListeners = this.wildcardListeners.filter(
				(entry) => entry.listener !== listener,
			);
			return this.wildcardListeners.length < before;
		}

		const existing = this.listeners.get(type as string);
		if (!existing) {
			return false;
		}

		const before = existing.length;
		const filtered = existing.filter((entry) => entry.listener !== listener);

		if (filtered.length === 0) {
			this.listeners.delete(type as string);
		} else {
			this.listeners.set(type as string, filtered);
		}

		return filtered.length < before;
	}

	/**
	 * Removes all listeners for a specific type or all types
	 *
	 * @param type - Event type to clear, or undefined to clear all
	 */
	removeAllListeners(type?: keyof EventMap | '*'): void {
		this.checkDestroyed();

		if (type === undefined) {
			this.listeners.clear();
			this.wildcardListeners = [];
		} else if (type === '*') {
			this.wildcardListeners = [];
		} else {
			this.listeners.delete(type as string);
		}
	}

	/**
	 * Emits an event to all registered listeners
	 *
	 * @param event - The event to emit
	 * @param options - Emission options
	 * @returns false if propagation was stopped, true otherwise
	 */
	emit<T extends Event>(event: T, options: EmitOptions = {}): boolean {
		this.checkDestroyed();

		// Get listeners for this event type
		const typeListeners = this.listeners.get(event.type) ?? [];
		const allListeners: ListenerEntry[] = [
			...typeListeners,
			...this.wildcardListeners,
		];

		// Sort by priority (higher first)
		allListeners.sort((a, b) => b.priority - a.priority);

		// Call listeners
		const toRemove: number[] = [];

		for (const entry of allListeners) {
			// Skip if propagation stopped
			if (event.propagationStopped) {
				break;
			}

			try {
				const result = entry.listener(event);

				// Handle async listeners
				if (result instanceof Promise) {
					result.catch((error) => {
						console.error(`Error in async event listener for ${event.type}:`, error);
					});
				} else if (result === false) {
					// Listener returned false - stop propagation
					event.propagationStopped = true;
					if (options.stopOnFalse) {
						break;
					}
				}
			} catch (error) {
				console.error(`Error in event listener for ${event.type}:`, error);
			}

			// Mark one-time listeners for removal
			if (entry.once) {
				toRemove.push(entry.id);
			}
		}

		// Remove one-time listeners
		if (toRemove.length > 0) {
			this.removeListenersById(event.type, toRemove);
			this.removeWildcardListenersById(toRemove);
		}

		return !event.propagationStopped;
	}

	/**
	 * Emits an event asynchronously to all listeners
	 *
	 * @param event - The event to emit
	 * @param options - Emission options
	 * @returns Promise resolving to false if propagation was stopped
	 */
	async emitAsync<T extends Event>(event: T, options: EmitOptions = {}): Promise<boolean> {
		this.checkDestroyed();

		// Get listeners for this event type
		const typeListeners = this.listeners.get(event.type) ?? [];
		const allListeners: ListenerEntry[] = [
			...typeListeners,
			...this.wildcardListeners,
		];

		// Sort by priority (higher first)
		allListeners.sort((a, b) => b.priority - a.priority);

		// Call listeners
		const toRemove: number[] = [];

		for (const entry of allListeners) {
			// Skip if propagation stopped
			if (event.propagationStopped) {
				break;
			}

			try {
				const result = await entry.listener(event);

				if (result === false) {
					// Listener returned false - stop propagation
					event.propagationStopped = true;
					if (options.stopOnFalse) {
						break;
					}
				}
			} catch (error) {
				console.error(`Error in async event listener for ${event.type}:`, error);
			}

			// Mark one-time listeners for removal
			if (entry.once) {
				toRemove.push(entry.id);
			}
		}

		// Remove one-time listeners
		if (toRemove.length > 0) {
			this.removeListenersById(event.type, toRemove);
			this.removeWildcardListenersById(toRemove);
		}

		return !event.propagationStopped;
	}

	/**
	 * Returns the number of listeners for an event type
	 *
	 * @param type - Event type or wildcard '*'
	 * @returns Number of listeners
	 */
	listenerCount(type: keyof EventMap | '*'): number {
		if (type === '*') {
			return this.wildcardListeners.length;
		}
		return this.listeners.get(type as string)?.length ?? 0;
	}

	/**
	 * Returns all event types that have listeners
	 *
	 * @returns Array of event types
	 */
	eventTypes(): string[] {
		return Array.from(this.listeners.keys());
	}

	/**
	 * Checks if there are any listeners for an event type
	 *
	 * @param type - Event type or wildcard '*'
	 * @returns true if there are listeners
	 */
	hasListeners(type: keyof EventMap | '*'): boolean {
		return this.listenerCount(type) > 0;
	}

	/**
	 * Destroys the emitter, removing all listeners
	 */
	destroy(): void {
		this.removeAllListeners();
		this.destroyed = true;
	}

	/**
	 * Checks if the emitter has been destroyed
	 *
	 * @returns true if destroyed
	 */
	isDestroyed(): boolean {
		return this.destroyed;
	}

	/**
	 * Sorts listeners by priority (descending)
	 */
	private sortListeners(listeners: ListenerEntry[]): void {
		listeners.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Removes listeners by ID from a specific type
	 */
	private removeListenersById(type: string, ids: number[]): void {
		const existing = this.listeners.get(type);
		if (!existing) return;

		const filtered = existing.filter((entry) => !ids.includes(entry.id));

		if (filtered.length === 0) {
			this.listeners.delete(type);
		} else {
			this.listeners.set(type, filtered);
		}
	}

	/**
	 * Removes listeners by ID from wildcard listeners
	 */
	private removeWildcardListenersById(ids: number[]): void {
		this.wildcardListeners = this.wildcardListeners.filter(
			(entry) => !ids.includes(entry.id),
		);
	}

	/**
	 * Throws if the emitter has been destroyed
	 */
	private checkDestroyed(): void {
		if (this.destroyed) {
			throw new Error('EventEmitter has been destroyed');
		}
	}
}
