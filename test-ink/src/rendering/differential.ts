/**
 * Differential Renderer Module
 *
 * This module provides the DifferentialRenderer class that compares two screen buffers
 * and generates minimal update sequences. It optimizes updates by grouping consecutive
 * changes and minimizing cursor movement.
 *
 * @module rendering/differential
 */

import {Cell, cellsEqual, Color, CellStyles} from './cell.js';
import {ScreenBuffer} from './buffer.js';
import {Cursor, Style, Color as AnsiColor} from '../terminal/ansi.js';

/**
 * Represents a single update operation
 */
export interface UpdateOperation {
	/** Type of update */
	type: 'write' | 'move' | 'clear' | 'style';

	/** X position (for move/write) */
	x?: number;

	/** Y position (for move/write) */
	y?: number;

	/** Character(s) to write */
	content?: string;

	/** ANSI sequence for styling */
	styleSequence?: string;
}

/**
 * A run of consecutive cells with the same style
 */
export interface StyledRun {
	/** Starting X position */
	x: number;

	/** Y position */
	y: number;

	/** Text content */
	text: string;

	/** Foreground color */
	fg: Color;

	/** Background color */
	bg: Color;

	/** Styles */
	styles: CellStyles;
}

/**
 * Render instruction for the terminal
 */
export interface RenderInstruction {
	/** ANSI escape sequences to execute */
	sequences: string[];

	/** Cursor position after rendering (1-indexed) */
	finalX: number;

	/** Cursor position after rendering (1-indexed) */
	finalY: number;
}

/**
 * Options for differential rendering
 */
export interface DifferentialRenderOptions {
	/** Whether to optimize cursor movement */
	optimizeCursorMovement?: boolean;

	/** Whether to group consecutive changes */
	groupConsecutive?: boolean;

	/** Whether to use clear line sequences when beneficial */
	useClearLine?: boolean;

	/** Threshold for using clear line vs individual spaces */
	clearLineThreshold?: number;
}

/**
 * Statistics about the differential render
 */
export interface DifferentialStats {
	/** Total cells compared */
	totalCells: number;

	/** Number of changed cells */
	changedCells: number;

	/** Number of update operations generated */
	operations: number;

	/** Number of ANSI sequences generated */
	sequences: number;

	/** Time taken in milliseconds */
	timeMs: number;
}

/**
 * Default render options
 */
const DEFAULT_OPTIONS: Required<DifferentialRenderOptions> = {
	optimizeCursorMovement: true,
	groupConsecutive: true,
	useClearLine: true,
	clearLineThreshold: 5,
};

/**
 * DifferentialRenderer compares two buffers and generates minimal updates.
 * It optimizes for reducing the number of ANSI sequences and cursor movements.
 */
export class DifferentialRenderer {
	/** Current render options */
	private options: Required<DifferentialRenderOptions>;

	/** Current cursor position (for optimization) */
	private cursorX = 1;

	private cursorY = 1;

	/** Current style state */
	private currentFg: Color = 'default';

	private currentBg: Color = 'default';

	private currentStyles: CellStyles = {};

	/**
	 * Create a new differential renderer
	 *
	 * @param options - Render options
	 */
	constructor(options: DifferentialRenderOptions = {}) {
		this.options = {...DEFAULT_OPTIONS, ...options};
	}

	/**
	 * Update render options
	 *
	 * @param options - New options (partial)
	 */
	setOptions(options: Partial<DifferentialRenderOptions>): void {
		this.options = {...this.options, ...options};
	}

	/**
	 * Reset the internal state (cursor position and style)
	 */
	resetState(): void {
		this.cursorX = 1;
		this.cursorY = 1;
		this.currentFg = 'default';
		this.currentBg = 'default';
		this.currentStyles = {};
	}

