/**
 * Terminal State Manager Module
 *
 * This module tracks the current state of the terminal including cursor position,
 * text attributes (colors, styles), and active modes.
 *
 * @module terminal/state
 */

import { EventEmitter } from 'events';

/**
 * Text attributes interface
 */
export interface TextAttributes {
	/** Foreground color (ANSI code or RGB) */
	foreground: number | { r: number; g: number; b: number } | null;

	/** Background color (ANSI code or RGB) */
	background: number | { r: number; g: number; b: number } | null;

	/** Bold text */
	bold: boolean;

	/** Dim text */
	dim: boolean;

	/** Italic text */
	italic: boolean;

	/** Underlined text */
	underline: boolean;

	/** Blinking text */
	blink: boolean;

	/** Reverse video */
	reverse: boolean;

	/** Hidden text */
	hidden: boolean;

	/** Strikethrough text */
	strikethrough: boolean;
}

/**
 * Cursor position interface
 */
export interface CursorPosition {
	/** Column (1-indexed) */
	x: number;

	/** Row (1-indexed) */
	y: number;
}

/**
 * Terminal modes interface
 */
export interface TerminalModes {
	/** Alternate screen buffer is active */
	alternateScreen: boolean;

	/** Mouse tracking is enabled */
	mouseTracking: boolean;

	/** Bracketed paste mode is enabled */
	bracketedPaste: boolean;

	/** Focus events are enabled */
	focusEvents: boolean;

	/** Application cursor keys mode */
	applicationCursor: boolean;

	/** Line wrapping is enabled */
	lineWrap: boolean;

	/** Origin mode is enabled */
	originMode: boolean;

	/** Insert mode (vs replace mode) */
	insertMode: boolean;
}

/**
 * Default text attributes
 */
const DEFAULT_ATTRIBUTES: TextAttributes = {
	foreground: null,
	background: null,
	bold: false,
	dim: false,
	italic: false,
	underline: false,
	blink: false,
	reverse: false,
	hidden: false,
	strikethrough: false,
};

/**
 * Default cursor position
 */
const DEFAULT_CURSOR: CursorPosition = {
	x: 1,
	y: 1,
};

/**
 * Default terminal modes
 */
const DEFAULT_MODES: TerminalModes = {
	alternateScreen: false,
	mouseTracking: false,
	bracketedPaste: false,
	focusEvents: false,
	applicationCursor: false,
	lineWrap: true,
	originMode: false,
	insertMode: false,
};

/**
 * Terminal state manager that tracks cursor position, text attributes, and modes.
 *
 * @example
 * ```typescript
 * const state = new TerminalStateManager();
 *
 * // Update cursor position
 * state.setCursorPosition(10, 5);
 *
 * // Update text attributes
 * state.setForeground(31); // Red
 * state.setBold(true);
 *
 * // Check current state
 * console.log(state.getCursorPosition()); // { x: 10, y: 5 }
 * console.log(state.getAttributes().bold); // true
 * ```
 */
export class TerminalStateManager extends EventEmitter {
	/** Current cursor position */
	private cursor: CursorPosition;

	/** Current text attributes */
	private attributes: TextAttributes;

	/** Current terminal modes */
	private modes: TerminalModes;

	/** Stack for saving/restoring state */
	private stateStack: Array<{ cursor: CursorPosition; attributes: TextAttributes }> = [];

	/** Whether to emit events on state changes */
	private emitEvents: boolean;

	/**
	 * Creates a new TerminalStateManager instance
	 *
	 * @param {boolean} emitEvents - Whether to emit events on state changes
	 */
	constructor(emitEvents = true) {
		super();
		this.emitEvents = emitEvents;
		this.cursor = { ...DEFAULT_CURSOR };
		this.attributes = { ...DEFAULT_ATTRIBUTES };
		this.modes = { ...DEFAULT_MODES };
	}

	// ==================== Cursor Position ====================

	/**
	 * Get the current cursor position
	 *
	 * @returns {CursorPosition} Current cursor position (1-indexed)
	 */
	getCursorPosition(): CursorPosition {
		return { ...this.cursor };
	}

	/**
	 * Set the cursor position
	 *
	 * @param {number} x - Column (1-indexed)
	 * @param {number} y - Row (1-indexed)
	 */
	setCursorPosition(x: number, y: number): void {
		const oldPosition = { ...this.cursor };
		this.cursor = { x: Math.max(1, x), y: Math.max(1, y) };

		if (this.emitEvents && (oldPosition.x !== this.cursor.x || oldPosition.y !== this.cursor.y)) {
			this.emit('cursorMove', this.cursor, oldPosition);
		}
	}

	/**
	 * Move the cursor relative to current position
	 *
	 * @param {number} dx - Delta x (positive = right)
	 * @param {number} dy - Delta y (positive = down)
	 */
	moveCursor(dx: number, dy: number): void {
		this.setCursorPosition(this.cursor.x + dx, this.cursor.y + dy);
	}

	/**
	 * Move cursor up
	 *
	 * @param {number} n - Number of lines (default: 1)
	 */
	cursorUp(n = 1): void {
		this.moveCursor(0, -n);
	}

