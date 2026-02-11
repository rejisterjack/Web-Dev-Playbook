/**
 * Checkbox Widget Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {CheckboxWidget} from '../checkbox.js';

describe('CheckboxWidget', () => {
	let checkbox: CheckboxWidget;
	let changeHandler: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		changeHandler = vi.fn();
		checkbox = new CheckboxWidget({
			id: 'test-checkbox',
			label: 'Check me',
			onChange: changeHandler,
		});
	});

	describe('constructor', () => {
		it('should create unchecked checkbox by default', () => {
			expect(checkbox.isChecked()).toBe(false);
		});

		it('should create checked checkbox when specified', () => {
			const checkedBox = new CheckboxWidget({checked: true});
			expect(checkedBox.isChecked()).toBe(true);
		});
	});

	describe('toggle', () => {
		it('should toggle from unchecked to checked', () => {
			checkbox.toggle();
			expect(checkbox.isChecked()).toBe(true);
		});

		it('should toggle from checked to unchecked', () => {
			checkbox.setChecked(true);
			checkbox.toggle();
			expect(checkbox.isChecked()).toBe(false);
		});

		it('should not toggle when disabled', () => {
			checkbox.setState({disabled: true});
			checkbox.toggle();
			expect(checkbox.isChecked()).toBe(false);
		});
	});

	describe('setChecked', () => {
		it('should set checked state', () => {
			checkbox.setChecked(true);
			expect(checkbox.isChecked()).toBe(true);
		});

		it('should trigger onChange', () => {
			checkbox.setChecked(true);
			expect(changeHandler).toHaveBeenCalledWith(true);
		});

		it('should not trigger onChange when triggerChange is false', () => {
			checkbox.setChecked(true, false);
			expect(changeHandler).not.toHaveBeenCalled();
		});

		it('should clear indeterminate when set', () => {
			checkbox.setIndeterminate(true);
			checkbox.setChecked(true);
			expect(checkbox.isIndeterminate()).toBe(false);
		});

		it('should not set when disabled', () => {
			checkbox.setState({disabled: true});
			checkbox.setChecked(true);
			expect(checkbox.isChecked()).toBe(false);
		});
	});

	describe('indeterminate', () => {
		it('should set indeterminate state', () => {
			checkbox.setIndeterminate(true);
			expect(checkbox.isIndeterminate()).toBe(true);
		});

		it('should get correct symbol for indeterminate', () => {
			checkbox.setIndeterminate(true);
			expect(checkbox.getSymbol()).toBe(CheckboxWidget.INDETERMINATE_SYMBOL);
		});

		it('should get correct symbol for checked', () => {
			checkbox.setChecked(true);
			expect(checkbox.getSymbol()).toBe(CheckboxWidget.CHECKED_SYMBOL);
		});

		it('should get correct symbol for unchecked', () => {
			expect(checkbox.getSymbol()).toBe(CheckboxWidget.UNCHECKED_SYMBOL);
		});
	});

	describe('isFocusable', () => {
		it('should be focusable by default', () => {
			expect(checkbox.isFocusable()).toBe(true);
		});

		it('should not be focusable when disabled', () => {
			checkbox.setState({disabled: true});
			expect(checkbox.isFocusable()).toBe(false);
		});
	});
});
