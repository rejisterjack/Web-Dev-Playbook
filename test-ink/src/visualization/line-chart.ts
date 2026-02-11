/**
 * Line Chart Widget Module
 *
 * Provides the LineChartWidget class for displaying line charts.
 * Supports multiple series, real-time updates, zooming, and panning.
 *
 * @module visualization/line-chart
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps, WidgetState} from '../widgets/types.js';
import type {ScreenBuffer} from '../rendering/buffer.js';
import type {Rect} from '../layout/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import {AxisRenderer, AxisPosition} from './axis.js';
import type {Series, ChartTheme, ChartPadding, Legend} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING, DEFAULT_LEGEND} from './types.js';

/**
 * Line chart widget props
 */
export interface LineChartProps extends WidgetProps {
	/** Data series to display */
	series: Series[];

	/** Whether to show data points */
	showPoints?: boolean;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Whether to show legend */
	showLegend?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** Legend configuration */
	legend?: Legend;

	/** X-axis title */
	xAxisTitle?: string;

	/** Y-axis title */
	yAxisTitle?: string;

	/** Whether to enable zooming */
	enableZoom?: boolean;

	/** Whether to enable panning */
	enablePan?: boolean;

	/** Minimum X value for zooming */
	xMin?: number;

	/** Maximum X value for zooming */
	xMax?: number;

	/** Minimum Y value for zooming */
	yMin?: number;

	/** Maximum Y value for zooming */
	yMax?: number;
}

/**
 * Line chart widget state
 */
interface LineChartState extends WidgetState {
	/** Current X-axis zoom range */
	xRange: [number, number];

	/** Current Y-axis zoom range */
	yRange: [number, number];

	/** Pan offset X */
	panX: number;

	/** Pan offset Y */
	panY: number;
}

/**
 * Line chart widget for displaying line charts
 */
