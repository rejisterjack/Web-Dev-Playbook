/**
 * Histogram Widget Module
 *
 * Provides the HistogramWidget class for displaying histograms.
 * Supports automatic bin calculation with real-time updates.
 *
 * @module visualization/histogram
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import type {HistogramBin, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Histogram widget props
 */
export interface HistogramProps extends WidgetProps {
	/** Data values to display */
	values: number[];

	/** Number of bins (0 for automatic) */
	bins?: number;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Whether to show labels */
	showLabels?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** X-axis title */
	xAxisTitle?: string;

	/** Y-axis title */
	yAxisTitle?: string;

	/** Bar color */
	barColor?: any;
}

/**
 * Histogram widget for displaying histograms
 */
export class HistogramWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'histogram';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		bins: 0,
		showGrid: true,
		showLabels: true,
	};

	/** Current props */
	private _histogramProps: Required<HistogramProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Computed bins */
	private _bins: HistogramBin[] = [];

	/**
	 * Create a new histogram widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: HistogramProps) {
		super(props);
		this._histogramProps = {
			...HistogramWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<HistogramProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get histogram props
	 */
	get histogramProps(): Required<HistogramProps> {
		return {...this._histogramProps};
	}

	/**
	 * Update histogram props
	 *
	 * @param props - New props
	 */
	updateHistogramProps(props: Partial<HistogramProps>): void {
		this._histogramProps = {
			...this._histogramProps,
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
		const {theme, padding} = this._histogramProps;

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

		// Calculate bins
		this.calculateBins();

		// Update scales
		this.updateScales();

		// Draw grid
		if (this._histogramProps.showGrid) {
			this.drawGrid();
		}

		// Draw axes
		this.drawAxes();

		// Draw bars
		this.drawBars();

		// Draw labels
		if (this._histogramProps.showLabels) {
			this.drawLabels();
		}
	}

	/**
	 * Calculate chart area
	 */
	private calculateChartArea(rect: any, padding: ChartPadding): void {
		const {xAxisTitle, yAxisTitle} = this._histogramProps;

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
	 * Calculate histogram bins
	 */
	private calculateBins(): void {
		const {values, bins} = this._histogramProps;

		if (values.length === 0) {
			this._bins = [];
			return;
		}

		// Find data range
		const min = Math.min(...values);
		const max = Math.max(...values);

		// Calculate number of bins
		const numBins = bins > 0 ? bins : Math.ceil(Math.sqrt(values.length));

		// Calculate bin width
		const binWidth = (max - min) / numBins;

		// Initialize bins
		this._bins = [];
		for (let i = 0; i < numBins; i++) {
			this._bins.push({
				min: min + i * binWidth,
				max: min + (i + 1) * binWidth,
				count: 0,
				label: `${(min + i * binWidth).toFixed(1)}`,
			});
		}

		// Count values in each bin
		for (const value of values) {
			const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
			this._bins[binIndex].count++;
		}
	}

	/**
	 * Update scales based on bins
	 */
	private updateScales(): void {
		const maxCount = Math.max(...this._bins.map(b => b.count), 1);

		// Update scales
		const xDomain: [number, number] = [0, this._bins.length];
		const yDomain: [number, number] = [0, maxCount];

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

		const {theme} = this._histogramProps;
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
	}

	/**
	 * Draw axes
	 */
	private drawAxes(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, xAxisTitle, yAxisTitle} = this._histogramProps;
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
	 * Draw bars
	 */
	private drawBars(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, barColor} = this._histogramProps;
		const {x, y, height} = this.chartArea;

		const color = barColor ?? theme.colors[0];
		const barWidth = Math.max(1, Math.floor(this.chartArea.width / this._bins.length * 0.8));

		this.canvas.setContext({
			fg: color,
			bg: color,
			styles: {},
		});

		for (let i = 0; i < this._bins.length; i++) {
			const bin = this._bins[i];
			const barHeight = this.yScale.scale(bin.count);
			const barX = x + this.xScale.scale(i) + Math.floor((this.chartArea.width / this._bins.length - barWidth) / 2);
			const barY = y + height - barHeight;

			this.canvas.fill(barX, barY, barWidth, barHeight, '█', color, color);
		}
	}

	/**
	 * Draw labels
	 */
	private drawLabels(): void {
		if (!this.canvas) {
			return;
		}

		const {theme} = this._histogramProps;
		const {x, y, height} = this.chartArea;

		this.canvas.setContext({
			fg: theme.textColor,
			bg: 'default',
			styles: {},
		});

		for (let i = 0; i < this._bins.length; i++) {
			const bin = this._bins[i];
			const label = bin.label ?? `${bin.min.toFixed(1)}`;
			const labelX = x + this.xScale.scale(i) + Math.floor(this.chartArea.width / this._bins.length / 2) - Math.floor(label.length / 2);
			const labelY = y + height + 1;

			this.canvas.drawText(labelX, labelY, label, theme.textColor);
		}
	}
}
