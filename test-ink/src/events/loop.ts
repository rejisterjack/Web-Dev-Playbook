/**
 * Event Loop Core Module
 *
 * The main event loop that manages non-blocking I/O using Node.js streams,
 * processes input from stdin, and dispatches events to handlers.
 *
 * @module events/loop
 */

import { Readable } from 'stream';
import type { ReadStream } from 'tty';
import {
	EventPriority,
	createBaseEvent,
	isKeyEvent,
	isMouseEvent,
	type Event,
	type IdleEvent,
} from './types.js';
import { EventQueue } from './queue.js';
import { EventEmitter } from './emitter.js';
import { InputParser } from './parser.js';
import { SignalHandler } from './signals.js';
import { Debouncer } from './debounce.js';
import { Throttler } from './throttle.js';

/**
 * Event loop state
 */
export enum EventLoopState {
	/** Loop is not running */
	STOPPED = 'stopped',
	/** Loop is running */
	RUNNING = 'running',
	/** Loop is paused */
	PAUSED = 'paused',
	/** Loop is shutting down */
	STOPPING = 'stopping',
}

/**
 * Event loop options
 */
export interface EventLoopOptions {
	/** Input stream (default: process.stdin) */
	input?: Readable;
	/** Enable raw mode on input */
	rawMode?: boolean;
	/** Enable mouse support */
	mouseSupport?: boolean;
	/** Enable bracketed paste */
	bracketedPaste?: boolean;
	/** Enable focus events */
	focusEvents?: boolean;
	/** Idle callback interval in ms */
	idleInterval?: number;
	/** Maximum events to process per tick */
	maxEventsPerTick?: number;
	/** Event queue max size */
	queueMaxSize?: number;
	/** Enable debouncing for keyboard events */
	debounceKeys?: boolean;
	/** Enable throttling for mouse events */
	throttleMouse?: boolean;
	/** Handle process signals */
	handleSignals?: boolean;
}

/**
 * Idle callback function type
 */
export type IdleCallback = (event: IdleEvent) => void | Promise<void>;

/**
 * EventLoop class - the main event loop for the TUI framework
 *
 * @example
 * ```typescript
 * const loop = new EventLoop({
 *   mouseSupport: true,
 *   bracketedPaste: true
 * });
 *
 * // Listen for events
 * loop.on('key', (event) => {
 *   console.log('Key:', event.key);
 * });
 *
 * // Set idle callback
 * loop.setIdleCallback((event) => {
 *   // Do background work when no events pending
 * });
 *
 * // Start the loop
 * await loop.start();
 *
 * // Later, stop the loop
 * await loop.stop();
 * ```
 */
export class EventLoop {
	/** Current loop state */
	private state = EventLoopState.STOPPED;

	/** Event queue */
	private queue: EventQueue;

	/** Event emitter */
	private emitter: EventEmitter;

	/** Input parser */
	private parser: InputParser;

	/** Signal handler */
	private signalHandler: SignalHandler;

	/** Debouncer for keyboard events */
	private debouncer: Debouncer;

	/** Throttler for mouse events */
	private throttler: Throttler;

	/** Loop options */
	private options: Required<EventLoopOptions>;

	/** Input stream */
	private input: Readable | ReadStream;

	/** Idle callback */
	private idleCallback: IdleCallback | null = null;

	/** Idle interval handle */
	private idleIntervalId: NodeJS.Timeout | null = null;

	/** Last event time */
	private lastEventTime = Date.now();

	/** Processing flag */
	private processing = false;

	/** Bound data handler */
	private boundOnData: (data: Buffer) => void;

	/** Bound error handler */
	private boundOnError: (error: Error) => void;

	/**
	 * Creates a new EventLoop instance
	 *
	 * @param options - Event loop configuration
	 */
	constructor(options: EventLoopOptions = {}) {
		this.options = {
			input: options.input ?? process.stdin,
			rawMode: options.rawMode ?? true,
			mouseSupport: options.mouseSupport ?? true,
			bracketedPaste: options.bracketedPaste ?? true,
			focusEvents: options.focusEvents ?? true,
			idleInterval: options.idleInterval ?? 16,
			maxEventsPerTick: options.maxEventsPerTick ?? 100,
			queueMaxSize: options.queueMaxSize ?? 10000,
			debounceKeys: options.debounceKeys ?? false,
			throttleMouse: options.throttleMouse ?? true,
			handleSignals: options.handleSignals ?? true,
		};

		this.input = this.options.input;
		this.queue = new EventQueue({ maxSize: this.options.queueMaxSize });
		this.emitter = new EventEmitter();
		this.parser = new InputParser({
			mouseSupport: this.options.mouseSupport,
			bracketedPaste: this.options.bracketedPaste,
			focusEvents: this.options.focusEvents,
		});
		this.signalHandler = new SignalHandler({
			handleSIGWINCH: this.options.handleSignals,
			handleSIGINT: this.options.handleSignals,
			handleSIGTERM: this.options.handleSignals,
			handleSIGHUP: this.options.handleSignals,
		});
		this.debouncer = new Debouncer();
		this.throttler = new Throttler();

		// Bind handlers
		this.boundOnData = this.onData.bind(this);
		this.boundOnError = this.onError.bind(this);

		// Set up signal handler callbacks
		this.setupSignalHandlers();
	}

