/**
 * Flex Container Module
 *
 * Implements the FlexContainer class extending LayoutNode.
 * Provides a complete CSS Flexbox-like layout algorithm with support for:
 * - Flex direction (row, column, reverse variants)
 * - Flex wrap (nowrap, wrap, wrap-reverse)
 * - Justify content (flex-start, flex-end, center, space-between, space-around, space-evenly)
 * - Align items (flex-start, flex-end, center, stretch, baseline)
 * - Align content (flex-start, flex-end, center, stretch, space-between, space-around)
 * - Flex grow, shrink, and basis
 */

import {LayoutNode, type LayoutNodeOptions} from './node';
import type {Size, Position, LayoutConstraints, Rect} from './types';
import {
	FlexDirection,
	FlexWrap,
	JustifyContent,
	AlignItems,
	AlignContent,
	type FlexContainerConfig,
	type FlexItemProperties,
	DEFAULT_FLEX_CONFIG,
	isRowDirection,
	isReverseDirection,
	getMainAxisDimension,
	getCrossAxisDimension,
} from './flex-direction';
import {
	clamp,
	floorLayoutValue,
	resolveDimension,
	getHorizontalPadding,
	getVerticalPadding,
} from './utils';

/**
 * Options for creating a FlexContainer
 */
export interface FlexContainerOptions extends LayoutNodeOptions {
	/** Direction of the main axis */
	direction?: FlexDirection;
	/** Whether items should wrap */
	wrap?: FlexWrap;
	/** Distribution along main axis */
	justifyContent?: JustifyContent;
	/** Alignment along cross axis */
	alignItems?: AlignItems;
	/** Alignment of multiple lines */
	alignContent?: AlignContent;
	/** Gap between items on main axis */
	gap?: number;
	/** Gap between lines on cross axis */
	rowGap?: number;
}

/**
 * Represents a line of flex items in a wrapped layout
 */
interface FlexLine {
	/** Items in this line */
	items: LayoutNode[];
	/** Total flex grow of items in this line */
	totalFlexGrow: number;
	/** Total flex shrink of items in this line */
	totalFlexShrink: number;
	/** Total base size of items in this line */
	totalBaseSize: number;
	/** Cross axis size of this line */
	crossAxisSize: number;
}

/**
 * Flex container that arranges children according to flexbox rules
 */
export class FlexContainer extends LayoutNode {
	/** Flex container configuration */
	config: FlexContainerConfig;

	/** Gap between items on main axis */
	gap: number;

	/** Gap between lines on cross axis */
	rowGap: number;

	/**
	 * Creates a new FlexContainer
	 * @param options - Container configuration options
	 */
	constructor(options: FlexContainerOptions = {}) {
		super(options);

		this.config = {
			direction: options.direction ?? DEFAULT_FLEX_CONFIG.direction,
			wrap: options.wrap ?? DEFAULT_FLEX_CONFIG.wrap,
			justifyContent:
				options.justifyContent ?? DEFAULT_FLEX_CONFIG.justifyContent,
			alignItems: options.alignItems ?? DEFAULT_FLEX_CONFIG.alignItems,
			alignContent: options.alignContent ?? DEFAULT_FLEX_CONFIG.alignContent,
		};

		this.gap = options.gap ?? 0;
		this.rowGap = options.rowGap ?? 0;
	}

	/**
	 * Gets whether this container uses row direction
	 */
	get isRowDirection(): boolean {
		return isRowDirection(this.config.direction);
	}

	/**
	 * Gets whether this container uses reverse direction
	 */
	get isReverse(): boolean {
		return isReverseDirection(this.config.direction);
	}

	/**
	 * Calculates the layout for this flex container and its children
	 * @param availableSize - The available size for this container
	 * @returns The computed size
	 */
	calculateLayout(availableSize: Size): Size {
		// Account for padding
		const innerWidth = Math.max(
			0,
			availableSize.width - getHorizontalPadding(this.padding),
		);
		const innerHeight = Math.max(
			0,
			availableSize.height - getVerticalPadding(this.padding),
		);
		const innerSize: Size = {width: innerWidth, height: innerHeight};

		// Get visible children
		const visibleChildren = this.children.filter(child => child.visible);

		if (visibleChildren.length === 0) {
			// No children, return minimum size
			const finalSize = this.resolveFixedSize(innerSize);
			this.setComputedLayout({x: 0, y: 0}, finalSize);
			return finalSize;
		}

		// Determine main and cross axis dimensions
		const mainAxis = getMainAxisDimension(this.config.direction);
		const crossAxis = getCrossAxisDimension(this.config.direction);

		// Calculate flex lines
		const lines = this.calculateFlexLines(visibleChildren, innerSize, mainAxis);

		// Calculate main axis layout for each line
		this.calculateMainAxisLayout(lines, innerSize, mainAxis);

		// Calculate cross axis layout
		const totalCrossSize = this.calculateCrossAxisLayout(
			lines,
			innerSize,
			crossAxis,
		);

		// Calculate container size
		const containerSize = this.calculateContainerSize(
			innerSize,
			lines,
			mainAxis,
			totalCrossSize,
		);

		// Set the computed layout for this container
		this.setComputedLayout({x: 0, y: 0}, containerSize);

		return containerSize;
	}

