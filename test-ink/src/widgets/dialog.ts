/**
 * Dialog Widget Module
 *
 * Provides the DialogWidget class for modal dialogs.
 * Supports modal behavior, keyboard dismissal, and action buttons.
 *
 * @module widgets/dialog
 */

import {BaseWidget} from './base.js';
import type {
	Widget,
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetKeyEvent,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * Dialog action button
 */
export interface DialogAction {
	/** Action ID */
	id: string;

	/** Button label */
	label: string;

	/** Action handler */
	onClick?: () => void;

	/** Whether this is the primary action */
	primary?: boolean;

	/** Whether the button is disabled */
	disabled?: boolean;
}

/**
 * Props specific to the Dialog widget
 */
export interface DialogWidgetProps extends WidgetProps {
	/** Dialog title */
	title?: string;

	/** Dialog content widget */
	content?: Widget;

	/** Action buttons */
	actions?: DialogAction[];

	/** Whether the dialog is open */
	open?: boolean;

	/** Close handler */
	onClose?: () => void;

	/** Dialog width */
	width?: number;

	/** Dialog height */
	height?: number;
}

/**
 * State specific to the Dialog widget
 */
export interface DialogWidgetState extends WidgetState {
	/** Whether the dialog is open */
	open: boolean;

	/** Index of focused action */
	focusedActionIndex: number;
}

/**
 * Dialog widget for modal dialogs
 *
 * Features:
 * - Modal behavior (blocks interaction with background)
 * - Keyboard dismissal (Escape)
 * - Action buttons
 * - Focus trapping
 * - Centered positioning
 */
export class DialogWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'dialog';

	/** Default props for dialog widgets */
	static defaultProps: Required<DialogWidgetProps> = {
		...BaseWidget.defaultProps,
		title: '',
		content: undefined as unknown as Widget,
		actions: [],
		open: false,
		onClose: undefined as unknown as () => void,
		width: 60,
		height: 20,
	};

	/**
	 * Create a new dialog widget
	 *
	 * @param props - Dialog widget props
	 */
	constructor(props: DialogWidgetProps = {}) {
		super(props);
		this._state = {
			...this._state,
			open: props.open ?? false,
			focusedActionIndex: 0,
		};
	}

	/**
	 * Get dialog-specific props
	 */
	get dialogProps(): Required<DialogWidgetProps> {
		return this._props as Required<DialogWidgetProps>;
	}

	/**
	 * Get dialog-specific state
	 */
	get dialogState(): DialogWidgetState {
		return this._state as DialogWidgetState;
	}

	/**
	 * Check if the dialog is open
	 */
	isOpen(): boolean {
		return this.dialogState.open;
	}

	/**
	 * Open the dialog
	 */
	open(): void {
		if (!this.dialogState.open) {
			this.setState({open: true, focusedActionIndex: 0});
			this.update({...this._props, open: true} as WidgetProps);
			this.invalidate();
		}
	}

	/**
	 * Close the dialog
	 */
	close(): void {
		if (this.dialogState.open) {
			this.setState({open: false});
			this.update({...this._props, open: false} as WidgetProps);
			this.dialogProps.onClose?.();
			this.invalidate();
		}
	}

	/**
	 * Toggle the dialog open/closed
	 */
	toggle(): void {
		if (this.dialogState.open) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * Get the dialog title
	 */
	getTitle(): string {
		return this.dialogProps.title;
	}

	/**
	 * Set the dialog title
	 *
	 * @param title - New title
	 */
	setTitle(title: string): void {
		this.update({...this._props, title} as WidgetProps);
	}

	/**
	 * Get the dialog content
	 */
	getContent(): Widget | undefined {
		return this.dialogProps.content;
	}

	/**
	 * Set the dialog content
	 *
	 * @param content - Content widget
	 */
	setContent(content: Widget): void {
		// Remove old content
		if (this.dialogProps.content) {
			this.removeChild(this.dialogProps.content);
		}

		// Add new content
		this.addChild(content);
		this.update({...this._props, content} as WidgetProps);
	}

	/**
	 * Get the actions
	 */
	getActions(): DialogAction[] {
		return this.dialogProps.actions;
	}

	/**
	 * Set the actions
	 *
	 * @param actions - New actions
	 */
	setActions(actions: DialogAction[]): void {
		this.update({...this._props, actions} as WidgetProps);
		this.setState({focusedActionIndex: 0});
	}

	/**
	 * Focus the next action button
	 */
	focusNextAction(): void {
		const actions = this.dialogProps.actions;
		if (actions.length === 0) {
			return;
		}

		let index = this.dialogState.focusedActionIndex + 1;

		// Skip disabled actions
		while (index < actions.length && actions[index]?.disabled) {
			index++;
		}

		if (index < actions.length) {
			this.setState({focusedActionIndex: index});
		}
	}

	/**
	 * Focus the previous action button
	 */
	focusPreviousAction(): void {
		const actions = this.dialogProps.actions;
		if (actions.length === 0) {
			return;
		}

		let index = this.dialogState.focusedActionIndex - 1;

		// Skip disabled actions
		while (index >= 0 && actions[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setState({focusedActionIndex: index});
		}
	}

	/**
	 * Trigger the focused action
	 */
	triggerFocusedAction(): void {
		const actions = this.dialogProps.actions;
		const index = this.dialogState.focusedActionIndex;

		if (index >= 0 && index < actions.length) {
			const action = actions[index];
			if (!action.disabled) {
				action.onClick?.();
			}
		}
	}

	/**
	 * Render the dialog widget
	 */
	render(context: WidgetContext): void {
		if (!this.dialogState.open) {
			return;
		}

		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {title, content, actions, width, height} = this.dialogProps;
		const {focusedActionIndex} = this.dialogState;

		// Render dialog border and background
		this.renderDialogFrame(bounds, title);

		// Render content
		if (content) {
			content.render(context);
		}

		// Render action buttons
		this.renderActions(bounds, actions, focusedActionIndex);
	}

	/**
	 * Render the dialog frame
	 */
	private renderDialogFrame(
		bounds: {x: number; y: number; width: number; height: number},
		title: string,
	): void {
		// Draw border
		const chars = {
			topLeft: '┌',
			topRight: '┐',
			bottomLeft: '└',
			bottomRight: '┘',
			horizontal: '─',
			vertical: '│',
		};

		// Render title if present
		if (title) {
			const titleX = bounds.x + Math.floor((bounds.width - title.length) / 2);
			// Render title
		}

		// Actual rendering would integrate with rendering engine
	}

	/**
	 * Render action buttons
	 */
	private renderActions(
		bounds: {x: number; y: number; width: number; height: number},
		actions: DialogAction[],
		focusedIndex: number,
	): void {
		if (actions.length === 0) {
			return;
		}

		// Calculate button positions
		const buttonY = bounds.y + bounds.height - 2;
		let buttonX = bounds.x + 2;

		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];
			const isFocused = i === focusedIndex;
			const isDisabled = action.disabled || false;

			// Get colors based on state
			const colors = this.getActionColors(
				action.primary || false,
				isFocused,
				isDisabled,
			);

			// Render button
			const buttonWidth = action.label.length + 4;

			buttonX += buttonWidth + 2; // Gap between buttons
		}
	}

	/**
	 * Get colors for an action button
	 */
	private getActionColors(
		primary: boolean,
		focused: boolean,
		disabled: boolean,
	): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		if (primary) {
			if (focused) {
				return {fg: 'white', bg: {rgb: [59, 130, 246]}};
			}
			return {fg: {rgb: [59, 130, 246]}, bg: 'default'};
		}

		if (focused) {
			return {fg: 'white', bg: {rgb: [75, 85, 99]}};
		}

		return {fg: 'default', bg: 'default'};
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		if (!this.dialogState.open) {
			return false;
		}

		switch (event.widgetEventType) {
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
		switch (event.key) {
			case 'escape':
				this.close();
				return true;

			case 'tab':
				if (event.shift) {
					this.focusPreviousAction();
				} else {
					this.focusNextAction();
				}
				return true;

			case 'left':
				this.focusPreviousAction();
				return true;

			case 'right':
				this.focusNextAction();
				return true;

			case 'return':
			case 'space':
				this.triggerFocusedAction();
				return true;

			default:
				return false;
		}
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Dialog is focusable only when open
		return this.dialogState.open && this._props.visible;
	}

	/**
	 * Mount the dialog
	 */
	mount(parent?: Widget | null): void {
		super.mount(parent);

		// Mount content if present
		if (this.dialogProps.content) {
			this.dialogProps.content.mount(this);
		}
	}

	/**
	 * Unmount the dialog
	 */
	unmount(): void {
		// Unmount content
		if (this.dialogProps.content) {
			this.dialogProps.content.unmount();
		}

		super.unmount();
	}
}
