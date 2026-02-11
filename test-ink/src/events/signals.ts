/**
 * Signal Handler Module
 *
 * Handles process signals (SIGWINCH, SIGINT, SIGTERM, SIGHUP) and converts
 * them to events for the event loop system.
 *
 * @module events/signals
 */

import { EventPriority, SignalType, createBaseEvent, type SignalEvent, type ResizeEvent } from './types.js';

/**
 * Signal handler options
 */
export interface SignalHandlerOptions {
	/** Handle SIGWINCH (terminal resize) */
	handleSIGWINCH?: boolean;
	/** Handle SIGINT (Ctrl+C) */
	handleSIGINT?: boolean;
	/** Handle SIGTERM (termination) */
	handleSIGTERM?: boolean;
	/** Handle SIGHUP (hangup) */
	handleSIGHUP?: boolean;
	/** Handle SIGQUIT (Ctrl+\) */
	handleSIGQUIT?: boolean;
	/** Handle SIGTSTP (Ctrl+Z) */
	handleSIGTSTP?: boolean;
	/** Handle SIGCONT (continue after stop) */
	handleSIGCONT?: boolean;
	/** Exit on SIGINT (default: true) */
	exitOnSIGINT?: boolean;
	/** Exit on SIGTERM (default: true) */
	exitOnSIGTERM?: boolean;
}

/**
 * Signal event callback type
 */
export type SignalCallback = (event: SignalEvent) => void | boolean | Promise<void | boolean>;

/**
 * Resize event callback type
 */
export type ResizeCallback = (event: ResizeEvent) => void;

/**
 * SignalHandler class for managing process signals
 *
 * @example
 * ```typescript
 * const signals = new SignalHandler();
 *
 * // Listen for resize events
 * signals.onResize((event) => {
 *   console.log(`Terminal resized: ${event.columns}x${event.rows}`);
 * });
 *
 * // Listen for signals
 * signals.onSignal(SignalType.SIGINT, (event) => {
 *   console.log('Interrupted!');
 *   return false; // Prevent default exit
 * });
 *
 * signals.start();
 * ```
 */
export class SignalHandler {
	/** Handler options */
	private options: Required<SignalHandlerOptions>;

	/** Signal callbacks */
	private signalCallbacks = new Map<SignalType, Set<SignalCallback>>();

	/** Resize callbacks */
	private resizeCallbacks = new Set<ResizeCallback>();

	/** Whether the handler is active */
	private active = false;

	/** Original handlers (for restoration) */
	// biome-ignore lint/suspicious/noExplicitAny: NodeJS signal listener type complexity
	private originalHandlers = new Map<SignalType, any>();

	/** Last known terminal size */
	private lastSize = { columns: process.stdout.columns ?? 80, rows: process.stdout.rows ?? 24 };

	/**
	 * Creates a new SignalHandler instance
	 *
	 * @param options - Signal handler configuration
	 */
	constructor(options: SignalHandlerOptions = {}) {
		this.options = {
			handleSIGWINCH: options.handleSIGWINCH ?? true,
			handleSIGINT: options.handleSIGINT ?? true,
			handleSIGTERM: options.handleSIGTERM ?? true,
			handleSIGHUP: options.handleSIGHUP ?? true,
			handleSIGQUIT: options.handleSIGQUIT ?? false,
			handleSIGTSTP: options.handleSIGTSTP ?? false,
			handleSIGCONT: options.handleSIGCONT ?? false,
			exitOnSIGINT: options.exitOnSIGINT ?? true,
			exitOnSIGTERM: options.exitOnSIGTERM ?? true,
		};

		// Initialize callback sets for all signal types
		for (const type of Object.values(SignalType)) {
			this.signalCallbacks.set(type, new Set());
		}
	}

	/**
	 * Starts listening for signals
	 */
	start(): void {
		if (this.active) {
			return;
		}

		this.active = true;

		// Save original handlers and install ours
		if (this.options.handleSIGWINCH) {
			this.installHandler('SIGWINCH', this.handleSIGWINCH.bind(this));
		}

		if (this.options.handleSIGINT) {
			this.installHandler('SIGINT', this.handleSIGINT.bind(this));
		}

		if (this.options.handleSIGTERM) {
			this.installHandler('SIGTERM', this.handleSIGTERM.bind(this));
		}

		if (this.options.handleSIGHUP) {
			this.installHandler('SIGHUP', this.handleSIGHUP.bind(this));
		}

		if (this.options.handleSIGQUIT) {
			this.installHandler('SIGQUIT', this.handleSIGQUIT.bind(this));
		}

		if (this.options.handleSIGTSTP) {
			this.installHandler('SIGTSTP', this.handleSIGTSTP.bind(this));
		}

		if (this.options.handleSIGCONT) {
			this.installHandler('SIGCONT', this.handleSIGCONT.bind(this));
		}

		// Capture initial size
		this.lastSize = {
			columns: process.stdout.columns ?? 80,
			rows: process.stdout.rows ?? 24,
		};
	}

	/**
	 * Stops listening for signals and restores original handlers
	 */
	stop(): void {
		if (!this.active) {
			return;
		}

		this.active = false;

		// Restore original handlers
		for (const [signal, handler] of this.originalHandlers) {
			if (handler) {
				process.on(signal, handler);
			} else {
				process.removeAllListeners(signal);
			}
		}

		this.originalHandlers.clear();
	}