	/**
	 * Move cursor down
	 *
	 * @param {number} n - Number of lines (default: 1)
	 */
	cursorDown(n = 1): void {
		this.moveCursor(0, n);
	}

	/**
	 * Move cursor forward (right)
	 *
	 * @param {number} n - Number of columns (default: 1)
	 */
	cursorForward(n = 1): void {
		this.moveCursor(n, 0);
	}

	/**
	 * Move cursor backward (left)
	 *
	 * @param {number} n - Number of columns (default: 1)
	 */
	cursorBackward(n = 1): void {
		this.moveCursor(-n, 0);
	}

	/**
	 * Move cursor to the beginning of the line
	 */
	cursorToLineStart(): void {
		this.setCursorPosition(1, this.cursor.y);
	}

	/**
	 * Move cursor to home position (1, 1)
	 */
	cursorHome(): void {
		this.setCursorPosition(1, 1);
	}

	// ==================== Text Attributes ====================

	/**
	 * Get current text attributes
	 *
	 * @returns {TextAttributes} Current text attributes
	 */
	getAttributes(): TextAttributes {
		return { ...this.attributes };
	}

	/**
	 * Set foreground color
	 *
	 * @param {number | { r: number; g: number; b: number } | null} color - Color value
	 */
	setForeground(color: number | { r: number; g: number; b: number } | null): void {
		const oldColor = this.attributes.foreground;
		this.attributes.foreground = color;

		if (this.emitEvents) {
			this.emit('foregroundChange', color, oldColor);
		}
	}

	/**
	 * Set background color
	 *
	 * @param {number | { r: number; g: number; b: number } | null} color - Color value
	 */
	setBackground(color: number | { r: number; g: number; b: number } | null): void {
		const oldColor = this.attributes.background;
		this.attributes.background = color;

		if (this.emitEvents) {
			this.emit('backgroundChange', color, oldColor);
		}
	}

	/**
	 * Set bold attribute
	 *
	 * @param {boolean} enabled - Whether bold is enabled
	 */
	setBold(enabled: boolean): void {
		this.attributes.bold = enabled;

		if (this.emitEvents) {
			this.emit('boldChange', enabled);
		}
	}

	/**
	 * Set dim attribute
	 *
	 * @param {boolean} enabled - Whether dim is enabled
	 */
	setDim(enabled: boolean): void {
		this.attributes.dim = enabled;

		if (this.emitEvents) {
			this.emit('dimChange', enabled);
		}
	}

	/**
	 * Set italic attribute
	 *
	 * @param {boolean} enabled - Whether italic is enabled
	 */
	setItalic(enabled: boolean): void {
		this.attributes.italic = enabled;

		if (this.emitEvents) {
			this.emit('italicChange', enabled);
		}
	}

	/**
	 * Set underline attribute
	 *
	 * @param {boolean} enabled - Whether underline is enabled
	 */
	setUnderline(enabled: boolean): void {
		this.attributes.underline = enabled;

		if (this.emitEvents) {
			this.emit('underlineChange', enabled);
		}
	}

	/**
	 * Set blink attribute
	 *
	 * @param {boolean} enabled - Whether blink is enabled
	 */
	setBlink(enabled: boolean): void {
		this.attributes.blink = enabled;

		if (this.emitEvents) {
			this.emit('blinkChange', enabled);
		}
	}

	/**
	 * Set reverse attribute
	 *
	 * @param {boolean} enabled - Whether reverse is enabled
	 */
	setReverse(enabled: boolean): void {
		this.attributes.reverse = enabled;

		if (this.emitEvents) {
			this.emit('reverseChange', enabled);
		}
	}

	/**
	 * Set hidden attribute
	 *
	 * @param {boolean} enabled - Whether hidden is enabled
	 */
	setHidden(enabled: boolean): void {
		this.attributes.hidden = enabled;

		if (this.emitEvents) {
			this.emit('hiddenChange', enabled);
		}
	}

	/**
	 * Set strikethrough attribute
	 *
	 * @param {boolean} enabled - Whether strikethrough is enabled
	 */
	setStrikethrough(enabled: boolean): void {
		this.attributes.strikethrough = enabled;

		if (this.emitEvents) {
			this.emit('strikethroughChange', enabled);
		}
	}

	/**
	 * Reset all text attributes to defaults
	 */
	resetAttributes(): void {
		const oldAttributes = { ...this.attributes };
		this.attributes = { ...DEFAULT_ATTRIBUTES };

		if (this.emitEvents) {
			this.emit('attributesReset', this.attributes, oldAttributes);
		}
	}

	// ==================== Terminal Modes ====================

	/**
	 * Get current terminal modes
	 *
	 * @returns {TerminalModes} Current terminal modes
	 */
	getModes(): TerminalModes {
		return { ...this.modes };
	}

