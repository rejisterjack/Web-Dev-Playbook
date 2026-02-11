/**
 * Tests for layout types module
 */

import test from 'ava';
import {
	EdgeInsets,
	Alignment,
	LayoutConstraints,
	HorizontalAlignment,
	VerticalAlignment,
	LayoutDirection,
	Overflow,
} from '../types.js';

test('EdgeInsets.all creates uniform insets', t => {
	const insets = EdgeInsets.all(10);
	t.deepEqual(insets, {top: 10, right: 10, bottom: 10, left: 10});
});

test('EdgeInsets.symmetric creates symmetric insets', t => {
	const insets = EdgeInsets.symmetric(5, 10);
	t.deepEqual(insets, {top: 5, right: 10, bottom: 5, left: 10});
});

test('EdgeInsets.horizontal creates horizontal insets', t => {
	const insets = EdgeInsets.horizontal(10);
	t.deepEqual(insets, {top: 0, right: 10, bottom: 0, left: 10});
});

test('EdgeInsets.vertical creates vertical insets', t => {
	const insets = EdgeInsets.vertical(10);
	t.deepEqual(insets, {top: 10, right: 0, bottom: 10, left: 0});
});

test('EdgeInsets.onlyTop creates top insets', t => {
	const insets = EdgeInsets.onlyTop(10);
	t.deepEqual(insets, {top: 10, right: 0, bottom: 0, left: 0});
});

test('EdgeInsets.onlyRight creates right insets', t => {
	const insets = EdgeInsets.onlyRight(10);
	t.deepEqual(insets, {top: 0, right: 10, bottom: 0, left: 0});
});

test('EdgeInsets.onlyBottom creates bottom insets', t => {
	const insets = EdgeInsets.onlyBottom(10);
	t.deepEqual(insets, {top: 0, right: 0, bottom: 10, left: 0});
});

test('EdgeInsets.onlyLeft creates left insets', t => {
	const insets = EdgeInsets.onlyLeft(10);
	t.deepEqual(insets, {top: 0, right: 0, bottom: 0, left: 10});
});

test('EdgeInsets.zero creates zero insets', t => {
	const insets = EdgeInsets.zero();
	t.deepEqual(insets, {top: 0, right: 0, bottom: 0, left: 0});
});

test('Alignment.topLeft has correct values', t => {
	t.deepEqual(Alignment.topLeft, {
		horizontal: HorizontalAlignment.Left,
		vertical: VerticalAlignment.Top,
	});
});

test('Alignment.center has correct values', t => {
	t.deepEqual(Alignment.center, {
		horizontal: HorizontalAlignment.Center,
		vertical: VerticalAlignment.Center,
	});
});

test('Alignment.bottomRight has correct values', t => {
	t.deepEqual(Alignment.bottomRight, {
		horizontal: HorizontalAlignment.Right,
		vertical: VerticalAlignment.Bottom,
	});
});

test('LayoutConstraints.tight creates tight constraints', t => {
	const constraints = LayoutConstraints.tight({width: 100, height: 50});
	t.deepEqual(constraints, {
		minWidth: 100,
		maxWidth: 100,
		minHeight: 50,
		maxHeight: 50,
	});
});

test('LayoutConstraints.tightWidth creates tight width constraints', t => {
	const constraints = LayoutConstraints.tightWidth(100);
	t.deepEqual(constraints, {
		minWidth: 100,
		maxWidth: 100,
		minHeight: 0,
		maxHeight: Infinity,
	});
});

test('LayoutConstraints.tightHeight creates tight height constraints', t => {
	const constraints = LayoutConstraints.tightHeight(50);
	t.deepEqual(constraints, {
		minWidth: 0,
		maxWidth: Infinity,
		minHeight: 50,
		maxHeight: 50,
	});
});

test('LayoutConstraints.loose creates loose constraints', t => {
	const constraints = LayoutConstraints.loose();
	t.deepEqual(constraints, {
		minWidth: 0,
		maxWidth: Infinity,
		minHeight: 0,
		maxHeight: Infinity,
	});
});

test('LayoutConstraints.maxSize creates max size constraints', t => {
	const constraints = LayoutConstraints.maxSize({width: 100, height: 50});
	t.deepEqual(constraints, {
		minWidth: 0,
		maxWidth: 100,
		minHeight: 0,
		maxHeight: 50,
	});
});

test('LayoutConstraints.minSize creates min size constraints', t => {
	const constraints = LayoutConstraints.minSize({width: 100, height: 50});
	t.deepEqual(constraints, {
		minWidth: 100,
		maxWidth: Infinity,
		minHeight: 50,
		maxHeight: Infinity,
	});
});

test('LayoutConstraints.expand creates expand constraints', t => {
	const constraints = LayoutConstraints.expand();
	t.deepEqual(constraints, {
		minWidth: Infinity,
		maxWidth: Infinity,
		minHeight: Infinity,
		maxHeight: Infinity,
	});
});

test('HorizontalAlignment has correct values', t => {
	t.is(HorizontalAlignment.Left as string, 'left');
	t.is(HorizontalAlignment.Center as string, 'center');
	t.is(HorizontalAlignment.Right as string, 'right');
	t.is(HorizontalAlignment.Stretch as string, 'stretch');
});

test('VerticalAlignment has correct values', t => {
	t.is(VerticalAlignment.Top as string, 'top');
	t.is(VerticalAlignment.Center as string, 'center');
	t.is(VerticalAlignment.Bottom as string, 'bottom');
	t.is(VerticalAlignment.Stretch as string, 'stretch');
});

test('LayoutDirection has correct values', t => {
	t.is(LayoutDirection.LTR as string, 'ltr');
	t.is(LayoutDirection.RTL as string, 'rtl');
});

test('Overflow has correct values', t => {
	t.is(Overflow.Clip as string, 'clip');
	t.is(Overflow.Visible as string, 'visible');
	t.is(Overflow.Scroll as string, 'scroll');
	t.is(Overflow.Hidden as string, 'hidden');
});
