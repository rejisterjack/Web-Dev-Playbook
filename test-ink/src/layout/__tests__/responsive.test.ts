/**
 * Tests for responsive layout module
 */

import test from 'ava';
import {
	ResponsiveLayout,
	Breakpoint,
	Orientation,
	DEFAULT_BREAKPOINTS,
	createResponsiveLayout,
	breakpointValues,
	adaptiveLayout,
} from '../responsive.js';
import {LayoutNode} from '../node.js';

test('ResponsiveLayout creates with default options', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
	});
	t.is(layout.breakpoint, Breakpoint.Medium);
	t.is(layout.orientation, Orientation.Landscape);
	t.deepEqual(layout.size, {width: 80, height: 24});
});

test('ResponsiveLayout creates with custom breakpoints', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
		breakpoints: {
			[Breakpoint.Small]: {
				minWidth: 0,
				maxWidth: 50,
				minHeight: 0,
				name: 'small',
			},
		},
	});
	t.truthy(layout);
});

test('ResponsiveLayout.update detects small breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Small]: () => new LayoutNode({id: 'small'}),
		},
	});

	layout.update({width: 50, height: 24});

	t.is(layout.breakpoint, Breakpoint.Small);
});

test('ResponsiveLayout.update detects medium breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode({id: 'medium'}),
		},
	});

	layout.update({width: 100, height: 24});

	t.is(layout.breakpoint, Breakpoint.Medium);
});

test('ResponsiveLayout.update detects large breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Large]: () => new LayoutNode({id: 'large'}),
		},
	});

	layout.update({width: 140, height: 24});

	t.is(layout.breakpoint, Breakpoint.Large);
});

test('ResponsiveLayout.update detects xlarge breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.XLarge]: () => new LayoutNode({id: 'xlarge'}),
		},
	});

	layout.update({width: 200, height: 24});

	t.is(layout.breakpoint, Breakpoint.XLarge);
});

test('ResponsiveLayout.update detects portrait orientation', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
	});

	layout.update({width: 24, height: 80});

	t.is(layout.orientation, Orientation.Portrait);
	t.true(layout.isPortrait);
	t.false(layout.isLandscape);
});

test('ResponsiveLayout.update detects landscape orientation', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
	});

	layout.update({width: 80, height: 24});

	t.is(layout.orientation, Orientation.Landscape);
	t.false(layout.isPortrait);
	t.true(layout.isLandscape);
});

test('ResponsiveLayout.update detects square orientation', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
	});

	layout.update({width: 50, height: 50});

	t.is(layout.orientation, Orientation.Square);
});

test('ResponsiveLayout.is returns true for matching breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode(),
		},
	});
	layout.update({width: 100, height: 24});

	t.true(layout.is(Breakpoint.Medium));
	t.false(layout.is(Breakpoint.Small));
});

test('ResponsiveLayout.is with array returns true for matching breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode(),
		},
	});
	layout.update({width: 100, height: 24});

	t.true(layout.is([Breakpoint.Small, Breakpoint.Medium]));
	t.false(layout.is([Breakpoint.Small, Breakpoint.Large]));
});

test('ResponsiveLayout.isAtLeast returns correct value', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 140, height: 24}); // Large

	t.true(layout.isAtLeast(Breakpoint.Small));
	t.true(layout.isAtLeast(Breakpoint.Medium));
	t.true(layout.isAtLeast(Breakpoint.Large));
	t.false(layout.isAtLeast(Breakpoint.XLarge));
});

test('ResponsiveLayout.isAtMost returns correct value', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 140, height: 24}); // Large

	t.false(layout.isAtMost(Breakpoint.Small));
	t.false(layout.isAtMost(Breakpoint.Medium));
	t.true(layout.isAtMost(Breakpoint.Large));
	t.true(layout.isAtMost(Breakpoint.XLarge));
});

test('ResponsiveLayout.update returns layout for breakpoint', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode({id: 'medium-layout'}),
		},
	});

	const node = layout.update({width: 100, height: 24});

	t.is(node.id, 'medium-layout');
});

test('ResponsiveLayout.update uses default layout when no match', t => {
	const layout = new ResponsiveLayout({
		layouts: {},
		defaultLayout: () => new LayoutNode({id: 'default'}),
	});

	const node = layout.update({width: 100, height: 24});

	t.is(node.id, 'default');
});

