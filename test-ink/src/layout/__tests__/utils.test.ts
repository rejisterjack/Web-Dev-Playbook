/**
 * Tests for layout utilities module
 */

import test from 'ava';
import {
	clamp,
	lerp,
	containsPoint,
	intersectRect,
	expandRect,
	contractRect,
	unionRect,
	rectsIntersect,
	roundLayoutValue,
	floorLayoutValue,
	ceilLayoutValue,
	getHorizontalPadding,
	getVerticalPadding,
	getTotalPadding,
	createSize,
	createRect,
	isValidSize,
	isValidRect,
	rectArea,
	isEmptyRect,
	sizesEqual,
	positionsEqual,
	rectsEqual,
	parsePercentage,
	resolveDimension,
	generateHash,
	cloneSize,
	cloneRect,
	cloneEdgeInsets,
} from '../utils.js';
import {EdgeInsets} from '../types.js';

// clamp
test('clamp returns value within range', t => {
	t.is(clamp(5, 0, 10), 5);
});

test('clamp returns min when value is below', t => {
	t.is(clamp(-5, 0, 10), 0);
});

test('clamp returns max when value is above', t => {
	t.is(clamp(15, 0, 10), 10);
});

// lerp
test('lerp interpolates correctly at t=0', t => {
	t.is(lerp(0, 10, 0), 0);
});

test('lerp interpolates correctly at t=1', t => {
	t.is(lerp(0, 10, 1), 10);
});

test('lerp interpolates correctly at t=0.5', t => {
	t.is(lerp(0, 10, 0.5), 5);
});

test('lerp clamps t to [0, 1]', t => {
	t.is(lerp(0, 10, -1), 0);
	t.is(lerp(0, 10, 2), 10);
});

// containsPoint
test('containsPoint returns true for point inside rect', t => {
	const rect = {x: 0, y: 0, width: 10, height: 10};
	const point = {x: 5, y: 5};
	t.true(containsPoint(rect, point));
});

test('containsPoint returns false for point outside rect', t => {
	const rect = {x: 0, y: 0, width: 10, height: 10};
	const point = {x: 15, y: 15};
	t.false(containsPoint(rect, point));
});

test('containsPoint returns false for point on edge', t => {
	const rect = {x: 0, y: 0, width: 10, height: 10};
	t.false(containsPoint(rect, {x: 10, y: 5}));
	t.false(containsPoint(rect, {x: 5, y: 10}));
});

// intersectRect
test('intersectRect returns intersection for overlapping rects', t => {
	const rect1 = {x: 0, y: 0, width: 10, height: 10};
	const rect2 = {x: 5, y: 5, width: 10, height: 10};
	const result = intersectRect(rect1, rect2);
	t.deepEqual(result, {x: 5, y: 5, width: 5, height: 5});
});

test('intersectRect returns null for non-overlapping rects', t => {
	const rect1 = {x: 0, y: 0, width: 10, height: 10};
	const rect2 = {x: 20, y: 20, width: 10, height: 10};
	t.is(intersectRect(rect1, rect2), null);
});

// expandRect
test('expandRect expands rect by padding', t => {
	const rect = {x: 10, y: 10, width: 20, height: 20};
	const padding = {top: 2, right: 3, bottom: 4, left: 5};
	const result = expandRect(rect, padding);
	t.deepEqual(result, {x: 5, y: 8, width: 28, height: 26});
});

// contractRect
test('contractRect contracts rect by padding', t => {
	const rect = {x: 10, y: 10, width: 20, height: 20};
	const padding = {top: 2, right: 3, bottom: 4, left: 5};
	const result = contractRect(rect, padding);
	t.deepEqual(result, {x: 15, y: 12, width: 12, height: 14});
});

test('contractRect ensures non-negative size', t => {
	const rect = {x: 10, y: 10, width: 5, height: 5};
	const padding = {top: 10, right: 10, bottom: 10, left: 10};
	const result = contractRect(rect, padding);
	t.deepEqual(result, {x: 20, y: 20, width: 0, height: 0});
});

// unionRect
test('unionRect returns union of two rects', t => {
	const rect1 = {x: 0, y: 0, width: 10, height: 10};
	const rect2 = {x: 5, y: 5, width: 10, height: 10};
	const result = unionRect(rect1, rect2);
	t.deepEqual(result, {x: 0, y: 0, width: 15, height: 15});
});

// rectsIntersect
test('rectsIntersect returns true for overlapping rects', t => {
	const rect1 = {x: 0, y: 0, width: 10, height: 10};
	const rect2 = {x: 5, y: 5, width: 10, height: 10};
	t.true(rectsIntersect(rect1, rect2));
});

test('rectsIntersect returns false for non-overlapping rects', t => {
	const rect1 = {x: 0, y: 0, width: 10, height: 10};
	const rect2 = {x: 20, y: 20, width: 10, height: 10};
	t.false(rectsIntersect(rect1, rect2));
});

// roundLayoutValue
test('roundLayoutValue rounds correctly', t => {
	t.is(roundLayoutValue(5.4), 5);
	t.is(roundLayoutValue(5.5), 6);
});

test('roundLayoutValue handles negative zero', t => {
	t.is(roundLayoutValue(-0), 0);
	t.is(roundLayoutValue(0), 0);
});

// floorLayoutValue
test('floorLayoutValue floors and ensures non-negative', t => {
	t.is(floorLayoutValue(5.9), 5);
	t.is(floorLayoutValue(-5), 0);
});

