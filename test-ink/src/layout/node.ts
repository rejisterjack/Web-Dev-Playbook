/**
 * Layout Node Module
 *
 * Defines the LayoutNode class representing a layout element in the tree.
 * Each node can have children, constraints, padding, margin, and computed layout.
 */

import type {
	Size,
	Position,
	Rect,
	EdgeInsets,
	LayoutConstraints,
	ComputedLayout,
	LayoutCacheEntry,
	Dimension,
} from './types';
import {EdgeInsets as EdgeInsetsFactory} from './types';
import type {FlexItemProperties} from './flex-direction';
import {DEFAULT_FLEX_ITEM} from './flex-direction';
import {generateHash} from './utils';

/**
 * Counter for generating unique node IDs
 */
let nodeIdCounter = 0;

/**
 * Generates a unique node ID
 */
function generateNodeId(): string {
	return `node_${++nodeIdCounter}_${Date.now().toString(36)}`;
}

/**
 * Options for creating a LayoutNode
 */
export interface LayoutNodeOptions {
	/** Unique identifier (auto-generated if not provided) */
	id?: string;
	/** Minimum width constraint */
	minWidth?: number;
	/** Maximum width constraint */
	maxWidth?: number;
	/** Minimum height constraint */
	minHeight?: number;
	/** Maximum height constraint */
	maxHeight?: number;
	/** Preferred width (can be number, percentage string, or 'auto') */
	width?: Dimension;
	/** Preferred height (can be number, percentage string, or 'auto') */
	height?: Dimension;
	/** Padding inside the node */
	padding?: EdgeInsets;
	/** Margin outside the node */
	margin?: EdgeInsets;
	/** Flex grow factor */
	flexGrow?: number;
	/** Flex shrink factor */
	flexShrink?: number;
	/** Flex basis size */
	flexBasis?: number | 'auto';
	/** Alignment override for this item */
	alignSelf?:
		| 'auto'
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'stretch'
		| 'baseline';
	/** Whether this node is visible */
	visible?: boolean;
	/** Custom data attached to the node */
	data?: unknown;
}

/**
 * Represents a node in the layout tree
 */
export class LayoutNode {
	/** Unique identifier for this node */
	readonly id: string;

	/** Parent node (null for root) */
	parent: LayoutNode | null = null;

	/** Child nodes */
	protected _children: LayoutNode[] = [];

	/** Layout constraints */
	constraints: LayoutConstraints;

	/** Preferred dimensions */
	width: Dimension;
	height: Dimension;

	/** Padding inside the node */
	padding: EdgeInsets;

	/** Margin outside the node */
	margin: EdgeInsets;

	/** Flex properties for this item */
	flex: FlexItemProperties;

	/** Whether this node is visible */
	visible: boolean;

	/** Computed layout result */
	computedLayout: ComputedLayout;

	/** Layout cache for performance */
	private layoutCache: Map<string, LayoutCacheEntry> = new Map();

	/** Maximum cache size */
	private static readonly MAX_CACHE_SIZE = 10;

	/** Custom data attached to the node */
	data: unknown;

	/** Property hash for cache invalidation */
	private propertyHash: string;

	/**
	 * Creates a new LayoutNode
	 * @param options - Node configuration options
	 */
	constructor(options: LayoutNodeOptions = {}) {
		this.id = options.id ?? generateNodeId();

		// Initialize constraints
		this.constraints = {
			minWidth: options.minWidth ?? 0,
			maxWidth: options.maxWidth ?? Infinity,
			minHeight: options.minHeight ?? 0,
			maxHeight: options.maxHeight ?? Infinity,
		};

		// Initialize dimensions
		this.width = options.width ?? 'auto';
		this.height = options.height ?? 'auto';

		// Initialize padding and margin
		this.padding = options.padding ?? EdgeInsetsFactory.zero();
		this.margin = options.margin ?? EdgeInsetsFactory.zero();

		// Initialize flex properties
		this.flex = {
			flexGrow: options.flexGrow ?? DEFAULT_FLEX_ITEM.flexGrow,
			flexShrink: options.flexShrink ?? DEFAULT_FLEX_ITEM.flexShrink,
			flexBasis: options.flexBasis ?? DEFAULT_FLEX_ITEM.flexBasis,
			alignSelf:
				(options.alignSelf as FlexItemProperties['alignSelf']) ??
				DEFAULT_FLEX_ITEM.alignSelf,
		};

		// Initialize visibility
		this.visible = options.visible ?? true;

		// Initialize custom data
		this.data = options.data ?? null;

		// Initialize computed layout as invalid
		this.computedLayout = {
			position: {x: 0, y: 0},
			size: {width: 0, height: 0},
			isValid: false,
			timestamp: 0,
		};

		// Generate initial property hash
		this.propertyHash = this.generatePropertyHash();
	}

