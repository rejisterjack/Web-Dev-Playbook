/**
 * Layout Utilities Module
 *
 * Utility functions for layout calculations and geometric operations.
 * These functions are optimized for performance and handle edge cases
 * commonly encountered in layout computations.
 */

import type {Rect, Point, EdgeInsets, Size} from './types';

/**
 * Clamps a value to the specified range [min, max]
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Performs linear interpolation between two values
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor (0 to 1)
 * @returns The interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Checks if a point is contained within a rectangle
 * @param rect - The rectangle to test
 * @param point - The point to check
 * @returns True if the point is inside the rectangle
 */
export function containsPoint(rect: Rect, point: Point): boolean {
	return (
		point.x >= rect.x &&
		point.x < rect.x + rect.width &&
		point.y >= rect.y &&
		point.y < rect.y + rect.height
	);
}

/**
 * Calculates the intersection of two rectangles
 * @param rect1 - The first rectangle
 * @param rect2 - The second rectangle
 * @returns The intersection rectangle, or null if they don't intersect
 */
export function intersectRect(rect1: Rect, rect2: Rect): Rect | null {
	const x1 = Math.max(rect1.x, rect2.x);
	const y1 = Math.max(rect1.y, rect2.y);
	const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
	const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

	if (x1 >= x2 || y1 >= y2) {
		return null;
	}

	return {
		x: x1,
		y: y1,
		width: x2 - x1,
		height: y2 - y1,
	};
}

/**
 * Expands a rectangle by the specified padding
 * @param rect - The rectangle to expand
 * @param padding - The padding to add (can be negative to shrink)
 * @returns The expanded rectangle
 */
export function expandRect(rect: Rect, padding: EdgeInsets): Rect {
	return {
		x: rect.x - padding.left,
		y: rect.y - padding.top,
		width: rect.width + padding.left + padding.right,
		height: rect.height + padding.top + padding.bottom,
	};
}

/**
 * Contracts a rectangle by the specified padding
 * @param rect - The rectangle to contract
 * @param padding - The padding to remove
 * @returns The contracted rectangle
 */
export function contractRect(rect: Rect, padding: EdgeInsets): Rect {
	return {
		x: rect.x + padding.left,
		y: rect.y + padding.top,
		width: Math.max(0, rect.width - padding.left - padding.right),
		height: Math.max(0, rect.height - padding.top - padding.bottom),
	};
}

/**
 * Calculates the union of two rectangles
 * @param rect1 - The first rectangle
 * @param rect2 - The second rectangle
 * @returns The smallest rectangle containing both input rectangles
 */
export function unionRect(rect1: Rect, rect2: Rect): Rect {
	const x1 = Math.min(rect1.x, rect2.x);
	const y1 = Math.min(rect1.y, rect2.y);
	const x2 = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
	const y2 = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);

	return {
		x: x1,
		y: y1,
		width: x2 - x1,
		height: y2 - y1,
	};
}

/**
 * Checks if two rectangles intersect
 * @param rect1 - The first rectangle
 * @param rect2 - The second rectangle
 * @returns True if the rectangles intersect
 */
export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
	return (
		rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.y + rect1.height > rect2.y
	);
}

/**
 * Rounds a number to the nearest integer, handling edge cases
 * @param value - The value to round
 * @returns The rounded integer
 */
export function roundLayoutValue(value: number): number {
	// Handle negative zero
	if (value === 0) return 0;
	return Math.round(value);
}

/**
 * Floors a number for layout calculations, ensuring non-negative results
 * @param value - The value to floor
 * @returns The floored value (minimum 0)
 */
export function floorLayoutValue(value: number): number {
	return Math.max(0, Math.floor(value));
}

/**
 * Ceils a number for layout calculations
 * @param value - The value to ceil
 * @returns The ceiled value
 */
export function ceilLayoutValue(value: number): number {
	return Math.ceil(value);
}

/**
 * Calculates the total horizontal padding
 * @param insets - The edge insets
 * @returns The sum of left and right padding
 */
export function getHorizontalPadding(insets: EdgeInsets): number {
	return insets.left + insets.right;
}

/**
 * Calculates the total vertical padding
 * @param insets - The edge insets
 * @returns The sum of top and bottom padding
 */
export function getVerticalPadding(insets: EdgeInsets): number {
	return insets.top + insets.bottom;
}

/**
 * Calculates the total padding area
 * @param insets - The edge insets
 * @returns The sum of all padding
 */
