/**
 * Raw Mode Manager Module
 *
 * This module provides functionality to switch terminal between cooked (line-buffered)
 * and raw (character-by-character) modes. It handles proper cleanup on exit and
 * signal handling.
 *
 * @module terminal/raw-mode
 */

import { EventEmitter } from 'events';
import * as readline from 'readline';

/**
 * Configuration options for raw mode
 */
export interface RawModeOptions {
	/** Whether to enable raw mode on stdin (default: true) */
	rawMode?: boolean;

	/** Whether to handle SIGINT (Ctrl+C) gracefully (default: true) */
	handleSigint?: boolean;

	/** Whether to handle SIGTERM gracefully (default: true) */
	handleSigterm?: boolean;

	/** Whether to handle SIGWINCH (resize) (default: true) */
	handleSigwinch?: boolean;

	/** Whether to suppress automatic echo of input (default: true) */
	suppressEcho?: boolean;

	/** Callback for SIGINT signal */
	onSigint?: () => void;

	/** Callback for SIGTERM signal */
	onSigterm?: () => void;

	/** Callback for terminal resize */
	onResize?: () => void;
}

/**
 * Default raw mode options
 */
const DEFAULT_OPTIONS: Required<RawModeOptions> = {
	rawMode: true,
	handleSigint: true,
	handleSigterm: true,
	handleSigwinch: true,
	suppressEcho: true,
	onSigint: () => {
		process.exit(0);
	},
	onSigterm: () => {
		process.exit(0);
	},
	onResize: () => {},
};

/**
 * Terminal state backup for restoration
 */
interface TerminalState {
	/** Original isRaw state of stdin */
	isRaw: boolean;

	/** Original resume state */
	isPaused: boolean;

	/** Original encoding */
	encoding: BufferEncoding | null;
}

/**
 * RawModeManager handles switching between cooked and raw terminal modes.
 *
 * Raw mode allows reading input character-by-character without waiting for
 * Enter key, and without automatic echo. This is essential for interactive
 * TUI applications.
 *
 * @example
 * ```typescript
 * const rawMode = new RawModeManager();
 *
 * // Enter raw mode
 * await rawMode.enter();
 *
 * // Your TUI code here...
 *
 * // Exit raw mode (restore original settings)
 * await rawMode.exit();
 * ```
 */
export class RawModeManager extends EventEmitter {
	/** Whether raw mode is currently active */
	private active = false;

	/** Original terminal state for restoration */
	private originalState: TerminalState | null = null;

	/** Current configuration options */
	private options: Required<RawModeOptions>;

	/** Bound signal handlers for cleanup */
	private boundHandlers: Map<string, () => void> = new Map();

	/**
	 * Creates a new RawModeManager instance
	 *
	 * @param {RawModeOptions} options - Configuration options
	 */
	constructor(options: RawModeOptions = {}) {
		super();
		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.setupExitHandlers();
	}

	/**
	 * Check if stdin is a TTY
	 *
	 * @returns {boolean} True if stdin is a TTY
	 */
	isTTY(): boolean {
		return process.stdin.isTTY === true;
	}

	/**
	 * Check if raw mode is currently active
	 *
	 * @returns {boolean} True if raw mode is active
	 */
	isActive(): boolean {
		return this.active;
	}

	/**
	 * Enter raw mode
	 *
	 * Saves the current terminal state and switches to raw mode.
	 * Raw mode allows character-by-character input without echo.
	 *
	 * @returns {Promise<void>} Resolves when raw mode is enabled
	 * @throws {Error} If stdin is not a TTY
	 *
	 * @example
	 * ```typescript
	 * await rawMode.enter();
	 * console.log('Now in raw mode');
	 * ```
	 */
	async enter(): Promise<void> {
		if (this.active) {
			return;
		}

		if (!this.isTTY()) {
			throw new Error('Cannot enable raw mode: stdin is not a TTY');
		}

		// Save current state
		this.originalState = {
			isRaw: process.stdin.isRaw,
			isPaused: process.stdin.isPaused(),
			encoding: process.stdin.readableEncoding,
		};

		// Setup signal handlers
		this.setupSignalHandlers();

		// Enable raw mode
		if (this.options.rawMode) {
			process.stdin.setRawMode(true);
		}

		// Resume stdin if paused
		if (process.stdin.isPaused()) {
			process.stdin.resume();
		}

		this.active = true;
		this.emit('enter');
	}

