/**
 * ANSI Escape Codes Module
 *
 * This module provides comprehensive ANSI escape code constants and generators
 * for terminal control including cursor movement, screen clearing, text styling,
 * colors, and terminal queries.
 *
 * @module terminal/ansi
 */

/**
 * ANSI escape sequence constants
 */
export const ESC = '\u001B[';
export const OSC = '\u001B]';
export const BEL = '\u0007';
export const ST = '\u001B\\';

/**
 * Cursor movement sequences
 */
export const Cursor = {
	/** Move cursor up by n lines */
	up: (n = 1): string => `${ESC}${n}A`,

	/** Move cursor down by n lines */
	down: (n = 1): string => `${ESC}${n}B`,

	/** Move cursor forward (right) by n columns */
	forward: (n = 1): string => `${ESC}${n}C`,

	/** Move cursor backward (left) by n columns */
	backward: (n = 1): string => `${ESC}${n}D`,

	/** Move cursor to the beginning of the line n lines down */
	nextLine: (n = 1): string => `${ESC}${n}E`,

	/** Move cursor to the beginning of the line n lines up */
	prevLine: (n = 1): string => `${ESC}${n}F`,

	/** Move cursor to column n */
	horizontalAbsolute: (n = 1): string => `${ESC}${n}G`,

	/** Move cursor to absolute position (1-indexed) */
	to: (x: number, y: number): string => `${ESC}${y};${x}H`,

	/** Save cursor position (DECSC) */
	save: (): string => `${ESC}s`,

	/** Restore cursor position (DECRC) */
	restore: (): string => `${ESC}u`,

	/** Save cursor position (SCO) */
	saveSCO: (): string => `${ESC}7`,

	/** Restore cursor position (SCO) */
	restoreSCO: (): string => `${ESC}8`,

	/** Hide cursor */
	hide: (): string => `${ESC}?25l`,

	/** Show cursor */
	show: (): string => `${ESC}?25h`,

	/** Report cursor position (returns ESC[n;mR) */
	report: (): string => `${ESC}6n`,
} as const;

/**
 * Screen clearing sequences
 */
export const Screen = {
	/** Clear entire screen */
	clear: (): string => `${ESC}2J`,

	/** Clear screen from cursor to beginning */
	clearUp: (): string => `${ESC}1J`,

	/** Clear screen from cursor to end */
	clearDown: (): string => `${ESC}0J`,

	/** Clear entire line */
	clearLine: (): string => `${ESC}2K`,

	/** Clear line from cursor to beginning */
	clearLineUp: (): string => `${ESC}1K`,

	/** Clear line from cursor to end */
	clearLineDown: (): string => `${ESC}0K`,

	/** Insert n lines */
	insertLines: (n = 1): string => `${ESC}${n}L`,

	/** Delete n lines */
	deleteLines: (n = 1): string => `${ESC}${n}M`,

	/** Insert n characters */
	insertChars: (n = 1): string => `${ESC}${n}@`,

	/** Delete n characters */
	deleteChars: (n = 1): string => `${ESC}${n}P`,

	/** Erase n characters */
	eraseChars: (n = 1): string => `${ESC}${n}X`,

	/** Scroll up n lines */
	scrollUp: (n = 1): string => `${ESC}${n}S`,

	/** Scroll down n lines */
	scrollDown: (n = 1): string => `${ESC}${n}T`,
} as const;

/**
 * Text style codes
 */
export const Style = {
	reset: 0,
	bold: 1,
	dim: 2,
	italic: 3,
	underline: 4,
	blink: 5,
	reverse: 7,
	hidden: 8,
	strikethrough: 9,

	// Reset codes
	resetBold: 22,
	resetDim: 22,
	resetItalic: 23,
	resetUnderline: 24,
	resetBlink: 25,
	resetReverse: 27,
	resetHidden: 28,
	resetStrikethrough: 29,
} as const;

/**
 * Color codes
 */
export const Color = {
	// Standard 16 colors
	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37,
	default: 39,

	// Bright colors
	brightBlack: 90,
	brightRed: 91,
	brightGreen: 92,
	brightYellow: 93,
	brightBlue: 94,
	brightMagenta: 95,
	brightCyan: 96,
	brightWhite: 97,

	// Background colors
	bgBlack: 40,
	bgRed: 41,
	bgGreen: 42,
	bgYellow: 43,
	bgBlue: 44,
	bgMagenta: 45,
	bgCyan: 46,
	bgWhite: 47,
	bgDefault: 49,

	// Bright background colors
	bgBrightBlack: 100,
	bgBrightRed: 101,
	bgBrightGreen: 102,
	bgBrightYellow: 103,
	bgBrightBlue: 104,
	bgBrightMagenta: 105,
	bgBrightCyan: 106,
	bgBrightWhite: 107,
} as const;