	/**
	 * Calculates flex lines based on wrapping
	 * @param children - The visible children
	 * @param availableSize - Available inner size
	 * @param mainAxis - The main axis dimension
	 * @returns Array of flex lines
	 */
	private calculateFlexLines(
		children: readonly LayoutNode[],
		availableSize: Size,
		mainAxis: 'width' | 'height',
	): FlexLine[] {
		const lines: FlexLine[] = [];
		const mainAxisSize = availableSize[mainAxis];
		const noWrap = this.config.wrap === FlexWrap.NoWrap;

		let currentLine: FlexLine = {
			items: [],
			totalFlexGrow: 0,
			totalFlexShrink: 0,
			totalBaseSize: 0,
			crossAxisSize: 0,
		};

		let currentLineSize = 0;

		for (const child of children) {
			const childMainSize = this.calculateFlexBaseSize(
				child,
				availableSize,
				mainAxis,
			);
			const childCrossSize = this.calculateCrossAxisBaseSize(
				child,
				availableSize,
				mainAxis,
			);

			// Check if we need to wrap
			const needsWrap =
				!noWrap &&
				currentLine.items.length > 0 &&
				currentLineSize + this.gap + childMainSize > mainAxisSize;

			if (needsWrap) {
				// Finalize current line
				lines.push(currentLine);

				// Start new line
				currentLine = {
					items: [],
					totalFlexGrow: 0,
					totalFlexShrink: 0,
					totalBaseSize: 0,
					crossAxisSize: 0,
				};
				currentLineSize = 0;
			}

			// Add child to current line
			currentLine.items.push(child);
			currentLine.totalFlexGrow += child.flex.flexGrow;
			currentLine.totalFlexShrink += child.flex.flexShrink;
			currentLine.totalBaseSize += childMainSize;
			currentLine.crossAxisSize = Math.max(
				currentLine.crossAxisSize,
				childCrossSize,
			);

			currentLineSize +=
				(currentLine.items.length > 1 ? this.gap : 0) + childMainSize;
		}

		// Add final line
		if (currentLine.items.length > 0) {
			lines.push(currentLine);
		}

		return lines;
	}

	/**
	 * Calculates the flex base size for a child
	 * @param child - The child node
	 * @param availableSize - Available size
	 * @param mainAxis - The main axis dimension
	 * @returns The base size
	 */
	private calculateFlexBaseSize(
		child: LayoutNode,
		availableSize: Size,
		mainAxis: 'width' | 'height',
	): number {
		const dimension = mainAxis === 'width' ? child.width : child.height;

		if (dimension === 'auto') {
			// Use flex basis if auto
			if (child.flex.flexBasis !== 'auto') {
				return child.flex.flexBasis;
			}
			// Otherwise use content size (assume 0 for now, could be measured)
			return 0;
		}

		const resolved = resolveDimension(dimension, availableSize[mainAxis]);
		return resolved ?? 0;
	}

	/**
	 * Calculates the cross axis base size for a child
	 * @param child - The child node
	 * @param availableSize - Available size
	 * @param mainAxis - The main axis dimension
	 * @returns The cross axis base size
	 */
	private calculateCrossAxisBaseSize(
		child: LayoutNode,
		availableSize: Size,
		mainAxis: 'width' | 'height',
	): number {
		const crossAxis = mainAxis === 'width' ? 'height' : 'width';
		const dimension = crossAxis === 'width' ? child.width : child.height;

		if (dimension === 'auto') {
			return 0;
		}

		const resolved = resolveDimension(dimension, availableSize[crossAxis]);
		return resolved ?? 0;
	}

