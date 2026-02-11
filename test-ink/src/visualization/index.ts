/**
 * Visualization Module Index
 *
 * Exports all visualization components and utilities.
 *
 * @module visualization
 */

// Types
export type {
	DataPoint,
	Series,
	Axis,
	Legend,
	ChartTheme,
	TextStyle,
	ChartPadding,
	ChartMargin,
	Viewport,
	TooltipConfig,
	AnimationConfig as ChartAnimationConfig,
	EasingFunction,
	ChartOrientation,
	BarGroupingMode,
	HeatmapCell,
	HistogramBin,
	PieSegment,
	TreeNode,
	TableColumn,
	TableRow,
} from './types.js';

export {
	DEFAULT_CHART_THEME,
	DEFAULT_LEGEND,
	DEFAULT_ANIMATION,
	DEFAULT_PADDING,
} from './types.js';

// Canvas
export {Canvas} from './canvas.js';
export type {ClipRegion, Transform, DrawContext} from './canvas.js';

// Scales
export {LinearScale, LogScale, TimeScale, CategoryScale} from './scale.js';
export type {NumericScale} from './scale.js';

// Axis Renderer
export {AxisRenderer} from './axis.js';
export type {AxisRendererConfig, AxisOrientation, AxisPosition} from './axis.js';

// Chart Widgets
export {LineChartWidget} from './line-chart.js';
export type {LineChartProps} from './line-chart.js';

export {BarChartWidget} from './bar-chart.js';
export type {BarChartProps} from './bar-chart.js';

export {AreaChartWidget} from './area-chart.js';
export type {AreaChartProps} from './area-chart.js';

export {ScatterPlotWidget} from './scatter.js';
export type {ScatterPlotProps} from './scatter.js';

export {PieChartWidget} from './pie-chart.js';
export type {PieChartProps} from './pie-chart.js';

export {GaugeWidget} from './gauge.js';
export type {GaugeProps} from './gauge.js';

export {SparklineWidget} from './sparkline.js';
export type {SparklineProps} from './sparkline.js';

export {HistogramWidget} from './histogram.js';
export type {HistogramProps} from './histogram.js';

export {HeatmapWidget} from './heatmap.js';
export type {HeatmapProps, ColorScaleFunction} from './heatmap.js';

export {TableWidget} from './table.js';
export type {TableProps} from './table.js';

export {TreeViewWidget} from './tree.js';
export type {TreeViewProps} from './tree.js';

// Real-time Data Manager
export {RealTimeDataManager} from './realtime.js';
export type {RealTimeDataManagerConfig, AggregationType} from './realtime.js';

// Animation Manager
export {AnimationManager} from './animation.js';
export type {
	AnimationState,
	AnimationFrameCallback,
	AnimationCompleteCallback,
	AnimationConfig,
} from './animation.js';