// ceilLayoutValue
test('ceilLayoutValue ceils correctly', t => {
	t.is(ceilLayoutValue(5.1), 6);
	t.is(ceilLayoutValue(5.9), 6);
	t.is(ceilLayoutValue(5), 5);
});

// getHorizontalPadding
test('getHorizontalPadding returns sum of left and right', t => {
	const insets = {top: 1, right: 2, bottom: 3, left: 4};
	t.is(getHorizontalPadding(insets), 6);
});

// getVerticalPadding
test('getVerticalPadding returns sum of top and bottom', t => {
	const insets = {top: 1, right: 2, bottom: 3, left: 4};
	t.is(getVerticalPadding(insets), 4);
});

// getTotalPadding
test('getTotalPadding returns sum of all sides', t => {
	const insets = {top: 1, right: 2, bottom: 3, left: 4};
	t.is(getTotalPadding(insets), 10);
});

// createSize
test('createSize creates valid size', t => {
	t.deepEqual(createSize(10, 20), {width: 10, height: 20});
});

test('createSize ensures non-negative dimensions', t => {
	t.deepEqual(createSize(-10, -20), {width: 0, height: 0});
});

// createRect
test('createRect creates valid rect', t => {
	t.deepEqual(createRect(10, 20, 30, 40), {
		x: 10,
		y: 20,
		width: 30,
		height: 40,
	});
});

test('createRect ensures non-negative dimensions', t => {
	t.deepEqual(createRect(10, 20, -30, -40), {
		x: 10,
		y: 20,
		width: 0,
		height: 0,
	});
});

// isValidSize
test('isValidSize returns true for valid size', t => {
	t.true(isValidSize({width: 10, height: 20}));
});

test('isValidSize returns false for negative dimensions', t => {
	t.false(isValidSize({width: -10, height: 20}));
	t.false(isValidSize({width: 10, height: -20}));
});

test('isValidSize returns false for non-finite values', t => {
	t.false(isValidSize({width: Infinity, height: 20}));
	t.false(isValidSize({width: 10, height: NaN}));
});

// isValidRect
test('isValidRect returns true for valid rect', t => {
	t.true(isValidRect({x: 0, y: 0, width: 10, height: 10}));
});

test('isValidRect returns false for negative dimensions', t => {
	t.false(isValidRect({x: 0, y: 0, width: -10, height: 10}));
});

// rectArea
test('rectArea calculates area correctly', t => {
	t.is(rectArea({x: 0, y: 0, width: 10, height: 20}), 200);
});

// isEmptyRect
test('isEmptyRect returns true for zero or negative area', t => {
	t.true(isEmptyRect({x: 0, y: 0, width: 0, height: 10}));
	t.true(isEmptyRect({x: 0, y: 0, width: 10, height: 0}));
	t.true(isEmptyRect({x: 0, y: 0, width: -10, height: 10}));
});

test('isEmptyRect returns false for positive area', t => {
	t.false(isEmptyRect({x: 0, y: 0, width: 10, height: 10}));
});

// sizesEqual
test('sizesEqual returns true for equal sizes', t => {
	t.true(sizesEqual({width: 10, height: 20}, {width: 10, height: 20}));
});

test('sizesEqual returns false for different sizes', t => {
	t.false(sizesEqual({width: 10, height: 20}, {width: 15, height: 20}));
});

// positionsEqual
test('positionsEqual returns true for equal positions', t => {
	t.true(positionsEqual({x: 10, y: 20}, {x: 10, y: 20}));
});

test('positionsEqual returns false for different positions', t => {
	t.false(positionsEqual({x: 10, y: 20}, {x: 15, y: 20}));
});

// rectsEqual
test('rectsEqual returns true for equal rects', t => {
	t.true(
		rectsEqual(
			{x: 0, y: 0, width: 10, height: 10},
			{x: 0, y: 0, width: 10, height: 10},
		),
	);
});

test('rectsEqual returns false for different rects', t => {
	t.false(
		rectsEqual(
			{x: 0, y: 0, width: 10, height: 10},
			{x: 1, y: 0, width: 10, height: 10},
		),
	);
});

// parsePercentage
test('parsePercentage parses valid percentage', t => {
	t.is(parsePercentage('50%'), 0.5);
	t.is(parsePercentage('100%'), 1);
	t.is(parsePercentage('0%'), 0);
});

test('parsePercentage returns null for invalid strings', t => {
	t.is(parsePercentage('50'), null);
	t.is(parsePercentage('abc'), null);
	t.is(parsePercentage(''), null);
});

// resolveDimension
test('resolveDimension returns number directly', t => {
	t.is(resolveDimension(50, 100), 50);
});

test('resolveDimension parses percentage', t => {
	t.is(resolveDimension('50%', 100), 50);
});

test('resolveDimension returns null for auto', t => {
	t.is(resolveDimension('auto', 100), null);
});

// generateHash
test('generateHash creates consistent hash', t => {
	t.is(generateHash('a', 1, true), 'a|1|true');
});

// cloneSize
test('cloneSize creates a copy', t => {
	const original = {width: 10, height: 20};
	const copy = cloneSize(original);
	t.deepEqual(copy, original);
	t.not(copy, original);
});

// cloneRect
test('cloneRect creates a copy', t => {
	const original = {x: 0, y: 0, width: 10, height: 10};
	const copy = cloneRect(original);
	t.deepEqual(copy, original);
	t.not(copy, original);
});

// cloneEdgeInsets
test('cloneEdgeInsets creates a copy', t => {
	const original = {top: 1, right: 2, bottom: 3, left: 4};
	const copy = cloneEdgeInsets(original);
	t.deepEqual(copy, original);
	t.not(copy, original);
});
