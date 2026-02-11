/**
 * High Contrast Mode Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {HighContrastMode, HighContrastDetectionMethod, HighContrastPreset} from '../high-contrast.js';

describe('HighContrastMode', () => {
	let highContrast: HighContrastMode;

	beforeEach(() => {
		highContrast = new HighContrastMode();
	});

	describe('constructor', () => {
		it('should create high contrast mode with disabled state', () => {
			expect(highContrast.enabled).toBe(false);
		});
	});

	describe('enable', () => {
		it('should enable high contrast mode', () => {
			highContrast.enable();
			expect(highContrast.enabled).toBe(true);
		});
	});

	describe('disable', () => {
		it('should disable high contrast mode', () => {
			highContrast.enable();
			highContrast.disable();
			expect(highContrast.enabled).toBe(false);
		});
	});

	describe('toggle', () => {
		it('should toggle high contrast mode', () => {
			highContrast.toggle();
			expect(highContrast.enabled).toBe(true);
			highContrast.toggle();
			expect(highContrast.enabled).toBe(false);
		});
	});

	describe('setPreset', () => {
		it('should set preset', () => {
			highContrast.setPreset(HighContrastPreset.LIGHT);
			expect(highContrast.preset).toBe(HighContrastPreset.LIGHT);
		});
	});

	describe('checkContrast', () => {
		it('should check contrast ratio', () => {
			const result = highContrast.checkContrast('#FFFFFF', '#000000', 'AA');
			expect(result).toBe(true);
		});

		it('should fail for low contrast', () => {
			const result = highContrast.checkContrast('#CCCCCC', '#DDDDDD', 'AA');
			expect(result).toBe(false);
		});
	});

	describe('calculateContrastRatio', () => {
		it('should calculate contrast ratio', () => {
			const ratio = highContrast.calculateContrastRatio('#FFFFFF', '#000000');
			expect(ratio).toBeGreaterThan(10);
		});
	});

	describe('onChange', () => {
		it('should register change listener', () => {
			const listener = () => {};
			highContrast.onChange(listener);
			// No error thrown
			expect(true).toBe(true);
		});
	});

	describe('destroy', () => {
		it('should destroy high contrast mode', () => {
			highContrast.destroy();
			expect(highContrast.enabled).toBe(false);
		});
	});
});
