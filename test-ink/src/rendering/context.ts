/**
 * Render Context Module
 *
 * This module provides the RenderContext interface and implementation for managing
 * rendering state including the current buffer, cursor position, active styles,
 * and clipping regions. It provides methods for drawing text, lines, rectangles, etc.
 *
 * @module rendering/context
 */

import {Cell, Color, CellStyles, createCell, cloneCell} from './cell.js';
import {ScreenBuffer} from './buffer.js';

/**
 * Rectangle definition
 */
export interface Rect {
	/** X position */
	x: number;

	/** Y position */
	y: number;

	/** Width */
	width: number;

	/** Height */
	height: number;
}

/**
 * Point definition
 */
export interface Point {
	/** X coordinate */
	x: number;

	/** Y coordinate */
	y: number;
}

/**
 * Clipping region
 */
export interface ClipRegion extends Rect {
	/** Whether clipping is enabled */
	enabled: boolean;
}

/**
 * Render context state
 */
export interface RenderContextState {
	/** Current foreground color */
	fg: Color;

	/** Current background color */
	bg: Color;

	/** Current styles */
	styles: CellStyles;

	/** Current cursor X position */
	cursorX: number;

	/** Current cursor Y position */
	cursorY: number;

	/** Clipping region stack */
	clipStack: ClipRegion[];
}

/**
 * RenderContext provides a high-level API for drawing to a screen buffer.
 * It manages state like colors, styles, cursor position, and clipping regions.
 */
export interface RenderContext {
	/** The underlying screen buffer */
	readonly buffer: ScreenBuffer;

	/** Current foreground color */
	readonly fg: Color;

	/** Current background color */
	readonly bg: Color;

	/** Current styles */
	readonly styles: CellStyles;

	/** Current cursor X position */
	readonly cursorX: number;

	/** Current cursor Y position */
	readonly cursorY: number;

	/** Current clipping region (if any) */
	readonly clipRegion: ClipRegion | null;

	/**
	 * Set foreground color
	 * @param color - New foreground color
	 */
	setFg(color: Color): void;

	/**
	 * Set background color
	 * @param color - New background color
	 */
	setBg(color: Color): void;

	/**
	 * Set both foreground and background colors
	 * @param fg - Foreground color
	 * @param bg - Background color
	 */
	setColors(fg: Color, bg: Color): void;

	/**
	 * Set styles
	 * @param styles - Style flags to set
	 */
	setStyles(styles: CellStyles): void;

	/**
	 * Add styles (merge with existing)
	 * @param styles - Style flags to add
	 */
	addStyles(styles: CellStyles): void;

	/**
	 * Remove styles
	 * @param styles - Style flags to remove
	 */
	removeStyles(styles: Partial<Record<keyof CellStyles, boolean>>): void;

	/**
	 * Reset all styles to default
	 */
	resetStyles(): void;

	/**
	 * Move cursor to position
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 */
	moveTo(x: number, y: number): void;

	/**
	 * Move cursor relative to current position
	 * @param dx - Delta X
	 * @param dy - Delta Y
	 */
	moveBy(dx: number, dy: number): void;

	/**
	 * Push a clipping region onto the stack
	 * @param rect - Clipping rectangle
	 */
	pushClip(rect: Rect): void;

	/**
	 * Pop the current clipping region
	 */
	popClip(): void;

	/**
	 * Clear all clipping regions
	 */
	clearClip(): void;

	/**
	 * Check if a point is within the current clipping region
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 */
	isInClip(x: number, y: number): boolean;

	/**
	 * Draw a single character
	 * @param char - Character to draw
	 * @param x - X position (optional, uses cursor if not provided)
	 * @param y - Y position (optional, uses cursor if not provided)
	 */
	drawChar(char: string, x?: number, y?: number): void;

	/**
	 * Draw text
	 * @param text - Text to draw
	 * @param x - X position (optional, uses cursor if not provided)
	 * @param y - Y position (optional, uses cursor if not provided)
	 */
	drawText(text: string, x?: number, y?: number): void;

	/**
	 * Draw a horizontal line
	 * @param x - Start X
	 * @param y - Y position
	 * @param width - Line width
	 * @param char - Character to use (default: '─')
	 */
	drawHLine(x: number, y: number, width: number, char?: string): void;

	/**
	 * Draw a vertical line
	 * @param x - X position
	 * @param y - Start Y
	 * @param height - Line height
	 * @param char - Character to use (default: '│')
	 */
	drawVLine(x: number, y: number, height: number, char?: string): void;

	/**
	 * Draw a line between two points
	 * @param x1 - Start X
	 * @param y1 - Start Y
	 * @param x2 - End X
	 * @param y2 - End Y
	 * @param char - Character to use (default: determined by angle)
	 */
	drawLine(x1: number, y1: number, x2: number, y2: number, char?: string): void;

