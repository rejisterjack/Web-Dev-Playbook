/**
 * Gauge Widget Module
 *
 * Provides the GaugeWidget class for displaying gauges.
 * Supports arc-based gauge with real-time updates.
 *
 * @module visualization/gauge
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import type {ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Gauge widget props
 */
export interface GaugeProps extends WidgetProps {
	/** Current value */
	value: number;

	/** Minimum value */
	min: number;

	/** Maximum value */
	max: number;

	/** Whether to show value */
	showValue?: boolean;

	/** Gauge color */
	color?: any;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** Gauge title */
	title?: string;

	/** Gauge start angle (in radians) */
	startAngle?: number;

	/** Gauge end angle (in radians) */
	endAngle?: number;
}

/**
 * Gauge widget for displaying gauges
 */
export class GaugeWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'gauge';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showValue: true,
		startAngle: Math.PI * 0.75,
		endAngle: Math.PI * 2.25,
	};

	/** Current props */
	private _gaugeProps: Required<GaugeProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** Gauge center */
	private center: {x: number; y: number} = {x: 0, y: 0};

	/** Gauge radius */
	private radius: number = 0;

	/**
	 * Create a new gauge widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: GaugeProps) {
		super(props);
		this._gaugeProps = {
			...GaugeWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<GaugeProps>;
	}

	/**
	 * Get gauge props
	 */
	get gaugeProps(): Required<GaugeProps> {
		return {...this._gaugeProps};
	}

	/**
	 * Update gauge props
	 *
	 * @param props - New props
	 */
	updateGaugeProps(props: Partial<GaugeProps>): void {
		this._gaugeProps = {
			...this._gaugeProps,
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
		const {theme, padding} = this._gaugeProps;

		// Get screen buffer from context
		const buffer = context.layoutNode?.buffer;
		if (!buffer) {
			return;
		}

		// Create canvas
		this.canvas = new Canvas(buffer, rect);

		// Clear canvas
		this.canvas.clear(rect, theme.background);

		// Calculate gauge dimensions
		this.calculateGaugeDimensions(rect, padding);

		// Draw gauge background
		this.drawGaugeBackground();

		// Draw gauge value
		this.drawGaugeValue();

		// Draw value text
		if (this._gaugeProps.showValue) {
			this.drawValueText();
		}

		// Draw title
		if (this._gaugeProps.title) {
			this.drawTitle();
		}
	}

	/**
	 * Calculate gauge dimensions
	 */
	private calculateGaugeDimensions(rect: any, padding: ChartPadding): void {
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
	 * Draw gauge background
	 */
	private drawGaugeBackground(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, startAngle, endAngle} = this._gaugeProps;

		this.canvas.setContext({
			fg: theme.gridColor,
			bg: 'default',
			styles: {},
		});

		// Draw gauge arc using ASCII approximation
		this.drawArc(startAngle, endAngle, theme.gridColor, false);
	}

	/**
	 * Draw gauge value
	 */
	private drawGaugeValue(): void {
		if (!this.canvas) {
			return;
		}

		const {value, min, max, color, theme, startAngle, endAngle} = this._gaugeProps;

		// Clamp value to range
		const clampedValue = Math.max(min, Math.min(max, value));
		const normalizedValue = (clampedValue - min) / (max - min);

		// Calculate value angle
		const valueAngle = startAngle + normalizedValue * (endAngle - startAngle);

		// Draw value arc
		this.drawArc(startAngle, valueAngle, color ?? theme.colors[0], true);
	}

	/**
	 * Draw an arc
	 */
	private drawArc(startAngle: number, endAngle: number, color: any, filled: boolean): void {
		if (!this.canvas) {
			return;
		}

		const {center, radius} = this;

		this.canvas.setContext({
			fg: color,
			bg: color,
			styles: {},
		});

		// Draw arc using ASCII approximation
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist > radius || dist < radius - 1) {
					continue;
				}

				// Calculate angle
				const angle = Math.atan2(dy, dx);
				const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

				// Check if angle is in range
				let inRange = false;
				if (startAngle <= endAngle) {
					inRange = normalizedAngle >= startAngle && normalizedAngle <= endAngle;
				} else {
					inRange = normalizedAngle >= startAngle || normalizedAngle <= endAngle;
				}

				if (inRange) {
					const px = center.x + dx;
					const py = center.y + dy;
					this.canvas.drawPoint(px, py, '█', color);
				}
			}
		}
	}

	/**
	 * Draw value text
	 */
	private drawValueText(): void {
		if (!this.canvas) {
			return;
		}

		const {value, theme} = this._gaugeProps;

		const valueText = value.toFixed(1);
		const textX = this.center.x - Math.floor(valueText.length / 2);
		const textY = this.center.y + 1;

		this.canvas.setContext({
			fg: theme.textColor,
			bg: 'default',
			styles: {bold: true},
		});

		this.canvas.drawText(textX, textY, valueText, theme.textColor);
	}

	/**
	 * Draw title
	 */
	private drawTitle(): void {
		if (!this.canvas) {
			return;
		}

		const {title, theme} = this._gaugeProps;

		const titleX = this.center.x - Math.floor(title.length / 2);
		const titleY = this.center.y - this.radius - 2;

		this.canvas.setContext({
			fg: theme.textColor,
			bg: 'default',
			styles: {},
		});

		this.canvas.drawText(titleX, titleY, title, theme.textColor);
	}
}
