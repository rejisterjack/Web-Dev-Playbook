/**
 * Pie Chart Widget Module
 *
 * Provides the PieChartWidget class for displaying pie charts.
 * Supports donut chart variant with real-time updates.
 *
 * @module visualization/pie-chart
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import type {PieSegment, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Pie chart widget props
 */
export interface PieChartProps extends WidgetProps {
	/** Data segments to display */
	segments: PieSegment[];

	/** Whether to show labels */
	showLabels?: boolean;

	/** Whether to show legend */
	showLegend?: boolean;

	/** Whether to use donut chart variant */
	donut?: boolean;

	/** Donut hole size (0-1) */
	donutSize?: number;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;
}

/**
 * Pie chart widget for displaying pie charts
 */
export class PieChartWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'pie-chart';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showLabels: true,
		showLegend: true,
		donut: false,
		donutSize: 0.5,
	};

	/** Current props */
	private _chartProps: Required<PieChartProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** Chart center */
	private center: {x: number; y: number} = {x: 0, y: 0};

	/** Chart radius */
	private radius: number = 0;

	/**
	 * Create a new pie chart widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: PieChartProps) {
		super(props);
		this._chartProps = {
			...PieChartWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<PieChartProps>;
	}

	/**
	 * Get chart props
	 */
	get chartProps(): Required<PieChartProps> {
		return {...this._chartProps};
	}

	/**
	 * Update chart props
	 *
	 * @param props - New props
	 */
	updateChartProps(props: Partial<PieChartProps>): void {
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

		// Calculate chart dimensions
		this.calculateChartDimensions(rect, padding);

		// Draw pie segments
		this.drawSegments();

		// Draw labels
		if (this._chartProps.showLabels) {
			this.drawLabels();
		}

		// Draw legend
		if (this._chartProps.showLegend) {
			this.drawLegend();
		}
	}

	/**
	 * Calculate chart dimensions
	 */
	private calculateChartDimensions(rect: any, padding: ChartPadding): void {
		const width = rect.width - padding.left - padding.right;
		const height = rect.height - padding.top - padding.bottom;

		// Calculate center and radius
		this.center = {
			x: rect.x + padding.left + Math.floor(width / 2),
			y: rect.y + padding.top + Math.floor(height / 2),
		};

		this.radius = Math.min(Math.floor(width / 2), Math.floor(height / 2)) - 2;
	}

	/**
	 * Draw pie segments
	 */
	private drawSegments(): void {
		if (!this.canvas) {
			return;
		}

		const {segments, theme, donut, donutSize} = this._chartProps;

		// Calculate total value
		const total = segments.reduce((sum, s) => sum + s.value, 0);
		if (total === 0) {
			return;
		}

		// Draw each segment
		let startAngle = 0;
		for (const segment of segments) {
			const segmentAngle = (segment.value / total) * 2 * Math.PI;
			const endAngle = startAngle + segmentAngle;

			// Get segment color
			const color = segment.color ?? theme.colors[0];

			// Draw segment
			this.drawSegment(startAngle, endAngle, color, segment.exploded ?? false, donut, donutSize);

			startAngle = endAngle;
		}
	}

	/**
	 * Draw a single segment
	 */
	private drawSegment(startAngle: number, endAngle: number, color: any, exploded: boolean, donut: boolean, donutSize: number): void {
		if (!this.canvas) {
			return;
		}

		const {center, radius} = this;
		const effectiveRadius = exploded ? radius - 1 : radius;

		// Calculate explosion offset
		let offsetX = 0;
		let offsetY = 0;
		if (exploded) {
			const midAngle = (startAngle + endAngle) / 2;
			offsetX = Math.round(Math.cos(midAngle) * 2);
			offsetY = Math.round(Math.sin(midAngle) * 2);
		}

		// Draw segment using ASCII approximation
		this.canvas.setContext({
			fg: color,
			bg: color,
			styles: {},
		});

		// Draw filled circle approximation
		for (let dy = -effectiveRadius; dy <= effectiveRadius; dy++) {
			for (let dx = -effectiveRadius; dx <= effectiveRadius; dx++) {
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist > effectiveRadius) {
					continue;
				}

				// Check if point is in segment
				const angle = Math.atan2(dy, dx);
				const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

				// Handle angle wrapping
				let inSegment = false;
				if (startAngle <= endAngle) {
					inSegment = normalizedAngle >= startAngle && normalizedAngle <= endAngle;
				} else {
					inSegment = normalizedAngle >= startAngle || normalizedAngle <= endAngle;
				}

				if (inSegment) {
					// Check if point is in donut hole
					const innerRadius = donut ? radius * donutSize : 0;
					if (dist >= innerRadius) {
						const px = center.x + dx + offsetX;
						const py = center.y + dy + offsetY;
						this.canvas.drawPoint(px, py, '█', color);
					}
				}
			}
		}
	}

	/**
	 * Draw labels
	 */
	private drawLabels(): void {
		if (!this.canvas) {
			return;
		}

		const {segments, theme} = this._chartProps;

		// Calculate total value
		const total = segments.reduce((sum, s) => sum + s.value, 0);
		if (total === 0) {
			return;
		}

		// Draw labels for each segment
		let startAngle = 0;
		for (const segment of segments) {
			const segmentAngle = (segment.value / total) * 2 * Math.PI;
			const endAngle = startAngle + segmentAngle;
			const midAngle = (startAngle + endAngle) / 2;

			// Calculate label position
			const labelRadius = this.radius + 2;
			const labelX = this.center.x + Math.round(Math.cos(midAngle) * labelRadius);
			const labelY = this.center.y + Math.round(Math.sin(midAngle) * labelRadius);

			// Draw label
			const percentage = ((segment.value / total) * 100).toFixed(1);
			const label = `${segment.label} (${percentage}%)`;

			this.canvas.setContext({
				fg: theme.textColor,
				bg: 'default',
				styles: {},
			});

			this.canvas.drawText(labelX - Math.floor(label.length / 2), labelY, label, theme.textColor);

			startAngle = endAngle;
		}
	}

	/**
	 * Draw legend
	 */
	private drawLegend(): void {
		if (!this.canvas) {
			return;
		}

		const {segments, theme} = this._chartProps;
		const {x, y, width, height} = this.layoutNode?.bounds ?? {x: 0, y: 0, width: 0, height: 0};

		if (segments.length === 0) {
			return;
		}

		// Draw legend items at bottom
		let itemX = x + 2;
		const legendY = y + height - 2;

		for (const segment of segments) {
			const color = segment.color ?? theme.colors[0];

			// Draw color indicator
			this.canvas.drawPoint(itemX, legendY, '█', color);

			// Draw segment name
			this.canvas.drawText(itemX + 2, legendY, segment.label, theme.textColor);

			itemX += segment.label.length + 4;
		}
	}
}
