/**
 * Layout Engine Core Module
 *
 * Defines the LayoutEngine class - the main layout engine that integrates
the calculator and resolver. Provides:
 * - High-level layout API
 * - Layout invalidation and recalculation
 * - Layout diffing for efficient updates
 * - Terminal resize handling
 */

import {LayoutNode} from './node';
import {FlexContainer} from './flex-container';
import {LayoutCalculator, type CalculationResult} from './calculator';
import {LayoutResolver} from './resolver';
import type {
	Size,
	Position,
	LayoutConstraints,
	ComputedLayout,
	LayoutChange,
	Rect,
} from './types';
import {cloneRect, rectsEqual} from './utils';

/**
 * Options for the layout engine
 */
export interface LayoutEngineOptions {
	/** Root node of the layout tree */
	rootNode?: LayoutNode;
	/** Initial viewport size */
	viewportSize?: Size;
	/** Whether to enable caching */
	enableCache?: boolean;
	/** Debug mode */
	debug?: boolean;
	/** Debounce time for layout updates (ms) */
	debounceMs?: number;
}

/**
 * Event types for layout engine
 */
export enum LayoutEngineEvent {
	LayoutStarted = 'layout:started',
	LayoutCompleted = 'layout:completed',
	LayoutInvalidated = 'layout:invalidated',
	NodeChanged = 'node:changed',
	ViewportChanged = 'viewport:changed',
}

/**
 * Listener function type
 */
type LayoutEventListener = (data: unknown) => void;

/**
 * The main layout engine that manages layout calculation and updates
 */
export class LayoutEngine {
	/** Root node of the layout tree */
	private rootNode: LayoutNode | null;

	/** Current viewport size */
	private viewportSize: Size;

	/** Layout calculator instance */
	private calculator: LayoutCalculator;

	/** Whether the layout is dirty and needs recalculation */
	private isDirty: boolean = true;

	/** Whether a layout calculation is in progress */
	private isCalculating: boolean = false;

	/** Debounce timer for layout updates */
	private debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/** Debounce time in milliseconds */
	private debounceMs: number;

	/** Debug mode */
	private debug: boolean;

	/** Event listeners */
	private listeners: Map<LayoutEngineEvent, LayoutEventListener[]> = new Map();

	/** Last computed layout snapshot for diffing */
	private lastLayoutSnapshot: Map<string, ComputedLayout> = new Map();

	/** Whether the engine is disposed */
	private disposed: boolean = false;

	/**
	 * Creates a new LayoutEngine
	 * @param options - Engine options
	 */
	constructor(options: LayoutEngineOptions = {}) {
		this.rootNode = options.rootNode ?? null;
		this.viewportSize = options.viewportSize ?? {width: 80, height: 24};
		this.debug = options.debug ?? false;
		this.debounceMs = options.debounceMs ?? 16; // ~60fps

		this.calculator = new LayoutCalculator({
			enableCache: options.enableCache ?? true,
			debug: this.debug,
		});

		// Initialize event listeners map
		for (const event of Object.values(LayoutEngineEvent)) {
			this.listeners.set(event, []);
		}
	}

	/**
	 * Gets the root node
	 */
	getRootNode(): LayoutNode | null {
		return this.rootNode;
	}

	/**
	 * Sets the root node
	 * @param node - The new root node
	 */
	setRootNode(node: LayoutNode | null): void {
		if (this.rootNode !== node) {
			this.rootNode = node;
			this.invalidate();
			this.emit(LayoutEngineEvent.NodeChanged, {node});
		}
	}

	/**
	 * Gets the current viewport size
	 */
	getViewportSize(): Size {
		return {...this.viewportSize};
	}

	/**
	 * Sets the viewport size (e.g., on terminal resize)
	 * @param size - The new viewport size
	 * @param force - Whether to force immediate layout
	 */
	setViewportSize(size: Size, force: boolean = false): void {
		if (
			this.viewportSize.width !== size.width ||
			this.viewportSize.height !== size.height
		) {
			this.viewportSize = {...size};
			this.invalidate();
			this.emit(LayoutEngineEvent.ViewportChanged, {size: this.viewportSize});

			if (force) {
				this.forceLayout();
			}
		}
	}

