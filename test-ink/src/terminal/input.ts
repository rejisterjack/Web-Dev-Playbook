/**
 * Terminal Input Stream Module
 *
 * This module provides a wrapper around process.stdin for reading input in raw mode,
 * parsing escape sequences (cursor keys, function keys, mouse events), and emitting events.
 *
 * @module terminal/input
 */

import { EventEmitter } from 'events';
import type { Readable } from 'stream';
import type { ReadStream } from 'tty';

/**
 * Input stream options
 */
export interface TerminalInputOptions {
	/** Input stream to read from (default: process.stdin) */
	stream?: Readable;

	/** Enable raw mode on the stream (default: true) */
	rawMode?: boolean;

	/** Encoding for input data (default: 'utf8') */
	encoding?: BufferEncoding;

	/** Whether to resume the stream on start (default: true) */
	autoResume?: boolean;
}

/**
 * Key event interface
 */
export interface KeyEvent {
	/** The character sequence */
	sequence: string;

	/** The key name (e.g., 'up', 'down', 'return', 'escape') */
	name?: string;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Meta/Alt was held */
	meta: boolean;

	/** Whether Shift was held */
	shift: boolean;

	/** The character code */
	code?: number;
}

/**
 * Mouse event interface
 */
export interface MouseEvent {
	/** Event type */
	type: 'mousedown' | 'mouseup' | 'mousemove' | 'wheel';

	/** Button number (0 = left, 1 = middle, 2 = right, 3 = release) */
	button: number;

	/** X coordinate (1-indexed) */
	x: number;

	/** Y coordinate (1-indexed) */
	y: number;

	/** Whether Ctrl was held */
	ctrl: boolean;

	/** Whether Meta/Alt was held */
	meta: boolean;

	/** Whether Shift was held */
	shift: boolean;

	/** Raw sequence */
	sequence: string;
}

/**
 * Focus event interface
 */
export interface FocusEvent {
	/** Whether terminal has focus */
	focused: boolean;
}

/**
 * Key mapping for escape sequences
 */
const KEY_MAPPINGS: Record<string, Partial<KeyEvent>> = {
	// Cursor keys
	'\u001B[A': { name: 'up' },
	'\u001B[B': { name: 'down' },
	'\u001B[C': { name: 'right' },
	'\u001B[D': { name: 'left' },
	'\u001B[H': { name: 'home' },
	'\u001B[F': { name: 'end' },

	// Application cursor keys
	'\u001BOA': { name: 'up' },
	'\u001BOB': { name: 'down' },
	'\u001BOC': { name: 'right' },
	'\u001BOD': { name: 'left' },
	'\u001BOH': { name: 'home' },
	'\u001BOF': { name: 'end' },

	// Function keys
	'\u001BOP': { name: 'f1' },
	'\u001BOQ': { name: 'f2' },
	'\u001BOR': { name: 'f3' },
	'\u001BOS': { name: 'f4' },
	'\u001B[15~': { name: 'f5' },
	'\u001B[17~': { name: 'f6' },
	'\u001B[18~': { name: 'f7' },
	'\u001B[19~': { name: 'f8' },
	'\u001B[20~': { name: 'f9' },
	'\u001B[21~': { name: 'f10' },
	'\u001B[23~': { name: 'f11' },
	'\u001B[24~': { name: 'f12' },

	// Extended function keys
	'\u001B[1;2P': { name: 'f1', shift: true },
	'\u001B[1;2Q': { name: 'f2', shift: true },
	'\u001B[1;2R': { name: 'f3', shift: true },
	'\u001B[1;2S': { name: 'f4', shift: true },
	'\u001B[15;2~': { name: 'f5', shift: true },

	// Special keys
	'\u001B[3~': { name: 'delete' },
	'\u001B[2~': { name: 'insert' },
	'\u001B[5~': { name: 'pageup' },
	'\u001B[6~': { name: 'pagedown' },
	'\u001B[1~': { name: 'home' },
	'\u001B[4~': { name: 'end' },

	// Shift + cursor keys
	'\u001B[1;2A': { name: 'up', shift: true },
	'\u001B[1;2B': { name: 'down', shift: true },
	'\u001B[1;2C': { name: 'right', shift: true },
	'\u001B[1;2D': { name: 'left', shift: true },

	// Ctrl + cursor keys
	'\u001B[1;5A': { name: 'up', ctrl: true },
	'\u001B[1;5B': { name: 'down', ctrl: true },
	'\u001B[1;5C': { name: 'right', ctrl: true },
	'\u001B[1;5D': { name: 'left', ctrl: true },

	// Alt + cursor keys
	'\u001B\u001B[A': { name: 'up', meta: true },
	'\u001B\u001B[B': { name: 'down', meta: true },
	'\u001B\u001B[C': { name: 'right', meta: true },
	'\u001B\u001B[D': { name: 'left', meta: true },
};

