/**
 * Screen Cell Module
 *
 * This module defines the Cell interface and utility functions for managing
 * individual screen positions in the TUI framework. Each cell represents
 * a single character position with styling information.
 *
 * @module rendering/cell
 */

/**
 * Style flags for cell formatting
 */
export interface CellStyles {
	/** Bold text */
	bold?: boolean;

	/** Dim/faint text */
	dim?: boolean;

	/** Italic text */
	italic?: boolean;

	/** Underlined text */
	underline?: boolean;

	/** Blinking text */
	blink?: boolean;

	/** Reverse video (swap foreground/background) */
	reverse?: boolean;

	/** Hidden/invisible text */
	hidden?: boolean;

	/** Strikethrough text */
	strikethrough?: boolean;
}

/**
 * RGB color tuple [r, g, b]
 */
export type RGBColor = [number, number, number];

/**
 * Color value - can be a named color, 256-color index, or RGB tuple
 */
export type Color =
	| 'default'
	| 'black'
	| 'red'
	| 'green'
	| 'yellow'
	| 'blue'
	| 'magenta'
	| 'cyan'
	| 'white'
	| 'gray'
	| 'brightBlack'
	| 'brightRed'
	| 'brightGreen'
	| 'brightYellow'
	| 'brightBlue'
	| 'brightMagenta'
	| 'brightCyan'
	| 'brightWhite'
	| {index: number}
	| {rgb: RGBColor};

/**
 * Cell interface representing a single screen position
 */
export interface Cell {
	/** Character to display (can be multi-byte Unicode) */
	char: string;

	/** Foreground color */
	fg: Color;

	/** Background color */
	bg: Color;

	/** Style flags */
	styles: CellStyles;

	/** Width of the character in terminal columns (1 or 2 for wide chars) */
	width: number;
}

/**
 * Default cell representing an empty/reset cell
 */
export const DEFAULT_CELL: Readonly<Cell> = Object.freeze({
	char: ' ',
	fg: 'default',
	bg: 'default',
	styles: {},
	width: 1,
});

/**
 * Check if two colors are equal
 *
 * @param a - First color
 * @param b - Second color
 * @returns True if colors are equal
 */
export function colorsEqual(a: Color, b: Color): boolean {
	if (a === b) return true;

	if (typeof a === 'object' && typeof b === 'object') {
		if ('index' in a && 'index' in b) {
			return a.index === b.index;
		}

		if ('rgb' in a && 'rgb' in b) {
			return (
				a.rgb[0] === b.rgb[0] && a.rgb[1] === b.rgb[1] && a.rgb[2] === b.rgb[2]
			);
		}
	}

	return false;
}

/**
 * Check if two style objects are equal
 *
 * @param a - First styles
 * @param b - Second styles
 * @returns True if styles are equal
 */
export function stylesEqual(a: CellStyles, b: CellStyles): boolean {
	if (a === b) return true;

	return (
		a.bold === b.bold &&
		a.dim === b.dim &&
		a.italic === b.italic &&
		a.underline === b.underline &&
		a.blink === b.blink &&
		a.reverse === b.reverse &&
		a.hidden === b.hidden &&
		a.strikethrough === b.strikethrough
	);
}

/**
 * Check if two cells are equal (deep equality)
 *
 * @param a - First cell
 * @param b - Second cell
 * @returns True if cells are equal
 */
export function cellsEqual(a: Cell | undefined, b: Cell | undefined): boolean {
	if (a === b) return true;
	if (!a || !b) return false;

	return (
		a.char === b.char &&
		a.width === b.width &&
		colorsEqual(a.fg, b.fg) &&
		colorsEqual(a.bg, b.bg) &&
		stylesEqual(a.styles, b.styles)
	);
}

/**
 * Clone a cell (deep copy)
 *
 * @param cell - Cell to clone
 * @returns New cell with copied values
 */
export function cloneCell(cell: Cell): Cell {
	return {
		char: cell.char,
		fg: cloneColor(cell.fg),
		bg: cloneColor(cell.bg),
		styles: {...cell.styles},
		width: cell.width,
	};
}

