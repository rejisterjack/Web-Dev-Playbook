/**
 * Unit tests for axis renderer module
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {AxisRenderer} from '../axis.js';
import {Canvas} from '../canvas.js';
import {ScreenBuffer} from '../../rendering/buffer.js';
import {LinearScale} from '../scale.js';

describe('AxisRenderer', () => {
	let canvas: Canvas;
	let buffer: ScreenBuffer;
	let scale: LinearScale;

	beforeEach(() => {
		buffer = new ScreenBuffer(80, 24);
		canvas = new Canvas(buffer);
		scale = new LinearScale([0, 100], [0, 10]);
	});

	describe('constructor', () => {
		it('should create axis renderer with default config', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			expect(axis).toBeDefined();
		});

		it('should create axis renderer with custom config', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
				showGrid: true,
				showLabels: true,
			});
			expect(axis).toBeDefined();
		});
	});

	describe('render', () => {
		it('should render horizontal axis', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			axis.render(0, 10, 10);
			// Should not throw
		});

		it('should render vertical axis', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'vertical',
				position: 'left',
				scale,
			});
			axis.render(0, 10, 10);
			// Should not throw
		});

		it('should render axis with grid lines', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
				showGrid: true,
			});
			axis.render(0, 10, 10);
			// Should not throw
		});

		it('should render axis with labels', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
				showLabels: true,
			});
			axis.render(0, 10, 10);
			// Should not throw
		});
	});

	describe('computeTicks', () => {
		it('should compute ticks for horizontal axis', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			axis.computeTicks();
			const ticks = axis.getTicks();
			expect(ticks.length).toBeGreaterThan(0);
		});

		it('should compute ticks for vertical axis', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'vertical',
				position: 'left',
				scale,
			});
			axis.computeTicks();
			const ticks = axis.getTicks();
			expect(ticks.length).toBeGreaterThan(0);
		});
	});

	describe('getConfig', () => {
		it('should return axis configuration', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			const config = axis.getConfig();
			expect(config.orientation).toBe('horizontal');
			expect(config.position).toBe('bottom');
		});
	});

	describe('updateConfig', () => {
		it('should update axis configuration', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			axis.updateConfig({showGrid: true});
			const config = axis.getConfig();
			expect(config.showGrid).toBe(true);
		});
	});

	describe('getTicks', () => {
		it('should return tick values', () => {
			const axis = new AxisRenderer(canvas, {
				orientation: 'horizontal',
				position: 'bottom',
				scale,
			});
			axis.computeTicks();
			const ticks = axis.getTicks();
			expect(Array.isArray(ticks)).toBe(true);
		});
	});
});