	/**
	 * Gets the children of this node
	 */
	get children(): readonly LayoutNode[] {
		return this._children;
	}

	/**
	 * Gets the number of children
	 */
	get childCount(): number {
		return this._children.length;
	}

	/**
	 * Checks if this node has children
	 */
	get hasChildren(): boolean {
		return this._children.length > 0;
	}

	/**
	 * Gets the child at the specified index
	 * @param index - The child index
	 * @returns The child node, or undefined if index is out of bounds
	 */
	getChild(index: number): LayoutNode | undefined {
		return this._children[index];
	}

	/**
	 * Adds a child node
	 * @param child - The child node to add
	 * @returns This node for method chaining
	 */
	addChild(child: LayoutNode): this {
		if (child.parent) {
			child.parent.removeChild(child);
		}

		child.parent = this;
		this._children.push(child);
		this.invalidateLayout();

		return this;
	}

	/**
	 * Adds multiple child nodes
	 * @param children - The child nodes to add
	 * @returns This node for method chaining
	 */
	addChildren(...children: LayoutNode[]): this {
		for (const child of children) {
			this.addChild(child);
		}
		return this;
	}

	/**
	 * Inserts a child node at a specific index
	 * @param index - The index to insert at
	 * @param child - The child node to insert
	 * @returns This node for method chaining
	 */
	insertChild(index: number, child: LayoutNode): this {
		if (child.parent) {
			child.parent.removeChild(child);
		}

		child.parent = this;
		this._children.splice(index, 0, child);
		this.invalidateLayout();

		return this;
	}

	/**
	 * Removes a child node
	 * @param child - The child node to remove
	 * @returns True if the child was removed, false if not found
	 */
	removeChild(child: LayoutNode): boolean {
		const index = this._children.indexOf(child);
		if (index === -1) {
			return false;
		}

		return this.removeChildAt(index) !== undefined;
	}

	/**
	 * Removes a child node at a specific index
	 * @param index - The index to remove at
	 * @returns The removed child, or undefined if index is out of bounds
	 */
	removeChildAt(index: number): LayoutNode | undefined {
		const child = this._children.splice(index, 1)[0];
		if (child) {
			child.parent = null;
			child.invalidateLayout();
			this.invalidateLayout();
		}
		return child;
	}

	/**
	 * Removes all children
	 * @returns This node for method chaining
	 */
	removeAllChildren(): this {
		for (const child of this._children) {
			child.parent = null;
			child.invalidateLayout();
		}
		this._children = [];
		this.invalidateLayout();
		return this;
	}

	/**
	 * Gets the index of a child node
	 * @param child - The child to find
	 * @returns The index, or -1 if not found
	 */
	indexOf(child: LayoutNode): number {
		return this._children.indexOf(child);
	}

	/**
	 * Checks if this node contains the specified child
	 * @param child - The child to check
	 * @returns True if this node contains the child
	 */
	contains(child: LayoutNode): boolean {
		return this._children.includes(child);
	}

	/**
	 * Gets the bounds of this node (position + size)
	 */
	get bounds(): Rect {
		return {
			x: this.computedLayout.position.x,
			y: this.computedLayout.position.y,
			width: this.computedLayout.size.width,
			height: this.computedLayout.size.height,
		};
	}

