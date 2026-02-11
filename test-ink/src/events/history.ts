/**
 * Event History Module
 *
 * Provides event logging and replay functionality for debugging and testing.
 * Maintains a configurable history of recent events.
 *
 * @module events/history
 */

import type { Event } from './types.js';

/**
 * History entry with metadata
 */
export interface HistoryEntry<T extends Event = Event> {
	/** The event */
	event: T;
	/** Index in history */
	index: number;
	/** Timestamp when recorded */
	recordedAt: number;
}

/**
 * Event history options
 */
export interface EventHistoryOptions {
	/** Maximum history size */
	maxSize?: number;
	/** Enable recording */
	recording?: boolean;
	/** Event types to record (empty = all) */
	filterTypes?: string[];
	/** Event types to exclude */
	excludeTypes?: string[];
}

/**
 * Replay options
 */
export interface ReplayOptions {
	/** Delay between events in ms */
	delay?: number;
	/** Speed multiplier (2 = 2x speed) */
	speed?: number;
	/** Start index */
	startIndex?: number;
	/** End index (exclusive) */
	endIndex?: number;
	/** Filter by event type */
	filterType?: string;
}

/**
 * EventHistory class for logging and replaying events
 *
 * @example
 * ```typescript
 * const history = new EventHistory({ maxSize: 1000 });
 *
 * // Record events
 * history.record(keyEvent);
 * history.record(mouseEvent);
 *
 * // Get recent events
 * const recent = history.getRecent(10);
 *
 * // Replay events
 * await history.replay((event) => {
 *   handleEvent(event);
 * }, { delay: 100 });
 *
 * // Export for debugging
 * const dump = history.export();
 * ```
 */
export class EventHistory {
	/** History entries */
	private entries: HistoryEntry[] = [];

	/** Options */
	private options: Required<EventHistoryOptions>;

	/** Current index counter */
	private indexCounter = 0;

	/** Whether currently replaying */
	private isReplaying = false;

	/** Replay abort controller */
	private replayAbortController: AbortController | null = null;

	/**
	 * Creates a new EventHistory instance
	 *
	 * @param options - History configuration
	 */
	constructor(options: EventHistoryOptions = {}) {
		this.options = {
			maxSize: options.maxSize ?? 1000,
			recording: options.recording ?? true,
			filterTypes: options.filterTypes ?? [],
			excludeTypes: options.excludeTypes ?? [],
		};
	}

	/**
	 * Records an event to history
	 *
	 * @param event - Event to record
	 * @returns The history entry or undefined if filtered
	 */
	record<T extends Event>(event: T): HistoryEntry<T> | undefined {
		if (!this.options.recording) {
			return undefined;
		}

		// Check filters
		if (this.options.filterTypes.length > 0) {
			if (!this.options.filterTypes.includes(event.type)) {
				return undefined;
			}
		}

		if (this.options.excludeTypes.includes(event.type)) {
			return undefined;
		}

		// Create entry
		const entry: HistoryEntry<T> = {
			event,
			index: this.indexCounter++,
			recordedAt: Date.now(),
		};

		// Add to history
		this.entries.push(entry as HistoryEntry);

		// Trim if needed
		if (this.entries.length > this.options.maxSize) {
			this.entries.shift();
		}

		return entry;
	}

	/**
	 * Gets all history entries
	 *
	 * @returns Array of history entries
	 */
	getAll(): ReadonlyArray<HistoryEntry> {
		return [...this.entries];
	}

	/**
	 * Gets recent history entries
	 *
	 * @param count - Number of entries to get
	 * @returns Array of recent entries
	 */
	getRecent(count: number): HistoryEntry[] {
		return this.entries.slice(-count);
	}

	/**
	 * Gets entries by event type
	 *
	 * @param type - Event type to filter by
	 * @returns Array of matching entries
	 */
	getByType<T extends Event>(type: T['type']): HistoryEntry<T>[] {
		return this.entries.filter((entry) => entry.event.type === type) as HistoryEntry<T>[];
	}

	/**
	 * Gets entries within a time range
	 *
	 * @param startTime - Start timestamp
	 * @param endTime - End timestamp
	 * @returns Array of entries in range
	 */
	getByTimeRange(startTime: number, endTime: number): HistoryEntry[] {
		return this.entries.filter(
			(entry) => entry.recordedAt >= startTime && entry.recordedAt <= endTime,
		);
	}

	/**
	 * Gets a specific entry by index
	 *
	 * @param index - Entry index
	 * @returns History entry or undefined
	 */
	getByIndex(index: number): HistoryEntry | undefined {
		return this.entries.find((entry) => entry.index === index);
	}

	/**
	 * Returns the current history size
	 *
	 * @returns Number of entries
	 */
	size(): number {
		return this.entries.length;
	}

	/**
	 * Checks if history is empty
	 *
	 * @returns true if empty
	 */
	isEmpty(): boolean {
		return this.entries.length === 0;
	}