/**
 * Text styling functions
 */
export const Text = {
	/** Reset all styles */
	reset: (): string => `${ESC}${Style.reset}m`,

	/** Set bold text */
	bold: (text?: string): string =>
		text ? `${ESC}${Style.bold}m${text}${ESC}${Style.resetBold}m` : `${ESC}${Style.bold}m`,

	/** Set dim text */
	dim: (text?: string): string =>
		text ? `${ESC}${Style.dim}m${text}${ESC}${Style.resetDim}m` : `${ESC}${Style.dim}m`,

	/** Set italic text */
	italic: (text?: string): string =>
		text ? `${ESC}${Style.italic}m${text}${ESC}${Style.resetItalic}m` : `${ESC}${Style.italic}m`,

	/** Set underlined text */
	underline: (text?: string): string =>
		text ? `${ESC}${Style.underline}m${text}${ESC}${Style.resetUnderline}m` : `${ESC}${Style.underline}m`,

	/** Set blinking text */
	blink: (text?: string): string =>
		text ? `${ESC}${Style.blink}m${text}${ESC}${Style.resetBlink}m` : `${ESC}${Style.blink}m`,

	/** Set reverse video text */
	reverse: (text?: string): string =>
		text ? `${ESC}${Style.reverse}m${text}${ESC}${Style.resetReverse}m` : `${ESC}${Style.reverse}m`,

	/** Set hidden text */
	hidden: (text?: string): string =>
		text ? `${ESC}${Style.hidden}m${text}${ESC}${Style.resetHidden}m` : `${ESC}${Style.hidden}m`,

	/** Set strikethrough text */
	strikethrough: (text?: string): string =>
		text
			? `${ESC}${Style.strikethrough}m${text}${ESC}${Style.resetStrikethrough}m`
			: `${ESC}${Style.strikethrough}m`,

	/** Apply multiple styles */
	style: (...codes: number[]): string => `${ESC}${codes.join(';')}m`,
} as const;

/**
 * Color functions for 16-color mode
 */
export const Colors16 = {
	/** Set foreground color (0-15) */
	foreground: (color: number): string => {
		if (color < 8) {
			return `${ESC}${30 + color}m`;
		}

		return `${ESC}${90 + (color - 8)}m`;
	},

	/** Set background color (0-15) */
	background: (color: number): string => {
		if (color < 8) {
			return `${ESC}${40 + color}m`;
		}

		return `${ESC}${100 + (color - 8)}m`;
	},

	/** Set foreground and background colors */
	color: (fg: number, bg: number): string => `${Colors16.foreground(fg)}${Colors16.background(bg).slice(2)}`,
};

/**
 * Color functions for 256-color mode
 */
export const Colors256 = {
	/** Set foreground color (0-255) */
	foreground: (color: number): string => `${ESC}38;5;${color}m`,

	/** Set background color (0-255) */
	background: (color: number): string => `${ESC}48;5;${color}m`,

	/** Set foreground and background colors */
	color: (fg: number, bg: number): string => `${ESC}38;5;${fg};48;5;${bg}m`,
};

/**
 * Color functions for TrueColor (24-bit RGB) mode
 */
export const TrueColor = {
	/** Set foreground color using RGB values */
	foreground: (r: number, g: number, b: number): string => `${ESC}38;2;${r};${g};${b}m`,

	/** Set background color using RGB values */
	background: (r: number, g: number, b: number): string => `${ESC}48;2;${r};${g};${b}m`,

	/** Set foreground and background colors using RGB values */
	color: (fr: number, fg: number, fb: number, br: number, bg: number, bb: number): string =>
		`${ESC}38;2;${fr};${fg};${fb};48;2;${br};${bg};${bb}m`,

	/** Set foreground color using hex value */
	foregroundHex: (hex: string): string => {
		const { r, g, b } = hexToRgb(hex);
		return TrueColor.foreground(r, g, b);
	},

	/** Set background color using hex value */
	backgroundHex: (hex: string): string => {
		const { r, g, b } = hexToRgb(hex);
		return TrueColor.background(r, g, b);
	},
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	// Remove # if present
	const cleanHex = hex.replace('#', '');

	// Parse based on length
	if (cleanHex.length === 3) {
		const r = Number.parseInt(cleanHex[0] + cleanHex[0], 16);
		const g = Number.parseInt(cleanHex[1] + cleanHex[1], 16);
		const b = Number.parseInt(cleanHex[2] + cleanHex[2], 16);
		return { r, g, b };
	}

	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);
	return { r, g, b };
}

/**
 * Screen mode sequences
 */
