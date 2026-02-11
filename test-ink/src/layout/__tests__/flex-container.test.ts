/**
 * Tests for flex container module
 */

import test from 'ava';
import {FlexContainer} from '../flex-container.js';
import {LayoutNode} from '../node.js';
import {
	FlexDirection,
	FlexWrap,
	JustifyContent,
	AlignItems,
	AlignContent,
} from '../flex-direction.js';

test('FlexContainer creates with default options', t => {
	const container = new FlexContainer();
	t.truthy(container.id);
	t.is(container.config.direction, FlexDirection.Row);
	t.is(container.config.wrap, FlexWrap.NoWrap);
	t.is(container.config.justifyContent, JustifyContent.FlexStart);
	t.is(container.config.alignItems, AlignItems.Stretch);
	t.is(container.config.alignContent, AlignContent.Stretch);
});

test('FlexContainer creates with custom options', t => {
	const container = new FlexContainer({
		direction: FlexDirection.Column,
		wrap: FlexWrap.Wrap,
		justifyContent: JustifyContent.Center,
		alignItems: AlignItems.Center,
		alignContent: AlignContent.Center,
		gap: 10,
		rowGap: 5,
	});
	t.is(container.config.direction, FlexDirection.Column);
	t.is(container.config.wrap, FlexWrap.Wrap);
	t.is(container.config.justifyContent, JustifyContent.Center);
	t.is(container.config.alignItems, AlignItems.Center);
	t.is(container.config.alignContent, AlignContent.Center);
	t.is(container.gap, 10);
	t.is(container.rowGap, 5);
});

test('FlexContainer.isRowDirection returns correct value', t => {
	const row = new FlexContainer({direction: FlexDirection.Row});
	const column = new FlexContainer({direction: FlexDirection.Column});

	t.true(row.isRowDirection);
	t.false(column.isRowDirection);
});

test('FlexContainer.isReverse returns correct value', t => {
	const normal = new FlexContainer({direction: FlexDirection.Row});
	const reverse = new FlexContainer({direction: FlexDirection.RowReverse});

	t.false(normal.isReverse);
	t.true(reverse.isReverse);
});

test('FlexContainer.setDirection updates direction', t => {
	const container = new FlexContainer();
	container.setDirection(FlexDirection.Column);
	t.is(container.config.direction, FlexDirection.Column);
});

test('FlexContainer.setWrap updates wrap', t => {
	const container = new FlexContainer();
	container.setWrap(FlexWrap.Wrap);
	t.is(container.config.wrap, FlexWrap.Wrap);
});

test('FlexContainer.setJustifyContent updates justifyContent', t => {
	const container = new FlexContainer();
	container.setJustifyContent(JustifyContent.SpaceBetween);
	t.is(container.config.justifyContent, JustifyContent.SpaceBetween);
});

test('FlexContainer.setAlignItems updates alignItems', t => {
	const container = new FlexContainer();
	container.setAlignItems(AlignItems.FlexEnd);
	t.is(container.config.alignItems, AlignItems.FlexEnd);
});

test('FlexContainer.setAlignContent updates alignContent', t => {
	const container = new FlexContainer();
	container.setAlignContent(AlignContent.SpaceAround);
	t.is(container.config.alignContent, AlignContent.SpaceAround);
});

test('FlexContainer.setGap updates gap', t => {
	const container = new FlexContainer();
	container.setGap(10);
	t.is(container.gap, 10);
});

test('FlexContainer.setGap clamps to non-negative', t => {
	const container = new FlexContainer();
	container.setGap(-5);
	t.is(container.gap, 0);
});

test('FlexContainer.setRowGap updates rowGap', t => {
	const container = new FlexContainer();
	container.setRowGap(10);
	t.is(container.rowGap, 10);
});

test('FlexContainer.row creates row container', t => {
	const container = FlexContainer.row();
	t.is(container.config.direction, FlexDirection.Row);
});

test('FlexContainer.column creates column container', t => {
	const container = FlexContainer.column();
	t.is(container.config.direction, FlexDirection.Column);
});

test('FlexContainer.calculateLayout calculates layout for empty container', t => {
	const container = new FlexContainer();
	const size = container.calculateLayout({width: 100, height: 50});

	t.true(container.computedLayout.isValid);
	t.is(size.width, 0);
	t.is(size.height, 0);
});

test('FlexContainer.calculateLayout calculates layout with children', t => {
	const container = new FlexContainer();
	const child1 = new LayoutNode({width: 20, height: 10});
	const child2 = new LayoutNode({width: 30, height: 10});

	container.addChildren(child1, child2);
	const size = container.calculateLayout({width: 100, height: 50});

	t.true(container.computedLayout.isValid);
	t.true(child1.computedLayout.isValid);
	t.true(child2.computedLayout.isValid);
	t.is(size.width, 50);
	t.is(size.height, 10);
});

test('FlexContainer.calculateLayout respects flex grow', t => {
	const container = new FlexContainer();
	const child1 = new LayoutNode({width: 20, height: 10, flexGrow: 1});
	const child2 = new LayoutNode({width: 20, height: 10, flexGrow: 1});

	container.addChildren(child1, child2);
	container.calculateLayout({width: 100, height: 50});

	// With 60px remaining space and equal flex grow, each gets 30px extra
	t.true(child1.computedLayout.size.width >= 40);
	t.true(child2.computedLayout.size.width >= 40);
});

test('FlexContainer.calculateLayout handles hidden children', t => {
	const container = new FlexContainer();
	const visibleChild = new LayoutNode({width: 20, height: 10});
	const hiddenChild = new LayoutNode({width: 30, height: 10, visible: false});

	container.addChildren(visibleChild, hiddenChild);
	const size = container.calculateLayout({width: 100, height: 50});

	t.is(size.width, 20);
	t.false(hiddenChild.computedLayout.isValid);
});

test('FlexContainer.calculateLayout with column direction', t => {
	const container = new FlexContainer({direction: FlexDirection.Column});
	const child1 = new LayoutNode({width: 10, height: 20});
	const child2 = new LayoutNode({width: 10, height: 30});

	container.addChildren(child1, child2);
	const size = container.calculateLayout({width: 100, height: 100});

	t.is(size.width, 10);
	t.is(size.height, 50);
});

test('FlexContainer.calculateLayout with gap', t => {
	const container = new FlexContainer({gap: 10});
	const child1 = new LayoutNode({width: 20, height: 10});
	const child2 = new LayoutNode({width: 20, height: 10});

	container.addChildren(child1, child2);
	const size = container.calculateLayout({width: 100, height: 50});

	t.is(size.width, 50); // 20 + 10 + 20
});
