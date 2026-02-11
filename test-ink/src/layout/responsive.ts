/**
 * Responsive Layout Module
 *
 * Defines the ResponsiveLayout class for adaptive layouts that respond to
 * screen size changes. Supports breakpoints, orientation detection, and
 * different layouts at different screen sizes.
 */

import type {Size} from './types';
import {LayoutNode} from './node';
import {FlexContainer} from './flex-container';

/**
 * Predefined breakpoint sizes (in terminal columns/rows)
 */
export enum Breakpoint {
	/** Small screens (< 80 columns) */
	Small = 'small',
	/** Medium screens (80-119 columns) */
	Medium = 'medium',
	/** Large screens (120-159 columns) */
	Large = 'large',
	/** Extra large screens (>= 160 columns) */
	XLarge = 'xlarge',
}

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
	/** Minimum width for this breakpoint (inclusive) */
	minWidth: number;
	/** Maximum width for this breakpoint (exclusive, Infinity for no limit) */
	maxWidth: number;
	/** Minimum height for this breakpoint */
	minHeight: number;
	/** Name of the breakpoint */
	name: string;
}

/**
 * Default breakpoint configurations
 */
export const DEFAULT_BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
	[Breakpoint.Small]: {
		minWidth: 0,
		maxWidth: 80,
		minHeight: 0,
		name: 'small',
	},
	[Breakpoint.Medium]: {
		minWidth: 80,
		maxWidth: 120,
		minHeight: 0,
		name: 'medium',
	},
	[Breakpoint.Large]: {
		minWidth: 120,
		maxWidth: 160,
		minHeight: 0,
		name: 'large',
	},
	[Breakpoint.XLarge]: {
		minWidth: 160,
		maxWidth: Infinity,
		minHeight: 0,
		name: 'xlarge',
	},
};

/**
 * Screen orientation
 */
export enum Orientation {
	/** Width >= Height */
	Landscape = 'landscape',
	/** Height > Width */
	Portrait = 'portrait',
	/** Square (width === height) */
	Square = 'square',
}

/**
 * Layout factory function type
 */
export type LayoutFactory = (size: Size) => LayoutNode;

/**
 * Responsive layout configuration
 */
export interface ResponsiveLayoutConfig {
	/** Breakpoint configurations (uses defaults if not provided) */
	breakpoints?: Partial<Record<Breakpoint, BreakpointConfig>>;
	/** Layout factories for each breakpoint */
	layouts: Partial<Record<Breakpoint, LayoutFactory>>;
	/** Default layout factory (used when no breakpoint matches) */
	defaultLayout?: LayoutFactory;
	/** Layout factory for portrait orientation */
	portraitLayout?: LayoutFactory;
	/** Layout factory for landscape orientation */
	landscapeLayout?: LayoutFactory;
	/** Callback when breakpoint changes */
	onBreakpointChange?: (
		breakpoint: Breakpoint,
		previous: Breakpoint | null,
	) => void;
	/** Callback when orientation changes */
	onOrientationChange?: (
		orientation: Orientation,
		previous: Orientation,
	) => void;
}

/**
 * Current responsive state
 */
export interface ResponsiveState {
	/** Current breakpoint */
	breakpoint: Breakpoint;
	/** Current orientation */
	orientation: Orientation;
	/** Current screen size */
	size: Size;
	/** Whether the layout needs to be rebuilt */
	layoutChanged: boolean;
}

/**
 * Manages responsive layouts based on screen size
 */
export class ResponsiveLayout {
	/** Breakpoint configurations */
	private breakpoints: Record<Breakpoint, BreakpointConfig>;

	/** Layout factories for each breakpoint */
	private layouts: Partial<Record<Breakpoint, LayoutFactory>>;

	/** Default layout factory */
	private defaultLayout: LayoutFactory;

	/** Portrait layout factory */
	private portraitLayout?: LayoutFactory;

	/** Landscape layout factory */
	private landscapeLayout?: LayoutFactory;

	/** Current state */
	private state: ResponsiveState;

	/** Previous state for change detection */
	private previousState: ResponsiveState | null = null;

	/** Current layout node */
	private currentLayout: LayoutNode | null = null;

	/** Callback for breakpoint changes */
	private onBreakpointChange?: (
		breakpoint: Breakpoint,
		previous: Breakpoint | null,
	) => void;

	/** Callback for orientation changes */
	private onOrientationChange?: (
		orientation: Orientation,
		previous: Orientation,
	) => void;

