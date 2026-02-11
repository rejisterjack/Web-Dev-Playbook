/**
 * Data Generator Tests
 *
 * Unit tests for the demo data generator utilities.
 *
 * @module demo/__tests__/data-generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	generateTimeSeries,
	generateMultiSeries,
	generateCategoricalData,
	generateScatterData,
	generateHeatmapData,
	generateHistogramData,
	generateTableData,
	generateTaskData,
	generateGaugeData,
	generateSparklineData,
	generateStatusData,
	generateLogData,
	resetRandomSeed,
} from '../data-generator.js';

describe('Data Generator', () => {
	beforeEach(() => {
		resetRandomSeed(42);
	});

	describe('generateTimeSeries', () => {
		it('should generate the correct number of data points', () => {
			const data = generateTimeSeries({ count: 10 });
			expect(data).toHaveLength(10);
		});

		it('should generate values within the specified range', () => {
			const data = generateTimeSeries({ count: 100, min: 0, max: 100 });
			for (const point of data) {
				expect(point.value).toBeGreaterThanOrEqual(0);
				expect(point.value).toBeLessThanOrEqual(100);
			}
		});

		it('should include timestamps for all points', () => {
			const data = generateTimeSeries({ count: 5 });
			for (const point of data) {
				expect(point.timestamp).toBeInstanceOf(Date);
			}
		});
	});

	describe('generateMultiSeries', () => {
		it('should generate the correct number of series', () => {
			const series = generateMultiSeries(3, { count: 10 });
			expect(series).toHaveLength(3);
		});

		it('should assign unique names to each series', () => {
			const series = generateMultiSeries(3, { count: 10 });
			const names = series.map((s) => s.name);
			expect(new Set(names).size).toBe(3);
		});
	});

	describe('generateCategoricalData', () => {
		it('should generate data for all categories', () => {
			const categories = ['A', 'B', 'C'];
			const data = generateCategoricalData(categories, 10, 100);
			expect(data).toHaveLength(3);
			expect(data.map((d) => d.category)).toEqual(categories);
		});

		it('should generate values within the specified range', () => {
			const data = generateCategoricalData(['A', 'B'], 10, 50);
			for (const item of data) {
				expect(item.value).toBeGreaterThanOrEqual(10);
				expect(item.value).toBeLessThanOrEqual(50);
			}
		});
	});

	describe('generateScatterData', () => {
		it('should generate the correct number of points', () => {
			const data = generateScatterData(20, [0, 100], [0, 100]);
			expect(data).toHaveLength(20);
		});

		it('should include metadata with x values', () => {
			const data = generateScatterData(5, [0, 10], [0, 10]);
			for (const point of data) {
				expect(point.metadata).toBeDefined();
				expect(point.metadata.x).toBeGreaterThanOrEqual(0);
				expect(point.metadata.x).toBeLessThanOrEqual(10);
			}
		});
	});

	describe('generateHeatmapData', () => {
		it('should generate data for all cells', () => {
			const data = generateHeatmapData(5, 5, 0, 100);
			expect(data).toHaveLength(25);
		});

		it('should include x, y coordinates for all cells', () => {
			const data = generateHeatmapData(3, 3, 0, 100);
			for (const cell of data) {
				expect(cell.x).toBeGreaterThanOrEqual(0);
				expect(cell.x).toBeLessThan(3);
				expect(cell.y).toBeGreaterThanOrEqual(0);
				expect(cell.y).toBeLessThan(3);
			}
		});
	});

	describe('generateHistogramData', () => {
		it('should generate the correct number of bins', () => {
			const data = generateHistogramData(10, 100, 0, 100);
			expect(data).toHaveLength(10);
		});

		it('should include range for each bin', () => {
			const data = generateHistogramData(5, 50, 0, 100);
			for (const bin of data) {
				expect(bin.range).toHaveLength(2);
				expect(bin.range[0]).toBeLessThan(bin.range[1]);
			}
		});
	});

	describe('generateTableData', () => {
		it('should generate the correct number of rows', () => {
			const { rows } = generateTableData({ rows: 10, columns: 3 });
			expect(rows).toHaveLength(10);
		});

		it('should generate the correct number of columns', () => {
			const { rows } = generateTableData({ rows: 5, columns: 4 });
			for (const row of rows) {
				expect(row).toHaveLength(4);
			}
		});

		it('should include headers', () => {
			const { headers } = generateTableData({ rows: 5, columns: 3 });
			expect(headers).toHaveLength(3);
		});
	});

	describe('generateTaskData', () => {
		it('should generate the correct number of tasks', () => {
			const tasks = generateTaskData({ count: 10 });
			expect(tasks).toHaveLength(10);
		});

		it('should assign valid priorities', () => {
			const tasks = generateTaskData({ count: 20 });
			for (const task of tasks) {
				expect(['low', 'medium', 'high']).toContain(task.priority);
			}
		});

		it('should include duration for each task', () => {
			const tasks = generateTaskData({ count: 5 });
			for (const task of tasks) {
				expect(task.duration).toBeGreaterThan(0);
			}
		});
	});

	describe('generateGaugeData', () => {
		it('should generate a value within the specified range', () => {
			const data = generateGaugeData(0, 100);
			expect(data.value).toBeGreaterThanOrEqual(0);
			expect(data.value).toBeLessThanOrEqual(100);
			expect(data.min).toBe(0);
			expect(data.max).toBe(100);
		});
	});

	describe('generateSparklineData', () => {
		it('should generate the correct number of data points', () => {
			const data = generateSparklineData(20);
			expect(data).toHaveLength(20);
		});

		it('should generate values within a reasonable range', () => {
			const data = generateSparklineData(50);
			for (const value of data) {
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThanOrEqual(100);
			}
		});
	});

	describe('generateStatusData', () => {
		it('should include all status metrics', () => {
			const data = generateStatusData();
			expect(data).toHaveProperty('cpu');
			expect(data).toHaveProperty('memory');
			expect(data).toHaveProperty('disk');
			expect(data).toHaveProperty('network');
			expect(data).toHaveProperty('uptime');
		});

		it('should generate valid network data', () => {
			const data = generateStatusData();
			expect(data.network).toHaveProperty('in');
			expect(data.network).toHaveProperty('out');
		});
	});

	describe('generateLogData', () => {
		it('should generate the correct number of log entries', () => {
			const logs = generateLogData(10);
			expect(logs).toHaveLength(10);
		});

		it('should include valid log levels', () => {
			const logs = generateLogData(20);
			for (const log of logs) {
				expect(['info', 'warn', 'error', 'debug']).toContain(log.level);
			}
		});

		it('should include timestamps', () => {
			const logs = generateLogData(5);
			for (const log of logs) {
				expect(log.timestamp).toBeInstanceOf(Date);
			}
		});
	});
});
