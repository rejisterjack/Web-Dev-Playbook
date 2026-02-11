/**
 * Axis Renderer Module
 *
 * Provides the AxisRenderer class for rendering axes with ticks and labels.
 * Supports custom tick formats and grid lines.
 *
 * @module visualization/axis
 */

import type {Color} from '../rendering/cell.js';
import type {Canvas} from './canvas.js';
import type {NumericScale} from './scale.js';
import type {Axis as AxisConfig} from './types.js';

/**
 * Axis orientation
 */
export type AxisOrientation = 'horizontal' | 'vertical';

/**
 * Axis position
 */
export type AxisPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Axis renderer configuration
 */
export interface AxisRendererConfig {
	/** Axis orientation */
	orientation: AxisOrientation;

	/** Axis position */
	position: AxisPosition;

	/** Scale for the axis */
	scale: NumericScale;

	/** Axis title */
	title?: string;

	/** Whether to show grid lines */
	showGrid?: boolean;

	/** Grid line color */
	gridColor?: Color;

	/** Axis line color */
	axisColor?: Color;

	/** Text color */
	textColor?: Color;

	/** Label formatter function */
	formatLabel?: (value: number) => string;

	/** Number of ticks */
	tickCount?: number;

	/** Tick length */
	tickLength?: number;

	/** Whether to show tick labels */
	showLabels?: boolean;

	/** Padding around axis */
	padding?: number;
}

/**
 * Axis renderer for drawing axes with ticks and labels
 */
export class AxisRenderer {
	/** Axis configuration */
	private config: AxisRendererConfig;

	/** Canvas for drawing */
	private canvas: Canvas;

	/** Computed tick values */
	private _ticks: number[] = [];

	/**
	 * Create a new axis renderer
	 *
	 * @param canvas - Canvas for drawing
	 * @param config - Axis configuration
	 */
	constructor(canvas: Canvas, config: AxisRendererConfig) {
		this.canvas = canvas;
		this.config = {
			tickLength: 5,
			showGrid: false,
			showLabels: true,
			padding: 2,
			...config,
		};
	}

	/**
	 * Get axis configuration
	 */
	getConfig(): AxisRendererConfig {
		return {...this.config};
	}

	/**
	 * Update axis configuration
	 *
	 * @param config - New configuration
	 */
	updateConfig(config: Partial<AxisRendererConfig>): void {
		this.config = {...this.config, ...config};
	}

	/**
	 * Get tick values
	 */
	getTicks(): number[] {
		return this._ticks;
	}

	/**
	 * Compute tick values
	 */
	computeTicks(): void {
		this._ticks = this.config.scale.ticks(this.config.tickCount);
	}

	/**
	 * Render the axis
	 *
	 * @param x - X position
	 * @param y - Y position
	 * @param length - Axis length
	 */
	render(x: number, y: number, length: number): void {
		this.computeTicks();

		const {orientation, position, scale, showGrid, gridColor, axisColor, textColor, tickLength, showLabels, padding} = this.config;

		// Set drawing context
		this.canvas.setContext({
			fg: axisColor ?? 'white',
			bg: 'default',
			styles: {},
		});

		// Draw axis line
		if (orientation === 'horizontal') {
			this.canvas.hLine(x, y, length, '─', axisColor);
		} else {
			this.canvas.vLine(x, y, length, '│', axisColor);
		}

		// Draw ticks and labels
		for (const tick of this._ticks) {
			const tickPos = scale.scale(tick);

			if (orientation === 'horizontal') {
				this.renderHorizontalTick(x + tickPos, y, tick, tickLength ?? 5, showGrid ?? false, gridColor, textColor, showLabels ?? true, padding ?? 2, position);
			} else {
				this.renderVerticalTick(x, y + tickPos, tick, tickLength ?? 5, showGrid ?? false, gridColor, textColor, showLabels ?? true, padding ?? 2, position);
			}
		}

		// Draw title
		if (this.config.title) {
			this.renderTitle(x, y, length, position);
		}
	}

	/**
	 * Render a horizontal tick
	 */
	private renderHorizontalTick(
		x: number,
		y: number,
		value: number,
		tickLength: number,
		showGrid: boolean,
		gridColor: Color | undefined,
		textColor: Color | undefined,
		showLabels: boolean,
		padding: number,
		position: AxisPosition,
	): void {
		const {scale, formatLabel} = this.config;

		// Draw grid line
		if (showGrid) {
			this.canvas.setContext({
				fg: gridColor ?? 'gray',
				bg: 'default',
				styles: {},
			});

			const gridLength = position === 'top' ? tickLength : -tickLength;
			this.canvas.vLine(x, y + gridLength, Math.abs(gridLength), '│', gridColor);
		}

		// Draw tick mark
		this.canvas.setContext({
			fg: this.config.axisColor ?? 'white',
			bg: 'default',
			styles: {},
		});

		const tickY = position === 'top' ? y - tickLength : y + tickLength;
		this.canvas.vLine(x, Math.min(y, tickY), tickLength + 1, '│', this.config.axisColor);

		// Draw label
		if (showLabels) {
			const label = formatLabel ? formatLabel(value) : this.formatValue(value);
			const labelY = position === 'top' ? y - tickLength - padding : y + tickLength + padding;

			this.canvas.setContext({
				fg: textColor ?? 'default',
				bg: 'default',
				styles: {},
			});

			// Center the label
			const labelX = x - Math.floor(label.length / 2);
			this.canvas.drawText(labelX, labelY, label, textColor);
		}
	}

