/**
 * Tabs Widget Module
 *
 * Provides the TabsWidget class for tabbed interfaces.
 * Supports keyboard navigation and tab selection.
 *
 * @module widgets/tabs
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
 * Tab definition
 */
export interface Tab {
	/** Tab ID */
	id: string;

	/** Tab label */
	label: string;

	/** Tab content widget */
	content?: Widget;

	/** Whether the tab is disabled */
	disabled?: boolean;

	/** Tab icon (optional) */
	icon?: string;
}

/**
 * Props specific to the Tabs widget
 */
export interface TabsWidgetProps extends WidgetProps {
	/** Tab definitions */
	tabs: Tab[];

	/** Currently selected tab index */
	selectedIndex?: number;

	/** Tab selection handler */
	onSelect?: (index: number, tab: Tab) => void;

	/** Tab position */
	position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * State specific to the Tabs widget
 */
export interface TabsWidgetState extends WidgetState {
	/** Currently selected tab index */
	selectedIndex: number;

	/** Whether tabs are focused */
	focused: boolean;
}

/**
 * Tabs widget for tabbed interfaces
 *
 * Features:
 * - Horizontal and vertical tab layouts
 * - Keyboard navigation (arrows, Tab)
 * - Disabled tab support
 * - Tab content switching
 */
export class TabsWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'tabs';

	/** Default props for tabs widgets */
	static defaultProps: Required<TabsWidgetProps> = {
		...BaseWidget.defaultProps,
		tabs: [],
		selectedIndex: 0,
		onSelect: undefined as unknown as (index: number, tab: Tab) => void,
		position: 'top',
	};

	/**
	 * Create a new tabs widget
	 *
	 * @param props - Tabs widget props
	 */
	constructor(props: TabsWidgetProps) {
		super(props);
		this._state = {
			...this._state,
			selectedIndex: props.selectedIndex ?? 0,
			focused: false,
		};
	}

	/**
	 * Get tabs-specific props
	 */
	get tabsProps(): Required<TabsWidgetProps> {
		return this._props as Required<TabsWidgetProps>;
	}

	/**
	 * Get tabs-specific state
	 */
	get tabsState(): TabsWidgetState {
		return this._state as TabsWidgetState;
	}

	/**
	 * Get the tabs
	 */
	getTabs(): Tab[] {
		return this.tabsProps.tabs;
	}

	/**
	 * Set the tabs
	 *
	 * @param tabs - New tabs
	 */
	setTabs(tabs: Tab[]): void {
		this.update({...this._props, tabs} as WidgetProps);

		// Validate selected index
		if (this.tabsState.selectedIndex >= tabs.length) {
			this.setSelectedIndex(Math.max(0, tabs.length - 1));
		}
	}

	/**
	 * Get the currently selected index
	 */
	getSelectedIndex(): number {
		return this.tabsState.selectedIndex;
	}

	/**
	 * Get the currently selected tab
	 */
	getSelectedTab(): Tab | undefined {
		const index = this.tabsState.selectedIndex;
		if (index >= 0 && index < this.tabsProps.tabs.length) {
			return this.tabsProps.tabs[index];
		}
		return undefined;
	}

	/**
	 * Select a tab by index
	 *
	 * @param index - Tab index to select
	 * @param triggerChange - Whether to trigger onSelect callback
	 */
	setSelectedIndex(index: number, triggerChange = true): void {
		const tabs = this.tabsProps.tabs;

		if (index < 0 || index >= tabs.length) {
			return;
		}

		// Check if tab is disabled
		if (tabs[index].disabled) {
			return;
		}

		const previousIndex = this.tabsState.selectedIndex;

		if (previousIndex !== index) {
			this.setState({selectedIndex: index});

			if (triggerChange) {
				this.tabsProps.onSelect?.(index, tabs[index]);
			}

			this.invalidate();
		}
	}

	/**
	 * Select the next tab
	 */
	selectNext(): void {
		const tabs = this.tabsProps.tabs;
		let index = this.tabsState.selectedIndex + 1;

		// Skip disabled tabs
		while (index < tabs.length && tabs[index]?.disabled) {
			index++;
		}

		if (index < tabs.length) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the previous tab
	 */
	selectPrevious(): void {
		const tabs = this.tabsProps.tabs;
		let index = this.tabsState.selectedIndex - 1;

		// Skip disabled tabs
		while (index >= 0 && tabs[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the first tab
	 */
	selectFirst(): void {
		const tabs = this.tabsProps.tabs;
		let index = 0;

		// Skip disabled tabs
		while (index < tabs.length && tabs[index]?.disabled) {
			index++;
		}

		if (index < tabs.length) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the last tab
	 */
	selectLast(): void {
		const tabs = this.tabsProps.tabs;
		let index = tabs.length - 1;

		// Skip disabled tabs
		while (index >= 0 && tabs[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Render the tabs widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {tabs, position} = this.tabsProps;
		const {selectedIndex, focused} = this.tabsState;

		// Render tab headers
		this.renderTabHeaders(bounds, tabs, selectedIndex, !!focused, position);

		// Render selected tab content
		const selectedTab = tabs[selectedIndex];
		if (selectedTab?.content) {
			selectedTab.content.render(context);
		}
	}

	/**
	 * Render tab headers
	 */
	private renderTabHeaders(
		bounds: {x: number; y: number; width: number; height: number},
		tabs: Tab[],
		selectedIndex: number,
		focused: boolean,
		position: string,
	): void {
		let x = bounds.x;
		let y = bounds.y;

		const isHorizontal = position === 'top' || position === 'bottom';

		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const isSelected = i === selectedIndex;
			const isDisabled = tab.disabled || false;

			// Get colors based on state
			const colors = this.getTabColors(isSelected, focused, isDisabled);

			// Calculate tab width
			const tabWidth = tab.label.length + 4; // Padding

			// Render tab label
			const displayText = ` ${tab.label} `;

			// Update position for next tab
			if (isHorizontal) {
				x += tabWidth + 1; // Gap between tabs
			} else {
				y += 1;
			}
		}
	}

	/**
	 * Get colors for a tab based on its state
	 */
	private getTabColors(
		selected: boolean,
		focused: boolean,
		disabled: boolean,
	): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		if (selected && focused) {
			return {fg: 'white', bg: {rgb: [59, 130, 246]}};
		}

		if (selected) {
			return {fg: 'default', bg: {rgb: [55, 65, 81]}};
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
			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

			case WidgetEventType.CLICK:
				// Handle tab clicking
				return false;

			case WidgetEventType.FOCUS_GAINED:
				this.setState({focused: true});
				this.invalidate();
				return true;

			case WidgetEventType.FOCUS_LOST:
				this.setState({focused: false});
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

		const {position} = this.tabsProps;
		const isHorizontal = position === 'top' || position === 'bottom';

		switch (event.key) {
			case 'right':
				if (isHorizontal) {
					this.selectNext();
					return true;
				}
				return false;

			case 'left':
				if (isHorizontal) {
					this.selectPrevious();
					return true;
				}
				return false;

			case 'down':
				if (!isHorizontal) {
					this.selectNext();
					return true;
				}
				return false;

			case 'up':
				if (!isHorizontal) {
					this.selectPrevious();
					return true;
				}
				return false;

			case 'home':
				this.selectFirst();
				return true;

			case 'end':
				this.selectLast();
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
		this.setState({focused: true});
		this.invalidate();
	}

	/**
	 * Called when widget loses focus
	 */
	onBlur(): void {
		super.onBlur();
		this.setState({focused: false});
		this.invalidate();
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}
}
