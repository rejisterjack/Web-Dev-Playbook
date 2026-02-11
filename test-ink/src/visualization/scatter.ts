/**
 * Scatter Plot Widget Module
 *
 * Provides the ScatterPlotWidget class for displaying scatter plots.
 * Supports point sizes, colors, and regression lines with real-time updates.
 *
 * @module visualization/scatter
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import type {DataPoint, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Scatter plot widget props
 */
export interface ScatterPlotProps extends WidgetProps {
	/** Data points to display */
	data: DataPoint[];

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Whether to show regression line */
	showRegressionLine?: boolean;

	/** Point size */
	pointSize?: number;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** X-axis title */
	xAxisTitle?: string;

	/** Y-axis title */
	yAxisTitle?: string;

	/** Point color */
	pointColor?: any;

	/** Regression line color */
	regressionLineColor?: any;
}

/**
 * Scatter plot widget for displaying scatter plots
 */
export class ScatterPlotWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'scatter-plot';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showGrid: true,
		showRegressionLine: false,
		pointSize: 1,
	};

	/** Current props */
	private _chartProps: Required<ScatterPlotProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/**
	 * Create a new scatter plot widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: ScatterPlotProps) {
		super(props);
		this._chartProps = {
			...ScatterPlotWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<ScatterPlotProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get chart props
	 */
	get chartProps(): Required<ScatterPlotProps> {
		return {...this._chartProps};
	}

	/**
	 * Update chart props
	 *
	 * @param props - New props
	 */
	updateChartProps(props: Partial<ScatterPlotProps>): void {
		this._chartProps = {
			...this._chartProps,
			...props,
		};
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

		// Draw grid
		if (this._chartProps.showGrid) {
			this.drawGrid();
		}

		// Draw axes
		this.drawAxes();

		// Draw regression line
		if (this._chartProps.showRegressionLine) {
			this.drawRegressionLine();
		}

		// Draw points
		this.drawPoints();
	}

	/**
	 * Calculate chart area
	 */
	private calculateChartArea(rect: any, padding: ChartPadding): void {
		const {xAxisTitle, yAxisTitle} = this._chartProps;

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
		const {data} = this._chartProps;

		// Find data range
		let dataXMin = Infinity;
		let dataXMax = -Infinity;
		let dataYMin = Infinity;
		let dataYMax = -Infinity;

		for (const point of data) {
			dataXMin = Math.min(dataXMin, point.value);
			dataXMax = Math.max(dataXMax, point.value);
			dataYMin = Math.min(dataYMin, point.value);
			dataYMax = Math.max(dataYMax, point.value);
		}

		// Update scales
		const xDomain: [number, number] = [
			dataXMin === Infinity ? 0 : dataXMin,
			dataXMax === -Infinity ? 100 : dataXMax,
		];
		const yDomain: [number, number] = [
			dataYMin === Infinity ? 0 : dataYMin,
			dataYMax === -Infinity ? 100 : dataYMax,
		];

		this.xScale.domain(xDomain);
		this.xScale.range([0, this.chartArea.width]);
		this.yScale.domain(yDomain);
		this.yScale.range([this.chartArea.height, 0]);
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
		if (!this.canvas) {
			return;
		}

		const {theme, xAxisTitle, yAxisTitle} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		this.canvas.setContext({
			fg: theme.axisColor,
			bg: 'default',
			styles: {},
		});

		// Draw X-axis
		this.canvas.hLine(x, y + height, width, '─', theme.axisColor);

		// Draw Y-axis
		this.canvas.vLine(x, y, height, '│', theme.axisColor);

		// Draw titles
		if (xAxisTitle) {
			this.canvas.drawText(x + Math.floor(width / 2) - Math.floor(xAxisTitle.length / 2), y + height + 2, xAxisTitle, theme.textColor);
		}
		if (yAxisTitle) {
			const titleChars = Array.from(yAxisTitle);
			const titleY = y + Math.floor(height / 2) - Math.floor(titleChars.length / 2);
			for (let i = 0; i < titleChars.length; i++) {
				this.canvas.drawText(x - titleChars.length - 2, titleY + i, titleChars[i], theme.textColor);
			}
		}
	}

	/**
	 * Draw regression line
	 */
	private drawRegressionLine(): void {
		if (!this.canvas || this._chartProps.data.length < 2) {
			return;
		}

		const {data, regressionLineColor, theme} = this._chartProps;
		const {x, y, height} = this.chartArea;

		// Calculate linear regression
		const n = data.length;
		let sumX = 0;
		let sumY = 0;
		let sumXY = 0;
		let sumX2 = 0;

		for (const point of data) {
			const px = point.value;
			const py = point.value;
			sumX += px;
			sumY += py;
			sumXY += px * py;
			sumX2 += px * px;
		}

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		// Draw regression line
		const color = regressionLineColor ?? theme.textColor;
		this.canvas.setContext({
			fg: color,
			bg: 'default',
			styles: {},
		});

		const x1 = 0;
		const y1 = slope * x1 + intercept;
		const x2 = this.chartArea.width;
		const y2 = slope * x2 + intercept;

		const px1 = x + this.xScale.scale(x1);
		const py1 = y + this.yScale.scale(y1);
		const px2 = x + this.xScale.scale(x2);
		const py2 = y + this.yScale.scale(y2);

		this.canvas.drawLine(px1, py1, px2, py2, '─', color);
	}

	/**
	 * Draw data points
	 */
	private drawPoints(): void {
		if (!this.canvas) {
			return;
		}

		const {data, theme, pointSize, pointColor} = this._chartProps;
		const {x, y} = this.chartArea;

		const color = pointColor ?? theme.colors[0];
		const size = pointSize;

		this.canvas.setContext({
			fg: color,
			bg: 'default',
			styles: {},
		});

		for (const point of data) {
			const px = x + this.xScale.scale(point.value);
			const py = y + this.yScale.scale(point.value);

			// Draw point based on size
			if (size === 1) {
				this.canvas.drawPoint(px, py, '•', color);
			} else if (size === 2) {
				this.canvas.drawPoint(px, py, '●', color);
			} else {
				this.canvas.drawPoint(px, py, '█', color);
			}
		}
	}
}