	/**
	 * Creates a new ResponsiveLayout
	 * @param config - Responsive layout configuration
	 */
	constructor(config: ResponsiveLayoutConfig) {
		// Merge custom breakpoints with defaults
		this.breakpoints = {
			...DEFAULT_BREAKPOINTS,
			...config.breakpoints,
		};

		this.layouts = config.layouts;
		this.defaultLayout = config.defaultLayout ?? (() => new FlexContainer());
		this.portraitLayout = config.portraitLayout;
		this.landscapeLayout = config.landscapeLayout;
		this.onBreakpointChange = config.onBreakpointChange;
		this.onOrientationChange = config.onOrientationChange;

		// Initialize state with defaults
		this.state = {
			breakpoint: Breakpoint.Medium,
			orientation: Orientation.Landscape,
			size: {width: 80, height: 24},
			layoutChanged: true,
		};
	}

	/**
	 * Gets the current responsive state
	 */
	get currentState(): ResponsiveState {
		return {...this.state};
	}

	/**
	 * Gets the current breakpoint
	 */
	get breakpoint(): Breakpoint {
		return this.state.breakpoint;
	}

	/**
	 * Gets the current orientation
	 */
	get orientation(): Orientation {
		return this.state.orientation;
	}

	/**
	 * Gets the current screen size
	 */
	get size(): Size {
		return {...this.state.size};
	}

	/**
	 * Gets the current layout node
	 */
	get layout(): LayoutNode | null {
		return this.currentLayout;
	}

	/**
	 * Updates the layout based on new screen size
	 * @param size - The new screen size
	 * @returns The layout node for the current state
	 */
	update(size: Size): LayoutNode {
		// Store previous state
		this.previousState = {...this.state};

		// Detect orientation
		const orientation = this.detectOrientation(size);

		// Detect breakpoint
		const breakpoint = this.detectBreakpoint(size);

		// Check if layout needs to change
		const breakpointChanged = breakpoint !== this.previousState.breakpoint;
		const orientationChanged = orientation !== this.previousState.orientation;
		const layoutChanged = breakpointChanged || orientationChanged;

		// Update state
		this.state = {
			breakpoint,
			orientation,
			size: {...size},
			layoutChanged,
		};

		// Emit change events
		if (breakpointChanged && this.onBreakpointChange) {
			this.onBreakpointChange(breakpoint, this.previousState.breakpoint);
		}

		if (orientationChanged && this.onOrientationChange) {
			this.onOrientationChange(orientation, this.previousState.orientation);
		}

		// Build new layout if needed
		if (layoutChanged || !this.currentLayout) {
			this.currentLayout = this.buildLayout(size, breakpoint, orientation);
		}

		return this.currentLayout;
	}

	/**
	 * Forces a layout rebuild
	 * @param size - The screen size
	 * @returns The new layout node
	 */
	forceRebuild(size: Size): LayoutNode {
		this.state.layoutChanged = true;
		this.currentLayout = this.buildLayout(
			size,
			this.state.breakpoint,
			this.state.orientation,
		);
		return this.currentLayout;
	}

	/**
	 * Checks if the current breakpoint matches the given breakpoint(s)
	 * @param breakpoint - Breakpoint(s) to check
	 * @returns True if current breakpoint matches
	 */
	is(breakpoint: Breakpoint | Breakpoint[]): boolean {
		if (Array.isArray(breakpoint)) {
			return breakpoint.includes(this.state.breakpoint);
		}
		return this.state.breakpoint === breakpoint;
	}

	/**
	 * Checks if current breakpoint is at least the given breakpoint
	 * @param breakpoint - The breakpoint to compare
	 * @returns True if current >= given breakpoint
	 */
	isAtLeast(breakpoint: Breakpoint): boolean {
		const order = [
			Breakpoint.Small,
			Breakpoint.Medium,
			Breakpoint.Large,
			Breakpoint.XLarge,
		];
		const currentIndex = order.indexOf(this.state.breakpoint);
		const targetIndex = order.indexOf(breakpoint);
		return currentIndex >= targetIndex;
	}

	/**
	 * Checks if current breakpoint is at most the given breakpoint
	 * @param breakpoint - The breakpoint to compare
	 * @returns True if current <= given breakpoint
	 */
	isAtMost(breakpoint: Breakpoint): boolean {
		const order = [
			Breakpoint.Small,
			Breakpoint.Medium,
			Breakpoint.Large,
			Breakpoint.XLarge,
		];
		const currentIndex = order.indexOf(this.state.breakpoint);
		const targetIndex = order.indexOf(breakpoint);
		return currentIndex <= targetIndex;
	}

	/**
	 * Checks if current orientation is portrait
	 */
	get isPortrait(): boolean {
		return this.state.orientation === Orientation.Portrait;
	}

	/**
	 * Checks if current orientation is landscape
	 */
	get isLandscape(): boolean {
		return this.state.orientation === Orientation.Landscape;
	}