test('ResponsiveLayout.update uses portrait layout when available', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode({id: 'medium'}),
		},
		portraitLayout: () => new LayoutNode({id: 'portrait'}),
	});

	const node = layout.update({width: 24, height: 80}); // Portrait

	t.is(node.id, 'portrait');
});

test('ResponsiveLayout.update uses landscape layout when available', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode({id: 'medium'}),
		},
		landscapeLayout: () => new LayoutNode({id: 'landscape'}),
	});

	const node = layout.update({width: 80, height: 24}); // Landscape

	t.is(node.id, 'landscape');
});

test('ResponsiveLayout.forceRebuild rebuilds layout', t => {
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Medium]: () => new LayoutNode({id: 'medium'}),
		},
	});

	layout.update({width: 100, height: 24});
	const rebuilt = layout.forceRebuild({width: 100, height: 24});

	t.truthy(rebuilt);
	t.true(layout.currentState.layoutChanged);
});

test('ResponsiveLayout.getValue returns value for current breakpoint', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 100, height: 24}); // Medium

	const value = layout.getValue({
		[Breakpoint.Medium]: 'medium-value',
		default: 'default-value',
	});

	t.is(value, 'medium-value');
});

test('ResponsiveLayout.getValue falls back to smaller breakpoints', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 140, height: 24}); // Large

	const value = layout.getValue({
		[Breakpoint.Medium]: 'medium-value',
		default: 'default-value',
	});

	t.is(value, 'medium-value');
});

test('ResponsiveLayout.getValue returns default when no match', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 50, height: 24}); // Small

	const value = layout.getValue({
		[Breakpoint.Medium]: 'medium-value',
		default: 'default-value',
	});

	t.is(value, 'default-value');
});

test('ResponsiveLayout.getBreakpointConfig returns config', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	const config = layout.getBreakpointConfig(Breakpoint.Medium);

	t.is(config.name, 'medium');
});

test('ResponsiveLayout calls onBreakpointChange callback', t => {
	let called = false;
	const layout = new ResponsiveLayout({
		layouts: {
			[Breakpoint.Small]: () => new LayoutNode(),
			[Breakpoint.Medium]: () => new LayoutNode(),
		},
		onBreakpointChange: () => {
			called = true;
		},
	});

	layout.update({width: 100, height: 24}); // Medium
	layout.update({width: 50, height: 24}); // Small

	t.true(called);
});

test('ResponsiveLayout calls onOrientationChange callback', t => {
	let called = false;
	const layout = new ResponsiveLayout({
		layouts: {},
		onOrientationChange: () => {
			called = true;
		},
	});

	layout.update({width: 80, height: 24}); // Landscape
	layout.update({width: 24, height: 80}); // Portrait

	t.true(called);
});

test('ResponsiveLayout.dispose cleans up', t => {
	const layout = new ResponsiveLayout({layouts: {}});
	layout.update({width: 100, height: 24});

	layout.dispose();

	t.is(layout.layout, null);
});

test('DEFAULT_BREAKPOINTS has correct values', t => {
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.Small].maxWidth, 80);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.Medium].minWidth, 80);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.Medium].maxWidth, 120);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.Large].minWidth, 120);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.Large].maxWidth, 160);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.XLarge].minWidth, 160);
	t.is(DEFAULT_BREAKPOINTS[Breakpoint.XLarge].maxWidth, Infinity);
});

test('createResponsiveLayout creates ResponsiveLayout', t => {
	const layout = createResponsiveLayout({layouts: {}});
	t.true(layout instanceof ResponsiveLayout);
});

test('breakpointValues creates value map', t => {
	const values = breakpointValues('small', 'medium', 'large', 'xlarge');

	t.is(values[Breakpoint.Small], 'small');
	t.is(values[Breakpoint.Medium], 'medium');
	t.is(values[Breakpoint.Large], 'large');
	t.is(values[Breakpoint.XLarge], 'xlarge');
});

test('breakpointValues with partial values', t => {
	const values = breakpointValues('small', 'medium');

	t.is(values[Breakpoint.Small], 'small');
	t.is(values[Breakpoint.Medium], 'medium');
	t.is(values[Breakpoint.Large], undefined);
});

test('adaptiveLayout creates layout factory', t => {
	const factory = adaptiveLayout({
		[Breakpoint.Medium]: () => new LayoutNode({id: 'medium'}),
		default: () => new LayoutNode({id: 'default'}),
	});

	const node = factory({width: 100, height: 24});
	t.is(node.id, 'medium');
});
