/**
 * List Widget Module
 *
 * Provides the ListWidget class for displaying and selecting items.
 * Supports keyboard navigation, multi-selection, and scrolling.
 *
 * @module widgets/list
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetKeyEvent,
	ScrollableWidget,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * List item interface
 */
export interface ListItem {
	/** Item ID (optional, defaults to index) */
	id?: string;

	/** Item label/text */
	label: string;

	/** Whether the item is disabled */
	disabled?: boolean;

	/** Custom data */
	data?: unknown;
}

/**
 * Props specific to the List widget
 */
export interface ListWidgetProps extends WidgetProps {
	/** List items */
	items: ListItem[];

	/** Currently selected index */
	selectedIndex?: number;

	/** Selection change handler */
	onSelect?: (index: number, item: ListItem) => void;

	/** Whether to allow multi-selection */
	multiSelect?: boolean;

	/** Maximum visible items (for scrolling) */
	maxVisibleItems?: number;
}

/**
 * State specific to the List widget
 */
export interface ListWidgetState extends WidgetState {
	/** Currently selected index */
	selectedIndex: number;

	/** Selected indices for multi-select */
	selectedIndices: Set<number>;

	/** Scroll offset */
	scrollOffset: number;

	/** Whether the list is focused */
	focused: boolean;
}

/**
 * List widget for item display and selection
 *
 * Features:
 * - Single and multi-selection modes
 * - Keyboard navigation (arrows, Page Up/Down, Home/End)
 * - Scrollable content
 * - Disabled item support
 */
