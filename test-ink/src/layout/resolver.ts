/**
 * Layout Resolver Module
 *
 * Defines the LayoutResolver class for resolving layout constraints.
 * Handles min/max constraints, percentage-based dimensions, flex properties,
 * and over-constrained layouts.
 */

import type {Size, LayoutConstraints, Dimension, EdgeInsets} from './types';
import {resolveDimension, clamp, floorLayoutValue} from './utils';

/**
 * Resolved size with constraint information
 */
export interface ResolvedSize {
	/** The resolved width */
	width: number;
	/** The resolved height */
	height: number;
	/** Whether width was constrained */
	widthConstrained: boolean;
	/** Whether height was constrained */
	heightConstrained: boolean;
}

/**
 * Resolution context for percentage calculations
 */
export interface ResolutionContext {
	/** Available width for percentage calculations */
	containerWidth: number;
	/** Available height for percentage calculations */
	containerHeight: number;
	/** Parent constraints to respect */
	parentConstraints?: LayoutConstraints;
}

/**
 * Resolves layout constraints and dimensions
 */
export class LayoutResolver {
	/**
	 * Resolves a dimension value considering constraints
	 * @param dimension - The dimension to resolve (number, percentage, or 'auto')
	 * @param containerSize - The container size for percentage calculations
	 * @param constraints - The constraints to apply
	 * @param dimensionType - Which dimension is being resolved ('width' or 'height')
	 * @returns The resolved dimension value
	 */
	static resolveDimension(
		dimension: Dimension,
		containerSize: number,
		constraints: Pick<
			LayoutConstraints,
			'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'
		>,
		dimensionType: 'width' | 'height',
	): number {
		const minDimension =
			dimensionType === 'width' ? constraints.minWidth : constraints.minHeight;
		const maxDimension =
			dimensionType === 'width' ? constraints.maxWidth : constraints.maxHeight;

		let resolved: number;

		if (dimension === 'auto') {
			// Auto sizing - use constraints as bounds
			resolved = clamp(containerSize, minDimension, maxDimension);
		} else if (typeof dimension === 'string') {
			// Percentage or other string value
			const parsed = resolveDimension(dimension, containerSize);
			if (parsed !== null) {
				resolved = clamp(parsed, minDimension, maxDimension);
			} else {
				resolved = clamp(containerSize, minDimension, maxDimension);
			}
		} else {
			// Fixed number value
			resolved = clamp(dimension, minDimension, maxDimension);
		}

		return floorLayoutValue(resolved);
	}

	/**
	 * Resolves both width and height dimensions
	 * @param width - The width dimension
	 * @param height - The height dimension
	 * @param context - The resolution context
	 * @param constraints - The constraints to apply
	 * @returns The resolved size
	 */
	static resolveSize(
		width: Dimension,
		height: Dimension,
		context: ResolutionContext,
		constraints: LayoutConstraints,
	): ResolvedSize {
		const resolvedWidth = this.resolveDimension(
			width,
			context.containerWidth,
			{
				minWidth: constraints.minWidth,
				maxWidth: constraints.maxWidth,
				minHeight: 0,
				maxHeight: Infinity,
			},
			'width',
		);

		const resolvedHeight = this.resolveDimension(
			height,
			context.containerHeight,
			{
				minWidth: 0,
				maxWidth: Infinity,
				minHeight: constraints.minHeight,
				maxHeight: constraints.maxHeight,
			},
			'height',
		);

		return {
			width: resolvedWidth,
			height: resolvedHeight,
			widthConstrained: resolvedWidth !== context.containerWidth,
			heightConstrained: resolvedHeight !== context.containerHeight,
		};
	}

	/**
	 * Resolves constraints by ensuring min <= max
	 * @param constraints - The constraints to resolve
	 * @returns Normalized constraints
	 */
	static resolveConstraints(constraints: LayoutConstraints): LayoutConstraints {
		return {
			minWidth: Math.max(0, constraints.minWidth),
			maxWidth: Math.max(constraints.minWidth, constraints.maxWidth),
			minHeight: Math.max(0, constraints.minHeight),
			maxHeight: Math.max(constraints.minHeight, constraints.maxHeight),
		};
	}

