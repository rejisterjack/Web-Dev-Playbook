/**
 * Screen Buffer Module
 *
 * This module provides the ScreenBuffer class for managing a 2D array of cells
 * representing the virtual screen. It supports efficient cell access, resizing,
 * and buffer comparison operations.
 *
 * @module rendering/buffer
 */

import {Cell, DEFAULT_CELL, cellsEqual, cloneCell, createCell} from './cell.js';

/**
 * Buffer change record for tracking modifications
 */
export interface BufferChange {
	/** X coordinate */
	x: number;

	/** Y coordinate */
	y: number;

	/** Previous cell value */
	oldCell: Cell | undefined;

	/** New cell value */
	newCell: Cell;
}

/**
 * Region of the buffer that has been modified
 */
export interface DirtyRegion {
	/** Left coordinate (inclusive) */
	left: number;

	/** Top coordinate (inclusive) */
	top: number;

	/** Right coordinate (exclusive) */
	right: number;

	/** Bottom coordinate (exclusive) */
	bottom: number;
}

/**
 * ScreenBuffer represents a 2D grid of cells for terminal rendering.
 * Uses a flat array for memory efficiency with 2D coordinate access.
 */
export class ScreenBuffer {
	/** Buffer width in columns */
	private width: number;

	/** Buffer height in rows */
	private height: number;

	/** Flat array of cells (row-major order: index = y * width + x) */
	private cells: (Cell | undefined)[];

	/** Dirty region tracking */
	private dirtyRegion: DirtyRegion | null = null;

	/** Total cell count */
	private cellCount = 0;

	/**
	 * Create a new screen buffer
	 *
	 * @param width - Buffer width in columns
	 * @param height - Buffer height in rows
	 */
	constructor(width: number, height: number) {
		if (width <= 0 || height <= 0) {
			throw new Error(`Invalid buffer dimensions: ${width}x${height}`);
		}

		this.width = width;
		this.height = height;
		this.cells = new Array(width * height).fill(undefined);
		this.cellCount = 0;
	}

	/**
	 * Get buffer width
	 */
	getWidth(): number {
		return this.width;
	}

	/**
	 * Get buffer height
	 */
	getHeight(): number {
		return this.height;
	}

	/**
	 * Get total number of cells
	 */
	getCellCount(): number {
		return this.cellCount;
	}

	/**
	 * Check if coordinates are within buffer bounds
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns True if coordinates are valid
	 */
	isValidPosition(x: number, y: number): boolean {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	/**
	 * Convert 2D coordinates to flat array index
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns Array index
	 */
	private getIndex(x: number, y: number): number {
		return y * this.width + x;
	}

	/**
	 * Get cell at position
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns Cell at position, or undefined if empty/out of bounds
	 */
	getCell(x: number, y: number): Cell | undefined {
		if (!this.isValidPosition(x, y)) {
			return undefined;
		}

		return this.cells[this.getIndex(x, y)];
	}

	/**
	 * Get cell at position, returning a default cell if empty
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns Cell at position or default cell
	 */
	getCellOrDefault(x: number, y: number): Cell {
		return this.getCell(x, y) ?? {...DEFAULT_CELL};
	}

	/**
	 * Set cell at position
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param cell - Cell to set
	 * @returns True if cell was changed
	 */
	setCell(x: number, y: number, cell: Cell): boolean {
		if (!this.isValidPosition(x, y)) {
			return false;
		}

		const index = this.getIndex(x, y);
		const oldCell = this.cells[index];

		if (cellsEqual(oldCell, cell)) {
			return false;
		}

		// Track cell count
		if (!oldCell && cell) {
			this.cellCount++;
		} else if (oldCell && !cell) {
			this.cellCount--;
		}

		this.cells[index] = cloneCell(cell);
		this.markDirty(x, y);

		return true;
	}

	/**
	 * Set cell at position without cloning (for internal use when cell is already cloned)
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @param cell - Cell to set (will not be cloned)
	 * @returns True if cell was changed
	 */
	setCellDirect(x: number, y: number, cell: Cell): boolean {
		if (!this.isValidPosition(x, y)) {
			return false;
		}

		const index = this.getIndex(x, y);
		const oldCell = this.cells[index];

		if (cellsEqual(oldCell, cell)) {
			return false;
		}

		if (!oldCell && cell) {
			this.cellCount++;
		} else if (oldCell && !cell) {
			this.cellCount--;
		}

		this.cells[index] = cell;
		this.markDirty(x, y);

		return true;
	}

	/**
	 * Clear cell at position
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 * @returns True if cell was cleared
	 */
	clearCell(x: number, y: number): boolean {
		if (!this.isValidPosition(x, y)) {
			return false;
		}

		const index = this.getIndex(x, y);
		const oldCell = this.cells[index];

		if (!oldCell) {
			return false;
		}

		this.cells[index] = undefined;
		this.cellCount--;
		this.markDirty(x, y);

		return true;
	}

	/**
	 * Mark a position as dirty
	 *
	 * @param x - X coordinate
	 * @param y - Y coordinate
	 */
	private markDirty(x: number, y: number): void {
		if (this.dirtyRegion === null) {
			this.dirtyRegion = {
				left: x,
				top: y,
				right: x + 1,
				bottom: y + 1,
			};
		} else {
			this.dirtyRegion.left = Math.min(this.dirtyRegion.left, x);
			this.dirtyRegion.top = Math.min(this.dirtyRegion.top, y);
			this.dirtyRegion.right = Math.max(this.dirtyRegion.right, x + 1);
			this.dirtyRegion.bottom = Math.max(this.dirtyRegion.bottom, y + 1);
		}
	}

	/**
	 * Get the current dirty region
	 */
	getDirtyRegion(): DirtyRegion | null {
		return this.dirtyRegion;
	}

	/**
	 * Clear the dirty region tracking
	 */
	clearDirtyRegion(): void {
		this.dirtyRegion = null;
	}

	/**
	 * Clear entire buffer
	 */
	clear(): void {
		if (this.cellCount === 0) {
			return;
		}

		this.cells.fill(undefined);
		this.cellCount = 0;
		this.dirtyRegion = {
			left: 0,
			top: 0,
			right: this.width,
			bottom: this.height,
		};
	}

	/**
	 * Fill buffer with a character
	 *
	 * @param char - Character to fill with
	 * @param fg - Foreground color
	 * @param bg - Background color
	 */
	fill(
		char = ' ',
		fg: Cell['fg'] = 'default',
		bg: Cell['bg'] = 'default',
	): void {
		const cell = createCell(char, fg, bg);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const index = this.getIndex(x, y);
				this.cells[index] = cloneCell(cell);
			}
		}