	/**
	 * Render a vertical tick
	 */
	private renderVerticalTick(
		x: number,
		y: number,
		value: number,
		tickLength: number,
		showGrid: boolean,
		gridColor: Color | undefined,
		textColor: Color | undefined,
		showLabels: boolean,
		padding: number,
		position: AxisPosition,
	): void {
		const {formatLabel} = this.config;

		// Draw grid line
		if (showGrid) {
			this.canvas.setContext({
				fg: gridColor ?? 'gray',
				bg: 'default',
				styles: {},
			});

			const gridLength = position === 'left' ? tickLength : -tickLength;
			this.canvas.hLine(x + gridLength, y, Math.abs(gridLength), '─', gridColor);
		}

		// Draw tick mark
		this.canvas.setContext({
			fg: this.config.axisColor ?? 'white',
			bg: 'default',
			styles: {},
		});

		const tickX = position === 'left' ? x - tickLength : x + tickLength;
		this.canvas.hLine(Math.min(x, tickX), y, tickLength + 1, '─', this.config.axisColor);

		// Draw label
		if (showLabels) {
			const label = formatLabel ? formatLabel(value) : this.formatValue(value);
			const labelX = position === 'left' ? x - tickLength - padding - label.length : x + tickLength + padding;

			this.canvas.setContext({
				fg: textColor ?? 'default',
				bg: 'default',
				styles: {},
			});

			// Vertically center the label
			const labelY = y - Math.floor(label.length / 2);
			this.canvas.drawText(labelX, labelY, label, textColor);
		}
	}

	/**
	 * Render axis title
	 */
	private renderTitle(x: number, y: number, length: number, position: AxisPosition): void {
		const {title, textColor} = this.config;
		if (!title) {
			return;
		}

		this.canvas.setContext({
			fg: textColor ?? 'default',
			bg: 'default',
			styles: {bold: true},
		});

		const titleChars = Array.from(title);

		switch (position) {
			case 'top': {
				// Draw title above the axis, centered
				const topTitleX = x + Math.floor(length / 2) - Math.floor(titleChars.length / 2);
				this.canvas.drawText(topTitleX, y - 2, title, textColor);
				break;
			}

			case 'bottom': {
				// Draw title below the axis, centered
				const bottomTitleX = x + Math.floor(length / 2) - Math.floor(titleChars.length / 2);
				this.canvas.drawText(bottomTitleX, y + 2, title, textColor);
				break;
			}

			case 'left': {
				// Draw title to the left of the axis, rotated (vertical)
				const leftTitleY = y + Math.floor(length / 2) - Math.floor(titleChars.length / 2);
				for (let i = 0; i < titleChars.length; i++) {
					this.canvas.drawText(x - titleChars.length - 2, leftTitleY + i, titleChars[i], textColor);
				}
				break;
			}

			case 'right': {
				// Draw title to the right of the axis, rotated (vertical)
				const rightTitleY = y + Math.floor(length / 2) - Math.floor(titleChars.length / 2);
				for (let i = 0; i < titleChars.length; i++) {
					this.canvas.drawText(x + 2, rightTitleY + i, titleChars[i], textColor);
				}
				break;
			}
		}
	}

	/**
	 * Format a value for display
	 */
	private formatValue(value: number): string {
		// Determine appropriate precision based on magnitude
		const absValue = Math.abs(value);

		if (absValue >= 1000000) {
			return (value / 1000000).toFixed(1) + 'M';
		}
		if (absValue >= 1000) {
			return (value / 1000).toFixed(1) + 'K';
		}
		if (absValue >= 1) {
			return value.toFixed(1);
		}
		if (absValue >= 0.01) {
			return value.toFixed(2);
		}
		if (absValue >= 0.001) {
			return value.toFixed(3);
		}

		return value.toExponential(1);
	}

	/**
	 * Get the axis extent (space needed for rendering)
	 */
	getExtent(): {width: number; height: number} {
		const {orientation, position, tickLength, showLabels, padding, title} = this.config;
		this.computeTicks();

		let maxLabelLength = 0;
		if (showLabels) {
			for (const tick of this._ticks) {
				const label = this.config.formatLabel ? this.config.formatLabel(tick) : this.formatValue(tick);
				maxLabelLength = Math.max(maxLabelLength, label.length);
			}
		}

		const titleLength = title ? title.length : 0;

		if (orientation === 'horizontal') {
			const height = (tickLength ?? 5) + (showLabels ? maxLabelLength + (padding ?? 2) : 0) + (title ? 1 : 0);
			return {width: 0, height};
		} else {
			const width = (tickLength ?? 5) + (showLabels ? maxLabelLength + (padding ?? 2) : 0) + (title ? 1 : 0);
			return {width, height: 0};
		}
	}
}
