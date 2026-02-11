/**
 * Menu Widget Module
 *
 * Provides the MenuWidget class for context menus and dropdowns.
 * Supports keyboard navigation and submenus.
 *
 * @module widgets/menu
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
 * Menu item types
 */
export type MenuItemType = 'normal' | 'separator' | 'submenu';

/**
 * Menu item definition
 */
export interface MenuItem {
	/** Item ID */
	id: string;

	/** Item label */
	label: string;

	/** Item type */
	type?: MenuItemType;

	/** Keyboard shortcut display */
	shortcut?: string;

	/** Whether the item is disabled */
	disabled?: boolean;

	/** Whether the item is checked (for checkable items) */
	checked?: boolean;

	/** Submenu items (for submenu type) */
	submenu?: MenuItem[];

	/** Click handler */
	onClick?: () => void;

	/** Icon (optional) */
	icon?: string;
}

/**
 * Menu position
 */
export interface MenuPosition {
	/** X coordinate */
	x: number;

	/** Y coordinate */
	y: number;
}

/**
 * Props specific to the Menu widget
 */
export interface MenuWidgetProps extends WidgetProps {
	/** Menu items */
	items: MenuItem[];

	/** Item selection handler */
	onSelect?: (item: MenuItem) => void;

	/** Menu position */
	position?: MenuPosition;

	/** Whether the menu is open */
	open?: boolean;

	/** Parent menu (for submenus) */
	parentMenu?: MenuWidget;
}

/**
 * State specific to the Menu widget
 */
export interface MenuWidgetState extends WidgetState {
	/** Currently selected index */
	selectedIndex: number;

	/** Whether the menu is open */
	open: boolean;

	/** Active submenu */
	activeSubmenu: MenuWidget | null;

	/** Menu level (0 for root) */
	level: number;
}

/**
 * Menu widget for context menus and dropdowns
 *
 * Features:
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Submenu support
 * - Disabled item handling
 * - Checkable items
 * - Keyboard shortcuts display
 */
