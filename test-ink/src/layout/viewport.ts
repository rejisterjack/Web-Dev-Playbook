/**
 * Viewport Module
 *
 * Defines the Viewport class for managing the visible area of content.
 * Handles scroll position, content size, and viewport clipping.
 */

import type {Size, Position, Rect, ScrollOffset} from './types';
import {clamp, containsPoint, intersectRect, createRect} from './utils';

/**
 * Viewport change event type
 */
export enum ViewportEvent {
	Scroll = 'scroll',
	Resize = 'resize',
	ContentSizeChanged = 'contentSizeChanged',
}

/**
 * Listener for viewport events
 */
type ViewportEventListener = (data: unknown) => void;

/**
 * Options for creating a Viewport
 */
export interface ViewportOptions {
	/** Initial viewport width */
	width?: number;
	/** Initial viewport height */
	height?: number;
	/** Content width */
	contentWidth?: number;
	/** Content height */
	contentHeight?: number;
	/** Initial scroll X position */
	scrollX?: number;
	/** Initial scroll Y position */
	scrollY?: number;
	/** Whether scrolling is enabled horizontally */
	horizontalScrollEnabled?: boolean;
	/** Whether scrolling is enabled vertically */
	verticalScrollEnabled?: boolean;
	/** Whether to show scroll indicators */
	showScrollIndicators?: boolean;
}

/**
 * Manages the visible area and scroll position
 */
export class Viewport {
	/** Viewport size */
	private viewportSize: Size;

	/** Content size */
	private contentSize: Size;

	/** Current scroll offset */
	private scrollOffset: ScrollOffset;

	/** Whether horizontal scrolling is enabled */
	horizontalScrollEnabled: boolean;

	/** Whether vertical scrolling is enabled */
	verticalScrollEnabled: boolean;

	/** Whether to show scroll indicators */
	showScrollIndicators: boolean;

	/** Event listeners */
	private listeners: Map<ViewportEvent, ViewportEventListener[]> = new Map();

	/**
	 * Creates a new Viewport
	 * @param options - Viewport options
	 */
	constructor(options: ViewportOptions = {}) {
		this.viewportSize = {
			width: options.width ?? 80,
			height: options.height ?? 24,
		};

		this.contentSize = {
			width: options.contentWidth ?? this.viewportSize.width,
			height: options.contentHeight ?? this.viewportSize.height,
		};

		this.scrollOffset = {
			x: options.scrollX ?? 0,
			y: options.scrollY ?? 0,
		};

		this.horizontalScrollEnabled = options.horizontalScrollEnabled ?? true;
		this.verticalScrollEnabled = options.verticalScrollEnabled ?? true;
		this.showScrollIndicators = options.showScrollIndicators ?? true;

		// Initialize event listeners map
		for (const event of Object.values(ViewportEvent)) {
			this.listeners.set(event, []);
		}

		// Clamp initial scroll offset
		this.clampScrollOffset();
	}

	/**
	 * Gets the viewport size
	 */
	get size(): Size {
		return {...this.viewportSize};
	}

	/**
	 * Sets the viewport size
	 * @param size - The new viewport size
	 */
	setSize(size: Size): void {
		if (
			this.viewportSize.width !== size.width ||
			this.viewportSize.height !== size.height
		) {
			this.viewportSize = {...size};
			this.clampScrollOffset();
			this.emit(ViewportEvent.Resize, {size: this.viewportSize});
		}
	}

	/**
	 * Gets the content size
	 */
	get content(): Size {
		return {...this.contentSize};
	}

	/**
	 * Sets the content size
	 * @param size - The new content size
	 */
	setContentSize(size: Size): void {
		if (
			this.contentSize.width !== size.width ||
			this.contentSize.height !== size.height
		) {
			this.contentSize = {...size};
			this.clampScrollOffset();
			this.emit(ViewportEvent.ContentSizeChanged, {size: this.contentSize});
		}
	}

	/**
	 * Gets the current scroll offset
	 */
	get scroll(): ScrollOffset {
		return {...this.scrollOffset};
	}