	/**
	 * Calculates main axis layout for each line
	 * @param lines - The flex lines
	 * @param availableSize - Available inner size
	 * @param mainAxis - The main axis dimension
	 */
	private calculateMainAxisLayout(
		lines: FlexLine[],
		availableSize: Size,
		mainAxis: 'width' | 'height',
	): void {
		const mainAxisSize = availableSize[mainAxis];

		for (const line of lines) {
			const totalGap = (line.items.length - 1) * this.gap;
			const remainingSpace = mainAxisSize - line.totalBaseSize - totalGap;

			if (remainingSpace > 0 && line.totalFlexGrow > 0) {
				// Distribute extra space based on flex grow
				this.distributeGrowSpace(line, remainingSpace, mainAxis);
			} else if (remainingSpace < 0 && line.totalFlexShrink > 0) {
				// Distribute shrink space based on flex shrink
				this.distributeShrinkSpace(line, -remainingSpace, mainAxis);
			} else {
				// No flex distribution needed, apply justify content
				this.applyJustifyContent(line, remainingSpace, mainAxis);
			}
		}
	}

	/**
	 * Distributes grow space among items in a line
	 * @param line - The flex line
	 * @param growSpace - Space to distribute
	 * @param mainAxis - The main axis dimension
	 */
	private distributeGrowSpace(
		line: FlexLine,
		growSpace: number,
		mainAxis: 'width' | 'height',
	): void {
		const growPerUnit = growSpace / line.totalFlexGrow;

		for (const item of line.items) {
			const baseSize = this.calculateFlexBaseSize(
				item,
				{width: 0, height: 0},
				mainAxis,
			);
			const growAmount = item.flex.flexGrow * growPerUnit;
			const finalSize = floorLayoutValue(baseSize + growAmount);

			// Store the computed size temporarily
			(item as unknown as Record<string, number>)[
				`_computed${mainAxis === 'width' ? 'Width' : 'Height'}`
			] = finalSize;
		}
	}

	/**
	 * Distributes shrink space among items in a line
	 * @param line - The flex line
	 * @param shrinkSpace - Space to remove
	 * @param mainAxis - The main axis dimension
	 */
	private distributeShrinkSpace(
		line: FlexLine,
		shrinkSpace: number,
		mainAxis: 'width' | 'height',
	): void {
		// Calculate total shrink factor weighted by base size
		let totalWeightedShrink = 0;
		for (const item of line.items) {
			const baseSize = this.calculateFlexBaseSize(
				item,
				{width: 0, height: 0},
				mainAxis,
			);
			totalWeightedShrink += item.flex.flexShrink * baseSize;
		}

		for (const item of line.items) {
			const baseSize = this.calculateFlexBaseSize(
				item,
				{width: 0, height: 0},
				mainAxis,
			);
			const weightedShrink = item.flex.flexShrink * baseSize;
			const shrinkRatio =
				totalWeightedShrink > 0 ? weightedShrink / totalWeightedShrink : 0;
			const shrinkAmount = shrinkSpace * shrinkRatio;
			const finalSize = floorLayoutValue(Math.max(0, baseSize - shrinkAmount));

			// Store the computed size temporarily
			(item as unknown as Record<string, number>)[
				`_computed${mainAxis === 'width' ? 'Width' : 'Height'}`
			] = finalSize;
		}
	}

	/**
	 * Applies justify content alignment to a line
	 * @param line - The flex line
	 * @param remainingSpace - Available space
	 * @param mainAxis - The main axis dimension
	 */
	private applyJustifyContent(
		line: FlexLine,
		remainingSpace: number,
		mainAxis: 'width' | 'height',
	): void {
		const justify = this.config.justifyContent;
		const itemCount = line.items.length;

		let startOffset = 0;
		let spaceBetween = 0;

		switch (justify) {
			case JustifyContent.FlexStart:
				startOffset = 0;
				break;
			case JustifyContent.FlexEnd:
				startOffset = remainingSpace;
				break;
			case JustifyContent.Center:
				startOffset = remainingSpace / 2;
				break;
			case JustifyContent.SpaceBetween:
				startOffset = 0;
				spaceBetween = itemCount > 1 ? remainingSpace / (itemCount - 1) : 0;
				break;
			case JustifyContent.SpaceAround:
				spaceBetween = itemCount > 0 ? remainingSpace / itemCount : 0;
				startOffset = spaceBetween / 2;
				break;
			case JustifyContent.SpaceEvenly:
				spaceBetween = itemCount > 0 ? remainingSpace / (itemCount + 1) : 0;
				startOffset = spaceBetween;
				break;
		}

		// Apply computed sizes and positions
		let currentPosition = startOffset;

		for (let i = 0; i < line.items.length; i++) {
			const item = line.items[i];
			const baseSize = this.calculateFlexBaseSize(
				item,
				{width: 0, height: 0},
				mainAxis,
			);
			const finalSize = floorLayoutValue(baseSize);

			// Store the computed size and position temporarily
			(item as unknown as Record<string, number>)[
				`_computed${mainAxis === 'width' ? 'Width' : 'Height'}`
			] = finalSize;
			(item as unknown as Record<string, number>)[
				`_computed${mainAxis === 'width' ? 'X' : 'Y'}`
			] = currentPosition;

			currentPosition += finalSize + this.gap + spaceBetween;
		}
	}