	/**
	 * Gets the breakpoint configuration for a specific breakpoint
	 * @param breakpoint - The breakpoint
	 * @returns The breakpoint configuration
	 */
	getBreakpointConfig(breakpoint: Breakpoint): BreakpointConfig {
		return this.breakpoints[breakpoint];
	}

	/**
	 * Detects the orientation based on size
	 * @param size - The screen size
	 * @returns The detected orientation
	 */
	private detectOrientation(size: Size): Orientation {
		if (size.width > size.height) {
			return Orientation.Landscape;
		} else if (size.height > size.width) {
			return Orientation.Portrait;
		}
		return Orientation.Square;
	}

	/**
	 * Detects the breakpoint based on size
	 * @param size - The screen size
	 * @returns The detected breakpoint
	 */
	private detectBreakpoint(size: Size): Breakpoint {
		for (const [key, config] of Object.entries(this.breakpoints) as [
			Breakpoint,
			BreakpointConfig,
		][]) {
			if (size.width >= config.minWidth && size.width < config.maxWidth) {
				return key;
			}
		}
		// Fallback to medium if no match
		return Breakpoint.Medium;
	}

	/**
	 * Builds the layout for the current state
	 * @param size - The screen size
	 * @param breakpoint - The current breakpoint
	 * @param orientation - The current orientation
	 * @returns The layout node
	 */
	private buildLayout(
		size: Size,
		breakpoint: Breakpoint,
		orientation: Orientation,
	): LayoutNode {
		// Try orientation-specific layout first
		if (orientation === Orientation.Portrait && this.portraitLayout) {
			return this.portraitLayout(size);
		}

		if (orientation === Orientation.Landscape && this.landscapeLayout) {
			return this.landscapeLayout(size);
		}

		// Try breakpoint-specific layout
		const layoutFactory = this.layouts[breakpoint];
		if (layoutFactory) {
			return layoutFactory(size);
		}

		// Fallback to default layout
		return this.defaultLayout(size);
	}

	/**
	 * Gets a value based on the current breakpoint
	 * @param values - Values for each breakpoint
	 * @returns The value for the current breakpoint, or the default
	 */
	getValue<T>(
		values: Partial<Record<Breakpoint, T>> & {default?: T},
	): T | undefined {
		// Try current breakpoint
		if (values[this.state.breakpoint] !== undefined) {
			return values[this.state.breakpoint];
		}

		// Try smaller breakpoints
		const order = [
			Breakpoint.Small,
			Breakpoint.Medium,
			Breakpoint.Large,
			Breakpoint.XLarge,
		];
		const currentIndex = order.indexOf(this.state.breakpoint);

		for (let i = currentIndex - 1; i >= 0; i--) {
			if (values[order[i]] !== undefined) {
				return values[order[i]];
			}
		}

		// Return default
		return values.default;
	}

	/**
	 * Creates a responsive value getter for a specific property
	 * @param values - Values for each breakpoint
	 * @returns A function that returns the appropriate value
	 */
	createResponsiveValue<T>(
		values: Partial<Record<Breakpoint, T>> & {default?: T},
	): () => T | undefined {
		return () => this.getValue(values);
	}

	/**
	 * Disposes the responsive layout
	 */
	dispose(): void {
		this.currentLayout = null;
		this.previousState = null;
	}
}

/**
 * Creates a responsive layout with the given configuration
 * @param config - Responsive layout configuration
 * @returns A new ResponsiveLayout instance
 */
export function createResponsiveLayout(
	config: ResponsiveLayoutConfig,
): ResponsiveLayout {
	return new ResponsiveLayout(config);
}

/**
 * Helper to create breakpoint-specific values
 * @param small - Value for small screens
 * @param medium - Value for medium screens
 * @param large - Value for large screens
 * @param xlarge - Value for extra large screens
 * @returns A breakpoint value map
 */
export function breakpointValues<T>(
	small: T,
	medium?: T,
	large?: T,
	xlarge?: T,
): Partial<Record<Breakpoint, T>> {
	const values: Partial<Record<Breakpoint, T>> = {[Breakpoint.Small]: small};
	if (medium !== undefined) values[Breakpoint.Medium] = medium;
	if (large !== undefined) values[Breakpoint.Large] = large;
	if (xlarge !== undefined) values[Breakpoint.XLarge] = xlarge;
	return values;
}

/**
 * Helper to create a layout that adapts based on breakpoint
 * @param factories - Layout factories for each breakpoint
 * @returns A responsive layout factory
 */
export function adaptiveLayout(
	factories: Partial<Record<Breakpoint, LayoutFactory>> & {
		default: LayoutFactory;
	},
): LayoutFactory {
	const responsive = new ResponsiveLayout({
		layouts: factories,
		defaultLayout: factories.default,
	});

	return (size: Size) => responsive.update(size);
}
