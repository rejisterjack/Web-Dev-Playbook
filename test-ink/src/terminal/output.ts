/**
 * Terminal Output Stream Module
 *
 * This module provides a wrapper around process.stdout for writing ANSI sequences
 * with batching for performance, handling partial writes, and retry logic.
 *
 * @module terminal/output
 */

import { EventEmitter } from 'events';
import type { Writable } from 'stream';

/**
 * Output stream options
 */
export interface TerminalOutputOptions {
	/** Output stream to write to (default: process.stdout) */
	stream?: Writable;

	/** Buffer size for batching (default: 4096) */
	bufferSize?: number;

	/** Whether to auto-flush on newline (default: false) */
	autoFlush?: boolean;

	/** Flush interval in milliseconds (default: 0 = no interval) */
	flushInterval?: number;

	/** Maximum number of retry attempts for partial writes (default: 3) */
	maxRetries?: number;

	/** Delay between retries in milliseconds (default: 10) */
	retryDelay?: number;
}

/**
 * Write result interface
 */
export interface WriteResult {
	/** Whether the write was successful */
	success: boolean;

	/** Number of bytes written */
	bytesWritten: number;

	/** Error if write failed */
	error?: Error;
}

/**
 * Default output options
 */
const DEFAULT_OPTIONS: Required<Omit<TerminalOutputOptions, 'stream'>> = {
	bufferSize: 4096,
	autoFlush: false,
	flushInterval: 0,
	maxRetries: 3,
	retryDelay: 10,
};

/**
 * Terminal output stream that provides buffered writing with retry logic.
 *
 * @example
 * ```typescript
 * const output = new TerminalOutput();
 *
 * // Write individual sequences
 * output.write(ANSI.clearScreen());
 * output.write(ANSI.moveCursor(1, 1));
 *
 * // Batch multiple writes
 * output.batch([
 *   ANSI.clearScreen(),
 *   ANSI.moveCursor(1, 1),
 *   ANSI.setColor(31),
 *   'Hello, World!',
 * ]);
 *
 * // Flush to output
 * await output.flush();
 * ```
 */
export class TerminalOutput extends EventEmitter {
	/** Output stream */
	private stream: Writable;

	/** Write buffer */
	private buffer: string;

	/** Current options */
	private options: Required<Omit<TerminalOutputOptions, 'stream'>>;

	/** Flush timer */
	private flushTimer: NodeJS.Timeout | null = null;

	/** Whether the stream is writable */
	private writable = true;

	/** Pending write promise */
	private pendingFlush: Promise<void> | null = null;

	/** Total bytes written */
	private totalBytesWritten = 0;

	/**
	 * Creates a new TerminalOutput instance
	 *
	 * @param {TerminalOutputOptions} options - Configuration options
	 */
	constructor(options: TerminalOutputOptions = {}) {
		super();
		this.stream = options.stream ?? process.stdout;
		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.buffer = '';

		// Setup flush interval if specified
		if (this.options.flushInterval > 0) {
			this.startFlushInterval();
		}

		// Setup error handling
		this.stream.on('error', (error: Error) => {
			this.emit('error', error);
		});

		this.stream.on('close', () => {
			this.writable = false;
			this.emit('close');
		});
	}

	/**
	 * Write data to the buffer
	 *
	 * @param {string} data - Data to write
	 * @returns {this} For chaining
	 *
	 * @example
	 * ```typescript
	 * output.write(ANSI.clearScreen()).write(ANSI.moveCursor(1, 1));
	 * ```
	 */
	write(data: string): this {
		if (!this.writable) {
			this.emit('error', new Error('Cannot write to closed stream'));
			return this;
		}

		this.buffer += data;

		// Auto-flush if buffer is full
		if (this.buffer.length >= this.options.bufferSize) {
			void this.flush();
		}

		// Auto-flush on newline if enabled
		if (this.options.autoFlush && data.includes('\n')) {
			void this.flush();
		}

		this.emit('write', data);
		return this;
	}

	/**
	 * Write multiple items to the buffer
	 *
	 * @param {string[]} items - Array of strings to write
	 * @returns {this} For chaining
	 *
	 * @example
	 * ```typescript
	 * output.batch([
	 *   ANSI.clearScreen(),
	 *   ANSI.moveCursor(1, 1),
	 *   'Hello',
	 *   ANSI.moveCursor(1, 2),
	 *   'World',
	 * ]);
	 * ```
	 */
	batch(items: string[]): this {
		for (const item of items) {
			this.write(item);
		}

		return this;
	}

	/**
	 * Write a line to the buffer (with newline)
	 *
	 * @param {string} data - Data to write
	 * @returns {this} For chaining
	 */
	writeLine(data = ''): this {
		return this.write(data + '\n');
	}

	/**
	 * Flush the buffer to the output stream
	 *
	 * @returns {Promise<void>} Resolves when flush is complete
	 */
	async flush(): Promise<void> {
		if (this.pendingFlush) {
			return this.pendingFlush;
		}

		if (this.buffer.length === 0) {
			return;
		}

		if (!this.writable) {
			throw new Error('Cannot flush to closed stream');
		}

		this.pendingFlush = this.performFlush();

		try {
			await this.pendingFlush;
		} finally {
			this.pendingFlush = null;
		}
	}

