/**
 * Tests for layout node module
 */

import test from 'ava';
import {LayoutNode} from '../node.js';
import {EdgeInsets} from '../types.js';

test('LayoutNode creates with default options', t => {
	const node = new LayoutNode();
	t.truthy(node.id);
	t.is(node.childCount, 0);
	t.is(node.parent, null);
	t.true(node.visible);
});

test('LayoutNode creates with custom options', t => {
	const node = new LayoutNode({
		id: 'test-node',
		width: 100,
		height: 50,
		visible: false,
	});
	t.is(node.id, 'test-node');
	t.is(node.width, 100);
	t.is(node.height, 50);
	t.false(node.visible);
});

test('LayoutNode.addChild adds child node', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	parent.addChild(child);

	t.is(parent.childCount, 1);
	t.is(parent.getChild(0), child);
	t.is(child.parent, parent);
});

test('LayoutNode.addChild removes child from previous parent', t => {
	const parent1 = new LayoutNode();
	const parent2 = new LayoutNode();
	const child = new LayoutNode();

	parent1.addChild(child);
	parent2.addChild(child);

	t.is(parent1.childCount, 0);
	t.is(parent2.childCount, 1);
	t.is(child.parent, parent2);
});

test('LayoutNode.addChildren adds multiple children', t => {
	const parent = new LayoutNode();
	const child1 = new LayoutNode();
	const child2 = new LayoutNode();

	parent.addChildren(child1, child2);

	t.is(parent.childCount, 2);
});

test('LayoutNode.insertChild inserts at specific index', t => {
	const parent = new LayoutNode();
	const child1 = new LayoutNode();
	const child2 = new LayoutNode();

	parent.addChild(child1);
	parent.insertChild(0, child2);

	t.is(parent.getChild(0), child2);
	t.is(parent.getChild(1), child1);
});

test('LayoutNode.removeChild removes child', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	parent.addChild(child);
	const result = parent.removeChild(child);

	t.true(result);
	t.is(parent.childCount, 0);
	t.is(child.parent, null);
});

test('LayoutNode.removeChild returns false for non-existent child', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	const result = parent.removeChild(child);

	t.false(result);
});

test('LayoutNode.removeChildAt removes child at index', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	parent.addChild(child);
	const removed = parent.removeChildAt(0);

	t.is(removed, child);
	t.is(parent.childCount, 0);
});

test('LayoutNode.removeChildAt returns undefined for invalid index', t => {
	const parent = new LayoutNode();

	const removed = parent.removeChildAt(0);

	t.is(removed, undefined);
});

test('LayoutNode.removeAllChildren removes all children', t => {
	const parent = new LayoutNode();
	parent.addChildren(new LayoutNode(), new LayoutNode(), new LayoutNode());

	parent.removeAllChildren();

	t.is(parent.childCount, 0);
});

test('LayoutNode.indexOf returns correct index', t => {
	const parent = new LayoutNode();
	const child1 = new LayoutNode();
	const child2 = new LayoutNode();

	parent.addChildren(child1, child2);

	t.is(parent.indexOf(child1), 0);
	t.is(parent.indexOf(child2), 1);
});

test('LayoutNode.indexOf returns -1 for non-child', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	t.is(parent.indexOf(child), -1);
});

test('LayoutNode.contains returns true for child', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	parent.addChild(child);

	t.true(parent.contains(child));
});

test('LayoutNode.contains returns false for non-child', t => {
	const parent = new LayoutNode();
	const child = new LayoutNode();

	t.false(parent.contains(child));
});

test('LayoutNode.traverse visits all nodes', t => {
	const root = new LayoutNode();
	const child1 = new LayoutNode();
	const child2 = new LayoutNode();
	const grandchild = new LayoutNode();

	root.addChildren(child1, child2);
	child1.addChild(grandchild);

	const visited: string[] = [];
	root.traverse(node => visited.push(node.id));

	t.is(visited.length, 4);
	t.true(visited.includes(root.id));
	t.true(visited.includes(child1.id));
	t.true(visited.includes(child2.id));
	t.true(visited.includes(grandchild.id));
});

test('LayoutNode.traversePostOrder visits children before parent', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});

	root.addChild(child);

	const visited: string[] = [];
	root.traversePostOrder(node => visited.push(node.id));

	t.is(visited[0], 'child');
	t.is(visited[1], 'root');
});

test('LayoutNode.findById finds node in subtree', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});
	const grandchild = new LayoutNode({id: 'grandchild'});

	root.addChild(child);
	child.addChild(grandchild);

	t.is(root.findById('grandchild'), grandchild);
	t.is(root.findById('nonexistent'), undefined);
});