	/**
	 * Set alternate screen mode
	 *
	 * @param {boolean} enabled - Whether alternate screen is active
	 */
	setAlternateScreen(enabled: boolean): void {
		const oldValue = this.modes.alternateScreen;
		this.modes.alternateScreen = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('alternateScreenChange', enabled);
		}
	}

	/**
	 * Set mouse tracking mode
	 *
	 * @param {boolean} enabled - Whether mouse tracking is enabled
	 */
	setMouseTracking(enabled: boolean): void {
		const oldValue = this.modes.mouseTracking;
		this.modes.mouseTracking = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('mouseTrackingChange', enabled);
		}
	}

	/**
	 * Set bracketed paste mode
	 *
	 * @param {boolean} enabled - Whether bracketed paste is enabled
	 */
	setBracketedPaste(enabled: boolean): void {
		const oldValue = this.modes.bracketedPaste;
		this.modes.bracketedPaste = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('bracketedPasteChange', enabled);
		}
	}

	/**
	 * Set focus events mode
	 *
	 * @param {boolean} enabled - Whether focus events are enabled
	 */
	setFocusEvents(enabled: boolean): void {
		const oldValue = this.modes.focusEvents;
		this.modes.focusEvents = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('focusEventsChange', enabled);
		}
	}

	/**
	 * Set application cursor mode
	 *
	 * @param {boolean} enabled - Whether application cursor is enabled
	 */
	setApplicationCursor(enabled: boolean): void {
		const oldValue = this.modes.applicationCursor;
		this.modes.applicationCursor = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('applicationCursorChange', enabled);
		}
	}

	/**
	 * Set line wrap mode
	 *
	 * @param {boolean} enabled - Whether line wrap is enabled
	 */
	setLineWrap(enabled: boolean): void {
		const oldValue = this.modes.lineWrap;
		this.modes.lineWrap = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('lineWrapChange', enabled);
		}
	}

	/**
	 * Set origin mode
	 *
	 * @param {boolean} enabled - Whether origin mode is enabled
	 */
	setOriginMode(enabled: boolean): void {
		const oldValue = this.modes.originMode;
		this.modes.originMode = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('originModeChange', enabled);
		}
	}

	/**
	 * Set insert mode
	 *
	 * @param {boolean} enabled - Whether insert mode is enabled
	 */
	setInsertMode(enabled: boolean): void {
		const oldValue = this.modes.insertMode;
		this.modes.insertMode = enabled;

		if (this.emitEvents && oldValue !== enabled) {
			this.emit('insertModeChange', enabled);
		}
	}

	// ==================== State Stack ====================

	/**
	 * Save current cursor position and attributes to stack
	 */
	pushState(): void {
		this.stateStack.push({
			cursor: { ...this.cursor },
			attributes: { ...this.attributes },
		});

		if (this.emitEvents) {
			this.emit('statePush');
		}
	}

	/**
	 * Restore cursor position and attributes from stack
	 *
	 * @returns {boolean} True if state was restored, false if stack was empty
	 */
	popState(): boolean {
		const state = this.stateStack.pop();

		if (!state) {
			return false;
		}

		this.cursor = state.cursor;
		this.attributes = state.attributes;

		if (this.emitEvents) {
			this.emit('statePop');
		}

		return true;
	}

	/**
	 * Clear the state stack
	 */
	clearStateStack(): void {
		this.stateStack = [];

		if (this.emitEvents) {
			this.emit('stateStackClear');
		}
	}

	/**
	 * Get the depth of the state stack
	 *
	 * @returns {number} Number of saved states
	 */
	getStateStackDepth(): number {
		return this.stateStack.length;
	}

	// ==================== Utility ====================

	/**
	 * Reset all state to defaults
	 */
	reset(): void {
		this.cursor = { ...DEFAULT_CURSOR };
		this.attributes = { ...DEFAULT_ATTRIBUTES };
		this.modes = { ...DEFAULT_MODES };
		this.stateStack = [];

		if (this.emitEvents) {
			this.emit('reset');
		}
	}

	/**
	 * Get a snapshot of the current state
	 *
	 * @returns {Object} Current state snapshot
	 */
	getSnapshot(): {
		cursor: CursorPosition;
		attributes: TextAttributes;
		modes: TerminalModes;
		stateStackDepth: number;
	} {
		return {
			cursor: { ...this.cursor },
			attributes: { ...this.attributes },
			modes: { ...this.modes },
			stateStackDepth: this.stateStack.length,
		};
	}

	/**
	 * Check if any text styling is active
	 *
	 * @returns {boolean} True if any style attribute is enabled
	 */
	hasActiveStyles(): boolean {
		return (
			this.attributes.bold ||
			this.attributes.dim ||
			this.attributes.italic ||
			this.attributes.underline ||
			this.attributes.blink ||
			this.attributes.reverse ||
			this.attributes.hidden ||
			this.attributes.strikethrough
		);
	}

	/**
	 * Check if any color is set
	 *
	 * @returns {boolean} True if foreground or background is set
	 */
	hasActiveColors(): boolean {
		return this.attributes.foreground !== null || this.attributes.background !== null;
	}

	/**
	 * Destroy the manager and cleanup
	 */
	destroy(): void {
		this.reset();
		this.removeAllListeners();
	}
}
