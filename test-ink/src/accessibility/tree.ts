/**
 * Accessibility Tree Module
 *
 * Provides accessibility tree functionality for the TUI framework.
 * Builds accessibility tree from widget tree, supports tree traversal and querying.
 *
 * @module accessibility/tree
 */

import type {Widget} from '../widgets/types.js';
import {
	AccessibilityRole,
	AccessibilityState,
	type AccessibilityProps,
	type AccessibilityTreeNode,
} from './types.js';

/**
 * Tree traversal order
 */
export enum TraversalOrder {
	/** Pre-order traversal (parent before children) */
	PRE_ORDER = 'pre-order',

	/** Post-order traversal (children before parent) */
	POST_ORDER = 'post-order',

	/** Breadth-first traversal */
	BREADTH_FIRST = 'breadth-first',

	/** Depth-first traversal */
	DEPTH_FIRST = 'depth-first',
}

/**
 * Tree query filter
 */
export interface TreeQueryFilter {
	/** Filter by role */
	role?: AccessibilityRole;

	/** Filter by state */
	state?: AccessibilityState;

	/** Filter by whether node is exposed */
	exposed?: boolean;

	/** Filter by minimum depth */
	minDepth?: number;

	/** Filter by maximum depth */
	maxDepth?: number;

	/** Custom filter function */
	custom?: (node: AccessibilityTreeNode) => boolean;
}

/**
 * Accessibility tree class
 */
export class AccessibilityTree {
	/** Root node of the accessibility tree */
	private _root: AccessibilityTreeNode | null;

	/** Map of widget IDs to tree nodes */
	private _nodeMap: Map<string, AccessibilityTreeNode>;

	/** Whether the tree is built */
	private _built: boolean;

	/** Event listeners for tree changes */
	private _listeners: Set<() => void>;

	/**
	 * Creates a new AccessibilityTree instance
	 */
	constructor() {
		this._root = null;
		this._nodeMap = new Map();
		this._built = false;
		this._listeners = new Set();
	}

	/**
	 * Gets the root node
	 */
	get root(): AccessibilityTreeNode | null {
		return this._root;
	}

	/**
	 * Gets whether the tree is built
	 */
	get built(): boolean {
		return this._built;
	}

	/**
	 * Gets the number of nodes in the tree
	 */
	get size(): number {
		return this._nodeMap.size;
	}

	/**
	 * Builds the accessibility tree from a widget tree
	 *
	 * @param rootWidget - The root widget
	 */
	build(rootWidget: Widget): void {
		// Clear existing tree
		this._nodeMap.clear();
		this._root = null;

		// Build tree recursively
		this._root = this._buildNode(rootWidget, null, 0, 0);

		this._built = true;
		this._notifyListeners();
	}

	/**
	 * Rebuilds the accessibility tree
	 */
	rebuild(): void {
		if (this._root) {
			this.build(this._root.widget);
		}
	}

	/**
	 * Clears the accessibility tree
	 */
	clear(): void {
		this._nodeMap.clear();
		this._root = null;
		this._built = false;
		this._notifyListeners();
	}

	/**
	 * Gets a node by widget ID
	 *
	 * @param widgetId - The widget ID
	 * @returns The tree node, or undefined if not found
	 */
	getNode(widgetId: string): AccessibilityTreeNode | undefined {
		return this._nodeMap.get(widgetId);
	}

	/**
	 * Gets the parent of a node
	 *
	 * @param node - The node
	 * @returns The parent node, or null if the node is the root
	 */
	getParent(node: AccessibilityTreeNode): AccessibilityTreeNode | null {
		return node.parent;
	}

	/**
	 * Gets the children of a node
	 *
	 * @param node - The node
	 * @returns The children of the node
	 */
	getChildren(node: AccessibilityTreeNode): AccessibilityTreeNode[] {
		return [...node.children];
	}

	/**
	 * Gets the siblings of a node
	 *
	 * @param node - The node
	 * @returns The siblings of the node
	 */
	getSiblings(node: AccessibilityTreeNode): AccessibilityTreeNode[] {
		if (!node.parent) {
			return [];
		}
		return node.parent.children.filter((child) => child !== node);
	}

	/**
	 * Gets the first child of a node
	 *
	 * @param node - The node
	 * @returns The first child, or undefined if the node has no children
	 */
	getFirstChild(node: AccessibilityTreeNode): AccessibilityTreeNode | undefined {
		return node.children[0];
	}

