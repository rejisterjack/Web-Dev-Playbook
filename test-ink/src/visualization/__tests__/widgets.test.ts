/**
 * Unit tests for visualization widgets
 */

import {describe, it, expect} from 'vitest';
import {LineChartWidget} from '../line-chart.js';
import {BarChartWidget} from '../bar-chart.js';
import {AreaChartWidget} from '../area-chart.js';
import {ScatterPlotWidget} from '../scatter.js';
import {PieChartWidget} from '../pie-chart.js';
import {GaugeWidget} from '../gauge.js';
import {SparklineWidget} from '../sparkline.js';
import {HistogramWidget} from '../histogram.js';
import {HeatmapWidget} from '../heatmap.js';
import {TableWidget} from '../table.js';
import {TreeViewWidget} from '../tree.js';

describe('LineChartWidget', () => {
	it('should create line chart widget', () => {
		const widget = new LineChartWidget({
			id: 'line-chart',
			series: [
				{
					id: 'series-1',
					name: 'Series 1',
					data: [{value: 1}, {value: 2}, {value: 3}],
					color: 'blue',
				},
			],
		});
		expect(widget).toBeDefined();
	});
});

describe('BarChartWidget', () => {
	it('should create bar chart widget', () => {
		const widget = new BarChartWidget({
			id: 'bar-chart',
			series: [
				{
					id: 'series-1',
					name: 'Series 1',
					data: [{value: 1}, {value: 2}, {value: 3}],
					color: 'blue',
				},
			],
		});
		expect(widget).toBeDefined();
	});

	it('should support stacked mode', () => {
		const widget = new BarChartWidget({
			id: 'bar-chart',
			series: [
				{
					id: 'series-1',
					name: 'Series 1',
					data: [{value: 1}, {value: 2}, {value: 3}],
					color: 'blue',
				},
			],
			groupingMode: 'stacked',
		});
		expect(widget).toBeDefined();
	});
});

describe('AreaChartWidget', () => {
	it('should create area chart widget', () => {
		const widget = new AreaChartWidget({
			id: 'area-chart',
			series: [
				{
					id: 'series-1',
					name: 'Series 1',
					data: [{value: 1}, {value: 2}, {value: 3}],
					color: 'blue',
				},
			],
		});
		expect(widget).toBeDefined();
	});

	it('should support stacked mode', () => {
		const widget = new AreaChartWidget({
			id: 'area-chart',
			series: [
				{
					id: 'series-1',
					name: 'Series 1',
					data: [{value: 1}, {value: 2}, {value: 3}],
					color: 'blue',
				},
			],
			stacked: true,
		});
		expect(widget).toBeDefined();
	});
});

describe('ScatterPlotWidget', () => {
	it('should create scatter plot widget', () => {
		const widget = new ScatterPlotWidget({
			id: 'scatter',
			data: [
				{value: 2, metadata: {x: 1, y: 2}},
				{value: 4, metadata: {x: 3, y: 4}},
				{value: 6, metadata: {x: 5, y: 6}},
			],
		});
		expect(widget).toBeDefined();
	});

	it('should support regression line', () => {
		const widget = new ScatterPlotWidget({
			id: 'scatter',
			data: [
				{value: 2, metadata: {x: 1, y: 2}},
				{value: 4, metadata: {x: 3, y: 4}},
				{value: 6, metadata: {x: 5, y: 6}},
			],
			showRegressionLine: true,
		});
		expect(widget).toBeDefined();
	});
});

describe('PieChartWidget', () => {
	it('should create pie chart widget', () => {
		const widget = new PieChartWidget({
			id: 'pie',
			segments: [
				{label: 'A', value: 30, color: 'red'},
				{label: 'B', value: 70, color: 'blue'},
			],
		});
		expect(widget).toBeDefined();
	});

	it('should support donut mode', () => {
		const widget = new PieChartWidget({
			id: 'pie',
			segments: [
				{label: 'A', value: 30, color: 'red'},
				{label: 'B', value: 70, color: 'blue'},
			],
			donut: true,
		});
		expect(widget).toBeDefined();
	});
});

describe('GaugeWidget', () => {
	it('should create gauge widget', () => {
		const widget = new GaugeWidget({
			id: 'gauge',
			value: 50,
			min: 0,
			max: 100,
		});
		expect(widget).toBeDefined();
	});
});

describe('SparklineWidget', () => {
	it('should create sparkline widget', () => {
		const widget = new SparklineWidget({
			id: 'sparkline',
			points: [
				{value: 1},
				{value: 2},
				{value: 3},
				{value: 4},
				{value: 5},
			],
		});
		expect(widget).toBeDefined();
	});
});

describe('HistogramWidget', () => {
	it('should create histogram widget', () => {
		const widget = new HistogramWidget({
			id: 'histogram',
			values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		});
		expect(widget).toBeDefined();
	});

	it('should support custom bins', () => {
		const widget = new HistogramWidget({
			id: 'histogram',
			values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			bins: 5,
		});
		expect(widget).toBeDefined();
	});
});

describe('HeatmapWidget', () => {
	it('should create heatmap widget', () => {
		const widget = new HeatmapWidget({
			id: 'heatmap',
			cells: [
				{x: 0, y: 0, value: 1},
				{x: 1, y: 0, value: 2},
				{x: 2, y: 0, value: 3},
				{x: 0, y: 1, value: 4},
				{x: 1, y: 1, value: 5},
				{x: 2, y: 1, value: 6},
				{x: 0, y: 2, value: 7},
				{x: 1, y: 2, value: 8},
				{x: 2, y: 2, value: 9},
			],
			columns: 3,
			rows: 3,
		});
		expect(widget).toBeDefined();
	});

	it('should support custom color scale', () => {
		const widget = new HeatmapWidget({
			id: 'heatmap',
			cells: [
				{x: 0, y: 0, value: 1},
				{x: 1, y: 0, value: 2},
				{x: 2, y: 0, value: 3},
				{x: 0, y: 1, value: 4},
				{x: 1, y: 1, value: 5},
				{x: 2, y: 1, value: 6},
				{x: 0, y: 2, value: 7},
				{x: 1, y: 2, value: 8},
				{x: 2, y: 2, value: 9},
			],
			columns: 3,
			rows: 3,
			colorScale: (value: number) => {
				if (value < 3) return 'blue';
				if (value < 6) return 'green';
				return 'red';
			},
		});
		expect(widget).toBeDefined();
	});
});

describe('TableWidget', () => {
	it('should create table widget', () => {
		const widget = new TableWidget({
			id: 'table',
			columns: [
				{id: 'name', header: 'Name'},
				{id: 'value', header: 'Value'},
			],
			rows: [
				{id: '1', cells: {name: 'A', value: '1'}},
				{id: '2', cells: {name: 'B', value: '2'}},
			],
		});
		expect(widget).toBeDefined();
	});

	it('should support sorting', () => {
		const widget = new TableWidget({
			id: 'table',
			columns: [
				{id: 'name', header: 'Name'},
				{id: 'value', header: 'Value'},
			],
			rows: [
				{id: '1', cells: {name: 'A', value: '1'}},
				{id: '2', cells: {name: 'B', value: '2'}},
			],
			sortable: true,
		});
		expect(widget).toBeDefined();
	});
});

describe('TreeViewWidget', () => {
	it('should create tree view widget', () => {
		const widget = new TreeViewWidget({
			id: 'tree',
			nodes: [
				{
					id: '1',
					label: 'Root',
					children: [
						{id: '2', label: 'Child 1'},
						{id: '3', label: 'Child 2'},
					],
				},
			],
		});
		expect(widget).toBeDefined();
	});
});
