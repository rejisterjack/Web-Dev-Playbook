/**
 * Key Bindings Module
 *
 * Manages keyboard shortcuts and key combinations with support for
 * modifiers (ctrl, alt, shift) and key sequences (multi-key bindings).
 *
 * @module events/keybindings
 */

import type { KeyEvent } from './types.js';

/**
 * Key binding callback type
 */
export type KeyBindingCallback = (event: KeyEvent) => void | boolean;

/**
 * Key chord (single key with modifiers)
 */
export interface KeyChord {
	/** Key name */
	key: string;
	/** Ctrl modifier */
	ctrl?: boolean;
	/** Alt modifier */
	alt?: boolean;
	/** Shift modifier */
	shift?: boolean;
}

/**
 * Key binding definition
 */
export interface KeyBinding {
	/** Unique identifier for this binding */
	id: string;
	/** Key chord or sequence of chords */
	chords: KeyChord | KeyChord[];
	/** Callback when binding is triggered */
	callback: KeyBindingCallback;
	/** Priority (higher = checked first) */
	priority?: number;
	/** Prevent default after handling */
	preventDefault?: boolean;
	/** Stop propagation after handling */
	stopPropagation?: boolean;
	/** Description for help/documentation */
	description?: string;
}

/**
 * Parsed key sequence state
 */
interface SequenceState {
	/** Target chords */
	chords: KeyChord[];
	/** Current position in sequence */
	position: number;
	/** Timeout for sequence completion */
	timeout: NodeJS.Timeout | null;
	/** Original binding */
	binding: KeyBinding;
}

/**
 * KeyBindings options
 */
export interface KeyBindingsOptions {
	/** Timeout for key sequences in ms */
	sequenceTimeout?: number;
	/** Case sensitive key matching */
	caseSensitive?: boolean;
}

/**
 * KeyBindings class for managing keyboard shortcuts
 *
 * @example
 * ```typescript
 * const bindings = new KeyBindings();
 *
 * // Register simple key binding
 * bindings.register({
 *   id: 'quit',
 *   chords: { key: 'q', ctrl: true },
 *   callback: () => console.log('Quit!'),
 *   description: 'Quit application'
 * });
 *
 * // Register key sequence
 * bindings.register({
 *   id: 'save-all',
 *   chords: [
 *     { key: 'ctrl', ctrl: true },
 *     { key: 's', ctrl: true }
 *   ],
 *   callback: () => console.log('Save all!')
 * });
 *
 * // Handle key event
 * const handled = bindings.handleKey(keyEvent);
 * ```
 */
export class KeyBindings {
	/** Registered bindings */
	private bindings = new Map<string, KeyBinding>();

	/** Active sequence states */
	private sequenceStates: SequenceState[] = [];

	/** Options */
	private options: Required<KeyBindingsOptions>;

	/** Sequence timeout ID */
	private sequenceTimeoutId: NodeJS.Timeout | null = null;

	/**
	 * Creates a new KeyBindings instance
	 *
	 * @param options - KeyBindings configuration
	 */
	constructor(options: KeyBindingsOptions = {}) {
		this.options = {
			sequenceTimeout: options.sequenceTimeout ?? 1000,
			caseSensitive: options.caseSensitive ?? false,
		};
	}

	/**
	 * Registers a key binding
	 *
	 * @param binding - Key binding definition
	 * @returns Unregister function
	 */
	register(binding: KeyBinding): () => void {
		// Normalize chords to array
		const chords = Array.isArray(binding.chords) ? binding.chords : [binding.chords];

		// Validate chords
		if (chords.length === 0) {
			throw new Error('Key binding must have at least one chord');
		}

		// Store binding
		this.bindings.set(binding.id, {
			...binding,
			chords,
			priority: binding.priority ?? 0,
		});

		return () => this.unregister(binding.id);
	}

	/**
	 * Unregisters a key binding
	 *
	 * @param id - Binding ID to remove
	 * @returns true if binding was removed
	 */
	unregister(id: string): boolean {
		return this.bindings.delete(id);
	}

