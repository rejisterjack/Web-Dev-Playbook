/**
 * Tests for layout resolver module
 */

import test from 'ava';
import {LayoutResolver} from '../resolver.js';

test('LayoutResolver.resolveDimension resolves fixed number', t => {
	const result = LayoutResolver.resolveDimension(
		50,
		100,
		{minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100},
		'width',
	);
	t.is(result, 50);
});

test('LayoutResolver.resolveDimension clamps to min', t => {
	const result = LayoutResolver.resolveDimension(
		5,
		100,
		{minWidth: 10, maxWidth: 100, minHeight: 0, maxHeight: 100},
		'width',
	);
	t.is(result, 10);
});

test('LayoutResolver.resolveDimension clamps to max', t => {
	const result = LayoutResolver.resolveDimension(
		150,
		100,
		{minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100},
		'width',
	);
	t.is(result, 100);
});

test('LayoutResolver.resolveDimension resolves percentage', t => {
	const result = LayoutResolver.resolveDimension(
		'50%',
		100,
		{minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100},
		'width',
	);
	t.is(result, 50);
});

test('LayoutResolver.resolveDimension handles auto', t => {
	const result = LayoutResolver.resolveDimension(
		'auto',
		100,
		{minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100},
		'width',
	);
	t.is(result, 100);
});

test('LayoutResolver.resolveSize resolves both dimensions', t => {
	const result = LayoutResolver.resolveSize(
		50,
		'50%',
		{containerWidth: 100, containerHeight: 100},
		{minWidth: 0, maxWidth: 100, minHeight: 0, maxHeight: 100},
	);
	t.is(result.width, 50);
	t.is(result.height, 50);
	t.false(result.widthConstrained);
	t.false(result.heightConstrained);
});

test('LayoutResolver.resolveConstraints normalizes constraints', t => {
	const result = LayoutResolver.resolveConstraints({
		minWidth: 50,
		maxWidth: 30, // Invalid: max < min
		minHeight: -10, // Invalid: negative
		maxHeight: 100,
	});
	t.is(result.minWidth, 50);
	t.is(result.maxWidth, 50); // Should be adjusted to min
	t.is(result.minHeight, 0); // Should be clamped to 0
	t.is(result.maxHeight, 100);
});

test('LayoutResolver.resolveFlexSizes distributes grow space', t => {
	const items = [
		{flexGrow: 1, flexShrink: 1, flexBasis: 20, baseSize: 20},
		{flexGrow: 1, flexShrink: 1, flexBasis: 20, baseSize: 20},
	];
	const sizes = LayoutResolver.resolveFlexSizes(items, 100);

	// Total base: 40, remaining: 60, each gets 30 extra
	t.is(sizes[0], 50);
	t.is(sizes[1], 50);
});

test('LayoutResolver.resolveFlexSizes distributes shrink space', t => {
	const items = [
		{flexGrow: 0, flexShrink: 1, flexBasis: 50, baseSize: 50},
		{flexGrow: 0, flexShrink: 1, flexBasis: 50, baseSize: 50},
	];
	const sizes = LayoutResolver.resolveFlexSizes(items, 60);

	// Total base: 100, need to shrink by 40
	t.true(sizes[0] < 50);
	t.true(sizes[1] < 50);
	t.is(sizes[0] + sizes[1], 60);
});

test('LayoutResolver.resolvePercentage calculates correctly', t => {
	const result = LayoutResolver.resolvePercentage(50, 100, {min: 0, max: 100});
	t.is(result, 50);
});

test('LayoutResolver.resolvePercentage clamps to constraints', t => {
	const result = LayoutResolver.resolvePercentage(200, 100, {min: 0, max: 100});
	t.is(result, 100);
});

test('LayoutResolver.resolveEdgeInsets resolves numeric values', t => {
	const result = LayoutResolver.resolveEdgeInsets(
		{top: 10, right: 20, bottom: 30, left: 40},
		100,
		100,
	);
	t.deepEqual(result, {top: 10, right: 20, bottom: 30, left: 40});
});

test('LayoutResolver.resolveEdgeInsets resolves percentage values', t => {
	const result = LayoutResolver.resolveEdgeInsets(
		{top: '10%', right: '20%', bottom: '30%', left: '40%'},
		100,
		100,
	);
	t.deepEqual(result, {top: 10, right: 20, bottom: 30, left: 40});
});

