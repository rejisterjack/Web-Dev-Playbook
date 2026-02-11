/**
 * Drawing Primitives Module
 *
 * This module provides high-level drawing functions using the RenderContext.
 * It includes functions for drawing text, lines, boxes, fills, progress bars,
 * and other common UI elements.
 *
 * @module rendering/primitives
 */

import {
	RenderContext,
	Rect,
	Point,
	BoxDrawingChars,
	DEFAULT_BOX_CHARS,
	DOUBLE_BOX_CHARS,
	ROUNDED_BOX_CHARS,
} from './context.js';
import {Color, CellStyles} from './cell.js';

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Text wrapping options
 */
export interface TextWrapOptions {
	/** Maximum width for wrapping */
	maxWidth: number;

	/** Whether to break words */
	breakWords?: boolean;

	/** Continuation character for wrapped lines */
	continuationChar?: string;
}

/**
 * Progress bar options
 */
export interface ProgressBarOptions {
	/** Width of the progress bar */
	width: number;

	/** Progress value (0-1) */
	progress: number;

	/** Character for filled portion */
	fillChar?: string;

	/** Character for empty portion */
	emptyChar?: string;

	/** Foreground color for filled portion */
	fillColor?: Color;

	/** Foreground color for empty portion */
	emptyColor?: Color;

	/** Show percentage text */
	showPercentage?: boolean;

	/** Percentage text position */
	percentagePosition?: 'left' | 'right' | 'center' | 'none';
}

/**
 * Shadow options for boxes
 */
export interface ShadowOptions {
	/** Shadow offset X */
	offsetX?: number;

	/** Shadow offset Y */
	offsetY?: number;

	/** Shadow color */
	color?: Color;

	/** Shadow character */
	char?: string;
}

/**
 * Draw text at a position with optional styling
 *
 * @param ctx - Render context
 * @param text - Text to draw
 * @param x - X position
 * @param y - Y position
 * @param options - Optional styling
 */
export function drawText(
	ctx: RenderContext,
	text: string,
	x: number,
	y: number,
	options?: {
		fg?: Color;
		bg?: Color;
		styles?: CellStyles;
	},
): void {
	if (options) {
		ctx.save();
		if (options.fg) ctx.setFg(options.fg);
		if (options.bg) ctx.setBg(options.bg);
		if (options.styles) ctx.setStyles(options.styles);
	}

	ctx.moveTo(x, y);
	ctx.drawText(text);

	if (options) {
		ctx.restore();
	}
}

/**
 * Draw aligned text within a width
 *
 * @param ctx - Render context
 * @param text - Text to draw
 * @param x - X position (start of area)
 * @param y - Y position
 * @param width - Width of area
 * @param align - Text alignment
 * @param options - Optional styling
 */
export function drawAlignedText(
	ctx: RenderContext,
	text: string,
	x: number,
	y: number,
	width: number,
	align: TextAlign = 'left',
	options?: {
		fg?: Color;
		bg?: Color;
		styles?: CellStyles;
	},
): void {
	// Truncate if too long
	let displayText = text;
	if (text.length > width) {
		displayText = text.slice(0, width - 1) + '…';
	}

	// Calculate position based on alignment
	let startX = x;
	if (align === 'center') {
		startX = x + Math.floor((width - displayText.length) / 2);
	} else if (align === 'right') {
		startX = x + width - displayText.length;
	}

	drawText(ctx, displayText, startX, y, options);
}

/**
 * Draw a horizontal line
 *
 * @param ctx - Render context
 * @param x - Start X
 * @param y - Y position
 * @param width - Line width
 * @param char - Character to use (default: '─')
 * @param color - Optional color
 */
