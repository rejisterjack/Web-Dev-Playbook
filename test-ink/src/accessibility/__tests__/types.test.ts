/**
 * Accessibility Types Tests
 */

import {describe, it, expect} from 'vitest';
import {
	AccessibilityRole,
	AccessibilityState,
	LiveRegionType,
	FocusDirection,
	DEFAULT_ACCESSIBILITY_SETTINGS,
	DEFAULT_HIGH_CONTRAST_PALETTE,
} from '../types.js';

describe('Accessibility Types', () => {
	describe('AccessibilityRole', () => {
		it('should have all expected roles', () => {
			expect(AccessibilityRole.BUTTON).toBe('button');
			expect(AccessibilityRole.CHECKBOX).toBe('checkbox');
			expect(AccessibilityRole.TEXTBOX).toBe('textbox');
			expect(AccessibilityRole.LIST).toBe('list');
			expect(AccessibilityRole.DIALOG).toBe('dialog');
		});
	});

	describe('AccessibilityState', () => {
		it('should have all expected states', () => {
			expect(AccessibilityState.CHECKED).toBe('checked');
			expect(AccessibilityState.SELECTED).toBe('selected');
			expect(AccessibilityState.EXPANDED).toBe('expanded');
			expect(AccessibilityState.DISABLED).toBe('disabled');
		});
	});

	describe('LiveRegionType', () => {
		it('should have all expected types', () => {
			expect(LiveRegionType.POLITE).toBe('polite');
			expect(LiveRegionType.ASSERTIVE).toBe('assertive');
			expect(LiveRegionType.OFF).toBe('off');
		});
	});

	describe('FocusDirection', () => {
		it('should have all expected directions', () => {
			expect(FocusDirection.NEXT).toBe('next');
			expect(FocusDirection.PREVIOUS).toBe('previous');
			expect(FocusDirection.UP).toBe('up');
			expect(FocusDirection.DOWN).toBe('down');
		});
	});

	describe('DEFAULT_ACCESSIBILITY_SETTINGS', () => {
		it('should have default settings', () => {
			expect(DEFAULT_ACCESSIBILITY_SETTINGS.screenReaderEnabled).toBe(true);
			expect(DEFAULT_ACCESSIBILITY_SETTINGS.highContrastEnabled).toBe(false);
			expect(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotionEnabled).toBe(false);
			expect(DEFAULT_ACCESSIBILITY_SETTINGS.textScaling.scale).toBe(1.0);
		});
	});

	describe('DEFAULT_HIGH_CONTRAST_PALETTE', () => {
		it('should have default palette', () => {
			expect(DEFAULT_HIGH_CONTRAST_PALETTE.foreground).toBe('#FFFFFF');
			expect(DEFAULT_HIGH_CONTRAST_PALETTE.background).toBe('#000000');
			expect(DEFAULT_HIGH_CONTRAST_PALETTE.highlight).toBe('#FFFF00');
		});
	});
});
