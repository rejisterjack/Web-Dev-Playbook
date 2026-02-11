/**
 * Focus Management Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {AccessibilityFocusManager, FocusEventType, FocusOrderStrategy} from '../focus.js';
import {FocusDirection} from '../types.js';
import {BaseWidget} from '../../widgets/base.js';

describe('AccessibilityFocusManager', () => {
	let focusManager: AccessibilityFocusManager;
	let widget1: BaseWidget;
	let widget2: BaseWidget;

	beforeEach(() => {
		focusManager = new AccessibilityFocusManager();
		widget1 = new BaseWidget({id: 'widget1', tabIndex: 1});
		widget2 = new BaseWidget({id: 'widget2', tabIndex: 2});
	});

	describe('constructor', () => {
		it('should create focus manager with enabled state', () => {
			expect(focusManager.enabled).toBe(true);
		});

		it('should have no focused widget initially', () => {
			expect(focusManager.focusedWidget).toBe(null);
		});
	});

	describe('registerFocusable', () => {
		it('should register focusable widget', () => {
			focusManager.registerFocusable(widget1);
			expect(focusManager.focusableWidgets).toContain(widget1);
		});

		it('should not register duplicate widget', () => {
			focusManager.registerFocusable(widget1);
			focusManager.registerFocusable(widget1);
			expect(focusManager.focusableWidgets.filter((w) => w === widget1).length).toBe(1);
		});
	});

	describe('unregisterFocusable', () => {
		it('should unregister focusable widget', () => {
			focusManager.registerFocusable(widget1);
			focusManager.unregisterFocusable(widget1);
			expect(focusManager.focusableWidgets).not.toContain(widget1);
		});
	});

	describe('setFocus', () => {
		it('should set focus to widget', () => {
			focusManager.registerFocusable(widget1);
			const result = focusManager.setFocus(widget1);
			expect(result).toBe(true);
			expect(focusManager.focusedWidget).toBe(widget1);
		});

		it('should not set focus to unregistered widget', () => {
			const result = focusManager.setFocus(widget1);
			expect(result).toBe(false);
		});

		it('should not set focus when disabled', () => {
			focusManager.enabled = false;
			focusManager.registerFocusable(widget1);
			const result = focusManager.setFocus(widget1);
			expect(result).toBe(false);
		});
	});

	describe('removeFocus', () => {
		it('should remove focus', () => {
			focusManager.registerFocusable(widget1);
			focusManager.setFocus(widget1);
			focusManager.removeFocus();
			expect(focusManager.focusedWidget).toBe(null);
		});
	});

	describe('moveFocus', () => {
		it('should move focus to next widget', () => {
			focusManager.registerFocusable(widget1);
			focusManager.registerFocusable(widget2);
			focusManager.setFocus(widget1);
			const result = focusManager.moveFocus(FocusDirection.NEXT);
			expect(result).toBe(true);
		});
	});

	describe('isFocusable', () => {
		it('should return true for focusable widget', () => {
			focusManager.registerFocusable(widget1);
			expect(focusManager.isFocusable(widget1)).toBe(true);
		});

		it('should return false for unregistered widget', () => {
			expect(focusManager.isFocusable(widget1)).toBe(false);
		});

		it('should return false for disabled widget', () => {
			widget1.update({disabled: true});
			focusManager.registerFocusable(widget1);
			expect(focusManager.isFocusable(widget1)).toBe(false);
		});
	});

	describe('focus order strategy', () => {
		it('should set focus order strategy', () => {
			focusManager.focusOrderStrategy = FocusOrderStrategy.VISUAL_ORDER;
			expect(focusManager.focusOrderStrategy).toBe(FocusOrderStrategy.VISUAL_ORDER);
		});
	});

	describe('event handlers', () => {
		it('should register event handler', () => {
			const handler = () => {};
			focusManager.on(FocusEventType.FOCUS_GAINED, handler);
			// No error thrown
			expect(true).toBe(true);
		});

		it('should unregister event handler', () => {
			const handler = () => {};
			focusManager.on(FocusEventType.FOCUS_GAINED, handler);
			focusManager.off(FocusEventType.FOCUS_GAINED, handler);
			// No error thrown
			expect(true).toBe(true);
		});
	});

	describe('destroy', () => {
		it('should destroy focus manager', () => {
			focusManager.destroy();
			expect(focusManager.enabled).toBe(false);
			expect(focusManager.focusableWidgets.length).toBe(0);
		});
	});
});