	/**
	 * Gets the last child of a node
	 *
	 * @param node - The node
	 * @returns The last child, or undefined if the node has no children
	 */
	getLastChild(node: AccessibilityTreeNode): AccessibilityTreeNode | undefined {
		return node.children[node.children.length - 1];
	}

	/**
	 * Gets the previous sibling of a node
	 *
	 * @param node - The node
	 * @returns The previous sibling, or undefined if the node is the first child
	 */
	getPreviousSibling(node: AccessibilityTreeNode): AccessibilityTreeNode | undefined {
		if (!node.parent) {
			return undefined;
		}
		const index = node.parent.children.indexOf(node);
		return index > 0 ? node.parent.children[index - 1] : undefined;
	}

	/**
	 * Gets the next sibling of a node
	 *
	 * @param node - The node
	 * @returns The next sibling, or undefined if the node is the last child
	 */
	getNextSibling(node: AccessibilityTreeNode): AccessibilityTreeNode | undefined {
		if (!node.parent) {
			return undefined;
		}
		const index = node.parent.children.indexOf(node);
		return index < node.parent.children.length - 1
			? node.parent.children[index + 1]
			: undefined;
	}

	/**
	 * Traverses the tree in the specified order
	 *
	 * @param order - The traversal order
	 * @param callback - Callback function for each node
	 */
	traverse(order: TraversalOrder, callback: (node: AccessibilityTreeNode) => void): void {
		if (!this._root) {
			return;
		}

		switch (order) {
			case TraversalOrder.PRE_ORDER:
				this._traversePreOrder(this._root, callback);
				break;
			case TraversalOrder.POST_ORDER:
				this._traversePostOrder(this._root, callback);
				break;
			case TraversalOrder.BREADTH_FIRST:
				this._traverseBreadthFirst(callback);
				break;
			case TraversalOrder.DEPTH_FIRST:
				this._traverseDepthFirst(this._root, callback);
				break;
		}
	}

	/**
	 * Queries the tree for nodes matching a filter
	 *
	 * @param filter - The query filter
	 * @returns Array of matching nodes
	 */
	query(filter: TreeQueryFilter): AccessibilityTreeNode[] {
		const results: AccessibilityTreeNode[] = [];

		this.traverse(TraversalOrder.PRE_ORDER, (node) => {
			if (this._matchesFilter(node, filter)) {
				results.push(node);
			}
		});

		return results;
	}

	/**
	 * Finds the first node matching a filter
	 *
	 * @param filter - The query filter
	 * @returns The first matching node, or undefined if not found
	 */
	findFirst(filter: TreeQueryFilter): AccessibilityTreeNode | undefined {
		let result: AccessibilityTreeNode | undefined;

		this.traverse(TraversalOrder.PRE_ORDER, (node) => {
			if (!result && this._matchesFilter(node, filter)) {
				result = node;
			}
		});

		return result;
	}

	/**
	 * Finds all nodes with a specific role
	 *
	 * @param role - The role to find
	 * @returns Array of nodes with the role
	 */
	findByRole(role: AccessibilityRole): AccessibilityTreeNode[] {
		return this.query({role});
	}

	/**
	 * Finds all nodes with a specific state
	 *
	 * @param state - The state to find
	 * @returns Array of nodes with the state
	 */
	findByState(state: AccessibilityState): AccessibilityTreeNode[] {
		return this.query({state});
	}

	/**
	 * Gets all exposed nodes
	 *
	 * @returns Array of exposed nodes
	 */
	getExposedNodes(): AccessibilityTreeNode[] {
		return this.query({exposed: true});
	}

	/**
	 * Gets the path from the root to a node
	 *
	 * @param node - The node
	 * @returns Array of nodes from root to the node
	 */
	getPath(node: AccessibilityTreeNode): AccessibilityTreeNode[] {
		const path: AccessibilityTreeNode[] = [];
		let current: AccessibilityTreeNode | null = node;

		while (current) {
			path.unshift(current);
			current = current.parent;
		}

		return path;
	}

	/**
	 * Gets the depth of a node
	 *
	 * @param node - The node
	 * @returns The depth of the node
	 */
	getDepth(node: AccessibilityTreeNode): number {
		return node.depth;
	}

	/**
	 * Registers a listener for tree changes
	 *
	 * @param listener - The listener function
	 */
	onChange(listener: () => void): void {
		this._listeners.add(listener);
	}

