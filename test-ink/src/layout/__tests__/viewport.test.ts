/**
 * Tests for viewport module
 */

import test from 'ava';
import {Viewport, ViewportEvent} from '../viewport.js';

test('Viewport creates with default options', t => {
	const viewport = new Viewport();
	t.deepEqual(viewport.size, {width: 80, height: 24});
	t.deepEqual(viewport.content, {width: 80, height: 24});
	t.deepEqual(viewport.scroll, {x: 0, y: 0});
	t.true(viewport.horizontalScrollEnabled);
	t.true(viewport.verticalScrollEnabled);
	t.true(viewport.showScrollIndicators);
});

test('Viewport creates with custom options', t => {
	const viewport = new Viewport({
		width: 100,
		height: 50,
		contentWidth: 200,
		contentHeight: 300,
		scrollX: 10,
		scrollY: 20,
		horizontalScrollEnabled: false,
		verticalScrollEnabled: false,
		showScrollIndicators: false,
	});
	t.deepEqual(viewport.size, {width: 100, height: 50});
	t.deepEqual(viewport.content, {width: 200, height: 300});
	t.deepEqual(viewport.scroll, {x: 10, y: 20});
	t.false(viewport.horizontalScrollEnabled);
	t.false(viewport.verticalScrollEnabled);
	t.false(viewport.showScrollIndicators);
});

test('Viewport.setSize updates size', t => {
	const viewport = new Viewport();
	viewport.setSize({width: 120, height: 40});
	t.deepEqual(viewport.size, {width: 120, height: 40});
});

test('Viewport.setContentSize updates content size', t => {
	const viewport = new Viewport();
	viewport.setContentSize({width: 200, height: 400});
	t.deepEqual(viewport.content, {width: 200, height: 400});
});

test('Viewport.scrollTo sets scroll position', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo(10, 20);
	t.is(viewport.scrollX, 10);
	t.is(viewport.scrollY, 20);
});

test('Viewport.scrollTo with object sets scroll position', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo({x: 15, y: 25});
	t.is(viewport.scrollX, 15);
	t.is(viewport.scrollY, 25);
});

test('Viewport.scrollBy adds to scroll position', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo(10, 10);
	viewport.scrollBy(5, 5);
	t.is(viewport.scrollX, 15);
	t.is(viewport.scrollY, 15);
});

test('Viewport.scrollToTop scrolls to top', t => {
	const viewport = new Viewport({contentHeight: 200});
	viewport.scrollTo(0, 50);
	viewport.scrollToTop();
	t.is(viewport.scrollY, 0);
});

test('Viewport.scrollToBottom scrolls to bottom', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	viewport.scrollToBottom();
	t.is(viewport.scrollY, 150);
});

test('Viewport.scrollToLeft scrolls to left edge', t => {
	const viewport = new Viewport({contentWidth: 200});
	viewport.scrollTo(50, 0);
	viewport.scrollToLeft();
	t.is(viewport.scrollX, 0);
});

test('Viewport.scrollToRight scrolls to right edge', t => {
	const viewport = new Viewport({width: 50, contentWidth: 200});
	viewport.scrollToRight();
	t.is(viewport.scrollX, 150);
});

test('Viewport.pageUp scrolls up by viewport height', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	viewport.scrollTo(0, 100);
	viewport.pageUp();
	t.is(viewport.scrollY, 50);
});

test('Viewport.pageDown scrolls down by viewport height', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	viewport.scrollTo(0, 50);
	viewport.pageDown();
	t.is(viewport.scrollY, 100);
});

test('Viewport.maxScrollX returns correct value', t => {
	const viewport = new Viewport({width: 50, contentWidth: 200});
	t.is(viewport.maxScrollX, 150);
});

test('Viewport.maxScrollY returns correct value', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	t.is(viewport.maxScrollY, 150);
});

test('Viewport.canScrollHorizontal returns correct value', t => {
	const scrollable = new Viewport({width: 50, contentWidth: 200});
	const notScrollable = new Viewport({width: 200, contentWidth: 50});

	t.true(scrollable.canScrollHorizontal);
	t.false(notScrollable.canScrollHorizontal);
});

test('Viewport.canScrollVertical returns correct value', t => {
	const scrollable = new Viewport({height: 50, contentHeight: 200});
	const notScrollable = new Viewport({height: 200, contentHeight: 50});

	t.true(scrollable.canScrollVertical);
	t.false(notScrollable.canScrollVertical);
});

test('Viewport.isAtTop returns correct value', t => {
	const viewport = new Viewport({contentHeight: 200});
	t.true(viewport.isAtTop);
	viewport.scrollTo(0, 10);
	t.false(viewport.isAtTop);
});

test('Viewport.isAtBottom returns correct value', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	t.false(viewport.isAtBottom);
	viewport.scrollToBottom();
	t.true(viewport.isAtBottom);
});

test('Viewport.isAtLeft returns correct value', t => {
	const viewport = new Viewport({contentWidth: 200});
	t.true(viewport.isAtLeft);
	viewport.scrollTo(10, 0);
	t.false(viewport.isAtLeft);
});

test('Viewport.isAtRight returns correct value', t => {
	const viewport = new Viewport({width: 50, contentWidth: 200});
	t.false(viewport.isAtRight);
	viewport.scrollToRight();
	t.true(viewport.isAtRight);
});

