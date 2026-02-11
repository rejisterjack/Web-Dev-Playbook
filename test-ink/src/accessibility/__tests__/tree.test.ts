/**
 * Accessibility Tree Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {AccessibilityTree, TraversalOrder} from '../tree.js';

describe('AccessibilityTree', () => {
	let tree: AccessibilityTree;

	beforeEach(() => {
		tree = new AccessibilityTree();
	});

	describe('constructor', () => {
		it('should create tree with no root', () => {
			expect(tree.root).toBe(null);
		});

		it('should not be built initially', () => {
			expect(tree.built).toBe(false);
		});
	});

	describe('build', () => {
		it('should build tree from widget', () => {
			// Mock widget
			const mockWidget = {
				id: 'test-widget',
				type: 'test',
				props: {},
				state: {},
				parent: null,
				children: [],
				layoutNode: null,
				isMounted: false,
				mount: () => {},
				update: () => {},
				unmount: () => {},
				render: () => {},
				handleEvent: () => false,
				setState: () => {},
				getBounds: () => null,
				containsPoint: () => false,
				focus: () => false,
				blur: () => {},
				isFocusable: () => false,
				destroy: () => {},
			};

			tree.build(mockWidget as any);
			expect(tree.built).toBe(true);
			expect(tree.root).not.toBe(null);
		});
	});

	describe('clear', () => {
		it('should clear tree', () => {
			const mockWidget = {
				id: 'test-widget',
				type: 'test',
				props: {},
				state: {},
				parent: null,
				children: [],
				layoutNode: null,
				isMounted: false,
				mount: () => {},
				update: () => {},
				unmount: () => {},
				render: () => {},
				handleEvent: () => false,
				setState: () => {},
				getBounds: () => null,
				containsPoint: () => false,
				focus: () => false,
				blur: () => {},
				isFocusable: () => false,
				destroy: () => {},
			};

			tree.build(mockWidget as any);
			tree.clear();
			expect(tree.root).toBe(null);
			expect(tree.built).toBe(false);
		});
	});

	describe('getNode', () => {
		it('should return undefined for non-existent node', () => {
			const node = tree.getNode('non-existent');
			expect(node).toBeUndefined();
		});
	});

	describe('traverse', () => {
		it('should traverse without error when tree is empty', () => {
			let called = false;
			tree.traverse(TraversalOrder.PRE_ORDER, () => {
				called = true;
			});
			expect(called).toBe(false);
		});
	});

	describe('query', () => {
		it('should return empty array for empty tree', () => {
			const results = tree.query({});
			expect(results).toEqual([]);
		});
	});

	describe('destroy', () => {
		it('should destroy tree', () => {
			tree.destroy();
			expect(tree.root).toBe(null);
			expect(tree.built).toBe(false);
		});
	});
});