export class ListWidget
	extends BaseWidget
	implements ScrollableWidget
{
	/** Widget type */
	readonly type = 'list';

	/** Default props for list widgets */
	static defaultProps: Required<ListWidgetProps> = {
		...BaseWidget.defaultProps,
		items: [],
		selectedIndex: -1,
		onSelect: undefined as unknown as (index: number, item: ListItem) => void,
		multiSelect: false,
		maxVisibleItems: Infinity,
	};

	/** Current scroll position */
	scrollPosition = {x: 0, y: 0};

	/** Maximum scroll position */
	maxScroll = {x: 0, y: 0};

	/**
	 * Create a new list widget
	 *
	 * @param props - List widget props
	 */
	constructor(props: ListWidgetProps) {
		super(props);
		this._state = {
			...this._state,
			selectedIndex: props.selectedIndex ?? -1,
			selectedIndices: new Set(),
			scrollOffset: 0,
			focused: false,
		};
	}

	/**
	 * Get list-specific props
	 */
	get listProps(): Required<ListWidgetProps> {
		return this._props as Required<ListWidgetProps>;
	}

	/**
	 * Get list-specific state
	 */
	get listState(): ListWidgetState {
		return this._state as ListWidgetState;
	}

	/**
	 * Get the items
	 */
	getItems(): ListItem[] {
		return this.listProps.items;
	}

	/**
	 * Set the items
	 *
	 * @param items - New items
	 */
	setItems(items: ListItem[]): void {
		this.update({...this._props, items} as WidgetProps);
		// Reset selection if out of bounds
		if (this.listState.selectedIndex >= items.length) {
			this.setSelectedIndex(-1);
		}
	}

	/**
	 * Get the currently selected index
	 */
	getSelectedIndex(): number {
		return this.listState.selectedIndex;
	}

	/**
	 * Get the currently selected item
	 */
	getSelectedItem(): ListItem | undefined {
		const index = this.listState.selectedIndex;
		if (index >= 0 && index < this.listProps.items.length) {
			return this.listProps.items[index];
		}
		return undefined;
	}

	/**
	 * Set the selected index
	 *
	 * @param index - New selected index
	 * @param triggerChange - Whether to trigger onSelect callback
	 */
	setSelectedIndex(index: number, triggerChange = true): void {
		const items = this.listProps.items;

		if (index < -1 || index >= items.length) {
			return;
		}

		// Check if item is disabled
		if (index >= 0 && items[index].disabled) {
			return;
		}

		const previousIndex = this.listState.selectedIndex;

		if (this.listProps.multiSelect) {
			// Toggle selection in multi-select mode
			const selectedIndices = new Set(this.listState.selectedIndices);
			if (selectedIndices.has(index)) {
				selectedIndices.delete(index);
			} else {
				selectedIndices.add(index);
			}
			this.setState({selectedIndices});
		} else {
			this.setState({selectedIndex: index});
		}

		// Ensure selected item is visible
		this.scrollToIndex(index);

		// Trigger change handler
		if (triggerChange && previousIndex !== index && index >= 0) {
			this.listProps.onSelect?.(index, items[index]);
		}

		this.invalidate();
	}

	/**
	 * Check if an index is selected (for multi-select)
	 *
	 * @param index - Index to check
	 */
	isSelected(index: number): boolean {
		if (this.listProps.multiSelect) {
			return this.listState.selectedIndices.has(index);
		}
		return this.listState.selectedIndex === index;
	}

	/**
	 * Select the next item
	 */
	selectNext(): void {
		const items = this.listProps.items;
		let index = this.listState.selectedIndex + 1;

		// Skip disabled items
		while (index < items.length && items[index]?.disabled) {
			index++;
		}

		if (index < items.length) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the previous item
	 */
	selectPrevious(): void {
		const items = this.listProps.items;
		let index = this.listState.selectedIndex - 1;

		// Skip disabled items
		while (index >= 0 && items[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the first item
	 */
	selectFirst(): void {
		const items = this.listProps.items;
		let index = 0;

		// Skip disabled items
		while (index < items.length && items[index]?.disabled) {
			index++;
		}

		if (index < items.length) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select the last item
	 */
	selectLast(): void {
		const items = this.listProps.items;
		let index = items.length - 1;

		// Skip disabled items
		while (index >= 0 && items[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select next page of items
	 */
	selectNextPage(): void {
		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const pageSize = bounds.height;
		const items = this.listProps.items;
		let index = Math.min(
			this.listState.selectedIndex + pageSize,
			items.length - 1,
		);

		// Skip disabled items
		while (index < items.length && items[index]?.disabled) {
			index++;
		}

		if (index < items.length) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Select previous page of items
	 */
	selectPreviousPage(): void {
		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const items = this.listProps.items;
		const pageSize = bounds.height;
		let index = Math.max(this.listState.selectedIndex - pageSize, 0);

		// Skip disabled items
		while (index >= 0 && items[index]?.disabled) {
			index--;
		}

		if (index >= 0) {
			this.setSelectedIndex(index);
		}
	}

	/**
	 * Scroll to make an item visible
	 *
	 * @param index - Item index to scroll to
	 */
	scrollToIndex(index: number): void {
		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {scrollOffset} = this.listState;
		const visibleHeight = bounds.height;

		if (index < scrollOffset) {
			// Item is above visible area
			this.setState({scrollOffset: index});
		} else if (index >= scrollOffset + visibleHeight) {
			// Item is below visible area
			this.setState({scrollOffset: index - visibleHeight + 1});
		}
	}

	/**
	 * ScrollableWidget implementation
	 */
	scrollTo(x: number, y: number): void {
		this.scrollPosition = {x, y};
		this.setState({scrollOffset: y});
	}

	/**
	 * ScrollableWidget implementation
	 */
	scrollBy(dx: number, dy: number): void {
		this.scrollTo(this.scrollPosition.x + dx, this.scrollPosition.y + dy);
	}

	/**
	 * ScrollableWidget implementation
	 */
	scrollToTop(): void {
		this.scrollTo(0, 0);
	}

	/**
	 * ScrollableWidget implementation
	 */
	scrollToBottom(): void {
		const items = this.listProps.items;
		const bounds = this.getBounds();
		if (bounds) {
			const offset = Math.max(0, items.length - bounds.height);
			this.scrollTo(0, offset);
		}
	}

	/**
	 * Render the list widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {items} = this.listProps;
		const {selectedIndex, scrollOffset, focused} = this.listState;
		const visibleHeight = bounds.height;

		// Render visible items
		for (let i = 0; i < visibleHeight; i++) {
			const itemIndex = scrollOffset + i;
			if (itemIndex >= items.length) {
				break;
			}

			const item = items[itemIndex];
			const isSelected = this.isSelected(itemIndex);
			const isCurrent = itemIndex === selectedIndex;
			const isDisabled = item.disabled || false;

			// Get colors based on state
			const colors = this.getItemColors(
				isSelected,
				isCurrent,
				!!focused,
				isDisabled,
			);

			// Render item (actual rendering would integrate with rendering engine)
			const prefix = isSelected ? '▸ ' : '  ';
			const displayText = prefix + item.label;
		}
	}

	/**
	 * Get colors for an item based on its state
	 */
	private getItemColors(
		selected: boolean,
		current: boolean,
		focused: boolean,
		disabled: boolean,
	): {fg: Color; bg: Color} {
		if (disabled) {
			return {fg: 'gray', bg: 'default'};
		}

		if (selected && current && focused) {
			return {fg: 'white', bg: {rgb: [59, 130, 246]}};
		}

		if (current && focused) {
			return {fg: 'default', bg: {rgb: [55, 65, 81]}};
		}

		if (selected) {
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

			case 'pageup':
				this.selectPreviousPage();
				return true;

			case 'pagedown':
				this.selectNextPage();
				return true;

			case 'return':
			case 'space':
				if (this.listState.selectedIndex >= 0) {
					const item = this.listProps.items[this.listState.selectedIndex];
					if (!item.disabled) {
						this.listProps.onSelect?.(this.listState.selectedIndex, item);
					}
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
		return this._props.visible && !this._state.disabled;
	}
}
