/**
 * Canvas Module
 *
 * Provides a canvas-like abstraction for drawing operations in the terminal.
 * Supports coordinate transformations, clipping regions, and basic drawing primitives.
 *
 * @module visualization/canvas
 */

import type {Color, CellStyles} from '../rendering/cell.js';
import {createCell} from '../rendering/cell.js';
import type {ScreenBuffer} from '../rendering/buffer.js';
import type {Rect, Position} from '../layout/types.js';

/**
 * Clipping region for canvas operations
 */
export interface ClipRegion {
	/** Left coordinate (inclusive) */
	x: number;

	/** Top coordinate (inclusive) */
	y: number;

	/** Width of clip region */
	width: number;

	/** Height of clip region */
	height: number;
}

/**
 * Canvas transformation matrix
 */
export interface Transform {
	/** X translation */
	tx: number;

	/** Y translation */
	ty: number;

	/** X scale */
	sx: number;

	/** Y scale */
	sy: number;
}

/**
 * Drawing context for canvas operations
 */
export interface DrawContext {
	/** Current foreground color */
	fg: Color;

	/** Current background color */
	bg: Color;

	/** Current text styles */
	styles: CellStyles;
}

/**
 * Canvas class for drawing operations
 *
 * Provides a canvas-like abstraction layer over the terminal screen buffer.
 * Supports coordinate transformations, clipping regions, and basic drawing primitives.
 */
export class Canvas {
	/** The underlying screen buffer */
	private buffer: ScreenBuffer;

	/** Current clipping region stack */
	private clipStack: ClipRegion[] = [];

	/** Current transformation stack */
	private transformStack: Transform[] = [];

	/** Current drawing context */
	private context: DrawContext;

	/** Canvas bounds */
	private bounds: Rect;

	/**
	 * Create a new canvas
	 *
	 * @param buffer - The screen buffer to draw to
	 * @param bounds - The canvas bounds (defaults to buffer size)
	 */
	constructor(buffer: ScreenBuffer, bounds?: Rect) {
		this.buffer = buffer;
		this.bounds = bounds ?? {
			x: 0,
			y: 0,
			width: buffer.getWidth(),
			height: buffer.getHeight(),
		};
		this.context = {
			fg: 'default',
			bg: 'default',
			styles: {},
		};
	}

	/**
	 * Get canvas width
	 */
	get width(): number {
		return this.bounds.width;
	}

	/**
	 * Get canvas height
	 */
	get height(): number {
		return this.bounds.height;
	}

	/**
	 * Get canvas bounds
	 */
	getBounds(): Rect {
		return {...this.bounds};
	}

	/**
	 * Set the drawing context
	 *
	 * @param context - New drawing context
	 */
	setContext(context: Partial<DrawContext>): void {
		this.context = {
			...this.context,
			...context,
		};
	}

	/**
	 * Get current drawing context
	 */
	getContext(): DrawContext {
		return {...this.context};
	}

	/**
	 * Save current state (context, transform, clip)
	 */
	save(): void {
		// Save is handled by push operations on respective stacks
	}

	/**
	 * Restore previous state
	 */
	restore(): void {
		if (this.clipStack.length > 0) {
			this.clipStack.pop();
		}
		if (this.transformStack.length > 0) {
			this.transformStack.pop();
		}
	}

	/**
	 * Push a clipping region onto the stack
	 *
	 * @param region - Clip region to apply
	 */
	pushClip(region: ClipRegion): void {
		// Intersect with current clip if exists
		if (this.clipStack.length > 0) {
			const current = this.clipStack[this.clipStack.length - 1];
			const x = Math.max(current.x, region.x);
			const y = Math.max(current.y, region.y);
			const right = Math.min(current.x + current.width, region.x + region.width);
			const bottom = Math.min(current.y + current.height, region.y + region.height);
			this.clipStack.push({
				x,
				y,
				width: Math.max(0, right - x),
				height: Math.max(0, bottom - y),
			});
		} else {
			this.clipStack.push({...region});
		}
	}

	/**
	 * Pop the current clipping region
	 */
	popClip(): void {
		this.clipStack.pop();
	}