test('LayoutNode.findAll finds nodes matching predicate', t => {
	const root = new LayoutNode({visible: true});
	const child1 = new LayoutNode({visible: false});
	const child2 = new LayoutNode({visible: true});

	root.addChildren(child1, child2);

	const visible = root.findAll(n => n.visible);

	t.is(visible.length, 2);
	t.true(visible.includes(root));
	t.true(visible.includes(child2));
});

test('LayoutNode.root returns root of tree', t => {
	const root = new LayoutNode();
	const child = new LayoutNode();
	const grandchild = new LayoutNode();

	root.addChild(child);
	child.addChild(grandchild);

	t.is(grandchild.root, root);
	t.is(child.root, root);
	t.is(root.root, root);
});

test('LayoutNode.depth returns correct depth', t => {
	const root = new LayoutNode();
	const child = new LayoutNode();
	const grandchild = new LayoutNode();

	root.addChild(child);
	child.addChild(grandchild);

	t.is(root.depth, 0);
	t.is(child.depth, 1);
	t.is(grandchild.depth, 2);
});

test('LayoutNode.path returns path from root', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});
	const grandchild = new LayoutNode({id: 'grandchild'});

	root.addChild(child);
	child.addChild(grandchild);

	const path = grandchild.path;

	t.is(path.length, 3);
	t.is(path[0].id, 'root');
	t.is(path[1].id, 'child');
	t.is(path[2].id, 'grandchild');
});

test('LayoutNode.setComputedLayout sets layout', t => {
	const node = new LayoutNode();

	node.setComputedLayout({x: 10, y: 20}, {width: 100, height: 50});

	t.true(node.computedLayout.isValid);
	t.is(node.computedLayout.position.x, 10);
	t.is(node.computedLayout.position.y, 20);
	t.is(node.computedLayout.size.width, 100);
	t.is(node.computedLayout.size.height, 50);
});

test('LayoutNode.invalidateLayout invalidates node and ancestors', t => {
	const root = new LayoutNode();
	const child = new LayoutNode();

	root.addChild(child);
	root.setComputedLayout({x: 0, y: 0}, {width: 100, height: 100});
	child.setComputedLayout({x: 0, y: 0}, {width: 50, height: 50});

	child.invalidateLayout();

	t.false(child.computedLayout.isValid);
	t.false(root.computedLayout.isValid);
});

test('LayoutNode.bounds returns computed bounds', t => {
	const node = new LayoutNode();
	node.setComputedLayout({x: 10, y: 20}, {width: 100, height: 50});

	const bounds = node.bounds;

	t.deepEqual(bounds, {x: 10, y: 20, width: 100, height: 50});
});

test('LayoutNode.contentBounds returns bounds excluding padding', t => {
	const node = new LayoutNode();
	node.setPadding(EdgeInsets.all(10));
	node.setComputedLayout({x: 0, y: 0}, {width: 100, height: 100});

	const bounds = node.contentBounds;

	t.deepEqual(bounds, {x: 10, y: 10, width: 80, height: 80});
});

test('LayoutNode.totalBounds returns bounds including margin', t => {
	const node = new LayoutNode();
	node.setMargin(EdgeInsets.all(10));
	node.setComputedLayout({x: 10, y: 10}, {width: 100, height: 100});

	const bounds = node.totalBounds;

	t.deepEqual(bounds, {x: 0, y: 0, width: 120, height: 120});
});

test('LayoutNode.setWidth updates width', t => {
	const node = new LayoutNode();
	node.setWidth(100);
	t.is(node.width, 100);
});

test('LayoutNode.setHeight updates height', t => {
	const node = new LayoutNode();
	node.setHeight(50);
	t.is(node.height, 50);
});

test('LayoutNode.setFlexGrow updates flex grow', t => {
	const node = new LayoutNode();
	node.setFlexGrow(2);
	t.is(node.flex.flexGrow, 2);
});

test('LayoutNode.setFlexShrink updates flex shrink', t => {
	const node = new LayoutNode();
	node.setFlexShrink(0);
	t.is(node.flex.flexShrink, 0);
});

test('LayoutNode.setFlexBasis updates flex basis', t => {
	const node = new LayoutNode();
	node.setFlexBasis(100);
	t.is(node.flex.flexBasis, 100);
});

test('LayoutNode.setVisible updates visibility', t => {
	const node = new LayoutNode();
	node.setVisible(false);
	t.false(node.visible);
});

test('LayoutNode.clearCache clears layout cache', t => {
	const node = new LayoutNode();
	const constraints = {
		minWidth: 0,
		maxWidth: 100,
		minHeight: 0,
		maxHeight: 100,
	};

	node.cacheLayout(constraints, {
		position: {x: 0, y: 0},
		size: {width: 50, height: 50},
		isValid: true,
		timestamp: Date.now(),
	});

	node.clearCache();

	const cached = node.getCachedLayout(constraints);
	t.is(cached, undefined);
});
