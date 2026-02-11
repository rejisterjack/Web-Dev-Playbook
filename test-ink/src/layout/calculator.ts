/**
 * Layout Calculator Module
 *
 * Defines the LayoutCalculator class for computing layouts.
 * Implements constraint-based layout resolution with support for:
 * - Recursive nested layout calculation
 * - Layout caching for performance
 * - Efficient O(n) algorithms
 */

import {LayoutNode} from './node';
import {FlexContainer} from './flex-container';
import type {
	Size,
	Position,
	LayoutConstraints,
	ComputedLayout,
	LayoutChange,
} from './types';
import {LayoutResolver} from './resolver';
import {
	clamp,
	floorLayoutValue,
	getHorizontalPadding,
	getVerticalPadding,
} from './utils';

/**
 * Context for layout calculation
 */
export interface CalculationContext {
	/** Available size for the layout */
	availableSize: Size;
	/** Parent constraints */
	parentConstraints?: LayoutConstraints;
	/** Whether to use cache */
	useCache: boolean;
	/** Depth in the tree */
	depth: number;
}

/**
 * Result of a layout calculation
 */
export interface CalculationResult {
	/** The computed size */
	size: Size;
	/** Whether the layout was retrieved from cache */
	fromCache: boolean;
	/** Number of nodes calculated */
	nodesCalculated: number;
}

/**
 * Options for the layout calculator
 */
export interface LayoutCalculatorOptions {
	/** Maximum depth for layout calculation */
	maxDepth?: number;
	/** Whether to enable caching */
	enableCache?: boolean;
	/** Debug mode */
	debug?: boolean;
}

/**
 * Calculates layouts for nodes in the layout tree
 */
export class LayoutCalculator {
	private options: Required<LayoutCalculatorOptions>;
	private debug: boolean;

	/**
	 * Creates a new LayoutCalculator
	 * @param options - Calculator options
	 */
	constructor(options: LayoutCalculatorOptions = {}) {
		this.options = {
			maxDepth: options.maxDepth ?? 100,
			enableCache: options.enableCache ?? true,
			debug: options.debug ?? false,
		};
		this.debug = this.options.debug;
	}

	/**
	 * Calculates the layout for a node and its children
	 * @param node - The root node to calculate
	 * @param availableSize - The available size
	 * @param constraints - Optional constraints
	 * @returns The calculation result
	 */
	calculate(
		node: LayoutNode,
		availableSize: Size,
		constraints?: LayoutConstraints,
	): CalculationResult {
		const context: CalculationContext = {
			availableSize: {...availableSize},
			parentConstraints: constraints,
			useCache: this.options.enableCache,
			depth: 0,
		};

		let nodesCalculated = 0;

		const calculateRecursive = (
			currentNode: LayoutNode,
			ctx: CalculationContext,
		): Size => {
			// Check depth limit
			if (ctx.depth > this.options.maxDepth) {
				this.log('Max depth exceeded for node:', currentNode.id);
				return {width: 0, height: 0};
			}

			// Check cache if enabled
			if (ctx.useCache) {
				const cached = this.getCachedLayout(currentNode, ctx);
				if (cached) {
					this.log('Cache hit for node:', currentNode.id);
					return cached.size;
				}
			}

			nodesCalculated++;

			// Calculate layout based on node type
			let size: Size;
			if (currentNode instanceof FlexContainer) {
				size = this.calculateFlexContainer(currentNode, ctx);
			} else {
				size = this.calculateNode(currentNode, ctx);
			}

			// Cache the result
			if (ctx.useCache) {
				this.cacheLayout(currentNode, ctx, size);
			}

			return size;
		};

		const finalSize = calculateRecursive(node, context);

		return {
			size: finalSize,
			fromCache: nodesCalculated === 0,
			nodesCalculated,
		};
	}

