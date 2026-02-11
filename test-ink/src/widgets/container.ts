/**
 * Container Widget Module
 *
 * Provides the ContainerWidget class for grouping child widgets.
 * Supports padding, margin, borders, and flex layout properties.
 *
 * @module widgets/container
 */

import {BaseWidget} from './base.js';
import type {
	Widget,
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	ContainerWidget as IContainerWidget,
} from './types.js';
import type {Color} from '../rendering/cell.js';
import type {EdgeInsets} from '../layout/types.js';
import {EdgeInsets as EdgeInsetsFactory} from '../layout/types.js';
import {LayoutNode} from '../layout/node.js';

/**
 * Border style options
 */
export interface ContainerBorder {
	/** Border style */
	style?: 'single' | 'double' | 'rounded' | 'thick';

	/** Border color */
	color?: Color;

	/** Which sides to show border on */
	sides?: {
		top?: boolean;
		right?: boolean;
		bottom?: boolean;
		left?: boolean;
	};
}

/**
 * Props specific to the Container widget
 */
export interface ContainerWidgetProps extends WidgetProps {
	/** Child widgets */
	children?: Widget[];

	/** Padding inside the container */
	padding?: number | EdgeInsets;

	/** Margin outside the container */
	margin?: number | EdgeInsets;

	/** Border configuration */
	border?: ContainerBorder;

	/** Background color */
	backgroundColor?: Color;

	/** Flex direction */
	flexDirection?: 'row' | 'column';

	/** Flex wrap */
	flexWrap?: 'nowrap' | 'wrap';

	/** Justify content */
	justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

	/** Align items */
	alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';

	/** Gap between children */
	gap?: number;

	/** Whether to clip overflowing content */
	clip?: boolean;
}

/**
 * Container widget for grouping children
 *
 * Features:
 * - Child widget management
 * - Padding and margin support
 * - Border rendering
 * - Flex layout properties
 * - Content clipping
 */