	/**
	 * Draw a rectangle outline
	 * @param rect - Rectangle dimensions
	 * @param chars - Characters to use for borders (default: box drawing)
	 */
	drawRect(rect: Rect, chars?: BoxDrawingChars): void;

	/**
	 * Fill a rectangular area
	 * @param rect - Rectangle dimensions
	 * @param char - Fill character (default: ' ')
	 */
	fillRect(rect: Rect, char?: string): void;

	/**
	 * Clear a rectangular area
	 * @param rect - Rectangle dimensions
	 */
	clearRect(rect: Rect): void;

	/**
	 * Save current state
	 */
	save(): void;

	/**
	 * Restore previously saved state
	 */
	restore(): void;

	/**
	 * Get current state snapshot
	 */
	getState(): RenderContextState;

	/**
	 * Set state from snapshot
	 * @param state - State to restore
	 */
	setState(state: RenderContextState): void;
}

/**
 * Box drawing characters
 */
export interface BoxDrawingChars {
	topLeft: string;
	topRight: string;
	bottomLeft: string;
	bottomRight: string;
	horizontal: string;
	vertical: string;
}

/**
 * Default box drawing characters (single line)
 */
export const DEFAULT_BOX_CHARS: BoxDrawingChars = {
	topLeft: '┌',
	topRight: '┐',
	bottomLeft: '└',
	bottomRight: '┘',
	horizontal: '─',
	vertical: '│',
};

/**
 * Double line box drawing characters
 */
export const DOUBLE_BOX_CHARS: BoxDrawingChars = {
	topLeft: '╔',
	topRight: '╗',
	bottomLeft: '╚',
	bottomRight: '╝',
	horizontal: '═',
	vertical: '║',
};

/**
 * Rounded box drawing characters
 */
export const ROUNDED_BOX_CHARS: BoxDrawingChars = {
	topLeft: '╭',
	topRight: '╮',
	bottomLeft: '╰',
	bottomRight: '╯',
	horizontal: '─',
	vertical: '│',
};

/**
 * Render context implementation
 */
class RenderContextImpl implements RenderContext {
	readonly buffer: ScreenBuffer;

	private _fg: Color = 'default';
	private _bg: Color = 'default';
	private _styles: CellStyles = {};
	private _cursorX = 0;
	private _cursorY = 0;
	private _clipStack: ClipRegion[] = [];
	private _stateStack: RenderContextState[] = [];

	constructor(buffer: ScreenBuffer) {
		this.buffer = buffer;
	}

	get fg(): Color {
		return this._fg;
	}

	get bg(): Color {
		return this._bg;
	}

	get styles(): CellStyles {
		return {...this._styles};
	}

	get cursorX(): number {
		return this._cursorX;
	}

	get cursorY(): number {
		return this._cursorY;
	}

	get clipRegion(): ClipRegion | null {
		if (this._clipStack.length === 0) return null;
		return this._clipStack[this._clipStack.length - 1];
	}

	setFg(color: Color): void {
		this._fg = color;
	}

	setBg(color: Color): void {
		this._bg = color;
	}

	setColors(fg: Color, bg: Color): void {
		this._fg = fg;
		this._bg = bg;
	}

	setStyles(styles: CellStyles): void {
		this._styles = {...styles};
	}

	addStyles(styles: CellStyles): void {
		this._styles = {...this._styles, ...styles};
	}

	removeStyles(styles: Partial<Record<keyof CellStyles, boolean>>): void {
		const newStyles = {...this._styles};
		for (const key of Object.keys(styles) as Array<keyof CellStyles>) {
			delete newStyles[key];
		}
		this._styles = newStyles;
	}

	resetStyles(): void {
		this._fg = 'default';
		this._bg = 'default';
		this._styles = {};
	}

	moveTo(x: number, y: number): void {
		this._cursorX = Math.max(0, Math.min(x, this.buffer.getWidth() - 1));
		this._cursorY = Math.max(0, Math.min(y, this.buffer.getHeight() - 1));
	}

	moveBy(dx: number, dy: number): void {
		this.moveTo(this._cursorX + dx, this._cursorY + dy);
	}

	pushClip(rect: Rect): void {
		// Intersect with existing clip region if present
		if (this._clipStack.length > 0) {
			const current = this._clipStack[this._clipStack.length - 1];
			rect = {
				x: Math.max(rect.x, current.x),
				y: Math.max(rect.y, current.y),
				width:
					Math.min(rect.x + rect.width, current.x + current.width) -
					Math.max(rect.x, current.x),
				height:
					Math.min(rect.y + rect.height, current.y + current.height) -
					Math.max(rect.y, current.y),
			};
		}

		this._clipStack.push({
			...rect,
			enabled: true,
		});
	}

	popClip(): void {
		this._clipStack.pop();
	}

	clearClip(): void {
		this._clipStack = [];
	}

