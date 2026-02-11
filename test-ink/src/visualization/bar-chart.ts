/**
 * Bar Chart Widget Module
 *
 * Provides the BarChartWidget class for displaying bar charts.
 * Supports stacked and grouped bars with real-time updates.
 *
 * @module visualization/bar-chart
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import {AxisRenderer} from './axis.js';
import type {Series, ChartTheme, ChartPadding, ChartOrientation, BarGroupingMode} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Bar chart widget props
 */
export interface BarChartProps extends WidgetProps {
	/** Data series to display */
	series: Series[];

	/** Chart orientation */
	orientation?: ChartOrientation;

	/** Bar grouping mode */
	groupingMode?: BarGroupingMode;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Whether to show legend */
	showLegend?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** X-axis title */
	xAxisTitle?: string;

	/** Y-axis title */
	yAxisTitle?: string;

	/** Bar width (0-1, relative to available space) */
	barWidth?: number;
}

/**
 * Bar chart widget for displaying bar charts
 */
export class BarChartWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'bar-chart';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		orientation: 'vertical' as ChartOrientation,
		groupingMode: 'grouped' as BarGroupingMode,
		showGrid: true,
		showLegend: true,
		barWidth: 0.8,
	};

	/** Current props */
	private _chartProps: Required<BarChartProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/**
	 * Create a new bar chart widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: BarChartProps) {
		super(props);
		this._chartProps = {
			...BarChartWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<BarChartProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get chart props
	 */
	get chartProps(): Required<BarChartProps> {
		return {...this._chartProps};
	}

	/**
	 * Update chart props
	 *
	 * @param props - New props
	 */
	updateChartProps(props: Partial<BarChartProps>): void {
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

		// Draw bars
		this.drawBars();

		// Draw legend
		if (this._chartProps.showLegend) {
			this.drawLegend();
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
		const {series, groupingMode, orientation} = this._chartProps;

		// Find data range
		let dataMin = Infinity;
		let dataMax = -Infinity;
		let maxStack = 0;

		for (const s of series) {
			if (!s.visible) {
				continue;
			}
			for (const point of s.data) {
				dataMin = Math.min(dataMin, point.value);
				dataMax = Math.max(dataMax, point.value);
			}
		}

		// For stacked mode, calculate max stack height
		if (groupingMode === 'stacked') {
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
		if (orientation === 'vertical') {
			const yDomain: [number, number] = [0, groupingMode === 'stacked' ? maxStack : dataMax];
			this.yScale.domain(yDomain);
			this.yScale.range([this.chartArea.height, 0]);

			const xDomain: [number, number] = [0, series.length];
			this.xScale.domain(xDomain);
			this.xScale.range([0, this.chartArea.width]);
		} else {
			const xDomain: [number, number] = [0, groupingMode === 'stacked' ? maxStack : dataMax];
			this.xScale.domain(xDomain);
			this.xScale.range([0, this.chartArea.width]);

			const yDomain: [number, number] = [0, series.length];
			this.yScale.domain(yDomain);
			this.yScale.range([this.chartArea.height, 0]);
		}
	}

	/**
	 * Draw grid lines
	 */
	private drawGrid(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, orientation} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		this.canvas.setContext({
			fg: theme.gridColor,
			bg: 'default',
			styles: {},
		});

		if (orientation === 'vertical') {
			// Draw horizontal grid lines
			const yTicks = this.yScale.ticks(5);
			for (const tick of yTicks) {
				const tickY = this.yScale.scale(tick);
				this.canvas.hLine(x, y + tickY, width, '─', theme.gridColor);
			}
		} else {
			// Draw vertical grid lines
			const xTicks = this.xScale.ticks(5);
			for (const tick of xTicks) {
				const tickX = this.xScale.scale(tick);
				this.canvas.vLine(x + tickX, y, height, '│', theme.gridColor);
			}
		}
	}

	/**
	 * Draw axes
	 */
	private drawAxes(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, xAxisTitle, yAxisTitle, orientation} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		this.canvas.setContext({
			fg: theme.axisColor,
			bg: 'default',
			styles: {},
		});

		if (orientation === 'vertical') {
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
		} else {
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
	}

	/**
	 * Draw bars
	 */
	private drawBars(): void {
		if (!this.canvas) {
			return;
		}

		const {series, theme, groupingMode, orientation, barWidth} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		for (const s of series) {
			if (!s.visible || s.data.length === 0) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			for (let i = 0; i < s.data.length; i++) {
				const point = s.data[i];
				const value = point.value;

				if (orientation === 'vertical') {
					// Calculate bar position
					const barX = x + this.xScale.scale(i);
					const barHeight = this.yScale.scale(value);
					const barY = y + height - barHeight;
					const barW = Math.max(1, Math.floor(width / series.length * barWidth));

					// Draw bar
					this.canvas.fill(barX, barY, barW, barHeight, '█', color, color);
				} else {
					// Calculate bar position
					const barY = y + this.yScale.scale(i);
					const barWidth = this.xScale.scale(value);
					const barX = x;
					const barH = Math.max(1, Math.floor(height / series.length * barWidth));

					// Draw bar
					this.canvas.fill(barX, barY, barWidth, barH, '█', color, color);
				}
			}
		}
	}

	/**
	 * Draw legend
	 */
	private drawLegend(): void {
		if (!this.canvas) {
			return;
		}

		const {series, theme} = this._chartProps;
		const {x, y, width, height} = this.chartArea;

		if (series.length === 0) {
			return;
		}

		// Draw legend items at bottom
		let itemX = x;
		const legendY = y + height + 2;

		for (const s of series) {
			if (!s.visible) {
				continue;
			}

			const color = s.color ?? theme.colors[0];

			// Draw color indicator
			this.canvas.drawPoint(itemX, legendY, '█', color);

			// Draw series name
			this.canvas.drawText(itemX + 2, legendY, s.name, theme.textColor);

			itemX += s.name.length + 4;
		}
	}
}