	/**
	 * Clears all history entries
	 */
	clear(): void {
		this.entries = [];
		this.indexCounter = 0;
	}

	/**
	 * Replays history entries
	 *
	 * @param handler - Function to call for each event
	 * @param options - Replay options
	 * @returns Promise that resolves when replay completes
	 */
	async replay(
		handler: (event: Event, entry: HistoryEntry) => void | Promise<void>,
		options: ReplayOptions = {},
	): Promise<void> {
		if (this.isReplaying) {
			throw new Error('Already replaying');
		}

		const {
			delay = 0,
			speed = 1,
			startIndex = 0,
			endIndex = this.entries.length,
			filterType,
		} = options;

		// Filter entries
		let entriesToReplay = this.entries.slice(startIndex, endIndex);
		if (filterType) {
			entriesToReplay = entriesToReplay.filter((e) => e.event.type === filterType);
		}

		if (entriesToReplay.length === 0) {
			return;
		}

		this.isReplaying = true;
		this.replayAbortController = new AbortController();
		const { signal } = this.replayAbortController;

		try {
			for (const entry of entriesToReplay) {
				if (signal.aborted) {
					break;
				}

				await handler(entry.event, entry);

				if (delay > 0 && speed > 0) {
					const actualDelay = delay / speed;
					await this.sleep(actualDelay, signal);
				}
			}
		} finally {
			this.isReplaying = false;
			this.replayAbortController = null;
		}
	}

	/**
	 * Stops an active replay
	 */
	stopReplay(): void {
		if (this.replayAbortController) {
			this.replayAbortController.abort();
		}
	}

	/**
	 * Checks if currently replaying
	 *
	 * @returns true if replaying
	 */
	replaying(): boolean {
		return this.isReplaying;
	}

	/**
	 * Exports history to a serializable format
	 *
	 * @returns Export object
	 */
	export(): {
		entries: Array<{
			event: Event;
			index: number;
			recordedAt: number;
			timestamp: number;
		}>;
		options: EventHistoryOptions;
	} {
		return {
			entries: this.entries.map((entry) => ({
				event: entry.event,
				index: entry.index,
				recordedAt: entry.recordedAt,
				timestamp: entry.event.timestamp,
			})),
			options: { ...this.options },
		};
	}

	/**
	 * Imports history from a serialized format
	 *
	 * @param data - Exported history data
	 */
	import(data: ReturnType<EventHistory['export']>): void {
		this.entries = data.entries.map((e) => ({
			event: e.event,
			index: e.index,
			recordedAt: e.recordedAt,
		}));

		// Update index counter
		const maxIndex = Math.max(...this.entries.map((e) => e.index), -1);
		this.indexCounter = maxIndex + 1;
	}

	/**
	 * Starts recording
	 */
	startRecording(): void {
		this.options.recording = true;
	}

	/**
	 * Stops recording
	 */
	stopRecording(): void {
		this.options.recording = false;
	}

	/**
	 * Checks if recording is enabled
	 *
	 * @returns true if recording
	 */
	isRecording(): boolean {
		return this.options.recording;
	}

	/**
	 * Gets statistics about the history
	 *
	 * @returns Statistics object
	 */
	getStats(): {
		totalEvents: number;
		eventTypes: Record<string, number>;
		timeSpan: number;
		startTime: number;
		endTime: number;
	} {
		const eventTypes: Record<string, number> = {};

		for (const entry of this.entries) {
			const type = entry.event.type;
			eventTypes[type] = (eventTypes[type] ?? 0) + 1;
		}

		const timestamps = this.entries.map((e) => e.recordedAt);
		const startTime = timestamps.length > 0 ? Math.min(...timestamps) : 0;
		const endTime = timestamps.length > 0 ? Math.max(...timestamps) : 0;

		return {
			totalEvents: this.entries.length,
			eventTypes,
			timeSpan: endTime - startTime,
			startTime,
			endTime,
		};
	}

	/**
	 * Finds entries matching a predicate
	 *
	 * @param predicate - Function to test each entry
	 * @returns Array of matching entries
	 */
	find(predicate: (entry: HistoryEntry) => boolean): HistoryEntry[] {
		return this.entries.filter(predicate);
	}

	/**
	 * Returns an iterator over all entries
	 *
	 * @returns Iterator
	 */
	*[Symbol.iterator](): Iterator<HistoryEntry> {
		for (const entry of this.entries) {
			yield entry;
		}
	}

	/**
	 * Sleeps for the specified duration
	 */
	private sleep(ms: number, signal: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal.aborted) {
				reject(new Error('Replay aborted'));
				return;
			}

			const timeout = setTimeout(resolve, ms);

			signal.addEventListener('abort', () => {
				clearTimeout(timeout);
				reject(new Error('Replay aborted'));
			});
		});
	}
}
