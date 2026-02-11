/**
 * Input Widget Tests
 */

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {InputWidget} from '../input.js';

describe('InputWidget', () => {
	let input: InputWidget;
	let changeHandler: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		changeHandler = vi.fn();
		input = new InputWidget({
			id: 'test-input',
			value: '',
			onChange: changeHandler,
		});
	});

	describe('constructor', () => {
		it('should create input with empty value', () => {
			expect(input.getValue()).toBe('');
		});

		it('should create input with initial value', () => {
			const inputWithValue = new InputWidget({
				value: 'hello',
			});
			expect(inputWithValue.getValue()).toBe('hello');
		});
	});

	describe('setValue', () => {
		it('should set value', () => {
			input.setValue('test');
			expect(input.getValue()).toBe('test');
		});

		it('should trigger onChange', () => {
			input.setValue('test');
			expect(changeHandler).toHaveBeenCalledWith('test');
		});

		it('should not trigger onChange when triggerChange is false', () => {
			input.setValue('test', false);
			expect(changeHandler).not.toHaveBeenCalled();
		});

		it('should enforce maxLength', () => {
			const inputWithMax = new InputWidget({
				value: '',
				maxLength: 5,
			});
			inputWithMax.setValue('hello world');
			expect(inputWithMax.getValue()).toBe('hello');
		});
	});

	describe('insertText', () => {
		it('should insert text at cursor', () => {
			input.setValue('hello');
			input.setCursorPosition(5);
			input.insertText(' world');
			expect(input.getValue()).toBe('hello world');
		});

		it('should insert text in middle', () => {
			input.setValue('hello world');
			input.setCursorPosition(5);
			input.insertText(' beautiful');
			expect(input.getValue()).toBe('hello beautiful world');
		});

		it('should not insert when readOnly', () => {
			const readOnlyInput = new InputWidget({readOnly: true});
			readOnlyInput.insertText('test');
			expect(readOnlyInput.getValue()).toBe('');
		});
	});

	describe('deleteBackward', () => {
		it('should delete character before cursor', () => {
			input.setValue('hello');
			input.setCursorPosition(5);
			input.deleteBackward();
			expect(input.getValue()).toBe('hell');
		});

		it('should do nothing at start', () => {
			input.setValue('hello');
			input.setCursorPosition(0);
			input.deleteBackward();
			expect(input.getValue()).toBe('hello');
		});
	});

	describe('deleteForward', () => {
		it('should delete character after cursor', () => {
			input.setValue('hello');
			input.setCursorPosition(0);
			input.deleteForward();
			expect(input.getValue()).toBe('ello');
		});

		it('should do nothing at end', () => {
			input.setValue('hello');
			input.setCursorPosition(5);
			input.deleteForward();
			expect(input.getValue()).toBe('hello');
		});
	});

	describe('cursor positioning', () => {
		it('should set cursor position', () => {
			input.setValue('hello');
			input.setCursorPosition(3);
			expect(input.getCursorPosition()).toBe(3);
		});

		it('should clamp cursor position to value length', () => {
			input.setValue('hi');
			input.setCursorPosition(10);
			expect(input.getCursorPosition()).toBe(2);
		});

		it('should not allow negative cursor position', () => {
			input.setValue('hi');
			input.setCursorPosition(-5);
			expect(input.getCursorPosition()).toBe(0);
		});
	});

	describe('selection', () => {
		it('should set selection', () => {
			input.setValue('hello world');
			input.setSelection(0, 5);
			expect(input.inputState.hasSelection).toBe(true);
			expect(input.inputState.selectionStart).toBe(0);
			expect(input.inputState.selectionEnd).toBe(5);
		});

		it('should clear selection', () => {
			input.setValue('hello');
			input.setSelection(0, 3);
			input.clearSelection();
			expect(input.inputState.hasSelection).toBe(false);
		});

		it('should select all', () => {
			input.setValue('hello');
			input.selectAll();
			expect(input.inputState.selectionStart).toBe(0);
			expect(input.inputState.selectionEnd).toBe(5);
		});
	});

	describe('isFocusable', () => {
		it('should be focusable by default', () => {
			expect(input.isFocusable()).toBe(true);
		});

		it('should not be focusable when disabled', () => {
			input.setState({disabled: true});
			expect(input.isFocusable()).toBe(false);
		});
	});
});
