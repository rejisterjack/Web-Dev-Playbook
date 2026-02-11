/**
 * Demo Data Generator
 *
 * Provides utilities for generating realistic demo data for charts, tables,
 * and other visualizations in the demo application.
 *
 * @module demo/data-generator
 */

import type { DataPoint, Series } from '../visualization/types.js';
import type { Color } from '../rendering/cell.js';

/**
 * Configuration for time series data generation
 */
export interface TimeSeriesConfig {
	/** Number of data points to generate */
	count: number;
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
	/** Trend direction */
	trend?: 'up' | 'down' | 'flat' | 'random';
	/** Volatility (0-1) */
	volatility?: number;
	/** Start timestamp */
	startTime?: Date;
	/** Interval between points in milliseconds */
	interval?: number;
}

/**
 * Configuration for table data generation
 */
export interface TableDataConfig {
	/** Number of rows */
	rows: number;
	/** Number of columns */
	columns: number;
	/** Column names */
	columnNames?: string[];
	/** Data types for each column */
	dataTypes?: ('string' | 'number' | 'date' | 'boolean')[];
}

/**
 * Configuration for task data generation
 */
export interface TaskDataConfig {
	/** Number of tasks */
	count: number;
	/** Task types */
	taskTypes?: string[];
	/** Priority distribution */
	priorityDistribution?: { low: number; medium: number; high: number };
	/** Duration range in milliseconds */
	durationRange?: { min: number; max: number };
}

/**
 * Random number generator with seed support
 */
class SeededRandom {
	private seed: number;

	constructor(seed: number = Date.now()) {
		this.seed = seed;
	}

	/** Generate a random number between 0 and 1 */
	next(): number {
		this.seed = (this.seed * 9301 + 49297) % 233280;
		return this.seed / 233280;
	}

	/** Generate a random integer in range */
	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min + 1)) + min;
	}

	/** Generate a random float in range */
	nextFloat(min: number, max: number): number {
		return this.next() * (max - min) + min;
	}

	/** Pick a random element from array */
	pick<T>(array: T[]): T {
		return array[this.nextInt(0, array.length - 1)];
	}

	/** Shuffle an array */
	shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i);
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}
}

// Global random instance
const random = new SeededRandom(42);

/**
 * Generate time series data for charts
 */
export function generateTimeSeries(config: TimeSeriesConfig): DataPoint[] {
	const {
		count,
		min = 0,
		max = 100,
		trend = 'random',
		volatility = 0.3,
		startTime = new Date(Date.now() - count * 1000),
		interval = 1000,
	} = config;

	const points: DataPoint[] = [];
	let value = (min + max) / 2;
	let timestamp = startTime.getTime();

	for (let i = 0; i < count; i++) {
		// Apply trend
		switch (trend) {
			case 'up':
				value += (max - min) * 0.01;
				break;
			case 'down':
				value -= (max - min) * 0.01;
				break;
			case 'flat':
				// No trend
				break;
			case 'random':
				value += random.nextFloat(-5, 5);
				break;
		}

		// Apply volatility
		value += random.nextFloat(-volatility * 20, volatility * 20);

		// Clamp to range
		value = Math.max(min, Math.min(max, value));

		points.push({
			value: parseFloat(value.toFixed(2)),
			timestamp: new Date(timestamp),
		});

		timestamp += interval;
	}

	return points;
}

/**
 * Generate multiple series for comparison charts
 */
