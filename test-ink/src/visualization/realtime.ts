/**
 * Real-Time Data Manager Module
 *
 * Provides the RealTimeDataManager class for managing streaming data.
 * Supports data buffers with sliding windows, data aggregation, and data sampling.
 *
 * @module visualization/realtime
 */

import type {DataPoint} from './types.js';

/**
 * Aggregation type
 */
export type AggregationType = 'min' | 'max' | 'avg' | 'sum' | 'count';

/**
 * Real-time data manager configuration
 */
export interface RealTimeDataManagerConfig {
	/** Maximum buffer size */
	maxSize: number;

	/** Whether to use sliding window */
	slidingWindow: boolean;

	/** Aggregation interval (in data points) */
	aggregationInterval?: number;

	/** Aggregation type */
	aggregationType?: AggregationType;

	/** Sampling interval (in data points) */
	samplingInterval?: number;
}

/**
 * Real-time data manager for managing streaming data
 */
export class RealTimeDataManager {
	/** Data buffer */
	private buffer: DataPoint[] = [];

	/** Configuration */
	private config: RealTimeDataManagerConfig;

	/** Aggregation buffer */
	private aggregationBuffer: DataPoint[] = [];

	/** Last aggregation timestamp */
	private lastAggregationTime: number = 0;

	/**
	 * Create a new real-time data manager
	 *
	 * @param config - Manager configuration
	 */
	constructor(config: RealTimeDataManagerConfig) {
		this.config = {
			maxSize: config.maxSize,
			slidingWindow: config.slidingWindow ?? true,
			aggregationInterval: config.aggregationInterval,
			aggregationType: config.aggregationType ?? 'avg',
			samplingInterval: config.samplingInterval,
		};
	}

	/**
	 * Get current configuration
	 */
	getConfig(): RealTimeDataManagerConfig {
		return {...this.config};
	}

	/**
	 * Update configuration
	 *
	 * @param config - New configuration
	 */
	updateConfig(config: Partial<RealTimeDataManagerConfig>): void {
		this.config = {
			...this.config,
			...config,
		};
	}

	/**
	 * Get current buffer size
	 */
	getSize(): number {
		return this.buffer.length;
	}

	/**
	 * Get maximum buffer size
	 */
	getMaxSize(): number {
		return this.config.maxSize;
	}

	/**
	 * Check if buffer is full
	 */
	isFull(): boolean {
		return this.buffer.length >= this.config.maxSize;
	}

	/**
	 * Add a data point
	 *
	 * @param point - Data point to add
	 */
	addPoint(point: DataPoint): void {
		// Add to aggregation buffer if aggregation is enabled
		if (this.config.aggregationInterval && this.config.aggregationInterval > 1) {
			this.aggregationBuffer.push(point);

			// Check if we should aggregate
			if (this.aggregationBuffer.length >= this.config.aggregationInterval) {
				const aggregated = this.aggregate(this.aggregationBuffer);
				this.addToBuffer(aggregated);
				this.aggregationBuffer = [];
			}
		} else {
			this.addToBuffer(point);
		}
	}

	/**
	 * Add multiple data points
	 *
	 * @param points - Data points to add
	 */
	addPoints(points: DataPoint[]): void {
		for (const point of points) {
			this.addPoint(point);
		}
	}

	/**
	 * Add point to buffer
	 */
	private addToBuffer(point: DataPoint): void {
		// Apply sampling if enabled
		if (this.config.samplingInterval && this.config.samplingInterval > 1) {
			if (this.buffer.length % this.config.samplingInterval !== 0) {
				return;
			}
		}

		// Add point to buffer
		this.buffer.push(point);

		// Apply sliding window if enabled
		if (this.config.slidingWindow && this.buffer.length > this.config.maxSize) {
			this.buffer.shift();
		}
	}

	/**
	 * Get all data points
	 */
	getAll(): DataPoint[] {
		return [...this.buffer];
	}

	/**
	 * Get last N data points
	 *
	 * @param n - Number of points to get
	 */
	getLast(n: number): DataPoint[] {
		return this.buffer.slice(-n);
	}

