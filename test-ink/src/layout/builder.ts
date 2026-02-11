/**
 * Layout Builder Module
 *
 * Defines the LayoutBuilder class for a fluent API to create layout nodes.
 * Provides a builder pattern with method chaining for intuitive layout construction.
 */

import {LayoutNode, type LayoutNodeOptions} from './node';
import {FlexContainer, type FlexContainerOptions} from './flex-container';
import {
	FlexDirection,
	FlexWrap,
	JustifyContent,
	AlignItems,
	AlignContent,
} from './flex-direction';
import type {EdgeInsets, Dimension} from './types';
import {EdgeInsets as EdgeInsetsFactory} from './types';

/**
 * Builder for creating LayoutNode instances with a fluent API
 */
export class LayoutBuilder {
	/** Current node being built */
	private currentNode: LayoutNode;

	/** Stack of parent nodes for nested building */
	private parentStack: LayoutNode[] = [];

	/**
	 * Creates a new LayoutBuilder
	 * @param node - Optional initial node (creates a basic LayoutNode if not provided)
	 */
	constructor(node?: LayoutNode) {
		this.currentNode = node ?? new LayoutNode();
	}

	/**
	 * Creates a builder for a flex container
	 * @param options - Flex container options
	 * @returns A new LayoutBuilder
	 */
	static flex(options: FlexContainerOptions = {}): LayoutBuilder {
		return new LayoutBuilder(new FlexContainer(options));
	}

	/**
	 * Creates a builder for a row flex container
	 * @param options - Flex container options (direction is preset to row)
	 * @returns A new LayoutBuilder
	 */
	static row(
		options: Omit<FlexContainerOptions, 'direction'> = {},
	): LayoutBuilder {
		return new LayoutBuilder(
			new FlexContainer({...options, direction: FlexDirection.Row}),
		);
	}

	/**
	 * Creates a builder for a column flex container
	 * @param options - Flex container options (direction is preset to column)
	 * @returns A new LayoutBuilder
	 */
	static column(
		options: Omit<FlexContainerOptions, 'direction'> = {},
	): LayoutBuilder {
		return new LayoutBuilder(
			new FlexContainer({...options, direction: FlexDirection.Column}),
		);
	}

	/**
	 * Creates a builder for a basic container
	 * @param options - Layout node options
	 * @returns A new LayoutBuilder
	 */
	static container(options: LayoutNodeOptions = {}): LayoutBuilder {
		return new LayoutBuilder(new LayoutNode(options));
	}

	/**
	 * Sets the width dimension
	 * @param width - Width value (number, percentage string, or 'auto')
	 * @returns This builder for chaining
	 */
	width(width: Dimension): this {
		this.currentNode.setWidth(width);
		return this;
	}

	/**
	 * Sets the height dimension
	 * @param height - Height value (number, percentage string, or 'auto')
	 * @returns This builder for chaining
	 */
	height(height: Dimension): this {
		this.currentNode.setHeight(height);
		return this;
	}

	/**
	 * Sets both width and height
	 * @param width - Width value
	 * @param height - Height value
	 * @returns This builder for chaining
	 */
	size(width: Dimension, height: Dimension): this {
		this.currentNode.setWidth(width);
		this.currentNode.setHeight(height);
		return this;
	}

	/**
	 * Sets a fixed size
	 * @param size - Size object with width and height
	 * @returns This builder for chaining
	 */
	fixedSize(size: {width: number; height: number}): this {
		this.currentNode.setWidth(size.width);
		this.currentNode.setHeight(size.height);
		return this;
	}