export class ContainerWidget
	extends BaseWidget
	implements IContainerWidget
{
	/** Widget type */
	readonly type = 'container';

	/** Default props for container widgets */
	static defaultProps: Required<ContainerWidgetProps> = {
		...BaseWidget.defaultProps,
		children: [],
		padding: 0,
		margin: 0,
		border: undefined as unknown as ContainerBorder,
		backgroundColor: 'default',
		flexDirection: 'column',
		flexWrap: 'nowrap',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		gap: 0,
		clip: false,
	};

	/**
	 * Create a new container widget
	 *
	 * @param props - Container widget props
	 */
	constructor(props: ContainerWidgetProps = {}) {
		super(props);

		// Add initial children
		if (props.children) {
			for (const child of props.children) {
				this.addChild(child);
			}
		}
	}

	/**
	 * Get container-specific props
	 */
	get containerProps(): Required<ContainerWidgetProps> {
		return this._props as Required<ContainerWidgetProps>;
	}

	/**
	 * Create layout node with flex properties
	 */
	protected createLayoutNode(): LayoutNode {
		const {padding, margin, flexDirection, flexWrap, gap} =
			this.containerProps;

		return new LayoutNode({
			id: this.id,
			padding: this.normalizeEdgeInsets(padding),
			margin: this.normalizeEdgeInsets(margin),
			data: {widget: this},
		});
	}

	/**
	 * Normalize edge insets from number or EdgeInsets
	 */
	private normalizeEdgeInsets(value: number | EdgeInsets): EdgeInsets {
		if (typeof value === 'number') {
			return EdgeInsetsFactory.all(value);
		}
		return value;
	}

	/**
	 * Add a child widget
	 *
	 * @param child - Child widget to add
	 */
	addChild(child: Widget): void {
		super.addChild(child);
	}

	/**
	 * Remove a child widget
	 *
	 * @param child - Child widget to remove
	 */
	removeChild(child: Widget): void {
		super.removeChild(child);
	}

	/**
	 * Insert a child at a specific index
	 *
	 * @param index - Index to insert at
	 * @param child - Child widget to insert
	 */
	insertChild(index: number, child: Widget): void {
		super.insertChild(index, child);
	}

	/**
	 * Remove all children
	 */
	clearChildren(): void {
		super.clearChildren();
	}

	/**
	 * Get child at index
	 *
	 * @param index - Child index
	 */
	getChildAt(index: number): Widget | undefined {
		return super.getChildAt(index);
	}

	/**
	 * Find child by predicate
	 *
	 * @param predicate - Function to test each child
	 */
	findChild(predicate: (child: Widget) => boolean): Widget | undefined {
		return super.findChild(predicate);
	}

	/**
	 * Set padding
	 *
	 * @param padding - New padding value
	 */
	setPadding(padding: number | EdgeInsets): void {
		this.update({...this._props, padding} as WidgetProps);

		if (this._layoutNode) {
			this._layoutNode.padding = this.normalizeEdgeInsets(padding);
		}
	}

	/**
	 * Set margin
	 *
	 * @param margin - New margin value
	 */
	setMargin(margin: number | EdgeInsets): void {
		this.update({...this._props, margin} as WidgetProps);

		if (this._layoutNode) {
			this._layoutNode.margin = this.normalizeEdgeInsets(margin);
		}
	}

	/**
	 * Set border
	 *
	 * @param border - New border configuration
	 */
	setBorder(border: ContainerBorder): void {
		this.update({...this._props, border} as WidgetProps);
	}

	/**
	 * Set background color
	 *
	 * @param color - New background color
	 */
	setBackgroundColor(color: Color): void {
		this.update({...this._props, backgroundColor: color} as WidgetProps);
	}

	/**
	 * Render the container widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {border, backgroundColor} = this.containerProps;

		// Render background if specified
		if (backgroundColor !== 'default') {
			this.renderBackground(bounds, backgroundColor);
		}

		// Render border if specified
		if (border) {
			this.renderBorder(bounds, border);
		}

		// Render children
		for (const child of this._children) {
			if (child.state.visible !== false) {
				child.render(context);
			}
		}
	}

	/**
	 * Render background
	 */
	private renderBackground(
		bounds: {x: number; y: number; width: number; height: number},
		color: Color,
	): void {
		// Actual rendering would integrate with rendering engine
	}

	/**
	 * Render border
	 */
	private renderBorder(
		bounds: {x: number; y: number; width: number; height: number},
		border: ContainerBorder,
	): void {
		const {style = 'single', color = 'default', sides} = border;

		// Border characters for different styles
		const borderChars: Record<string, Record<string, string>> = {
			single: {
				topLeft: '┌',
				topRight: '┐',
				bottomLeft: '└',
				bottomRight: '┘',
				horizontal: '─',
				vertical: '│',
			},
			double: {
				topLeft: '╔',
				topRight: '╗',
				bottomLeft: '╚',
				bottomRight: '╝',
				horizontal: '═',
				vertical: '║',
			},
			rounded: {
				topLeft: '╭',
				topRight: '╮',
				bottomLeft: '╰',
				bottomRight: '╯',
				horizontal: '─',
				vertical: '│',
			},
			thick: {
				topLeft: '┏',
				topRight: '┓',
				bottomLeft: '┗',
				bottomRight: '┛',
				horizontal: '━',
				vertical: '┃',
			},
		};

		const chars = borderChars[style];
		const showTop = sides?.top !== false;
		const showRight = sides?.right !== false;
		const showBottom = sides?.bottom !== false;
		const showLeft = sides?.left !== false;

		// Actual border rendering would happen here
	}

	/**
	 * Handle events - delegate to children
	 */
	protected onEvent(event: WidgetEvent): boolean {
		// Container doesn't handle events directly
		// Events are delegated to children by the event system
		return false;
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Containers are not focusable by default
		return false;
	}
}
