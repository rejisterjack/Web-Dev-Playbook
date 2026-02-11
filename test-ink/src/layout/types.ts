/**
 * Layout Types Module
 *
 * Core type definitions for the layout engine.
 * Provides fundamental interfaces for size, position, constraints,
 * and alignment used throughout the layout system.
 */

/**
 * Represents a 2D size with width and height
 */
export interface Size {
	/** Width in terminal columns */
	width: number;
	/** Height in terminal rows */
	height: number;
}

/**
 * Represents a 2D position with x and y coordinates
 */
export interface Position {
	/** X coordinate (column) */
	x: number;
	/** Y coordinate (row) */
	y: number;
}

/**
 * Represents a point in 2D space (alias for Position)
 */
export interface Point {
	/** X coordinate */
	x: number;
	/** Y coordinate */
	y: number;
}

/**
 * Represents a rectangular region with position and size
 */
export interface Rect {
	/** X coordinate of the top-left corner */
	x: number;
	/** Y coordinate of the top-left corner */
	y: number;
	/** Width of the rectangle */
	width: number;
	/** Height of the rectangle */
	height: number;
}

/**
 * Represents padding/margin insets for all four edges
 */
export interface EdgeInsets {
	/** Top edge inset */
	top: number;
	/** Right edge inset */
	right: number;
	/** Bottom edge inset */
	bottom: number;
	/** Left edge inset */
	left: number;
}

/**
 * Factory functions for EdgeInsets
 */
export namespace EdgeInsets {
	/**
	 * Creates EdgeInsets with uniform value on all sides
	 */
	export function all(value: number): EdgeInsets {
		return {top: value, right: value, bottom: value, left: value};
	}

	/**
	 * Creates EdgeInsets with symmetric vertical and horizontal values
	 */
	export function symmetric(vertical: number, horizontal: number): EdgeInsets {
		return {
			top: vertical,
			right: horizontal,
			bottom: vertical,
			left: horizontal,
		};
	}

	/**
	 * Creates EdgeInsets with only horizontal values
	 */
	export function horizontal(value: number): EdgeInsets {
		return {top: 0, right: value, bottom: 0, left: value};
	}

	/**
	 * Creates EdgeInsets with only vertical values
	 */
	export function vertical(value: number): EdgeInsets {
		return {top: value, right: 0, bottom: value, left: 0};
	}

	/**
	 * Creates EdgeInsets with only top value
	 */
	export function onlyTop(value: number): EdgeInsets {
		return {top: value, right: 0, bottom: 0, left: 0};
	}

	/**
	 * Creates EdgeInsets with only right value
	 */
	export function onlyRight(value: number): EdgeInsets {
		return {top: 0, right: value, bottom: 0, left: 0};
	}

	/**
	 * Creates EdgeInsets with only bottom value
	 */
	export function onlyBottom(value: number): EdgeInsets {
		return {top: 0, right: 0, bottom: value, left: 0};
	}

	/**
	 * Creates EdgeInsets with only left value
	 */
	export function onlyLeft(value: number): EdgeInsets {
		return {top: 0, right: 0, bottom: 0, left: value};
	}

	/**
	 * Creates zero EdgeInsets
	 */
	export function zero(): EdgeInsets {
		return {top: 0, right: 0, bottom: 0, left: 0};
	}
}

/**
 * Horizontal alignment options
 */
export enum HorizontalAlignment {
	/** Align to the left */
	Left = 'left',
	/** Align to the center */
	Center = 'center',
	/** Align to the right */
	Right = 'right',
	/** Stretch to fill available space */
	Stretch = 'stretch',
}

/**
 * Vertical alignment options
 */
export enum VerticalAlignment {
	/** Align to the top */
	Top = 'top',
	/** Align to the center */
	Center = 'center',
	/** Align to the bottom */
	Bottom = 'bottom',
	/** Stretch to fill available space */
	Stretch = 'stretch',
}

/**
 * Combined alignment for both axes
 */
export interface Alignment {
	/** Horizontal alignment */
	horizontal: HorizontalAlignment;
	/** Vertical alignment */
	vertical: VerticalAlignment;
}

/**
 * Predefined alignment constants
 */
export namespace Alignment {
	/** Top-left alignment */
	export const topLeft: Alignment = {
		horizontal: HorizontalAlignment.Left,
		vertical: VerticalAlignment.Top,
	};
	/** Top-center alignment */
	export const topCenter: Alignment = {
		horizontal: HorizontalAlignment.Center,
		vertical: VerticalAlignment.Top,
	};
	/** Top-right alignment */
	export const topRight: Alignment = {
		horizontal: HorizontalAlignment.Right,
		vertical: VerticalAlignment.Top,
	};
	/** Center-left alignment */
	export const centerLeft: Alignment = {
		horizontal: HorizontalAlignment.Left,
		vertical: VerticalAlignment.Center,
	};
	/** Center alignment */
	export const center: Alignment = {
		horizontal: HorizontalAlignment.Center,
		vertical: VerticalAlignment.Center,
	};
	/** Center-right alignment */
	export const centerRight: Alignment = {
		horizontal: HorizontalAlignment.Right,
		vertical: VerticalAlignment.Center,
	};
	/** Bottom-left alignment */
	export const bottomLeft: Alignment = {
		horizontal: HorizontalAlignment.Left,
		vertical: VerticalAlignment.Bottom,
	};
	/** Bottom-center alignment */
	export const bottomCenter: Alignment = {
		horizontal: HorizontalAlignment.Center,
		vertical: VerticalAlignment.Bottom,
	};
	/** Bottom-right alignment */
	export const bottomRight: Alignment = {
		horizontal: HorizontalAlignment.Right,
		vertical: VerticalAlignment.Bottom,
	};
}

