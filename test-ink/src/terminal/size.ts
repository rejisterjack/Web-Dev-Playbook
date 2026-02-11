/**
 * Terminal Size Module
 *
 * This module provides functionality to query terminal dimensions,
 * listen for resize events, and cache current size with change notifications.
 *
 * @module terminal/size
 */

import { EventEmitter } from 'events';
import { execSync } from 'child_process';

/**
 * Terminal size interface
 */
export interface TerminalSize {
	/** Number of columns (width in characters) */
	columns: number;

	/** Number of rows (height in lines) */
	rows: number;

	/** Width in pixels (if available) */
	width?: number;

	/** Height in pixels (if available) */
	height?: number;
}

/**
 * Terminal size options
 */
export interface TerminalSizeOptions {
	/** Whether to emit resize events (default: true) */
	emitEvents?: boolean;

	/** Callback for resize events */
	onResize?: (size: TerminalSize, oldSize: TerminalSize) => void;

	/** Initial size to use before querying (default: 80x24) */
	defaultSize?: Partial<TerminalSize>;
}

/**
 * Default terminal size (fallback)
 */
const DEFAULT_SIZE: TerminalSize = {
	columns: 80,
	rows: 24,
};

/**
 * Terminal size manager that handles size queries and resize events.
 *
 * @example
 * ```typescript
 * const sizeManager = new TerminalSizeManager();
 *
 * // Get current size
 * const size = sizeManager.getSize();
 * console.log(`Terminal: ${size.columns}x${size.rows}`);
 *
 * // Listen for resize events
 * sizeManager.on('resize', (newSize, oldSize) => {
 *   console.log(`Resized from ${oldSize.columns}x${oldSize.rows} to ${newSize.columns}x${newSize.rows}`);
 * });
 * ```
 */
export class TerminalSizeManager extends EventEmitter {
	/** Cached terminal size */
	private currentSize: TerminalSize;

	/** Previous terminal size (for comparison) */
	private previousSize: TerminalSize;

	/** Whether resize events are enabled */
	private emitEvents: boolean;

	/** Bound resize handler */
	private resizeHandler: () => void;

	/** Whether the manager is active */
	private active = false;

	/**
	 * Creates a new TerminalSizeManager instance
	 *
	 * @param {TerminalSizeOptions} options - Configuration options
	 */
	constructor(options: TerminalSizeOptions = {}) {
		super();

		const defaultSize = { ...DEFAULT_SIZE, ...options.defaultSize };
		this.currentSize = { ...defaultSize };
		this.previousSize = { ...defaultSize };
		this.emitEvents = options.emitEvents ?? true;

		// Query actual size immediately
		this.currentSize = this.querySize();
		this.previousSize = { ...this.currentSize };

		// Setup resize handler
		this.resizeHandler = (): void => {
			this.handleResize();
		};

		// Setup callback if provided
		if (options.onResize) {
			this.on('resize', options.onResize);
		}

		// Start listening for resize events
		this.start();
	}

	/**
	 * Start listening for resize events
	 */
	start(): void {
		if (this.active) {
			return;
		}

		process.on('SIGWINCH', this.resizeHandler);
		this.active = true;
		this.emit('start');
	}

	/**
	 * Stop listening for resize events
	 */
	stop(): void {
		if (!this.active) {
			return;
		}

		process.removeListener('SIGWINCH', this.resizeHandler);
		this.active = false;
		this.emit('stop');
	}

	/**
	 * Get the current terminal size
	 *
	 * @returns {TerminalSize} Current terminal dimensions
	 */
	getSize(): TerminalSize {
		// Refresh size if stdout is a TTY
		if (process.stdout.isTTY) {
			this.currentSize = {
				columns: process.stdout.columns ?? this.currentSize.columns,
				rows: process.stdout.rows ?? this.currentSize.rows,
			};
		}

		return { ...this.currentSize };
	}

	/**
	 * Get the previous terminal size (before last resize)
	 *
	 * @returns {TerminalSize} Previous terminal dimensions
	 */
	getPreviousSize(): TerminalSize {
		return { ...this.previousSize };
	}

	/**
	 * Force a size refresh and emit resize event if changed
	 *
	 * @returns {TerminalSize} Updated terminal size
	 */
	refresh(): TerminalSize {
		const newSize = this.querySize();

		if (this.hasSizeChanged(newSize)) {
			this.previousSize = { ...this.currentSize };
			this.currentSize = newSize;

			if (this.emitEvents) {
				this.emit('resize', this.currentSize, this.previousSize);
			}
		}

		return { ...this.currentSize };
	}