	/**
	 * Starts the event loop
	 */
	async start(): Promise<void> {
		if (this.state !== EventLoopState.STOPPED) {
			throw new Error(`Cannot start event loop from state: ${this.state}`);
		}

		this.state = EventLoopState.RUNNING;

		// Set up input stream
		if ('setRawMode' in this.input && this.options.rawMode) {
			(this.input as ReadStream).setRawMode(true);
		}

		this.input.resume();
		this.input.setEncoding('utf8');
		this.input.on('data', this.boundOnData);
		this.input.on('error', this.boundOnError);

		// Start signal handler
		if (this.options.handleSignals) {
			this.signalHandler.start();
		}

		// Start idle callback timer
		if (this.idleCallback) {
			this.startIdleTimer();
		}

		// Start processing
		this.process();
	}

	/**
	 * Stops the event loop
	 */
	async stop(): Promise<void> {
		if (this.state === EventLoopState.STOPPED || this.state === EventLoopState.STOPPING) {
			return;
		}

		this.state = EventLoopState.STOPPING;

		// Stop idle timer
		this.stopIdleTimer();

		// Clean up input stream
		this.input.off('data', this.boundOnData);
		this.input.off('error', this.boundOnError);

		if ('setRawMode' in this.input && this.options.rawMode) {
			(this.input as ReadStream).setRawMode(false);
		}

		// Stop signal handler
		this.signalHandler.stop();

		// Flush debouncers and throttlers
		this.debouncer.flushAll();
		this.throttler.flushAll();

		// Process remaining events
		await this.drain();

		this.state = EventLoopState.STOPPED;
	}

	/**
	 * Pauses the event loop
	 */
	pause(): void {
		if (this.state !== EventLoopState.RUNNING) {
			return;
		}

		this.state = EventLoopState.PAUSED;
		this.stopIdleTimer();

		if ('pause' in this.input) {
			this.input.pause();
		}
	}

	/**
	 * Resumes the event loop
	 */
	resume(): void {
		if (this.state !== EventLoopState.PAUSED) {
			return;
		}

		this.state = EventLoopState.RUNNING;

		if ('resume' in this.input) {
			this.input.resume();
		}

		if (this.idleCallback) {
			this.startIdleTimer();
		}

		this.process();
	}

	/**
	 * Registers an event listener
	 *
	 * @param type - Event type or wildcard '*'
	 * @param listener - Event listener
	 * @returns Unsubscribe function
	 */
	on<T extends Event>(type: T['type'] | '*', listener: (event: T) => void): () => void {
		return this.emitter.on(type, listener as (event: Event) => void | boolean);
	}

	/**
	 * Registers a one-time event listener
	 *
	 * @param type - Event type
	 * @param listener - Event listener
	 * @returns Unsubscribe function
	 */
	once<T extends Event>(type: T['type'], listener: (event: T) => void): () => void {
		return this.emitter.once(type, listener as (event: Event) => void | boolean);
	}

	/**
	 * Removes an event listener
	 *
	 * @param type - Event type
	 * @param listener - Listener to remove
	 */
	off<T extends Event>(type: T['type'], listener: (event: T) => void): void {
		this.emitter.off(type, listener as (event: Event) => void | boolean);
	}

	/**
	 * Sets the idle callback
	 *
	 * @param callback - Callback function
	 */
	setIdleCallback(callback: IdleCallback | null): void {
		this.idleCallback = callback;

		if (this.state === EventLoopState.RUNNING) {
			if (callback) {
				this.startIdleTimer();
			} else {
				this.stopIdleTimer();
			}
		}
	}

	/**
	 * Enqueues an event
	 *
	 * @param event - Event to enqueue
	 * @param priority - Event priority
	 */
	enqueue(event: Event, priority?: EventPriority): void {
		this.queue.enqueue(event, priority);
		this.process();
	}

	/**
	 * Gets the current loop state
	 *
	 * @returns Current state
	 */
	getState(): EventLoopState {
		return this.state;
	}