/**
 * Control character names
 */
const CTRL_CHARS: Record<number, string> = {
	0x00: 'null',
	0x01: 'a',
	0x02: 'b',
	0x03: 'c',
	0x04: 'd',
	0x05: 'e',
	0x06: 'f',
	0x07: 'g',
	0x08: 'h',
	0x09: 'tab',
	0x0a: 'j',
	0x0b: 'k',
	0x0c: 'l',
	0x0d: 'return',
	0x0e: 'n',
	0x0f: 'o',
	0x10: 'p',
	0x11: 'q',
	0x12: 'r',
	0x13: 's',
	0x14: 't',
	0x15: 'u',
	0x16: 'v',
	0x17: 'w',
	0x18: 'x',
	0x19: 'y',
	0x1a: 'z',
	0x1b: 'escape',
	0x1c: 'backslash',
	0x1d: 'rightbracket',
	0x1e: 'caret',
	0x1f: 'underscore',
	0x20: 'space',
	0x7f: 'backspace',
};

/**
 * Terminal input stream that handles raw input and parses escape sequences.
 *
 * @example
 * ```typescript
 * const input = new TerminalInput();
 *
 * // Listen for key events
 * input.on('key', (key: KeyEvent) => {
 *   console.log('Key pressed:', key.name, key.sequence);
 * });
 *
 * // Listen for mouse events
 * input.on('mouse', (mouse: MouseEvent) => {
 *   console.log('Mouse:', mouse.type, mouse.x, mouse.y);
 * });
 *
 * // Start listening
 * input.start();
 * ```
 */
export class TerminalInput extends EventEmitter {
	/** Input stream */
	private stream: Readable | ReadStream;

	/** Current options */
	private options: Required<Omit<TerminalInputOptions, 'stream'>>;

	/** Whether the input is active */
	private active = false;

	/** Buffer for incomplete escape sequences */
	private escapeBuffer = '';

	/** Timeout for escape sequence completion */
	private escapeTimeout: NodeJS.Timeout | null = null;

	/**
	 * Creates a new TerminalInput instance
	 *
	 * @param {TerminalInputOptions} options - Configuration options
	 */
	constructor(options: TerminalInputOptions = {}) {
		super();
		this.stream = options.stream ?? process.stdin;
		this.options = {
			rawMode: options.rawMode ?? true,
			encoding: options.encoding ?? 'utf8',
			autoResume: options.autoResume ?? true,
		};

		// Set encoding
		this.stream.setEncoding(this.options.encoding);

		// Setup error handling
		this.stream.on('error', (error: Error) => {
			this.emit('error', error);
		});

		this.stream.on('end', () => {
			this.emit('end');
		});
	}

	/**
	 * Start listening for input
	 */
	start(): void {
		if (this.active) {
			return;
		}

		// Enable raw mode if requested and available
		if (this.options.rawMode && 'isTTY' in this.stream && this.stream.isTTY) {
			(this.stream as NodeJS.ReadStream).setRawMode(true);
		}

		// Resume stream if requested
		if (this.options.autoResume) {
			this.stream.resume();
		}

		// Setup data handler
		this.stream.on('data', this.handleData.bind(this));

		this.active = true;
		this.emit('start');
	}