	/**
	 * Compare two buffers and generate render instructions
	 *
	 * @param oldBuffer - Previous buffer state
	 * @param newBuffer - New buffer state
	 * @returns Render instructions and statistics
	 */
	render(
		oldBuffer: ScreenBuffer,
		newBuffer: ScreenBuffer,
	): {instructions: RenderInstruction; stats: DifferentialStats} {
		const startTime = performance.now();

		// Validate dimensions
		if (
			oldBuffer.getWidth() !== newBuffer.getWidth() ||
			oldBuffer.getHeight() !== newBuffer.getHeight()
		) {
			throw new Error('Cannot diff buffers with different dimensions');
		}

		const width = oldBuffer.getWidth();
		const height = oldBuffer.getHeight();
		const totalCells = width * height;

		// Find changed cells
		const changedCells: Array<{x: number; y: number; cell: Cell}> = [];

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const oldCell = oldBuffer.getCell(x, y);
				const newCell = newBuffer.getCell(x, y);

				if (!cellsEqual(oldCell, newCell)) {
					changedCells.push({
						x,
						y,
						cell: newCell ?? this.createEmptyCell(),
					});
				}
			}
		}

		// Generate instructions
		const sequences = this.generateSequences(changedCells, width, height);

		const endTime = performance.now();

		const stats: DifferentialStats = {
			totalCells,
			changedCells: changedCells.length,
			operations: changedCells.length,
			sequences: sequences.length,
			timeMs: endTime - startTime,
		};

		return {
			instructions: {
				sequences,
				finalX: this.cursorX,
				finalY: this.cursorY,
			},
			stats,
		};
	}

	/**
	 * Generate ANSI sequences for changed cells
	 */
	private generateSequences(
		changedCells: Array<{x: number; y: number; cell: Cell}>,
		width: number,
		height: number,
	): string[] {
		const sequences: string[] = [];

		if (changedCells.length === 0) {
			return sequences;
		}

		// Sort cells by row, then by column for optimal traversal
		changedCells.sort((a, b) => {
			if (a.y !== b.y) return a.y - b.y;
			return a.x - b.x;
		});

		if (this.options.groupConsecutive) {
			// Group consecutive cells into runs
			const runs = this.groupIntoRuns(changedCells);

			for (const run of runs) {
				// Move cursor if needed
				const moveSeq = this.getCursorMoveSequence(run.x + 1, run.y + 1);
				if (moveSeq) {
					sequences.push(moveSeq);
				}

				// Apply style if changed
				const styleSeq = this.getStyleSequence(run.fg, run.bg, run.styles);
				if (styleSeq) {
					sequences.push(styleSeq);
				}

				// Write text
				sequences.push(run.text);

				// Update cursor position
				this.cursorX = run.x + run.text.length + 1;
				this.cursorY = run.y + 1;
			}
		} else {
			// Process individual cells
			for (const {x, y, cell} of changedCells) {
				// Move cursor
				const moveSeq = this.getCursorMoveSequence(x + 1, y + 1);
				if (moveSeq) {
					sequences.push(moveSeq);
				}

				// Apply style
				const styleSeq = this.getStyleSequence(cell.fg, cell.bg, cell.styles);
				if (styleSeq) {
					sequences.push(styleSeq);
				}

				// Write character
				sequences.push(cell.char);

				// Update cursor
				this.cursorX = x + 2;
				this.cursorY = y + 1;
			}
		}

		return sequences;
	}

	/**
	 * Group consecutive cells with the same style into runs
	 */
	private groupIntoRuns(
		cells: Array<{x: number; y: number; cell: Cell}>,
	): StyledRun[] {
		const runs: StyledRun[] = [];

		if (cells.length === 0) return runs;

		let currentRun: StyledRun = {
			x: cells[0].x,
			y: cells[0].y,
			text: cells[0].cell.char,
			fg: cells[0].cell.fg,
			bg: cells[0].cell.bg,
			styles: cells[0].cell.styles,
		};

		for (let i = 1; i < cells.length; i++) {
			const {x, y, cell} = cells[i];

			// Check if this cell can be part of the current run
			const isConsecutive =
				y === currentRun.y && x === currentRun.x + currentRun.text.length;
			const sameStyle =
				cellsEqualColor(cell.fg, currentRun.fg) &&
				cellsEqualColor(cell.bg, currentRun.bg) &&
				stylesEqual(cell.styles, currentRun.styles);

			if (isConsecutive && sameStyle) {
				// Add to current run
				currentRun.text += cell.char;
			} else {
				// Start new run
				runs.push(currentRun);
				currentRun = {
					x,
					y,
					text: cell.char,
					fg: cell.fg,
					bg: cell.bg,
					styles: cell.styles,
				};
			}
		}

		// Don't forget the last run
		runs.push(currentRun);

		return runs;
	}

	/**
	 * Get cursor move sequence, optimizing if possible
	 */
	private getCursorMoveSequence(targetX: number, targetY: number): string {
		if (!this.options.optimizeCursorMovement) {
			return Cursor.to(targetX, targetY);
		}

		// Already at position
		if (this.cursorX === targetX && this.cursorY === targetY) {
			return '';
		}

		// Same row - use horizontal movement
		if (this.cursorY === targetY) {
			const diff = targetX - this.cursorX;
			if (diff > 0) {
				return Cursor.forward(diff);
			} else if (diff < 0) {
				return Cursor.backward(-diff);
			}
			return '';
		}

		// Same column - use vertical movement
		if (this.cursorX === targetX) {
			const diff = targetY - this.cursorY;
			if (diff > 0) {
				return Cursor.down(diff);
			} else if (diff < 0) {
				return Cursor.up(-diff);
			}
		}

		// Different row and column - use absolute positioning
		return Cursor.to(targetX, targetY);
	}

	/**
	 * Get style sequence if style has changed
	 */
	private getStyleSequence(fg: Color, bg: Color, styles: CellStyles): string {
		// Check if style has actually changed
		if (
			cellsEqualColor(fg, this.currentFg) &&
			cellsEqualColor(bg, this.currentBg) &&
			stylesEqual(styles, this.currentStyles)
		) {
			return '';
		}

		// Build style sequence
		const codes: number[] = [];

		// Reset if going to default from non-default
		if (fg === 'default' && this.currentFg !== 'default') {
			codes.push(Style.reset);
		}

		// Foreground color
		if (!cellsEqualColor(fg, this.currentFg)) {
			codes.push(...this.colorToCodes(fg, true));
		}

		// Background color
		if (!cellsEqualColor(bg, this.currentBg)) {
			codes.push(...this.colorToCodes(bg, false));
		}

		// Styles
		if (styles.bold && !this.currentStyles.bold) codes.push(Style.bold);
		if (styles.dim && !this.currentStyles.dim) codes.push(Style.dim);
		if (styles.italic && !this.currentStyles.italic) codes.push(Style.italic);
		if (styles.underline && !this.currentStyles.underline)
			codes.push(Style.underline);
		if (styles.blink && !this.currentStyles.blink) codes.push(Style.blink);
		if (styles.reverse && !this.currentStyles.reverse)
			codes.push(Style.reverse);
		if (styles.hidden && !this.currentStyles.hidden) codes.push(Style.hidden);
		if (styles.strikethrough && !this.currentStyles.strikethrough)
			codes.push(Style.strikethrough);

		// Update current style
		this.currentFg = fg;
		this.currentBg = bg;
		this.currentStyles = {...styles};

		if (codes.length === 0) {
			return '';
		}

		return `\u001B[${codes.join(';')}m`;
	}

	/**
	 * Convert color to ANSI codes
	 */
	private colorToCodes(color: Color, isForeground: boolean): number[] {
		const base = isForeground ? 30 : 40;

		if (typeof color === 'string') {
			const colorMap: Record<string, number> = {
				default: 0,
				black: 0,
				red: 1,
				green: 2,
				yellow: 3,
				blue: 4,
				magenta: 5,
				cyan: 6,
				white: 7,
				gray: 8,
				brightBlack: 8,
				brightRed: 9,
				brightGreen: 10,
				brightYellow: 11,
				brightBlue: 12,
				brightMagenta: 13,
				brightCyan: 14,
				brightWhite: 15,
			};

			const code = colorMap[color];
			if (code === undefined || color === 'default') {
				return isForeground ? [39] : [49];
			}

			if (code < 8) {
				return [base + code];
			} else {
				return [base + 60 + (code - 8)];
			}
		}

		if ('index' in color) {
			// 256 color
			return [isForeground ? 38 : 48, 5, color.index];
		}

		if ('rgb' in color) {
			// True color
			return [
				isForeground ? 38 : 48,
				2,
				color.rgb[0],
				color.rgb[1],
				color.rgb[2],
			];
		}

		return isForeground ? [39] : [49];
	}

	/**
	 * Create an empty/default cell
	 */
	private createEmptyCell(): Cell {
		return {
			char: ' ',
			fg: 'default',
			bg: 'default',
			styles: {},
			width: 1,
		};
	}
}

/**
 * Check if two colors are equal
 */
function cellsEqualColor(a: Color, b: Color): boolean {
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
 */
function stylesEqual(a: CellStyles, b: CellStyles): boolean {
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
 * Create a new differential renderer
 *
 * @param options - Render options
 * @returns New differential renderer
 */
export function createDifferentialRenderer(
	options?: DifferentialRenderOptions,
): DifferentialRenderer {
	return new DifferentialRenderer(options);
}