	/**
	 * Registers a callback for a specific signal type
	 *
	 * @param signal - Signal type to listen for
	 * @param callback - Callback function
	 * @returns Unsubscribe function
	 */
	onSignal(signal: SignalType, callback: SignalCallback): () => void {
		const callbacks = this.signalCallbacks.get(signal);
		if (!callbacks) {
			throw new Error(`Unknown signal type: ${signal}`);
		}

		callbacks.add(callback);

		return () => {
			callbacks.delete(callback);
		};
	}

	/**
	 * Registers a callback for resize events
	 *
	 * @param callback - Callback function
	 * @returns Unsubscribe function
	 */
	onResize(callback: ResizeCallback): () => void {
		this.resizeCallbacks.add(callback);

		return () => {
			this.resizeCallbacks.delete(callback);
		};
	}

	/**
	 * Removes all callbacks for a signal type
	 *
	 * @param signal - Signal type to clear
	 */
	removeAllCallbacks(signal?: SignalType): void {
		if (signal) {
			const callbacks = this.signalCallbacks.get(signal);
			if (callbacks) {
				callbacks.clear();
			}
		} else {
			for (const callbacks of this.signalCallbacks.values()) {
				callbacks.clear();
			}
			this.resizeCallbacks.clear();
		}
	}

	/**
	 * Checks if the handler is active
	 *
	 * @returns true if active
	 */
	isActive(): boolean {
		return this.active;
	}

	/**
	 * Triggers a resize check manually
	 *
	 * @returns Resize event if size changed, undefined otherwise
	 */
	checkResize(): ResizeEvent | undefined {
		const currentColumns = process.stdout.columns ?? 80;
		const currentRows = process.stdout.rows ?? 24;

		if (
			currentColumns !== this.lastSize.columns ||
			currentRows !== this.lastSize.rows
		) {
			const event: ResizeEvent = {
				...createBaseEvent('resize', EventPriority.HIGH),
				type: 'resize',
				columns: currentColumns,
				rows: currentRows,
				previousColumns: this.lastSize.columns,
				previousRows: this.lastSize.rows,
				timestamp: Date.now(),
			};

			this.lastSize = { columns: currentColumns, rows: currentRows };

			// Notify resize callbacks
			for (const callback of this.resizeCallbacks) {
				try {
					callback(event);
				} catch (error) {
					console.error('Error in resize callback:', error);
				}
			}

			return event;
		}

		return undefined;
	}

	/**
	 * Installs a signal handler
	 */
	private installHandler(signal: NodeJS.Signals, handler: NodeJS.SignalsListener): void {
		// Store existing handlers
		const existing = process.listeners(signal);
		this.originalHandlers.set(signal as SignalType, existing[0] ?? null);

		// Remove existing handlers and install ours
		process.removeAllListeners(signal);
		process.on(signal, handler);
	}

	/**
	 * Handles SIGWINCH (terminal resize)
	 */
	private handleSIGWINCH(): void {
		const event = this.checkResize();

		if (event) {
			this.emitSignalEvent(SignalType.SIGWINCH);
		}
	}

	/**
	 * Handles SIGINT (Ctrl+C)
	 */
	private handleSIGINT(): void {
		const shouldExit = this.emitSignalEvent(SignalType.SIGINT);

		if (shouldExit && this.options.exitOnSIGINT) {
			this.stop();
			process.exit(0);
		}
	}

	/**
	 * Handles SIGTERM (termination)
	 */
	private handleSIGTERM(): void {
		const shouldExit = this.emitSignalEvent(SignalType.SIGTERM);

		if (shouldExit && this.options.exitOnSIGTERM) {
			this.stop();
			process.exit(0);
		}
	}

	/**
	 * Handles SIGHUP (hangup)
	 */
	private handleSIGHUP(): void {
		this.emitSignalEvent(SignalType.SIGHUP);
	}

	/**
	 * Handles SIGQUIT (Ctrl+\)
	 */
	private handleSIGQUIT(): void {
		this.emitSignalEvent(SignalType.SIGQUIT);
	}

	/**
	 * Handles SIGTSTP (Ctrl+Z)
	 */
	private handleSIGTSTP(): void {
		this.emitSignalEvent(SignalType.SIGTSTP);
	}

	/**
	 * Handles SIGCONT (continue after stop)
	 */
	private handleSIGCONT(): void {
		this.emitSignalEvent(SignalType.SIGCONT);

		// Check for resize that may have occurred while stopped
		this.checkResize();
	}

	/**
	 * Emits a signal event to all registered callbacks
	 *
	 * @param signal - Signal type
	 * @returns false if any callback returned false (prevent default)
	 */
	private emitSignalEvent(signal: SignalType): boolean {
		const event: SignalEvent = {
			...createBaseEvent('signal', EventPriority.HIGH),
			type: 'signal',
			signal,
			timestamp: Date.now(),
		};

		const callbacks = this.signalCallbacks.get(signal);
		if (!callbacks) {
			return true;
		}

		let shouldContinue = true;

		for (const callback of callbacks) {
			try {
				const result = callback(event);

				// Handle async callbacks
				if (result instanceof Promise) {
					result.catch((error) => {
						console.error(`Error in async signal handler for ${signal}:`, error);
					});
				} else if (result === false) {
					shouldContinue = false;
				}
			} catch (error) {
				console.error(`Error in signal handler for ${signal}:`, error);
			}
		}

		return shouldContinue;
	}

	/**
	 * Gets the last known terminal size
	 *
	 * @returns Terminal size
	 */
	getLastSize(): { columns: number; rows: number } {
		return { ...this.lastSize };
	}
}