/**
 * Layout constraints defining min/max bounds for width and height
 */
export interface LayoutConstraints {
	/** Minimum width (0 if unconstrained) */
	minWidth: number;
	/** Maximum width (Infinity if unconstrained) */
	maxWidth: number;
	/** Minimum height (0 if unconstrained) */
	minHeight: number;
	/** Maximum height (Infinity if unconstrained) */
	maxHeight: number;
}

/**
 * Factory functions for LayoutConstraints
 */
export namespace LayoutConstraints {
	/**
	 * Creates constraints with tight bounds (exact size)
	 */
	export function tight(size: Size): LayoutConstraints {
		return {
			minWidth: size.width,
			maxWidth: size.width,
			minHeight: size.height,
			maxHeight: size.height,
		};
	}

	/**
	 * Creates constraints with tight width and loose height
	 */
	export function tightWidth(width: number): LayoutConstraints {
		return {
			minWidth: width,
			maxWidth: width,
			minHeight: 0,
			maxHeight: Infinity,
		};
	}

	/**
	 * Creates constraints with tight height and loose width
	 */
	export function tightHeight(height: number): LayoutConstraints {
		return {
			minWidth: 0,
			maxWidth: Infinity,
			minHeight: height,
			maxHeight: height,
		};
	}

	/**
	 * Creates loose constraints (0 to Infinity)
	 */
	export function loose(): LayoutConstraints {
		return {
			minWidth: 0,
			maxWidth: Infinity,
			minHeight: 0,
			maxHeight: Infinity,
		};
	}

	/**
	 * Creates constraints with maximum size
	 */
	export function maxSize(size: Size): LayoutConstraints {
		return {
			minWidth: 0,
			maxWidth: size.width,
			minHeight: 0,
			maxHeight: size.height,
		};
	}

	/**
	 * Creates constraints with minimum size
	 */
	export function minSize(size: Size): LayoutConstraints {
		return {
			minWidth: size.width,
			maxWidth: Infinity,
			minHeight: size.height,
			maxHeight: Infinity,
		};
	}

	/**
	 * Creates constraints that expand to fill available space
	 */
	export function expand(): LayoutConstraints {
		return {
			minWidth: Infinity,
			maxWidth: Infinity,
			minHeight: Infinity,
			maxHeight: Infinity,
		};
	}
}

/**
 * Computed layout result for a node
 */
export interface ComputedLayout {
	/** Position relative to parent */
	position: Position;
	/** Actual size after layout */
	size: Size;
	/** Whether this layout is valid */
	isValid: boolean;
	/** Timestamp of last computation */
	timestamp: number;
}

/**
 * Layout change information for diffing
 */
export interface LayoutChange {
	/** Node ID that changed */
	nodeId: string;
	/** Old layout values */
	oldLayout: ComputedLayout;
	/** New layout values */
	newLayout: ComputedLayout;
	/** Whether position changed */
	positionChanged: boolean;
	/** Whether size changed */
	sizeChanged: boolean;
}

/**
 * Layout cache entry
 */
export interface LayoutCacheEntry {
	/** Constraints used for this layout */
	constraints: LayoutConstraints;
	/** Computed layout result */
	layout: ComputedLayout;
	/** Hash of node properties for cache invalidation */
	propertyHash: string;
}

/**
 * Scroll offset for viewport management
 */
export interface ScrollOffset {
	/** Horizontal scroll offset */
	x: number;
	/** Vertical scroll offset */
	y: number;
}

/**
 * Layout direction (for RTL support)
 */
export enum LayoutDirection {
	/** Left-to-right layout */
	LTR = 'ltr',
	/** Right-to-left layout */
	RTL = 'rtl',
}

/**
 * Overflow behavior for content that exceeds bounds
 */
export enum Overflow {
	/** Content is clipped to bounds */
	Clip = 'clip',
	/** Content overflows visibly */
	Visible = 'visible',
	/** Scrollbars are shown */
	Scroll = 'scroll',
	/** Content is hidden but no scrollbars */
	Hidden = 'hidden',
}

/**
 * Dimension type - can be a fixed value, percentage, or auto
 */
export type Dimension = number | string | 'auto';

/**
 * Size constraints for a single dimension
 */
export interface DimensionConstraints {
	/** Minimum value */
	min: number;
	/** Maximum value */
	max: number;
	/** Preferred value (optional) */
	preferred?: number;
}