	/**
	 * Stop listening for input
	 */
	stop(): void {
		if (!this.active) {
			return;
		}

		// Disable raw mode if it was enabled
		if (this.options.rawMode && 'isTTY' in this.stream && this.stream.isTTY) {
			try {
				(this.stream as NodeJS.ReadStream).setRawMode(false);
			} catch {
				// Ignore errors
			}
		}

		// Remove data handler
		this.stream.off('data', this.handleData.bind(this));

		// Clear any pending escape timeout
		if (this.escapeTimeout) {
			clearTimeout(this.escapeTimeout);
			this.escapeTimeout = null;
		}

		this.active = false;
		this.emit('stop');
	}

	/**
	 * Check if input is active
	 *
	 * @returns {boolean} True if input is active
	 */
	isActive(): boolean {
		return this.active;
	}

	/**
	 * Handle incoming data
	 */
	private handleData(data: string): void {
		// Add to escape buffer
		this.escapeBuffer += data;

		// Clear any existing timeout
		if (this.escapeTimeout) {
			clearTimeout(this.escapeTimeout);
			this.escapeTimeout = null;
		}

		// Process the buffer
		this.processBuffer();
	}

	/**
	 * Process the escape buffer
	 */
	private processBuffer(): void {
		while (this.escapeBuffer.length > 0) {
			// Check for complete escape sequences first
			const result = this.parseSequence();

			if (result) {
				const { event, consumed } = result;
				this.escapeBuffer = this.escapeBuffer.slice(consumed);

				if (event) {
					this.emit(event.type, event.data);
				}
			} else if (this.escapeBuffer.length > 0) {
				// Incomplete sequence - set timeout to process as plain text
				if (!this.escapeTimeout && this.escapeBuffer.startsWith('\u001B')) {
					this.escapeTimeout = setTimeout(() => {
						this.escapeTimeout = null;
						// Process remaining buffer as plain text
						this.processPlainText();
					}, 50);
					return;
				}

				// Process as plain text
				this.processPlainText();
			}
		}
	}

	/**
	 * Process plain text characters
	 */
	private processPlainText(): void {
		// Find the first escape character
		const escapeIndex = this.escapeBuffer.indexOf('\u001B');

		if (escapeIndex === -1) {
			// No escape sequences - process all as plain text
			for (const char of this.escapeBuffer) {
				this.emitKey(char, char);
			}

			this.escapeBuffer = '';
		} else if (escapeIndex > 0) {
			// Process text before escape sequence
			const text = this.escapeBuffer.slice(0, escapeIndex);

			for (const char of text) {
				this.emitKey(char, char);
			}

			this.escapeBuffer = this.escapeBuffer.slice(escapeIndex);
		}
	}

	/**
	 * Parse an escape sequence from the buffer
	 */
	private parseSequence(): { event: { type: string; data: KeyEvent | MouseEvent | FocusEvent } | null; consumed: number } | null {
		const buf = this.escapeBuffer;

		if (buf.length === 0) {
			return null;
		}

		// Check for escape sequences
		if (buf[0] === '\u001B') {
			// Check for known key mappings
			for (const [sequence, keyInfo] of Object.entries(KEY_MAPPINGS)) {
				if (buf.startsWith(sequence)) {
					const keyEvent: KeyEvent = {
						sequence,
						name: keyInfo.name,
						ctrl: keyInfo.ctrl ?? false,
						meta: keyInfo.meta ?? false,
						shift: keyInfo.shift ?? false,
					};

					return {
						event: { type: 'key', data: keyEvent },
						consumed: sequence.length,
					};
				}
			}

		// Check for mouse events (SGR format: ESC[<button;x;yM or ESC[<button;x;ym)
		const sgrMouseRegex = new RegExp('^\\u001B\\[<(\\d+);(\\d+);(\\d+)([Mm])');
		const sgrMouseMatch = buf.match(sgrMouseRegex);
			if (sgrMouseMatch) {
				const buttonCode = Number.parseInt(sgrMouseMatch[1], 10);
				const x = Number.parseInt(sgrMouseMatch[2], 10);
				const y = Number.parseInt(sgrMouseMatch[3], 10);
				const isRelease = sgrMouseMatch[4] === 'm';

				const mouseEvent = this.parseSGRMouse(buttonCode, x, y, isRelease);
				return {
					event: { type: 'mouse', data: mouseEvent },
					consumed: sgrMouseMatch[0].length,
				};
			}

			// Check for focus events (ESC[I = focus in, ESC[O = focus out)
			if (buf.startsWith('\u001B[I')) {
				return {
					event: { type: 'focus', data: { focused: true } },
					consumed: 3,
				};
			}

			if (buf.startsWith('\u001B[O')) {
				return {
					event: { type: 'focus', data: { focused: false } },
					consumed: 3,
				};
			}

			// Check for bracketed paste
			if (buf.startsWith('\u001B[200~')) {
				const endIndex = buf.indexOf('\u001B[201~');
				if (endIndex !== -1) {
					const pasteData = buf.slice(9, endIndex);
					// Emit paste event directly since it has different data type
					this.emit('paste', pasteData);
					return {
						event: null,
						consumed: endIndex + 9,
					};
				}
			}

			// Incomplete escape sequence
			return null;
		}

		// Single character
		return null;
	}