/**
 * Clone a color value
 *
 * @param color - Color to clone
 * @returns Cloned color
 */
function cloneColor(color: Color): Color {
	if (typeof color === 'object') {
		if ('rgb' in color) {
			return {rgb: [...color.rgb] as RGBColor};
		}
		return {index: color.index};
	}
	return color;
}

/**
 * Merge cells - inherit properties from parent cell where child has defaults
 *
 * @param parent - Parent/base cell
 * @param child - Child/overlay cell
 * @returns Merged cell
 */
export function mergeCells(parent: Cell, child: Cell): Cell {
	return {
		char: child.char,
		fg: child.fg === 'default' ? parent.fg : child.fg,
		bg: child.bg === 'default' ? parent.bg : child.bg,
		styles: {
			bold: child.styles.bold ?? parent.styles.bold,
			dim: child.styles.dim ?? parent.styles.dim,
			italic: child.styles.italic ?? parent.styles.italic,
			underline: child.styles.underline ?? parent.styles.underline,
			blink: child.styles.blink ?? parent.styles.blink,
			reverse: child.styles.reverse ?? parent.styles.reverse,
			hidden: child.styles.hidden ?? parent.styles.hidden,
			strikethrough: child.styles.strikethrough ?? parent.styles.strikethrough,
		},
		width: child.width,
	};
}

/**
 * Create a new cell with specified properties
 *
 * @param char - Character (default: space)
 * @param fg - Foreground color (default: 'default')
 * @param bg - Background color (default: 'default')
 * @param styles - Style flags (default: {})
 * @returns New cell
 */
export function createCell(
	char = ' ',
	fg: Color = 'default',
	bg: Color = 'default',
	styles: CellStyles = {},
): Cell {
	// Calculate width for Unicode characters
	const codePoint = char.codePointAt(0) ?? 0;
	const width = isWideChar(codePoint) ? 2 : 1;

	return {
		char,
		fg,
		bg,
		styles: {...styles},
		width,
	};
}

/**
 * Check if a Unicode code point is a wide character (takes 2 columns)
 *
 * @param codePoint - Unicode code point
 * @returns True if the character is wide
 */
function isWideChar(codePoint: number): boolean {
	// CJK Unified Ideographs
	if (codePoint >= 0x4e00 && codePoint <= 0x9fff) return true;
	// CJK Unified Ideographs Extension A
	if (codePoint >= 0x3400 && codePoint <= 0x4dbf) return true;
	// Hangul Syllables
	if (codePoint >= 0xac00 && codePoint <= 0xd7af) return true;
	// Fullwidth ASCII variants
	if (codePoint >= 0xff01 && codePoint <= 0xff5e) return true;
	// Halfwidth Katakana
	if (codePoint >= 0xff65 && codePoint <= 0xff9f) return true;
	// Japanese punctuation
	if (codePoint >= 0x3000 && codePoint <= 0x303f) return true;
	// Hiragana
	if (codePoint >= 0x3040 && codePoint <= 0x309f) return true;
	// Katakana
	if (codePoint >= 0x30a0 && codePoint <= 0x30ff) return true;
	// Box drawing and block elements
	if (codePoint >= 0x2500 && codePoint <= 0x257f) return true;
	if (codePoint >= 0x2580 && codePoint <= 0x259f) return true;

	return false;
}

/**
 * Reset a cell to default values (mutates in place)
 *
 * @param cell - Cell to reset
 */
export function resetCell(cell: Cell): void {
	cell.char = ' ';
	cell.fg = 'default';
	cell.bg = 'default';
	cell.styles = {};
	cell.width = 1;
}

/**
 * Copy cell properties from source to target (mutates target)
 *
 * @param target - Target cell to modify
 * @param source - Source cell to copy from
 */
export function copyCell(target: Cell, source: Cell): void {
	target.char = source.char;
	target.fg = cloneColor(source.fg);
	target.bg = cloneColor(source.bg);
	target.styles = {...source.styles};
	target.width = source.width;
}
