/**
 * Unit tests for scale module
 */

import {describe, it, expect} from 'vitest';
import {LinearScale, LogScale, TimeScale, CategoryScale} from '../scale.js';

describe('LinearScale', () => {
	describe('constructor', () => {
		it('should create scale with default domain and range', () => {
			const scale = new LinearScale();
			expect(scale.domain()).toEqual([0, 1]);
			expect(scale.range()).toEqual([0, 1]);
		});

		it('should create scale with custom domain and range', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			expect(scale.domain()).toEqual([0, 100]);
			expect(scale.range()).toEqual([0, 10]);
		});
	});

	describe('scale', () => {
		it('should scale values correctly', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			expect(scale.scale(0)).toBe(0);
			expect(scale.scale(50)).toBe(5);
			expect(scale.scale(100)).toBe(10);
		});

		it('should handle negative values', () => {
			const scale = new LinearScale([-100, 100], [0, 10]);
			expect(scale.scale(-100)).toBe(0);
			expect(scale.scale(0)).toBe(5);
			expect(scale.scale(100)).toBe(10);
		});

		it('should clamp values outside domain', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			expect(scale.scale(-50)).toBe(0);
			expect(scale.scale(150)).toBe(10);
		});
	});

	describe('invert', () => {
		it('should invert scaled values', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			expect(scale.invert(0)).toBe(0);
			expect(scale.invert(5)).toBe(50);
			expect(scale.invert(10)).toBe(100);
		});

		it('should clamp inverted values outside range', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			expect(scale.invert(-5)).toBe(0);
			expect(scale.invert(15)).toBe(100);
		});
	});

	describe('domain', () => {
		it('should set and get domain', () => {
			const scale = new LinearScale();
			scale.domain([0, 50]);
			expect(scale.domain()).toEqual([0, 50]);
		});
	});

	describe('range', () => {
		it('should set and get range', () => {
			const scale = new LinearScale();
			scale.range([0, 20]);
			expect(scale.range()).toEqual([0, 20]);
		});
	});

	describe('ticks', () => {
		it('should generate default ticks', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			const ticks = scale.ticks();
			expect(ticks.length).toBeGreaterThan(0);
			expect(ticks[0]).toBe(0);
			expect(ticks[ticks.length - 1]).toBe(100);
		});

		it('should generate specified number of ticks', () => {
			const scale = new LinearScale([0, 100], [0, 10]);
			const ticks = scale.ticks(5);
			expect(ticks.length).toBe(5);
		});
	});

	describe('copy', () => {
		it('should create independent copy', () => {
			const scale1 = new LinearScale([0, 100], [0, 10]);
			const scale2 = scale1.copy();
			scale2.domain([0, 50]);
			expect(scale1.domain()).toEqual([0, 100]);
			expect(scale2.domain()).toEqual([0, 50]);
		});
	});
});

describe('LogScale', () => {
	describe('constructor', () => {
		it('should create scale with default domain and range', () => {
			const scale = new LogScale();
			expect(scale.domain()).toEqual([1, 10]);
			expect(scale.range()).toEqual([0, 1]);
		});

		it('should create scale with custom domain and range', () => {
			const scale = new LogScale([1, 1000], [0, 10]);
			expect(scale.domain()).toEqual([1, 1000]);
			expect(scale.range()).toEqual([0, 10]);
		});
	});

	describe('scale', () => {
		it('should scale values logarithmically', () => {
			const scale = new LogScale([1, 100], [0, 10]);
			expect(scale.scale(1)).toBe(0);
			expect(scale.scale(10)).toBe(5);
			expect(scale.scale(100)).toBe(10);
		});

		it('should handle values less than 1', () => {
			const scale = new LogScale([0.1, 10], [0, 10]);
			expect(scale.scale(0.1)).toBe(0);
			expect(scale.scale(1)).toBe(5);
			expect(scale.scale(10)).toBe(10);
		});
	});

	describe('invert', () => {
		it('should invert scaled values', () => {
			const scale = new LogScale([1, 100], [0, 10]);
			expect(scale.invert(0)).toBe(1);
			expect(scale.invert(5)).toBe(10);
			expect(scale.invert(10)).toBe(100);
		});
	});

	describe('ticks', () => {
		it('should generate logarithmic ticks', () => {
			const scale = new LogScale([1, 1000], [0, 10]);
			const ticks = scale.ticks();
			expect(ticks.length).toBeGreaterThan(0);
			expect(ticks[0]).toBe(1);
			expect(ticks[ticks.length - 1]).toBe(1000);
		});
	});
});

