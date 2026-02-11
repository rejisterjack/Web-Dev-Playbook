/**
 * Layout Engine Module
 *
 * A comprehensive layout engine for terminal user interfaces with support for:
 * - CSS Flexbox-like layout system
 * - Constraint-based layout resolution
 * - Responsive layouts with breakpoints
 * - Viewport and scroll management
 * - Layout caching for performance
 */

// Core types
export type {
	Size,
	Position,
	Point,
	Rect,
	EdgeInsets,
	Alignment,
	LayoutConstraints,
	ComputedLayout,
	LayoutChange,
	LayoutCacheEntry,
	ScrollOffset,
	Overflow,
	Dimension,
	DimensionConstraints,
} from './types';

// Type enums and constants
export {
	HorizontalAlignment,
	VerticalAlignment,
	LayoutDirection,
	Overflow as LayoutOverflow,
} from './types';

// Export namespaces with aliases to avoid conflicts with types
export {
	EdgeInsets as EdgeInsetsFactory,
	Alignment as AlignmentFactory,
	LayoutConstraints as LayoutConstraintsFactory,
} from './types';

// Flex direction types
export type {
	FlexFlow,
	FlexContainerConfig,
	FlexItemProperties,
} from './flex-direction';

// Flex direction enums
export {
	FlexDirection,
	FlexWrap,
	JustifyContent,
	AlignItems,
	AlignContent,
	DEFAULT_FLEX_CONFIG,
	DEFAULT_FLEX_ITEM,
} from './flex-direction';

// Flex direction helpers
export {
	isRowDirection,
	isColumnDirection,
	isReverseDirection,
	getMainAxisDimension,
	getCrossAxisDimension,
} from './flex-direction';

// Core classes
export {LayoutNode} from './node';
export type {LayoutNodeOptions} from './node';

export {FlexContainer} from './flex-container';
export type {FlexContainerOptions} from './flex-container';

export {LayoutCalculator} from './calculator';
export type {
	CalculationContext,
	CalculationResult,
	LayoutCalculatorOptions,
} from './calculator';

export {LayoutResolver} from './resolver';
export type {ResolvedSize, ResolutionContext} from './resolver';

export {LayoutEngine} from './engine';
export type {LayoutEngineOptions} from './engine';
export {LayoutEngineEvent} from './engine';

export {LayoutBuilder} from './builder';
export type {LayoutFactory as LayoutBuilderFactory} from './responsive';
export {flex, row, column, container} from './builder';

export {Viewport} from './viewport';
export type {ViewportOptions} from './viewport';
export {ViewportEvent} from './viewport';

export {ResponsiveLayout} from './responsive';
export type {
	BreakpointConfig,
	ResponsiveLayoutConfig,
	ResponsiveState,
	LayoutFactory,
} from './responsive';
export {
	Breakpoint,
	Orientation,
	DEFAULT_BREAKPOINTS,
	createResponsiveLayout,
	breakpointValues,
	adaptiveLayout,
} from './responsive';

// Utility functions
export {
	clamp,
	lerp,
	containsPoint,
	intersectRect,
	expandRect,
	contractRect,
	unionRect,
	rectsIntersect,
	roundLayoutValue,
	floorLayoutValue,
	ceilLayoutValue,
	getHorizontalPadding,
	getVerticalPadding,
	getTotalPadding,
	createSize,
	createRect,
	isValidSize,
	isValidRect,
	rectArea,
	isEmptyRect,
	sizesEqual,
	positionsEqual,
	rectsEqual,
	parsePercentage,
	resolveDimension,
	generateHash,
	cloneSize,
	cloneRect,
	cloneEdgeInsets,
} from './utils';
