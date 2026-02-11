/**
 * Area Chart Widget Module
 *
 * Provides the AreaChartWidget class for displaying area charts.
 * Supports multiple series with stacked areas and real-time updates.
 *
 * @module visualization/area-chart
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import type {Series, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Area chart widget props
 */
export interface AreaChartProps extends WidgetProps {
	/** Data series to display */
	series: Series[];

	/** Whether to show data points */
	showPoints?: boolean;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Whether to stack areas */
	stacked?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** X-axis title */
	xAxisTitle?: string;

	/** Y-axis title */
	yAxisTitle?: string;
}

/**
 * Area chart widget for displaying area charts
 */
export class AreaChartWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'area-chart';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showPoints: false,
		showGrid: true,
		stacked: false,
	};

	/** Current props */
	private _chartProps: Required<AreaChartProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/**
	 * Create a new area chart widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: AreaChartProps) {
		super(props);
		this._chartProps = {
			...AreaChartWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<AreaChartProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get chart props
	 */
	get chartProps(): Required<AreaChartProps> {
		return {...this._chartProps};
	}

	/**
	 * Update chart props
	 *
	 * @param props - New props
	 */
	updateChartProps(props: Partial<AreaChartProps>): void {
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

		// Draw areas
		this.drawAreas();

		// Draw points
		if (this._chartProps.showPoints) {
			this.drawPoints();
		}
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
		const {series, stacked} = this._chartProps;

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

		// For stacked mode, calculate max stack height
		let maxStack = 0;
		if (stacked) {
			const maxDataPoints = Math.max(...series.map(s => s.data.length));
			for (let i = 0; i < maxDataPoints; i++) {
				let stack = 0;
				for (const s of series) {
					if (s.visible && s.data[i]) {
						stack += s.data[i].value;
					}
				}
				maxStack = Math.max(maxStack, stack);
			}
		}

		// Update scales
		const xDomain: [number, number] = [
			dataXMin === Infinity ? 0 : dataXMin,
			dataXMax === -Infinity ? 100 : dataXMax,
		];
		const yDomain: [number, number] = [
			0,
			stacked ? maxStack : (dataYMax === -Infinity ? 100 : dataYMax),
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
	 * Draw areas
	 */
	private drawAreas(): void {
		if (!this.canvas) {
			return;
		}

		const {series, theme, stacked} = this._chartProps;
		const {x, y, height} = this.chartArea;

		for (const s of series) {
			if (!s.visible || s.data.length === 0) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			// Draw area
			this.drawSeriesArea(s, x, y, height, color, stacked);
		}
	}

	/**
	 * Draw a series area
	 */
	private drawSeriesArea(series: Series, offsetX: number, offsetY: number, chartHeight: number, color: any, stacked: boolean): void {
		if (!this.canvas || series.data.length < 2) {
			return;
		}

		this.canvas.setContext({
			fg: color,
			bg: color,
			styles: {},
		});

		// Calculate area points
		const points: {x: number; y: number}[] = [];

		// Top edge of area
		for (const point of series.data) {
			const px = offsetX + this.xScale.scale(point.value);
			const py = offsetY + this.yScale.scale(point.value);
			points.push({x: px, y: py});
		}

		// Bottom edge of area (baseline)
		const baselineY = offsetY + chartHeight;
		for (let i = series.data.length - 1; i >= 0; i--) {
			const px = offsetX + this.xScale.scale(series.data[i].value);
			points.push({x: px, y: baselineY});
		}

		// Draw filled area using lines
		for (let i = 0; i < points.length - 1; i++) {
			const p1 = points[i];
			const p2 = points[i + 1];
			this.canvas.drawLine(p1.x, p1.y, p2.x, p2.y, '░', color);
		}

		// Draw top line
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
	 * Draw data points
	 */
	private drawPoints(): void {
		if (!this.canvas) {
			return;
		}

		const {series, theme} = this._chartProps;
		const {x, y} = this.chartArea;

		for (const s of series) {
			if (!s.visible || s.data.length === 0) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			this.canvas.setContext({
				fg: color,
				bg: 'default',
				styles: {},
			});

			for (const point of s.data) {
				const px = x + this.xScale.scale(point.value);
				const py = y + this.yScale.scale(point.value);
				this.canvas.drawPoint(px, py, '●', color);
			}
		}
	}
}