export function drawLine(
	ctx: RenderContext,
	x: number,
	y: number,
	width: number,
	char = '─',
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	ctx.drawHLine(x, y, width, char);

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a vertical line
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Start Y
 * @param height - Line height
 * @param char - Character to use (default: '│')
 * @param color - Optional color
 */
export function drawVLine(
	ctx: RenderContext,
	x: number,
	y: number,
	height: number,
	char = '│',
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	ctx.drawVLine(x, y, height, char);

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a line between two points
 *
 * @param ctx - Render context
 * @param x1 - Start X
 * @param y1 - Start Y
 * @param x2 - End X
 * @param y2 - End Y
 * @param char - Character to use (default: auto-detected)
 * @param color - Optional color
 */
export function drawLineBetween(
	ctx: RenderContext,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	char?: string,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	ctx.drawLine(x1, y1, x2, y2, char);

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a box/border
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 * @param chars - Box drawing characters (default: single line)
 * @param color - Optional border color
 */
export function drawBox(
	ctx: RenderContext,
	rect: Rect,
	chars: BoxDrawingChars = DEFAULT_BOX_CHARS,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	ctx.drawRect(rect, chars);

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a box with double lines
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 * @param color - Optional border color
 */
export function drawDoubleBox(
	ctx: RenderContext,
	rect: Rect,
	color?: Color,
): void {
	drawBox(ctx, rect, DOUBLE_BOX_CHARS, color);
}

/**
 * Draw a box with rounded corners
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 * @param color - Optional border color
 */
export function drawRoundedBox(
	ctx: RenderContext,
	rect: Rect,
	color?: Color,
): void {
	drawBox(ctx, rect, ROUNDED_BOX_CHARS, color);
}

/**
 * Fill a rectangular area with a character and colors
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 * @param char - Fill character (default: ' ')
 * @param fg - Foreground color
 * @param bg - Background color
 */
export function drawFill(
	ctx: RenderContext,
	rect: Rect,
	char = ' ',
	fg?: Color,
	bg?: Color,
): void {
	ctx.save();

	if (fg) ctx.setFg(fg);
	if (bg) ctx.setBg(bg);

	ctx.fillRect(rect, char);

	ctx.restore();
}

/**
 * Clear a rectangular area
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 */
export function drawClear(ctx: RenderContext, rect: Rect): void {
	ctx.clearRect(rect);
}

/**
 * Draw a progress bar
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param options - Progress bar options
 */
export function drawProgressBar(
	ctx: RenderContext,
	x: number,
	y: number,
	options: ProgressBarOptions,
): void {
	const {
		width,
		progress,
		fillChar = '█',
		emptyChar = '░',
		fillColor,
		emptyColor,
		showPercentage = false,
		percentagePosition = 'right',
	} = options;

	// Clamp progress to 0-1
	const clampedProgress = Math.max(0, Math.min(1, progress));

	// Calculate bar width
	let barWidth = width;
	let percentageText = '';

	if (showPercentage) {
		percentageText = `${Math.round(clampedProgress * 100)}%`;

		if (percentagePosition === 'left') {
			drawText(ctx, percentageText + ' ', x, y);
			x += percentageText.length + 1;
			barWidth -= percentageText.length + 1;
		} else if (percentagePosition === 'right') {
			barWidth -= percentageText.length + 1;
		}
	}

	// Draw filled portion
	const filledWidth = Math.round(barWidth * clampedProgress);

	if (fillColor) {
		ctx.save();
		ctx.setFg(fillColor);
	}

	for (let i = 0; i < filledWidth; i++) {
		ctx.drawChar(fillChar, x + i, y);
	}

	if (fillColor) {
		ctx.restore();
	}

	// Draw empty portion
	if (emptyColor) {
		ctx.save();
		ctx.setFg(emptyColor);
	}

	for (let i = filledWidth; i < barWidth; i++) {
		ctx.drawChar(emptyChar, x + i, y);
	}

	if (emptyColor) {
		ctx.restore();
	}

	// Draw percentage on right if requested
	if (showPercentage && percentagePosition === 'right') {
		drawText(ctx, ' ' + percentageText, x + barWidth, y);
	}
}

/**
 * Draw a shadow effect behind a rectangle
 *
 * @param ctx - Render context
 * @param rect - Rectangle to cast shadow from
 * @param options - Shadow options
 */
export function drawShadow(
	ctx: RenderContext,
	rect: Rect,
	options: ShadowOptions = {},
): void {
	const {offsetX = 1, offsetY = 1, color = 'black', char = '░'} = options;

	ctx.save();
	ctx.setFg(color);

	// Draw shadow on right side
	for (let y = 0; y < rect.height; y++) {
		ctx.drawChar(char, rect.x + rect.width + offsetX - 1, rect.y + y + offsetY);
	}

	// Draw shadow on bottom
	for (let x = 0; x < rect.width; x++) {
		ctx.drawChar(
			char,
			rect.x + x + offsetX,
			rect.y + rect.height + offsetY - 1,
		);
	}

	// Draw corner
	ctx.drawChar(
		char,
		rect.x + rect.width + offsetX - 1,
		rect.y + rect.height + offsetY - 1,
	);

	ctx.restore();
}

/**
 * Draw a box with shadow
 *
 * @param ctx - Render context
 * @param rect - Rectangle dimensions
 * @param chars - Box drawing characters
 * @param color - Border color
 * @param shadowOptions - Shadow options
 */
export function drawBoxWithShadow(
	ctx: RenderContext,
	rect: Rect,
	chars: BoxDrawingChars = DEFAULT_BOX_CHARS,
	color?: Color,
	shadowOptions?: ShadowOptions,
): void {
	drawShadow(ctx, rect, shadowOptions);
	drawBox(ctx, rect, chars, color);
}

/**
 * Draw a table/grid
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param columns - Column widths
 * @param rows - Number of rows
 * @param color - Border color
 */
export function drawGrid(
	ctx: RenderContext,
	x: number,
	y: number,
	columns: number[],
	rows: number,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	const totalWidth = columns.reduce((a, b) => a + b, 0) + columns.length + 1;
	const totalHeight = rows + 2;

	// Draw corners
	ctx.drawChar('┌', x, y);
	ctx.drawChar('┐', x + totalWidth - 1, y);
	ctx.drawChar('└', x, y + totalHeight - 1);
	ctx.drawChar('┘', x + totalWidth - 1, y + totalHeight - 1);

	// Draw horizontal lines
	let currentX = x + 1;
	for (let i = 0; i <= columns.length; i++) {
		const width = i < columns.length ? columns[i] : 0;

		// Top line
		for (let j = 0; j < width; j++) {
			ctx.drawChar('─', currentX + j, y);
		}

		// Bottom line
		for (let j = 0; j < width; j++) {
			ctx.drawChar('─', currentX + j, y + totalHeight - 1);
		}

		// Column separators
		if (i < columns.length) {
			ctx.drawChar('┬', currentX + width, y);
			ctx.drawChar('┴', currentX + width, y + totalHeight - 1);

			for (let row = 1; row < totalHeight - 1; row++) {
				ctx.drawChar('│', currentX + width, y + row);
			}
		}

		currentX += width + 1;
	}

	// Draw vertical lines for sides
	for (let row = 1; row < totalHeight - 1; row++) {
		ctx.drawChar('│', x, y + row);
		ctx.drawChar('│', x + totalWidth - 1, y + row);
	}

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a scroll bar
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param height - Scroll bar height
 * @param scrollTop - Current scroll position (0-1)
 * @param scrollHeight - Visible portion (0-1)
 * @param color - Scroll bar color
 * @param trackColor - Track color
 */
export function drawScrollBar(
	ctx: RenderContext,
	x: number,
	y: number,
	height: number,
	scrollTop: number,
	scrollHeight: number,
	color?: Color,
	trackColor?: Color,
): void {
	// Draw track
	if (trackColor) {
		ctx.save();
		ctx.setFg(trackColor);
	}

	for (let i = 0; i < height; i++) {
		ctx.drawChar('│', x, y + i);
	}

	if (trackColor) {
		ctx.restore();
	}

	// Draw thumb
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	const thumbHeight = Math.max(1, Math.round(height * scrollHeight));
	const thumbStart = Math.round((height - thumbHeight) * scrollTop);

	for (let i = 0; i < thumbHeight; i++) {
		ctx.drawChar('┃', x, y + thumbStart + i);
	}

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a checkbox
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param checked - Whether checked
 * @param label - Optional label
 * @param color - Color
 */
export function drawCheckbox(
	ctx: RenderContext,
	x: number,
	y: number,
	checked: boolean,
	label?: string,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	const boxChar = checked ? '☑' : '☐';
	ctx.drawChar(boxChar, x, y);

	if (label) {
		ctx.drawText(' ' + label, x + 2, y);
	}

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a radio button
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param selected - Whether selected
 * @param label - Optional label
 * @param color - Color
 */
export function drawRadioButton(
	ctx: RenderContext,
	x: number,
	y: number,
	selected: boolean,
	label?: string,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	const radioChar = selected ? '◉' : '○';
	ctx.drawChar(radioChar, x, y);

	if (label) {
		ctx.drawText(' ' + label, x + 2, y);
	}

	if (color) {
		ctx.restore();
	}
}

/**
 * Draw a separator line with optional label
 *
 * @param ctx - Render context
 * @param x - X position
 * @param y - Y position
 * @param width - Line width
 * @param label - Optional label
 * @param color - Line color
 */
export function drawSeparator(
	ctx: RenderContext,
	x: number,
	y: number,
	width: number,
	label?: string,
	color?: Color,
): void {
	if (color) {
		ctx.save();
		ctx.setFg(color);
	}

	if (!label) {
		// Simple line
		for (let i = 0; i < width; i++) {
			ctx.drawChar('─', x + i, y);
		}
	} else {
		// Line with label
		const labelWidth = label.length;
		const padding = 1;
		const sideWidth = Math.floor((width - labelWidth - padding * 2) / 2);

		let currentX = x;

		// Left side
		for (let i = 0; i < sideWidth; i++) {
			ctx.drawChar('─', currentX++, y);
		}

		// Label
		for (let i = 0; i < padding; i++) {
			ctx.drawChar('─', currentX++, y);
		}

		for (const char of label) {
			ctx.drawChar(char, currentX++, y);
		}

		for (let i = 0; i < padding; i++) {
			ctx.drawChar('─', currentX++, y);
		}

		// Right side
		while (currentX < x + width) {
			ctx.drawChar('─', currentX++, y);
		}
	}

	if (color) {
		ctx.restore();
	}
}
