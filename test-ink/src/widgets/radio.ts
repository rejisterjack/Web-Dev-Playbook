/**
 * Radio Button Widget Module
 *
 * Provides the RadioButtonWidget class for single-selection input.
 * Supports radio button groups where only one can be selected.
 *
 * @module widgets/radio
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
 * Props specific to the RadioButton widget
 */
export interface RadioButtonWidgetProps extends WidgetProps {
	/** Radio button value */
	value: string;

	/** Radio button group name */
	group: string;

	/** Radio button label */
	label?: string;

	/** Change handler - called when selected */
	onChange?: (value: string, group: string) => void;

	/** Whether this radio button is checked */
	checked?: boolean;
}

/**
 * State specific to the RadioButton widget
 */
export interface RadioButtonWidgetState extends WidgetState {
	/** Current checked state */
	checked: boolean;
}

/**
 * Radio button group manager
 */
export class RadioGroup {
	/** Group name */
	readonly name: string;

	/** Radio buttons in this group */
	private radios: RadioButtonWidget[] = [];

	/** Currently selected value */
	private selectedValue: string | null = null;

	/**
	 * Create a new radio group
	 *
	 * @param name - Group name
	 */
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Get the currently selected value
	 */
	get value(): string | null {
		return this.selectedValue;
	}

	/**
	 * Add a radio button to the group
	 *
	 * @param radio - Radio button to add
	 */
	add(radio: RadioButtonWidget): void {
		if (!this.radios.includes(radio)) {
			this.radios.push(radio);

			// If this radio is checked, update the group selection
			if (radio.isChecked()) {
				this.select(radio.getValue());
			}
		}
	}

	/**
	 * Remove a radio button from the group
	 *
	 * @param radio - Radio button to remove
	 */
	remove(radio: RadioButtonWidget): void {
		const index = this.radios.indexOf(radio);
		if (index !== -1) {
			this.radios.splice(index, 1);
		}
	}

	/**
	 * Select a radio button by value
	 *
	 * @param value - Value to select
	 */
	select(value: string): void {
		this.selectedValue = value;

		// Update all radios in the group
		for (const radio of this.radios) {
			const shouldBeChecked = radio.getValue() === value;
			if (radio.isChecked() !== shouldBeChecked) {
				radio.setCheckedInternal(shouldBeChecked);
			}
		}
	}

	/**
	 * Clear the selection
	 */
	clear(): void {
		this.selectedValue = null;

		for (const radio of this.radios) {
			radio.setCheckedInternal(false);
		}
	}

	/**
	 * Get all radio buttons in this group
	 */
	getRadios(): RadioButtonWidget[] {
		return [...this.radios];
	}

	/**
	 * Get the selected radio button
	 */
	getSelected(): RadioButtonWidget | undefined {
		return this.radios.find(r => r.isChecked());
	}
}

/**
 * Global registry of radio groups
 */
const radioGroups: Map<string, RadioGroup> = new Map();

/**
 * Get or create a radio group
 *
 * @param name - Group name
 */
export function getRadioGroup(name: string): RadioGroup {
	if (!radioGroups.has(name)) {
		radioGroups.set(name, new RadioGroup(name));
	}
	return radioGroups.get(name)!;
}

/**
 * Radio button widget for single-selection input
 *
 * Features:
 * - Radio button groups (only one selected per group)
 * - Keyboard activation (Space)
 * - Label support
 * - Group management
 */
export class RadioButtonWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'radio';

	/** Selected symbol */
	static readonly SELECTED_SYMBOL = '◉';

	/** Unselected symbol */
	static readonly UNSELECTED_SYMBOL = '○';

	/** Default props for radio button widgets */
	static defaultProps: Required<RadioButtonWidgetProps> = {
		...BaseWidget.defaultProps,
		value: '',
		group: '',
		label: '',
		onChange: undefined as unknown as (value: string, group: string) => void,
		checked: false,
	};

	/**
	 * Create a new radio button widget
	 *
	 * @param props - Radio button widget props
	 */
	constructor(props: RadioButtonWidgetProps) {
		super(props);
		this._state = {
			...this._state,
			checked: props.checked ?? false,
		};

		// Register with radio group
		if (props.group) {
			const group = getRadioGroup(props.group);
			group.add(this);
		}
	}

	/**
	 * Get radio button-specific props
	 */
	get radioProps(): Required<RadioButtonWidgetProps> {
		return this._props as Required<RadioButtonWidgetProps>;
	}

	/**
	 * Get radio button-specific state
	 */
	get radioState(): RadioButtonWidgetState {
		return this._state as RadioButtonWidgetState;
	}

	/**
	 * Get the radio button value
	 */
	getValue(): string {
		return this.radioProps.value;
	}

	/**
	 * Get the radio button group name
	 */
	getGroup(): string {
		return this.radioProps.group;
	}

	/**
	 * Get the current checked state
	 */
	isChecked(): boolean {
		return this.radioState.checked;
	}

	/**
	 * Select this radio button
	 */
	select(): void {
		if (this._state.disabled || this.radioState.checked) {
			return;
		}

		const group = getRadioGroup(this.radioProps.group);
		group.select(this.radioProps.value);

		// Trigger change handler
		this.radioProps.onChange?.(this.radioProps.value, this.radioProps.group);
	}

	/**
	 * Set checked state internally (called by RadioGroup)
	 *
	 * @param checked - New checked state
	 */
	setCheckedInternal(checked: boolean): void {
		this.setState({checked});
		this.invalidate();
	}

	/**
	 * Get the display symbol for current state
	 */
	getSymbol(): string {
		return this.radioState.checked
			? RadioButtonWidget.SELECTED_SYMBOL
			: RadioButtonWidget.UNSELECTED_SYMBOL;
	}

	/**
	 * Render the radio button widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {label} = this.radioProps;
		const {focused, disabled} = this._state;
		const symbol = this.getSymbol();

		// Get colors based on state
		const colors = this.getColors(!!focused, !!disabled);

		// Render radio symbol and label
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
				this.select();
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
				this.select();
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

	/**
	 * Destroy the widget
	 */
	destroy(): void {
		// Remove from radio group
		if (this.radioProps.group) {
			const group = getRadioGroup(this.radioProps.group);
			group.remove(this);
		}

		super.destroy();
	}
}