	/**
	 * Unregisters a listener for tree changes
	 *
	 * @param listener - The listener function
	 */
	offChange(listener: () => void): void {
		this._listeners.delete(listener);
	}

	/**
	 * Destroys the accessibility tree and cleans up resources
	 */
	destroy(): void {
		this._nodeMap.clear();
		this._root = null;
		this._built = false;
		this._listeners.clear();
	}

	/**
	 * Builds a tree node from a widget
	 *
	 * @param widget - The widget
	 * @param parent - The parent node
	 * @param depth - The depth of the node
	 * @param index - The index among siblings
	 * @returns The tree node
	 */
	private _buildNode(
		widget: Widget,
		parent: AccessibilityTreeNode | null,
		depth: number,
		index: number,
	): AccessibilityTreeNode {
		const a11yProps = this._getAccessibilityProps(widget);
		const node: AccessibilityTreeNode = {
			widget,
			role: a11yProps.role ?? AccessibilityRole.GENERIC,
			label: this._getLabel(widget, a11yProps),
			description: this._getDescription(widget, a11yProps),
			hint: this._getHint(widget, a11yProps),
			states: this._getStates(widget, a11yProps),
			value: this._getValue(widget, a11yProps),
			children: [],
			parent,
			exposed: this._isExposed(widget, a11yProps),
			depth,
			index,
		};

		// Add to node map
		this._nodeMap.set(widget.id, node);

		// Build children
		let childIndex = 0;
		for (const child of widget.children) {
			const childNode = this._buildNode(child, node, depth + 1, childIndex);
			node.children.push(childNode);
			childIndex++;
		}

		return node;
	}

	/**
	 * Gets accessibility properties from a widget
	 *
	 * @param widget - The widget
	 * @returns The accessibility properties
	 */
	private _getAccessibilityProps(widget: Widget): AccessibilityProps {
		// This would typically come from widget.props.a11y or similar
		// For now, return empty props
		return {};
	}

	/**
	 * Gets the label for a widget
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns The label
	 */
	private _getLabel(widget: Widget, a11yProps: AccessibilityProps): string {
		if (typeof a11yProps.label === 'string') {
			return a11yProps.label;
		}
		if (a11yProps.label?.text) {
			return a11yProps.label.text;
		}
		// Use widget ID as fallback
		return widget.id;
	}

	/**
	 * Gets the description for a widget
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns The description, or undefined
	 */
	private _getDescription(
		widget: Widget,
		a11yProps: AccessibilityProps,
	): string | undefined {
		if (typeof a11yProps.description === 'string') {
			return a11yProps.description;
		}
		return a11yProps.description?.text;
	}

	/**
	 * Gets the hint for a widget
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns The hint, or undefined
	 */
	private _getHint(widget: Widget, a11yProps: AccessibilityProps): string | undefined {
		if (typeof a11yProps.hint === 'string') {
			return a11yProps.hint;
		}
		return a11yProps.hint?.text;
	}

	/**
	 * Gets the states for a widget
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns The states
	 */
	private _getStates(widget: Widget, a11yProps: AccessibilityProps): AccessibilityState[] {
		const states: AccessibilityState[] = [];

		// Add states from a11yProps
		if (a11yProps.states) {
			states.push(...a11yProps.states);
		}

		// Add states from widget props
		if (widget.props.disabled) {
			states.push(AccessibilityState.DISABLED);
		} else {
			states.push(AccessibilityState.ENABLED);
		}

		if (widget.props.visible === false) {
			states.push(AccessibilityState.HIDDEN);
		} else {
			states.push(AccessibilityState.VISIBLE);
		}

		// Add checked state
		if (a11yProps.checked === true) {
			states.push(AccessibilityState.CHECKED);
		} else if (a11yProps.checked === 'mixed') {
			states.push(AccessibilityState.MIXED);
		} else if (a11yProps.checked === false) {
			states.push(AccessibilityState.UNCHECKED);
		}

		// Add selected state
		if (a11yProps.selected === true) {
			states.push(AccessibilityState.SELECTED);
		} else if (a11yProps.selected === false) {
			states.push(AccessibilityState.UNSELECTED);
		}

		// Add expanded state
		if (a11yProps.expanded === true) {
			states.push(AccessibilityState.EXPANDED);
		} else if (a11yProps.expanded === false) {
			states.push(AccessibilityState.COLLAPSED);
		}

		return states;
	}