	/**
	 * Resolves flex properties for a set of items
	 * @param items - The items with flex properties
	 * @param availableSpace - Available space to distribute
	 * @returns Array of resolved sizes for each item
	 */
	static resolveFlexSizes(
		items: Array<{
			flexGrow: number;
			flexShrink: number;
			flexBasis: number | 'auto';
			baseSize: number;
		}>,
		availableSpace: number,
	): number[] {
		const itemCount = items.length;
		if (itemCount === 0) {
			return [];
		}

		// Calculate total base sizes
		const baseSizes = items.map(item =>
			item.flexBasis !== 'auto' ? item.flexBasis : item.baseSize,
		);

		const totalBaseSize = baseSizes.reduce((sum, size) => sum + size, 0);
		const remainingSpace = availableSpace - totalBaseSize;

		if (remainingSpace > 0) {
			// Distribute grow space
			return this.distributeGrow(items, baseSizes, remainingSpace);
		} else if (remainingSpace < 0) {
			// Distribute shrink space
			return this.distributeShrink(items, baseSizes, -remainingSpace);
		}

		// No distribution needed
		return baseSizes;
	}

	/**
	 * Distributes grow space among items
	 * @param items - The flex items
	 * @param baseSizes - The base sizes
	 * @param growSpace - Space to distribute
	 * @returns Array of final sizes
	 */
	private static distributeGrow(
		items: Array<{flexGrow: number}>,
		baseSizes: number[],
		growSpace: number,
	): number[] {
		const totalGrow = items.reduce((sum, item) => sum + item.flexGrow, 0);

		if (totalGrow === 0) {
			return baseSizes;
		}

		const growPerUnit = growSpace / totalGrow;

		return items.map((item, index) => {
			const growAmount = item.flexGrow * growPerUnit;
			return floorLayoutValue(baseSizes[index] + growAmount);
		});
	}

	/**
	 * Distributes shrink space among items
	 * @param items - The flex items
	 * @param baseSizes - The base sizes
	 * @param shrinkSpace - Space to remove
	 * @returns Array of final sizes
	 */
	private static distributeShrink(
		items: Array<{flexShrink: number}>,
		baseSizes: number[],
		shrinkSpace: number,
	): number[] {
		// Calculate weighted shrink factors
		const weightedShrinks = items.map(
			(item, index) => item.flexShrink * baseSizes[index],
		);
		const totalWeightedShrink = weightedShrinks.reduce(
			(sum, ws) => sum + ws,
			0,
		);

		if (totalWeightedShrink === 0) {
			return baseSizes;
		}

		return items.map((item, index) => {
			const shrinkRatio = weightedShrinks[index] / totalWeightedShrink;
			const shrinkAmount = shrinkSpace * shrinkRatio;
			return floorLayoutValue(Math.max(0, baseSizes[index] - shrinkAmount));
		});
	}

	/**
	 * Resolves percentage-based dimensions
	 * @param percentage - The percentage value (0-100)
	 * @param containerSize - The container size
	 * @param constraints - Constraints to apply
	 * @returns The resolved size
	 */
	static resolvePercentage(
		percentage: number,
		containerSize: number,
		constraints: {min: number; max: number},
	): number {
		const value = (percentage / 100) * containerSize;
		return floorLayoutValue(clamp(value, constraints.min, constraints.max));
	}

	/**
	 * Resolves edge insets with percentage support
	 * @param insets - The edge insets (can contain percentage strings)
	 * @param containerWidth - Container width for horizontal percentages
	 * @param containerHeight - Container height for vertical percentages
	 * @returns Resolved edge insets with numeric values
	 */
	static resolveEdgeInsets(
		insets: {
			top: number | string;
			right: number | string;
			bottom: number | string;
			left: number | string;
		},
		containerWidth: number,
		containerHeight: number,
	): EdgeInsets {
		const resolveInset = (
			value: number | string,
			containerSize: number,
		): number => {
			if (typeof value === 'number') {
				return value;
			}
			const resolved = resolveDimension(value, containerSize);
			return resolved ?? 0;
		};

		return {
			top: resolveInset(insets.top, containerHeight),
			right: resolveInset(insets.right, containerWidth),
			bottom: resolveInset(insets.bottom, containerHeight),
			left: resolveInset(insets.left, containerWidth),
		};
	}

