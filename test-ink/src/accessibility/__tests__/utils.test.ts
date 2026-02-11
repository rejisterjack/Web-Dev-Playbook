/**
 * Accessibility Utilities Tests
 */

import {describe, it, expect} from 'vitest';
import {
	generateAccessibilityId,
	validateAccessibilityLabel,
	validateAccessibilityDescription,
	checkContrastAA,
	checkContrastAAA,
	calculateContrastRatio,
	getLuminance,
	hexToRgb,
	normalizeKeyCombination,
	matchesKeyCombination,
} from '../utils.js';

describe('Accessibility Utilities', () => {
	describe('generateAccessibilityId', () => {
		it('should generate unique ID', () => {
			const id1 = generateAccessibilityId();
			const id2 = generateAccessibilityId();
			expect(id1).not.toBe(id2);
		});

		it('should use prefix', () => {
			const id = generateAccessibilityId('test');
			expect(id).toContain('test_');
		});
	});

	describe('validateAccessibilityLabel', () => {
		it('should validate valid label', () => {
			expect(validateAccessibilityLabel('Test Label')).toBe(true);
		});

		it('should reject empty label', () => {
			expect(validateAccessibilityLabel('')).toBe(false);
		});

		it('should reject whitespace-only label', () => {
			expect(validateAccessibilityLabel('   ')).toBe(false);
		});

		it('should reject too long label', () => {
			const longLabel = 'a'.repeat(201);
			expect(validateAccessibilityLabel(longLabel)).toBe(false);
		});
	});

	describe('validateAccessibilityDescription', () => {
		it('should validate valid description', () => {
			expect(validateAccessibilityDescription('Test Description')).toBe(true);
		});

		it('should accept empty description', () => {
			expect(validateAccessibilityDescription('')).toBe(true);
		});

		it('should reject too long description', () => {
			const longDesc = 'a'.repeat(501);
			expect(validateAccessibilityDescription(longDesc)).toBe(false);
		});
	});

	describe('checkContrastAA', () => {
		it('should pass for high contrast', () => {
			expect(checkContrastAA('#FFFFFF', '#000000')).toBe(true);
		});

		it('should fail for low contrast', () => {
			expect(checkContrastAA('#CCCCCC', '#DDDDDD')).toBe(false);
		});
	});

	describe('checkContrastAAA', () => {
		it('should pass for very high contrast', () => {
			expect(checkContrastAAA('#FFFFFF', '#000000')).toBe(true);
		});

		it('should fail for moderate contrast', () => {
			expect(checkContrastAAA('#CCCCCC', '#DDDDDD')).toBe(false);
		});
	});

	describe('calculateContrastRatio', () => {
		it('should calculate contrast ratio', () => {
			const ratio = calculateContrastRatio('#FFFFFF', '#000000');
			expect(ratio).toBeGreaterThan(10);
		});
	});

	describe('getLuminance', () => {
		it('should calculate luminance for white', () => {
			const lum = getLuminance('#FFFFFF');
			expect(lum).toBeCloseTo(1, 2);
		});

		it('should calculate luminance for black', () => {
			const lum = getLuminance('#000000');
			expect(lum).toBeCloseTo(0, 2);
		});
	});

	describe('hexToRgb', () => {
		it('should convert hex to RGB', () => {
			const rgb = hexToRgb('#FFFFFF');
			expect(rgb).toEqual([255, 255, 255]);
		});

		it('should convert short hex to RGB', () => {
			const rgb = hexToRgb('#FFF');
			expect(rgb).toEqual([255, 255, 255]);
		});

		it('should return null for invalid hex', () => {
			const rgb = hexToRgb('invalid');
			expect(rgb).toBeNull();
		});
	});

	describe('normalizeKeyCombination', () => {
		it('should normalize key combination', () => {
			const normalized = normalizeKeyCombination('Ctrl + S');
			expect(normalized).toBe('ctrl+s');
		});

		it('should sort keys', () => {
			const normalized = normalizeKeyCombination('S+Ctrl');
			expect(normalized).toBe('ctrl+s');
		});
	});

	describe('matchesKeyCombination', () => {
		it('should match key combinations', () => {
			expect(matchesKeyCombination('Ctrl+S', 'ctrl+s')).toBe(true);
		});

		it('should not match different combinations', () => {
			expect(matchesKeyCombination('Ctrl+S', 'Ctrl+C')).toBe(false);
		});
	});
});