	/**
	 * Sets minimum width constraint
	 * @param minWidth - Minimum width
	 * @returns This builder for chaining
	 */
	minWidth(minWidth: number): this {
		this.currentNode.constraints.minWidth = minWidth;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets maximum width constraint
	 * @param maxWidth - Maximum width
	 * @returns This builder for chaining
	 */
	maxWidth(maxWidth: number): this {
		this.currentNode.constraints.maxWidth = maxWidth;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets minimum height constraint
	 * @param minHeight - Minimum height
	 * @returns This builder for chaining
	 */
	minHeight(minHeight: number): this {
		this.currentNode.constraints.minHeight = minHeight;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets maximum height constraint
	 * @param maxHeight - Maximum height
	 * @returns This builder for chaining
	 */
	maxHeight(maxHeight: number): this {
		this.currentNode.constraints.maxHeight = maxHeight;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets all constraints at once
	 * @param constraints - Constraint values
	 * @returns This builder for chaining
	 */
	constraints(constraints: {
		minWidth?: number;
		maxWidth?: number;
		minHeight?: number;
		maxHeight?: number;
	}): this {
		if (constraints.minWidth !== undefined)
			this.currentNode.constraints.minWidth = constraints.minWidth;
		if (constraints.maxWidth !== undefined)
			this.currentNode.constraints.maxWidth = constraints.maxWidth;
		if (constraints.minHeight !== undefined)
			this.currentNode.constraints.minHeight = constraints.minHeight;
		if (constraints.maxHeight !== undefined)
			this.currentNode.constraints.maxHeight = constraints.maxHeight;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets padding with uniform value on all sides
	 * @param value - Padding value
	 * @returns This builder for chaining
	 */
	padding(value: number): this;
	/**
	 * Sets padding with specific values
	 * @param insets - Edge insets
	 * @returns This builder for chaining
	 */
	padding(insets: EdgeInsets): this;
	padding(value: number | EdgeInsets): this {
		if (typeof value === 'number') {
			this.currentNode.setPadding(EdgeInsetsFactory.all(value));
		} else {
			this.currentNode.setPadding(value);
		}
		return this;
	}

	/**
	 * Sets padding with horizontal and vertical values
	 * @param horizontal - Horizontal padding
	 * @param vertical - Vertical padding
	 * @returns This builder for chaining
	 */
	paddingSymmetric(horizontal: number, vertical: number): this {
		this.currentNode.setPadding(
			EdgeInsetsFactory.symmetric(vertical, horizontal),
		);
		return this;
	}

	/**
	 * Sets margin with uniform value on all sides
	 * @param value - Margin value
	 * @returns This builder for chaining
	 */
	margin(value: number): this;
	/**
	 * Sets margin with specific values
	 * @param insets - Edge insets
	 * @returns This builder for chaining
	 */
	margin(insets: EdgeInsets): this;
	margin(value: number | EdgeInsets): this {
		if (typeof value === 'number') {
			this.currentNode.setMargin(EdgeInsetsFactory.all(value));
		} else {
			this.currentNode.setMargin(value);
		}
		return this;
	}

	/**
	 * Sets margin with horizontal and vertical values
	 * @param horizontal - Horizontal margin
	 * @param vertical - Vertical margin
	 * @returns This builder for chaining
	 */
	marginSymmetric(horizontal: number, vertical: number): this {
		this.currentNode.setMargin(
			EdgeInsetsFactory.symmetric(vertical, horizontal),
		);
		return this;
	}

	/**
	 * Sets flex grow factor
	 * @param grow - Flex grow value
	 * @returns This builder for chaining
	 */
	flexGrow(grow: number): this {
		this.currentNode.setFlexGrow(grow);
		return this;
	}

	/**
	 * Sets flex shrink factor
	 * @param shrink - Flex shrink value
	 * @returns This builder for chaining
	 */
	flexShrink(shrink: number): this {
		this.currentNode.setFlexShrink(shrink);
		return this;
	}

	/**
	 * Sets flex basis
	 * @param basis - Flex basis value (number or 'auto')
	 * @returns This builder for chaining
	 */
	flexBasis(basis: number | 'auto'): this {
		this.currentNode.setFlexBasis(basis);
		return this;
	}

	/**
	 * Sets flex properties (grow, shrink, basis)
	 * @param grow - Flex grow
	 * @param shrink - Flex shrink
	 * @param basis - Flex basis
	 * @returns This builder for chaining
	 */
	flex(grow: number, shrink?: number, basis?: number | 'auto'): this {
		this.currentNode.setFlexGrow(grow);
		if (shrink !== undefined) this.currentNode.setFlexShrink(shrink);
		if (basis !== undefined) this.currentNode.setFlexBasis(basis);
		return this;
	}

	/**
	 * Sets align self property
	 * @param align - Alignment value
	 * @returns This builder for chaining
	 */
	alignSelf(
		align:
			| 'auto'
			| 'flex-start'
			| 'flex-end'
			| 'center'
			| 'stretch'
			| 'baseline',
	): this {
		this.currentNode.flex.alignSelf = align as
			| 'auto'
			| import('./flex-direction').AlignItems;
		this.currentNode.updatePropertyHash();
		return this;
	}

	/**
	 * Sets visibility
	 * @param visible - Whether the node is visible
	 * @returns This builder for chaining
	 */
	visible(visible: boolean): this {
		this.currentNode.setVisible(visible);
		return this;
	}

	/**
	 * Hides the node
	 * @returns This builder for chaining
	 */
	hide(): this {
		this.currentNode.setVisible(false);
		return this;
	}

	/**
	 * Shows the node
	 * @returns This builder for chaining
	 */
	show(): this {
		this.currentNode.setVisible(true);
		return this;
	}

	/**
	 * Sets custom data on the node
	 * @param data - Custom data to attach
	 * @returns This builder for chaining
	 */
	data(data: unknown): this {
		this.currentNode.data = data;
		return this;
	}

	/**
	 * Sets the node ID
	 * @param id - The node ID
	 * @returns This builder for chaining
	 */
	id(id: string): this {
		(this.currentNode as unknown as {id: string}).id = id;
		return this;
	}

	/**
	 * Adds a child node
	 * @param child - Child node to add
	 * @returns This builder for chaining
	 */
	child(child: LayoutNode): this;
	/**
	 * Adds a child using a builder function
	 * @param builder - Builder function that receives a new builder
	 * @returns This builder for chaining
	 */
	child(builder: (builder: LayoutBuilder) => LayoutBuilder): this;
	child(
		childOrBuilder: LayoutNode | ((builder: LayoutBuilder) => LayoutBuilder),
	): this {
		if (childOrBuilder instanceof LayoutNode) {
			this.currentNode.addChild(childOrBuilder);
		} else {
			const childBuilder = childOrBuilder(new LayoutBuilder());
			this.currentNode.addChild(childBuilder.build());
		}
		return this;
	}

	/**
	 * Adds multiple child nodes
	 * @param children - Child nodes to add
	 * @returns This builder for chaining
	 */
	children(...children: LayoutNode[]): this {
		for (const child of children) {
			this.currentNode.addChild(child);
		}
		return this;
	}

	/**
	 * Starts building a child node (pushes current to stack)
	 * @returns This builder for chaining
	 */
	push(): this {
		this.parentStack.push(this.currentNode);
		return this;
	}

	/**
	 * Finishes building a child node (pops from stack)
	 * @returns This builder for chaining
	 */
	pop(): this {
		const child = this.currentNode;
		const parent = this.parentStack.pop();
		if (parent) {
			parent.addChild(child);
			this.currentNode = parent;
		}
		return this;
	}

	/**
	 * Builds and returns the final node
	 * @returns The constructed LayoutNode
	 */
	build(): LayoutNode {
		return this.currentNode;
	}

	// FlexContainer-specific methods (only work if current node is a FlexContainer)

	/**
	 * Sets the flex direction (FlexContainer only)
	 * @param direction - The flex direction
	 * @returns This builder for chaining
	 */
	direction(direction: FlexDirection): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setDirection(direction);
		}
		return this;
	}

	/**
	 * Sets the flex wrap (FlexContainer only)
	 * @param wrap - The wrap mode
	 * @returns This builder for chaining
	 */
	wrap(wrap: FlexWrap): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setWrap(wrap);
		}
		return this;
	}

	/**
	 * Sets the justify content (FlexContainer only)
	 * @param justify - The justify content value
	 * @returns This builder for chaining
	 */
	justifyContent(justify: JustifyContent): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setJustifyContent(justify);
		}
		return this;
	}

	/**
	 * Sets the align items (FlexContainer only)
	 * @param align - The align items value
	 * @returns This builder for chaining
	 */
	alignItems(align: AlignItems): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setAlignItems(align);
		}
		return this;
	}

	/**
	 * Sets the align content (FlexContainer only)
	 * @param align - The align content value
	 * @returns This builder for chaining
	 */
	alignContent(align: AlignContent): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setAlignContent(align);
		}
		return this;
	}

	/**
	 * Sets the gap between items (FlexContainer only)
	 * @param gap - The gap value
	 * @returns This builder for chaining
	 */
	gap(gap: number): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setGap(gap);
		}
		return this;
	}

	/**
	 * Sets the row gap (FlexContainer only)
	 * @param rowGap - The row gap value
	 * @returns This builder for chaining
	 */
	rowGap(rowGap: number): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setRowGap(rowGap);
		}
		return this;
	}

	/**
	 * Centers content both horizontally and vertically (FlexContainer only)
	 * @returns This builder for chaining
	 */
	center(): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setJustifyContent(JustifyContent.Center);
			this.currentNode.setAlignItems(AlignItems.Center);
		}
		return this;
	}

	/**
	 * Spaces items evenly (FlexContainer only)
	 * @returns This builder for chaining
	 */
	spaceBetween(): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setJustifyContent(JustifyContent.SpaceBetween);
		}
		return this;
	}

	/**
	 * Spaces items with equal space around (FlexContainer only)
	 * @returns This builder for chaining
	 */
	spaceAround(): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setJustifyContent(JustifyContent.SpaceAround);
		}
		return this;
	}

	/**
	 * Spaces items with equal space including edges (FlexContainer only)
	 * @returns This builder for chaining
	 */
	spaceEvenly(): this {
		if (this.currentNode instanceof FlexContainer) {
			this.currentNode.setJustifyContent(JustifyContent.SpaceEvenly);
		}
		return this;
	}
}

/**
 * Creates a layout builder for a flex container
 * @param options - Flex container options
 * @returns A new LayoutBuilder
 */
export function flex(options: FlexContainerOptions = {}): LayoutBuilder {
	return LayoutBuilder.flex(options);
}

/**
 * Creates a layout builder for a row flex container
 * @param options - Flex container options
 * @returns A new LayoutBuilder
 */
export function row(
	options: Omit<FlexContainerOptions, 'direction'> = {},
): LayoutBuilder {
	return LayoutBuilder.row(options);
}

/**
 * Creates a layout builder for a column flex container
 * @param options - Flex container options
 * @returns A new LayoutBuilder
 */
export function column(
	options: Omit<FlexContainerOptions, 'direction'> = {},
): LayoutBuilder {
	return LayoutBuilder.column(options);
}

/**
 * Creates a layout builder for a basic container
 * @param options - Layout node options
 * @returns A new LayoutBuilder
 */
export function container(options: LayoutNodeOptions = {}): LayoutBuilder {
	return LayoutBuilder.container(options);
}
