/**
 * Input Widget Module
 *
 * Provides the InputWidget class for text input.
 * Supports cursor positioning, text selection, and keyboard navigation.
 *
 * @module widgets/input
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetKeyEvent,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * Props specific to the Input widget
 */
export interface InputWidgetProps extends WidgetProps {
	/** Current input value */
	value?: string;

	/** Placeholder text */
	placeholder?: string;

	/** Change handler */
	onChange?: (value: string) => void;

	/** Maximum length of input */
	maxLength?: number;

	/** Whether to mask input (for passwords) */
	password?: boolean;

	/** Mask character for password input */
	maskChar?: string;

	/** Whether the input is read-only */
	readOnly?: boolean;
}

/**
 * State specific to the Input widget
 */
export interface InputWidgetState extends WidgetState {
	/** Current cursor position */
	cursorPosition: number;

	/** Selection start index */
	selectionStart: number;

	/** Selection end index */
	selectionEnd: number;

	/** Whether text is currently selected */
	hasSelection: boolean;

	/** Scroll offset for long text */
	scrollOffset: number;
}

/**
 * Input widget for text entry
 *
 * Features:
 * - Cursor positioning and movement
 * - Text selection with shift+arrow keys
 * - Keyboard navigation (arrows, Home, End)
 * - Password masking
 * - Max length enforcement
 * - Placeholder text
 */