	/**
	 * Check if the terminal size has changed
	 *
	 * @param {TerminalSize} newSize - New size to compare
	 * @returns {boolean} True if size has changed
	 */
	private hasSizeChanged(newSize: TerminalSize): boolean {
		return (
			newSize.columns !== this.currentSize.columns ||
			newSize.rows !== this.currentSize.rows ||
			newSize.width !== this.currentSize.width ||
			newSize.height !== this.currentSize.height
		);
	}

	/**
	 * Handle SIGWINCH signal (terminal resize)
	 */
	private handleResize(): void {
		this.refresh();
	}

	/**
	 * Query the current terminal size
	 *
	 * Tries multiple methods in order of preference:
	 * 1. process.stdout (if TTY)
	 * 2. ioctl system call (if available)
	 * 3. tput command
	 * 4. stty command
	 * 5. Default fallback
	 *
	 * @returns {TerminalSize} Current terminal dimensions
	 */
	private querySize(): TerminalSize {
		// Method 1: Use process.stdout if it's a TTY
		if (process.stdout.isTTY) {
			const columns = process.stdout.columns;
			const rows = process.stdout.rows;

			if (columns && rows && columns > 0 && rows > 0) {
				return {
					columns,
					rows,
				};
			}
		}

		// Method 2: Try to use ioctl via child process
		try {
			const size = this.querySizeWithIoctl();
			if (size) {
				return size;
			}
		} catch {
			// Continue to next method
		}

		// Method 3: Try tput command
		try {
			const columns = parseInt(execSync('tput cols', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim(), 10);
			const rows = parseInt(execSync('tput lines', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim(), 10);

			if (columns > 0 && rows > 0) {
				return { columns, rows };
			}
		} catch {
			// Continue to next method
		}

		// Method 4: Try stty command
		try {
			const output = execSync('stty size', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
			const [rows, columns] = output.split(' ').map(Number);

			if (columns > 0 && rows > 0) {
				return { columns, rows };
			}
		} catch {
			// Continue to fallback
		}

		// Fallback to default
		return { ...DEFAULT_SIZE };
	}

	/**
	 * Try to query size using ioctl (via a Node.js addon or native module)
	 *
	 * This is a placeholder for platforms where ioctl is available.
	 * In practice, we rely on process.stdout for most cases.
	 *
	 * @returns {TerminalSize | null} Terminal size or null if unavailable
	 */
	private querySizeWithIoctl(): TerminalSize | null {
		// On most modern Node.js versions, process.stdout provides this info
		// Additional ioctl implementation would require native bindings
		return null;
	}

	/**
	 * Check if terminal size is available
	 *
	 * @returns {boolean} True if size can be determined
	 */
	isAvailable(): boolean {
		return process.stdout.isTTY === true;
	}

	/**
	 * Destroy the manager and cleanup
	 */
	destroy(): void {
		this.stop();
		this.removeAllListeners();
	}
}

/**
 * Singleton instance for global use
 */
let globalSizeManager: TerminalSizeManager | null = null;

/**
 * Get the global terminal size manager instance
 *
 * @returns {TerminalSizeManager} Global size manager instance
 */
export function getGlobalSizeManager(): TerminalSizeManager {
	if (!globalSizeManager) {
		globalSizeManager = new TerminalSizeManager();
	}

	return globalSizeManager;
}

/**
 * Get the current terminal size
 *
 * This is a convenience function that uses the global size manager.
 *
 * @returns {TerminalSize} Current terminal dimensions
 *
 * @example
 * ```typescript
 * const size = getTerminalSize();
 * console.log(`Terminal: ${size.columns}x${size.rows}`);
 * ```
 */
export function getTerminalSize(): TerminalSize {
	return getGlobalSizeManager().getSize();
}

/**
 * Watch for terminal resize events
 *
 * @param {(size: TerminalSize, oldSize: TerminalSize) => void} callback - Callback function
 * @returns {() => void} Function to stop watching
 *
 * @example
 * ```typescript
 * const unwatch = watchTerminalSize((newSize, oldSize) => {
 *   console.log(`Resized: ${oldSize.columns}x${oldSize.rows} -> ${newSize.columns}x${newSize.rows}`);
 * });
 *
 * // Later, stop watching
 * unwatch();
 * ```
 */
export function watchTerminalSize(
	callback: (size: TerminalSize, oldSize: TerminalSize) => void,
): () => void {
	const manager = getGlobalSizeManager();
	manager.on('resize', callback);

	return () => {
		manager.off('resize', callback);
	};
}

/**
 * Check if terminal supports querying size
 *
 * @returns {boolean} True if terminal size is available
 */
export function isTerminalSizeAvailable(): boolean {
	return process.stdout.isTTY === true;
}
