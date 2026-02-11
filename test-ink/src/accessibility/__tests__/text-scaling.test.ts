/**
 * Text Scaling Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {TextScaling, TextScalingPreset} from '../text-scaling.js';

describe('TextScaling', () => {
	let textScaling: TextScaling;

	beforeEach(() => {
		textScaling = new TextScaling();
	});

	describe('constructor', () => {
		it('should create text scaling with default values', () => {
			expect(textScaling.scale).toBe(1.0);
			expect(textScaling.lineSpacing).toBe(1.0);
			expect(textScaling.fontWeight).toBe('normal');
		});
	});

	describe('setScale', () => {
		it('should set scale', () => {
			textScaling.setScale(1.5);
			expect(textScaling.scale).toBe(1.5);
		});

		it('should clamp scale to max', () => {
			textScaling.setScale(10.0);
			expect(textScaling.scale).toBeLessThanOrEqual(3.0);
		});

		it('should clamp scale to min', () => {
			textScaling.setScale(0.1);
			expect(textScaling.scale).toBeGreaterThanOrEqual(0.5);
		});
	});

	describe('increaseScale', () => {
		it('should increase scale', () => {
			const initial = textScaling.scale;
			textScaling.increaseScale();
			expect(textScaling.scale).toBeGreaterThan(initial);
		});
	});

	describe('decreaseScale', () => {
		it('should decrease scale', () => {
			textScaling.setScale(1.5);
			const initial = textScaling.scale;
			textScaling.decreaseScale();
			expect(textScaling.scale).toBeLessThan(initial);
		});
	});

	describe('setLineSpacing', () => {
		it('should set line spacing', () => {
			textScaling.setLineSpacing(1.5);
			expect(textScaling.lineSpacing).toBe(1.5);
		});
	});

	describe('setFontWeight', () => {
		it('should set font weight', () => {
			textScaling.setFontWeight('bold');
			expect(textScaling.fontWeight).toBe('bold');
		});
	});

	describe('applyPreset', () => {
		it('should apply preset', () => {
			textScaling.applyPreset(TextScalingPreset.LARGE);
			expect(textScaling.preset).toBe(TextScalingPreset.LARGE);
			expect(textScaling.scale).toBe(1.2);
		});
	});

	describe('calculateLineHeight', () => {
		it('should calculate line height', () => {
			textScaling.setLineSpacing(1.5);
			const height = textScaling.calculateLineHeight(20);
			expect(height).toBe(30);
		});
	});

	describe('calculateFontSize', () => {
		it('should calculate font size', () => {
			textScaling.setScale(1.5);
			const size = textScaling.calculateFontSize(16);
			expect(size).toBe(24);
		});
	});

	describe('reset', () => {
		it('should reset to normal', () => {
			textScaling.setScale(1.5);
			textScaling.reset();
			expect(textScaling.scale).toBe(1.0);
		});
	});

	describe('destroy', () => {
		it('should destroy text scaling', () => {
			textScaling.destroy();
			expect(textScaling.scale).toBe(1.0);
		});
	});
});
