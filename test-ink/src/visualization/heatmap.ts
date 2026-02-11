/**
 * Heatmap Widget Module
 *
 * Provides the HeatmapWidget class for displaying heatmaps.
 * Supports custom color scales with real-time updates.
 *
 * @module visualization/heatmap
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import type {HeatmapCell, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Color scale function type
 */
export type ColorScaleFunction = (value: number, min: number, max: number) => any;

/**
 * Heatmap widget props
 */
export interface HeatmapProps extends WidgetProps {
	/** 2D array of heatmap cells */
	cells: HeatmapCell[];

	/** Number of columns */
	columns: number;

	/** Number of rows */
	rows: number;

	/** Whether to show labels */
	showLabels?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** Custom color scale function */
	colorScale?: ColorScaleFunction;
}

/**
 * Heatmap widget for displaying heatmaps
 */
export class HeatmapWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'heatmap';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showLabels: true,
	};

	/** Current props */
	private _heatmapProps: Required<HeatmapProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** Chart area */
	private chartArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Cell dimensions */
	private cellWidth: number = 0;
	private cellHeight: number = 0;

	/** Data range */
	private dataRange: {min: number; max: number} = {min: 0, max: 1};

	/**
	 * Create a new heatmap widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: HeatmapProps) {
		super(props);
		this._heatmapProps = {
			...HeatmapWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<HeatmapProps>;
	}

	/**
	 * Get heatmap props
	 */
	get heatmapProps(): Required<HeatmapProps> {
		return {...this._heatmapProps};
	}

	/**
	 * Update heatmap props
	 *
	 * @param props - New props
	 */
	updateHeatmapProps(props: Partial<HeatmapProps>): void {
		this._heatmapProps = {
			...this._heatmapProps,
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
		const {theme, padding} = this._heatmapProps;

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

		// Calculate data range
		this.calculateDataRange();

		// Calculate cell dimensions
		this.calculateCellDimensions();

		// Draw cells
		this.drawCells();

		// Draw labels
		if (this._heatmapProps.showLabels) {
			this.drawLabels();
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
	 * Calculate data range
	 */
	private calculateDataRange(): void {
		const {cells} = this._heatmapProps;

		if (cells.length === 0) {
			this.dataRange = {min: 0, max: 1};
			return;
		}

		let min = Infinity;
		let max = -Infinity;

		for (const cell of cells) {
			min = Math.min(min, cell.value);
			max = Math.max(max, cell.value);
		}

		this.dataRange = {
			min: min === Infinity ? 0 : min,
			max: max === -Infinity ? 1 : max,
		};
	}

	/**
	 * Calculate cell dimensions
	 */
	private calculateCellDimensions(): void {
		const {columns, rows} = this._heatmapProps;

		this.cellWidth = Math.max(1, Math.floor(this.chartArea.width / columns));
		this.cellHeight = Math.max(1, Math.floor(this.chartArea.height / rows));
	}

	/**
	 * Get color for a value
	 */
	private getColorForValue(value: number): any {
		const {colorScale, theme} = this._heatmapProps;
		const {min, max} = this.dataRange;

		if (colorScale) {
			return colorScale(value, min, max);
		}

		// Default color scale (blue to red)
		const normalized = (value - min) / (max - min);
		const r = Math.round(normalized * 255);
		const b = Math.round((1 - normalized) * 255);
		return {rgb: [r, 0, b]};
	}

	/**
	 * Draw cells
	 */
	private drawCells(): void {
		if (!this.canvas) {
			return;
		}

		const {cells, columns} = this._heatmapProps;
		const {x, y} = this.chartArea;

		for (const cell of cells) {
			const color = this.getColorForValue(cell.value);
			const cellX = x + cell.x * this.cellWidth;
			const cellY = y + cell.y * this.cellHeight;

			this.canvas.setContext({
				fg: color,
				bg: color,
				styles: {},
			});

			this.canvas.fill(cellX, cellY, this.cellWidth, this.cellHeight, '█', color, color);
		}
	}

	/**
	 * Draw labels
	 */
	private drawLabels(): void {
		if (!this.canvas) {
			return;
		}

		const {cells, theme} = this._heatmapProps;
		const {x, y} = this.chartArea;

		this.canvas.setContext({
			fg: theme.textColor,
			bg: 'default',
			styles: {},
		});

		for (const cell of cells) {
			if (!cell.label) {
				continue;
			}

			const cellX = x + cell.x * this.cellWidth + Math.floor(this.cellWidth / 2) - Math.floor(cell.label.length / 2);
			const cellY = y + cell.y * this.cellHeight + Math.floor(this.cellHeight / 2);

			this.canvas.drawText(cellX, cellY, cell.label, theme.textColor);
		}
	}
}