	/**
	 * Performs layout calculation
	 * @returns The calculation result
	 */
	layout(): CalculationResult {
		if (this.disposed) {
			throw new Error('LayoutEngine has been disposed');
		}

		if (!this.rootNode) {
			return {
				size: {width: 0, height: 0},
				fromCache: false,
				nodesCalculated: 0,
			};
		}

		// If not dirty and layout is valid, return cached result
		if (!this.isDirty && this.rootNode.computedLayout.isValid) {
			return {
				size: this.rootNode.computedLayout.size,
				fromCache: true,
				nodesCalculated: 0,
			};
		}

		this.isCalculating = true;
		this.emit(LayoutEngineEvent.LayoutStarted, {});

		try {
			// Take snapshot for diffing
			this.takeSnapshot();

			// Calculate layout
			const result = this.calculator.calculate(
				this.rootNode,
				this.viewportSize,
				LayoutResolver.resolveConstraints({
					minWidth: 0,
					maxWidth: this.viewportSize.width,
					minHeight: 0,
					maxHeight: this.viewportSize.height,
				}),
			);

			this.isDirty = false;

			// Calculate and emit changes
			const changes = this.calculateChanges();
			if (changes.length > 0) {
				this.emit(LayoutEngineEvent.LayoutCompleted, {result, changes});
			} else {
				this.emit(LayoutEngineEvent.LayoutCompleted, {result});
			}

			return result;
		} finally {
			this.isCalculating = false;
		}
	}

