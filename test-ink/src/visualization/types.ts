/**
 * Visualization Types Module
 *
 * Core type definitions for data visualization components.
 * Provides interfaces for data points, series, axes, legends, and chart themes.
 *
 * @module visualization/types
 */

import type {Color} from '../rendering/cell.js';

/**
 * Generic data point with value and optional label
 */
export interface DataPoint {
	/** The numeric value of the data point */
	value: number;

	/** Optional label for the data point */
	label?: string;

	/** Optional timestamp for time-series data */
	timestamp?: Date;

	/** Optional category for categorical data */
	category?: string;

	/** Additional metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Collection of data points with series properties
 */
export interface Series {
	/** Unique identifier for the series */
	id: string;

	/** Display name for the series */
	name: string;

	/** Color for the series */
	color?: Color;

	/** Data points in the series */
	data: DataPoint[];

	/** Whether the series is visible */
	visible?: boolean;

	/** Line style for line/area charts */
	lineStyle?: LineStyle;

	/** Point style for scatter/line charts */
	pointStyle?: PointStyle;

	/** Fill style for area charts */
	fillStyle?: FillStyle;
}

/**
 * Line style configuration
 */
export interface LineStyle {
	/** Line width (1-5) */
	width?: number;

	/** Line dash pattern */
	dash?: number[];

	/** Whether to smooth the line */
	smooth?: boolean;
}

/**
 * Point style configuration
 */
export interface PointStyle {
	/** Point shape */
	shape?: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross';

	/** Point size */
	size?: number;

	/** Whether to fill the point */
	filled?: boolean;
}

/**
 * Fill style configuration
 */
export interface FillStyle {
	/** Fill color (defaults to series color with opacity) */
	color?: Color;

	/** Fill opacity (0-1) */
	opacity?: number;

	/** Pattern for fill */
	pattern?: 'solid' | 'striped' | 'dotted';
}

/**
 * Axis configuration
 */
export interface Axis {
	/** Axis type */
	type: 'linear' | 'log' | 'time' | 'category';

	/** Minimum value */
	min?: number;

	/** Maximum value */
	max?: number;

	/** Tick values */
	ticks?: number[];

	/** Tick labels */
	labels?: string[];

	/** Axis title */
	title?: string;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Grid line color */
	gridColor?: Color;

	/** Label formatter function */
	formatLabel?: (value: number) => string;

	/** Number of ticks to generate automatically */
	tickCount?: number;
}

/**
 * Legend configuration
 */
export interface Legend {
	/** Whether to show the legend */
	visible: boolean;

	/** Legend position */
	position: 'top' | 'bottom' | 'left' | 'right';

	/** Legend alignment */
	align?: 'start' | 'center' | 'end';

	/** Legend item spacing */
	itemSpacing?: number;

	/** Legend text color */
	textColor?: Color;

	/** Legend background color */
	backgroundColor?: Color;
}

/**
 * Chart theme configuration
 */
export interface ChartTheme {
	/** Background color */
	background: Color;

	/** Grid line color */
	gridColor: Color;

	/** Axis line color */
	axisColor: Color;

	/** Text color */
	textColor: Color;

	/** Title color */
	titleColor: Color;

	/** Subtitle color */
	subtitleColor: Color;

	/** Color palette for series */
	colors: Color[];

	/** Chart title font style */
	titleStyle?: TextStyle;

	/** Axis label font style */
	axisLabelStyle?: TextStyle;

	/** Legend font style */
	legendStyle?: TextStyle;
}

/**
 * Text style configuration
 */
export interface TextStyle {
	/** Font weight */
	bold?: boolean;

	/** Italic text */
	italic?: boolean;

	/** Underline */
	underline?: boolean;
}

/**
 * Chart padding configuration
 */
export interface ChartPadding {
	/** Top padding */
	top: number;

	/** Right padding */
	right: number;

	/** Bottom padding */
	bottom: number;

	/** Left padding */
	left: number;
}

/**
 * Chart margin configuration
 */
export interface ChartMargin {
	/** Top margin */
	top: number;

	/** Right margin */
	right: number;

	/** Bottom margin */
	bottom: number;

	/** Left margin */
	left: number;
}

/**
 * Viewport for chart display area
 */
export interface Viewport {
	/** X coordinate */
	x: number;

	/** Y coordinate */
	y: number;