	/**
	 * Gets the content bounds (excluding padding)
	 */
	get contentBounds(): Rect {
		return {
			x: this.computedLayout.position.x + this.padding.left,
			y: this.computedLayout.position.y + this.padding.top,
			width: Math.max(
				0,
				this.computedLayout.size.width - this.padding.left - this.padding.right,
			),
			height: Math.max(
				0,
				this.computedLayout.size.height -
					this.padding.top -
					this.padding.bottom,
			),
		};
	}

	/**
	 * Gets the total bounds including margin
	 */
	get totalBounds(): Rect {
		return {
			x: this.computedLayout.position.x - this.margin.left,
			y: this.computedLayout.position.y - this.margin.top,
			width:
				this.computedLayout.size.width + this.margin.left + this.margin.right,
			height:
				this.computedLayout.size.height + this.margin.top + this.margin.bottom,
		};
	}

	/**
	 * Invalidates the computed layout for this node and its ancestors
	 */
	invalidateLayout(): void {
		if (!this.computedLayout.isValid) {
			return; // Already invalid
		}

		this.computedLayout.isValid = false;
		this.computedLayout.timestamp = 0;

		// Invalidate ancestors
		let ancestor = this.parent;
		while (ancestor) {
			if (!ancestor.computedLayout.isValid) {
				break; // Already invalidated
			}
			ancestor.computedLayout.isValid = false;
			ancestor.computedLayout.timestamp = 0;
			ancestor = ancestor.parent;
		}
	}

	/**
	 * Updates the computed layout
	 * @param position - The computed position
	 * @param size - The computed size
	 */
	setComputedLayout(position: Position, size: Size): void {
		this.computedLayout = {
			position: {...position},
			size: {...size},
			isValid: true,
			timestamp: Date.now(),
		};
	}

	/**
	 * Gets a cached layout if available and valid
	 * @param constraints - The constraints to look up
	 * @returns The cached layout entry, or undefined if not found
	 */
	getCachedLayout(
		constraints: LayoutConstraints,
	): LayoutCacheEntry | undefined {
		const key = this.generateCacheKey(constraints);
		const entry = this.layoutCache.get(key);

		if (entry && entry.propertyHash === this.propertyHash) {
			return entry;
		}

		return undefined;
	}

	/**
	 * Caches a layout result
	 * @param constraints - The constraints used
	 * @param layout - The computed layout
	 */
	cacheLayout(constraints: LayoutConstraints, layout: ComputedLayout): void {
		// Manage cache size
		if (this.layoutCache.size >= LayoutNode.MAX_CACHE_SIZE) {
			const firstKey = this.layoutCache.keys().next().value;
			if (firstKey !== undefined) {
				this.layoutCache.delete(firstKey);
			}
		}

		const key = this.generateCacheKey(constraints);
		this.layoutCache.set(key, {
			constraints: {...constraints},
			layout: {...layout},
			propertyHash: this.propertyHash,
		});
	}

	/**
	 * Clears the layout cache
	 */
	clearCache(): void {
		this.layoutCache.clear();
	}

	/**
	 * Traverses the node tree with a callback (pre-order)
	 * @param callback - Function to call for each node
	 */
	traverse(callback: (node: LayoutNode) => void): void {
		callback(this);
		for (const child of this._children) {
			child.traverse(callback);
		}
	}

	/**
	 * Traverses the node tree with a callback (post-order)
	 * @param callback - Function to call for each node
	 */
	traversePostOrder(callback: (node: LayoutNode) => void): void {
		for (const child of this._children) {
			child.traversePostOrder(callback);
		}
		callback(this);
	}

	/**
	 * Finds a node by ID in the subtree
	 * @param id - The node ID to find
	 * @returns The found node, or undefined
	 */
	findById(id: string): LayoutNode | undefined {
		if (this.id === id) {
			return this;
		}

		for (const child of this._children) {
			const found = child.findById(id);
			if (found) {
				return found;
			}
		}

		return undefined;
	}

	/**
	 * Finds nodes matching a predicate
	 * @param predicate - Function to test each node
	 * @returns Array of matching nodes
	 */
	findAll(predicate: (node: LayoutNode) => boolean): LayoutNode[] {
		const results: LayoutNode[] = [];

		this.traverse(node => {
			if (predicate(node)) {
				results.push(node);
			}
		});

		return results;
	}

