/**
 * Charts Demo
 *
 * Showcase all chart types including line, bar, area, scatter, pie,
 * gauge, sparkline, histogram, and heatmap with real-time data streaming.
 *
 * @module demo/charts
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear } from '../rendering/primitives.js';
import {
	generateTimeSeries,
	generateMultiSeries,
	generateCategoricalData,
	generateScatterData,
	generateHeatmapData,
	generateHistogramData,
	generateGaugeData,
	generateSparklineData,
} from './data-generator.js';

/**
 * Chart type for the demo
 */
export type ChartType =
	| 'line'
	| 'bar'
	| 'area'
	| 'scatter'
	| 'pie'
	| 'gauge'
	| 'sparkline'
	| 'histogram'
	| 'heatmap';

/**
 * Charts demo state
 */
export interface ChartsDemoState {
	/** Currently active chart */
	activeChart: ChartType;
	/** Update counter */
	updateCount: number;
	/** Animation progress */
	animationProgress: number;
	/** Line chart data */
	lineData: Array<{ value: number; timestamp: Date }>;
	/** Bar chart data */
	barData: Array<{ category: string; value: number }>;
	/** Scatter data */
	scatterData: Array<{ value: number; label: string; metadata: { x: number } }>;
	/** Heatmap data */
	heatmapData: Array<{ x: number; y: number; value: number }>;
	/** Histogram data */
	histogramData: Array<{ bin: number; count: number; range: [number, number] }>;
	/** Gauge data */
	gaugeData: { value: number; min: number; max: number };
	/** Sparkline data */
	sparklineData: number[];
	/** Whether animation is enabled */
	animationEnabled: boolean;
}

/**
 * Charts demo configuration
 */
export interface ChartsDemoConfig {
	/** Update interval in milliseconds */
	updateInterval?: number;
	/** Number of data points */
	dataPoints?: number;
}

/**
 * Charts demo component
 */
export class ChartsDemo {
	private state: ChartsDemoState;
	private config: Required<ChartsDemoConfig>;
	private updateTimer?: NodeJS.Timeout;
	private animationTimer?: NodeJS.Timeout;

	constructor(config: ChartsDemoConfig = {}) {
		this.config = {
			updateInterval: config.updateInterval || 500,
			dataPoints: config.dataPoints || 20,
		};

		this.state = {
			activeChart: 'line',
			updateCount: 0,
			animationProgress: 0,
			lineData: [],
			barData: [],
			scatterData: [],
			heatmapData: [],
			histogramData: [],
			gaugeData: generateGaugeData(0, 100),
			sparklineData: [],
			animationEnabled: true,
		};

		this.initializeData();
	}

	/**
	 * Initialize all chart data
	 */
	private initializeData(): void {
		// Line chart data
		const timeSeries = generateTimeSeries({
			count: this.config.dataPoints,
			min: 0,
			max: 100,
			trend: 'random',
		});
		this.state.lineData = timeSeries.map((p) => ({
			value: p.value,
			timestamp: p.timestamp || new Date(),
		}));

		// Bar chart data
		this.state.barData = generateCategoricalData(['Q1', 'Q2', 'Q3', 'Q4'], 10, 90);

		// Scatter data
		this.state.scatterData = generateScatterData(50, [0, 100], [0, 100]).map((p) => ({
			value: p.value,
			label: p.label || '',
			metadata: { x: Number(p.label) || 0 },
		}));

		// Heatmap data
		this.state.heatmapData = generateHeatmapData(10, 10, 0, 100);

		// Histogram data
		this.state.histogramData = generateHistogramData(10, 100, 0, 100);

		// Sparkline data
		this.state.sparklineData = generateSparklineData(this.config.dataPoints);
	}

	/**
	 * Start the charts demo
	 */
	start(): void {
		this.updateTimer = setInterval(() => {
			this.update();
		}, this.config.updateInterval);

		if (this.state.animationEnabled) {
			this.animationTimer = setInterval(() => {
				this.state.animationProgress = (this.state.animationProgress + 1) % 100;
			}, 50);
		}
	}