export function generateMultiSeries(
	seriesCount: number,
	config: TimeSeriesConfig,
): Series[] {
	const series: Series[] = [];
	const colors: Color[] = [
		{ rgb: [255, 107, 107] },
		{ rgb: [78, 205, 196] },
		{ rgb: [69, 183, 209] },
		{ rgb: [150, 206, 180] },
		{ rgb: [255, 234, 167] },
		{ rgb: [221, 160, 221] },
		{ rgb: [152, 216, 200] },
		{ rgb: [247, 220, 111] },
	];

	for (let i = 0; i < seriesCount; i++) {
		const trend = ['up', 'down', 'flat', 'random'][i % 4] as TimeSeriesConfig['trend'];
		const points = generateTimeSeries({
			...config,
			trend,
			startTime: new Date(config.startTime?.getTime() || Date.now()),
		});

		series.push({
			id: `series-${i}`,
			name: `Series ${i + 1}`,
			data: points,
			color: colors[i % colors.length],
		});
	}

	return series;
}

/**
 * Generate categorical data for bar/pie charts
 */
export function generateCategoricalData(
	categories: string[],
	minValue: number = 10,
	maxValue: number = 100,
): { category: string; value: number }[] {
	return categories.map((category) => ({
		category,
		value: random.nextInt(minValue, maxValue),
	}));
}

/**
 * Generate scatter plot data
 */
export function generateScatterData(count: number, xRange: [number, number], yRange: [number, number]): DataPoint[] {
	const points: DataPoint[] = [];
	for (let i = 0; i < count; i++) {
		const x = random.nextFloat(xRange[0], xRange[1]);
		const y = random.nextFloat(yRange[0], yRange[1]);
		points.push({
			value: y,
			label: x.toFixed(2),
			metadata: { x },
		});
	}
	return points;
}

/**
 * Generate heatmap data
 */
export function generateHeatmapData(
	rows: number,
	cols: number,
	minValue: number = 0,
	maxValue: number = 100,
): { x: number; y: number; value: number }[] {
	const data: { x: number; y: number; value: number }[] = [];
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			data.push({
				x,
				y,
				value: random.nextFloat(minValue, maxValue),
			});
		}
	}
	return data;
}

/**
 * Generate histogram data
 */
export function generateHistogramData(
	bins: number,
	sampleCount: number,
	minValue: number = 0,
	maxValue: number = 100,
): { bin: number; count: number; range: [number, number] }[] {
	const binWidth = (maxValue - minValue) / bins;
	const histogram = new Array(bins).fill(0);

	// Generate samples and bin them
	for (let i = 0; i < sampleCount; i++) {
		const value = random.nextFloat(minValue, maxValue);
		const binIndex = Math.min(Math.floor((value - minValue) / binWidth), bins - 1);
		histogram[binIndex]++;
	}

	// Create histogram data
	return histogram.map((count, index) => ({
		bin: index,
		count,
		range: [minValue + index * binWidth, minValue + (index + 1) * binWidth],
	}));
}

/**
 * Generate table data
 */
export function generateTableData(config: TableDataConfig): { headers: string[]; rows: string[][] } {
	const {
		rows: rowCount,
		columns: colCount,
		columnNames,
		dataTypes,
	} = config;

	const headers = columnNames || Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
	const types = dataTypes || Array.from({ length: colCount }, () => 'string');

	const rows: string[][] = [];
	for (let r = 0; r < rowCount; r++) {
		const row: string[] = [];
		for (let c = 0; c < colCount; c++) {
			row.push(generateCellValue(types[c]));
		}
		rows.push(row);
	}

	return { headers, rows };
}

/**
 * Generate a single cell value based on type
 */