	/**
	 * Gets the root node of the tree
	 */
	get root(): LayoutNode {
		let node: LayoutNode = this;
		while (node.parent) {
			node = node.parent;
		}
		return node;
	}

	/**
	 * Gets the depth of this node in the tree
	 */
	get depth(): number {
		let depth = 0;
		let node: LayoutNode | null = this.parent;
		while (node) {
			depth++;
			node = node.parent;
		}
		return depth;
	}

	/**
	 * Gets the path from root to this node
	 */
	get path(): LayoutNode[] {
		const path: LayoutNode[] = [];
		let node: LayoutNode | null = this;
		while (node) {
			path.unshift(node);
			node = node.parent;
		}
		return path;
	}

	/**
	 * Converts the node to a string representation
	 */
	toString(): string {
		return `LayoutNode(${this.id}, ${this.computedLayout.size.width}x${this.computedLayout.size.height}@${this.computedLayout.position.x},${this.computedLayout.position.y})`;
	}

	/**
	 * Generates a property hash for cache invalidation
	 */
	private generatePropertyHash(): string {
		return generateHash(
			this.width ?? 'auto',
			this.height ?? 'auto',
			this.constraints.minWidth,
			this.constraints.maxWidth,
			this.constraints.minHeight,
			this.constraints.maxHeight,
			this.flex.flexGrow,
			this.flex.flexShrink,
			this.flex.flexBasis ?? 'auto',
			this.visible,
		);
	}

	/**
	 * Generates a cache key for the given constraints
	 */
	private generateCacheKey(constraints: LayoutConstraints): string {
		return generateHash(
			constraints.minWidth,
			constraints.maxWidth,
			constraints.minHeight,
			constraints.maxHeight,
		);
	}

	/**
	 * Updates the property hash (call when properties change)
	 */
	updatePropertyHash(): void {
		this.propertyHash = this.generatePropertyHash();
		this.invalidateLayout();
	}

	/**
	 * Sets the width dimension
	 * @param width - The new width (number, percentage, or 'auto')
	 */
	setWidth(width: Dimension): void {
		if (this.width !== width) {
			this.width = width;
			this.updatePropertyHash();
		}
	}

	/**
	 * Sets the height dimension
	 * @param height - The new height (number, percentage, or 'auto')
	 */
	setHeight(height: Dimension): void {
		if (this.height !== height) {
			this.height = height;
			this.updatePropertyHash();
		}
	}

	/**
	 * Sets the padding
	 * @param padding - The new padding
	 */
	setPadding(padding: EdgeInsets): void {
		this.padding = padding;
		this.updatePropertyHash();
	}

	/**
	 * Sets the margin
	 * @param margin - The new margin
	 */
	setMargin(margin: EdgeInsets): void {
		this.margin = margin;
		this.updatePropertyHash();
	}

	/**
	 * Sets the flex grow factor
	 * @param grow - The new flex grow value
	 */
	setFlexGrow(grow: number): void {
		if (this.flex.flexGrow !== grow) {
			this.flex.flexGrow = grow;
			this.updatePropertyHash();
		}
	}

	/**
	 * Sets the flex shrink factor
	 * @param shrink - The new flex shrink value
	 */
	setFlexShrink(shrink: number): void {
		if (this.flex.flexShrink !== shrink) {
			this.flex.flexShrink = shrink;
			this.updatePropertyHash();
		}
	}

	/**
	 * Sets the flex basis
	 * @param basis - The new flex basis (number or 'auto')
	 */
	setFlexBasis(basis: number | 'auto'): void {
		if (this.flex.flexBasis !== basis) {
			this.flex.flexBasis = basis;
			this.updatePropertyHash();
		}
	}

	/**
	 * Sets visibility
	 * @param visible - Whether the node is visible
	 */
	setVisible(visible: boolean): void {
		if (this.visible !== visible) {
			this.visible = visible;
			this.updatePropertyHash();
		}
	}
}