test('LayoutResolver.resolveOverConstrained prioritizes constraints correctly', t => {
	const result = LayoutResolver.resolveOverConstrained(
		{width: 50, height: 50},
		{minWidth: 100, maxWidth: 200, minHeight: 100, maxHeight: 200},
	);
	t.is(result.width, 100); // Should use min
	t.is(result.height, 100); // Should use min
});

test('LayoutResolver.mergeConstraints takes most restrictive', t => {
	const result = LayoutResolver.mergeConstraints(
		{minWidth: 10, maxWidth: 100, minHeight: 10, maxHeight: 100},
		{minWidth: 20, maxWidth: 80, minHeight: 20, maxHeight: 80},
	);
	t.is(result.minWidth, 20); // Higher min
	t.is(result.maxWidth, 80); // Lower max
	t.is(result.minHeight, 20);
	t.is(result.maxHeight, 80);
});

test('LayoutResolver.satisfiesConstraints checks correctly', t => {
	const constraints = {
		minWidth: 10,
		maxWidth: 100,
		minHeight: 10,
		maxHeight: 100,
	};

	t.true(
		LayoutResolver.satisfiesConstraints({width: 50, height: 50}, constraints),
	);
	t.false(
		LayoutResolver.satisfiesConstraints({width: 5, height: 50}, constraints),
	);
	t.false(
		LayoutResolver.satisfiesConstraints({width: 150, height: 50}, constraints),
	);
});

test('LayoutResolver.getTightSize returns min constraints', t => {
	const constraints = {
		minWidth: 10,
		maxWidth: 100,
		minHeight: 20,
		maxHeight: 200,
	};
	const result = LayoutResolver.getTightSize(constraints);
	t.deepEqual(result, {width: 10, height: 20});
});

test('LayoutResolver.getLooseSize returns max constraints', t => {
	const constraints = {
		minWidth: 10,
		maxWidth: 100,
		minHeight: 20,
		maxHeight: 200,
	};
	const result = LayoutResolver.getLooseSize(constraints);
	t.deepEqual(result, {width: 100, height: 200});
});

test('LayoutResolver.isTight returns true when min equals max', t => {
	t.true(
		LayoutResolver.isTight({
			minWidth: 100,
			maxWidth: 100,
			minHeight: 50,
			maxHeight: 50,
		}),
	);
	t.false(
		LayoutResolver.isTight({
			minWidth: 100,
			maxWidth: 200,
			minHeight: 50,
			maxHeight: 50,
		}),
	);
});

test('LayoutResolver.isLoose returns true for zero to infinity', t => {
	t.true(
		LayoutResolver.isLoose({
			minWidth: 0,
			maxWidth: Infinity,
			minHeight: 0,
			maxHeight: Infinity,
		}),
	);
	t.false(
		LayoutResolver.isLoose({
			minWidth: 10,
			maxWidth: Infinity,
			minHeight: 0,
			maxHeight: Infinity,
		}),
	);
});

test('LayoutResolver.adjustConstraints applies adjustments', t => {
	const base = {minWidth: 10, maxWidth: 100, minHeight: 10, maxHeight: 100};
	const result = LayoutResolver.adjustConstraints(base, {
		minWidth: 20,
		maxHeight: 80,
	});
	t.is(result.minWidth, 20);
	t.is(result.maxWidth, 100);
	t.is(result.minHeight, 10);
	t.is(result.maxHeight, 80);
});

test('LayoutResolver.deflateConstraints subtracts insets', t => {
	const constraints = {
		minWidth: 100,
		maxWidth: 200,
		minHeight: 100,
		maxHeight: 200,
	};
	const insets = {top: 10, right: 20, bottom: 10, left: 20};
	const result = LayoutResolver.deflateConstraints(constraints, insets);
	t.is(result.minWidth, 60); // 100 - 20 - 20
	t.is(result.maxWidth, 160); // 200 - 20 - 20
	t.is(result.minHeight, 80); // 100 - 10 - 10
	t.is(result.maxHeight, 180); // 200 - 10 - 10
});