	/**
	 * Calculates layout for a standard node
	 * @param node - The node to calculate
	 * @param context - The calculation context
	 * @returns The computed size
	 */
	private calculateNode(node: LayoutNode, context: CalculationContext): Size {
		if (!node.visible) {
			node.setComputedLayout({x: 0, y: 0}, {width: 0, height: 0});
			return {width: 0, height: 0};
		}

		// Resolve constraints
		const constraints = LayoutResolver.resolveConstraints(node.constraints);

		// Account for padding
		const innerWidth = Math.max(
			0,
			context.availableSize.width - getHorizontalPadding(node.padding),
		);
		const innerHeight = Math.max(
			0,
			context.availableSize.height - getVerticalPadding(node.padding),
		);

		// Resolve dimensions
		const resolved = LayoutResolver.resolveSize(
			node.width,
			node.height,
			{containerWidth: innerWidth, containerHeight: innerHeight},
			constraints,
		);

		// Calculate children
		const childContext: CalculationContext = {
			availableSize: {
				width: Math.max(0, resolved.width - getHorizontalPadding(node.padding)),
				height: Math.max(0, resolved.height - getVerticalPadding(node.padding)),
			},
			parentConstraints: constraints,
			useCache: context.useCache,
			depth: context.depth + 1,
		};

		// Calculate children layouts
		for (const child of node.children) {
			if (child.visible) {
				this.calculateChildLayout(child, childContext);
			}
		}

		// Set computed layout
		const finalSize = {
			width: resolved.width + getHorizontalPadding(node.margin),
			height: resolved.height + getVerticalPadding(node.margin),
		};

		node.setComputedLayout({x: 0, y: 0}, finalSize);

		return finalSize;
	}

	/**
	 * Calculates layout for a flex container
	 * @param container - The flex container
	 * @param context - The calculation context
	 * @returns The computed size
	 */
	private calculateFlexContainer(
		container: FlexContainer,
		context: CalculationContext,
	): Size {
		if (!container.visible) {
			container.setComputedLayout({x: 0, y: 0}, {width: 0, height: 0});
			return {width: 0, height: 0};
		}

		// Use the container's built-in layout calculation
		const size = container.calculateLayout(context.availableSize);

		// Calculate children positions relative to container
		for (const child of container.children) {
			if (child.visible && child.computedLayout.isValid) {
				// Adjust child position to account for container padding
				const adjustedPosition: Position = {
					x: child.computedLayout.position.x + container.padding.left,
					y: child.computedLayout.position.y + container.padding.top,
				};

				child.setComputedLayout(adjustedPosition, child.computedLayout.size);

				// Recursively calculate child's children
				const childContext: CalculationContext = {
					availableSize: child.computedLayout.size,
					parentConstraints: child.constraints,
					useCache: context.useCache,
					depth: context.depth + 1,
				};

				for (const grandchild of child.children) {
					if (grandchild.visible) {
						this.calculateChildLayout(grandchild, childContext);
					}
				}
			}
		}

		return size;
	}

	/**
	 * Calculates layout for a child node
	 * @param child - The child node
	 * @param context - The calculation context
	 */
	private calculateChildLayout(
		child: LayoutNode,
		context: CalculationContext,
	): void {
		if (child instanceof FlexContainer) {
			this.calculateFlexContainer(child, context);
		} else {
			this.calculateNode(child, context);
		}
	}

	/**
	 * Gets cached layout if available and valid
	 * @param node - The node to check
	 * @param context - The calculation context
	 * @returns The cached computed layout, or undefined
	 */
	private getCachedLayout(
		node: LayoutNode,
		context: CalculationContext,
	): ComputedLayout | undefined {
		if (!context.parentConstraints) {
			return undefined;
		}

		const cached = node.getCachedLayout(context.parentConstraints);
		if (cached) {
			// Verify the cached layout is still valid
			if (
				cached.layout.isValid &&
				cached.constraints.minWidth === context.parentConstraints.minWidth &&
				cached.constraints.maxWidth === context.parentConstraints.maxWidth &&
				cached.constraints.minHeight === context.parentConstraints.minHeight &&
				cached.constraints.maxHeight === context.parentConstraints.maxHeight
			) {
				// Restore the cached layout
				node.setComputedLayout(cached.layout.position, cached.layout.size);
				return cached.layout;
			}
		}

		return undefined;
	}

