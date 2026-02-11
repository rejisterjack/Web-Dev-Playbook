/**
 * Scroll View Widget Module
 *
 * Provides the ScrollViewWidget class for scrollable content.
 * Supports vertical and horizontal scrolling with keyboard navigation.
 *
 * @module widgets/scroll-view
 */

import {BaseWidget} from './base.js';
import type {
	Widget,
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetKeyEvent,
	ScrollableWidget,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * Scroll direction
 */
export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

/**
 * Props specific to the ScrollView widget
 */
export interface ScrollViewWidgetProps extends WidgetProps {
	/** Content widget */
	content?: Widget;

	/** Initial scroll X position */
	scrollX?: number;

	/** Initial scroll Y position */
	scrollY?: number;

	/** Scroll change handler */
	onScroll?: (x: number, y: number) => void;

	/** Whether to show scrollbar */
	showScrollbar?: boolean;

	/** Scroll direction */
	direction?: ScrollDirection;

	/** Scrollbar color */
	scrollbarColor?: Color;
}

/**
 * State specific to the ScrollView widget
 */
export interface ScrollViewWidgetState extends WidgetState {
	/** Current scroll X position */
	scrollX: number;

	/** Current scroll Y position */
	scrollY: number;

	/** Maximum scroll X position */
	maxScrollX: number;

	/** Maximum scroll Y position */
	maxScrollY: number;

	/** Content width */
	contentWidth: number;

	/** Content height */
	contentHeight: number;
}

/**
 * Scroll view widget for scrollable content
 *
 * Features:
 * - Vertical and horizontal scrolling
 * - Keyboard navigation (arrows, Page Up/Down)
 * - Scrollbar visualization
 * - Content clipping
 */
export class ScrollViewWidget
	extends BaseWidget
	implements ScrollableWidget
{
	/** Widget type */
	readonly type = 'scroll-view';

	/** Default props for scroll view widgets */
	static defaultProps: Required<ScrollViewWidgetProps> = {
		...BaseWidget.defaultProps,
		content: undefined as unknown as Widget,
		scrollX: 0,
		scrollY: 0,
		onScroll: undefined as unknown as (x: number, y: number) => void,
		showScrollbar: true,
		direction: 'vertical',
		scrollbarColor: 'gray',
	};

	/** Current scroll position */
	scrollPosition = {x: 0, y: 0};

	/** Maximum scroll position */
	maxScroll = {x: 0, y: 0};

	/**
	 * Create a new scroll view widget
	 *
	 * @param props - Scroll view widget props
	 */
	constructor(props: ScrollViewWidgetProps = {}) {
		super(props);
		this._state = {
			...this._state,
			scrollX: props.scrollX ?? 0,
			scrollY: props.scrollY ?? 0,
			maxScrollX: 0,
			maxScrollY: 0,
			contentWidth: 0,
			contentHeight: 0,
		};

		// Add content if provided
		if (props.content) {
			this.addChild(props.content);
		}
	}

	/**
	 * Get scroll view-specific props
	 */
	get scrollViewProps(): Required<ScrollViewWidgetProps> {
		return this._props as Required<ScrollViewWidgetProps>;
	}

	/**
	 * Get scroll view-specific state
	 */
	get scrollViewState(): ScrollViewWidgetState {
		return this._state as ScrollViewWidgetState;
	}

	/**
	 * Get the content widget
	 */
	getContent(): Widget | undefined {
		return this._children[0];
	}

	/**
	 * Set the content widget
	 *
	 * @param content - Content widget
	 */
	setContent(content: Widget): void {
		// Remove existing content
		this.clearChildren();

		// Add new content
		this.addChild(content);
		this.updateContentDimensions();
	}

	/**
	 * Update content dimensions
	 */
	private updateContentDimensions(): void {
		const content = this.getContent();
		if (!content || !content.layoutNode) {
			return;
		}

		const layout = content.layoutNode.computedLayout;
		const {direction} = this.scrollViewProps;
		const bounds = this.getBounds();

		if (!bounds) {
			return;
		}

		const viewportWidth = bounds.width - (direction !== 'horizontal' ? 1 : 0);
		const viewportHeight = bounds.height - (direction !== 'vertical' ? 1 : 0);

		this.setState({
			contentWidth: layout.size.width,
			contentHeight: layout.size.height,
			maxScrollX: Math.max(0, layout.size.width - viewportWidth),
			maxScrollY: Math.max(0, layout.size.height - viewportHeight),
		});

		this.maxScroll = {
			x: Math.max(0, layout.size.width - viewportWidth),
			y: Math.max(0, layout.size.height - viewportHeight),
		};
	}

	/**
	 * Scroll to a specific position
	 *
	 * @param x - X position
	 * @param y - Y position
	 */
	scrollTo(x: number, y: number): void {
		const {maxScrollX, maxScrollY} = this.scrollViewState;

		const clampedX = Math.max(0, Math.min(x, maxScrollX));
		const clampedY = Math.max(0, Math.min(y, maxScrollY));

		if (
			this.scrollViewState.scrollX !== clampedX ||
			this.scrollViewState.scrollY !== clampedY
		) {
			this.setState({
				scrollX: clampedX,
				scrollY: clampedY,
			});

			this.scrollPosition = {x: clampedX, y: clampedY};

			this.scrollViewProps.onScroll?.(clampedX, clampedY);
			this.invalidate();
		}
	}

	/**
	 * Scroll by a delta amount
	 *
	 * @param dx - Delta X
	 * @param dy - Delta Y
	 */
	scrollBy(dx: number, dy: number): void {
		this.scrollTo(
			this.scrollViewState.scrollX + dx,
			this.scrollViewState.scrollY + dy,
		);
	}

	/**
	 * Scroll to the top
	 */
	scrollToTop(): void {
		this.scrollTo(this.scrollViewState.scrollX, 0);
	}

	/**
	 * Scroll to the bottom
	 */
	scrollToBottom(): void {
		this.scrollTo(this.scrollViewState.scrollX, this.scrollViewState.maxScrollY);
	}

	/**
	 * Scroll to the left
	 */
	scrollToLeft(): void {
		this.scrollTo(0, this.scrollViewState.scrollY);
	}

	/**
	 * Scroll to the right
	 */
	scrollToRight(): void {
		this.scrollTo(this.scrollViewState.maxScrollX, this.scrollViewState.scrollY);
	}

	/**
	 * Scroll up by one line
	 */
	scrollUp(): void {
		this.scrollBy(0, -1);
	}

	/**
	 * Scroll down by one line
	 */
	scrollDown(): void {
		this.scrollBy(0, 1);
	}

	/**
	 * Scroll left by one column
	 */
	scrollLeft(): void {
		this.scrollBy(-1, 0);
	}

	/**
	 * Scroll right by one column
	 */
	scrollRight(): void {
		this.scrollBy(1, 0);
	}

	/**
	 * Scroll up by one page
	 */
	pageUp(): void {
		const bounds = this.getBounds();
		if (bounds) {
			this.scrollBy(0, -bounds.height);
		}
	}

	/**
	 * Scroll down by one page
	 */
	pageDown(): void {
		const bounds = this.getBounds();
		if (bounds) {
			this.scrollBy(0, bounds.height);
		}
	}

	/**
	 * Render the scroll view widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {showScrollbar, direction, scrollbarColor} = this.scrollViewProps;
		const {scrollX, scrollY, maxScrollX, maxScrollY} = this.scrollViewState;

		// Render content with clipping
		const content = this.getContent();
		if (content) {
			// Content would be rendered with offset and clipping
			// This is a placeholder for the actual rendering logic
		}

		// Render scrollbars if enabled
		if (showScrollbar) {
			if (direction !== 'horizontal' && maxScrollY > 0) {
				this.renderVerticalScrollbar(
					bounds,
					scrollY,
					maxScrollY,
					scrollbarColor,
				);
			}

			if (direction !== 'vertical' && maxScrollX > 0) {
				this.renderHorizontalScrollbar(
					bounds,
					scrollX,
					maxScrollX,
					scrollbarColor,
				);
			}
		}
	}

	/**
	 * Render vertical scrollbar
	 */
	private renderVerticalScrollbar(
		bounds: {x: number; y: number; width: number; height: number},
		scrollY: number,
		maxScrollY: number,
		color: Color,
	): void {
		const scrollbarX = bounds.x + bounds.width - 1;
		const scrollbarHeight = bounds.height;

		// Calculate thumb position and size
		const thumbSize = Math.max(1, Math.floor(scrollbarHeight * scrollbarHeight / (scrollbarHeight + maxScrollY)));
		const thumbPosition = Math.floor((scrollY / maxScrollY) * (scrollbarHeight - thumbSize));

		// Render scrollbar track and thumb
		// This is a placeholder for actual rendering
	}

	/**
	 * Render horizontal scrollbar
	 */
	private renderHorizontalScrollbar(
		bounds: {x: number; y: number; width: number; height: number},
		scrollX: number,
		maxScrollX: number,
		color: Color,
	): void {
		const scrollbarY = bounds.y + bounds.height - 1;
		const scrollbarWidth = bounds.width;

		// Calculate thumb position and size
		const thumbSize = Math.max(1, Math.floor(scrollbarWidth * scrollbarWidth / (scrollbarWidth + maxScrollX)));
		const thumbPosition = Math.floor((scrollX / maxScrollX) * (scrollbarWidth - thumbSize));

		// Render scrollbar track and thumb
		// This is a placeholder for actual rendering
	}

	/**
	 * Handle events
	 */
	protected onEvent(event: WidgetEvent): boolean {
		switch (event.widgetEventType) {
			case WidgetEventType.KEY_DOWN:
				return this.handleKeyDown(event as WidgetKeyEvent);

			case WidgetEventType.MOUSE_DOWN:
				// Handle scrollbar clicking
				return false;

			default:
				return false;
		}
	}

	/**
	 * Handle keyboard events
	 */
	private handleKeyDown(event: WidgetKeyEvent): boolean {
		const {direction} = this.scrollViewProps;

		switch (event.key) {
			case 'up':
				if (direction !== 'horizontal') {
					this.scrollUp();
					return true;
				}
				return false;

			case 'down':
				if (direction !== 'horizontal') {
					this.scrollDown();
					return true;
				}
				return false;

			case 'left':
				if (direction !== 'vertical') {
					this.scrollLeft();
					return true;
				}
				return false;

			case 'right':
				if (direction !== 'vertical') {
					this.scrollRight();
					return true;
				}
				return false;

			case 'pageup':
				if (direction !== 'horizontal') {
					this.pageUp();
					return true;
				}
				return false;

			case 'pagedown':
				if (direction !== 'horizontal') {
					this.pageDown();
					return true;
				}
				return false;

			case 'home':
				this.scrollToTop();
				return true;

			case 'end':
				this.scrollToBottom();
				return true;

			default:
				return false;
		}
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		return this._props.visible && !this._state.disabled;
	}
}