test('Viewport.visibleRegion returns correct rect', t => {
	const viewport = new Viewport({width: 50, height: 30});
	viewport.scrollTo(10, 20);

	const region = viewport.visibleRegion;
	t.deepEqual(region, {x: 10, y: 20, width: 50, height: 30});
});

test('Viewport.contentBounds returns correct rect', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 300});

	const bounds = viewport.contentBounds;
	t.deepEqual(bounds, {x: 0, y: 0, width: 200, height: 300});
});

test('Viewport.isVisible checks if point is visible', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	t.true(viewport.isVisible({x: 25, y: 25}));
	t.false(viewport.isVisible({x: 100, y: 100}));
});

test('Viewport.intersectsVisibleRegion checks rect intersection', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	t.true(
		viewport.intersectsVisibleRegion({x: 25, y: 25, width: 10, height: 10}),
	);
	t.false(
		viewport.intersectsVisibleRegion({x: 100, y: 100, width: 10, height: 10}),
	);
});

test('Viewport.clipToVisible returns intersection', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	const clipped = viewport.clipToVisible({x: 25, y: 25, width: 50, height: 50});
	t.deepEqual(clipped, {x: 25, y: 25, width: 25, height: 25});
});

test('Viewport.clipToVisible returns null for non-intersecting', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	const clipped = viewport.clipToVisible({
		x: 100,
		y: 100,
		width: 50,
		height: 50,
	});
	t.is(clipped, null);
});

test('Viewport.contentToViewport converts coordinates', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo(10, 20);

	const viewportPos = viewport.contentToViewport({x: 30, y: 40});
	t.deepEqual(viewportPos, {x: 20, y: 20});
});

test('Viewport.viewportToContent converts coordinates', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo(10, 20);

	const contentPos = viewport.viewportToContent({x: 20, y: 20});
	t.deepEqual(contentPos, {x: 30, y: 40});
});

test('Viewport.horizontalScrollPercent returns correct value', t => {
	const viewport = new Viewport({width: 50, contentWidth: 200});
	viewport.scrollTo(75, 0);

	t.is(viewport.horizontalScrollPercent, 0.5);
});

test('Viewport.verticalScrollPercent returns correct value', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	viewport.scrollTo(0, 75);

	t.is(viewport.verticalScrollPercent, 0.5);
});

test('Viewport.horizontalVisiblePercent returns correct value', t => {
	const viewport = new Viewport({width: 50, contentWidth: 200});
	t.is(viewport.horizontalVisiblePercent, 0.25);
});

test('Viewport.verticalVisiblePercent returns correct value', t => {
	const viewport = new Viewport({height: 50, contentHeight: 200});
	t.is(viewport.verticalVisiblePercent, 0.25);
});

test('Viewport.getHorizontalScrollIndicator returns indicator position', t => {
	const viewport = new Viewport({width: 100, contentWidth: 400});
	viewport.scrollTo(150, 0);

	const indicator = viewport.getHorizontalScrollIndicator(100);
	t.is(indicator.width, 25); // 100 * (100/400)
	t.is(indicator.position, 50); // 50% of scrollable area
});

test('Viewport.getVerticalScrollIndicator returns indicator position', t => {
	const viewport = new Viewport({height: 100, contentHeight: 400});
	viewport.scrollTo(0, 150);

	const indicator = viewport.getVerticalScrollIndicator(100);
	t.is(indicator.height, 25); // 100 * (100/400)
	t.is(indicator.position, 50); // 50% of scrollable area
});

test('Viewport emits resize event', t => {
	const viewport = new Viewport();
	let emitted = false;

	viewport.on(ViewportEvent.Resize, () => {
		emitted = true;
	});
	viewport.setSize({width: 100, height: 50});

	t.true(emitted);
});

test('Viewport emits scroll event', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	let emitted = false;

	viewport.on(ViewportEvent.Scroll, () => {
		emitted = true;
	});
	viewport.scrollTo(10, 10);

	t.true(emitted);
});

test('Viewport.off removes event listener', t => {
	const viewport = new Viewport();
	let emitted = false;
	const handler = () => {
		emitted = true;
	};

	viewport.on(ViewportEvent.Scroll, handler);
	viewport.off(ViewportEvent.Scroll, handler);
	viewport.scrollTo(10, 10);

	t.false(emitted);
});

test('Viewport.fromRect creates viewport from rect', t => {
	const viewport = Viewport.fromRect({x: 0, y: 0, width: 100, height: 50});
	t.deepEqual(viewport.size, {width: 100, height: 50});
});

test('Viewport.reset resets scroll position', t => {
	const viewport = new Viewport({contentWidth: 200, contentHeight: 200});
	viewport.scrollTo(50, 50);
	viewport.reset();

	t.is(viewport.scrollX, 0);
	t.is(viewport.scrollY, 0);
});

test('Viewport.ensureVisible scrolls to make rect visible', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	// Rect is to the right and below viewport
	viewport.ensureVisible({x: 100, y: 100, width: 20, height: 20});

	t.is(viewport.scrollX, 70); // 100 + 20 - 50
	t.is(viewport.scrollY, 70);
});

test('Viewport clamps scroll offset to valid bounds', t => {
	const viewport = new Viewport({
		width: 50,
		height: 50,
		contentWidth: 200,
		contentHeight: 200,
	});

	viewport.scrollTo(-100, -100);
	t.is(viewport.scrollX, 0);
	t.is(viewport.scrollY, 0);

	viewport.scrollTo(1000, 1000);
	t.is(viewport.scrollX, 150);
	t.is(viewport.scrollY, 150);
});