	/**
	 * Calculates cross axis layout for all lines
	 * @param lines - The flex lines
	 * @param availableSize - Available inner size
	 * @param crossAxis - The cross axis dimension
	 * @returns Total cross axis size
	 */
	private calculateCrossAxisLayout(
		lines: FlexLine[],
		availableSize: Size,
		crossAxis: 'width' | 'height',
	): number {
		const crossAxisSize = availableSize[crossAxis];
		const totalLineSizes =
			lines.reduce((sum, line) => sum + line.crossAxisSize, 0) +
			(lines.length - 1) * this.rowGap;

		// Calculate line positions based on align content
		let lineStartOffset = 0;
		let lineSpaceBetween = 0;

		switch (this.config.alignContent) {
			case AlignContent.FlexStart:
				lineStartOffset = 0;
				break;
			case AlignContent.FlexEnd:
				lineStartOffset = crossAxisSize - totalLineSizes;
				break;
			case AlignContent.Center:
				lineStartOffset = (crossAxisSize - totalLineSizes) / 2;
				break;
			case AlignContent.SpaceBetween:
				lineSpaceBetween =
					lines.length > 1
						? (crossAxisSize - totalLineSizes) / (lines.length - 1)
						: 0;
				break;
			case AlignContent.SpaceAround:
				lineSpaceBetween =
					lines.length > 0
						? (crossAxisSize - totalLineSizes) / lines.length
						: 0;
				lineStartOffset = lineSpaceBetween / 2;
				break;
			case AlignContent.Stretch:
				// Stretch lines to fill available space
				lineStartOffset = 0;
				break;
		}

		let currentLinePosition = lineStartOffset;

		for (const line of lines) {
			const lineHeight =
				this.config.alignContent === AlignContent.Stretch && lines.length === 1
					? crossAxisSize
					: line.crossAxisSize;

			// Position items within the line
			for (const item of line.items) {
				const itemCrossSize = this.calculateCrossAxisBaseSize(
					item,
					availableSize,
					crossAxis === 'height' ? 'width' : 'height',
				);
				const align =
					item.flex.alignSelf !== 'auto'
						? item.flex.alignSelf
						: this.config.alignItems;

				let crossPosition = 0;

				switch (align) {
					case AlignItems.FlexStart:
						crossPosition = 0;
						break;
					case AlignItems.FlexEnd:
						crossPosition = lineHeight - itemCrossSize;
						break;
					case AlignItems.Center:
						crossPosition = (lineHeight - itemCrossSize) / 2;
						break;
					case AlignItems.Stretch:
						crossPosition = 0;
						// Update the cross axis size to fill the line
						(item as unknown as Record<string, number>)[
							`_computed${crossAxis === 'width' ? 'Width' : 'Height'}`
						] = lineHeight;
						break;
					case AlignItems.Baseline:
						// Baseline alignment - treat as flex-start for now
						crossPosition = 0;
						break;
				}

				// Store the cross axis position
				(item as unknown as Record<string, number>)[
					`_computed${crossAxis === 'width' ? 'X' : 'Y'}`
				] = currentLinePosition + crossPosition;

				// Apply final computed layout to the child
				const computedWidth =
					(item as unknown as Record<string, number>)[`_computedWidth`] ??
					itemCrossSize;
				const computedHeight =
					(item as unknown as Record<string, number>)[`_computedHeight`] ??
					itemCrossSize;
				const computedX =
					(item as unknown as Record<string, number>)[`_computedX`] ?? 0;
				const computedY =
					(item as unknown as Record<string, number>)[`_computedY`] ?? 0;

				item.setComputedLayout(
					{x: computedX, y: computedY},
					{width: computedWidth, height: computedHeight},
				);
			}

			currentLinePosition += lineHeight + this.rowGap + lineSpaceBetween;
		}

		return totalLineSizes;
	}

