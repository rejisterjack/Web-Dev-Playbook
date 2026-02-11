/**
 * Checkbox Widget Module
 *
 * Provides the CheckboxWidget class for boolean input.
 * Supports checked, unchecked, and indeterminate states.
 *
 * @module widgets/checkbox
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
 * Props specific to the Checkbox widget
 */
export interface CheckboxWidgetProps extends WidgetProps {
	/** Whether the checkbox is checked */
	checked?: boolean;

	/** Checkbox label */
	label?: string;

	/** Change handler */
	onChange?: (checked: boolean) => void;

	/** Whether the checkbox is in indeterminate state */
	indeterminate?: boolean;
}

/**
 * State specific to the Checkbox widget
 */
export interface CheckboxWidgetState extends WidgetState {
	/** Current checked state */
	checked: boolean;

	/** Whether in indeterminate state */
	indeterminate: boolean;
}

/**
 * Checkbox widget for boolean input
 *
 * Features:
 * - Checked/unchecked states
 * - Indeterminate state support
 * - Keyboard activation (Space)
 * - Label support
 */
export class CheckboxWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'checkbox';

	/** Checked symbol */
	static readonly CHECKED_SYMBOL = '☑';

	/** Unchecked symbol */
	static readonly UNCHECKED_SYMBOL = '☐';

	/** Indeterminate symbol */
	static readonly INDETERMINATE_SYMBOL = '◫';

	/** Default props for checkbox widgets */
	static defaultProps: Required<CheckboxWidgetProps> = {
		...BaseWidget.defaultProps,
		checked: false,
		label: '',
		onChange: undefined as unknown as (checked: boolean) => void,
		indeterminate: false,
	};

	/**
	 * Create a new checkbox widget
	 *
	 * @param props - Checkbox widget props
	 */
	constructor(props: CheckboxWidgetProps = {}) {
		super(props);
		this._state = {
			...this._state,
			checked: props.checked ?? false,
			indeterminate: props.indeterminate ?? false,
		};
	}

	/**
	 * Get checkbox-specific props
	 */
	get checkboxProps(): Required<CheckboxWidgetProps> {
		return this._props as Required<CheckboxWidgetProps>;
	}

	/**
	 * Get checkbox-specific state
	 */
	get checkboxState(): CheckboxWidgetState {
		return this._state as CheckboxWidgetState;
	}

	/**
	 * Get the current checked state
	 */
	isChecked(): boolean {
		return this.checkboxState.checked;
	}

	/**
	 * Get the indeterminate state
	 */
	isIndeterminate(): boolean {
		return this.checkboxState.indeterminate;
	}

	/**
	 * Toggle the checked state
	 */
	toggle(): void {
		if (this._state.disabled) {
			return;
		}

		const newChecked = !this.checkboxState.checked;
		this.setChecked(newChecked);
	}

	/**
	 * Set the checked state
	 *
	 * @param checked - New checked state
	 * @param triggerChange - Whether to trigger onChange callback
	 */
	setChecked(checked: boolean, triggerChange = true): void {
		if (this._state.disabled) {
			return;
		}

		const previousChecked = this.checkboxState.checked;

		this.setState({
			checked,
			indeterminate: false, // Clear indeterminate when explicitly set
		});

		this.update({...this._props, checked, indeterminate: false} as WidgetProps);

		if (triggerChange && previousChecked !== checked) {
			this.checkboxProps.onChange?.(checked);
		}
	}

	/**
	 * Set the indeterminate state
	 *
	 * @param indeterminate - New indeterminate state
	 */
	setIndeterminate(indeterminate: boolean): void {
		this.setState({indeterminate});
		this.update({...this._props, indeterminate} as WidgetProps);
	}

	/**
	 * Get the display symbol for current state
	 */
	getSymbol(): string {
		if (this.checkboxState.indeterminate) {
			return CheckboxWidget.INDETERMINATE_SYMBOL;
		}
		return this.checkboxState.checked
			? CheckboxWidget.CHECKED_SYMBOL
			: CheckboxWidget.UNCHECKED_SYMBOL;
	}

	/**
	 * Render the checkbox widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {label} = this.checkboxProps;
		const {focused, disabled} = this._state;
		const symbol = this.getSymbol();

		// Get colors based on state
		const colors = this.getColors(!!focused, !!disabled);

		// Render checkbox symbol and label
		// This would integrate with the rendering engine
		const displayText = label ? `${symbol} ${label}` : symbol;

		// Actual rendering would happen here
	}

	/**
	 * Get colors based on state
	 */
	private getColors(focused: boolean, disabled: boolean): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		if (focused) {
			return {fg: {rgb: [59, 130, 246]}, bg: 'default'};
		}

		return {fg: 'default', bg: 'default'};
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		switch (event.widgetEventType) {
			case WidgetEventType.CLICK:
				this.toggle();
				return true;

			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

			case WidgetEventType.FOCUS_GAINED:
			case WidgetEventType.FOCUS_LOST:
				this.invalidate();
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

		switch (event.key) {
			case 'space':
				this.toggle();
				return true;

			default:
				return false;
		}
	}

	/**
	 * Called when widget receives focus
	 */
	onFocus(): void {
		super.onFocus();
		this.invalidate();
	}

	/**
	 * Called when widget loses focus
	 */
	onBlur(): void {
		super.onBlur();
		this.invalidate();
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}
}