	/**
	 * Perform the actual flush operation with retry logic
	 */
	private async performFlush(): Promise<void> {
		const data = this.buffer;
		this.buffer = '';

		let attempts = 0;
		let offset = 0;

		while (offset < data.length && attempts < this.options.maxRetries) {
			try {
				const chunk = data.slice(offset);
				const written = this.stream.write(chunk);

				if (written) {
					// Write was accepted
					offset += Buffer.byteLength(chunk, 'utf8');
					this.totalBytesWritten += Buffer.byteLength(chunk, 'utf8');
				} else {
					// Write was buffered, wait for drain
					await this.waitForDrain();
					offset += Buffer.byteLength(chunk, 'utf8');
					this.totalBytesWritten += Buffer.byteLength(chunk, 'utf8');
				}
			} catch (error) {
				attempts++;

				if (attempts >= this.options.maxRetries) {
					// Put remaining data back in buffer
					this.buffer = data.slice(offset) + this.buffer;
					throw new Error(
						`Failed to write after ${this.options.maxRetries} attempts: ${(error as Error).message}`,
					);
				}

				// Wait before retry
				await this.delay(this.options.retryDelay);
			}
		}

		this.emit('flush', data.length);
	}

	/**
	 * Wait for the stream to drain
	 */
	private waitForDrain(): Promise<void> {
		return new Promise((resolve, reject) => {
			const onDrain = (): void => {
				cleanup();
				resolve();
			};

			const onError = (error: Error): void => {
				cleanup();
				reject(error);
			};

			const onClose = (): void => {
				cleanup();
				reject(new Error('Stream closed while waiting for drain'));
			};

			const cleanup = (): void => {
				this.stream.off('drain', onDrain);
				this.stream.off('error', onError);
				this.stream.off('close', onClose);
			};

			this.stream.once('drain', onDrain);
			this.stream.once('error', onError);
			this.stream.once('close', onClose);
		});
	}

	/**
	 * Delay for a specified number of milliseconds
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	}

	/**
	 * Clear the buffer without writing
	 */
	clear(): void {
		const cleared = this.buffer.length;
		this.buffer = '';
		this.emit('clear', cleared);
	}

	/**
	 * Get the current buffer size
	 *
	 * @returns {number} Number of characters in buffer
	 */
	getBufferSize(): number {
		return this.buffer.length;
	}

	/**
	 * Check if the buffer has data waiting to be flushed
	 *
	 * @returns {boolean} True if buffer is not empty
	 */
	hasPendingData(): boolean {
		return this.buffer.length > 0;
	}

	/**
	 * Get total bytes written
	 *
	 * @returns {number} Total bytes written to stream
	 */
	getTotalBytesWritten(): number {
		return this.totalBytesWritten;
	}

	/**
	 * Start automatic flush interval
	 */
	private startFlushInterval(): void {
		if (this.flushTimer) {
			return;
		}

		this.flushTimer = setInterval(() => {
			void this.flush();
		}, this.options.flushInterval);
	}

	/**
	 * Stop automatic flush interval
	 */
	stopFlushInterval(): void {
		if (this.flushTimer) {
			clearInterval(this.flushTimer);
			this.flushTimer = null;
		}
	}

	/**
	 * Check if the stream is writable
	 *
	 * @returns {boolean} True if stream is writable
	 */
	isWritable(): boolean {
		return this.writable && !this.stream.destroyed;
	}

	/**
	 * Get the underlying stream
	 *
	 * @returns {Writable} The output stream
	 */
	getStream(): Writable {
		return this.stream;
	}

	/**
	 * Destroy the output stream and cleanup
	 */
	destroy(): void {
		this.stopFlushInterval();
		this.clear();
		this.removeAllListeners();

		if (!this.stream.destroyed) {
			this.stream.destroy();
		}
	}
}

/**
 * Create a new TerminalOutput instance
 *
 * @param {TerminalOutputOptions} options - Configuration options
 * @returns {TerminalOutput} New TerminalOutput instance
 *
 * @example
 * ```typescript
 * const output = createTerminalOutput({ autoFlush: true });
 * ```
 */
export function createTerminalOutput(options?: TerminalOutputOptions): TerminalOutput {
	return new TerminalOutput(options);
}

/**
 * Global terminal output instance
 */
let globalOutput: TerminalOutput | null = null;

/**
 * Get the global terminal output instance
 *
 * @returns {TerminalOutput} Global output instance
 */
export function getGlobalOutput(): TerminalOutput {
	if (!globalOutput) {
		globalOutput = new TerminalOutput();
	}

	return globalOutput;
}

/**
 * Write to the global terminal output
 *
 * @param {string} data - Data to write
 *
 * @example
 * ```typescript
 * terminalWrite(ANSI.clearScreen());
 * ```
 */
export function terminalWrite(data: string): void {
	getGlobalOutput().write(data);
}

/**
 * Flush the global terminal output
 *
 * @returns {Promise<void>} Resolves when flush is complete
 */
export async function terminalFlush(): Promise<void> {
	await getGlobalOutput().flush();
}
