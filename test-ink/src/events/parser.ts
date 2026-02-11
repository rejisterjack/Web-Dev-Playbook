/**
 * Input Parser Module
 *
 * Parses raw input from stdin, handling ANSI escape sequences for special keys,
 * mouse events, and bracketed paste sequences. Handles partial input and
 * malformed sequences gracefully.
 *
 * @module events/parser
 */

import {
	EventPriority,
	createBaseEvent,
	MouseButton,
	MouseAction,
	FocusType,
	type KeyEvent,
	type MouseEvent,
	type PasteEvent,
	type FocusEvent,
} from './types.js';

/**
 * Parser options
 */
export interface InputParserOptions {
	/** Timeout for incomplete escape sequences in ms */
	escapeTimeout?: number;
	/** Maximum escape sequence length */
	maxEscapeLength?: number;
	/** Enable mouse support */
	mouseSupport?: boolean;
	/** Enable bracketed paste support */
	bracketedPaste?: boolean;
	/** Enable focus event support */
	focusEvents?: boolean;
}

/**
 * Parse result type
 */
export interface ParseResult {
	/** Whether parsing was successful */
	success: boolean;
	/** Parsed events */
	events: Array<KeyEvent | MouseEvent | PasteEvent | FocusEvent>;
	/** Remaining unprocessed data */
	remainder: string;
	/** Whether more data is expected */
	incomplete: boolean;
}

/**
 * Key mapping for escape sequences
 */