export const Modes = {
	/** Enable alternate screen buffer */
	enableAlternateScreen: (): string => `${ESC}?1049h`,

	/** Disable alternate screen buffer */
	disableAlternateScreen: (): string => `${ESC}?1049l`,

	/** Enable bracketed paste mode */
	enableBracketedPaste: (): string => `${ESC}?2004h`,

	/** Disable bracketed paste mode */
	disableBracketedPaste: (): string => `${ESC}?2004l`,

	/** Enable focus events */
	enableFocusEvents: (): string => `${ESC}?1004h`,

	/** Disable focus events */
	disableFocusEvents: (): string => `${ESC}?1004l`,

	/** Enable mouse tracking (X10) */
	enableMouseX10: (): string => `${ESC}?9h`,

	/** Disable mouse tracking (X10) */
	disableMouseX10: (): string => `${ESC}?9l`,

	/** Enable mouse tracking (normal) */
	enableMouseNormal: (): string => `${ESC}?1000h`,

	/** Disable mouse tracking (normal) */
	disableMouseNormal: (): string => `${ESC}?1000l`,

	/** Enable mouse tracking (highlight) */
	enableMouseHighlight: (): string => `${ESC}?1001h`,

	/** Disable mouse tracking (highlight) */
	disableMouseHighlight: (): string => `${ESC}?1001l`,

	/** Enable mouse tracking (button event) */
	enableMouseButton: (): string => `${ESC}?1002h`,

	/** Disable mouse tracking (button event) */
	disableMouseButton: (): string => `${ESC}?1002l`,

	/** Enable mouse tracking (any event) */
	enableMouseAny: (): string => `${ESC}?1003h`,

	/** Disable mouse tracking (any event) */
	disableMouseAny: (): string => `${ESC}?1003l`,

	/** Enable UTF-8 mouse mode */
	enableMouseUTF8: (): string => `${ESC}?1005h`,

	/** Disable UTF-8 mouse mode */
	disableMouseUTF8: (): string => `${ESC}?1005l`,

	/** Enable SGR mouse mode */
	enableMouseSGR: (): string => `${ESC}?1006h`,

	/** Disable SGR mouse mode */
	disableMouseSGR: (): string => `${ESC}?1006l`,

	/** Enable URXVT mouse mode */
	enableMouseURXVT: (): string => `${ESC}?1015h`,

	/** Disable URXVT mouse mode */
	disableMouseURXVT: (): string => `${ESC}?1015l`,

	/** Enable all mouse tracking with SGR mode */
	enableMouseSGRAll: (): string =>
		`${ESC}?1000h${ESC}?1002h${ESC}?1006h`,

	/** Disable all mouse tracking */
	disableMouseAll: (): string =>
		`${ESC}?1003l${ESC}?1002l${ESC}?1001l${ESC}?1000l${ESC}?1006l${ESC}?1015l${ESC}?1005l`,

	/** Enable line wrapping */
	enableLineWrap: (): string => `${ESC}?7h`,

	/** Disable line wrapping */
	disableLineWrap: (): string => `${ESC}?7l`,

	/** Enable origin mode */
	enableOrigin: (): string => `${ESC}?6h`,

	/** Disable origin mode */
	disableOrigin: (): string => `${ESC}?6l`,

	/** Enable application cursor keys */
	enableApplicationCursor: (): string => `${ESC}?1h`,

	/** Disable application cursor keys */
	disableApplicationCursor: (): string => `${ESC}?1l`,

	/** Enable application keypad */
	enableApplicationKeypad: (): string => `${ESC}=`,

	/** Disable application keypad */
	disableApplicationKeypad: (): string => `${ESC}>`,

	/** Enable smooth scroll */
	enableSmoothScroll: (): string => `${ESC}?4h`,

	/** Disable smooth scroll */
	disableSmoothScroll: (): string => `${ESC}?4l`,

	/** Enable insert mode */
	enableInsertMode: (): string => `${ESC}4h`,

	/** Disable insert mode (replace mode) */
	disableInsertMode: (): string => `${ESC}4l`,
} as const;

/**
 * Terminal query sequences
 */
export const Queries = {
	/** Query terminal size (returns ESC[8;rows;cols;t) */
	terminalSize: (): string => `${ESC}18t`,

	/** Query cursor position (returns ESC[row;colR) */
	cursorPosition: (): string => `${ESC}6n`,

	/** Query device attributes */
	deviceAttributes: (): string => `${ESC}c`,

	/** Query terminal status */
	terminalStatus: (): string => `${ESC}5n`,

	/** Query color palette (OSC 4) */
	colorPalette: (index: number): string => `${OSC}4;${index};?${BEL}`,

	/** Query foreground color (OSC 10) */
	foregroundColor: (): string => `${OSC}10;?${BEL}`,

	/** Query background color (OSC 11) */
	backgroundColor: (): string => `${OSC}11;?${BEL}`,
} as const;

/**
 * Hyperlink sequences (OSC 8)
 */
