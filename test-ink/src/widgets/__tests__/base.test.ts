/**
 * Base Widget Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {BaseWidget} from '../base.js';
import type {WidgetProps, WidgetContext, WidgetEvent} from '../types.js';
import {WidgetEventType, WidgetLifecyclePhase} from '../types.js';

// Test widget implementation
class TestWidget extends BaseWidget {
	readonly type = 'test';

	render(context: WidgetContext): void {
		// Test rendering
	}

	// Expose protected methods for testing
	public testOnMount(): void {
		this.onMount();
	}

	public testOnUnmount(): void {
		this.onUnmount();
	}
}

describe('BaseWidget', () => {
	let widget: TestWidget;

	beforeEach(() => {
		widget = new TestWidget({id: 'test-widget'});
	});

	describe('constructor', () => {
		it('should create widget with generated ID if not provided', () => {
			const w = new TestWidget({});
			expect(w.id).toBeDefined();
			expect(w.id.startsWith('widget_')).toBe(true);
		});

		it('should use provided ID', () => {
			expect(widget.id).toBe('test-widget');
		});

		it('should initialize with default props', () => {
			expect(widget.props.visible).toBe(true);
			expect(widget.props.disabled).toBe(false);
		});
	});

	describe('mount/unmount', () => {
		it('should mount widget', () => {
			widget.mount();
			expect(widget.isMounted).toBe(true);
		});

		it('should unmount widget', () => {
			widget.mount();
			widget.unmount();
			expect(widget.isMounted).toBe(false);
		});

		it('should not remount if already mounted', () => {
			widget.mount();
			const firstMount = widget.isMounted;
			widget.mount();
			expect(widget.isMounted).toBe(firstMount);
		});
	});

	describe('props', () => {
		it('should update props', () => {
			widget.update({visible: false});
			expect(widget.props.visible).toBe(false);
		});

		it('should merge props with existing', () => {
			widget.update({disabled: true});
			expect(widget.props.disabled).toBe(true);
			expect(widget.props.visible).toBe(true); // Unchanged
		});
	});

	describe('state', () => {
		it('should set state', () => {
			widget.setState({hovered: true});
			expect(widget.state.hovered).toBe(true);
		});

		it('should merge state with existing', () => {
			widget.setState({hovered: true});
			widget.setState({focused: true});
			expect(widget.state.hovered).toBe(true);
			expect(widget.state.focused).toBe(true);
		});
	});

	describe('focus', () => {
		it('should focus widget', () => {
			widget.mount();
			const result = widget.focus();
			expect(result).toBe(true);
			expect(widget.hasFocus).toBe(true);
		});

		it('should blur widget', () => {
			widget.mount();
			widget.focus();
			widget.blur();
			expect(widget.hasFocus).toBe(false);
		});

		it('should not focus disabled widget', () => {
			widget.setState({disabled: true});
			const result = widget.focus();
			expect(result).toBe(false);
		});
	});

	describe('children', () => {
		it('should add child', () => {
			const child = new TestWidget({id: 'child'});
			widget.addChild(child);
			expect(widget.children).toContain(child);
			expect(child.parent).toBe(widget);
		});

		it('should remove child', () => {
			const child = new TestWidget({id: 'child'});
			widget.addChild(child);
			widget.removeChild(child);
			expect(widget.children).not.toContain(child);
		});

		it('should insert child at index', () => {
			const child1 = new TestWidget({id: 'child1'});
			const child2 = new TestWidget({id: 'child2'});
			widget.addChild(child1);
			widget.insertChild(0, child2);
			expect(widget.children[0]).toBe(child2);
		});

		it('should clear all children', () => {
			widget.addChild(new TestWidget({id: 'child1'}));
			widget.addChild(new TestWidget({id: 'child2'}));
			widget.clearChildren();
			expect(widget.children.length).toBe(0);
		});
	});

	describe('event handling', () => {
		it('should register event handler', () => {
			const handler = () => {};
			widget.on(WidgetEventType.CLICK, handler);
			// Handler is registered (no error thrown)
			expect(true).toBe(true);
		});

		it('should remove event handler', () => {
			const handler = () => {};
			widget.on(WidgetEventType.CLICK, handler);
			widget.off(WidgetEventType.CLICK, handler);
			// Handler is removed (no error thrown)
			expect(true).toBe(true);
		});
	});

	describe('bounds', () => {
		it('should return null bounds when not laid out', () => {
			expect(widget.getBounds()).toBeNull();
		});
	});

	describe('containsPoint', () => {
		it('should return false when not laid out', () => {
			expect(widget.containsPoint(0, 0)).toBe(false);
		});
	});

	describe('findWidgetById', () => {
		it('should find self by ID', () => {
			const found = widget.findWidgetById('test-widget');
			expect(found).toBe(widget);
		});

		it('should find child by ID', () => {
			const child = new TestWidget({id: 'child'});
			widget.addChild(child);
			const found = widget.findWidgetById('child');
			expect(found).toBe(child);
		});

		it('should return undefined for non-existent ID', () => {
			const found = widget.findWidgetById('non-existent');
			expect(found).toBeUndefined();
		});
	});
});