function generateCellValue(type: string): string {
	switch (type) {
		case 'number':
			return random.nextInt(0, 1000).toString();
		case 'date':
			return new Date(Date.now() - random.nextInt(0, 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
		case 'boolean':
			return random.next() > 0.5 ? 'Yes' : 'No';
		case 'string':
		default: {
			const words = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
			return random.pick(words);
		}
	}
}

/**
 * Generate task data
 */
export function generateTaskData(config: TaskDataConfig) {
	const {
		count,
		taskTypes = ['Process', 'Download', 'Upload', 'Compute', 'Render', 'Analyze'],
		priorityDistribution = { low: 0.3, medium: 0.5, high: 0.2 },
		durationRange = { min: 1000, max: 10000 },
	} = config;

	const tasks = [];
	let cumulative = 0;
	const priorityThresholds = {
		low: priorityDistribution.low,
		medium: priorityDistribution.low + priorityDistribution.medium,
		high: 1,
	};

	for (let i = 0; i < count; i++) {
		const rand = random.next();
		let priority: 'low' | 'medium' | 'high';
		if (rand < priorityThresholds.low) {
			priority = 'low';
		} else if (rand < priorityThresholds.medium) {
			priority = 'medium';
		} else {
			priority = 'high';
		}

		tasks.push({
			id: `task-${i + 1}`,
			name: `${random.pick(taskTypes)} ${i + 1}`,
			priority,
			duration: random.nextInt(durationRange.min, durationRange.max),
			status: random.pick(['pending', 'running', 'completed', 'failed']),
		});
	}

	return tasks;
}

/**
 * Generate gauge data
 */
export function generateGaugeData(min: number = 0, max: number = 100): { value: number; min: number; max: number } {
	return {
		value: random.nextFloat(min, max),
		min,
		max,
	};
}

/**
 * Generate sparkline data
 */
export function generateSparklineData(count: number = 20): number[] {
	const data: number[] = [];
	let value = 50;
	for (let i = 0; i < count; i++) {
		value += random.nextFloat(-10, 10);
		value = Math.max(0, Math.min(100, value));
		data.push(parseFloat(value.toFixed(1)));
	}
	return data;
}

/**
 * Generate tree data
 */
export function generateTreeData(depth: number = 3, childrenPerNode: number = 3): any {
	function createNode(currentDepth: number): any {
		if (currentDepth >= depth) {
			return {
				id: `node-${random.nextInt(1000, 9999)}`,
				name: `Leaf ${random.nextInt(1, 100)}`,
				value: random.nextInt(1, 100),
			};
		}

		return {
			id: `node-${random.nextInt(1000, 9999)}`,
			name: `Node ${random.nextInt(1, 100)}`,
			children: Array.from({ length: childrenPerNode }, () => createNode(currentDepth + 1)),
		};
	}

	return createNode(0);
}

/**
 * Generate random color
 */
export function generateRandomColor(): string {
	const colors = [
		'#FF6B6B',
		'#4ECDC4',
		'#45B7D1',
		'#96CEB4',
		'#FFEAA7',
		'#DDA0DD',
		'#98D8C8',
		'#F7DC6F',
		'#BB8FCE',
		'#85C1E9',
		'#F8B500',
		'#FF6F61',
		'#6B5B95',
		'#88B04B',
		'#F7CAC9',
	];
	return random.pick(colors);
}

/**
 * Generate status data for dashboard
 */
export function generateStatusData(): {
	cpu: number;
	memory: number;
	disk: number;
	network: { in: number; out: number };
	uptime: number;
} {
	return {
		cpu: random.nextFloat(10, 90),
		memory: random.nextFloat(30, 80),
		disk: random.nextFloat(40, 70),
		network: {
			in: random.nextFloat(0, 100),
			out: random.nextFloat(0, 100),
		},
		uptime: random.nextInt(3600, 86400),
	};
}

/**
 * Generate log data
 */
export function generateLogData(count: number = 50): {
	timestamp: Date;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
}[] {
	const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
	const messages = [
		'Connection established',
		'Request received',
		'Processing data',
		'Cache miss',
		'Database query executed',
		'User authenticated',
		'File uploaded',
		'Email sent',
		'Background task started',
		'Configuration reloaded',
	];

	const logs = [];
	for (let i = 0; i < count; i++) {
		logs.push({
			timestamp: new Date(Date.now() - random.nextInt(0, 3600000)),
			level: random.pick(levels),
			message: random.pick(messages),
		});
	}

	return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Reset random seed for reproducible data
 */
export function resetRandomSeed(seed: number = 42): void {
	(random as any).seed = seed;
}
