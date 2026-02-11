/**
 * Focus Manager Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {FocusManager} from '../focus.js';
import {BaseWidget} from '../base.js';
import type {WidgetProps, WidgetContext} from '../types.js';

// Test widget that can receive focus
class FocusableTestWidget extends BaseWidget {
	readonly type = 'focusable-test';

	render(context: WidgetContext): void {
		// Test rendering
	}

	isFocusable(): boolean {
		return this.props.visible && !this.state.disabled;
	}
}

// Non-focusable test widget
class NonFocusableTestWidget extends BaseWidget {
	readonly type = 'non-focusable-test';

	render(context: WidgetContext): void {
		// Test rendering
	}

	isFocusable(): boolean {
		return false;
	}
}

describe('FocusManager', () => {
	let manager: FocusManager;
	let root: FocusableTestWidget;

	beforeEach(() => {
		root = new FocusableTestWidget({id: 'root'});
		manager = new FocusManager(root);
	});

	describe('constructor', () => {
		it('should create focus manager with root widget', () => {
			expect(manager.root).toBe(root);
		});

		it('should have no initial focus', () => {
			expect(manager.currentFocus).toBeNull();
		});
	});

	describe('focus', () => {
		it('should focus a widget', () => {
			const widget = new FocusableTestWidget({id: 'widget1'});
			root.addChild(widget);

			const result = manager.focus(widget);
			expect(result).toBe(true);
			expect(manager.currentFocus).toBe(widget);
		});

		it('should not focus non-focusable widget', () => {
			const widget = new NonFocusableTestWidget({id: 'widget1'});
			root.addChild(widget);

			const result = manager.focus(widget);
			expect(result).toBe(false);
			expect(manager.currentFocus).toBeNull();
		});

		it('should not focus disabled widget', () => {
			const widget = new FocusableTestWidget({id: 'widget1'});
			widget.setState({disabled: true});
			root.addChild(widget);

			const result = manager.focus(widget);
			expect(result).toBe(false);
		});

		it('should not focus widget outside scope', () => {
			const otherRoot = new FocusableTestWidget({id: 'other-root'});
			const widget = new FocusableTestWidget({id: 'widget1'});
			otherRoot.addChild(widget);

			const result = manager.focus(widget);
			expect(result).toBe(false);
		});

		it('should blur previous widget when focusing new one', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focus(widget1);
			manager.focus(widget2);

			expect(widget1.hasFocus).toBe(false);
			expect(widget2.hasFocus).toBe(true);
		});
	});

	describe('blur', () => {
		it('should blur current focus', () => {
			const widget = new FocusableTestWidget({id: 'widget1'});
			root.addChild(widget);

			manager.focus(widget);
			manager.blur();

			expect(manager.currentFocus).toBeNull();
			expect(widget.hasFocus).toBe(false);
		});

		it('should handle blur when no focus', () => {
			expect(() => manager.blur()).not.toThrow();
		});
	});

	describe('next/previous', () => {
		it('should move focus to next widget', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focus(widget1);
			manager.next();

			expect(manager.currentFocus).toBe(widget2);
		});

		it('should move focus to previous widget', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focus(widget2);
			manager.previous();

			expect(manager.currentFocus).toBe(widget1);
		});

		it('should skip non-focusable widgets', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const nonFocusable = new NonFocusableTestWidget({id: 'non-focusable'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(nonFocusable);
			root.addChild(widget2);

			manager.focus(widget1);
			manager.next();

			expect(manager.currentFocus).toBe(widget2);
		});

		it('should return false when no focusable widgets', () => {
			const result = manager.next();
			expect(result).toBe(false);
		});
	});

	describe('focusFirst/focusLast', () => {
		it('should focus first focusable widget', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focusFirst();

			expect(manager.currentFocus).toBe(widget1);
		});

		it('should focus last focusable widget', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focusLast();

			expect(manager.currentFocus).toBe(widget2);
		});
	});

	describe('tab order', () => {
		it('should calculate tab order', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			const tabOrder = manager.getTabOrder();

			expect(tabOrder).toContain(widget1);
			expect(tabOrder).toContain(widget2);
		});

		it('should respect tabIndex', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			widget2.tabIndex = -1; // Lower priority
			widget1.tabIndex = 1;  // Higher priority
			root.addChild(widget2);
			root.addChild(widget1);

			const tabOrder = manager.getTabOrder();

			expect(tabOrder[0]).toBe(widget1);
			expect(tabOrder[1]).toBe(widget2);
		});
	});

	describe('focus change callbacks', () => {
		it('should call change callbacks', () => {
			const widget = new FocusableTestWidget({id: 'widget1'});
			root.addChild(widget);

			let previousWidget: typeof widget | null = null;
			let currentWidget: typeof widget | null = null;

			manager.onChange((prev, curr) => {
				previousWidget = prev as typeof widget;
				currentWidget = curr as typeof widget;
			});

			manager.focus(widget);

			expect(previousWidget).toBeNull();
			expect(currentWidget).toBe(widget);
		});

		it('should allow unregistering callbacks', () => {
			const widget = new FocusableTestWidget({id: 'widget1'});
			root.addChild(widget);

			let callCount = 0;
			const unregister = manager.onChange(() => {
				callCount++;
			});

			unregister();
			manager.focus(widget);

			expect(callCount).toBe(0);
		});
	});

	describe('trapped focus', () => {
		it('should trap focus within scope', () => {
			const trappedManager = new FocusManager(root, true);
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			trappedManager.focus(widget2);
			trappedManager.next();

			// Should wrap to first widget
			expect(trappedManager.currentFocus).toBe(widget1);
		});
	});

	describe('handleKey', () => {
		it('should handle tab key', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focus(widget1);
			const result = manager.handleKey('tab', false);

			expect(result).toBe(true);
			expect(manager.currentFocus).toBe(widget2);
		});

		it('should handle shift+tab key', () => {
			const widget1 = new FocusableTestWidget({id: 'widget1'});
			const widget2 = new FocusableTestWidget({id: 'widget2'});
			root.addChild(widget1);
			root.addChild(widget2);

			manager.focus(widget2);
			const result = manager.handleKey('tab', true);

			expect(result).toBe(true);
			expect(manager.currentFocus).toBe(widget1);
		});

		it('should not handle unknown keys', () => {
			const result = manager.handleKey('unknown', false);
			expect(result).toBe(false);
		});
	});
});