export class MenuWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'menu';

	/** Default props for menu widgets */
	static defaultProps: Required<MenuWidgetProps> = {
		...BaseWidget.defaultProps,
		items: [],
		onSelect: undefined as unknown as (item: MenuItem) => void,
		position: {x: 0, y: 0},
		open: false,
		parentMenu: undefined as unknown as MenuWidget,
	};

	/**
	 * Create a new menu widget
	 *
	 * @param props - Menu widget props
	 */
	constructor(props: MenuWidgetProps) {
		super(props);
		this._state = {
			...this._state,
			selectedIndex: -1,
			open: props.open ?? false,
			activeSubmenu: null,
			level: props.parentMenu ? props.parentMenu.menuState.level + 1 : 0,
		};
	}

	/**
	 * Get menu-specific props
	 */
	get menuProps(): Required<MenuWidgetProps> {
		return this._props as Required<MenuWidgetProps>;
	}

	/**
	 * Get menu-specific state
	 */
	get menuState(): MenuWidgetState {
		return this._state as MenuWidgetState;
	}

	/**
	 * Get the menu items
	 */
	getItems(): MenuItem[] {
		return this.menuProps.items;
	}

	/**
	 * Set the menu items
	 *
	 * @param items - New items
	 */
	setItems(items: MenuItem[]): void {
		this.update({...this._props, items} as WidgetProps);
		this.setState({selectedIndex: -1});
	}

	/**
	 * Check if the menu is open
	 */
	isOpen(): boolean {
		return this.menuState.open;
	}

	/**
	 * Open the menu
	 *
	 * @param position - Optional position to open at
	 */
	open(position?: MenuPosition): void {
		if (position) {
			this.update({...this._props, position} as WidgetProps);
		}

		if (!this.menuState.open) {
			this.setState({open: true, selectedIndex: -1});
			this.invalidate();
		}
	}

	/**
	 * Close the menu
	 */
	close(): void {
		if (this.menuState.open) {
			// Close any active submenu
			if (this.menuState.activeSubmenu) {
				this.menuState.activeSubmenu.close();
			}

			this.setState({
				open: false,
				selectedIndex: -1,
				activeSubmenu: null,
			});
			this.invalidate();
		}
	}

	/**
	 * Toggle the menu open/closed
	 */
	toggle(): void {
		if (this.menuState.open) {
			this.close();
		} else {
			this.open();
		}
	}

	/**
	 * Get the currently selected item
	 */
	getSelectedItem(): MenuItem | undefined {
		const index = this.menuState.selectedIndex;
		if (index >= 0 && index < this.menuProps.items.length) {
			return this.menuProps.items[index];
		}
		return undefined;
	}

	/**
	 * Select the next item
	 */
	selectNext(): void {
		const items = this.menuProps.items;
		let index = this.menuState.selectedIndex + 1;

		// Skip separators and disabled items
		while (
			index < items.length &&
			(this.isSeparator(items[index]) || items[index].disabled)
		) {
			index++;
		}

		if (index < items.length) {
			this.setState({selectedIndex: index});
			this.invalidate();
		}
	}

	/**
	 * Select the previous item
	 */
	selectPrevious(): void {
		const items = this.menuProps.items;
		let index = this.menuState.selectedIndex - 1;

		// Skip separators and disabled items
		while (
			index >= 0 &&
			(this.isSeparator(items[index]) || items[index].disabled)
		) {
			index--;
		}

		if (index >= 0) {
			this.setState({selectedIndex: index});
			this.invalidate();
		}
	}

	/**
	 * Select the first item
	 */
	selectFirst(): void {
		const items = this.menuProps.items;
		let index = 0;

		// Skip separators and disabled items
		while (
			index < items.length &&
			(this.isSeparator(items[index]) || items[index].disabled)
		) {
			index++;
		}

		if (index < items.length) {
			this.setState({selectedIndex: index});
			this.invalidate();
		}
	}

	/**
	 * Select the last item
	 */
	selectLast(): void {
		const items = this.menuProps.items;
		let index = items.length - 1;

		// Skip separators and disabled items
		while (
			index >= 0 &&
			(this.isSeparator(items[index]) || items[index].disabled)
		) {
			index--;
		}

		if (index >= 0) {
			this.setState({selectedIndex: index});
			this.invalidate();
		}
	}

	/**
	 * Activate the selected item
	 */
	activateSelected(): void {
		const item = this.getSelectedItem();
		if (!item || item.disabled) {
			return;
		}

		if (item.type === 'submenu' && item.submenu) {
			this.openSubmenu(item);
		} else {
			this.selectItem(item);
		}
	}

	/**
	 * Select an item
	 *
	 * @param item - Item to select
	 */
	selectItem(item: MenuItem): void {
		if (item.disabled || this.isSeparator(item)) {
			return;
		}

		item.onClick?.();
		this.menuProps.onSelect?.(item);
		this.close();

		// Close parent menus too
		let parent = this.menuProps.parentMenu;
		while (parent) {
			parent.close();
			parent = parent.menuProps.parentMenu;
		}
	}

	/**
	 * Open a submenu
	 *
	 * @param item - Menu item with submenu
	 */
	openSubmenu(item: MenuItem): void {
		if (!item.submenu || item.submenu.length === 0) {
			return;
		}

		// Close existing submenu
		if (this.menuState.activeSubmenu) {
			this.menuState.activeSubmenu.close();
		}

		// Create and open new submenu
		const submenu = new MenuWidget({
			items: item.submenu,
			parentMenu: this,
			open: false,
		});

		// Position submenu to the right of the current item
		const position = this.calculateSubmenuPosition(item);
		submenu.open(position);

		this.setState({activeSubmenu: submenu});
	}

	/**
	 * Calculate submenu position
	 */
	private calculateSubmenuPosition(item: MenuItem): MenuPosition {
		const position = this.menuProps.position;
		const index = this.menuProps.items.indexOf(item);

		return {
			x: position.x + 20, // Approximate menu width
			y: position.y + index,
		};
	}

	/**
	 * Check if an item is a separator
	 */
	private isSeparator(item: MenuItem): boolean {
		return item.type === 'separator';
	}

	/**
	 * Render the menu widget
	 */
	render(context: WidgetContext): void {
		if (!this.menuState.open) {
			return;
		}

		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {items, position} = this.menuProps;
		const {selectedIndex} = this.menuState;

		// Calculate menu dimensions
		const maxLabelWidth = Math.max(...items.map(item => item.label?.length || 0));
		const menuWidth = maxLabelWidth + 8; // Padding + shortcut space
		const menuHeight = items.length + 2; // Border padding

		// Render menu border
		this.renderMenuBorder(position, menuWidth, menuHeight);

		// Render menu items
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const isSelected = i === selectedIndex;
			const isDisabled = item.disabled || false;

			if (this.isSeparator(item)) {
				this.renderSeparator(position, i, menuWidth);
			} else {
				this.renderMenuItem(position, i, item, isSelected, isDisabled);
			}
		}

		// Render active submenu
		if (this.menuState.activeSubmenu) {
			this.menuState.activeSubmenu.render(context);
		}
	}

	/**
	 * Render menu border
	 */
	private renderMenuBorder(
		position: MenuPosition,
		width: number,
		height: number,
	): void {
		// Actual border rendering would integrate with rendering engine
	}

	/**
	 * Render a menu item
	 */
	private renderMenuItem(
		position: MenuPosition,
		index: number,
		item: MenuItem,
		selected: boolean,
		disabled: boolean,
	): void {
		const colors = this.getItemColors(selected, disabled);

		// Build display text
		let displayText = ' ';

		// Add checkmark if checked
		if (item.checked) {
			displayText += '✓ ';
		} else {
			displayText += '  ';
		}

		// Add label
		displayText += item.label;

		// Add submenu indicator or shortcut
		if (item.type === 'submenu') {
			displayText += ' ▶';
		} else if (item.shortcut) {
			displayText += `  ${item.shortcut}`;
		}

		// Actual rendering would happen here
	}

	/**
	 * Render a separator
	 */
	private renderSeparator(
		position: MenuPosition,
		index: number,
		menuWidth: number,
	): void {
		// Render horizontal line separator
	}

	/**
	 * Get colors for a menu item
	 */
	private getItemColors(selected: boolean, disabled: boolean): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		if (selected) {
			return {fg: 'white', bg: {rgb: [59, 130, 246]}};
		}

		return {fg: 'default', bg: 'default'};
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		if (!this.menuState.open) {
			return false;
		}

		switch (event.widgetEventType) {
			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

			case WidgetEventType.CLICK:
				this.activateSelected();
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle keyboard events
	 */
	private handleKeyDown(event: WidgetKeyEvent): boolean {
		switch (event.key) {
			case 'down':
				this.selectNext();
				return true;

			case 'up':
				this.selectPrevious();
				return true;

			case 'home':
				this.selectFirst();
				return true;

			case 'end':
				this.selectLast();
				return true;

			case 'return':
			case 'space':
				this.activateSelected();
				return true;

			case 'escape':
				this.close();
				return true;

			case 'right':
				// Open submenu if available
				if (this.menuState.activeSubmenu) {
					this.menuState.activeSubmenu.selectFirst();
				} else {
					const item = this.getSelectedItem();
					if (item?.type === 'submenu') {
						this.activateSelected();
					}
				}
				return true;

			case 'left':
				// Close submenu and go to parent
				if (this.menuProps.parentMenu) {
					this.close();
				}
				return true;

			default:
				return false;
		}
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Menu is focusable only when open
		return this.menuState.open && this._props.visible;
	}
}