	/**
	 * Get data points in range
	 *
	 * @param start - Start index
	 * @param end - End index
	 */
	getRange(start: number, end: number): DataPoint[] {
		return this.buffer.slice(start, end);
	}

	/**
	 * Get data points by time range
	 *
	 * @param startTime - Start time
	 * @param endTime - End time
	 */
	getByTimeRange(startTime: Date, endTime: Date): DataPoint[] {
		return this.buffer.filter(point => {
			if (!point.timestamp) {
				return false;
			}
			return point.timestamp >= startTime && point.timestamp <= endTime;
		});
	}

	/**
	 * Clear the buffer
	 */
	clear(): void {
		this.buffer = [];
		this.aggregationBuffer = [];
	}

	/**
	 * Aggregate data points
	 *
	 * @param points - Points to aggregate
	 * @returns Aggregated data point
	 */
	private aggregate(points: DataPoint[]): DataPoint {
		const type = this.config.aggregationType ?? 'avg';

		let value: number;
		switch (type) {
			case 'min':
				value = Math.min(...points.map(p => p.value));
				break;
			case 'max':
				value = Math.max(...points.map(p => p.value));
				break;
			case 'sum':
				value = points.reduce((sum, p) => sum + p.value, 0);
				break;
			case 'count':
				value = points.length;
				break;
			case 'avg':
			default:
				value = points.reduce((sum, p) => sum + p.value, 0) / points.length;
				break;
		}

		// Use the first point's label and timestamp
		return {
			value,
			label: points[0].label,
			timestamp: points[0].timestamp,
			category: points[0].category,
			metadata: {
				aggregated: true,
				count: points.length,
				...points[0].metadata,
			},
		};
	}

	/**
	 * Get statistics for the buffer
	 */
	getStatistics(): {
		min: number;
		max: number;
		avg: number;
		sum: number;
		count: number;
	} {
		if (this.buffer.length === 0) {
			return {min: 0, max: 0, avg: 0, sum: 0, count: 0};
		}

		const values = this.buffer.map(p => p.value);
		const sum = values.reduce((a, b) => a + b, 0);

		return {
			min: Math.min(...values),
			max: Math.max(...values),
			avg: sum / values.length,
			sum,
			count: values.length,
		};
	}

	/**
	 * Get moving average
	 *
	 * @param windowSize - Window size for moving average
	 * @returns Array of moving averages
	 */
	getMovingAverage(windowSize: number): number[] {
		if (windowSize <= 0 || this.buffer.length === 0) {
			return [];
		}

		const result: number[] = [];
		const values = this.buffer.map(p => p.value);

		for (let i = 0; i < values.length; i++) {
			const start = Math.max(0, i - windowSize + 1);
			const window = values.slice(start, i + 1);
			const avg = window.reduce((a, b) => a + b, 0) / window.length;
			result.push(avg);
		}

		return result;
	}

	/**
	 * Get rate of change
	 *
	 * @returns Array of rate of change values
	 */
	getRateOfChange(): number[] {
		if (this.buffer.length < 2) {
			return [];
		}

		const result: number[] = [];
		const values = this.buffer.map(p => p.value);

		for (let i = 1; i < values.length; i++) {
			result.push(values[i] - values[i - 1]);
		}

		return result;
	}

	/**
	 * Get percent change
	 *
	 * @returns Array of percent change values
	 */
	getPercentChange(): number[] {
		if (this.buffer.length < 2) {
			return [];
		}

		const result: number[] = [];
		const values = this.buffer.map(p => p.value);

		for (let i = 1; i < values.length; i++) {
			const prev = values[i - 1];
			const curr = values[i];
			const change = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
			result.push(change);
		}

		return result;
	}

	/**
	 * Clone the manager
	 */
	clone(): RealTimeDataManager {
		const clone = new RealTimeDataManager(this.config);
		clone.buffer = [...this.buffer];
		clone.aggregationBuffer = [...this.aggregationBuffer];
		return clone;
	}
}
