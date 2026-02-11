/**
 * Tests for flex direction module
 */

import test from 'ava';
import {
	FlexDirection,
	FlexWrap,
	JustifyContent,
	AlignItems,
	AlignContent,
	DEFAULT_FLEX_CONFIG,
	DEFAULT_FLEX_ITEM,
	isRowDirection,
	isColumnDirection,
	isReverseDirection,
	getMainAxisDimension,
	getCrossAxisDimension,
} from '../flex-direction.js';

test('FlexDirection enum has correct values', t => {
	t.is(FlexDirection.Row as string, 'row');
	t.is(FlexDirection.Column as string, 'column');
	t.is(FlexDirection.RowReverse as string, 'row-reverse');
	t.is(FlexDirection.ColumnReverse as string, 'column-reverse');
});

test('FlexWrap enum has correct values', t => {
	t.is(FlexWrap.NoWrap as string, 'nowrap');
	t.is(FlexWrap.Wrap as string, 'wrap');
	t.is(FlexWrap.WrapReverse as string, 'wrap-reverse');
});

test('JustifyContent enum has correct values', t => {
	t.is(JustifyContent.FlexStart as string, 'flex-start');
	t.is(JustifyContent.FlexEnd as string, 'flex-end');
	t.is(JustifyContent.Center as string, 'center');
	t.is(JustifyContent.SpaceBetween as string, 'space-between');
	t.is(JustifyContent.SpaceAround as string, 'space-around');
	t.is(JustifyContent.SpaceEvenly as string, 'space-evenly');
});

test('AlignItems enum has correct values', t => {
	t.is(AlignItems.FlexStart as string, 'flex-start');
	t.is(AlignItems.FlexEnd as string, 'flex-end');
	t.is(AlignItems.Center as string, 'center');
	t.is(AlignItems.Stretch as string, 'stretch');
	t.is(AlignItems.Baseline as string, 'baseline');
});

test('AlignContent enum has correct values', t => {
	t.is(AlignContent.FlexStart as string, 'flex-start');
	t.is(AlignContent.FlexEnd as string, 'flex-end');
	t.is(AlignContent.Center as string, 'center');
	t.is(AlignContent.Stretch as string, 'stretch');
	t.is(AlignContent.SpaceBetween as string, 'space-between');
	t.is(AlignContent.SpaceAround as string, 'space-around');
});

test('DEFAULT_FLEX_CONFIG has correct defaults', t => {
	t.is(DEFAULT_FLEX_CONFIG.direction, FlexDirection.Row);
	t.is(DEFAULT_FLEX_CONFIG.wrap, FlexWrap.NoWrap);
	t.is(DEFAULT_FLEX_CONFIG.justifyContent, JustifyContent.FlexStart);
	t.is(DEFAULT_FLEX_CONFIG.alignItems, AlignItems.Stretch);
	t.is(DEFAULT_FLEX_CONFIG.alignContent, AlignContent.Stretch);
});

test('DEFAULT_FLEX_ITEM has correct defaults', t => {
	t.is(DEFAULT_FLEX_ITEM.flexGrow, 0);
	t.is(DEFAULT_FLEX_ITEM.flexShrink, 1);
	t.is(DEFAULT_FLEX_ITEM.flexBasis, 'auto');
	t.is(DEFAULT_FLEX_ITEM.alignSelf, 'auto');
});

test('isRowDirection returns true for row directions', t => {
	t.true(isRowDirection(FlexDirection.Row));
	t.true(isRowDirection(FlexDirection.RowReverse));
});

test('isRowDirection returns false for column directions', t => {
	t.false(isRowDirection(FlexDirection.Column));
	t.false(isRowDirection(FlexDirection.ColumnReverse));
});

test('isColumnDirection returns true for column directions', t => {
	t.true(isColumnDirection(FlexDirection.Column));
	t.true(isColumnDirection(FlexDirection.ColumnReverse));
});

test('isColumnDirection returns false for row directions', t => {
	t.false(isColumnDirection(FlexDirection.Row));
	t.false(isColumnDirection(FlexDirection.RowReverse));
});

test('isReverseDirection returns true for reverse directions', t => {
	t.true(isReverseDirection(FlexDirection.RowReverse));
	t.true(isReverseDirection(FlexDirection.ColumnReverse));
});

test('isReverseDirection returns false for normal directions', t => {
	t.false(isReverseDirection(FlexDirection.Row));
	t.false(isReverseDirection(FlexDirection.Column));
});

test('getMainAxisDimension returns width for row directions', t => {
	t.is(getMainAxisDimension(FlexDirection.Row), 'width');
	t.is(getMainAxisDimension(FlexDirection.RowReverse), 'width');
});

test('getMainAxisDimension returns height for column directions', t => {
	t.is(getMainAxisDimension(FlexDirection.Column), 'height');
	t.is(getMainAxisDimension(FlexDirection.ColumnReverse), 'height');
});

test('getCrossAxisDimension returns height for row directions', t => {
	t.is(getCrossAxisDimension(FlexDirection.Row), 'height');
	t.is(getCrossAxisDimension(FlexDirection.RowReverse), 'height');
});

test('getCrossAxisDimension returns width for column directions', t => {
	t.is(getCrossAxisDimension(FlexDirection.Column), 'width');
	t.is(getCrossAxisDimension(FlexDirection.ColumnReverse), 'width');
});
