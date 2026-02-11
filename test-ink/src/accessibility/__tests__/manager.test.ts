/**
 * Accessibility Manager Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {AccessibilityManager} from '../manager.js';

describe('AccessibilityManager', () => {
	let manager: AccessibilityManager;

	beforeEach(() => {
		manager = new AccessibilityManager();
	});

	describe('constructor', () => {
		it('should create manager with default settings', () => {
			expect(manager.initialized).toBe(false);
			expect(manager.settings.screenReaderEnabled).toBe(true);
		});
	});

	describe('screenReader', () => {
		it('should return screen reader instance', () => {
			expect(manager.screenReader).toBeDefined();
		});
	});

	describe('focusManager', () => {
		it('should return focus manager instance', () => {
			expect(manager.focusManager).toBeDefined();
		});
	});

	describe('keyboardNavigation', () => {
		it('should return keyboard navigation instance', () => {
			expect(manager.keyboardNavigation).toBeDefined();
		});
	});

	describe('highContrastMode', () => {
		it('should return high contrast mode instance', () => {
			expect(manager.highContrastMode).toBeDefined();
		});
	});

	describe('textScaling', () => {
		it('should return text scaling instance', () => {
			expect(manager.textScaling).toBeDefined();
		});
	});

	describe('reducedMotion', () => {
		it('should return reduced motion instance', () => {
			expect(manager.reducedMotion).toBeDefined();
		});
	});

	describe('accessibilityTree', () => {
		it('should return accessibility tree instance', () => {
			expect(manager.accessibilityTree).toBeDefined();
		});
	});

	describe('announce', () => {
		it('should announce text', () => {
			manager.announce('Hello world');
			// No error thrown
			expect(true).toBe(true);
		});
	});

	describe('enableHighContrast', () => {
		it('should enable high contrast', () => {
			manager.enableHighContrast();
			expect(manager.settings.highContrastEnabled).toBe(true);
		});
	});

	describe('disableHighContrast', () => {
		it('should disable high contrast', () => {
			manager.enableHighContrast();
			manager.disableHighContrast();
			expect(manager.settings.highContrastEnabled).toBe(false);
		});
	});

	describe('enableReducedMotion', () => {
		it('should enable reduced motion', () => {
			manager.enableReducedMotion();
			expect(manager.settings.reducedMotionEnabled).toBe(true);
		});
	});

	describe('disableReducedMotion', () => {
		it('should disable reduced motion', () => {
			manager.enableReducedMotion();
			manager.disableReducedMotion();
			expect(manager.settings.reducedMotionEnabled).toBe(false);
		});
	});

	describe('setTextScale', () => {
		it('should set text scale', () => {
			manager.setTextScale(1.5);
			expect(manager.settings.textScaling.scale).toBe(1.5);
		});
	});

	describe('registerShortcut', () => {
		it('should register shortcut', () => {
			manager.registerShortcut('Ctrl+S', () => {}, 'Save');
			// No error thrown
			expect(true).toBe(true);
		});
	});

	describe('updateSettings', () => {
		it('should update settings', () => {
			manager.updateSettings({screenReaderEnabled: false});
			expect(manager.settings.screenReaderEnabled).toBe(false);
		});
	});

	describe('resetSettings', () => {
		it('should reset settings', () => {
			manager.updateSettings({screenReaderEnabled: false});
			manager.resetSettings();
			expect(manager.settings.screenReaderEnabled).toBe(true);
		});
	});

	describe('enableAll', () => {
		it('should enable all features', () => {
			manager.enableAll();
			expect(manager.settings.screenReaderEnabled).toBe(true);
			expect(manager.settings.keyboardNavigationEnabled).toBe(true);
		});
	});

	describe('disableAll', () => {
		it('should disable all features', () => {
			manager.disableAll();
			expect(manager.settings.screenReaderEnabled).toBe(false);
			expect(manager.settings.keyboardNavigationEnabled).toBe(false);
		});
	});

	describe('destroy', () => {
		it('should destroy manager', () => {
			manager.destroy();
			expect(manager.initialized).toBe(false);
		});
	});
});