export class LineChartWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'line-chart';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showPoints: true,
		showGrid: true,
		showLegend: true,
		enableZoom: false,
		enablePan: false,
	};

	/** Current props */
	private _chartProps: Required<LineChartProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** X-axis renderer */
	private xAxisRenderer: AxisRenderer | null = null;

	/** Y-axis renderer */
	private yAxisRenderer: AxisRenderer | null = null;

	/** Chart area (excluding axes and padding) */
	private chartArea: Rect = {x: 0, y: 0, width: 0, height: 0};

	/**
	 * Create a new line chart widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: LineChartProps) {
		super(props);
		this._chartProps = {
			...LineChartWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
			legend: props.legend ?? DEFAULT_LEGEND,
		} as Required<LineChartProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get chart props
	 */
	get chartProps(): Required<LineChartProps> {
		return {...this._chartProps};
	}

	/**
	 * Update chart props
	 *
	 * @param props - New props
	 */
	updateChartProps(props: Partial<LineChartProps>): void {
		this._chartProps = {
			...this._chartProps,
			...props,
		};
		this.requestRender();
	}

	/**
	 * Get initial state
	 */
	protected getInitialState(): LineChartState {
		return {
			...super.getInitialState(),
			xRange: [0, 100],
			yRange: [0, 100],
			panX: 0,
			panY: 0,
		};
	}

	/**
	 * Mount the widget
	 */
	mount(): void {
		super.mount();
		this.updateScales();
	}

	/**
	 * Update the widget
	 */
	update(props: Partial<LineChartProps>): void {
		this.updateChartProps(props);
		this.updateScales();
		super.update(props);
	}

	/**
	 * Render the widget
	 */
	render(context: any): void {
		if (!this.layoutNode) {
			return;
		}

		const rect = this.layoutNode.bounds;
		const {theme, padding} = this._chartProps;

		// Get screen buffer from context
		const buffer = context.layoutNode?.buffer;
		if (!buffer) {
			return;
		}

		// Create canvas
		this.canvas = new Canvas(buffer, rect);

		// Clear canvas
		this.canvas.clear(rect, theme.background);

		// Calculate chart area
		this.calculateChartArea(rect, padding);

		// Update scales
		this.updateScales();

		// Create axis renderers
		this.createAxisRenderers();

		// Draw grid
		if (this._chartProps.showGrid) {
			this.drawGrid();
		}

		// Draw axes
		this.drawAxes();

		// Draw data series
		this.drawSeries();

		// Draw legend
		if (this._chartProps.showLegend) {
			this.drawLegend();
		}
	}

	/**
	 * Calculate chart area (excluding axes and padding)
	 */
	private calculateChartArea(rect: Rect, padding: ChartPadding): void {
		const {xAxisTitle, yAxisTitle} = this._chartProps;

		// Estimate axis space
		const axisSpace = {
			left: yAxisTitle ? 4 : 3,
			right: 2,
			top: xAxisTitle ? 3 : 2,
			bottom: xAxisTitle ? 4 : 3,
		};

		this.chartArea = {
			x: rect.x + padding.left + axisSpace.left,
			y: rect.y + padding.top + axisSpace.top,
			width: rect.width - padding.left - padding.right - axisSpace.left - axisSpace.right,
			height: rect.height - padding.top - padding.bottom - axisSpace.top - axisSpace.bottom,
		};
	}

	/**
	 * Update scales based on data
	 */
	private updateScales(): void {
		const {series, xMin, xMax, yMin, yMax} = this._chartProps;

		// Find data range
		let dataXMin = Infinity;
		let dataXMax = -Infinity;
		let dataYMin = Infinity;
		let dataYMax = -Infinity;

		for (const s of series) {
			if (!s.visible) {
				continue;
			}
			for (const point of s.data) {
				dataXMin = Math.min(dataXMin, point.value);
				dataXMax = Math.max(dataXMax, point.value);
				dataYMin = Math.min(dataYMin, point.value);
				dataYMax = Math.max(dataYMax, point.value);
			}
		}

		// Use provided range or data range
		const xDomain: [number, number] = [
			xMin ?? (dataXMin === Infinity ? 0 : dataXMin),
			xMax ?? (dataXMax === -Infinity ? 100 : dataXMax),
		];
		const yDomain: [number, number] = [
			yMin ?? (dataYMin === Infinity ? 0 : dataYMin),
			yMax ?? (dataYMax === -Infinity ? 100 : dataYMax),
		];

		// Update scales
		this.xScale.domain(xDomain);
		this.xScale.range([0, this.chartArea.width]);
		this.yScale.domain(yDomain);
		this.yScale.range([this.chartArea.height, 0]);
	}

	/**
	 * Create axis renderers
	 */
	private createAxisRenderers(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, xAxisTitle, yAxisTitle} = this._chartProps;

		// X-axis renderer
		this.xAxisRenderer = new AxisRenderer(this.canvas, {
			orientation: 'horizontal',
			position: 'bottom',
			scale: this.xScale,
			title: xAxisTitle,
			showGrid: this._chartProps.showGrid,
			gridColor: theme.gridColor,
			axisColor: theme.axisColor,
			textColor: theme.textColor,
			tickCount: 5,
		});

		// Y-axis renderer
		this.yAxisRenderer = new AxisRenderer(this.canvas, {
			orientation: 'vertical',
			position: 'left',
			scale: this.yScale,
			title: yAxisTitle,
			showGrid: this._chartProps.showGrid,
			gridColor: theme.gridColor,
			axisColor: theme.axisColor,
			textColor: theme.textColor,
			tickCount: 5,
		});
	}

	/**
	 * Draw grid lines
	 */
	private drawGrid(): void {
		if (!this.canvas) {
			return;
		}

		const {theme} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		this.canvas.setContext({
			fg: theme.gridColor,
			bg: 'default',
			styles: {},
		});

		// Draw horizontal grid lines
		const yTicks = this.yScale.ticks(5);
		for (const tick of yTicks) {
			const tickY = this.yScale.scale(tick);
			this.canvas.hLine(x, y + tickY, width, '─', theme.gridColor);
		}

		// Draw vertical grid lines
		const xTicks = this.xScale.ticks(5);
		for (const tick of xTicks) {
			const tickX = this.xScale.scale(tick);
			this.canvas.vLine(x + tickX, y, height, '│', theme.gridColor);
		}
	}

	/**
	 * Draw axes
	 */
	private drawAxes(): void {
		if (!this.xAxisRenderer || !this.yAxisRenderer) {
			return;
		}

		const {x, y, width, height} = this.chartArea;

		// Draw X-axis
		this.xAxisRenderer.render(x, y + height, width);

		// Draw Y-axis
		this.yAxisRenderer.render(x, y, height);
	}

	/**
	 * Draw data series
	 */
	private drawSeries(): void {
		if (!this.canvas) {
			return;
		}

		const {series, theme, showPoints} = this._chartProps;
		const {x, y} = this.chartArea;

		for (const s of series) {
			if (!s.visible || s.data.length === 0) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			// Draw line
			this.drawSeriesLine(s, x, y, color);

			// Draw points
			if (showPoints) {
				this.drawSeriesPoints(s, x, y, color);
			}
		}
	}

	/**
	 * Draw a series line
	 */
	private drawSeriesLine(series: Series, offsetX: number, offsetY: number, color: any): void {
		if (!this.canvas || series.data.length < 2) {
			return;
		}

		this.canvas.setContext({
			fg: color,
			bg: 'default',
			styles: {},
		});

		// Draw line segments
		for (let i = 0; i < series.data.length - 1; i++) {
			const p1 = series.data[i];
			const p2 = series.data[i + 1];

			const x1 = offsetX + this.xScale.scale(p1.value);
			const y1 = offsetY + this.yScale.scale(p1.value);
			const x2 = offsetX + this.xScale.scale(p2.value);
			const y2 = offsetY + this.yScale.scale(p2.value);

			this.canvas.drawLine(x1, y1, x2, y2, '•', color);
		}
	}

	/**
	 * Draw series points
	 */
	private drawSeriesPoints(series: Series, offsetX: number, offsetY: number, color: any): void {
		if (!this.canvas) {
			return;
		}

		this.canvas.setContext({
			fg: color,
			bg: 'default',
			styles: {},
		});

		for (const point of series.data) {
			const px = offsetX + this.xScale.scale(point.value);
			const py = offsetY + this.yScale.scale(point.value);
			this.canvas.drawPoint(px, py, '●', color);
		}
	}

	/**
	 * Draw legend
	 */
	private drawLegend(): void {
		if (!this.canvas) {
			return;
		}

		const {series, legend, theme} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		if (!legend.visible || series.length === 0) {
			return;
		}

		// Calculate legend position
		let legendX = x;
		let legendY = y + height + 2;

		if (legend.position === 'top') {
			legendY = y - 2;
		} else if (legend.position === 'left') {
			legendX = x - 2;
			legendY = y;
		} else if (legend.position === 'right') {
			legendX = x + width + 2;
			legendY = y;
		}

		// Draw legend items
		let itemX = legendX;
		for (const s of series) {
			if (!s.visible) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			// Draw color indicator
			this.canvas.drawPoint(itemX, legendY, '●', color);

			// Draw series name
			this.canvas.drawText(itemX + 2, legendY, s.name, legend.textColor);

			itemX += s.name.length + 4;
		}
	}

	/**
	 * Request a re-render
	 */
	private requestRender(): void {
		// This would trigger a re-render through the widget system
		// For now, we'll just mark the widget as needing update
	}
}