	/**
	 * Gets the current scroll X position
	 */
	get scrollX(): number {
		return this.scrollOffset.x;
	}

	/**
	 * Gets the current scroll Y position
	 */
	get scrollY(): number {
		return this.scrollOffset.y;
	}

	/**
	 * Sets the scroll position
	 * @param offset - The new scroll offset
	 * @param emitEvent - Whether to emit scroll event
	 */
	setScroll(offset: Partial<ScrollOffset>, emitEvent: boolean = true): void {
		const newX = offset.x !== undefined ? offset.x : this.scrollOffset.x;
		const newY = offset.y !== undefined ? offset.y : this.scrollOffset.y;

		if (this.scrollOffset.x !== newX || this.scrollOffset.y !== newY) {
			this.scrollOffset = {x: newX, y: newY};
			this.clampScrollOffset();

			if (emitEvent) {
				this.emit(ViewportEvent.Scroll, {scroll: this.scrollOffset});
			}
		}
	}

	/**
	 * Scrolls to a specific position
	 * @param x - X position (or ScrollOffset object)
	 * @param y - Y position (if x is a number)
	 */
	scrollTo(x: number | ScrollOffset, y?: number): void {
		if (typeof x === 'object') {
			this.setScroll(x);
		} else {
			this.setScroll({x, y: y ?? this.scrollOffset.y});
		}
	}

	/**
	 * Scrolls by a relative amount
	 * @param deltaX - Horizontal scroll amount
	 * @param deltaY - Vertical scroll amount
	 */
	scrollBy(deltaX: number = 0, deltaY: number = 0): void {
		this.setScroll({
			x: this.scrollOffset.x + deltaX,
			y: this.scrollOffset.y + deltaY,
		});
	}

	/**
	 * Scrolls to ensure a specific region is visible
	 * @param rect - The region to make visible
	 * @param padding - Optional padding around the region
	 */
	ensureVisible(rect: Rect, padding: number = 0): void {
		const paddedRect = {
			x: rect.x - padding,
			y: rect.y - padding,
			width: rect.width + padding * 2,
			height: rect.height + padding * 2,
		};

		let newX = this.scrollOffset.x;
		let newY = this.scrollOffset.y;

		// Horizontal scrolling
		if (this.horizontalScrollEnabled) {
			if (paddedRect.x < this.scrollOffset.x) {
				// Region is to the left of viewport
				newX = paddedRect.x;
			} else if (
				paddedRect.x + paddedRect.width >
				this.scrollOffset.x + this.viewportSize.width
			) {
				// Region is to the right of viewport
				newX = paddedRect.x + paddedRect.width - this.viewportSize.width;
			}
		}

		// Vertical scrolling
		if (this.verticalScrollEnabled) {
			if (paddedRect.y < this.scrollOffset.y) {
				// Region is above viewport
				newY = paddedRect.y;
			} else if (
				paddedRect.y + paddedRect.height >
				this.scrollOffset.y + this.viewportSize.height
			) {
				// Region is below viewport
				newY = paddedRect.y + paddedRect.height - this.viewportSize.height;
			}
		}

		this.setScroll({x: newX, y: newY});
	}

	/**
	 * Scrolls to the top of the content
	 */
	scrollToTop(): void {
		this.setScroll({y: 0});
	}

	/**
	 * Scrolls to the bottom of the content
	 */
	scrollToBottom(): void {
		const maxScroll = Math.max(
			0,
			this.contentSize.height - this.viewportSize.height,
		);
		this.setScroll({y: maxScroll});
	}

	/**
	 * Scrolls to the left edge of the content
	 */
	scrollToLeft(): void {
		this.setScroll({x: 0});
	}

	/**
	 * Scrolls to the right edge of the content
	 */
	scrollToRight(): void {
		const maxScroll = Math.max(
			0,
			this.contentSize.width - this.viewportSize.width,
		);
		this.setScroll({x: maxScroll});
	}

