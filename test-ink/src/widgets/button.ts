/**
 * Button Widget Module
 *
 * Provides the ButtonWidget class for interactive buttons.
 * Supports keyboard activation, hover state, and multiple variants.
 *
 * @module widgets/button
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetMouseEvent,
	WidgetKeyEvent,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color, CellStyles} from '../rendering/cell.js';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Props specific to the Button widget
 */
export interface ButtonWidgetProps extends WidgetProps {
	/** Button label text */
	label: string;

	/** Click handler */
	onClick?: () => void;

	/** Whether the button is disabled */
	disabled?: boolean;

	/** Button variant */
	variant?: ButtonVariant;

	/** Button width (auto if not specified) */
	width?: number;
}

/**
 * State specific to the Button widget
 */
export interface ButtonWidgetState extends WidgetState {
	/** Whether the button is currently pressed */
	pressed?: boolean;
}

/**
 * Button widget for user interaction
 *
 * Features:
 * - Click handling with onClick callback
 * - Keyboard activation (Enter, Space)
 * - Hover state visualization
 * - Multiple visual variants (primary, secondary, danger, ghost)
 * - Disabled state
 */
export class ButtonWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'button';

	/** Default props for button widgets */
	static defaultProps: Required<ButtonWidgetProps> = {
		...BaseWidget.defaultProps,
		label: '',
		onClick: undefined as unknown as () => void,
		disabled: false,
		variant: 'primary',
		width: 0,
	};

	/**
	 * Create a new button widget
	 *
	 * @param props - Button widget props
	 */
	constructor(props: ButtonWidgetProps) {
		super(props);
	}

	/**
	 * Get button-specific props
	 */
	get buttonProps(): Required<ButtonWidgetProps> {
		return this._props as Required<ButtonWidgetProps>;
	}

	/**
	 * Get button-specific state
	 */
	get buttonState(): ButtonWidgetState {
		return this._state as ButtonWidgetState;
	}

	/**
	 * Set the button label
	 *
	 * @param label - New label text
	 */
	setLabel(label: string): void {
		if (this.buttonProps.label !== label) {
			this.update({...this._props, label} as WidgetProps);
		}
	}

	/**
	 * Simulate a button click
	 */
	click(): void {
		if (this._state.disabled) {
			return;
		}

		this.buttonProps.onClick?.();
	}

	/**
	 * Set the disabled state
	 *
	 * @param disabled - Whether the button should be disabled
	 */
	setDisabled(disabled: boolean): void {
		this.update({...this._props, disabled} as WidgetProps);
		this.setState({disabled});
	}

	/**
	 * Render the button widget
	 *
	 * @param context - Widget context for rendering
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {label, variant, width} = this.buttonProps;
		const {hovered, focused, pressed, disabled} = this._state;

		// Calculate button dimensions
		const buttonWidth = width || label.length + 4; // Padding of 2 on each side
		const buttonHeight = 1;

		// Get colors based on state and variant
		const colors = this.getColors(variant, !!hovered, !!focused, !!disabled);

		// Render button background and border
		// This is a simplified rendering - actual implementation would
		// integrate with the rendering engine

		// Render label centered
		const labelX = bounds.x + Math.floor((buttonWidth - label.length) / 2);
		const labelY = bounds.y;

		// The actual rendering would write to a ScreenBuffer here
	}

	/**
	 * Get colors based on button state and variant
	 */
	private getColors(
		variant: ButtonVariant,
		hovered: boolean,
		focused: boolean,
		disabled: boolean,
	): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		const variants: Record<ButtonVariant, {fg: Color; bg: Color}> = {
			primary: {fg: 'white', bg: {rgb: [59, 130, 246]}},
			secondary: {fg: 'default', bg: {rgb: [75, 85, 99]}},
			danger: {fg: 'white', bg: {rgb: [239, 68, 68]}},
			ghost: {fg: 'default', bg: 'default'},
		};

		const colors = variants[variant];

		if (hovered) {
			// Lighten background on hover
			return {
				fg: colors.fg,
				bg: this.lightenColor(colors.bg),
			};
		}

		if (focused) {
			// Add focus indicator
			return {
				fg: colors.fg,
				bg: colors.bg,
			};
		}

		return colors;
	}

	/**
	 * Lighten a color (simplified)
	 */
	private lightenColor(color: Color): Color {
		if (typeof color === 'string') {
			return color;
		}

		if ('rgb' in color) {
			const [r, g, b] = color.rgb;
			return {
				rgb: [
					Math.min(255, r + 20),
					Math.min(255, g + 20),
					Math.min(255, b + 20),
				],
			};
		}

		return color;
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		switch (event.widgetEventType) {
			case WidgetEventType.MOUSE_ENTER:
				this.setState({hovered: true});
				return true;

			case WidgetEventType.MOUSE_LEAVE:
				this.setState({hovered: false, pressed: false});
				return true;

			case WidgetEventType.MOUSE_DOWN:
				if (!this._state.disabled) {
					this.setState({pressed: true});
				}
				return true;

			case WidgetEventType.MOUSE_UP:
				if (this.buttonState.pressed && !this._state.disabled) {
					this.setState({pressed: false});
					this.click();
				}
				return true;

			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

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
			case 'return':
			case 'space':
				this.click();
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
		this.setState({pressed: false});
		this.invalidate();
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}
}