	/**
	 * Gets the value for a widget
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns The value, or undefined
	 */
	private _getValue(
		widget: Widget,
		a11yProps: AccessibilityProps,
	): {now: number; min: number; max: number; text?: string} | undefined {
		if (a11yProps.value) {
			return a11yProps.value;
		}

		// Build value from individual properties
		if (
			a11yProps.valueNow !== undefined ||
			a11yProps.valueMin !== undefined ||
			a11yProps.valueMax !== undefined
		) {
			return {
				now: a11yProps.valueNow ?? 0,
				min: a11yProps.valueMin ?? 0,
				max: a11yProps.valueMax ?? 100,
				text: a11yProps.valueText,
			};
		}

		return undefined;
	}

	/**
	 * Checks if a widget should be exposed to screen readers
	 *
	 * @param widget - The widget
	 * @param a11yProps - The accessibility properties
	 * @returns Whether the widget is exposed
	 */
	private _isExposed(widget: Widget, a11yProps: AccessibilityProps): boolean {
		// Check if explicitly hidden
		if (a11yProps.states?.includes(AccessibilityState.HIDDEN)) {
			return false;
		}

		// Check if widget is visible
		if (widget.props.visible === false) {
			return false;
		}

		// Check if widget has a role
		if (!a11yProps.role) {
			// Generic widgets without a role are not exposed
			return false;
		}

		return true;
	}

	/**
	 * Checks if a node matches a filter
	 *
	 * @param node - The node
	 * @param filter - The filter
	 * @returns Whether the node matches
	 */
	private _matchesFilter(node: AccessibilityTreeNode, filter: TreeQueryFilter): boolean {
		// Check role filter
		if (filter.role !== undefined && node.role !== filter.role) {
			return false;
		}

		// Check state filter
		if (filter.state !== undefined && !node.states.includes(filter.state)) {
			return false;
		}

		// Check exposed filter
		if (filter.exposed !== undefined && node.exposed !== filter.exposed) {
			return false;
		}

		// Check depth filters
		if (filter.minDepth !== undefined && node.depth < filter.minDepth) {
			return false;
		}
		if (filter.maxDepth !== undefined && node.depth > filter.maxDepth) {
			return false;
		}

		// Check custom filter
		if (filter.custom && !filter.custom(node)) {
			return false;
		}

		return true;
	}

	/**
	 * Traverses the tree in pre-order
	 *
	 * @param node - The current node
	 * @param callback - The callback function
	 */
	private _traversePreOrder(
		node: AccessibilityTreeNode,
		callback: (node: AccessibilityTreeNode) => void,
	): void {
		callback(node);
		for (const child of node.children) {
			this._traversePreOrder(child, callback);
		}
	}

	/**
	 * Traverses the tree in post-order
	 *
	 * @param node - The current node
	 * @param callback - The callback function
	 */
	private _traversePostOrder(
		node: AccessibilityTreeNode,
		callback: (node: AccessibilityTreeNode) => void,
	): void {
		for (const child of node.children) {
			this._traversePostOrder(child, callback);
		}
		callback(node);
	}

	/**
	 * Traverses the tree in breadth-first order
	 *
	 * @param callback - The callback function
	 */
	private _traverseBreadthFirst(callback: (node: AccessibilityTreeNode) => void): void {
		if (!this._root) {
			return;
		}

		const queue: AccessibilityTreeNode[] = [this._root];

		while (queue.length > 0) {
			const node = queue.shift()!;
			callback(node);
			queue.push(...node.children);
		}
	}

	/**
	 * Traverses the tree in depth-first order
	 *
	 * @param node - The current node
	 * @param callback - The callback function
	 */
	private _traverseDepthFirst(
		node: AccessibilityTreeNode,
		callback: (node: AccessibilityTreeNode) => void,
	): void {
		const stack: AccessibilityTreeNode[] = [node];

		while (stack.length > 0) {
			const current = stack.pop()!;
			callback(current);
			// Push children in reverse order to maintain left-to-right traversal
			for (let i = current.children.length - 1; i >= 0; i--) {
				stack.push(current.children[i]);
			}
		}
	}

	/**
	 * Notifies all listeners of a tree change
	 */
	private _notifyListeners(): void {
		for (const listener of this._listeners) {
			try {
				listener();
			} catch (error) {
				console.error('Error in accessibility tree listener:', error);
			}
		}
	}
}