	/**
	 * Calculates the final container size
	 * @param availableSize - Available inner size
	 * @param lines - The flex lines
	 * @param mainAxis - The main axis dimension
	 * @param totalCrossSize - Total cross axis size
	 * @returns The container size
	 */
	private calculateContainerSize(
		availableSize: Size,
		lines: FlexLine[],
		mainAxis: 'width' | 'height',
		totalCrossSize: number,
	): Size {
		// Calculate main axis size
		let mainAxisSize = 0;
		if (lines.length > 0) {
			const lastLine = lines[lines.length - 1];
			const lastItem = lastLine.items[lastLine.items.length - 1];
			if (lastItem) {
				const lastItemPos = lastItem.computedLayout.position;
				const lastItemSize = lastItem.computedLayout.size;
				mainAxisSize =
					mainAxis === 'width'
						? lastItemPos.x + lastItemSize.width
						: lastItemPos.y + lastItemSize.height;
			}
		}

		// Resolve fixed dimensions
		const resolvedSize = this.resolveFixedSize(availableSize);

		if (mainAxis === 'width') {
			return {
				width:
					resolvedSize.width > 0
						? resolvedSize.width
						: Math.min(mainAxisSize, availableSize.width),
				height:
					resolvedSize.height > 0
						? resolvedSize.height
						: Math.min(totalCrossSize, availableSize.height),
			};
		} else {
			return {
				width:
					resolvedSize.width > 0
						? resolvedSize.width
						: Math.min(totalCrossSize, availableSize.width),
				height:
					resolvedSize.height > 0
						? resolvedSize.height
						: Math.min(mainAxisSize, availableSize.height),
			};
		}
	}

	/**
	 * Resolves fixed dimensions from options
	 * @param availableSize - Available size for percentage calculations
	 * @returns The resolved fixed size
	 */
	private resolveFixedSize(availableSize: Size): Size {
		const width = resolveDimension(this.width, availableSize.width);
		const height = resolveDimension(this.height, availableSize.height);

		return {
			width: width ?? 0,
			height: height ?? 0,
		};
	}

	/**
	 * Sets the flex direction
	 * @param direction - The new direction
	 */
	setDirection(direction: FlexDirection): void {
		if (this.config.direction !== direction) {
			this.config.direction = direction;
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the flex wrap
	 * @param wrap - The new wrap mode
	 */
	setWrap(wrap: FlexWrap): void {
		if (this.config.wrap !== wrap) {
			this.config.wrap = wrap;
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the justify content
	 * @param justifyContent - The new justify content
	 */
	setJustifyContent(justifyContent: JustifyContent): void {
		if (this.config.justifyContent !== justifyContent) {
			this.config.justifyContent = justifyContent;
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the align items
	 * @param alignItems - The new align items
	 */
	setAlignItems(alignItems: AlignItems): void {
		if (this.config.alignItems !== alignItems) {
			this.config.alignItems = alignItems;
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the align content
	 * @param alignContent - The new align content
	 */
	setAlignContent(alignContent: AlignContent): void {
		if (this.config.alignContent !== alignContent) {
			this.config.alignContent = alignContent;
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the gap between items
	 * @param gap - The new gap
	 */
	setGap(gap: number): void {
		if (this.gap !== gap) {
			this.gap = clamp(gap, 0, Infinity);
			this.invalidateLayout();
		}
	}

	/**
	 * Sets the row gap
	 * @param rowGap - The new row gap
	 */
	setRowGap(rowGap: number): void {
		if (this.rowGap !== rowGap) {
			this.rowGap = clamp(rowGap, 0, Infinity);
			this.invalidateLayout();
		}
	}

	/**
	 * Creates a row flex container
	 * @param options - Container options
	 * @returns A new row flex container
	 */
	static row(
		options: Omit<FlexContainerOptions, 'direction'> = {},
	): FlexContainer {
		return new FlexContainer({...options, direction: FlexDirection.Row});
	}

	/**
	 * Creates a column flex container
	 * @param options - Container options
	 * @returns A new column flex container
	 */
	static column(
		options: Omit<FlexContainerOptions, 'direction'> = {},
	): FlexContainer {
		return new FlexContainer({...options, direction: FlexDirection.Column});
	}
}