export const Hyperlink = {
	/** Create a hyperlink */
	create: (url: string, text: string, params: Record<string, string> = {}): string => {
		const paramStr = Object.entries(params)
			.map(([k, v]) => `${k}=${v}`)
			.join(':');
		const id = paramStr ? `id=${paramStr}:` : '';
		return `${OSC}8;${id}${url}${BEL}${text}${OSC}8;;${BEL}`;
	},
} as const;

/**
 * Window title and icon sequences
 */
export const Window = {
	/** Set window title */
	setTitle: (title: string): string => `${OSC}2;${title}${BEL}`,

	/** Set icon name */
	setIconName: (name: string): string => `${OSC}1;${name}${BEL}`,

	/** Set both title and icon */
	setTitleAndIcon: (title: string): string => `${OSC}0;${title}${BEL}`,
} as const;

/**
 * Bell and notification sequences
 */
export const Notification = {
	/** Ring the bell */
	bell: (): string => BEL,

	/** Send notification (OSC 777 or OSC 9) */
	notify: (title: string, body: string): string => `${OSC}9;${title}: ${body}${BEL}`,
} as const;

/**
 * ANSI class providing static methods for generating escape sequences
 */
export class ANSI {
	/** Escape character */
	static readonly ESC = ESC;

	/** OSC character */
	static readonly OSC = OSC;

	/** BEL character */
	static readonly BEL = BEL;

	/** ST character */
	static readonly ST = ST;

	/** Cursor movement sequences */
	static readonly Cursor = Cursor;

	/** Screen clearing sequences */
	static readonly Screen = Screen;

	/** Text styling functions */
	static readonly Text = Text;

	/** 16-color functions */
	static readonly Colors16 = Colors16;

	/** 256-color functions */
	static readonly Colors256 = Colors256;

	/** TrueColor functions */
	static readonly TrueColor = TrueColor;

	/** Screen mode sequences */
	static readonly Modes = Modes;

	/** Query sequences */
	static readonly Queries = Queries;

	/** Hyperlink sequences */
	static readonly Hyperlink = Hyperlink;

	/** Window control sequences */
	static readonly Window = Window;

	/** Notification sequences */
	static readonly Notification = Notification;

	/** Style codes */
	static readonly Style = Style;

	/** Color codes */
	static readonly Color = Color;

	/**
	 * Move cursor to absolute position
	 */
	static moveCursor(x: number, y: number): string {
		return Cursor.to(x, y);
	}

	/**
	 * Clear the entire screen
	 */
	static clearScreen(): string {
		return Screen.clear();
	}

	/**
	 * Clear the current line
	 */
	static clearLine(): string {
		return Screen.clearLine();
	}

	/**
	 * Hide cursor
	 */
	static hideCursor(): string {
		return Cursor.hide();
	}

	/**
	 * Show cursor
	 */
	static showCursor(): string {
		return Cursor.show();
	}

	/**
	 * Set text color (16-color mode)
	 */
	static setColor(color: number): string {
		return Colors16.foreground(color);
	}

	/**
	 * Set text color (256-color mode)
	 */
	static setColor256(color: number): string {
		return Colors256.foreground(color);
	}

	/**
	 * Set text color (TrueColor RGB mode)
	 */
	static setTrueColor(r: number, g: number, b: number): string {
		return TrueColor.foreground(r, g, b);
	}

	/**
	 * Reset all text attributes
	 */
	static reset(): string {
		return Text.reset();
	}

	/**
	 * Enable alternate screen buffer
	 */
	static enableAlternateScreen(): string {
		return Modes.enableAlternateScreen();
	}

	/**
	 * Disable alternate screen buffer
	 */
	static disableAlternateScreen(): string {
		return Modes.disableAlternateScreen();
	}

	/**
	 * Enable mouse tracking with SGR mode
	 */
	static enableMouse(): string {
		return Modes.enableMouseSGRAll();
	}

	/**
	 * Disable all mouse tracking
	 */
	static disableMouse(): string {
		return Modes.disableMouseAll();
	}

	/**
	 * Enable bracketed paste mode
	 */
	static enableBracketedPaste(): string {
		return Modes.enableBracketedPaste();
	}

	/**
	 * Disable bracketed paste mode
	 */
	static disableBracketedPaste(): string {
		return Modes.disableBracketedPaste();
	}

	/**
	 * Enable focus events
	 */
	static enableFocusEvents(): string {
		return Modes.enableFocusEvents();
	}

	/**
	 * Disable focus events
	 */
	static disableFocusEvents(): string {
		return Modes.disableFocusEvents();
	}

	/**
	 * Create a hyperlink
	 */
	static hyperlink(url: string, text: string, params?: Record<string, string>): string {
		return Hyperlink.create(url, text, params);
	}

	/**
	 * Set window title
	 */
	static setTitle(title: string): string {
		return Window.setTitle(title);
	}
}