	/**
	 * Stop the charts demo
	 */
	stop(): void {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = undefined;
		}
		if (this.animationTimer) {
			clearInterval(this.animationTimer);
			this.animationTimer = undefined;
		}
	}

	/**
	 * Update chart data
	 */
	private update(): void {
		this.state.updateCount++;

		// Update line chart with new data point
		const newValue = Math.random() * 100;
		this.state.lineData.push({ value: newValue, timestamp: new Date() });
		if (this.state.lineData.length > this.config.dataPoints) {
			this.state.lineData.shift();
		}

		// Update gauge
		this.state.gaugeData = generateGaugeData(0, 100);

		// Update sparkline
		this.state.sparklineData = generateSparklineData(this.config.dataPoints);
	}

	/**
	 * Render the charts demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw chart navigation
		this.renderNavigation(ctx, width);

		// Draw active chart
		this.renderActiveChart(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Charts Demo - Visualization Showcase', 2, 1);
		drawText(ctx, `Updates: ${this.state.updateCount}`, width - 15, 1);
	}

	/**
	 * Render chart navigation
	 */
	private renderNavigation(ctx: RenderContext, width: number): void {
		const charts: { key: string; type: ChartType }[] = [
			{ key: '1', type: 'line' },
			{ key: '2', type: 'bar' },
			{ key: '3', type: 'area' },
			{ key: '4', type: 'scatter' },
			{ key: '5', type: 'pie' },
			{ key: '6', type: 'gauge' },
			{ key: '7', type: 'sparkline' },
			{ key: '8', type: 'histogram' },
			{ key: '9', type: 'heatmap' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Charts: ', 2, navY + 1);

		let xPos = 10;
		for (const chart of charts) {
			const isActive = chart.type === this.state.activeChart;
			const label = `${chart.key}:${chart.type}`;
			if (isActive) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${label}]`, xPos, navY + 1);
				ctx.restore();
			} else {
				drawText(ctx, ` ${label} `, xPos, navY + 1);
			}
			xPos += label.length + 2;
		}
	}

	/**
	 * Render active chart
	 */
	private renderActiveChart(ctx: RenderContext, width: number, height: number): void {
		const chartY = 7;
		const chartHeight = height - 10;
		const chartWidth = width - 4;

		switch (this.state.activeChart) {
			case 'line':
				this.renderLineChart(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'bar':
				this.renderBarChart(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'area':
				this.renderAreaChart(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'scatter':
				this.renderScatterPlot(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'pie':
				this.renderPieChart(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'gauge':
				this.renderGauge(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'sparkline':
				this.renderSparkline(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'histogram':
				this.renderHistogram(ctx, 2, chartY, chartWidth, chartHeight);
				break;
			case 'heatmap':
				this.renderHeatmap(ctx, 2, chartY, chartWidth, chartHeight);
				break;
		}
	}

	/**
	 * Render line chart
	 */
	private renderLineChart(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Line Chart - Real-time Data Streaming', x + 2, y + 1);

		if (this.state.lineData.length < 2) return;

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const stepX = chartArea.width / (this.state.lineData.length - 1);

		// Draw axes
		this.drawAxes(ctx, chartArea);

		// Draw line
		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] });
		for (let i = 0; i < this.state.lineData.length - 1; i++) {
			const x1 = chartArea.x + i * stepX;
			const y1 = chartArea.y + chartArea.height - 2 - (this.state.lineData[i].value / 100) * (chartArea.height - 4);
			const x2 = chartArea.x + (i + 1) * stepX;
			const y2 = chartArea.y + chartArea.height - 2 - (this.state.lineData[i + 1].value / 100) * (chartArea.height - 4);
			this.drawLine(ctx, Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2));
		}
		ctx.restore();
	}

	/**
	 * Render bar chart
	 */
	private renderBarChart(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Bar Chart - Categorical Data', x + 2, y + 1);

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const barWidth = Math.floor(chartArea.width / this.state.barData.length) - 2;

		// Draw axes
		this.drawAxes(ctx, chartArea);

		// Draw bars
		const colors: Array<{ rgb: [number, number, number] }> = [
			{ rgb: [255, 107, 107] },
			{ rgb: [78, 205, 196] },
			{ rgb: [69, 183, 209] },
			{ rgb: [150, 206, 180] },
		];

		this.state.barData.forEach((bar, i) => {
			const barHeight = (bar.value / 100) * (chartArea.height - 4);
			const barX = chartArea.x + 2 + i * (barWidth + 2);
			const barY = chartArea.y + chartArea.height - 2 - barHeight;

			ctx.save();
			ctx.setFg(colors[i % colors.length]);
			for (let j = 0; j < barHeight; j++) {
				ctx.drawChar('█', barX, barY + j);
			}
			ctx.restore();

			// Draw label
			drawText(ctx, bar.category, barX, chartArea.y + chartArea.height - 1);
		});
	}

	/**
	 * Render area chart
	 */
	private renderAreaChart(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Area Chart - Filled Line Chart', x + 2, y + 1);

		if (this.state.lineData.length < 2) return;

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const stepX = chartArea.width / (this.state.lineData.length - 1);

		// Draw axes
		this.drawAxes(ctx, chartArea);

		// Draw area
		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] });
		ctx.setStyles({ dim: true });

		for (let i = 0; i < this.state.lineData.length - 1; i++) {
			const x1 = chartArea.x + i * stepX;
			const y1 = chartArea.y + chartArea.height - 2 - (this.state.lineData[i].value / 100) * (chartArea.height - 4);
			const x2 = chartArea.x + (i + 1) * stepX;
			const y2 = chartArea.y + chartArea.height - 2 - (this.state.lineData[i + 1].value / 100) * (chartArea.height - 4);
			this.drawLine(ctx, Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2));
		}
		ctx.restore();
	}

	/**
	 * Render scatter plot
	 */
	private renderScatterPlot(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Scatter Plot - Distribution Analysis', x + 2, y + 1);

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };

		// Draw axes
		this.drawAxes(ctx, chartArea);

		// Draw points
		ctx.save();
		ctx.setFg({ rgb: [69, 183, 209] });
		this.state.scatterData.forEach((point) => {
			const px = chartArea.x + 2 + (point.metadata.x / 100) * (chartArea.width - 4);
			const py = chartArea.y + chartArea.height - 2 - (point.value / 100) * (chartArea.height - 4);
			if (px >= chartArea.x && px < chartArea.x + chartArea.width && py >= chartArea.y && py < chartArea.y + chartArea.height) {
				ctx.drawChar('•', Math.floor(px), Math.floor(py));
			}
		});
		ctx.restore();
	}

	/**
	 * Render pie chart
	 */
	private renderPieChart(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Pie Chart - Proportional Data', x + 2, y + 1);

		const centerX = x + Math.floor(width / 2);
		const centerY = y + Math.floor(height / 2);
		const radius = Math.min(width, height) / 3;

		// Draw legend
		let legendY = y + 3;
		const colors: Array<{ rgb: [number, number, number] }> = [
			{ rgb: [255, 107, 107] },
			{ rgb: [78, 205, 196] },
			{ rgb: [69, 183, 209] },
			{ rgb: [150, 206, 180] },
		];
		this.state.barData.forEach((bar, i) => {
			ctx.save();
			ctx.setFg(colors[i % colors.length]);
			ctx.drawChar('█', x + 2, legendY);
			ctx.restore();
			drawText(ctx, ` ${bar.category}: ${bar.value}`, x + 4, legendY);
			legendY += 2;
		});

		// Draw pie (simplified as text)
		const total = this.state.barData.reduce((sum, bar) => sum + bar.value, 0);
		let currentAngle = 0;
		const segments = [
			{ char: '●', color: { rgb: [255, 107, 107] as [number, number, number] } },
			{ char: '○', color: { rgb: [78, 205, 196] as [number, number, number] } },
			{ char: '◆', color: { rgb: [69, 183, 209] as [number, number, number] } },
			{ char: '◇', color: { rgb: [150, 206, 180] as [number, number, number] } },
		];

		this.state.barData.forEach((bar, i) => {
			const percentage = bar.value / total;
			const segmentSize = Math.floor(percentage * 8);
			for (let j = 0; j < segmentSize; j++) {
				ctx.save();
				ctx.setFg(segments[i % segments.length].color);
				ctx.drawChar(segments[i % segments.length].char, centerX - 4 + j, centerY);
				ctx.restore();
			}
			currentAngle += percentage * 360;
		});
	}

	/**
	 * Render gauge
	 */
	private renderGauge(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Gauge - Single Value Display', x + 2, y + 1);

		const centerX = x + Math.floor(width / 2);
		const centerY = y + Math.floor(height / 2) + 1;
		const radius = Math.min(width, height) / 3;

		// Draw gauge arc
		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] });
		for (let i = 0; i < 20; i++) {
			const angle = (i / 20) * Math.PI;
			const gx = centerX + Math.floor(Math.cos(angle) * radius);
			const gy = centerY + Math.floor(Math.sin(angle) * radius);
			ctx.drawChar('─', gx, gy);
		}
		ctx.restore();

		// Draw needle
		const needleAngle = (this.state.gaugeData.value / 100) * Math.PI;
		const needleX = centerX + Math.floor(Math.cos(needleAngle) * (radius - 2));
		const needleY = centerY + Math.floor(Math.sin(needleAngle) * (radius - 2));

		ctx.save();
		ctx.setFg({ rgb: [255, 107, 107] });
		ctx.drawChar('│', needleX, needleY);
		ctx.restore();

		// Draw value
		drawText(ctx, `${this.state.gaugeData.value.toFixed(1)}%`, centerX - 3, centerY + radius + 2);
	}

	/**
	 * Render sparkline
	 */
	private renderSparkline(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Sparkline - Compact Trend Display', x + 2, y + 1);

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const stepX = chartArea.width / (this.state.sparklineData.length - 1);

		ctx.save();
		ctx.setFg({ rgb: [150, 206, 180] });
		for (let i = 0; i < this.state.sparklineData.length - 1; i++) {
			const x1 = chartArea.x + i * stepX;
			const y1 = chartArea.y + chartArea.height - 2 - (this.state.sparklineData[i] / 100) * (chartArea.height - 4);
			const x2 = chartArea.x + (i + 1) * stepX;
			const y2 = chartArea.y + chartArea.height - 2 - (this.state.sparklineData[i + 1] / 100) * (chartArea.height - 4);
			this.drawLine(ctx, Math.floor(x1), Math.floor(y1), Math.floor(x2), Math.floor(y2));
		}
		ctx.restore();

		// Draw current value
		const currentValue = this.state.sparklineData[this.state.sparklineData.length - 1] || 0;
		drawText(ctx, `${currentValue.toFixed(1)}`, x + width - 8, y + 1);
	}

	/**
	 * Render histogram
	 */
	private renderHistogram(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Histogram - Frequency Distribution', x + 2, y + 1);

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const maxCount = Math.max(...this.state.histogramData.map((h) => h.count));
		const barWidth = Math.floor(chartArea.width / this.state.histogramData.length) - 1;

		// Draw axes
		this.drawAxes(ctx, chartArea);

		// Draw bars
		this.state.histogramData.forEach((bin, i) => {
			const barHeight = (bin.count / maxCount) * (chartArea.height - 4);
			const barX = chartArea.x + 2 + i * (barWidth + 1);
			const barY = chartArea.y + chartArea.height - 2 - barHeight;

			ctx.save();
			ctx.setFg({ rgb: [69, 183, 209] });
			for (let j = 0; j < barHeight; j++) {
				ctx.drawChar('█', barX, barY + j);
			}
			ctx.restore();

			// Draw bin label
			drawText(ctx, `${bin.range[0]}-${bin.range[1]}`, barX, chartArea.y + chartArea.height - 1);
		});
	}

	/**
	 * Render heatmap
	 */
	private renderHeatmap(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Heatmap - 2D Data Visualization', x + 2, y + 1);

		const chartArea = { x: x + 2, y: y + 3, width: width - 4, height: height - 5 };
		const cellWidth = Math.floor(chartArea.width / 10);
		const cellHeight = Math.floor(chartArea.height / 10);

		this.state.heatmapData.forEach((cell) => {
			const cellX = chartArea.x + cell.x * cellWidth;
			const cellY = chartArea.y + cell.y * cellHeight;

			// Color based on value
			let color: { rgb: [number, number, number] };
			if (cell.value < 25) color = { rgb: [78, 205, 196] };
			else if (cell.value < 50) color = { rgb: [69, 183, 209] };
			else if (cell.value < 75) color = { rgb: [150, 206, 180] };
			else color = { rgb: [255, 107, 107] };

			ctx.save();
			ctx.setFg(color);
			for (let cy = 0; cy < cellHeight && cellY + cy < chartArea.y + chartArea.height; cy++) {
				for (let cx = 0; cx < cellWidth && cellX + cx < chartArea.x + chartArea.width; cx++) {
					ctx.drawChar('█', cellX + cx, cellY + cy);
				}
			}
			ctx.restore();
		});
	}

	/**
	 * Draw chart axes
	 */
	private drawAxes(ctx: RenderContext, area: { x: number; y: number; width: number; height: number }): void {
		ctx.save();
		ctx.setFg({ rgb: [150, 150, 150] });
		// Y axis
		for (let i = 0; i < area.height; i++) {
			ctx.drawChar('│', area.x, area.y + i);
		}
		// X axis
		for (let i = 0; i < area.width; i++) {
			ctx.drawChar('─', area.x + i, area.y + area.height - 1);
		}
		ctx.restore();
	}

	/**
	 * Draw a line between two points
	 */
	private drawLine(ctx: RenderContext, x1: number, y1: number, x2: number, y2: number): void {
		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = x1 < x2 ? 1 : -1;
		const sy = y1 < y2 ? 1 : -1;
		let err = dx - dy;

		let x = x1;
		let y = y1;

		while (true) {
			ctx.drawChar('•', x, y);
			if (x === x2 && y === y2) break;
			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
		}
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-9 to switch charts | q to quit | a to toggle animation', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				this.stop();
				break;
			case 'a':
				this.state.animationEnabled = !this.state.animationEnabled;
				if (this.state.animationEnabled) {
					this.animationTimer = setInterval(() => {
						this.state.animationProgress = (this.state.animationProgress + 1) % 100;
					}, 50);
				} else if (this.animationTimer) {
					clearInterval(this.animationTimer);
					this.animationTimer = undefined;
				}
				break;
			case '1':
				this.state.activeChart = 'line';
				break;
			case '2':
				this.state.activeChart = 'bar';
				break;
			case '3':
				this.state.activeChart = 'area';
				break;
			case '4':
				this.state.activeChart = 'scatter';
				break;
			case '5':
				this.state.activeChart = 'pie';
				break;
			case '6':
				this.state.activeChart = 'gauge';
				break;
			case '7':
				this.state.activeChart = 'sparkline';
				break;
			case '8':
				this.state.activeChart = 'histogram';
				break;
			case '9':
				this.state.activeChart = 'heatmap';
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): ChartsDemoState {
		return { ...this.state };
	}
}

/**
 * Create a charts demo instance
 */
export function createChartsDemo(config?: ChartsDemoConfig): ChartsDemo {
	return new ChartsDemo(config);
}
