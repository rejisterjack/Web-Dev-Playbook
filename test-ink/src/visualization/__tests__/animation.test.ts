/**
 * Unit tests for animation manager module
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {AnimationManager} from '../animation.js';

describe('AnimationManager', () => {
	let manager: AnimationManager;

	beforeEach(() => {
		manager = new AnimationManager();
	});

	describe('constructor', () => {
		it('should create animation manager', () => {
			expect(manager).toBeDefined();
		});
	});

	describe('start', () => {
		it('should start animation', () => {
			const onFrame = vi.fn();
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame,
			});
			expect(manager.isRunning('test')).toBe(true);
			manager.stop('test');
		});
	});

	describe('stop', () => {
		it('should stop animation', () => {
			const onFrame = vi.fn();
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame,
			});
			manager.stop('test');
			expect(manager.isRunning('test')).toBe(false);
		});
	});

	describe('remove', () => {
		it('should remove animation', () => {
			const onFrame = vi.fn();
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame,
			});
			manager.remove('test');
			expect(manager.isRunning('test')).toBe(false);
		});
	});

	describe('isRunning', () => {
		it('should return false when not running', () => {
			expect(manager.isRunning('test')).toBe(false);
		});

		it('should return true when running', () => {
			const onFrame = vi.fn();
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame,
			});
			expect(manager.isRunning('test')).toBe(true);
			manager.stop('test');
		});
	});

	describe('getProgress', () => {
		it('should return 0 for non-existent animation', () => {
			expect(manager.getProgress('test')).toBe(0);
		});

		it('should return progress for running animation', () => {
			const onFrame = vi.fn();
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame,
			});
			const progress = manager.getProgress('test');
			expect(progress).toBeGreaterThanOrEqual(0);
			expect(progress).toBeLessThanOrEqual(1);
			manager.stop('test');
		});
	});

	describe('transition', () => {
		it('should transition between values', (done: () => void) => {
			const onComplete = vi.fn();
			manager.transition('test', 0, 100, 100, 'linear', (value: number) => {
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThanOrEqual(100);
			}, onComplete);
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame: () => {},
			});

			// Wait for animation to complete
			setTimeout(() => {
				manager.stop('test');
				done();
			}, 200);
		});
	});

	describe('transitionArray', () => {
		it('should transition array values', (done: () => void) => {
			const onComplete = vi.fn();
			manager.transitionArray('test', [0, 0, 0], [100, 100, 100], 100, 'linear', (values: number[]) => {
				expect(values.length).toBe(3);
				values.forEach((v: number) => {
					expect(v).toBeGreaterThanOrEqual(0);
					expect(v).toBeLessThanOrEqual(100);
				});
			}, onComplete);
			manager.start('test', {
				duration: 100,
				easing: 'linear',
				onFrame: () => {},
			});

			// Wait for animation to complete
			setTimeout(() => {
				manager.stop('test');
				done();
			}, 200);
		});
	});
});