describe('TimeScale', () => {
	describe('constructor', () => {
		it('should create scale with default domain and range', () => {
			const scale = new TimeScale();
			const domain = scale.domain() as [number, number];
			expect(domain.length).toBe(2);
			expect(domain[1] - domain[0]).toBe(86400000); // 1 day in ms
		});

		it('should create scale with custom domain and range', () => {
			const start = new Date('2024-01-01').getTime();
			const end = new Date('2024-01-02').getTime();
			const scale = new TimeScale([start, end], [0, 10]);
			expect(scale.domain()).toEqual([start, end]);
			expect(scale.range()).toEqual([0, 10]);
		});
	});

	describe('scale', () => {
		it('should scale time values', () => {
			const start = new Date('2024-01-01').getTime();
			const end = new Date('2024-01-02').getTime();
			const scale = new TimeScale([start, end], [0, 10]);
			expect(scale.scale(start)).toBe(0);
			expect(scale.scale(end)).toBe(10);
		});
	});

	describe('invert', () => {
		it('should invert scaled time values', () => {
			const start = new Date('2024-01-01').getTime();
			const end = new Date('2024-01-02').getTime();
			const scale = new TimeScale([start, end], [0, 10]);
			expect(scale.invert(0)).toBe(start);
			expect(scale.invert(10)).toBe(end);
		});
	});

	describe('ticks', () => {
		it('should generate time ticks', () => {
			const start = new Date('2024-01-01').getTime();
			const end = new Date('2024-01-02').getTime();
			const scale = new TimeScale([start, end], [0, 10]);
			const ticks = scale.ticks();
			expect(ticks.length).toBeGreaterThan(0);
		});
	});
});

describe('CategoryScale', () => {
	describe('constructor', () => {
		it('should create scale with default domain and range', () => {
			const scale = new CategoryScale();
			expect(scale.domain()).toEqual([]);
			expect(scale.range()).toEqual([0, 1]);
		});

		it('should create scale with custom domain and range', () => {
			const scale = new CategoryScale(['A', 'B', 'C'], [0, 10]);
			expect(scale.domain()).toEqual(['A', 'B', 'C']);
			expect(scale.range()).toEqual([0, 10]);
		});
	});

	describe('scale', () => {
		it('should scale category values', () => {
			const scale = new CategoryScale(['A', 'B', 'C'], [0, 10]);
			expect(scale.scale('A')).toBe(0);
			expect(scale.scale('B')).toBe(5);
			expect(scale.scale('C')).toBe(10);
		});

		it('should return undefined for unknown categories', () => {
			const scale = new CategoryScale(['A', 'B', 'C'], [0, 10]);
			expect(scale.scale('D')).toBeUndefined();
		});
	});

	describe('domain', () => {
		it('should set and get domain', () => {
			const scale = new CategoryScale();
			scale.domain(['X', 'Y', 'Z']);
			expect(scale.domain()).toEqual(['X', 'Y', 'Z']);
		});
	});

	describe('range', () => {
		it('should set and get range', () => {
			const scale = new CategoryScale();
			scale.range([0, 20]);
			expect(scale.range()).toEqual([0, 20]);
		});
	});

	describe('ticks', () => {
		it('should return domain as ticks', () => {
			const scale = new CategoryScale(['A', 'B', 'C'], [0, 10]);
			const ticks = scale.ticks();
			expect(ticks).toEqual(['A', 'B', 'C']);
		});
	});

	describe('copy', () => {
		it('should create independent copy', () => {
			const scale1 = new CategoryScale(['A', 'B'], [0, 10]);
			const scale2 = scale1.copy();
			scale2.domain(['X', 'Y']);
			expect(scale1.domain()).toEqual(['A', 'B']);
			expect(scale2.domain()).toEqual(['X', 'Y']);
		});
	});
});