	/**
	 * Checks if the loop is running
	 *
	 * @returns true if running
	 */
	isRunning(): boolean {
		return this.state === EventLoopState.RUNNING;
	}

	/**
	 * Gets the event queue
	 *
	 * @returns Event queue
	 */
	getQueue(): EventQueue {
		return this.queue;
	}

	/**
	 * Gets the event emitter
	 *
	 * @returns Event emitter
	 */
	getEmitter(): EventEmitter {
		return this.emitter;
	}

	/**
	 * Gets the signal handler
	 *
	 * @returns Signal handler
	 */
	getSignalHandler(): SignalHandler {
		return this.signalHandler;
	}

	/**
	 * Gets queue statistics
	 *
	 * @returns Statistics object
	 */
	getStats(): {
		state: EventLoopState;
		queueSize: number;
		lastEventTime: number;
		isProcessing: boolean;
	} {
		return {
			state: this.state,
			queueSize: this.queue.size(),
			lastEventTime: this.lastEventTime,
			isProcessing: this.processing,
		};
	}

	/**
	 * Handles data from input stream
	 */
	private onData(data: Buffer): void {
		const input = data.toString('utf8');
		const result = this.parser.parse(input);

		if (result.success) {
			for (const event of result.events) {
				// Apply debouncing/throttling
				if (this.options.debounceKeys && isKeyEvent(event)) {
					this.handleDebouncedKey(event);
				} else if (this.options.throttleMouse && isMouseEvent(event)) {
					this.handleThrottledMouse(event);
				} else {
					this.enqueue(event);
				}
			}
		}
	}

	/**
	 * Handles errors from input stream
	 */
	private onError(error: Error): void {
		console.error('Event loop input error:', error);
	}

	/**
	 * Handles debounced keyboard events
	 */
	private handleDebouncedKey(event: Event): void {
		const key = isKeyEvent(event) ? `${event.ctrl ? 'ctrl+' : ''}${event.key}` : 'unknown';

		this.debouncer.getOrCreate(
			`key_${key}`,
			(e: Event) => this.enqueue(e),
			{ delay: 50, leading: false, trailing: true },
		)(event);
	}

	/**
	 * Handles throttled mouse events
	 */
	private handleThrottledMouse(event: Event): void {
		this.throttler.getOrCreate(
			'mouse',
			(e: Event) => this.enqueue(e),
			{ interval: 16, leading: true, trailing: false },
		)(event);
	}

	/**
	 * Processes events from the queue
	 */
	private process(): void {
		if (this.processing || this.state !== EventLoopState.RUNNING) {
			return;
		}

		this.processing = true;

		try {
			let processed = 0;

			while (
				this.state === EventLoopState.RUNNING &&
				!this.queue.isEmpty() &&
				processed < this.options.maxEventsPerTick
			) {
				const event = this.queue.dequeue();
				if (!event) break;

				this.lastEventTime = Date.now();
				this.emitter.emit(event);
				processed++;
			}
		} finally {
			this.processing = false;
		}
	}

	/**
	 * Drains remaining events from the queue
	 */
	private async drain(): Promise<void> {
		while (!this.queue.isEmpty()) {
			const event = this.queue.dequeue();
			if (event) {
				await this.emitter.emitAsync(event);
			}
		}
	}

	/**
	 * Starts the idle timer
	 */
	private startIdleTimer(): void {
		if (this.idleIntervalId) {
			return;
		}

		this.idleIntervalId = setInterval(() => {
			if (this.state !== EventLoopState.RUNNING) {
				return;
			}

			// Only trigger idle if no events are pending
			if (this.queue.isEmpty() && !this.processing && this.idleCallback) {
				const now = Date.now();
				const deltaTime = now - this.lastEventTime;

				const idleEvent: IdleEvent = {
					...createBaseEvent('idle', EventPriority.LOW),
					type: 'idle',
					deltaTime,
					timestamp: now,
				};

				try {
					const result = this.idleCallback(idleEvent);
					if (result instanceof Promise) {
						result.catch((error) => {
							console.error('Error in idle callback:', error);
						});
					}
				} catch (error) {
					console.error('Error in idle callback:', error);
				}
			}
		}, this.options.idleInterval);
	}

	/**
	 * Stops the idle timer
	 */
	private stopIdleTimer(): void {
		if (this.idleIntervalId) {
			clearInterval(this.idleIntervalId);
			this.idleIntervalId = null;
		}
	}

	/**
	 * Sets up signal handler callbacks
	 */
	private setupSignalHandlers(): void {
		// Resize events
		this.signalHandler.onResize((event) => {
			this.enqueue(event, EventPriority.HIGH);
		});
	}
}
