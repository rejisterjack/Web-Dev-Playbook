/**
 * Status Bar Widget Module
 *
 * Provides the StatusBarWidget class for displaying status information.
 * Supports multiple status items and positioning.
 *
 * @module widgets/status-bar
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * Status item alignment
 */
export type StatusItemAlignment = 'left' | 'center' | 'right';

/**
 * Status item definition
 */
export interface StatusItem {
	/** Item ID */
	id: string;

	/** Item text */
	text: string;

	/** Item alignment */
	align?: StatusItemAlignment;

	/** Item color */
	color?: Color;

	/** Background color */
	backgroundColor?: Color;

	/** Whether the item is visible */
	visible?: boolean;

	/** Item width (for fixed-width items) */
	width?: number;

	/** Priority for space allocation (higher = more important) */
	priority?: number;
}

/**
 * Props specific to the StatusBar widget
 */
export interface StatusBarWidgetProps extends WidgetProps {
	/** Status items */
	items: StatusItem[];

	/** Bar position */
	position?: 'top' | 'bottom';

	/** Background color */
	backgroundColor?: Color;

	/** Text color */
	color?: Color;
}

/**
 * State specific to the StatusBar widget
 */
export interface StatusBarWidgetState extends WidgetState {
	/** Current items */
	items: StatusItem[];
}

/**
 * Status bar widget for displaying status information
 *
 * Features:
 * - Multiple status items
 * - Left/center/right alignment
 * - Top/bottom positioning
 * - Custom colors per item
 * - Priority-based space allocation
 */
export class StatusBarWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'status-bar';

	/** Default props for status bar widgets */
	static defaultProps: Required<StatusBarWidgetProps> = {
		...BaseWidget.defaultProps,
		items: [],
		position: 'bottom',
		backgroundColor: {rgb: [31, 41, 55]}, // gray-800
		color: 'default',
	};

	/**
	 * Create a new status bar widget
	 *
	 * @param props - Status bar widget props
	 */
	constructor(props: StatusBarWidgetProps) {
		super(props);
		this._state = {
			...this._state,
			items: [...props.items],
		};
	}

	/**
	 * Get status bar-specific props
	 */
	get statusBarProps(): Required<StatusBarWidgetProps> {
		return this._props as Required<StatusBarWidgetProps>;
	}

	/**
	 * Get status bar-specific state
	 */
	get statusBarState(): StatusBarWidgetState {
		return this._state as StatusBarWidgetState;
	}

	/**
	 * Get all items
	 */
	getItems(): StatusItem[] {
		return [...this.statusBarState.items];
	}

	/**
	 * Set all items
	 *
	 * @param items - New items
	 */
	setItems(items: StatusItem[]): void {
		this.setState({items: [...items]});
		this.update({...this._props, items} as WidgetProps);
	}

	/**
	 * Add an item
	 *
	 * @param item - Item to add
	 */
	addItem(item: StatusItem): void {
		const items = [...this.statusBarState.items, item];
		this.setItems(items);
	}

	/**
	 * Remove an item by ID
	 *
	 * @param id - Item ID to remove
	 */
	removeItem(id: string): void {
		const items = this.statusBarState.items.filter(item => item.id !== id);
		this.setItems(items);
	}

	/**
	 * Update an item
	 *
	 * @param id - Item ID
	 * @param updates - Partial item updates
	 */
	updateItem(id: string, updates: Partial<StatusItem>): void {
		const items = this.statusBarState.items.map(item =>
			item.id === id ? {...item, ...updates} : item,
		);
		this.setItems(items);
	}

	/**
	 * Set item text
	 *
	 * @param id - Item ID
	 * @param text - New text
	 */
	setItemText(id: string, text: string): void {
		this.updateItem(id, {text});
	}

	/**
	 * Get an item by ID
	 *
	 * @param id - Item ID
	 */
	getItem(id: string): StatusItem | undefined {
		return this.statusBarState.items.find(item => item.id === id);
	}

	/**
	 * Show an item
	 *
	 * @param id - Item ID
	 */
	showItem(id: string): void {
		this.updateItem(id, {visible: true});
	}

	/**
	 * Hide an item
	 *
	 * @param id - Item ID
	 */
	hideItem(id: string): void {
		this.updateItem(id, {visible: false});
	}

	/**
	 * Clear all items
	 */
	clear(): void {
		this.setItems([]);
	}

	/**
	 * Render the status bar widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {position, backgroundColor, color} = this.statusBarProps;
		const items = this.statusBarState.items.filter(
			item => item.visible !== false,
		);

		// Sort items by priority (higher first)
		const sortedItems = [...items].sort(
			(a, b) => (b.priority || 0) - (a.priority || 0),
		);

		// Group items by alignment
		const leftItems = sortedItems.filter(item => item.align === 'left' || !item.align);
		const centerItems = sortedItems.filter(item => item.align === 'center');
		const rightItems = sortedItems.filter(item => item.align === 'right');

		// Calculate available space
		const totalWidth = bounds.width;
		let availableWidth = totalWidth;

		// Reserve space for fixed-width items
		const fixedWidthItems = items.filter(item => item.width);
		for (const item of fixedWidthItems) {
			availableWidth -= item.width!;
		}

		// Distribute remaining space among flexible items
		const flexibleItems = items.filter(item => !item.width);
		const spacePerItem =
			flexibleItems.length > 0
				? Math.floor(availableWidth / flexibleItems.length)
				: 0;

		// Render background
		this.renderBackground(bounds, backgroundColor);

		// Render left-aligned items
		let x = bounds.x;
		for (const item of leftItems) {
			const width = item.width || spacePerItem;
			this.renderItem(bounds.y, x, width, item);
			x += width;
		}

		// Render right-aligned items
		x = bounds.x + bounds.width;
		for (let i = rightItems.length - 1; i >= 0; i--) {
			const item = rightItems[i];
			const width = item.width || spacePerItem;
			x -= width;
			this.renderItem(bounds.y, x, width, item);
		}

		// Render center items
		const centerWidth = centerItems.reduce(
			(sum, item) => sum + (item.width || spacePerItem),
			0,
		);
		x = bounds.x + Math.floor((bounds.width - centerWidth) / 2);
		for (const item of centerItems) {
			const width = item.width || spacePerItem;
			this.renderItem(bounds.y, x, width, item);
			x += width;
		}
	}

	/**
	 * Render the status bar background
	 */
	private renderBackground(
		bounds: {x: number; y: number; width: number; height: number},
		color: Color,
	): void {
		// Actual background rendering would integrate with rendering engine
	}

	/**
	 * Render a single status item
	 */
	private renderItem(
		y: number,
		x: number,
		width: number,
		item: StatusItem,
	): void {
		const text = item.text.slice(0, width);
		const padding = Math.max(0, width - text.length);
		const displayText = text + ' '.repeat(padding);

		// Actual item rendering would integrate with rendering engine
		// using item.color and item.backgroundColor
	}

	/**
	 * Handle events (status bar is mostly passive)
	 */
	protected onEvent(event: WidgetEvent): boolean {
		// Status bar doesn't handle most events
		return false;
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Status bars are not focusable by default
		return false;
	}
}