		this.cellCount = this.width * this.height;
		this.dirtyRegion = {
			left: 0,
			top: 0,
			right: this.width,
			bottom: this.height,
		};
	}

	/**
	 * Resize the buffer, preserving content where possible
	 *
	 * @param newWidth - New width
	 * @param newHeight - New height
	 * @param preserveContent - Whether to preserve existing content (default: true)
	 */
	resize(newWidth: number, newHeight: number, preserveContent = true): void {
		if (newWidth <= 0 || newHeight <= 0) {
			throw new Error(`Invalid buffer dimensions: ${newWidth}x${newHeight}`);
		}

		if (newWidth === this.width && newHeight === this.height) {
			return;
		}

		const newCells = new Array(newWidth * newHeight).fill(undefined);
		let newCellCount = 0;

		if (preserveContent) {
			// Copy existing cells that fit within new dimensions
			const copyWidth = Math.min(this.width, newWidth);
			const copyHeight = Math.min(this.height, newHeight);

			for (let y = 0; y < copyHeight; y++) {
				for (let x = 0; x < copyWidth; x++) {
					const oldIndex = this.getIndex(x, y);
					const newIndex = y * newWidth + x;
					const cell = this.cells[oldIndex];

					if (cell) {
						newCells[newIndex] = cloneCell(cell);
						newCellCount++;
					}
				}
			}
		}

		this.width = newWidth;
		this.height = newHeight;
		this.cells = newCells;
		this.cellCount = newCellCount;
		this.dirtyRegion = {
			left: 0,
			top: 0,
			right: newWidth,
			bottom: newHeight,
		};
	}

	/**
	 * Compare this buffer with another and return changed cells
	 *
	 * @param other - Buffer to compare with
	 * @returns Array of changes
	 */
	compare(other: ScreenBuffer): BufferChange[] {
		if (this.width !== other.width || this.height !== other.height) {
			throw new Error('Cannot compare buffers with different dimensions');
		}

		const changes: BufferChange[] = [];

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const index = this.getIndex(x, y);
				const thisCell = this.cells[index];
				const otherCell = other.cells[index];

				if (!cellsEqual(thisCell, otherCell)) {
					changes.push({
						x,
						y,
						oldCell: thisCell ? cloneCell(thisCell) : undefined,
						newCell: otherCell ? cloneCell(otherCell) : createCell(),
					});
				}
			}
		}

		return changes;
	}

	/**
	 * Get all non-empty cells
	 *
	 * @returns Iterator of cells with coordinates
	 */
	*getNonEmptyCells(): Generator<{x: number; y: number; cell: Cell}> {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.cells[this.getIndex(x, y)];
				if (cell) {
					yield {x, y, cell};
				}
			}
		}
	}

	/**
	 * Copy content from another buffer
	 *
	 * @param source - Source buffer
	 * @param srcX - Source X offset
	 * @param srcY - Source Y offset
	 * @param destX - Destination X offset
	 * @param destY - Destination Y offset
	 * @param width - Width to copy
	 * @param height - Height to copy
	 */
	copyFrom(
		source: ScreenBuffer,
		srcX = 0,
		srcY = 0,
		destX = 0,
		destY = 0,
		width?: number,
		height?: number,
	): void {
		const copyWidth = width ?? source.getWidth();
		const copyHeight = height ?? source.getHeight();

		for (let y = 0; y < copyHeight; y++) {
			for (let x = 0; x < copyWidth; x++) {
				const cell = source.getCell(srcX + x, srcY + y);
				if (cell) {
					this.setCell(destX + x, destY + y, cell);
				}
			}
		}
	}

	/**
	 * Create a deep clone of this buffer
	 */
	clone(): ScreenBuffer {
		const clone = new ScreenBuffer(this.width, this.height);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = this.cells[this.getIndex(x, y)];
				if (cell) {
					clone.setCellDirect(x, y, cloneCell(cell));
				}
			}
		}

		return clone;
	}

	/**
	 * Iterate over all cells in the buffer
	 */
	*iterateCells(): Generator<{x: number; y: number; cell: Cell | undefined}> {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				yield {x, y, cell: this.cells[this.getIndex(x, y)]};
			}
		}
	}
}

/**
 * Create a new screen buffer
 *
 * @param width - Buffer width
 * @param height - Buffer height
 * @returns New screen buffer
 */
export function createBuffer(width: number, height: number): ScreenBuffer {
	return new ScreenBuffer(width, height);
}
