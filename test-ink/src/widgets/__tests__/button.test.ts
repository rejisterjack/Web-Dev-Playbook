/**
 * Button Widget Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ButtonWidget} from '../button.js';

describe('ButtonWidget', () => {
	let button: ButtonWidget;
	let clickHandler: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		clickHandler = vi.fn();
		button = new ButtonWidget({
			id: 'test-button',
			label: 'Click Me',
			onClick: clickHandler,
		});
	});

	describe('constructor', () => {
		it('should create button with label', () => {
			expect(button.buttonProps.label).toBe('Click Me');
		});

		it('should have default variant', () => {
			expect(button.buttonProps.variant).toBe('primary');
		});
	});

	describe('setLabel', () => {
		it('should update label', () => {
			button.setLabel('New Label');
			expect(button.buttonProps.label).toBe('New Label');
		});
	});

	describe('click', () => {
		it('should trigger onClick handler', () => {
			button.click();
			expect(clickHandler).toHaveBeenCalled();
		});

		it('should not trigger when disabled', () => {
			button.setDisabled(true);
			button.click();
			expect(clickHandler).not.toHaveBeenCalled();
		});
	});

	describe('setDisabled', () => {
		it('should disable button', () => {
			button.setDisabled(true);
			expect(button.state.disabled).toBe(true);
		});

		it('should enable button', () => {
			button.setDisabled(true);
			button.setDisabled(false);
			expect(button.state.disabled).toBe(false);
		});
	});

	describe('isFocusable', () => {
		it('should be focusable when visible and not disabled', () => {
			expect(button.isFocusable()).toBe(true);
		});

		it('should not be focusable when disabled', () => {
			button.setDisabled(true);
			expect(button.isFocusable()).toBe(false);
		});

		it('should not be focusable when not visible', () => {
			button.update({visible: false});
			expect(button.isFocusable()).toBe(false);
		});
	});

	describe('focus/blur', () => {
		it('should handle focus', () => {
			button.mount();
			button.focus();
			expect(button.hasFocus).toBe(true);
		});

		it('should handle blur', () => {
			button.mount();
			button.focus();
			button.blur();
			expect(button.hasFocus).toBe(false);
		});
	});
});