const KEY_MAPPINGS: Record<string, Partial<Omit<KeyEvent, 'type' | 'timestamp'>>> = {
	// Cursor keys
	'\u001B[A': { key: 'up', sequence: '\u001B[A' },
	'\u001B[B': { key: 'down', sequence: '\u001B[B' },
	'\u001B[C': { key: 'right', sequence: '\u001B[C' },
	'\u001B[D': { key: 'left', sequence: '\u001B[D' },
	'\u001B[H': { key: 'home', sequence: '\u001B[H' },
	'\u001B[F': { key: 'end', sequence: '\u001B[F' },

	// Application cursor keys
	'\u001BOA': { key: 'up', sequence: '\u001BOA' },
	'\u001BOB': { key: 'down', sequence: '\u001BOB' },
	'\u001BOC': { key: 'right', sequence: '\u001BOC' },
	'\u001BOD': { key: 'left', sequence: '\u001BOD' },
	'\u001BOH': { key: 'home', sequence: '\u001BOH' },
	'\u001BOF': { key: 'end', sequence: '\u001BOF' },

	// Function keys
	'\u001BOP': { key: 'f1', sequence: '\u001BOP' },
	'\u001BOQ': { key: 'f2', sequence: '\u001BOQ' },
	'\u001BOR': { key: 'f3', sequence: '\u001BOR' },
	'\u001BOS': { key: 'f4', sequence: '\u001BOS' },
	'\u001B[15~': { key: 'f5', sequence: '\u001B[15~' },
	'\u001B[17~': { key: 'f6', sequence: '\u001B[17~' },
	'\u001B[18~': { key: 'f7', sequence: '\u001B[18~' },
	'\u001B[19~': { key: 'f8', sequence: '\u001B[19~' },
	'\u001B[20~': { key: 'f9', sequence: '\u001B[20~' },
	'\u001B[21~': { key: 'f10', sequence: '\u001B[21~' },
	'\u001B[23~': { key: 'f11', sequence: '\u001B[23~' },
	'\u001B[24~': { key: 'f12', sequence: '\u001B[24~' },

	// Extended function keys with modifiers
	'\u001B[1;2P': { key: 'f1', shift: true, sequence: '\u001B[1;2P' },
	'\u001B[1;2Q': { key: 'f2', shift: true, sequence: '\u001B[1;2Q' },
	'\u001B[1;2R': { key: 'f3', shift: true, sequence: '\u001B[1;2R' },
	'\u001B[1;2S': { key: 'f4', shift: true, sequence: '\u001B[1;2S' },
	'\u001B[15;2~': { key: 'f5', shift: true, sequence: '\u001B[15;2~' },
	'\u001B[17;2~': { key: 'f6', shift: true, sequence: '\u001B[17;2~' },
	'\u001B[18;2~': { key: 'f7', shift: true, sequence: '\u001B[18;2~' },
	'\u001B[19;2~': { key: 'f8', shift: true, sequence: '\u001B[19;2~' },

	// Special keys
	'\u001B[3~': { key: 'delete', sequence: '\u001B[3~' },
	'\u001B[2~': { key: 'insert', sequence: '\u001B[2~' },
	'\u001B[5~': { key: 'pageup', sequence: '\u001B[5~' },
	'\u001B[6~': { key: 'pagedown', sequence: '\u001B[6~' },
	'\u001B[1~': { key: 'home', sequence: '\u001B[1~' },
	'\u001B[4~': { key: 'end', sequence: '\u001B[4~' },

	// Shift + cursor keys
	'\u001B[1;2A': { key: 'up', shift: true, sequence: '\u001B[1;2A' },
	'\u001B[1;2B': { key: 'down', shift: true, sequence: '\u001B[1;2B' },
	'\u001B[1;2C': { key: 'right', shift: true, sequence: '\u001B[1;2C' },
	'\u001B[1;2D': { key: 'left', shift: true, sequence: '\u001B[1;2D' },

	// Ctrl + cursor keys
	'\u001B[1;5A': { key: 'up', ctrl: true, sequence: '\u001B[1;5A' },
	'\u001B[1;5B': { key: 'down', ctrl: true, sequence: '\u001B[1;5B' },
	'\u001B[1;5C': { key: 'right', ctrl: true, sequence: '\u001B[1;5C' },
	'\u001B[1;5D': { key: 'left', ctrl: true, sequence: '\u001B[1;5D' },

	// Alt + cursor keys
	'\u001B\u001B[A': { key: 'up', alt: true, sequence: '\u001B\u001B[A' },
	'\u001B\u001B[B': { key: 'down', alt: true, sequence: '\u001B\u001B[B' },
	'\u001B\u001B[C': { key: 'right', alt: true, sequence: '\u001B\u001B[C' },
	'\u001B\u001B[D': { key: 'left', alt: true, sequence: '\u001B\u001B[D' },

	// Ctrl + function keys
	'\u001B[1;5P': { key: 'f1', ctrl: true, sequence: '\u001B[1;5P' },
	'\u001B[1;5Q': { key: 'f2', ctrl: true, sequence: '\u001B[1;5Q' },
	'\u001B[1;5R': { key: 'f3', ctrl: true, sequence: '\u001B[1;5R' },
	'\u001B[1;5S': { key: 'f4', ctrl: true, sequence: '\u001B[1;5S' },

	// Alt combinations
	'\u001B\u001B': { key: 'escape', alt: true, sequence: '\u001B\u001B' },
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
 * InputParser class for parsing raw terminal input
 *
 * @example
 * ```typescript
 * const parser = new InputParser({ mouseSupport: true });
 *
 * // Parse input data
 * const result = parser.parse('\u001B[M !!'); // Mouse click
 * if (result.success) {
 *   for (const event of result.events) {
 *     console.log('Event:', event.type);
 *   }
 * }
 * ```
 */
export class InputParser {
	/** Parser options */
	private options: Required<InputParserOptions>;

	/** Buffer for incomplete sequences */
	private buffer = '';

	/** Timeout for incomplete sequences */
	private timeout: NodeJS.Timeout | null = null;

	/** Whether currently in bracketed paste mode */
	private inPasteMode = false;

	/** Paste buffer */
	private pasteBuffer = '';

	/**
	 * Creates a new InputParser instance
	 *
	 * @param options - Parser configuration
	 */
	constructor(options: InputParserOptions = {}) {
		this.options = {
			escapeTimeout: options.escapeTimeout ?? 50,
			maxEscapeLength: options.maxEscapeLength ?? 100,
			mouseSupport: options.mouseSupport ?? true,
			bracketedPaste: options.bracketedPaste ?? true,
			focusEvents: options.focusEvents ?? true,
		};
	}

	/**
	 * Parses raw input data into events
	 *
	 * @param data - Raw input string
	 * @returns Parse result with events and any remainder
	 */
	parse(data: string): ParseResult {
		const events: Array<KeyEvent | MouseEvent | PasteEvent | FocusEvent> = [];
		let input = this.buffer + data;
		this.buffer = '';

		// Clear any pending timeout
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}

		let i = 0;
		while (i < input.length) {
			// Handle bracketed paste
			if (this.inPasteMode) {
				const pasteEnd = input.indexOf('\u001B[201~', i);
				if (pasteEnd === -1) {
					// Paste not complete, buffer the rest
					this.pasteBuffer += input.slice(i);
					return {
						success: true,
						events,
						remainder: '',
						incomplete: true,
					};
				}

				this.pasteBuffer += input.slice(i, pasteEnd);
				events.push(this.createPasteEvent(this.pasteBuffer));
				this.inPasteMode = false;
				this.pasteBuffer = '';
				i = pasteEnd + 6; // Length of '\u001B[201~'
				continue;
			}

			const char = input[i];

			// Check for escape sequence
			if (char === '\u001B') {
				const result = this.parseEscapeSequence(input, i);

				if (result.event) {
					events.push(result.event);
					i = result.newIndex;
					continue;
				}

				if (result.incomplete) {
					// Incomplete sequence, buffer it
					this.buffer = input.slice(i);
					this.scheduleTimeout();
					return {
						success: true,
						events,
						remainder: this.buffer,
						incomplete: true,
					};
				}

				// Unknown sequence, treat as individual characters
				const keyEvent = this.createKeyEvent(char, char);
				if (keyEvent) {
					events.push(keyEvent);
				}
				i++;
				continue;
			}

			// Regular character
			const keyEvent = this.createKeyEvent(char, char);
			if (keyEvent) {
				events.push(keyEvent);
			}
			i++;
		}

		return {
			success: true,
			events,
			remainder: this.buffer,
			incomplete: this.buffer.length > 0,
		};
	}

	/**
	 * Parses an escape sequence starting at the given index
	 *
	 * @param input - Input string
	 * @param startIndex - Index where escape sequence starts
	 * @returns Parse result
	 */
	private parseEscapeSequence(
		input: string,
		startIndex: number,
	): { event?: KeyEvent | MouseEvent | PasteEvent | FocusEvent; newIndex: number; incomplete: boolean } {
		const sequence = input.slice(startIndex);

		// Check for bracketed paste start
		if (this.options.bracketedPaste && sequence.startsWith('\u001B[200~')) {
			this.inPasteMode = true;
			this.pasteBuffer = '';
			return { newIndex: startIndex + 6, incomplete: false };
		}

		// Check for focus events
		if (this.options.focusEvents) {
			if (sequence === '\u001B[I') {
				return {
					event: this.createFocusEvent(FocusType.GAINED),
					newIndex: startIndex + 3,
					incomplete: false,
				};
			}
			if (sequence === '\u001B[O') {
				return {
					event: this.createFocusEvent(FocusType.LOST),
					newIndex: startIndex + 3,
					incomplete: false,
				};
			}
		}

		// Check for mouse events (SGR format)
		if (this.options.mouseSupport) {
			// SGR format: ESC [ < Cb ; Cx ; Cy (M or m)
			// biome-ignore format: escape sequence regex
			const sgrMatch = sequence.match(/^\u001B\[<([0-9]+);([0-9]+);([0-9]+)([Mm])/);
			if (sgrMatch) {
				const event = this.parseSGRMouseEvent(sgrMatch, sequence.slice(0, sgrMatch[0].length));
				return {
					event,
					newIndex: startIndex + sgrMatch[0].length,
					incomplete: false,
				};
			}

			// Check for X10/UTF-8 mouse format
			if (sequence.length >= 6 && sequence[1] === '[' && sequence[2] === 'M') {
				const event = this.parseX10MouseEvent(sequence.slice(0, 6));
				if (event) {
					return {
						event,
						newIndex: startIndex + 6,
						incomplete: false,
					};
				}
			}
		}

		// Try to match known key sequences
		for (const [seq, mapping] of Object.entries(KEY_MAPPINGS)) {
			if (sequence.startsWith(seq)) {
				const base = createBaseEvent('key', EventPriority.NORMAL);
				const event: KeyEvent = {
					...base,
					type: 'key',
					key: mapping.key ?? '',
					sequence: mapping.sequence ?? seq,
					ctrl: mapping.ctrl ?? false,
					alt: mapping.alt ?? false,
					shift: mapping.shift ?? false,
					code: seq.charCodeAt(seq.length - 1),
					timestamp: Date.now(),
				};
				return { event, newIndex: startIndex + seq.length, incomplete: false };
			}
		}

		// Check for parameterized sequences (CSI)
		if (sequence.startsWith('\u001B[')) {
			// CSI format: ESC [ params finalChar
			// biome-ignore format: escape sequence regex
			const csiMatch = sequence.match(/^\u001B\[([0-9;]*)([A-Za-z])/);
			if (csiMatch) {
				const fullSequence = csiMatch[0];
				const event = this.parseCSIKeyEvent(fullSequence, csiMatch[1], csiMatch[2]);
				if (event) {
					return { event, newIndex: startIndex + fullSequence.length, incomplete: false };
				}
			}

			// Incomplete CSI sequence
			if (sequence.length < this.options.maxEscapeLength && !/[A-Za-z]/.test(sequence)) {
				return { newIndex: startIndex, incomplete: true };
			}
		}

		// Check for SS3 sequences (application keypad)
		if (sequence.startsWith('\u001BO')) {
			if (sequence.length >= 3) {
				const fullSequence = sequence.slice(0, 3);
				const mapping = KEY_MAPPINGS[fullSequence];
				if (mapping) {
					const base = createBaseEvent('key', EventPriority.NORMAL);
					const event: KeyEvent = {
						...base,
						type: 'key',
						key: mapping.key ?? '',
						sequence: mapping.sequence ?? fullSequence,
						ctrl: mapping.ctrl ?? false,
						alt: mapping.alt ?? false,
						shift: mapping.shift ?? false,
						code: fullSequence.charCodeAt(2),
						timestamp: Date.now(),
					};
					return { event, newIndex: startIndex + 3, incomplete: false };
				}
			} else {
				return { newIndex: startIndex, incomplete: true };
			}
		}

		// Unknown or incomplete sequence
		if (sequence.length < this.options.maxEscapeLength) {
			return { newIndex: startIndex, incomplete: true };
		}

		// Too long, treat as unknown
		return { newIndex: startIndex + 1, incomplete: false };
	}

	/**
	 * Parses a CSI (Control Sequence Introducer) key event
	 */
	private parseCSIKeyEvent(
		sequence: string,
		params: string,
		finalChar: string,
	): KeyEvent | undefined {
		// Parse parameters
		const parts = params.split(';').map((p) => parseInt(p, 10) || 0);
		const mainParam = parts[0] ?? 1;
		const modifierParam = parts[1] ?? 1;

		// Determine modifiers
		let ctrl = false;
		let alt = false;
		let shift = false;

		// Modifier encoding: 1=none, 2=shift, 3=alt, 4=shift+alt, 5=ctrl, etc.
		if (modifierParam > 1) {
			const modBits = modifierParam - 1;
			shift = (modBits & 1) !== 0;
			alt = (modBits & 2) !== 0;
			ctrl = (modBits & 4) !== 0;
		}

		// Map final character to key name
		const keyMap: Record<string, string> = {
			A: 'up',
			B: 'down',
			C: 'right',
			D: 'left',
			H: 'home',
			F: 'end',
			P: 'f1',
			Q: 'f2',
			R: 'f3',
			S: 'f4',
		};

		const key = keyMap[finalChar];
		if (!key) {
			return undefined;
		}

		const base = createBaseEvent('key', EventPriority.NORMAL);
		return {
			...base,
			type: 'key',
			key,
			sequence,
			ctrl,
			alt,
			shift,
			code: finalChar.charCodeAt(0),
			timestamp: Date.now(),
		};
	}

	/**
	 * Parses an SGR (Select Graphic Rendition) mouse event
	 */
	private parseSGRMouseEvent(match: RegExpMatchArray, sequence: string): MouseEvent {
		const buttonCode = parseInt(match[1], 10);
		const x = parseInt(match[2], 10);
		const y = parseInt(match[3], 10);
		const released = match[4] === 'm';

		// Decode button code
		const button = buttonCode & 3;
		const shift = (buttonCode & 4) !== 0;
		const alt = (buttonCode & 8) !== 0;
		const ctrl = (buttonCode & 16) !== 0;
		const scroll = (buttonCode & 64) !== 0;

		let action: MouseAction;
		if (scroll) {
			action = MouseAction.SCROLL;
		} else if (released) {
			action = MouseAction.RELEASE;
		} else {
			action = MouseAction.PRESS;
		}

		const base = createBaseEvent('mouse', EventPriority.NORMAL);
		return {
			...base,
			type: 'mouse',
			action,
			button: button as MouseButton,
			x,
			y,
			ctrl,
			alt,
			shift,
			sequence,
			timestamp: Date.now(),
		};
	}

	/**
	 * Parses an X10/UTF-8 mouse event
	 */
	private parseX10MouseEvent(sequence: string): MouseEvent | undefined {
		if (sequence.length < 6) {
			return undefined;
		}

		const buttonCode = sequence.charCodeAt(3) - 32;
		const x = sequence.charCodeAt(4) - 32;
		const y = sequence.charCodeAt(5) - 32;

		if (buttonCode < 0 || x < 0 || y < 0) {
			return undefined;
		}

		const button = buttonCode & 3;
		const shift = (buttonCode & 4) !== 0;
		const alt = (buttonCode & 8) !== 0;
		const ctrl = (buttonCode & 16) !== 0;

		let action: MouseAction;
		if (buttonCode & 64) {
			action = MouseAction.SCROLL;
		} else if (buttonCode & 32) {
			action = MouseAction.MOVE;
		} else {
			action = MouseAction.PRESS;
		}

		const base = createBaseEvent('mouse', EventPriority.NORMAL);
		return {
			...base,
			type: 'mouse',
			action,
			button: button as MouseButton,
			x,
			y,
			ctrl,
			alt,
			shift,
			sequence,
			timestamp: Date.now(),
		};
	}

	/**
	 * Creates a key event from a character
	 */
	private createKeyEvent(char: string, sequence: string): KeyEvent | undefined {
		const code = char.charCodeAt(0);

		// Handle control characters
		if (code < 32 || code === 0x7f) {
			const key = CTRL_CHARS[code] ?? String.fromCharCode(code + 96);
			const base = createBaseEvent('key', EventPriority.NORMAL);
			return {
				...base,
				type: 'key',
				key,
				sequence,
				ctrl: code !== 0x09 && code !== 0x0d && code !== 0x7f, // tab, return, backspace
				alt: false,
				shift: false,
				code,
				timestamp: Date.now(),
			};
		}

		// Regular character
		const base = createBaseEvent('key', EventPriority.NORMAL);
		return {
			...base,
			type: 'key',
			key: char,
			sequence,
			ctrl: false,
			alt: false,
			shift: false,
			code,
			timestamp: Date.now(),
		};
	}

	/**
	 * Creates a paste event
	 */
	private createPasteEvent(text: string): PasteEvent {
		const base = createBaseEvent('paste', EventPriority.NORMAL);
		return {
			...base,
			type: 'paste',
			text,
			length: text.length,
			timestamp: Date.now(),
		};
	}

	/**
	 * Creates a focus event
	 */
	private createFocusEvent(focusType: FocusType): FocusEvent {
		const base = createBaseEvent('focus', EventPriority.NORMAL);
		return {
			...base,
			type: 'focus',
			focusType,
			timestamp: Date.now(),
		};
	}

	/**
	 * Schedules a timeout for incomplete sequences
	 */
	private scheduleTimeout(): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.timeout = setTimeout(() => {
			// Flush buffer as regular characters
			if (this.buffer.length > 0) {
				this.buffer = '';
			}
		}, this.options.escapeTimeout);
	}

	/**
	 * Resets the parser state
	 */
	reset(): void {
		this.buffer = '';
		this.pasteBuffer = '';
		this.inPasteMode = false;

		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}

	/**
	 * Gets the current buffer content
	 *
	 * @returns Current buffer
	 */
	getBuffer(): string {
		return this.buffer;
	}

	/**
	 * Checks if parser is in paste mode
	 *
	 * @returns true if in paste mode
	 */
	isInPasteMode(): boolean {
		return this.inPasteMode;
	}
}
