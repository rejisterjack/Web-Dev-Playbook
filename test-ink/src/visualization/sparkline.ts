/**
 * Sparkline Widget Module
 *
 * Provides the SparklineWidget class for displaying sparklines.
 * Compact line chart for displaying trends with real-time updates.
 *
 * @module visualization/sparkline
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import {LinearScale} from './scale.js';
import type {DataPoint, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Sparkline widget props
 */
export interface SparklineProps extends WidgetProps {
	/** Data points to display */
	points: DataPoint[];

	/** Sparkline color */
	color?: any;

	/** Whether to show last value */
	showLastValue?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;
}

/**
 * Sparkline widget for displaying sparklines
 */
export class SparklineWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'sparkline';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showLastValue: true,
	};

	/** Current props */
	private _sparklineProps: Required<SparklineProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** X-axis scale */
	private xScale: LinearScale;

	/** Y-axis scale */
	private yScale: LinearScale;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/**
	 * Create a new sparkline widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: SparklineProps) {
		super(props);
		this._sparklineProps = {
			...SparklineWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<SparklineProps>;

		// Initialize scales
		this.xScale = new LinearScale();
		this.yScale = new LinearScale();
	}

	/**
	 * Get sparkline props
	 */
	get sparklineProps(): Required<SparklineProps> {
		return {...this._sparklineProps};
	}

	/**
	 * Update sparkline props
	 *
	 * @param props - New props
	 */
	updateSparklineProps(props: Partial<SparklineProps>): void {
		this._sparklineProps = {
			...this._sparklineProps,
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
		const {theme, padding} = this._sparklineProps;

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

		// Draw sparkline
		this.drawSparkline();

		// Draw last value
		if (this._sparklineProps.showLastValue) {
			this.drawLastValue();
		}
	}

	/**
	 * Calculate chart area
	 */
	private calculateChartArea(rect: any, padding: ChartPadding): void {
		this.chartArea = {
			x: rect.x + padding.left,
			y: rect.y + padding.top,
			width: rect.width - padding.left - padding.right,
			height: rect.height - padding.top - padding.bottom,
		};
	}

	/**
	 * Update scales based on data
	 */
	private updateScales(): void {
		const {points} = this._sparklineProps;

		// Find data range
		let dataMin = Infinity;
		let dataMax = -Infinity;

		for (const point of points) {
			dataMin = Math.min(dataMin, point.value);
			dataMax = Math.max(dataMax, point.value);
		}

		// Update scales
		const xDomain: [number, number] = [0, Math.max(1, points.length - 1)];
		const yDomain: [number, number] = [
			dataMin === Infinity ? 0 : dataMin,
			dataMax === -Infinity ? 100 : dataMax,
		];

		this.xScale.domain(xDomain);
		this.xScale.range([0, this.chartArea.width]);
		this.yScale.domain(yDomain);
		this.yScale.range([this.chartArea.height, 0]);
	}

	/**
	 * Draw sparkline
	 */
	private drawSparkline(): void {
		if (!this.canvas) {
			return;
		}

		const {points, color, theme} = this._sparklineProps;
		const {x, y} = this.chartArea;

		if (points.length < 2) {
			return;
		}

		const lineColor = color ?? theme.colors[0];

		this.canvas.setContext({
			fg: lineColor,
			bg: 'default',
			styles: {},
		});

		// Draw line segments
		for (let i = 0; i < points.length - 1; i++) {
			const p1 = points[i];
			const p2 = points[i + 1];

			const x1 = x + this.xScale.scale(i);
			const y1 = y + this.yScale.scale(p1.value);
			const x2 = x + this.xScale.scale(i + 1);
			const y2 = y + this.yScale.scale(p2.value);

			this.canvas.drawLine(x1, y1, x2, y2, '•', lineColor);
		}
	}

	/**
	 * Draw last value
	 */
	private drawLastValue(): void {
		if (!this.canvas) {
			return;
		}

		const {points, theme} = this._sparklineProps;
		const {x, y, width} = this.chartArea;

		if (points.length === 0) {
			return;
		}

		const lastValue = points[points.length - 1].value;
		const valueText = lastValue.toFixed(1);

		this.canvas.setContext({
			fg: theme.textColor,
			bg: 'default',
			styles: {bold: true},
		});

		// Draw value at the end of the sparkline
		const textX = x + width - valueText.length;
		const textY = y;

		this.canvas.drawText(textX, textY, valueText, theme.textColor);
	}
}