	/**
	 * Exit raw mode
	 *
	 * Restores the terminal to its original state before raw mode was entered.
	 *
	 * @returns {Promise<void>} Resolves when raw mode is disabled
	 *
	 * @example
	 * ```typescript
	 * await rawMode.exit();
	 * console.log('Back to cooked mode');
	 * ```
	 */
	async exit(): Promise<void> {
		if (!this.active) {
			return;
		}

		// Remove signal handlers
		this.removeSignalHandlers();

		// Restore original state
		if (this.originalState) {
			if (this.options.rawMode && process.stdin.isTTY) {
				process.stdin.setRawMode(false);
			}

			if (this.originalState.isPaused) {
				process.stdin.pause();
			}
		}

		this.active = false;
		this.originalState = null;
		this.emit('exit');
	}

	/**
	 * Restore terminal to original state
	 *
	 * Alias for exit() with additional cleanup.
	 *
	 * @returns {Promise<void>} Resolves when terminal is restored
	 */
	async restore(): Promise<void> {
		await this.exit();
		this.emit('restore');
	}

	/**
	 * Toggle raw mode on/off
	 *
	 * @returns {Promise<boolean>} New raw mode state (true = active)
	 */
	async toggle(): Promise<boolean> {
		if (this.active) {
			await this.exit();
			return false;
		}

		await this.enter();
		return true;
	}

	/**
	 * Setup signal handlers
	 */
	private setupSignalHandlers(): void {
		// SIGINT handler (Ctrl+C)
		if (this.options.handleSigint) {
			const sigintHandler = (): void => {
				this.emit('sigint');
				this.options.onSigint();
			};
			this.boundHandlers.set('SIGINT', sigintHandler);
			process.once('SIGINT', sigintHandler);
		}

		// SIGTERM handler
		if (this.options.handleSigterm) {
			const sigtermHandler = (): void => {
				this.emit('sigterm');
				this.cleanup();
				this.options.onSigterm();
			};
			this.boundHandlers.set('SIGTERM', sigtermHandler);
			process.once('SIGTERM', sigtermHandler);
		}

		// SIGWINCH handler (terminal resize)
		if (this.options.handleSigwinch) {
			const sigwinchHandler = (): void => {
				this.emit('resize');
				this.options.onResize();
			};
			this.boundHandlers.set('SIGWINCH', sigwinchHandler);
			process.on('SIGWINCH', sigwinchHandler);
		}
	}

	/**
	 * Remove signal handlers
	 */
	private removeSignalHandlers(): void {
		for (const [signal, handler] of this.boundHandlers) {
			process.removeListener(signal, handler);
		}

		this.boundHandlers.clear();
	}

	/**
	 * Setup process exit handlers for cleanup
	 */
	private setupExitHandlers(): void {
		// Ensure cleanup on uncaught exceptions
		const cleanup = (): void => {
			void this.cleanup();
		};

		process.on('exit', cleanup);
		process.on('beforeExit', cleanup);
	}

	/**
	 * Cleanup and restore terminal state
	 *
	 * This is called automatically on exit signals to ensure the terminal
	 * is not left in raw mode.
	 */
	private cleanup(): void {
		if (this.active && process.stdin.isTTY) {
			try {
				process.stdin.setRawMode(false);
			} catch {
				// Ignore errors during cleanup
			}
		}
	}

	/**
	 * Pause stdin
	 */
	pause(): void {
		process.stdin.pause();
		this.emit('pause');
	}

	/**
	 * Resume stdin
	 */
	resume(): void {
		process.stdin.resume();
		this.emit('resume');
	}

	/**
	 * Update options after construction
	 *
	 * @param {Partial<RawModeOptions>} options - New options to merge
	 */
	setOptions(options: Partial<RawModeOptions>): void {
		this.options = { ...this.options, ...options };
	}

	/**
	 * Get current options
	 *
	 * @returns {Required<RawModeOptions>} Current options
	 */
	getOptions(): Required<RawModeOptions> {
		return { ...this.options };
	}
}

/**
 * Create a new RawModeManager with the given options
 *
 * @param {RawModeOptions} options - Configuration options
 * @returns {RawModeManager} New RawModeManager instance
 *
 * @example
 * ```typescript
 * const rawMode = createRawModeManager({ handleSigint: false });
 * await rawMode.enter();
 * ```
 */
export function createRawModeManager(options?: RawModeOptions): RawModeManager {
	return new RawModeManager(options);
}

/**
 * Check if the current environment supports raw mode
 *
 * @returns {boolean} True if raw mode is supported
 */
export function supportsRawMode(): boolean {
	return process.stdin.isTTY === true;
}
