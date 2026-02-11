/**
 * Reduced Motion Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {ReducedMotion, ReducedMotionDetectionMethod, AnimationType} from '../reduced-motion.js';

describe('ReducedMotion', () => {
	let reducedMotion: ReducedMotion;

	beforeEach(() => {
		reducedMotion = new ReducedMotion();
	});

	describe('constructor', () => {
		it('should create reduced motion with disabled state', () => {
			expect(reducedMotion.enabled).toBe(false);
		});
	});

	describe('enable', () => {
		it('should enable reduced motion', () => {
			reducedMotion.enable();
			expect(reducedMotion.enabled).toBe(true);
		});
	});

	describe('disable', () => {
		it('should disable reduced motion', () => {
			reducedMotion.enable();
			reducedMotion.disable();
			expect(reducedMotion.enabled).toBe(false);
		});
	});

	describe('toggle', () => {
		it('should toggle reduced motion', () => {
			reducedMotion.toggle();
			expect(reducedMotion.enabled).toBe(true);
			reducedMotion.toggle();
			expect(reducedMotion.enabled).toBe(false);
		});
	});

	describe('registerAnimation', () => {
		it('should register animation', () => {
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			const animation = reducedMotion.getAnimation('test');
			expect(animation).toBeDefined();
		});
	});

	describe('unregisterAnimation', () => {
		it('should unregister animation', () => {
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			reducedMotion.unregisterAnimation('test');
			const animation = reducedMotion.getAnimation('test');
			expect(animation).toBeUndefined();
		});
	});

	describe('getEffectiveDuration', () => {
		it('should return normal duration when disabled', () => {
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			const duration = reducedMotion.getEffectiveDuration('test');
			expect(duration).toBe(300);
		});

		it('should return reduced duration when enabled', () => {
			reducedMotion.enable();
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			const duration = reducedMotion.getEffectiveDuration('test');
			expect(duration).toBe(0);
		});
	});

	describe('shouldPlayAnimation', () => {
		it('should return true when disabled', () => {
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			expect(reducedMotion.shouldPlayAnimation('test')).toBe(true);
		});

		it('should return false when enabled and skipAnimations is true', () => {
			reducedMotion.enable();
			reducedMotion.registerAnimation('test', {
				type: AnimationType.FADE,
				duration: 300,
				easing: 'ease-in-out',
				enabled: true,
			});
			expect(reducedMotion.shouldPlayAnimation('test')).toBe(false);
		});
	});

	describe('destroy', () => {
		it('should destroy reduced motion', () => {
			reducedMotion.destroy();
			expect(reducedMotion.enabled).toBe(false);
		});
	});
});
