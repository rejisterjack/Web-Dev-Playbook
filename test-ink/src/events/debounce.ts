/**
 * Debouncer Module
 *
 * Provides debouncing functionality for events to prevent rapid repeat
 * and excessive event processing. Supports leading/trailing edge options.
 *
 * @module events/debounce
 */

import type { Event } from './types.js';

/**
 * Debouncer options
 */
export interface DebouncerOptions {
	/** Delay in milliseconds */
	delay: number;
	/** Execute on the leading edge */
	leading?: boolean;
	/** Execute on the trailing edge */
	trailing?: boolean;
	/** Max wait time before forcing execution */
	maxWait?: number;
}

/**
 * Debounced function type
 */
export type DebouncedFunction<T extends Event> = {
	/** Call the debounced function */
	(event: T): void;
	/** Cancel pending execution */
	cancel(): void;
	/** Flush pending execution immediately */
	flush(): T | undefined;
	/** Check if there's a pending execution */
	pending(): boolean;
};

/**
 * Debouncer class for debouncing events
 *
 * @example
 * ```typescript
 * const debouncer = new Debouncer();
 *
 * // Debounce keyboard events
 * const debouncedKeyHandler = debouncer.debounce(
 *   (event) => console.log('Key:', event.key),
 *   { delay: 100, leading: false, trailing: true }
 * );
 *
 * // Use the debounced handler
 * debouncedKeyHandler(keyEvent);
 * ```
 */
export class Debouncer {
	/** Active debounced functions */
	private activeDebouncers = new Map<string, DebouncedFunction<Event>>();

	/** Global debouncer ID counter */
	private static idCounter = 0;

	/**
	 * Creates a debounced version of a function
	 *
	 * @param fn - Function to debounce
	 * @param options - Debounce options
	 * @returns Debounced function with control methods
	 */
	debounce<T extends Event>(
		fn: (event: T) => void,
		options: DebouncerOptions,
	): DebouncedFunction<T> {
		const { delay, leading = false, trailing = true, maxWait } = options;

		let timeoutId: NodeJS.Timeout | null = null;
		let maxWaitTimeoutId: NodeJS.Timeout | null = null;
		let lastEvent: T | undefined;
		let lastCallTime: number | undefined;
		let lastInvokeTime = 0;
		let result: T | undefined;

		const clearTimeouts = (): void => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			if (maxWaitTimeoutId) {
				clearTimeout(maxWaitTimeoutId);
				maxWaitTimeoutId = null;
			}
		};

		const invokeFunc = (event: T): void => {
			lastInvokeTime = Date.now();
			result = event;
			fn(event);
		};

		const shouldInvoke = (time: number): boolean => {
			if (lastCallTime === undefined) {
				return true;
			}

			const timeSinceLastCall = time - lastCallTime;
			const timeSinceLastInvoke = time - lastInvokeTime;

			return (
				timeSinceLastCall >= delay ||
				timeSinceLastCall < 0 ||
				(maxWait !== undefined && timeSinceLastInvoke >= maxWait)
			);
		};

		const trailingEdge = (): void => {
			timeoutId = null;
			if (trailing && lastEvent !== undefined) {
				invokeFunc(lastEvent);
			}
			lastEvent = undefined;
		};

		const timerExpired = (): void => {
			const time = Date.now();
			if (shouldInvoke(time)) {
				trailingEdge();
			} else {
				timeoutId = setTimeout(timerExpired, delay - (time - (lastCallTime ?? 0)));
			}
		};

		const debounced = function (event: T): void {
			const time = Date.now();
			const isInvoking = shouldInvoke(time);

			lastEvent = event;
			lastCallTime = time;

			if (isInvoking) {
				clearTimeouts();

				if (leading) {
					invokeFunc(event);
				} else if (timeoutId === null) {
					timeoutId = setTimeout(trailingEdge, delay);
				}

				if (maxWait !== undefined && maxWaitTimeoutId === null) {
					maxWaitTimeoutId = setTimeout(timerExpired, maxWait);
				}
			} else if (timeoutId === null) {
				timeoutId = setTimeout(trailingEdge, delay);
			}
		} as DebouncedFunction<T>;