	/**
	 * Scrolls up by the viewport height (page up)
	 */
	pageUp(): void {
		this.scrollBy(0, -this.viewportSize.height);
	}

	/**
	 * Scrolls down by the viewport height (page down)
	 */
	pageDown(): void {
		this.scrollBy(0, this.viewportSize.height);
	}

	/**
	 * Scrolls left by the viewport width
	 */
	pageLeft(): void {
		this.scrollBy(-this.viewportSize.width, 0);
	}

	/**
	 * Scrolls right by the viewport width
	 */
	pageRight(): void {
		this.scrollBy(this.viewportSize.width, 0);
	}

	/**
	 * Gets the maximum scroll X position
	 */
	get maxScrollX(): number {
		return Math.max(0, this.contentSize.width - this.viewportSize.width);
	}

	/**
	 * Gets the maximum scroll Y position
	 */
	get maxScrollY(): number {
		return Math.max(0, this.contentSize.height - this.viewportSize.height);
	}

	/**
	 * Checks if horizontal scrolling is possible
	 */
	get canScrollHorizontal(): boolean {
		return (
			this.horizontalScrollEnabled &&
			this.contentSize.width > this.viewportSize.width
		);
	}

	/**
	 * Checks if vertical scrolling is possible
	 */
	get canScrollVertical(): boolean {
		return (
			this.verticalScrollEnabled &&
			this.contentSize.height > this.viewportSize.height
		);
	}

	/**
	 * Checks if scrolled to the top
	 */
	get isAtTop(): boolean {
		return this.scrollOffset.y <= 0;
	}

	/**
	 * Checks if scrolled to the bottom
	 */
	get isAtBottom(): boolean {
		return this.scrollOffset.y >= this.maxScrollY;
	}

	/**
	 * Checks if scrolled to the left edge
	 */
	get isAtLeft(): boolean {
		return this.scrollOffset.x <= 0;
	}

	/**
	 * Checks if scrolled to the right edge
	 */
	get isAtRight(): boolean {
		return this.scrollOffset.x >= this.maxScrollX;
	}

	/**
	 * Gets the visible region as a rectangle
	 */
	get visibleRegion(): Rect {
		return {
			x: this.scrollOffset.x,
			y: this.scrollOffset.y,
			width: this.viewportSize.width,
			height: this.viewportSize.height,
		};
	}

	/**
	 * Gets the content bounds as a rectangle
	 */
	get contentBounds(): Rect {
		return {
			x: 0,
			y: 0,
			width: this.contentSize.width,
			height: this.contentSize.height,
		};
	}

	/**
	 * Checks if a point is within the visible region
	 * @param point - The point to check
	 * @returns True if the point is visible
	 */
	isVisible(point: Position): boolean {
		return containsPoint(this.visibleRegion, point);
	}

	/**
	 * Checks if a rectangle intersects with the visible region
	 * @param rect - The rectangle to check
	 * @returns True if any part of the rectangle is visible
	 */
	intersectsVisibleRegion(rect: Rect): boolean {
		return intersectRect(this.visibleRegion, rect) !== null;
	}

	/**
	 * Clips a rectangle to the visible region
	 * @param rect - The rectangle to clip
	 * @returns The clipped rectangle, or null if completely outside
	 */
	clipToVisible(rect: Rect): Rect | null {
		return intersectRect(this.visibleRegion, rect);
	}

	/**
	 * Converts a content position to viewport position
	 * @param contentPos - Position in content coordinates
	 * @returns Position in viewport coordinates
	 */
	contentToViewport(contentPos: Position): Position {
		return {
			x: contentPos.x - this.scrollOffset.x,
			y: contentPos.y - this.scrollOffset.y,
		};
	}

	/**
	 * Converts a viewport position to content position
	 * @param viewportPos - Position in viewport coordinates
	 * @returns Position in content coordinates
	 */
	viewportToContent(viewportPos: Position): Position {
		return {
			x: viewportPos.x + this.scrollOffset.x,
			y: viewportPos.y + this.scrollOffset.y,
		};
	}