	/**
	 * Handles a key event, checking all registered bindings
	 *
	 * @param event - Key event to handle
	 * @returns true if a binding was triggered
	 */
	handleKey(event: KeyEvent): boolean {
		// Clear expired sequence states
		this.clearExpiredSequences();

		// Normalize key for matching
		const normalizedKey = this.normalizeKey(event.key);

		// Build chord from event
		const eventChord: KeyChord = {
			key: normalizedKey,
			ctrl: event.ctrl,
			alt: event.alt,
			shift: event.shift,
		};

		// Check active sequences first
		for (const state of this.sequenceStates) {
			const expectedChord = state.chords[state.position];

			if (this.chordsMatch(eventChord, expectedChord)) {
				state.position++;

				// Sequence complete
				if (state.position >= state.chords.length) {
					this.executeBinding(state.binding, event);
					this.clearSequences();
					return true;
				}

				// Reset timeout
				this.resetSequenceTimeout();
				return true;
			}
		}

		// Check single-chord bindings
		const singleChordBindings = Array.from(this.bindings.values())
			.filter((b) => !Array.isArray(b.chords) || b.chords.length === 1)
			.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

		for (const binding of singleChordBindings) {
			const chord = Array.isArray(binding.chords) ? binding.chords[0] : binding.chords;

			if (this.chordsMatch(eventChord, chord)) {
				this.executeBinding(binding, event);
				return true;
			}
		}

		// Check multi-chord bindings (start new sequence)
		const multiChordBindings = Array.from(this.bindings.values())
			.filter((b) => Array.isArray(b.chords) && b.chords.length > 1)
			.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

		for (const binding of multiChordBindings) {
			const chords = binding.chords as KeyChord[];
			const firstChord = chords[0];

			if (this.chordsMatch(eventChord, firstChord)) {
				// Start new sequence
				const state: SequenceState = {
					chords: binding.chords as KeyChord[],
					position: 1,
					timeout: null,
					binding,
				};

				this.sequenceStates.push(state);
				this.resetSequenceTimeout();

				// Consume the key event
				return true;
			}
		}

		return false;
	}

	/**
	 * Checks if a key binding exists
	 *
	 * @param id - Binding ID to check
	 * @returns true if binding exists
	 */
	has(id: string): boolean {
		return this.bindings.has(id);
	}

	/**
	 * Gets a binding by ID
	 *
	 * @param id - Binding ID
	 * @returns Binding or undefined
	 */
	get(id: string): KeyBinding | undefined {
		return this.bindings.get(id);
	}

	/**
	 * Gets all registered bindings
	 *
	 * @returns Array of bindings
	 */
	getAll(): KeyBinding[] {
		return Array.from(this.bindings.values());
	}

	/**
	 * Gets bindings grouped by category
	 *
	 * @returns Map of category to bindings
	 */
	getByCategory(): Map<string, KeyBinding[]> {
		const categories = new Map<string, KeyBinding[]>();

		for (const binding of this.bindings.values()) {
			// Extract category from ID (e.g., "file:save" -> "file")
			const category = binding.id.includes(':')
				? binding.id.split(':')[0]
				: 'general';

			const existing = categories.get(category) ?? [];
			existing.push(binding);
			categories.set(category, existing);
		}

		return categories;
	}

	/**
	 * Clears all bindings
	 */
	clear(): void {
		this.bindings.clear();
		this.clearSequences();
	}

	/**
	 * Returns the number of registered bindings
	 *
	 * @returns Number of bindings
	 */
	count(): number {
		return this.bindings.size;
	}

	/**
	 * Formats a key chord as a human-readable string
	 *
	 * @param chord - Key chord to format
	 * @returns Formatted string
	 */
	formatChord(chord: KeyChord): string {
		const parts: string[] = [];

		if (chord.ctrl) parts.push('Ctrl');
		if (chord.alt) parts.push('Alt');
		if (chord.shift) parts.push('Shift');

		// Format special keys
		const keyMap: Record<string, string> = {
			escape: 'Esc',
			return: 'Enter',
			backspace: 'Backspace',
			tab: 'Tab',
			space: 'Space',
			delete: 'Del',
			insert: 'Ins',
			pageup: 'PgUp',
			pagedown: 'PgDn',
			home: 'Home',
			end: 'End',
			up: '↑',
			down: '↓',
			left: '←',
			right: '→',
		};

		parts.push(keyMap[chord.key.toLowerCase()] ?? chord.key.toUpperCase());

		return parts.join('+');
	}