	/**
	 * Parse SGR mouse event
	 */
	private parseSGRMouse(buttonCode: number, x: number, y: number, isRelease: boolean): MouseEvent {
		// Decode button code
		const button = buttonCode & 3;
		const shift = (buttonCode & 4) !== 0;
		const meta = (buttonCode & 8) !== 0;
		const ctrl = (buttonCode & 16) !== 0;

		// Determine event type
		let type: MouseEvent['type'] = 'mousedown';

		if (isRelease) {
			type = 'mouseup';
		} else if (button === 3) {
			type = 'mousemove';
		}

		// Handle wheel events (buttons 64 and 65)
		if (buttonCode >= 64 && buttonCode <= 65) {
			type = 'wheel';
		}

		return {
			type,
			button,
			x,
			y,
			ctrl,
			meta,
			shift,
			sequence: `\u001B[<${buttonCode};${x};${y}${isRelease ? 'm' : 'M'}`,
		};
	}

	/**
	 * Emit a key event
	 */
	private emitKey(sequence: string, char: string): void {
		const code = char.charCodeAt(0);

		// Check for control characters
		let name = CTRL_CHARS[code];
		let ctrl = false;
		let meta = false;

		if (name && code < 32 && code !== 9 && code !== 13 && code !== 27) {
			ctrl = true;
		}

		// Handle escape as meta prefix for single characters
		if (sequence.length === 2 && sequence[0] === '\u001B') {
			meta = true;
			name = sequence[1];
		}

		const keyEvent: KeyEvent = {
			sequence,
			name,
			ctrl,
			meta,
			shift: false,
			code,
		};

		this.emit('key', keyEvent);
	}

	/**
	 * Pause the input stream
	 */
	pause(): void {
		this.stream.pause();
		this.emit('pause');
	}

	/**
	 * Resume the input stream
	 */
	resume(): void {
		this.stream.resume();
		this.emit('resume');
	}

	/**
	 * Get the underlying stream
	 *
	 * @returns {Readable} The input stream
	 */
	getStream(): Readable {
		return this.stream;
	}

	/**
	 * Destroy the input stream and cleanup
	 */
	destroy(): void {
		this.stop();
		this.removeAllListeners();

		if (!this.stream.destroyed) {
			this.stream.destroy();
		}
	}
}

/**
 * Create a new TerminalInput instance
 *
 * @param {TerminalInputOptions} options - Configuration options
 * @returns {TerminalInput} New TerminalInput instance
 *
 * @example
 * ```typescript
 * const input = createTerminalInput({ rawMode: true });
 * input.on('key', (key) => console.log(key.name));
 * input.start();
 * ```
 */
export function createTerminalInput(options?: TerminalInputOptions): TerminalInput {
	return new TerminalInput(options);
}

/**
 * Global terminal input instance
 */
let globalInput: TerminalInput | null = null;

/**
 * Get the global terminal input instance
 *
 * @returns {TerminalInput} Global input instance
 */
export function getGlobalInput(): TerminalInput {
	if (!globalInput) {
		globalInput = new TerminalInput();
	}

	return globalInput;
}

/**
 * Check if stdin is a TTY
 *
 * @returns {boolean} True if stdin is a TTY
 */
export function isStdinTTY(): boolean {
	return process.stdin.isTTY === true;
}
