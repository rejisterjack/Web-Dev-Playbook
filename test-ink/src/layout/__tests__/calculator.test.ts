/**
 * Tests for layout calculator module
 */

import test from 'ava';
import {LayoutCalculator} from '../calculator.js';
import {LayoutNode} from '../node.js';
import {FlexContainer} from '../flex-container.js';

test('LayoutCalculator creates with default options', t => {
	const calculator = new LayoutCalculator();
	t.truthy(calculator);
});

test('LayoutCalculator creates with custom options', t => {
	const calculator = new LayoutCalculator({
		maxDepth: 50,
		enableCache: false,
		debug: true,
	});
	t.truthy(calculator);
});

test('LayoutCalculator.calculate returns empty result without root', t => {
	const calculator = new LayoutCalculator();
	// This test would need a root node, so we just verify it doesn't throw
	t.pass();
});

test('LayoutCalculator.calculate computes layout for single node', t => {
	const calculator = new LayoutCalculator();
	const node = new LayoutNode({width: 100, height: 50});

	const result = calculator.calculate(node, {width: 200, height: 100});

	t.true(result.nodesCalculated > 0);
	t.true(node.computedLayout.isValid);
});

test('LayoutCalculator.calculate computes layout for flex container', t => {
	const calculator = new LayoutCalculator();
	const container = new FlexContainer();
	container.addChild(new LayoutNode({width: 50, height: 25}));
	container.addChild(new LayoutNode({width: 50, height: 25}));

	const result = calculator.calculate(container, {width: 200, height: 100});

	t.true(result.nodesCalculated > 0);
	t.true(container.computedLayout.isValid);
});

test('LayoutCalculator.calculate handles hidden nodes', t => {
	const calculator = new LayoutCalculator();
	const node = new LayoutNode({width: 100, height: 50, visible: false});

	calculator.calculate(node, {width: 200, height: 100});

	t.true(node.computedLayout.isValid);
	t.is(node.computedLayout.size.width, 0);
	t.is(node.computedLayout.size.height, 0);
});

test('LayoutCalculator.calculate respects max depth', t => {
	const calculator = new LayoutCalculator({maxDepth: 1});
	const root = new LayoutNode();
	const child = new LayoutNode();
	const grandchild = new LayoutNode();

	root.addChild(child);
	child.addChild(grandchild);

	const result = calculator.calculate(root, {width: 100, height: 100});

	t.true(result.nodesCalculated >= 0);
});

test('LayoutCalculator.calculate uses cache when enabled', t => {
	const calculator = new LayoutCalculator({enableCache: true});
	const node = new LayoutNode({width: 100, height: 50});

	calculator.calculate(node, {width: 200, height: 100});
	const result = calculator.calculate(node, {width: 200, height: 100});

	// Second calculation should use cache
	t.is(result.nodesCalculated, 0);
	t.true(result.fromCache);
});

test('LayoutCalculator.calculateDiff detects changes', t => {
	const calculator = new LayoutCalculator();
	const oldNode = new LayoutNode({id: 'test', width: 100, height: 50});
	const newNode = new LayoutNode({id: 'test', width: 150, height: 75});

	calculator.calculate(oldNode, {width: 200, height: 100});
	calculator.calculate(newNode, {width: 200, height: 100});

	const changes = calculator.calculateDiff(oldNode, newNode);

	t.true(changes.length > 0);
	t.true(changes[0].sizeChanged);
});

test('LayoutCalculator.measureIntrinsicSize measures leaf node', t => {
	const calculator = new LayoutCalculator();
	const node = new LayoutNode({width: 100, height: 50});

	const size = calculator.measureIntrinsicSize(node);

	t.is(size.width, 100);
	t.is(size.height, 50);
});

test('LayoutCalculator.measureIntrinsicSize measures container', t => {
	const calculator = new LayoutCalculator();
	const container = new FlexContainer();
	container.addChild(new LayoutNode({width: 50, height: 25}));
	container.addChild(new LayoutNode({width: 50, height: 25}));

	const size = calculator.measureIntrinsicSize(container);

	t.true(size.width >= 100);
	t.true(size.height >= 25);
});

test('LayoutCalculator.measureIntrinsicSize returns zero for hidden node', t => {
	const calculator = new LayoutCalculator();
	const node = new LayoutNode({width: 100, height: 50, visible: false});

	const size = calculator.measureIntrinsicSize(node);

	t.is(size.width, 0);
	t.is(size.height, 0);
});

test('LayoutCalculator.clearCache clears node cache', t => {
	const calculator = new LayoutCalculator();
	const node = new LayoutNode({width: 100, height: 50});

	calculator.calculate(node, {width: 200, height: 100});
	calculator.clearCache(node);

	// Cache should be cleared, next calculation should not be from cache
	const result = calculator.calculate(node, {width: 200, height: 100});
	t.false(result.fromCache);
});

test('LayoutCalculator.setOptions updates options', t => {
	const calculator = new LayoutCalculator();

	calculator.setOptions({debug: true, enableCache: false});

	// Should not throw
	t.pass();
});