	/**
	 * Handles over-constrained layouts by prioritizing constraints
	 * @param desiredSize - The desired size
	 * @param constraints - The constraints
	 * @returns The resolved size respecting constraints
	 */
	static resolveOverConstrained(
		desiredSize: Size,
		constraints: LayoutConstraints,
	): Size {
		// Priority: min constraints > max constraints > desired size
		let width = desiredSize.width;
		let height = desiredSize.height;

		// Apply min constraints (highest priority)
		width = Math.max(width, constraints.minWidth);
		height = Math.max(height, constraints.minHeight);

		// Apply max constraints
		width = Math.min(width, constraints.maxWidth);
		height = Math.min(height, constraints.maxHeight);

		// Handle the case where min > max (shouldn't happen with normalized constraints)
		width = Math.max(width, constraints.minWidth);
		height = Math.max(height, constraints.minHeight);

		return {
			width: floorLayoutValue(width),
			height: floorLayoutValue(height),
		};
	}

	/**
	 * Merges two constraint sets, taking the most restrictive
	 * @param constraints1 - First constraint set
	 * @param constraints2 - Second constraint set
	 * @returns Merged constraints
	 */
	static mergeConstraints(
		constraints1: LayoutConstraints,
		constraints2: LayoutConstraints,
	): LayoutConstraints {
		return {
			minWidth: Math.max(constraints1.minWidth, constraints2.minWidth),
			maxWidth: Math.min(constraints1.maxWidth, constraints2.maxWidth),
			minHeight: Math.max(constraints1.minHeight, constraints2.minHeight),
			maxHeight: Math.min(constraints1.maxHeight, constraints2.maxHeight),
		};
	}

	/**
	 * Checks if a size satisfies the given constraints
	 * @param size - The size to check
	 * @param constraints - The constraints
	 * @returns True if the size satisfies all constraints
	 */
	static satisfiesConstraints(
		size: Size,
		constraints: LayoutConstraints,
	): boolean {
		return (
			size.width >= constraints.minWidth &&
			size.width <= constraints.maxWidth &&
			size.height >= constraints.minHeight &&
			size.height <= constraints.maxHeight
		);
	}

	/**
	 * Calculates the tightest size that satisfies constraints
	 * @param constraints - The constraints
	 * @returns The tight size
	 */
	static getTightSize(constraints: LayoutConstraints): Size {
		return {
			width: constraints.minWidth,
			height: constraints.minHeight,
		};
	}

	/**
	 * Calculates the loosest size within constraints
	 * @param constraints - The constraints
	 * @returns The loose size
	 */
	static getLooseSize(constraints: LayoutConstraints): Size {
		return {
			width: constraints.maxWidth,
			height: constraints.maxHeight,
		};
	}

	/**
	 * Determines if constraints are tight (min === max)
	 * @param constraints - The constraints to check
	 * @returns True if both dimensions are tight
	 */
	static isTight(constraints: LayoutConstraints): boolean {
		return (
			constraints.minWidth === constraints.maxWidth &&
			constraints.minHeight === constraints.maxHeight
		);
	}

	/**
	 * Determines if constraints are loose (0 to Infinity)
	 * @param constraints - The constraints to check
	 * @returns True if both dimensions are loose
	 */
	static isLoose(constraints: LayoutConstraints): boolean {
		return (
			constraints.minWidth === 0 &&
			constraints.maxWidth === Infinity &&
			constraints.minHeight === 0 &&
			constraints.maxHeight === Infinity
		);
	}

	/**
	 * Creates a copy of constraints with adjusted values
	 * @param constraints - The source constraints
	 * @param adjustments - The adjustments to apply
	 * @returns Adjusted constraints
	 */
	static adjustConstraints(
		constraints: LayoutConstraints,
		adjustments: Partial<LayoutConstraints>,
	): LayoutConstraints {
		return this.resolveConstraints({
			minWidth: adjustments.minWidth ?? constraints.minWidth,
			maxWidth: adjustments.maxWidth ?? constraints.maxWidth,
			minHeight: adjustments.minHeight ?? constraints.minHeight,
			maxHeight: adjustments.maxHeight ?? constraints.maxHeight,
		});
	}

	/**
	 * Deflates constraints by padding/margin
	 * @param constraints - The constraints to deflate
	 * @param insets - The insets to subtract
	 * @returns Deflated constraints
	 */
	static deflateConstraints(
		constraints: LayoutConstraints,
		insets: EdgeInsets,
	): LayoutConstraints {
		const horizontal = insets.left + insets.right;
		const vertical = insets.top + insets.bottom;

		return this.resolveConstraints({
			minWidth: Math.max(0, constraints.minWidth - horizontal),
			maxWidth: Math.max(0, constraints.maxWidth - horizontal),
			minHeight: Math.max(0, constraints.minHeight - vertical),
			maxHeight: Math.max(0, constraints.maxHeight - vertical),
		});
	}
}
