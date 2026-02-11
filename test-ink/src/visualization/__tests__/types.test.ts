/**
 * Unit tests for visualization types module
 */

import {describe, it, expect} from 'vitest';
import {
	DEFAULT_CHART_THEME,
	DEFAULT_LEGEND,
	DEFAULT_ANIMATION,
	DEFAULT_PADDING,
} from '../types.js';

describe('Visualization Types', () => {
	describe('Default Constants', () => {
		it('should have valid default chart theme', () => {
			expect(DEFAULT_CHART_THEME).toBeDefined();
			expect(DEFAULT_CHART_THEME.colors).toBeInstanceOf(Array);
			expect(DEFAULT_CHART_THEME.colors.length).toBeGreaterThan(0);
			expect(DEFAULT_CHART_THEME.gridColor).toBeDefined();
			expect(DEFAULT_CHART_THEME.textColor).toBeDefined();
			expect(DEFAULT_CHART_THEME.background).toBeDefined();
		});

		it('should have valid default legend config', () => {
			expect(DEFAULT_LEGEND).toBeDefined();
			expect(DEFAULT_LEGEND.visible).toBe(true);
			expect(DEFAULT_LEGEND.position).toBe('right');
		});

		it('should have valid default animation config', () => {
			expect(DEFAULT_ANIMATION).toBeDefined();
			expect(DEFAULT_ANIMATION.enabled).toBe(true);
			expect(DEFAULT_ANIMATION.duration).toBeGreaterThan(0);
			expect(DEFAULT_ANIMATION.easing).toBeDefined();
		});

		it('should have valid default padding', () => {
			expect(DEFAULT_PADDING).toBeDefined();
			expect(DEFAULT_PADDING.top).toBeGreaterThanOrEqual(0);
			expect(DEFAULT_PADDING.right).toBeGreaterThanOrEqual(0);
			expect(DEFAULT_PADDING.bottom).toBeGreaterThanOrEqual(0);
			expect(DEFAULT_PADDING.left).toBeGreaterThanOrEqual(0);
		});
	});

	describe('DataPoint Type', () => {
		it('should accept numeric data point', () => {
			const point = {value: 42};
			expect(point.value).toBe(42);
		});

		it('should accept data point with label', () => {
			const point = {value: 42, label: 'Test'};
			expect(point.value).toBe(42);
			expect(point.label).toBe('Test');
		});

		it('should accept data point with metadata', () => {
			const point = {value: 42, label: 'Test', metadata: {color: 'red'}};
			expect(point.value).toBe(42);
			expect(point.label).toBe('Test');
			expect(point.metadata).toEqual({color: 'red'});
		});
	});

	describe('Series Type', () => {
		it('should accept series with data points', () => {
			const series = {
				name: 'Test Series',
				data: [{value: 1}, {value: 2}, {value: 3}],
				color: 'blue',
			};
			expect(series.name).toBe('Test Series');
			expect(series.data.length).toBe(3);
			expect(series.color).toBe('blue');
		});

		it('should accept series with optional properties', () => {
			const series = {
				name: 'Test Series',
				data: [{value: 1}, {value: 2}],
				color: 'blue',
				visible: true,
				showPoints: true,
			};
			expect(series.visible).toBe(true);
			expect(series.showPoints).toBe(true);
		});
	});

	describe('Axis Type', () => {
		it('should accept axis with min and max', () => {
			const axis = {min: 0, max: 100};
			expect(axis.min).toBe(0);
			expect(axis.max).toBe(100);
		});

		it('should accept axis with ticks', () => {
			const axis = {
				min: 0,
				max: 100,
				ticks: [0, 25, 50, 75, 100],
			};
			expect(axis.ticks).toEqual([0, 25, 50, 75, 100]);
		});

		it('should accept axis with labels', () => {
			const axis = {
				min: 0,
				max: 100,
				ticks: [0, 50, 100],
				labels: ['Low', 'Medium', 'High'],
			};
			expect(axis.labels).toEqual(['Low', 'Medium', 'High']);
		});
	});

	describe('Legend Type', () => {
		it('should accept legend with position', () => {
			const legend = {visible: true, position: 'bottom'};
			expect(legend.visible).toBe(true);
			expect(legend.position).toBe('bottom');
		});
	});

	describe('ChartTheme Type', () => {
		it('should accept theme with colors', () => {
			const theme = {
				colors: ['red', 'blue', 'green'],
				gridColor: 'gray',
				textColor: 'black',
				backgroundColor: 'white',
			};
			expect(theme.colors).toEqual(['red', 'blue', 'green']);
			expect(theme.gridColor).toBe('gray');
		});
	});
});