	/** Width */
	width: number;

	/** Height */
	height: number;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
	/** Whether to show tooltips */
	enabled: boolean;

	/** Tooltip background color */
	backgroundColor?: Color;

	/** Tooltip text color */
	textColor?: Color;

	/** Tooltip border color */
	borderColor?: Color;

	/** Tooltip formatter function */
	formatter?: (point: DataPoint, series?: Series) => string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
	/** Whether animation is enabled */
	enabled: boolean;

	/** Animation duration in milliseconds */
	duration: number;

	/** Easing function name */
	easing: EasingFunction;
}

/**
 * Easing function types
 */
export type EasingFunction =
	| 'linear'
	| 'easeIn'
	| 'easeOut'
	| 'easeInOut'
	| 'elastic'
	| 'bounce'
	| 'backIn'
	| 'backOut';

/**
 * Chart orientation
 */
export type ChartOrientation = 'horizontal' | 'vertical';

/**
 * Bar chart grouping mode
 */
export type BarGroupingMode = 'grouped' | 'stacked';

/**
 * Heatmap cell data
 */
export interface HeatmapCell {
	/** X coordinate (column index) */
	x: number;

	/** Y coordinate (row index) */
	y: number;

	/** Cell value */
	value: number;

	/** Cell label */
	label?: string;
}

/**
 * Histogram bin data
 */
export interface HistogramBin {
	/** Bin minimum value */
	min: number;

	/** Bin maximum value */
	max: number;

	/** Bin count */
	count: number;

	/** Bin label */
	label?: string;
}

/**
 * Pie chart segment data
 */
export interface PieSegment {
	/** Segment label */
	label: string;

	/** Segment value */
	value: number;

	/** Segment color */
	color?: Color;

	/** Whether segment is exploded */
	exploded?: boolean;
}

/**
 * Tree node data
 */
export interface TreeNode {
	/** Node ID */
	id: string;

	/** Node label */
	label: string;

	/** Whether node is expanded */
	expanded?: boolean;

	/** Whether node is selected */
	selected?: boolean;

	/** Whether node is disabled */
	disabled?: boolean;

	/** Child nodes */
	children?: TreeNode[];

	/** Node icon (character) */
	icon?: string;

	/** Node metadata */
	metadata?: Record<string, unknown>;
}

/**
 * Table column definition
 */
export interface TableColumn {
	/** Column ID */
	id: string;

	/** Column header */
	header: string;

	/** Column width */
	width?: number;

	/** Whether column is sortable */
	sortable?: boolean;

	/** Column alignment */
	align?: 'left' | 'center' | 'right';

	/** Column formatter */
	formatter?: (value: unknown) => string;
}

/**
 * Table row data
 */
export interface TableRow {
	/** Row ID */
	id: string;

	/** Row cells (key-value pairs) */
	cells: Record<string, unknown>;

	/** Whether row is selected */
	selected?: boolean;

	/** Whether row is disabled */
	disabled?: boolean;
}

/**
 * Default chart theme
 */
export const DEFAULT_CHART_THEME: ChartTheme = {
	background: 'default',
	gridColor: 'gray',
	axisColor: 'white',
	textColor: 'default',
	titleColor: 'white',
	subtitleColor: 'gray',
	colors: [
		{rgb: [59, 130, 246]}, // blue-500
		{rgb: [34, 197, 94]}, // green-500
		{rgb: [239, 68, 68]}, // red-500
		{rgb: [234, 179, 8]}, // yellow-500
		{rgb: [168, 85, 247]}, // purple-500
		{rgb: [236, 72, 153]}, // pink-500
		{rgb: [6, 182, 212]}, // cyan-500
		{rgb: [249, 115, 22]}, // orange-500
	],
};

/**
 * Default legend configuration
 */
export const DEFAULT_LEGEND: Legend = {
	visible: true,
	position: 'bottom',
	align: 'center',
	itemSpacing: 2,
	textColor: 'default',
	backgroundColor: 'default',
};

/**
 * Default animation configuration
 */
export const DEFAULT_ANIMATION: AnimationConfig = {
	enabled: true,
	duration: 300,
	easing: 'easeInOut',
};

/**
 * Default chart padding
 */
export const DEFAULT_PADDING: ChartPadding = {
	top: 10,
	right: 10,
	bottom: 10,
	left: 10,
};