	/**
	 * Invalidates the current layout, marking it for recalculation
	 */
	invalidate(): void {
		if (!this.isDirty) {
			this.isDirty = true;
			this.emit(LayoutEngineEvent.LayoutInvalidated, {});

			// Cancel any pending debounced layout
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
				this.debounceTimer = null;
			}
		}
	}

	/**
	 * Forces immediate layout recalculation
	 * @returns The calculation result
	 */
	forceLayout(): CalculationResult {
		// Cancel any pending debounced layout
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		this.isDirty = true;
		return this.layout();
	}

	/**
	 * Schedules a layout update with debouncing
	 */
	scheduleLayout(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = setTimeout(() => {
			this.debounceTimer = null;
			if (this.isDirty) {
				this.layout();
			}
		}, this.debounceMs);
	}

	/**
	 * Finds a node by ID
	 * @param id - The node ID
	 * @returns The found node, or undefined
	 */
	findNodeById(id: string): LayoutNode | undefined {
		return this.rootNode?.findById(id);
	}

	/**
	 * Gets the computed bounds of a node
	 * @param nodeId - The node ID
	 * @returns The bounds, or null if not found
	 */
	getNodeBounds(nodeId: string): Rect | null {
		const node = this.findNodeById(nodeId);
		if (node?.computedLayout.isValid) {
			return node.bounds;
		}
		return null;
	}

	/**
	 * Gets the absolute position of a node (relative to viewport)
	 * @param nodeId - The node ID
	 * @returns The absolute position, or null if not found
	 */
	getAbsolutePosition(nodeId: string): Position | null {
		const node = this.findNodeById(nodeId);
		if (!node?.computedLayout.isValid) {
			return null;
		}

		let x = node.computedLayout.position.x;
		let y = node.computedLayout.position.y;
		let parent = node.parent;

		while (parent) {
			x += parent.computedLayout.position.x;
			y += parent.computedLayout.position.y;
			parent = parent.parent;
		}

		return {x, y};
	}

	/**
	 * Checks if a point is within a node's bounds
	 * @param nodeId - The node ID
	 * @param point - The point to check
	 * @returns True if the point is within the node
	 */
	hitTest(nodeId: string, point: Position): boolean {
		const bounds = this.getNodeBounds(nodeId);
		const absPos = this.getAbsolutePosition(nodeId);

		if (!bounds || !absPos) {
			return false;
		}

		return (
			point.x >= absPos.x &&
			point.x < absPos.x + bounds.width &&
			point.y >= absPos.y &&
			point.y < absPos.y + bounds.height
		);
	}

	/**
	 * Adds an event listener
	 * @param event - The event type
	 * @param listener - The listener function
	 */
	on(event: LayoutEngineEvent, listener: LayoutEventListener): void {
		const listeners = this.listeners.get(event);
		if (listeners && !listeners.includes(listener)) {
			listeners.push(listener);
		}
	}

	/**
	 * Removes an event listener
	 * @param event - The event type
	 * @param listener - The listener function
	 */
	off(event: LayoutEngineEvent, listener: LayoutEventListener): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		}
	}

	/**
	 * Emits an event
	 * @param event - The event type
	 * @param data - The event data
	 */
	private emit(event: LayoutEngineEvent, data: unknown): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			for (const listener of listeners) {
				try {
					listener(data);
				} catch (error) {
					this.log('Error in event listener:', error);
				}
			}
		}
	}

	/**
	 * Takes a snapshot of the current layout for diffing
	 */
	private takeSnapshot(): void {
		this.lastLayoutSnapshot.clear();

		if (this.rootNode) {
			this.rootNode.traverse(node => {
				if (node.computedLayout.isValid) {
					this.lastLayoutSnapshot.set(node.id, {...node.computedLayout});
				}
			});
		}
	}

	/**
	 * Calculates changes between current and last layout
	 * @returns Array of layout changes
	 */
	private calculateChanges(): LayoutChange[] {
		const changes: LayoutChange[] = [];

		if (!this.rootNode) {
			return changes;
		}

		this.rootNode.traverse(node => {
			if (!node.computedLayout.isValid) {
				return;
			}

			const oldLayout = this.lastLayoutSnapshot.get(node.id);
			if (!oldLayout) {
				// New node
				changes.push({
					nodeId: node.id,
					oldLayout: {
						position: {x: 0, y: 0},
						size: {width: 0, height: 0},
						isValid: false,
						timestamp: 0,
					},
					newLayout: node.computedLayout,
					positionChanged: true,
					sizeChanged: true,
				});
				return;
			}

			const positionChanged =
				oldLayout.position.x !== node.computedLayout.position.x ||
				oldLayout.position.y !== node.computedLayout.position.y;

			const sizeChanged =
				oldLayout.size.width !== node.computedLayout.size.width ||
				oldLayout.size.height !== node.computedLayout.size.height;

			if (positionChanged || sizeChanged) {
				changes.push({
					nodeId: node.id,
					oldLayout,
					newLayout: node.computedLayout,
					positionChanged,
					sizeChanged,
				});
			}
		});

		return changes;
	}

	/**
	 * Gets all nodes with their absolute bounds
	 * @returns Map of node IDs to absolute bounds
	 */
	getAllAbsoluteBounds(): Map<string, Rect> {
		const bounds = new Map<string, Rect>();

		if (!this.rootNode) {
			return bounds;
		}

		const calculateAbsolute = (
			node: LayoutNode,
			parentX: number,
			parentY: number,
		): void => {
			if (!node.computedLayout.isValid) {
				return;
			}

			const absX = parentX + node.computedLayout.position.x;
			const absY = parentY + node.computedLayout.position.y;

			bounds.set(node.id, {
				x: absX,
				y: absY,
				width: node.computedLayout.size.width,
				height: node.computedLayout.size.height,
			});

			for (const child of node.children) {
				calculateAbsolute(child, absX, absY);
			}
		};

		calculateAbsolute(this.rootNode, 0, 0);
		return bounds;
	}

	/**
	 * Clears the layout cache
	 */
	clearCache(): void {
		if (this.rootNode) {
			this.calculator.clearCache(this.rootNode);
		}
	}

	/**
	 * Sets engine options
	 * @param options - New options
	 */
	setOptions(options: Partial<LayoutEngineOptions>): void {
		if (options.enableCache !== undefined) {
			this.calculator.setOptions({enableCache: options.enableCache});
		}
		if (options.debug !== undefined) {
			this.debug = options.debug;
			this.calculator.setOptions({debug: options.debug});
		}
		if (options.debounceMs !== undefined) {
			this.debounceMs = options.debounceMs;
		}
	}

	/**
	 * Checks if the layout is dirty
	 */
	get dirty(): boolean {
		return this.isDirty;
	}

	/**
	 * Checks if layout calculation is in progress
	 */
	get calculating(): boolean {
		return this.isCalculating;
	}

	/**
	 * Disposes the engine and cleans up resources
	 */
	dispose(): void {
		if (this.disposed) {
			return;
		}

		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		this.listeners.clear();
		this.lastLayoutSnapshot.clear();
		this.rootNode = null;
		this.disposed = true;
	}

	/**
	 * Logs debug messages
	 */
	private log(...args: unknown[]): void {
		if (this.debug) {
			console.log('[LayoutEngine]', ...args);
		}
	}

	/**
	 * Creates a row flex container helper
	 * @returns A new row flex container
	 */
	static createRow(): FlexContainer {
		return FlexContainer.row();
	}

	/**
	 * Creates a column flex container helper
	 * @returns A new column flex container
	 */
	static createColumn(): FlexContainer {
		return FlexContainer.column();
	}
}
