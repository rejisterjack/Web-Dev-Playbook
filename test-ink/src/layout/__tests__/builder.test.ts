/**
 * Tests for layout builder module
 */

import test from 'ava';
import {LayoutBuilder, flex, row, column, container} from '../builder.js';
import {LayoutNode} from '../node.js';
import {FlexContainer} from '../flex-container.js';
import {FlexDirection, JustifyContent, AlignItems} from '../flex-direction.js';
import {EdgeInsets} from '../types.js';

test('LayoutBuilder creates with node', t => {
	const node = new LayoutNode();
	const builder = new LayoutBuilder(node);
	t.is(builder.build(), node);
});

test('LayoutBuilder.flex creates flex container builder', t => {
	const builder = LayoutBuilder.flex();
	const node = builder.build();
	t.true(node instanceof FlexContainer);
});

test('LayoutBuilder.row creates row container builder', t => {
	const builder = LayoutBuilder.row();
	const node = builder.build();
	t.true(node instanceof FlexContainer);
	t.is((node as FlexContainer).config.direction, FlexDirection.Row);
});

test('LayoutBuilder.column creates column container builder', t => {
	const builder = LayoutBuilder.column();
	const node = builder.build();
	t.true(node instanceof FlexContainer);
	t.is((node as FlexContainer).config.direction, FlexDirection.Column);
});

test('LayoutBuilder.container creates basic node builder', t => {
	const builder = LayoutBuilder.container();
	const node = builder.build();
	t.true(node instanceof LayoutNode);
	t.false(node instanceof FlexContainer);
});

test('LayoutBuilder.width sets width', t => {
	const node = new LayoutBuilder(new LayoutNode()).width(100).build();
	t.is(node.width, 100);
});

test('LayoutBuilder.height sets height', t => {
	const node = new LayoutBuilder(new LayoutNode()).height(50).build();
	t.is(node.height, 50);
});

test('LayoutBuilder.size sets both dimensions', t => {
	const node = new LayoutBuilder(new LayoutNode()).size(100, 50).build();
	t.is(node.width, 100);
	t.is(node.height, 50);
});

test('LayoutBuilder.fixedSize sets dimensions from object', t => {
	const node = new LayoutBuilder(new LayoutNode())
		.fixedSize({width: 100, height: 50})
		.build();
	t.is(node.width, 100);
	t.is(node.height, 50);
});

test('LayoutBuilder.minWidth sets min width constraint', t => {
	const node = new LayoutBuilder(new LayoutNode()).minWidth(50).build();
	t.is(node.constraints.minWidth, 50);
});

test('LayoutBuilder.maxWidth sets max width constraint', t => {
	const node = new LayoutBuilder(new LayoutNode()).maxWidth(200).build();
	t.is(node.constraints.maxWidth, 200);
});

test('LayoutBuilder.minHeight sets min height constraint', t => {
	const node = new LayoutBuilder(new LayoutNode()).minHeight(50).build();
	t.is(node.constraints.minHeight, 50);
});

test('LayoutBuilder.maxHeight sets max height constraint', t => {
	const node = new LayoutBuilder(new LayoutNode()).maxHeight(200).build();
	t.is(node.constraints.maxHeight, 200);
});

test('LayoutBuilder.constraints sets all constraints', t => {
	const node = new LayoutBuilder(new LayoutNode())
		.constraints({minWidth: 10, maxWidth: 100, minHeight: 20, maxHeight: 200})
		.build();
	t.is(node.constraints.minWidth, 10);
	t.is(node.constraints.maxWidth, 100);
	t.is(node.constraints.minHeight, 20);
	t.is(node.constraints.maxHeight, 200);
});

test('LayoutBuilder.padding with number sets uniform padding', t => {
	const node = new LayoutBuilder(new LayoutNode()).padding(10).build();
	t.deepEqual(node.padding, {top: 10, right: 10, bottom: 10, left: 10});
});

test('LayoutBuilder.padding with object sets padding', t => {
	const padding = EdgeInsets.all(5);
	const node = new LayoutBuilder(new LayoutNode()).padding(padding).build();
	t.deepEqual(node.padding, padding);
});

test('LayoutBuilder.paddingSymmetric sets symmetric padding', t => {
	const node = new LayoutBuilder(new LayoutNode())
		.paddingSymmetric(10, 5)
		.build();
	t.deepEqual(node.padding, {top: 5, right: 10, bottom: 5, left: 10});
});

test('LayoutBuilder.margin with number sets uniform margin', t => {
	const node = new LayoutBuilder(new LayoutNode()).margin(10).build();
	t.deepEqual(node.margin, {top: 10, right: 10, bottom: 10, left: 10});
});

test('LayoutBuilder.margin with object sets margin', t => {
	const margin = EdgeInsets.all(5);
	const node = new LayoutBuilder(new LayoutNode()).margin(margin).build();
	t.deepEqual(node.margin, margin);
});

test('LayoutBuilder.marginSymmetric sets symmetric margin', t => {
	const node = new LayoutBuilder(new LayoutNode())
		.marginSymmetric(10, 5)
		.build();
	t.deepEqual(node.margin, {top: 5, right: 10, bottom: 5, left: 10});
});

