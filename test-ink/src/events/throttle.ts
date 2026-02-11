/**
 * Throttler Module
 *
 * Provides throttling functionality for events to limit the rate of event
 * processing. Useful for high-frequency events like resize and mouse move.
 *
 * @module events/throttle
 */

import type { Event } from './types.js';

/**
 * Throttler options
 */
export interface ThrottlerOptions {
	/** Interval in milliseconds */
	interval: number;
	/** Execute on the leading edge */
	leading?: boolean;
	/** Execute on the trailing edge */
	trailing?: boolean;
}

/**
 * Throttled function type
 */
export type ThrottledFunction<T extends Event> = {
	/** Call the throttled function */
	(event: T): void;
	/** Cancel pending execution */
	cancel(): void;
	/** Flush pending execution immediately */
	flush(): T | undefined;
	/** Check if throttled function is waiting */
	pending(): boolean;
};

/**
 * Throttler class for throttling events
 *
 * @example
 * ```typescript
 * const throttler = new Throttler();
 *
 * // Throttle resize events
 * const throttledResize = throttler.throttle(
 *   (event) => console.log('Resize:', event.columns, event.rows),
 *   { interval: 100, leading: false, trailing: true }
 * );
 *
 * // Use the throttled handler
 * throttledResize(resizeEvent);
 * ```
 */
export class Throttler {
	/** Active throttled functions */
	private activeThrottlers = new Map<string, ThrottledFunction<Event>>();

	/** Global throttler ID counter */
	private static idCounter = 0;

	/**
	 * Creates a throttled version of a function
	 *
	 * @param fn - Function to throttle
	 * @param options - Throttle options
	 * @returns Throttled function with control methods
	 */
	throttle<T extends Event>(
		fn: (event: T) => void,
		options: ThrottlerOptions,
	): ThrottledFunction<T> {
		const { interval, leading = true, trailing = true } = options;

		let lastInvokeTime = 0;
		let timeoutId: NodeJS.Timeout | null = null;
		let lastEvent: T | undefined;
		let result: T | undefined;

		const clearTimeoutId = (): void => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		};

		const invokeFunc = (time: number, event: T): void => {
			lastInvokeTime = time;
			result = event;
			fn(event);
		};

		const trailingEdge = (): void => {
			timeoutId = null;
			if (trailing && lastEvent !== undefined) {
				invokeFunc(Date.now(), lastEvent);
				lastEvent = undefined;
			}
		};

		const shouldInvoke = (time: number): boolean => {
			const timeSinceLastInvoke = time - lastInvokeTime;
			return timeSinceLastInvoke >= interval || timeSinceLastInvoke < 0;
		};

		const throttled = function (event: T): void {
			const time = Date.now();
			const isInvoking = shouldInvoke(time);

			lastEvent = event;

			if (isInvoking) {
				clearTimeoutId();

				if (leading) {
					invokeFunc(time, event);
				} else if (!timeoutId) {
					timeoutId = setTimeout(trailingEdge, interval);
				}
			} else if (trailing && !timeoutId) {
				timeoutId = setTimeout(trailingEdge, interval - (time - lastInvokeTime));
			}
		} as ThrottledFunction<T>;

		throttled.cancel = (): void => {
			clearTimeoutId();
			lastEvent = undefined;
			lastInvokeTime = 0;
		};

		throttled.flush = (): T | undefined => {
			if (timeoutId !== null && lastEvent !== undefined) {
				clearTimeoutId();
				invokeFunc(Date.now(), lastEvent);
				return result;
			}
			return undefined;
		};

		throttled.pending = (): boolean => {
			return timeoutId !== null;
		};

		return throttled;
	}

	/**
	 * Creates a throttled event handler with a unique key
	 *
	 * @param key - Unique identifier for this throttler
	 * @param fn - Function to throttle
	 * @param options - Throttle options
	 * @returns Throttled function
	 */
	create<T extends Event>(
		key: string,
		fn: (event: T) => void,
		options: ThrottlerOptions,
	): ThrottledFunction<T> {
		const existing = this.activeThrottlers.get(key);
		if (existing) {
			existing.cancel();
		}

		const throttled = this.throttle(fn, options);
		// biome-ignore lint/suspicious/noExplicitAny: type erasure for storage
		this.activeThrottlers.set(key, throttled as unknown as ThrottledFunction<Event>);

		return throttled;
	}

	/**
	 * Gets or creates a throttled function for a key
	 *
	 * @param key - Unique identifier
	 * @param fn - Function to throttle
	 * @param options - Throttle options
	 * @returns Throttled function
	 */
	getOrCreate<T extends Event>(
		key: string,
		fn: (event: T) => void,
		options: ThrottlerOptions,
	): ThrottledFunction<T> {
		const existing = this.activeThrottlers.get(key);
		if (existing) {
			// biome-ignore lint/suspicious/noExplicitAny: type erasure for retrieval
			return existing as unknown as ThrottledFunction<T>;
		}

		return this.create(key, fn, options);
	}

	/**
	 * Cancels all pending throttled functions
	 */
	cancelAll(): void {
		for (const throttled of this.activeThrottlers.values()) {
			throttled.cancel();
		}
		this.activeThrottlers.clear();
	}

	/**
	 * Flushes all pending throttled functions
	 */
	flushAll(): void {
		for (const throttled of this.activeThrottlers.values()) {
			throttled.flush();
		}
	}

	/**
	 * Removes a specific throttled function
	 *
	 * @param key - Key of the throttler to remove
	 */
	remove(key: string): boolean {
		const throttled = this.activeThrottlers.get(key);
		if (throttled) {
			throttled.cancel();
			this.activeThrottlers.delete(key);
			return true;
		}
		return false;
	}

	/**
	 * Checks if a throttler exists for a key
	 *
	 * @param key - Key to check
	 * @returns true if throttler exists
	 */
	has(key: string): boolean {
		return this.activeThrottlers.has(key);
	}

	/**
	 * Gets all active throttler keys
	 *
	 * @returns Array of keys
	 */
	keys(): string[] {
		return Array.from(this.activeThrottlers.keys());
	}

	/**
	 * Creates a throttled resize event handler
	 *
	 * @param fn - Handler function
	 * @param interval - Throttle interval in ms
	 * @returns Throttled function
	 */
	throttleResize<T extends Event>(
		fn: (event: T) => void,
		interval = 100,
	): ThrottledFunction<T> {
		return this.throttle(fn, {
			interval,
			leading: false,
			trailing: true,
		});
	}

	/**
	 * Creates a throttled mouse move event handler
	 *
	 * @param fn - Handler function
	 * @param interval - Throttle interval in ms (default 16ms = ~60fps)
	 * @returns Throttled function
	 */
	throttleMouseMove<T extends Event>(
		fn: (event: T) => void,
		interval = 16,
	): ThrottledFunction<T> {
		return this.throttle(fn, {
			interval,
			leading: true,
			trailing: false,
		});
	}

	/**
	 * Generates a unique throttler key
	 *
	 * @param prefix - Optional prefix for the key
	 * @returns Unique key
	 */
	static generateKey(prefix = 'throttler'): string {
		return `${prefix}_${++Throttler.idCounter}_${Date.now()}`;
	}
}
