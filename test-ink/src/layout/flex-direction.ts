/**
 * Flex Direction Module
 *
 * Defines enums and types for CSS Flexbox-like layout properties.
 * These enums control how flex containers arrange their children
 * and how space is distributed among them.
 */

/**
 * Defines the main axis direction for flex layout
 */
export enum FlexDirection {
	/** Items are placed horizontally, left to right */
	Row = 'row',
	/** Items are placed vertically, top to bottom */
	Column = 'column',
	/** Items are placed horizontally, right to left */
	RowReverse = 'row-reverse',
	/** Items are placed vertically, bottom to top */
	ColumnReverse = 'column-reverse',
}

/**
 * Defines whether flex items should wrap to new lines
 */
export enum FlexWrap {
	/** Items will not wrap, they may overflow */
	NoWrap = 'nowrap',
	/** Items will wrap to new lines from top to bottom */
	Wrap = 'wrap',
	/** Items will wrap to new lines from bottom to top */
	WrapReverse = 'wrap-reverse',
}

/**
 * Defines how items are distributed along the main axis
 */
export enum JustifyContent {
	/** Items are packed toward the start */
	FlexStart = 'flex-start',
	/** Items are packed toward the end */
	FlexEnd = 'flex-end',
	/** Items are centered along the main axis */
	Center = 'center',
	/** Items are evenly distributed with first at start, last at end */
	SpaceBetween = 'space-between',
	/** Items are evenly distributed with equal space around each */
	SpaceAround = 'space-around',
	/** Items are evenly distributed with equal space including edges */
	SpaceEvenly = 'space-evenly',
}

/**
 * Defines how items are aligned along the cross axis
 */
export enum AlignItems {
	/** Items are aligned to the start of the cross axis */
	FlexStart = 'flex-start',
	/** Items are aligned to the end of the cross axis */
	FlexEnd = 'flex-end',
	/** Items are centered on the cross axis */
	Center = 'center',
	/** Items stretch to fill the container */
	Stretch = 'stretch',
	/** Items are aligned by their baselines */
	Baseline = 'baseline',
}

/**
 * Defines how multiple lines are aligned in a flex container
 */
export enum AlignContent {
	/** Lines are packed toward the start */
	FlexStart = 'flex-start',
	/** Lines are packed toward the end */
	FlexEnd = 'flex-end',
	/** Lines are centered */
	Center = 'center',
	/** Lines stretch to fill available space */
	Stretch = 'stretch',
	/** Lines are evenly distributed with first at start, last at end */
	SpaceBetween = 'space-between',
	/** Lines are evenly distributed with equal space around each */
	SpaceAround = 'space-around',
}

/**
 * Flex flow shorthand combining direction and wrap
 */
export interface FlexFlow {
	/** Direction of the main axis */
	direction: FlexDirection;
	/** Whether items should wrap */
	wrap: FlexWrap;
}

/**
 * Complete flex container configuration
 */
export interface FlexContainerConfig {
	/** Direction of the main axis */
	direction: FlexDirection;
	/** Whether items should wrap */
	wrap: FlexWrap;
	/** Distribution along main axis */
	justifyContent: JustifyContent;
	/** Alignment along cross axis */
	alignItems: AlignItems;
	/** Alignment of multiple lines */
	alignContent: AlignContent;
}

/**
 * Default flex container configuration
 */
export const DEFAULT_FLEX_CONFIG: FlexContainerConfig = {
	direction: FlexDirection.Row,
	wrap: FlexWrap.NoWrap,
	justifyContent: JustifyContent.FlexStart,
	alignItems: AlignItems.Stretch,
	alignContent: AlignContent.Stretch,
};

/**
 * Flex item properties
 */
export interface FlexItemProperties {
	/** Growth factor - how much item grows relative to others */
	flexGrow: number;
	/** Shrink factor - how much item shrinks relative to others */
	flexShrink: number;
	/** Base size before growing/shrinking */
	flexBasis: number | 'auto';
	/** Override alignItems for this item */
	alignSelf: AlignItems | 'auto';
}

/**
 * Default flex item properties
 */
export const DEFAULT_FLEX_ITEM: FlexItemProperties = {
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: 'auto',
	alignSelf: 'auto',
};

/**
 * Helper type guard to check if a flex direction is row-based
 */
export function isRowDirection(direction: FlexDirection): boolean {
	return (
		direction === FlexDirection.Row || direction === FlexDirection.RowReverse
	);
}

/**
 * Helper type guard to check if a flex direction is column-based
 */
export function isColumnDirection(direction: FlexDirection): boolean {
	return (
		direction === FlexDirection.Column ||
		direction === FlexDirection.ColumnReverse
	);
}

/**
 * Helper type guard to check if a flex direction is reversed
 */
export function isReverseDirection(direction: FlexDirection): boolean {
	return (
		direction === FlexDirection.RowReverse ||
		direction === FlexDirection.ColumnReverse
	);
}

/**
 * Gets the main axis dimension for a given flex direction
 * Returns 'width' for row directions, 'height' for column directions
 */
export function getMainAxisDimension(
	direction: FlexDirection,
): 'width' | 'height' {
	return isRowDirection(direction) ? 'width' : 'height';
}

/**
 * Gets the cross axis dimension for a given flex direction
 * Returns 'height' for row directions, 'width' for column directions
 */
export function getCrossAxisDimension(
	direction: FlexDirection,
): 'width' | 'height' {
	return isRowDirection(direction) ? 'height' : 'width';
}