		debounced.cancel = (): void => {
			clearTimeouts();
			lastEvent = undefined;
			lastCallTime = undefined;
		};

		debounced.flush = (): T | undefined => {
			if (timeoutId !== null && lastEvent !== undefined) {
				clearTimeouts();
				invokeFunc(lastEvent);
				return result;
			}
			return undefined;
		};

		debounced.pending = (): boolean => {
			return timeoutId !== null;
		};

		return debounced;
	}

	/**
	 * Creates a debounced event handler with a unique key
	 *
	 * @param key - Unique identifier for this debouncer
	 * @param fn - Function to debounce
	 * @param options - Debounce options
	 * @returns Debounced function
	 */
	create<T extends Event>(
		key: string,
		fn: (event: T) => void,
		options: DebouncerOptions,
	): DebouncedFunction<T> {
		const existing = this.activeDebouncers.get(key);
		if (existing) {
			existing.cancel();
		}

		const debounced = this.debounce(fn, options);
		// biome-ignore lint/suspicious/noExplicitAny: type erasure for storage
		this.activeDebouncers.set(key, debounced as unknown as DebouncedFunction<Event>);

		return debounced;
	}

	/**
	 * Gets or creates a debounced function for a key
	 *
	 * @param key - Unique identifier
	 * @param fn - Function to debounce
	 * @param options - Debounce options
	 * @returns Debounced function
	 */
	getOrCreate<T extends Event>(
		key: string,
		fn: (event: T) => void,
		options: DebouncerOptions,
	): DebouncedFunction<T> {
		const existing = this.activeDebouncers.get(key);
		if (existing) {
			// biome-ignore lint/suspicious/noExplicitAny: type erasure for retrieval
			return existing as unknown as DebouncedFunction<T>;
		}

		return this.create(key, fn, options);
	}

	/**
	 * Cancels all pending debounced functions
	 */
	cancelAll(): void {
		for (const debounced of this.activeDebouncers.values()) {
			debounced.cancel();
		}
		this.activeDebouncers.clear();
	}

	/**
	 * Flushes all pending debounced functions
	 */
	flushAll(): void {
		for (const debounced of this.activeDebouncers.values()) {
			debounced.flush();
		}
	}

	/**
	 * Removes a specific debounced function
	 *
	 * @param key - Key of the debouncer to remove
	 */
	remove(key: string): boolean {
		const debounced = this.activeDebouncers.get(key);
		if (debounced) {
			debounced.cancel();
			this.activeDebouncers.delete(key);
			return true;
		}
		return false;
	}

	/**
	 * Checks if a debouncer exists for a key
	 *
	 * @param key - Key to check
	 * @returns true if debouncer exists
	 */
	has(key: string): boolean {
		return this.activeDebouncers.has(key);
	}

	/**
	 * Gets all active debouncer keys
	 *
	 * @returns Array of keys
	 */
	keys(): string[] {
		return Array.from(this.activeDebouncers.keys());
	}

	/**
	 * Creates a debounced keyboard event handler
	 *
	 * @param fn - Handler function
	 * @param delay - Debounce delay in ms
	 * @returns Debounced function
	 */
	debounceKeyboard<T extends Event>(
		fn: (event: T) => void,
		delay = 50,
	): DebouncedFunction<T> {
		return this.debounce(fn, {
			delay,
			leading: false,
			trailing: true,
		});
	}

	/**
	 * Creates a debounced mouse scroll event handler
	 *
	 * @param fn - Handler function
	 * @param delay - Debounce delay in ms
	 * @returns Debounced function
	 */
	debounceScroll<T extends Event>(
		fn: (event: T) => void,
		delay = 16, // ~60fps
	): DebouncedFunction<T> {
		return this.debounce(fn, {
			delay,
			leading: true,
			trailing: false,
		});
	}

	/**
	 * Generates a unique debouncer key
	 *
	 * @param prefix - Optional prefix for the key
	 * @returns Unique key
	 */
	static generateKey(prefix = 'debouncer'): string {
		return `${prefix}_${++Debouncer.idCounter}_${Date.now()}`;
	}
}
