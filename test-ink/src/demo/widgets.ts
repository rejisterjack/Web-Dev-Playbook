/**
 * Widgets Demo
 *
 * Showcase all widget types including button, input, checkbox, radio,
 * list, tabs, dialog, menu, and more with interactions and theming.
 *
 * @module demo/widgets
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear, drawCheckbox, drawRadioButton } from '../rendering/primitives.js';

/**
 * Widget type for the demo
 */
export type WidgetType =
	| 'button'
	| 'input'
	| 'checkbox'
	| 'radio'
	| 'list'
	| 'tabs'
	| 'dialog'
	| 'menu'
	| 'progress'
	| 'status-bar';

/**
 * Widgets demo state
 */
export interface WidgetsDemoState {
	/** Currently active widget */
	activeWidget: WidgetType;
	/** Button state */
	buttonState: { clicked: boolean; count: number };
	/** Input state */
	inputState: { text: string; cursor: number; focused: boolean };
	/** Checkbox state */
	checkboxState: { checked: boolean; indeterminate: boolean };
	/** Radio state */
	radioState: { selected: number };
	/** List state */
	listState: { items: string[]; selectedIndex: number; focused: boolean };
	/** Tabs state */
	tabsState: { tabs: string[]; selectedIndex: number };
	/** Dialog state */
	dialogState: { visible: boolean; title: string; message: string };
	/** Menu state */
	menuState: { visible: boolean; items: string[]; selectedIndex: number };
	/** Progress state */
	progressState: { value: number; indeterminate: boolean };
	/** Status bar state */
	statusBarState: { items: Array<{ text: string; position: 'left' | 'center' | 'right' }> };
}

/**
 * Widgets demo configuration
 */
export interface WidgetsDemoConfig {
	/** Enable animations */
	animationsEnabled?: boolean;
}

/**
 * Widgets demo component
 */
export class WidgetsDemo {
	private state: WidgetsDemoState;
	private config: Required<WidgetsDemoConfig>;

	constructor(config: WidgetsDemoConfig = {}) {
		this.config = {
			animationsEnabled: config.animationsEnabled ?? true,
		};

		this.state = {
			activeWidget: 'button',
			buttonState: { clicked: false, count: 0 },
			inputState: { text: 'Type here...', cursor: 0, focused: false },
			checkboxState: { checked: false, indeterminate: false },
			radioState: { selected: 0 },
			listState: {
				items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
				selectedIndex: 0,
				focused: false,
			},
			tabsState: { tabs: ['Tab 1', 'Tab 2', 'Tab 3'], selectedIndex: 0 },
			dialogState: { visible: false, title: 'Dialog', message: 'This is a sample dialog message.' },
			menuState: { visible: false, items: ['Option 1', 'Option 2', 'Option 3'], selectedIndex: 0 },
			progressState: { value: 65, indeterminate: false },
			statusBarState: {
				items: [
					{ text: 'Ready', position: 'left' },
					{ text: 'v1.0.0', position: 'center' },
					{ text: 'Help: F1', position: 'right' },
				],
			},
		};
	}