export class InputWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'input';

	/** Default props for input widgets */
	static defaultProps: Required<InputWidgetProps> = {
		...BaseWidget.defaultProps,
		value: '',
		placeholder: '',
		onChange: undefined as unknown as (value: string) => void,
		maxLength: Infinity,
		password: false,
		maskChar: '*',
		readOnly: false,
	};

	/**
	 * Create a new input widget
	 *
	 * @param props - Input widget props
	 */
	constructor(props: InputWidgetProps = {}) {
		super(props);
		this._state = {
			...this._state,
			cursorPosition: props.value?.length || 0,
			selectionStart: 0,
			selectionEnd: 0,
			hasSelection: false,
			scrollOffset: 0,
		};
	}

	/**
	 * Get input-specific props
	 */
	get inputProps(): Required<InputWidgetProps> {
		return this._props as Required<InputWidgetProps>;
	}

	/**
	 * Get input-specific state
	 */
	get inputState(): InputWidgetState {
		return this._state as InputWidgetState;
	}

	/**
	 * Get the current value
	 */
	getValue(): string {
		return this.inputProps.value;
	}

	/**
	 * Set the input value
	 *
	 * @param value - New value
	 * @param triggerChange - Whether to trigger onChange callback
	 */
	setValue(value: string, triggerChange = true): void {
		const {maxLength, onChange} = this.inputProps;

		// Enforce max length
		if (value.length > maxLength) {
			value = value.slice(0, maxLength);
		}

		const previousValue = this.inputProps.value;

		if (previousValue !== value) {
			this.update({...this._props, value} as WidgetProps);

			// Move cursor to end if value changed externally
			if (this.inputState.cursorPosition > value.length) {
				this.setCursorPosition(value.length);
			}

			if (triggerChange) {
				onChange?.(value);
			}
		}
	}

	/**
	 * Insert text at cursor position
	 *
	 * @param text - Text to insert
	 */
	insertText(text: string): void {
		if (this.inputProps.readOnly) {
			return;
		}

		const currentValue = this.inputProps.value;
		const {cursorPosition, hasSelection, selectionStart, selectionEnd} =
			this.inputState;

		let newValue: string;
		let newCursorPosition: number;

		if (hasSelection) {
			// Replace selection
			newValue =
				currentValue.slice(0, selectionStart) +
				text +
				currentValue.slice(selectionEnd);
			newCursorPosition = selectionStart + text.length;
		} else {
			// Insert at cursor
			newValue =
				currentValue.slice(0, cursorPosition) +
				text +
				currentValue.slice(cursorPosition);
			newCursorPosition = cursorPosition + text.length;
		}

		this.setValue(newValue);
		this.setCursorPosition(newCursorPosition);
		this.clearSelection();
	}

	/**
	 * Delete selected text or character before cursor
	 */
	deleteBackward(): void {
		if (this.inputProps.readOnly) {
			return;
		}

		const currentValue = this.inputProps.value;
		const {cursorPosition, hasSelection, selectionStart, selectionEnd} =
			this.inputState;

		if (hasSelection) {
			this.insertText('');
			return;
		}

		if (cursorPosition > 0) {
			const newValue =
				currentValue.slice(0, cursorPosition - 1) +
				currentValue.slice(cursorPosition);
			this.setValue(newValue);
			this.setCursorPosition(cursorPosition - 1);
		}
	}

	/**
	 * Delete selected text or character after cursor
	 */
	deleteForward(): void {
		if (this.inputProps.readOnly) {
			return;
		}

		const currentValue = this.inputProps.value;
		const {cursorPosition, hasSelection, selectionStart, selectionEnd} =
			this.inputState;

		if (hasSelection) {
			this.insertText('');
			return;
		}

		if (cursorPosition < currentValue.length) {
			const newValue =
				currentValue.slice(0, cursorPosition) +
				currentValue.slice(cursorPosition + 1);
			this.setValue(newValue);
		}
	}

	/**
	 * Set cursor position
	 *
	 * @param position - New cursor position
	 */
	setCursorPosition(position: number): void {
		const value = this.inputProps.value;
		const clampedPosition = Math.max(0, Math.min(position, value.length));

		this.setState({cursorPosition: clampedPosition});
		this.updateScrollOffset();
	}

	/**
	 * Get cursor position
	 */
	getCursorPosition(): number {
		return this.inputState.cursorPosition;
	}

	/**
	 * Set text selection
	 *
	 * @param start - Selection start
	 * @param end - Selection end
	 */
	setSelection(start: number, end: number): void {
		const value = this.inputProps.value;
		const clampedStart = Math.max(0, Math.min(start, value.length));
		const clampedEnd = Math.max(0, Math.min(end, value.length));

		this.setState({
			selectionStart: clampedStart,
			selectionEnd: clampedEnd,
			hasSelection: clampedStart !== clampedEnd,
		});
	}

	/**
	 * Clear text selection
	 */
	clearSelection(): void {
		this.setState({
			selectionStart: 0,
			selectionEnd: 0,
			hasSelection: false,
		});
	}

	/**
	 * Select all text
	 */
	selectAll(): void {
		const value = this.inputProps.value;
		this.setSelection(0, value.length);
	}

	/**
	 * Update scroll offset to keep cursor visible
	 */
	private updateScrollOffset(): void {
		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {cursorPosition} = this.inputState;
		const visibleWidth = bounds.width - 2; // Account for padding

		let {scrollOffset} = this.inputState;

		// Adjust scroll to keep cursor visible
		if (cursorPosition < scrollOffset) {
			scrollOffset = cursorPosition;
		} else if (cursorPosition > scrollOffset + visibleWidth) {
			scrollOffset = cursorPosition - visibleWidth;
		}

		this.setState({scrollOffset});
	}

	/**
	 * Render the input widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {value, placeholder, password, maskChar} = this.inputProps;
		const {focused, cursorPosition, scrollOffset} = this.inputState;

		// Determine what text to display
		let displayText = value;
		if (password) {
			displayText = maskChar.repeat(value.length);
		}

		// Show placeholder if empty and not focused
		if (!displayText && !focused && placeholder) {
			displayText = placeholder;
		}

		// Apply scroll offset
		const visibleWidth = bounds.width - 2;
		const visibleText = displayText.slice(
			scrollOffset,
			scrollOffset + visibleWidth,
		);

		// Render would happen here via the rendering engine
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		switch (event.widgetEventType) {
			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

			case WidgetEventType.FOCUS_GAINED:
				this.setCursorPosition(this.inputState.cursorPosition);
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle keyboard events
	 */
	private handleKeyDown(event: WidgetKeyEvent): boolean {
		if (this._state.disabled) {
			return false;
		}

		const {key, shift, ctrl} = event;
		const {cursorPosition, hasSelection, selectionStart, selectionEnd} =
			this.inputState;
		const value = this.inputProps.value;

		switch (key) {
			case 'left':
				if (ctrl) {
					// Move to start of word
					const newPos = this.findWordBoundary(value, cursorPosition, -1);
					this.handleCursorMove(newPos, shift);
				} else {
					this.handleCursorMove(cursorPosition - 1, shift);
				}
				return true;

			case 'right':
				if (ctrl) {
					// Move to end of word
					const newPos = this.findWordBoundary(value, cursorPosition, 1);
					this.handleCursorMove(newPos, shift);
				} else {
					this.handleCursorMove(cursorPosition + 1, shift);
				}
				return true;

			case 'home':
				this.handleCursorMove(0, shift);
				return true;

			case 'end':
				this.handleCursorMove(value.length, shift);
				return true;

			case 'backspace':
				this.deleteBackward();
				return true;

			case 'delete':
				this.deleteForward();
				return true;

			case 'return':
			case 'enter':
				// Input widgets typically don't handle return
				return false;

			default:
				// Handle printable characters
				if (key.length === 1 && !ctrl) {
					this.insertText(key);
					return true;
				}
				return false;
		}
	}

	/**
	 * Handle cursor movement with optional selection
	 */
	private handleCursorMove(newPosition: number, extendSelection: boolean): void {
		const currentPosition = this.inputState.cursorPosition;

		if (extendSelection) {
			if (!this.inputState.hasSelection) {
				this.setSelection(currentPosition, newPosition);
			} else {
				// Extend existing selection
				if (currentPosition === this.inputState.selectionStart) {
					this.setSelection(newPosition, this.inputState.selectionEnd);
				} else {
					this.setSelection(this.inputState.selectionStart, newPosition);
				}
			}
		} else {
			this.clearSelection();
		}

		this.setCursorPosition(newPosition);
	}

	/**
	 * Find word boundary
	 */
	private findWordBoundary(
		text: string,
		position: number,
		direction: -1 | 1,
	): number {
		if (direction === -1) {
			// Move backward
			let pos = position - 1;
			while (pos > 0 && text[pos] === ' ') {
				pos--;
			}
			while (pos > 0 && text[pos - 1] !== ' ') {
				pos--;
			}
			return pos;
		} else {
			// Move forward
			let pos = position;
			while (pos < text.length && text[pos] === ' ') {
				pos++;
			}
			while (pos < text.length && text[pos] !== ' ') {
				pos++;
			}
			return pos;
		}
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}
}
