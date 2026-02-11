/**
 * Event Queue Module
 *
 * Provides a thread-safe, priority-based event queue for managing events
 * in the TUI framework. Uses a linked list for efficient insertion and removal.
 *
 * @module events/queue
 */

import { EventPriority, type Event } from './types.js';

/**
 * Node for the linked list event queue
 */
interface QueueNode {
	/** The event stored in this node */
	event: Event;
	/** Reference to the next node */
	next: QueueNode | null;
}

/**
 * Options for the EventQueue
 */
export interface EventQueueOptions {
	/** Maximum queue size (0 = unlimited) */
	maxSize?: number;
	/** Whether to drop low priority events when queue is full */
	dropLowPriorityOnOverflow?: boolean;
}

/**
 * EventQueue class for managing events with priority support
 *
 * @example
 * ```typescript
 * const queue = new EventQueue();
 *
 * // Enqueue events with different priorities
 * queue.enqueue(keyEvent, EventPriority.HIGH);
 * queue.enqueue(mouseEvent, EventPriority.NORMAL);
 *
 * // Process events
 * while (queue.size() > 0) {
 *   const event = queue.dequeue();
 *   handleEvent(event);
 * }
 * ```
 */
export class EventQueue {
	/** Head of the queue (highest priority) */
	private head: QueueNode | null = null;

	/** Tail of the queue (lowest priority) */
	private tail: QueueNode | null = null;

	/** Current queue size */
	private _size = 0;

	/** Maximum queue size */
	private readonly maxSize: number;

	/** Whether to drop low priority events on overflow */
	private readonly dropLowPriorityOnOverflow: boolean;

	/** Queue statistics */
	private stats = {
		enqueued: 0,
		dequeued: 0,
		dropped: 0,
		cleared: 0,
	};

	/**
	 * Creates a new EventQueue instance
	 *
	 * @param options - Configuration options
	 */
	constructor(options: EventQueueOptions = {}) {
		this.maxSize = options.maxSize ?? 0;
		this.dropLowPriorityOnOverflow = options.dropLowPriorityOnOverflow ?? true;
	}

	/**
	 * Adds an event to the queue with the specified priority
	 *
	 * @param event - The event to enqueue
	 * @param priority - Priority level (lower = higher priority)
	 * @returns true if the event was added, false if dropped
	 */
	enqueue(event: Event, priority?: EventPriority): boolean {
		// Check if queue is at capacity
		if (this.maxSize > 0 && this._size >= this.maxSize) {
			if (this.dropLowPriorityOnOverflow && (priority ?? 1) >= EventPriority.LOW) {
				this.stats.dropped++;
				return false;
			}
		}

		// Set priority on event
		const eventWithPriority = {
			...event,
			priority: priority ?? event.priority ?? EventPriority.NORMAL,
			timestamp: event.timestamp ?? Date.now(),
		};

		const newNode: QueueNode = {
			event: eventWithPriority,
			next: null,
		};

		// Insert based on priority
		this.insertByPriority(newNode, eventWithPriority.priority);

		this._size++;
		this.stats.enqueued++;

		return true;
	}

	/**
	 * Inserts a node at the correct position based on priority
	 *
	 * @param newNode - The node to insert
	 * @param priority - The priority level
	 */
	private insertByPriority(newNode: QueueNode, priority: EventPriority): void {
		// Empty queue
		if (!this.head) {
			this.head = this.tail = newNode;
			return;
		}

		// Insert at head if higher priority
		if (priority < (this.head.event.priority ?? EventPriority.NORMAL)) {
			newNode.next = this.head;
			this.head = newNode;
			return;
		}

		// Find insertion point
		let current = this.head;
		while (current.next && (current.next.event.priority ?? EventPriority.NORMAL) <= priority) {
			current = current.next;
		}

		// Insert after current
		newNode.next = current.next;
		current.next = newNode;

		// Update tail if inserted at end
		if (!newNode.next) {
			this.tail = newNode;
		}
	}

	/**
	 * Removes and returns the highest priority event from the queue
	 *
	 * @returns The next event or undefined if queue is empty
	 */
	dequeue(): Event | undefined {
		if (!this.head) {
			return undefined;
		}

		const event = this.head.event;
		this.head = this.head.next;

		if (!this.head) {
			this.tail = null;
		}

		this._size--;
		this.stats.dequeued++;

		return event;
	}

	/**
	 * Returns the highest priority event without removing it
	 *
	 * @returns The next event or undefined if queue is empty
	 */
	peek(): Event | undefined {
		return this.head?.event;
	}

	/**
	 * Returns the current size of the queue
	 *
	 * @returns Number of events in the queue
	 */
	size(): number {
		return this._size;
	}

	/**
	 * Checks if the queue is empty
	 *
	 * @returns true if queue is empty
	 */
	isEmpty(): boolean {
		return this._size === 0;
	}

	/**
	 * Clears all events from the queue
	 */
	clear(): void {
		this.head = null;
		this.tail = null;
		this._size = 0;
		this.stats.cleared++;
	}

	/**
	 * Returns all events in the queue without removing them
	 *
	 * @returns Array of events in priority order
	 */
	peekAll(): Event[] {
		const events: Event[] = [];
		let current = this.head;

		while (current) {
			events.push(current.event);
			current = current.next;
		}

		return events;
	}

	/**
	 * Removes events matching a predicate
	 *
	 * @param predicate - Function to test each event
	 * @returns Number of events removed
	 */
	removeWhere(predicate: (event: Event) => boolean): number {
		let removed = 0;

		// Remove from head
		while (this.head && predicate(this.head.event)) {
			this.head = this.head.next;
			this._size--;
			removed++;
		}

		if (!this.head) {
			this.tail = null;
			return removed;
		}

		// Remove from middle and tail
		let current = this.head;
		while (current.next) {
			if (predicate(current.next.event)) {
				current.next = current.next.next;
				if (!current.next) {
					this.tail = current;
				}
				this._size--;
				removed++;
			} else {
				current = current.next;
			}
		}

		return removed;
	}

	/**
	 * Gets queue statistics
	 *
	 * @returns Statistics object
	 */
	getStats(): Readonly<typeof this.stats> {
		return { ...this.stats };
	}

	/**
	 * Resets queue statistics
	 */
	resetStats(): void {
		this.stats = {
			enqueued: 0,
			dequeued: 0,
			dropped: 0,
			cleared: 0,
		};
	}

	/**
	 * Returns events filtered by type
	 *
	 * @param type - Event type to filter by
	 * @returns Array of matching events
	 */
	findByType<T extends Event>(type: T['type']): T[] {
		const events: T[] = [];
		let current = this.head;

		while (current) {
			if (current.event.type === type) {
				events.push(current.event as T);
			}
			current = current.next;
		}

		return events;
	}

	/**
	 * Batch enqueue multiple events
	 *
	 * @param events - Array of events to enqueue
	 * @param priority - Priority for all events
	 * @returns Number of events successfully enqueued
	 */
	batchEnqueue(events: Event[], priority?: EventPriority): number {
		let added = 0;
		for (const event of events) {
			if (this.enqueue(event, priority)) {
				added++;
			}
		}
		return added;
	}
}