	/**
	 * Get current clipping region
	 */
	getCurrentClip(): ClipRegion | null {
		if (this.clipStack.length === 0) {
			return null;
		}
		return this.clipStack[this.clipStack.length - 1];
	}

	/**
	 * Push a transformation onto the stack
	 *
	 * @param transform - Transform to apply
	 */
	pushTransform(transform: Transform): void {
		if (this.transformStack.length > 0) {
			const current = this.transformStack[this.transformStack.length - 1];
			this.transformStack.push({
				tx: current.tx + transform.tx * current.sx,
				ty: current.ty + transform.ty * current.sy,
				sx: current.sx * transform.sx,
				sy: current.sy * transform.sy,
			});
		} else {
			this.transformStack.push({...transform});
		}
	}

	/**
	 * Pop the current transformation
	 */
	popTransform(): void {
		this.transformStack.pop();
	}

	/**
	 * Transform a point using the current transformation
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns Transformed position
	 */
	transformPoint(x: number, y: number): Position {
		if (this.transformStack.length === 0) {
			return {x, y};
		}
		const t = this.transformStack[this.transformStack.length - 1];
		return {
			x: Math.round(x * t.sx + t.tx),
			y: Math.round(y * t.sy + t.ty),
		};
	}

	/**
	 * Check if a point is within the clipping region
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns True if point is visible
	 */
	isVisible(x: number, y: number): boolean {
		// Check bounds
		if (
			x < this.bounds.x ||
			x >= this.bounds.x + this.bounds.width ||
			y < this.bounds.y ||
			y >= this.bounds.y + this.bounds.height
		) {
			return false;
		}

		// Check clip region
		const clip = this.getCurrentClip();
		if (clip) {
			if (
				x < clip.x ||
				x >= clip.x + clip.width ||
				y < clip.y ||
				y >= clip.y + clip.height
			) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Draw a single point (character)
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param char - Character to draw
	 * @param fg - Optional foreground color
	 * @param bg - Optional background color
	 */
	drawPoint(x: number, y: number, char: string, fg?: Color, bg?: Color): void {
		const pos = this.transformPoint(x, y);
		if (!this.isVisible(pos.x, pos.y)) {
			return;
		}

		const cell = createCell(char, fg ?? this.context.fg, bg ?? this.context.bg, {
			...this.context.styles,
		});
		this.buffer.setCell(pos.x, pos.y, cell);
	}

	/**
	 * Draw a line using Bresenham's algorithm
	 *
	 * @param x1 - Start X coordinate
	 * @param y1 - Start Y coordinate
	 * @param x2 - End X coordinate
	 * @param y2 - End Y coordinate
	 * @param char - Character to use for the line
	 * @param fg - Optional foreground color
	 */
	drawLine(x1: number, y1: number, x2: number, y2: number, char = '─', fg?: Color): void {
		const start = this.transformPoint(x1, y1);
		const end = this.transformPoint(x2, y2);

		const dx = Math.abs(end.x - start.x);
		const dy = Math.abs(end.y - start.y);
		const sx = start.x < end.x ? 1 : -1;
		const sy = start.y < end.y ? 1 : -1;
		let err = dx - dy;

		let x = start.x;
		let y = start.y;

		while (true) {
			if (this.isVisible(x, y)) {
				const cell = createCell(char, fg ?? this.context.fg, this.context.bg, {
					...this.context.styles,
				});
				this.buffer.setCell(x, y, cell);
			}

			if (x === end.x && y === end.y) {
				break;
			}

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

	/**
	 * Draw a rectangle
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param width - Rectangle width
	 * @param height - Rectangle height
	 * @param filled - Whether to fill the rectangle
	 * @param fg - Optional foreground color
	 * @param bg - Optional background color
	 */
	drawRect(
		x: number,
		y: number,
		width: number,
		height: number,
		filled = false,
		fg?: Color,
		bg?: Color,
	): void {
		const pos = this.transformPoint(x, y);
		const w = Math.round(width * (this.transformStack.length > 0 ? this.transformStack[this.transformStack.length - 1].sx : 1));
		const h = Math.round(height * (this.transformStack.length > 0 ? this.transformStack[this.transformStack.length - 1].sy : 1));

		const foreground = fg ?? this.context.fg;
		const background = bg ?? this.context.bg;

		for (let row = 0; row < h; row++) {
			for (let col = 0; col < w; col++) {
				const px = pos.x + col;
				const py = pos.y + row;

				if (!this.isVisible(px, py)) {
					continue;
				}

				let char: string;
				if (filled) {
					char = ' ';
				} else if (row === 0 && col === 0) {
					char = '┌';
				} else if (row === 0 && col === w - 1) {
					char = '┐';
				} else if (row === h - 1 && col === 0) {
					char = '└';
				} else if (row === h - 1 && col === w - 1) {
					char = '┘';
				} else if (row === 0 || row === h - 1) {
					char = '─';
				} else if (col === 0 || col === w - 1) {
					char = '│';
				} else {
					continue; // Empty interior for non-filled
				}

				const cell = createCell(char, foreground, background, {
					...this.context.styles,
				});
				this.buffer.setCell(px, py, cell);
			}
		}
	}

	/**
	 * Draw text
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param text - Text to draw
	 * @param fg - Optional foreground color
	 * @param bg - Optional background color
	 * @param maxWidth - Maximum width to draw
	 */
	drawText(x: number, y: number, text: string, fg?: Color, bg?: Color, maxWidth?: number): void {
		const pos = this.transformPoint(x, y);
		if (!this.isVisible(pos.x, pos.y)) {
			return;
		}

		const foreground = fg ?? this.context.fg;
		const background = bg ?? this.context.bg;
		const chars = Array.from(text);
		const limit = maxWidth ?? chars.length;

		for (let i = 0; i < Math.min(chars.length, limit); i++) {
			const px = pos.x + i;
			if (!this.isVisible(px, pos.y)) {
				continue;
			}

			const cell = createCell(chars[i], foreground, background, {
				...this.context.styles,
			});
			this.buffer.setCell(px, pos.y, cell);
		}
	}

	/**
	 * Clear the canvas or a specific region
	 *
	 * @param region - Optional region to clear (defaults to entire canvas)
	 * @param bg - Optional background color
	 */
	clear(region?: Rect, bg?: Color): void {
		const background = bg ?? this.context.bg;
		const area = region ?? {
			x: this.bounds.x,
			y: this.bounds.y,
			width: this.bounds.width,
			height: this.bounds.height,
		};

		for (let y = area.y; y < area.y + area.height; y++) {
			for (let x = area.x; x < area.x + area.width; x++) {
				if (this.isVisible(x, y)) {
					const cell = createCell(' ', 'default', background, {});
					this.buffer.setCell(x, y, cell);
				}
			}
		}
	}

	/**
	 * Fill a region with a character
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param width - Fill width
	 * @param height - Fill height
	 * @param char - Character to fill with
	 * @param fg - Optional foreground color
	 * @param bg - Optional background color
	 */
	fill(
		x: number,
		y: number,
		width: number,
		height: number,
		char: string,
		fg?: Color,
		bg?: Color,
	): void {
		const pos = this.transformPoint(x, y);
		const foreground = fg ?? this.context.fg;
		const background = bg ?? this.context.bg;

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const px = pos.x + col;
				const py = pos.y + row;

				if (this.isVisible(px, py)) {
					const cell = createCell(char, foreground, background, {
						...this.context.styles,
					});
					this.buffer.setCell(px, py, cell);
				}
			}
		}
	}

	/**
	 * Draw a horizontal line
	 *
	 * @param x - Start X coordinate
	 * @param y - Y coordinate
	 * @param width - Line width
	 * @param char - Character to use
	 * @param fg - Optional foreground color
	 */
	hLine(x: number, y: number, width: number, char = '─', fg?: Color): void {
		this.drawLine(x, y, x + width - 1, y, char, fg);
	}

	/**
	 * Draw a vertical line
	 *
	 * @param x - X coordinate
	 * @param y - Start Y coordinate
	 * @param height - Line height
	 * @param char - Character to use
	 * @param fg - Optional foreground color
	 */
	vLine(x: number, y: number, height: number, char = '│', fg?: Color): void {
		this.drawLine(x, y, x, y + height - 1, char, fg);
	}
}