	/**
	 * Render the widgets demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw widget navigation
		this.renderNavigation(ctx, width);

		// Draw active widget
		this.renderActiveWidget(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Widgets Demo - Component Showcase', 2, 1);
	}

	/**
	 * Render widget navigation
	 */
	private renderNavigation(ctx: RenderContext, width: number): void {
		const widgets: { key: string; type: WidgetType }[] = [
			{ key: '1', type: 'button' },
			{ key: '2', type: 'input' },
			{ key: '3', type: 'checkbox' },
			{ key: '4', type: 'radio' },
			{ key: '5', type: 'list' },
			{ key: '6', type: 'tabs' },
			{ key: '7', type: 'dialog' },
			{ key: '8', type: 'menu' },
			{ key: '9', type: 'progress' },
			{ key: '0', type: 'status-bar' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Widgets: ', 2, navY + 1);

		let xPos = 11;
		for (const widget of widgets) {
			const isActive = widget.type === this.state.activeWidget;
			const label = `${widget.key}:${widget.type}`;
			if (isActive) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${label}]`, xPos, navY + 1);
				ctx.restore();
			} else {
				drawText(ctx, ` ${label} `, xPos, navY + 1);
			}
			xPos += label.length + 2;
		}
	}

	/**
	 * Render active widget
	 */
	private renderActiveWidget(ctx: RenderContext, width: number, height: number): void {
		const widgetY = 7;
		const widgetHeight = height - 10;
		const widgetWidth = width - 4;

		switch (this.state.activeWidget) {
			case 'button':
				this.renderButtonWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'input':
				this.renderInputWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'checkbox':
				this.renderCheckboxWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'radio':
				this.renderRadioWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'list':
				this.renderListWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'tabs':
				this.renderTabsWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'dialog':
				this.renderDialogWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'menu':
				this.renderMenuWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'progress':
				this.renderProgressWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
			case 'status-bar':
				this.renderStatusBarWidget(ctx, 2, widgetY, widgetWidth, widgetHeight);
				break;
		}
	}

	/**
	 * Render button widget
	 */
	private renderButtonWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Button Widget', x + 2, y + 1);

		const buttonY = y + 4;
		const buttonWidth = 20;
		const buttonX = x + Math.floor((width - buttonWidth) / 2);

		// Draw button
		drawBox(ctx, { x: buttonX, y: buttonY, width: buttonWidth, height: 3 });
		drawText(ctx, 'Click Me', buttonX + 5, buttonY + 1);

		// Draw click count
		drawText(ctx, `Clicks: ${this.state.buttonState.count}`, x + 2, buttonY + 5);
		drawText(ctx, 'Press Enter to click button', x + 2, buttonY + 7);
	}

	/**
	 * Render input widget
	 */
	private renderInputWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Input Widget', x + 2, y + 1);

		const inputY = y + 4;
		const inputWidth = width - 8;
		const inputX = x + 4;

		// Draw input field
		drawBox(ctx, { x: inputX, y: inputY, width: inputWidth, height: 3 });

		// Draw text
		const displayText = this.state.inputState.text.substring(0, inputWidth - 2);
		drawText(ctx, displayText, inputX + 1, inputY + 1);

		// Draw cursor
		if (this.state.inputState.focused) {
			const cursorX = inputX + 1 + this.state.inputState.cursor;
			if (cursorX < inputX + inputWidth - 1) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.drawChar('█', cursorX, inputY + 1);
				ctx.restore();
			}
		}

		// Draw instructions
		drawText(ctx, 'Type to enter text | Tab to focus', x + 2, inputY + 5);
	}

	/**
	 * Render checkbox widget
	 */
	private renderCheckboxWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Checkbox Widget', x + 2, y + 1);

		const checkboxY = y + 4;

		// Draw checkboxes
		drawCheckbox(ctx, x + 4, checkboxY, this.state.checkboxState.checked);
		drawText(ctx, 'Checked option', x + 7, checkboxY);

		drawCheckbox(ctx, x + 4, checkboxY + 2, false);
		drawText(ctx, 'Unchecked option', x + 7, checkboxY + 2);

		drawCheckbox(ctx, x + 4, checkboxY + 4, this.state.checkboxState.indeterminate);
		drawText(ctx, 'Indeterminate option', x + 7, checkboxY + 4);

		// Draw instructions
		drawText(ctx, 'Press Space to toggle checkboxes', x + 2, checkboxY + 7);
	}

	/**
	 * Render radio widget
	 */
	private renderRadioWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Radio Button Widget', x + 2, y + 1);

		const radioY = y + 4;

		// Draw radio buttons
		for (let i = 0; i < 3; i++) {
			const selected = this.state.radioState.selected === i;
			drawRadioButton(ctx, x + 4, radioY + i * 2, selected);
			drawText(ctx, `Option ${i + 1}`, x + 7, radioY + i * 2);
		}

		// Draw instructions
		drawText(ctx, 'Press Space to cycle options', x + 2, radioY + 7);
	}

	/**
	 * Render list widget
	 */
	private renderListWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'List Widget', x + 2, y + 1);

		const listY = y + 3;
		const listHeight = height - 5;

		// Draw list items
		this.state.listState.items.forEach((item, i) => {
			const itemY = listY + i * 2;
			if (itemY >= listY + listHeight) return;

			if (i === this.state.listState.selectedIndex) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `► ${item}`, x + 4, itemY);
				ctx.restore();
			} else {
				drawText(ctx, `  ${item}`, x + 4, itemY);
			}
		});

		// Draw instructions
		drawText(ctx, 'Arrow keys to navigate | Enter to select', x + 2, listY + listHeight - 2);
	}

	/**
	 * Render tabs widget
	 */
	private renderTabsWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Tabs Widget', x + 2, y + 1);

		const tabsY = y + 3;
		const tabWidth = Math.floor((width - 4) / this.state.tabsState.tabs.length);

		// Draw tabs
		this.state.tabsState.tabs.forEach((tab, i) => {
			const tabX = x + 2 + i * tabWidth;
			const selected = i === this.state.tabsState.selectedIndex;

			if (selected) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${tab}]`, tabX, tabsY);
				ctx.restore();
			} else {
				drawText(ctx, ` ${tab} `, tabX, tabsY);
			}
		});

		// Draw tab content
		const contentY = tabsY + 2;
		drawSeparator(ctx, x + 2, contentY, width - 4);
		drawText(ctx, `Content for ${this.state.tabsState.tabs[this.state.tabsState.selectedIndex]}`, x + 4, contentY + 2);

		// Draw instructions
		drawText(ctx, 'Arrow keys to switch tabs', x + 2, contentY + 4);
	}

	/**
	 * Render dialog widget
	 */
	private renderDialogWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Dialog Widget', x + 2, y + 1);

		// Draw trigger button
		const buttonY = y + 4;
		const buttonWidth = 20;
		const buttonX = x + Math.floor((width - buttonWidth) / 2);

		drawBox(ctx, { x: buttonX, y: buttonY, width: buttonWidth, height: 3 });
		drawText(ctx, 'Show Dialog', buttonX + 3, buttonY + 1);

		// Draw dialog
		if (this.state.dialogState.visible) {
			const dialogWidth = 40;
			const dialogHeight = 8;
			const dialogX = x + Math.floor((width - dialogWidth) / 2);
			const dialogY = y + 8;

			drawBox(ctx, { x: dialogX, y: dialogY, width: dialogWidth, height: dialogHeight });
			drawText(ctx, this.state.dialogState.title, dialogX + 2, dialogY + 1);
			drawSeparator(ctx, dialogX + 1, dialogY + 2, dialogWidth - 2);
			drawText(ctx, this.state.dialogState.message, dialogX + 2, dialogY + 4);

			// Draw dialog buttons
			drawBox(ctx, { x: dialogX + 8, y: dialogY + 6, width: 10, height: 2 });
			drawText(ctx, 'OK', dialogX + 10, dialogY + 7);

			drawBox(ctx, { x: dialogX + 22, y: dialogY + 6, width: 10, height: 2 });
			drawText(ctx, 'Cancel', dialogX + 23, dialogY + 7);
		}

		// Draw instructions
		drawText(ctx, 'Press Enter to show/hide dialog', x + 2, buttonY + 5);
	}

	/**
	 * Render menu widget
	 */
	private renderMenuWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Menu Widget', x + 2, y + 1);

		// Draw menu trigger
		const menuY = y + 4;
		const menuWidth = 15;
		const menuX = x + 4;

		drawBox(ctx, { x: menuX, y: menuY, width: menuWidth, height: 2 });
		drawText(ctx, 'Options ▼', menuX + 2, menuY + 1);

		// Draw dropdown menu
		if (this.state.menuState.visible) {
			const dropdownY = menuY + 2;
			const dropdownWidth = menuWidth;

			this.state.menuState.items.forEach((item, i) => {
				const itemY = dropdownY + i * 2;
				const selected = i === this.state.menuState.selectedIndex;

				if (selected) {
					ctx.save();
					ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
					ctx.setStyles({ bold: true });
					drawText(ctx, `► ${item}`, menuX, itemY);
					ctx.restore();
				} else {
					drawText(ctx, `  ${item}`, menuX, itemY);
				}
			});
		}

		// Draw instructions
		drawText(ctx, 'Press Enter to toggle menu', x + 2, menuY + 8);
	}

	/**
	 * Render progress widget
	 */
	private renderProgressWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Progress Widget', x + 2, y + 1);

		const progressY = y + 4;

		// Draw determinate progress bar
		drawText(ctx, 'Determinate:', x + 4, progressY);
		const barWidth = width - 18;
		const filledWidth = Math.floor(barWidth * (this.state.progressState.value / 100));

		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
		for (let i = 0; i < filledWidth; i++) {
			ctx.drawChar('█', x + 16 + i, progressY);
		}
		ctx.restore();

		ctx.save();
		ctx.setFg({ rgb: [150, 150, 150] as [number, number, number] });
		for (let i = filledWidth; i < barWidth; i++) {
			ctx.drawChar('░', x + 16 + i, progressY);
		}
		ctx.restore();

		drawText(ctx, `${this.state.progressState.value}%`, x + width - 6, progressY);

		// Draw indeterminate progress
		drawText(ctx, 'Indeterminate:', x + 4, progressY + 2);
		const indeterminateChars = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
		const indeterminateChar = indeterminateChars[Math.floor(Date.now() / 100) % indeterminateChars.length];

		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
		for (let i = 0; i < barWidth; i++) {
			ctx.drawChar(indeterminateChar, x + 16 + i, progressY + 2);
		}
		ctx.restore();

		// Draw instructions
		drawText(ctx, 'Press Space to toggle indeterminate', x + 2, progressY + 4);
	}

	/**
	 * Render status bar widget
	 */
	private renderStatusBarWidget(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Status Bar Widget', x + 2, y + 1);

		const statusY = y + 3;
		const statusHeight = height - 5;

		// Draw status bar
		drawBox(ctx, { x: x + 2, y: statusY, width: width - 4, height: 3 });

		// Draw status items
		this.state.statusBarState.items.forEach((item) => {
			let xPos: number;
			switch (item.position) {
				case 'left':
					xPos = x + 4;
					break;
				case 'center':
					xPos = x + Math.floor(width / 2) - Math.floor(item.text.length / 2);
					break;
				case 'right':
					xPos = x + width - item.text.length - 6;
					break;
			}
			drawText(ctx, item.text, xPos, statusY + 1);
		});

		// Draw instructions
		drawText(ctx, 'Status bar shows application state', x + 2, statusY + 5);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 0-9 to switch widgets | q to quit', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				return; // Handled by parent

			case '0':
				this.state.activeWidget = 'button';
				break;
			case '1':
				this.state.activeWidget = 'input';
				break;
			case '2':
				this.state.activeWidget = 'checkbox';
				break;
			case '3':
				this.state.activeWidget = 'radio';
				break;
			case '4':
				this.state.activeWidget = 'list';
				break;
			case '5':
				this.state.activeWidget = 'tabs';
				break;
			case '6':
				this.state.activeWidget = 'dialog';
				break;
			case '7':
				this.state.activeWidget = 'menu';
				break;
			case '8':
				this.state.activeWidget = 'progress';
				break;
			case '9':
				this.state.activeWidget = 'status-bar';
				break;
		}

		// Handle widget-specific input
		switch (this.state.activeWidget) {
			case 'input':
				if (key === 'tab') {
					this.state.inputState.focused = !this.state.inputState.focused;
				} else if (this.state.inputState.focused && key.length === 1) {
					this.state.inputState.text += key;
					this.state.inputState.cursor++;
				}
				break;
			case 'checkbox':
				if (key === ' ') {
					this.state.checkboxState.checked = !this.state.checkboxState.checked;
				}
				break;
			case 'radio':
				if (key === ' ') {
					this.state.radioState.selected = (this.state.radioState.selected + 1) % 3;
				}
				break;
			case 'list':
				if (key === 'up') {
					this.state.listState.selectedIndex = Math.max(0, this.state.listState.selectedIndex - 1);
				} else if (key === 'down') {
					this.state.listState.selectedIndex = Math.min(
						this.state.listState.items.length - 1,
						this.state.listState.selectedIndex + 1,
					);
				}
				break;
			case 'tabs':
				if (key === 'left') {
					this.state.tabsState.selectedIndex = Math.max(0, this.state.tabsState.selectedIndex - 1);
				} else if (key === 'right') {
					this.state.tabsState.selectedIndex = Math.min(
						this.state.tabsState.tabs.length - 1,
						this.state.tabsState.selectedIndex + 1,
					);
				}
				break;
			case 'dialog':
				if (key === 'enter') {
					this.state.dialogState.visible = !this.state.dialogState.visible;
				}
				break;
			case 'menu':
				if (key === 'enter') {
					this.state.menuState.visible = !this.state.menuState.visible;
				} else if (this.state.menuState.visible && key === 'down') {
					this.state.menuState.selectedIndex =
						(this.state.menuState.selectedIndex + 1) % this.state.menuState.items.length;
				}
				break;
			case 'progress':
				if (key === ' ') {
					this.state.progressState.indeterminate = !this.state.progressState.indeterminate;
				}
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): WidgetsDemoState {
		return { ...this.state };
	}
}

/**
 * Create a widgets demo instance
 */
export function createWidgetsDemo(config?: WidgetsDemoConfig): WidgetsDemo {
	return new WidgetsDemo(config);
}