	/**
	 * Formats a key binding as a human-readable string
	 *
	 * @param binding - Key binding to format
	 * @returns Formatted string
	 */
	formatBinding(binding: KeyBinding): string {
		const chords = Array.isArray(binding.chords) ? binding.chords : [binding.chords];
		return chords.map((c) => this.formatChord(c)).join(' ');
	}

	/**
	 * Normalizes a key string for matching
	 */
	private normalizeKey(key: string): string {
		if (this.options.caseSensitive) {
			return key;
		}
		return key.toLowerCase();
	}

	/**
	 * Checks if two chords match
	 */
	private chordsMatch(a: KeyChord, b: KeyChord): boolean {
		return (
			this.normalizeKey(a.key) === this.normalizeKey(b.key) &&
			!!a.ctrl === !!b.ctrl &&
			!!a.alt === !!b.alt &&
			!!a.shift === !!b.shift
		);
	}

	/**
	 * Executes a key binding callback
	 */
	private executeBinding(binding: KeyBinding, event: KeyEvent): void {
		try {
			const result = binding.callback(event);

			if (binding.preventDefault !== false) {
				event.defaultPrevented = true;
			}

			if (binding.stopPropagation || result === false) {
				event.propagationStopped = true;
			}
		} catch (error) {
			console.error(`Error in key binding "${binding.id}":`, error);
		}
	}

	/**
	 * Clears all sequence states
	 */
	private clearSequences(): void {
		for (const state of this.sequenceStates) {
			if (state.timeout) {
				clearTimeout(state.timeout);
			}
		}

		this.sequenceStates = [];

		if (this.sequenceTimeoutId) {
			clearTimeout(this.sequenceTimeoutId);
			this.sequenceTimeoutId = null;
		}
	}

	/**
	 * Clears expired sequence states
	 */
	private clearExpiredSequences(): void {
		// Sequences are cleared by timeout, this is a placeholder
		// for any additional cleanup logic
	}

	/**
	 * Resets the sequence timeout
	 */
	private resetSequenceTimeout(): void {
		if (this.sequenceTimeoutId) {
			clearTimeout(this.sequenceTimeoutId);
		}

		this.sequenceTimeoutId = setTimeout(() => {
			this.clearSequences();
		}, this.options.sequenceTimeout);
	}

	/**
	 * Creates a key chord from a string representation
	 *
	 * @param str - String like "Ctrl+S" or "ctrl+s"
	 * @returns KeyChord object
	 */
	static parseChord(str: string): KeyChord {
		const parts = str.toLowerCase().split('+');
		const chord: KeyChord = { key: '' };

		for (const part of parts) {
			const trimmed = part.trim();
			switch (trimmed) {
				case 'ctrl':
				case 'control':
					chord.ctrl = true;
					break;
				case 'alt':
					chord.alt = true;
					break;
				case 'shift':
					chord.shift = true;
					break;
				default:
					chord.key = trimmed;
			}
		}

		return chord;
	}

	/**
	 * Creates a key binding from a string shortcut
	 *
	 * @param shortcut - String like "Ctrl+S" or "Ctrl+K Ctrl+S"
	 * @param callback - Callback function
	 * @param description - Optional description
	 * @returns KeyBinding object
	 */
	static fromShortcut(
		shortcut: string,
		callback: KeyBindingCallback,
		description?: string,
	): Omit<KeyBinding, 'id'> {
		const chordStrings = shortcut.split(/\s+/);
		const chords = chordStrings.map((s) => KeyBindings.parseChord(s));

		return {
			chords: chords.length === 1 ? chords[0] : chords,
			callback,
			description,
		};
	}
}
