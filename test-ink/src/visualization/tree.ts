/**
 * Tree View Widget Module
 *
 * Provides the TreeViewWidget class for displaying hierarchical data.
 * Supports expandable/collapsible nodes and keyboard navigation.
 *
 * @module visualization/tree
 */

import {BaseWidget} from '../widgets/base.js';
import type {WidgetProps} from '../widgets/types.js';
import {Canvas} from './canvas.js';
import type {TreeNode, ChartTheme, ChartPadding} from './types.js';
import {DEFAULT_CHART_THEME, DEFAULT_PADDING} from './types.js';

/**
 * Tree view widget props
 */
export interface TreeViewProps extends WidgetProps {
	/** Tree nodes */
	nodes: TreeNode[];

	/** Whether to show icons */
	showIcons?: boolean;

	/** Chart theme */
	theme?: ChartTheme;

	/** Chart padding */
	padding?: ChartPadding;

	/** On select callback */
	onSelect?: (node: TreeNode) => void;

	/** Currently selected node ID */
	selectedNodeId?: string;
}

/**
 * Tree view widget for displaying hierarchical data
 */
export class TreeViewWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'tree-view';

	/** Default props */
	static defaultProps = {
		...BaseWidget.defaultProps,
		showIcons: true,
	};

	/** Current props */
	private _treeProps: Required<TreeViewProps>;

	/** Canvas for drawing */
	private canvas: Canvas | null = null;

	/** Tree area */
	private treeArea: any = {x: 0, y: 0, width: 0, height: 0};

	/** Scroll offset */
	private scrollOffset: number = 0;

	/** Flattened visible nodes */
	private visibleNodes: {node: TreeNode; depth: number}[] = [];

	/**
	 * Create a new tree view widget
	 *
	 * @param props - Widget props
	 */
	constructor(props: TreeViewProps) {
		super(props);
		this._treeProps = {
			...TreeViewWidget.defaultProps,
			...props,
			theme: props.theme ?? DEFAULT_CHART_THEME,
			padding: props.padding ?? DEFAULT_PADDING,
		} as Required<TreeViewProps>;
	}

	/**
	 * Get tree props
	 */
	get treeProps(): Required<TreeViewProps> {
		return {...this._treeProps};
	}

	/**
	 * Update tree props
	 *
	 * @param props - New props
	 */
	updateTreeProps(props: Partial<TreeViewProps>): void {
		this._treeProps = {
			...this._treeProps,
			...props,
		};
	}

	/**
	 * Render the widget
	 */
	render(context: any): void {
		if (!this.layoutNode) {
			return;
		}

		const rect = this.layoutNode.bounds;
		const {theme, padding} = this._treeProps;

		// Get screen buffer from context
		const buffer = context.layoutNode?.buffer;
		if (!buffer) {
			return;
		}

		// Create canvas
		this.canvas = new Canvas(buffer, rect);

		// Clear canvas
		this.canvas.clear(rect, theme.background);

		// Calculate tree area
		this.calculateTreeArea(rect, padding);

		// Flatten visible nodes
		this.flattenVisibleNodes();

		// Draw tree
		this.drawTree();
	}

	/**
	 * Calculate tree area
	 */
	private calculateTreeArea(rect: any, padding: ChartPadding): void {
		this.treeArea = {
			x: rect.x + padding.left,
			y: rect.y + padding.top,
			width: rect.width - padding.left - padding.right,
			height: rect.height - padding.top - padding.bottom,
		};
	}

	/**
	 * Flatten visible nodes
	 */
	private flattenVisibleNodes(): void {
		this.visibleNodes = [];

		const traverse = (nodes: TreeNode[], depth: number) => {
			for (const node of nodes) {
				this.visibleNodes.push({node, depth});

				if (node.expanded && node.children && node.children.length > 0) {
					traverse(node.children, depth + 1);
				}
			}
		};

		traverse(this._treeProps.nodes, 0);
	}

	/**
	 * Draw tree
	 */
	private drawTree(): void {
		if (!this.canvas) {
			return;
		}

		const {theme, showIcons, selectedNodeId} = this._treeProps;
		const {x, y, height} = this.treeArea;

		// Calculate visible nodes
		const visibleRowCount = height;
		const startNode = this.scrollOffset;
		const endNode = Math.min(startNode + visibleRowCount, this.visibleNodes.length);

		// Draw nodes
		for (let i = startNode; i < endNode; i++) {
			const {node, depth} = this.visibleNodes[i];
			const nodeY = y + (i - startNode);

			// Check if node is selected
			const isSelected = selectedNodeId === node.id;

			// Draw node background if selected
			if (isSelected) {
				this.canvas.setContext({
					fg: theme.textColor,
					bg: theme.colors[0],
					styles: {},
				});
				this.canvas.fill(x, nodeY, this.treeArea.width, 1, ' ', theme.textColor, theme.colors[0]);
			}

			// Draw indentation
			const indent = depth * 2;

			// Draw expand/collapse indicator
			if (node.children && node.children.length > 0) {
				const indicator = node.expanded ? '▼' : '▶';
				this.canvas.setContext({
					fg: isSelected ? 'white' : theme.textColor,
					bg: isSelected ? theme.colors[0] : 'default',
					styles: {},
				});
				this.canvas.drawText(x + indent, nodeY, indicator, isSelected ? 'white' : theme.textColor);
			}

			// Draw icon
			if (showIcons && node.icon) {
				this.canvas.setContext({
					fg: isSelected ? 'white' : theme.textColor,
					bg: isSelected ? theme.colors[0] : 'default',
					styles: {},
				});
				this.canvas.drawText(x + indent + 2, nodeY, node.icon, isSelected ? 'white' : theme.textColor);
			}

			// Draw label
			const labelX = x + indent + (showIcons ? 4 : 2);
			this.canvas.setContext({
				fg: isSelected ? 'white' : theme.textColor,
				bg: isSelected ? theme.colors[0] : 'default',
				styles: node.disabled ? {dim: true} : {},
			});
			this.canvas.drawText(labelX, nodeY, node.label, isSelected ? 'white' : theme.textColor);
		}
	}

	/**
	 * Toggle node expansion
	 *
	 * @param nodeId - Node ID to toggle
	 */
	toggleNode(nodeId: string): void {
		const toggleRecursive = (nodes: TreeNode[]): boolean => {
			for (const node of nodes) {
				if (node.id === nodeId) {
					node.expanded = !node.expanded;
					return true;
				}
				if (node.children && toggleRecursive(node.children)) {
					return true;
				}
			}
			return false;
		};

		toggleRecursive(this._treeProps.nodes);
	}

	/**
	 * Select a node
	 *
	 * @param nodeId - Node ID to select
	 */
	selectNode(nodeId: string): void {
		this._treeProps.selectedNodeId = nodeId;

		// Find and call onSelect callback
		const findNode = (nodes: TreeNode[]): TreeNode | null => {
			for (const node of nodes) {
				if (node.id === nodeId) {
					return node;
				}
				if (node.children) {
					const found = findNode(node.children);
					if (found) {
						return found;
					}
				}
			}
			return null;
		};

		const node = findNode(this._treeProps.nodes);
		if (node && this._treeProps.onSelect) {
			this._treeProps.onSelect(node);
		}
	}

	/**
	 * Expand all nodes
	 */
	expandAll(): void {
		const expandRecursive = (nodes: TreeNode[]) => {
			for (const node of nodes) {
				node.expanded = true;
				if (node.children) {
					expandRecursive(node.children);
				}
			}
		};

		expandRecursive(this._treeProps.nodes);
	}

	/**
	 * Collapse all nodes
	 */
	collapseAll(): void {
		const collapseRecursive = (nodes: TreeNode[]) => {
			for (const node of nodes) {
				node.expanded = false;
				if (node.children) {
					collapseRecursive(node.children);
				}
			}
		};

		collapseRecursive(this._treeProps.nodes);
	}

	/**
	 * Scroll to node
	 *
	 * @param offset - Scroll offset
	 */
	scrollTo(offset: number): void {
		this.scrollOffset = Math.max(0, Math.min(offset, Math.max(0, this.visibleNodes.length - this.treeArea.height)));
	}
}