export function getTotalPadding(insets: EdgeInsets): number {
	return insets.top + insets.right + insets.bottom + insets.left;
}

/**
 * Creates a size with non-negative dimensions
 * @param width - The width
 * @param height - The height
 * @returns A valid size object
 */
export function createSize(width: number, height: number): Size {
	return {
		width: Math.max(0, width),
		height: Math.max(0, height),
	};
}

/**
 * Creates a rectangle with validated dimensions
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width (will be non-negative)
 * @param height - Height (will be non-negative)
 * @returns A valid rect object
 */
export function createRect(
	x: number,
	y: number,
	width: number,
	height: number,
): Rect {
	return {
		x,
		y,
		width: Math.max(0, width),
		height: Math.max(0, height),
	};
}

/**
 * Checks if a size is valid (non-negative dimensions)
 * @param size - The size to validate
 * @returns True if the size is valid
 */
export function isValidSize(size: Size): boolean {
	return (
		size.width >= 0 &&
		size.height >= 0 &&
		Number.isFinite(size.width) &&
		Number.isFinite(size.height)
	);
}

/**
 * Checks if a rectangle is valid (non-negative dimensions)
 * @param rect - The rectangle to validate
 * @returns True if the rectangle is valid
 */
export function isValidRect(rect: Rect): boolean {
	return (
		rect.width >= 0 &&
		rect.height >= 0 &&
		Number.isFinite(rect.x) &&
		Number.isFinite(rect.y)
	);
}

/**
 * Calculates the area of a rectangle
 * @param rect - The rectangle
 * @returns The area (width * height)
 */
export function rectArea(rect: Rect): number {
	return rect.width * rect.height;
}

/**
 * Checks if a rectangle is empty (zero area)
 * @param rect - The rectangle to check
 * @returns True if the rectangle has zero or negative area
 */
export function isEmptyRect(rect: Rect): boolean {
	return rect.width <= 0 || rect.height <= 0;
}

/**
 * Compares two sizes for equality
 * @param a - First size
 * @param b - Second size
 * @returns True if sizes are equal
 */
export function sizesEqual(a: Size, b: Size): boolean {
	return a.width === b.width && a.height === b.height;
}

/**
 * Compares two positions for equality
 * @param a - First position
 * @param b - Second position
 * @returns True if positions are equal
 */
export function positionsEqual(a: Point, b: Point): boolean {
	return a.x === b.x && a.y === b.y;
}

/**
 * Compares two rectangles for equality
 * @param a - First rectangle
 * @param b - Second rectangle
 * @returns True if rectangles are equal
 */
export function rectsEqual(a: Rect, b: Rect): boolean {
	return (
		a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
	);
}

/**
 * Parses a percentage string to a decimal value
 * @param value - The percentage string (e.g., "50%")
 * @returns The decimal value (0-1) or null if invalid
 */
export function parsePercentage(value: string): number | null {
	const match = value.trim().match(/^(\d+(?:\.\d+)?)%$/);
	if (!match) return null;
	const num = parseFloat(match[1]);
	return num / 100;
}

/**
 * Resolves a dimension value (number, percentage string, or auto)
 * @param value - The dimension value
 * @param containerSize - The container size for percentage calculations
 * @returns The resolved dimension or null if auto
 */
export function resolveDimension(
	value: number | string,
	containerSize: number,
): number | null {
	if (typeof value === 'number') {
		return value;
	}
	if (typeof value === 'string') {
		if (value === 'auto') return null;
		const pct = parsePercentage(value);
		if (pct !== null) {
			return containerSize * pct;
		}
	}
	return null;
}

/**
 * Generates a simple hash string for cache keys
 * @param values - Values to hash
 * @returns A hash string
 */
export function generateHash(...values: (string | number | boolean)[]): string {
	return values.map(v => String(v)).join('|');
}

/**
 * Deep clones a size object
 * @param size - The size to clone
 * @returns A new size object
 */
export function cloneSize(size: Size): Size {
	return {...size};
}

/**
 * Deep clones a rect object
 * @param rect - The rect to clone
 * @returns A new rect object
 */
export function cloneRect(rect: Rect): Rect {
	return {...rect};
}

/**
 * Deep clones edge insets
 * @param insets - The insets to clone
 * @returns A new edge insets object
 */
export function cloneEdgeInsets(insets: EdgeInsets): EdgeInsets {
	return {...insets};
}