	isInClip(x: number, y: number): boolean {
		if (this._clipStack.length === 0) return true;

		const clip = this._clipStack[this._clipStack.length - 1];
		return (
			x >= clip.x &&
			x < clip.x + clip.width &&
			y >= clip.y &&
			y < clip.y + clip.height
		);
	}

	drawChar(char: string, x?: number, y?: number): void {
		const px = x ?? this._cursorX;
		const py = y ?? this._cursorY;

		if (!this.isInClip(px, py)) return;

		const cell = createCell(char, this._fg, this._bg, this._styles);
		this.buffer.setCell(px, py, cell);

		// Advance cursor
		if (x === undefined && y === undefined) {
			this._cursorX += cell.width;
		}
	}

	drawText(text: string, x?: number, y?: number): void {
		let px = x ?? this._cursorX;
		const py = y ?? this._cursorY;

		for (const char of text) {
			if (!this.isInClip(px, py)) {
				px += 1; // Still advance even if clipped
				continue;
			}

			const cell = createCell(char, this._fg, this._bg, this._styles);
			this.buffer.setCell(px, py, cell);
			px += cell.width;
		}

		// Update cursor if using default position
		if (x === undefined && y === undefined) {
			this._cursorX = px;
		}
	}

	drawHLine(x: number, y: number, width: number, char = '─'): void {
		for (let i = 0; i < width; i++) {
			this.drawChar(char, x + i, y);
		}
	}

	drawVLine(x: number, y: number, height: number, char = '│'): void {
		for (let i = 0; i < height; i++) {
			this.drawChar(char, x, y + i);
		}
	}

	drawLine(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		char?: string,
	): void {
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = x1 < x2 ? 1 : -1;
		const sy = y1 < y2 ? 1 : -1;
		let err = dx - dy;

		let x = x1;
		let y = y1;

		while (true) {
			// Determine character based on line angle if not specified
			let lineChar = char;
			if (!lineChar) {
				if (dx === 0) lineChar = '│';
				else if (dy === 0) lineChar = '─';
				else if ((x2 - x1) * (y2 - y1) > 0) lineChar = '╱';
				else lineChar = '╲';
			}

			this.drawChar(lineChar, x, y);

			if (x === x2 && y === y2) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
		}
	}

	drawRect(rect: Rect, chars: BoxDrawingChars = DEFAULT_BOX_CHARS): void {
		const {x, y, width, height} = rect;

		if (width < 2 || height < 2) return;

		// Corners
		this.drawChar(chars.topLeft, x, y);
		this.drawChar(chars.topRight, x + width - 1, y);
		this.drawChar(chars.bottomLeft, x, y + height - 1);
		this.drawChar(chars.bottomRight, x + width - 1, y + height - 1);

		// Horizontal lines
		for (let i = 1; i < width - 1; i++) {
			this.drawChar(chars.horizontal, x + i, y);
			this.drawChar(chars.horizontal, x + i, y + height - 1);
		}

		// Vertical lines
		for (let i = 1; i < height - 1; i++) {
			this.drawChar(chars.vertical, x, y + i);
			this.drawChar(chars.vertical, x + width - 1, y + i);
		}
	}

	fillRect(rect: Rect, char = ' '): void {
		const {x, y, width, height} = rect;

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				this.drawChar(char, x + col, y + row);
			}
		}
	}

	clearRect(rect: Rect): void {
		const {x, y, width, height} = rect;

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const px = x + col;
				const py = y + row;

				if (this.isInClip(px, py)) {
					this.buffer.clearCell(px, py);
				}
			}
		}
	}

	save(): void {
		this._stateStack.push(this.getState());
	}

	restore(): void {
		const state = this._stateStack.pop();
		if (state) {
			this.setState(state);
		}
	}

	getState(): RenderContextState {
		return {
			fg: cloneColor(this._fg),
			bg: cloneColor(this._bg),
			styles: {...this._styles},
			cursorX: this._cursorX,
			cursorY: this._cursorY,
			clipStack: this._clipStack.map(clip => ({...clip})),
		};
	}

	setState(state: RenderContextState): void {
		this._fg = cloneColor(state.fg);
		this._bg = cloneColor(state.bg);
		this._styles = {...state.styles};
		this._cursorX = state.cursorX;
		this._cursorY = state.cursorY;
		this._clipStack = state.clipStack.map(clip => ({...clip}));
	}
}

/**
 * Clone a color value
 */
function cloneColor(color: Color): Color {
	if (typeof color === 'object') {
		if ('rgb' in color) {
			return {rgb: [...color.rgb] as [number, number, number]};
		}
		return {index: color.index};
	}
	return color;
}

/**
 * Create a new render context
 *
 * @param buffer - Screen buffer to render to
 * @returns New render context
 */
export function createRenderContext(buffer: ScreenBuffer): RenderContext {
	return new RenderContextImpl(buffer);
}