	/**
	 * Caches a layout result
	 * @param node - The node to cache for
	 * @param context - The calculation context
	 * @param size - The computed size
	 */
	private cacheLayout(
		node: LayoutNode,
		context: CalculationContext,
		size: Size,
	): void {
		if (!context.parentConstraints) {
			return;
		}

		node.cacheLayout(context.parentConstraints, {
			position: node.computedLayout.position,
			size,
			isValid: true,
			timestamp: Date.now(),
		});
	}

	/**
	 * Calculates the difference between two layout states
	 * @param oldNode - The old layout node
	 * @param newNode - The new layout node
	 * @returns Array of layout changes
	 */
	calculateDiff(oldNode: LayoutNode, newNode: LayoutNode): LayoutChange[] {
		const changes: LayoutChange[] = [];

		const compareNodes = (oldN: LayoutNode, newN: LayoutNode): void => {
			const oldLayout = oldN.computedLayout;
			const newLayout = newN.computedLayout;

			if (!oldLayout.isValid || !newLayout.isValid) {
				return;
			}

			const positionChanged =
				oldLayout.position.x !== newLayout.position.x ||
				oldLayout.position.y !== newLayout.position.y;

			const sizeChanged =
				oldLayout.size.width !== newLayout.size.width ||
				oldLayout.size.height !== newLayout.size.height;

			if (positionChanged || sizeChanged) {
				changes.push({
					nodeId: newN.id,
					oldLayout,
					newLayout,
					positionChanged,
					sizeChanged,
				});
			}

			// Compare children
			const oldChildren = oldN.children;
			const newChildren = newN.children;
			const minLength = Math.min(oldChildren.length, newChildren.length);

			for (let i = 0; i < minLength; i++) {
				compareNodes(oldChildren[i], newChildren[i]);
			}
		};

		compareNodes(oldNode, newNode);
		return changes;
	}

	/**
	 * Measures the intrinsic size of a node without full layout
	 * @param node - The node to measure
	 * @returns The intrinsic size
	 */
	measureIntrinsicSize(node: LayoutNode): Size {
		if (!node.visible) {
			return {width: 0, height: 0};
		}

		// For leaf nodes, return preferred size or 0
		if (!node.hasChildren) {
			const width = typeof node.width === 'number' ? node.width : 0;
			const height = typeof node.height === 'number' ? node.height : 0;
			return {width, height};
		}

		// For containers, measure children
		let maxWidth = 0;
		let maxHeight = 0;
		let totalWidth = 0;
		let totalHeight = 0;

		for (const child of node.children) {
			if (!child.visible) continue;

			const childSize = this.measureIntrinsicSize(child);
			maxWidth = Math.max(maxWidth, childSize.width);
			maxHeight = Math.max(maxHeight, childSize.height);
			totalWidth += childSize.width;
			totalHeight += childSize.height;
		}

		// Add padding
		const padding = getHorizontalPadding(node.padding);
		const verticalPadding = getVerticalPadding(node.padding);

		// Use appropriate measurement based on layout type
		if (node instanceof FlexContainer) {
			if (node.isRowDirection) {
				return {
					width: totalWidth + padding,
					height: maxHeight + verticalPadding,
				};
			} else {
				return {
					width: maxWidth + padding,
					height: totalHeight + verticalPadding,
				};
			}
		}

		return {
			width: maxWidth + padding,
			height: maxHeight + verticalPadding,
		};
	}

	/**
	 * Clears the layout cache for a node and its descendants
	 * @param node - The root node
	 */
	clearCache(node: LayoutNode): void {
		node.traverse(n => {
			n.clearCache();
		});
	}

	/**
	 * Sets calculator options
	 * @param options - New options
	 */
	setOptions(options: Partial<LayoutCalculatorOptions>): void {
		this.options = {...this.options, ...options};
		this.debug = this.options.debug;
	}

	/**
	 * Logs debug messages
	 */
	private log(...args: unknown[]): void {
		if (this.debug) {
			console.log('[LayoutCalculator]', ...args);
		}
	}
}