test('LayoutBuilder.flexGrow sets flex grow', t => {
	const node = new LayoutBuilder(new LayoutNode()).flexGrow(2).build();
	t.is(node.flex.flexGrow, 2);
});

test('LayoutBuilder.flexShrink sets flex shrink', t => {
	const node = new LayoutBuilder(new LayoutNode()).flexShrink(0).build();
	t.is(node.flex.flexShrink, 0);
});

test('LayoutBuilder.flexBasis sets flex basis', t => {
	const node = new LayoutBuilder(new LayoutNode()).flexBasis(100).build();
	t.is(node.flex.flexBasis, 100);
});

test('LayoutBuilder.flex sets all flex properties', t => {
	const node = new LayoutBuilder(new LayoutNode()).flex(2, 0, 100).build();
	t.is(node.flex.flexGrow, 2);
	t.is(node.flex.flexShrink, 0);
	t.is(node.flex.flexBasis, 100);
});

test('LayoutBuilder.alignSelf sets align self', t => {
	const node = new LayoutBuilder(new LayoutNode()).alignSelf('center').build();
	t.is(node.flex.alignSelf as string, 'center');
});

test('LayoutBuilder.visible sets visibility', t => {
	const node = new LayoutBuilder(new LayoutNode()).visible(false).build();
	t.false(node.visible);
});

test('LayoutBuilder.hide hides node', t => {
	const node = new LayoutBuilder(new LayoutNode()).hide().build();
	t.false(node.visible);
});

test('LayoutBuilder.show shows node', t => {
	const node = new LayoutBuilder(new LayoutNode({visible: false}))
		.show()
		.build();
	t.true(node.visible);
});

test('LayoutBuilder.data sets custom data', t => {
	const data = {foo: 'bar'};
	const node = new LayoutBuilder(new LayoutNode()).data(data).build();
	t.is(node.data, data);
});

test('LayoutBuilder.id sets node id', t => {
	const node = new LayoutBuilder(new LayoutNode()).id('custom-id').build();
	t.is(node.id, 'custom-id');
});

test('LayoutBuilder.child with node adds child', t => {
	const child = new LayoutNode();
	const parent = new LayoutBuilder(new LayoutNode()).child(child).build();
	t.is(parent.childCount, 1);
	t.is(parent.getChild(0), child);
});

test('LayoutBuilder.child with builder function adds child', t => {
	const parent = new LayoutBuilder(new LayoutNode())
		.child(b => b.width(100))
		.build();
	t.is(parent.childCount, 1);
	t.is(parent.getChild(0)?.width, 100);
});

test('LayoutBuilder.children adds multiple children', t => {
	const parent = new LayoutBuilder(new LayoutNode())
		.children(new LayoutNode(), new LayoutNode())
		.build();
	t.is(parent.childCount, 2);
});

test('LayoutBuilder.direction sets flex direction', t => {
	const node = LayoutBuilder.flex()
		.direction(FlexDirection.Column)
		.build() as FlexContainer;
	t.is(node.config.direction, FlexDirection.Column);
});

test('LayoutBuilder.justifyContent sets justify content', t => {
	const node = LayoutBuilder.flex()
		.justifyContent(JustifyContent.Center)
		.build() as FlexContainer;
	t.is(node.config.justifyContent, JustifyContent.Center);
});

test('LayoutBuilder.alignItems sets align items', t => {
	const node = LayoutBuilder.flex()
		.alignItems(AlignItems.Center)
		.build() as FlexContainer;
	t.is(node.config.alignItems, AlignItems.Center);
});

test('LayoutBuilder.gap sets gap', t => {
	const node = LayoutBuilder.flex().gap(10).build() as FlexContainer;
	t.is(node.gap, 10);
});

test('LayoutBuilder.center centers content', t => {
	const node = LayoutBuilder.flex().center().build() as FlexContainer;
	t.is(node.config.justifyContent, JustifyContent.Center);
	t.is(node.config.alignItems, AlignItems.Center);
});

test('LayoutBuilder.spaceBetween sets space between', t => {
	const node = LayoutBuilder.flex().spaceBetween().build() as FlexContainer;
	t.is(node.config.justifyContent, JustifyContent.SpaceBetween);
});

test('LayoutBuilder.spaceAround sets space around', t => {
	const node = LayoutBuilder.flex().spaceAround().build() as FlexContainer;
	t.is(node.config.justifyContent, JustifyContent.SpaceAround);
});

test('LayoutBuilder.spaceEvenly sets space evenly', t => {
	const node = LayoutBuilder.flex().spaceEvenly().build() as FlexContainer;
	t.is(node.config.justifyContent, JustifyContent.SpaceEvenly);
});

// Test helper functions
test('flex helper creates flex container', t => {
	const node = flex().build();
	t.true(node instanceof FlexContainer);
});

test('row helper creates row container', t => {
	const node = row().build() as FlexContainer;
	t.is(node.config.direction, FlexDirection.Row);
});

test('column helper creates column container', t => {
	const node = column().build() as FlexContainer;
	t.is(node.config.direction, FlexDirection.Column);
});

test('container helper creates basic node', t => {
	const node = container().build();
	t.true(node instanceof LayoutNode);
	t.false(node instanceof FlexContainer);
});