	/**
	 * Gets the horizontal scroll percentage (0-1)
	 */
	get horizontalScrollPercent(): number {
		if (this.maxScrollX === 0) return 0;
		return this.scrollOffset.x / this.maxScrollX;
	}

	/**
	 * Gets the vertical scroll percentage (0-1)
	 */
	get verticalScrollPercent(): number {
		if (this.maxScrollY === 0) return 0;
		return this.scrollOffset.y / this.maxScrollY;
	}

	/**
	 * Gets the visible percentage of content horizontally (0-1)
	 */
	get horizontalVisiblePercent(): number {
		if (this.contentSize.width === 0) return 1;
		return Math.min(1, this.viewportSize.width / this.contentSize.width);
	}

	/**
	 * Gets the visible percentage of content vertically (0-1)
	 */
	get verticalVisiblePercent(): number {
		if (this.contentSize.height === 0) return 1;
		return Math.min(1, this.viewportSize.height / this.contentSize.height);
	}

	/**
	 * Gets the scroll indicator position for horizontal scrollbar
	 * @param scrollbarWidth - Width of the scrollbar area
	 * @returns The indicator position and width
	 */
	getHorizontalScrollIndicator(scrollbarWidth: number): {
		position: number;
		width: number;
	} {
		const visiblePercent = this.horizontalVisiblePercent;
		const indicatorWidth = Math.max(
			1,
			Math.floor(scrollbarWidth * visiblePercent),
		);
		const scrollableWidth = scrollbarWidth - indicatorWidth;
		const position =
			this.maxScrollX > 0
				? Math.floor(this.horizontalScrollPercent * scrollableWidth)
				: 0;

		return {position, width: indicatorWidth};
	}

	/**
	 * Gets the scroll indicator position for vertical scrollbar
	 * @param scrollbarHeight - Height of the scrollbar area
	 * @returns The indicator position and height
	 */
	getVerticalScrollIndicator(scrollbarHeight: number): {
		position: number;
		height: number;
	} {
		const visiblePercent = this.verticalVisiblePercent;
		const indicatorHeight = Math.max(
			1,
			Math.floor(scrollbarHeight * visiblePercent),
		);
		const scrollableHeight = scrollbarHeight - indicatorHeight;
		const position =
			this.maxScrollY > 0
				? Math.floor(this.verticalScrollPercent * scrollableHeight)
				: 0;

		return {position, height: indicatorHeight};
	}

	/**
	 * Adds an event listener
	 * @param event - The event type
	 * @param listener - The listener function
	 */
	on(event: ViewportEvent, listener: ViewportEventListener): void {
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
	off(event: ViewportEvent, listener: ViewportEventListener): void {
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
	private emit(event: ViewportEvent, data: unknown): void {
		const listeners = this.listeners.get(event);
		if (listeners) {
			for (const listener of listeners) {
				try {
					listener(data);
				} catch (error) {
					console.error('Error in viewport event listener:', error);
				}
			}
		}
	}

	/**
	 * Clamps the scroll offset to valid bounds
	 */
	private clampScrollOffset(): void {
		let x = this.scrollOffset.x;
		let y = this.scrollOffset.y;

		if (this.horizontalScrollEnabled) {
			x = clamp(x, 0, this.maxScrollX);
		} else {
			x = 0;
		}

		if (this.verticalScrollEnabled) {
			y = clamp(y, 0, this.maxScrollY);
		} else {
			y = 0;
		}

		this.scrollOffset = {x, y};
	}

	/**
	 * Creates a viewport from a rectangle
	 * @param rect - The rectangle defining viewport size
	 * @returns A new Viewport instance
	 */
	static fromRect(rect: Rect): Viewport {
		return new Viewport({
			width: rect.width,
			height: rect.height,
		});
	}

	/**
	 * Resets the viewport to initial state
	 */
	reset(): void {
		this.scrollOffset = {x: 0, y: 0};
		this.emit(ViewportEvent.Scroll, {scroll: this.scrollOffset});
	}
}
