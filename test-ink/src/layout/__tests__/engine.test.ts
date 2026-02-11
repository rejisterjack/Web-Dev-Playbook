/**
 * Tests for layout engine module
 */

import test from 'ava';
import {LayoutEngine, LayoutEngineEvent} from '../engine.js';
import {LayoutNode} from '../node.js';
import {FlexContainer} from '../flex-container.js';

test('LayoutEngine creates with default options', t => {
	const engine = new LayoutEngine();
	t.is(engine.getRootNode(), null);
	t.deepEqual(engine.getViewportSize(), {width: 80, height: 24});
	t.false(engine.calculating);
	t.true(engine.dirty);
});

test('LayoutEngine creates with custom options', t => {
	const root = new LayoutNode();
	const engine = new LayoutEngine({
		rootNode: root,
		viewportSize: {width: 100, height: 50},
		enableCache: false,
		debug: true,
	});
	t.is(engine.getRootNode(), root);
	t.deepEqual(engine.getViewportSize(), {width: 100, height: 50});
});

test('LayoutEngine.setRootNode updates root and invalidates', t => {
	const engine = new LayoutEngine();
	const root = new LayoutNode();

	engine.setRootNode(root);

	t.is(engine.getRootNode(), root);
	t.true(engine.dirty);
});

test('LayoutEngine.setViewportSize updates size and invalidates', t => {
	const engine = new LayoutEngine();

	engine.setViewportSize({width: 100, height: 50});

	t.deepEqual(engine.getViewportSize(), {width: 100, height: 50});
	t.true(engine.dirty);
});

test('LayoutEngine.layout returns empty result without root', t => {
	const engine = new LayoutEngine();
	const result = engine.layout();

	t.deepEqual(result.size, {width: 0, height: 0});
	t.is(result.nodesCalculated, 0);
});

test('LayoutEngine.layout calculates layout', t => {
	const root = new FlexContainer();
	root.addChild(new LayoutNode({width: 20, height: 10}));

	const engine = new LayoutEngine({rootNode: root});
	const result = engine.layout();

	t.true(result.nodesCalculated > 0);
	t.true(root.computedLayout.isValid);
	t.false(engine.dirty);
});

test('LayoutEngine.layout uses cache when not dirty', t => {
	const root = new FlexContainer();
	root.addChild(new LayoutNode({width: 20, height: 10}));

	const engine = new LayoutEngine({rootNode: root});
	engine.layout();
	const result = engine.layout();

	t.true(result.fromCache);
	t.is(result.nodesCalculated, 0);
});

test('LayoutEngine.invalidate marks as dirty', t => {
	const engine = new LayoutEngine();
	engine.layout(); // Clear initial dirty state

	engine.invalidate();

	t.true(engine.dirty);
});

test('LayoutEngine.forceLayout forces recalculation', t => {
	const root = new FlexContainer();
	root.addChild(new LayoutNode({width: 20, height: 10}));

	const engine = new LayoutEngine({rootNode: root});
	engine.layout();
	const result = engine.forceLayout();

	t.false(result.fromCache);
	t.true(result.nodesCalculated > 0);
});

test('LayoutEngine.findNodeById finds node', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});
	root.addChild(child);

	const engine = new LayoutEngine({rootNode: root});

	t.is(engine.findNodeById('root'), root);
	t.is(engine.findNodeById('child'), child);
	t.is(engine.findNodeById('nonexistent'), undefined);
});

test('LayoutEngine.getNodeBounds returns bounds for valid node', t => {
	const root = new LayoutNode({id: 'root'});
	const engine = new LayoutEngine({rootNode: root});
	engine.layout();

	const bounds = engine.getNodeBounds('root');
	t.truthy(bounds);
});

test('LayoutEngine.getNodeBounds returns null for invalid node', t => {
	const engine = new LayoutEngine();
	const bounds = engine.getNodeBounds('nonexistent');
	t.is(bounds, null);
});

test('LayoutEngine.getAbsolutePosition calculates absolute position', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});
	root.addChild(child);

	const engine = new LayoutEngine({rootNode: root});
	engine.layout();

	const pos = engine.getAbsolutePosition('child');
	t.truthy(pos);
});

test('LayoutEngine.hitTest checks if point is in node', t => {
	const root = new LayoutNode({id: 'root', width: 100, height: 50});
	const engine = new LayoutEngine({rootNode: root});
	engine.layout();

	t.true(engine.hitTest('root', {x: 50, y: 25}));
	t.false(engine.hitTest('root', {x: 150, y: 25}));
});

test('LayoutEngine emits events', t => {
	const engine = new LayoutEngine();
	const events: string[] = [];

	engine.on(LayoutEngineEvent.LayoutInvalidated, () =>
		events.push('invalidated'),
	);
	engine.invalidate();

	t.true(events.includes('invalidated'));
});

test('LayoutEngine.off removes event listener', t => {
	const engine = new LayoutEngine();
	const events: string[] = [];
	const handler = () => events.push('invalidated');

	engine.on(LayoutEngineEvent.LayoutInvalidated, handler);
	engine.off(LayoutEngineEvent.LayoutInvalidated, handler);
	engine.invalidate();

	t.false(events.includes('invalidated'));
});

test('LayoutEngine.clearCache clears calculator cache', t => {
	const root = new FlexContainer();
	const engine = new LayoutEngine({rootNode: root});

	// Should not throw
	engine.clearCache();
	t.pass();
});

test('LayoutEngine.setOptions updates options', t => {
	const engine = new LayoutEngine();

	engine.setOptions({debug: true, debounceMs: 100});

	// Should not throw
	t.pass();
});

test('LayoutEngine.dispose cleans up resources', t => {
	const engine = new LayoutEngine();
	engine.dispose();

	t.throws(() => engine.layout(), {message: /disposed/});
});

test('LayoutEngine.createRow creates row container', t => {
	const row = LayoutEngine.createRow();
	t.true(row instanceof FlexContainer);
});

test('LayoutEngine.createColumn creates column container', t => {
	const column = LayoutEngine.createColumn();
	t.true(column instanceof FlexContainer);
});

test('LayoutEngine.scheduleLayout schedules debounced layout', t => {
	const engine = new LayoutEngine();
	engine.scheduleLayout();

	// Should not throw
	t.pass();
});

test('LayoutEngine.getAllAbsoluteBounds returns all bounds', t => {
	const root = new LayoutNode({id: 'root'});
	const child = new LayoutNode({id: 'child'});
	root.addChild(child);

	const engine = new LayoutEngine({rootNode: root});
	engine.layout();

	const bounds = engine.getAllAbsoluteBounds();
	t.true(bounds.has('root'));
	t.true(bounds.has('child'));
});
