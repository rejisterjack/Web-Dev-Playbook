/**
 * Unit tests for real-time data manager module
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {RealTimeDataManager} from '../realtime.js';

describe('RealTimeDataManager', () => {
	let manager: RealTimeDataManager;

	beforeEach(() => {
		manager = new RealTimeDataManager({maxSize: 100, slidingWindow: true});
	});

	describe('constructor', () => {
		it('should create manager with config', () => {
			const m = new RealTimeDataManager({maxSize: 50, slidingWindow: true});
			expect(m).toBeDefined();
		});
	});

	describe('addPoint', () => {
		it('should add a single point', () => {
			manager.addPoint({value: 42, timestamp: new Date()});
			const data = manager.getAll();
			expect(data.length).toBe(1);
			expect(data[0].value).toBe(42);
		});

		it('should enforce max size', () => {
			const m = new RealTimeDataManager({maxSize: 5, slidingWindow: true});
			for (let i = 0; i < 10; i++) {
				m.addPoint({value: i, timestamp: new Date(Date.now() + i)});
			}
			const data = m.getAll();
			expect(data.length).toBe(5);
		});
	});

	describe('addPoints', () => {
		it('should add multiple points', () => {
			const points = [
				{value: 1, timestamp: new Date()},
				{value: 2, timestamp: new Date(Date.now() + 1)},
				{value: 3, timestamp: new Date(Date.now() + 2)},
			];
			manager.addPoints(points);
			const data = manager.getAll();
			expect(data.length).toBe(3);
		});
	});

	describe('getAll', () => {
		it('should return all points', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			manager.addPoint({value: 2, timestamp: new Date(Date.now() + 1)});
			const data = manager.getAll();
			expect(data.length).toBe(2);
		});

		it('should return empty array when no points', () => {
			const data = manager.getAll();
			expect(data).toEqual([]);
		});
	});

	describe('getLast', () => {
		it('should return last point', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			manager.addPoint({value: 2, timestamp: new Date(Date.now() + 1)});
			const last = manager.getLast(1);
			expect(last.length).toBe(1);
			expect(last[0].value).toBe(2);
		});

		it('should return empty array when no points', () => {
			const last = manager.getLast(1);
			expect(last).toEqual([]);
		});
	});

	describe('getStatistics', () => {
		it('should return statistics for data', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			manager.addPoint({value: 2, timestamp: new Date(Date.now() + 1)});
			manager.addPoint({value: 3, timestamp: new Date(Date.now() + 2)});
			const stats = manager.getStatistics();
			expect(stats?.min).toBe(1);
			expect(stats?.max).toBe(3);
			expect(stats?.avg).toBe(2);
			expect(stats?.sum).toBe(6);
			expect(stats?.count).toBe(3);
		});

		it('should return null when no data', () => {
			const stats = manager.getStatistics();
			expect(stats).toBeNull();
		});
	});

	describe('getMovingAverage', () => {
		it('should calculate moving average', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			manager.addPoint({value: 2, timestamp: new Date(Date.now() + 1)});
			manager.addPoint({value: 3, timestamp: new Date(Date.now() + 2)});
			const avg = manager.getMovingAverage(2);
			expect(avg).toBe(2.5);
		});

		it('should return null when no data', () => {
			const avg = manager.getMovingAverage(5);
			expect(avg).toBeNull();
		});
	});

	describe('clear', () => {
		it('should clear all data', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			manager.clear();
			const data = manager.getAll();
			expect(data).toEqual([]);
		});
	});

	describe('getSize', () => {
		it('should return current size', () => {
			manager.addPoint({value: 1, timestamp: new Date()});
			expect(manager.getSize()).toBe(1);
		});
	});

	describe('getMaxSize', () => {
		it('should return max size', () => {
			const m = new RealTimeDataManager({maxSize: 50, slidingWindow: true});
			expect(m.getMaxSize()).toBe(50);
		});
	});

	describe('isFull', () => {
		it('should return false when not full', () => {
			expect(manager.isFull()).toBe(false);
		});

		it('should return true when full', () => {
			const m = new RealTimeDataManager({maxSize: 2, slidingWindow: true});
			m.addPoint({value: 1, timestamp: new Date()});
			m.addPoint({value: 2, timestamp: new Date()});
			expect(m.isFull()).toBe(true);
		});
	});

	describe('getConfig', () => {
		it('should return configuration', () => {
			const config = manager.getConfig();
			expect(config.maxSize).toBe(100);
			expect(config.slidingWindow).toBe(true);
		});
	});

	describe('updateConfig', () => {
		it('should update configuration', () => {
			manager.updateConfig({maxSize: 50});
			expect(manager.getMaxSize()).toBe(50);
		});
	});
});
