/**
 * Widget Registry Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
	WidgetRegistry,
	globalWidgetRegistry,
	createWidget,
	isWidgetRegistered,
} from '../registry.js';
import {BaseWidget} from '../base.js';
import type {WidgetProps, WidgetContext} from '../types.js';

// Test widget class
class TestWidget extends BaseWidget {
	readonly type = 'test';

	render(context: WidgetContext): void {
		// Test rendering
	}
}

// Another test widget
class AnotherWidget extends BaseWidget {
	readonly type = 'another';

	render(context: WidgetContext): void {
		// Test rendering
	}
}

describe('WidgetRegistry', () => {
	let registry: WidgetRegistry;

	beforeEach(() => {
		registry = WidgetRegistry.create();
	});

	describe('register', () => {
		it('should register a widget type', () => {
			registry.register('test', TestWidget);
			expect(registry.isRegistered('test')).toBe(true);
		});

		it('should overwrite existing registration', () => {
			registry.register('test', TestWidget);
			registry.register('test', AnotherWidget);
			const ctor = registry.getConstructor('test');
			expect(ctor).toBe(AnotherWidget);
		});
	});

	describe('unregister', () => {
		it('should unregister a widget type', () => {
			registry.register('test', TestWidget);
			registry.unregister('test');
			expect(registry.isRegistered('test')).toBe(false);
		});

		it('should return false when unregistering non-existent type', () => {
			const result = registry.unregister('non-existent');
			expect(result).toBe(false);
		});
	});

	describe('create', () => {
		it('should create a widget instance', () => {
			registry.register('test', TestWidget);
			const widget = registry.create('test');
			expect(widget).toBeInstanceOf(TestWidget);
		});

		it('should throw for unregistered type', () => {
			expect(() => registry.create('non-existent')).toThrow();
		});

		it('should pass props to widget', () => {
			registry.register('test', TestWidget);
			const widget = registry.create('test', {id: 'my-widget'});
			expect(widget.id).toBe('my-widget');
		});
	});

	describe('tryCreate', () => {
		it('should create widget if type is registered', () => {
			registry.register('test', TestWidget);
			const widget = registry.tryCreate('test');
			expect(widget).toBeInstanceOf(TestWidget);
		});

		it('should return undefined for unregistered type', () => {
			const widget = registry.tryCreate('non-existent');
			expect(widget).toBeUndefined();
		});
	});

	describe('getRegisteredTypes', () => {
		it('should return all registered types', () => {
			registry.register('test', TestWidget);
			registry.register('another', AnotherWidget);
			const types = registry.getRegisteredTypes();
			expect(types).toContain('test');
			expect(types).toContain('another');
		});
	});

	describe('getRegistrationCount', () => {
		it('should return count of registered types', () => {
			expect(registry.getRegistrationCount()).toBe(0);
			registry.register('test', TestWidget);
			expect(registry.getRegistrationCount()).toBe(1);
		});
	});

	describe('clear', () => {
		it('should clear all registrations', () => {
			registry.register('test', TestWidget);
			registry.register('another', AnotherWidget);
			registry.clear();
			expect(registry.getRegistrationCount()).toBe(0);
		});
	});

	describe('registerMany', () => {
		it('should register multiple types at once', () => {
			registry.registerMany([
				{type: 'test', constructor: TestWidget},
				{type: 'another', constructor: AnotherWidget},
			]);
			expect(registry.isRegistered('test')).toBe(true);
			expect(registry.isRegistered('another')).toBe(true);
		});
	});

	describe('createMany', () => {
		it('should create multiple widgets', () => {
			registry.register('test', TestWidget);
			const widgets = registry.createMany('test', [{}, {}, {}]);
			expect(widgets.length).toBe(3);
			widgets.forEach(w => expect(w).toBeInstanceOf(TestWidget));
		});
	});

	describe('default props', () => {
		it('should store default props', () => {
			const defaultProps = {visible: false};
			registry.register('test', TestWidget, defaultProps);
			const props = registry.getDefaultProps('test');
			expect(props.visible).toBe(false);
		});

		it('should merge default props with provided props', () => {
			const defaultProps = {className: 'my-class'};
			registry.register('test', TestWidget, defaultProps);
			const widget = registry.create('test', {id: 'test-id'});
			expect(widget.props.className).toBe('my-class');
			expect(widget.id).toBe('test-id');
		});
	});
});

describe('globalWidgetRegistry', () => {
	beforeEach(() => {
		WidgetRegistry.resetInstance();
	});

	it('should be a singleton', () => {
		const reg1 = WidgetRegistry.getInstance();
		const reg2 = WidgetRegistry.getInstance();
		expect(reg1).toBe(reg2);
	});
});

describe('createWidget helper', () => {
	beforeEach(() => {
		WidgetRegistry.resetInstance();
	});

	it('should create widget using global registry', () => {
		globalWidgetRegistry.register('test', TestWidget);
		const widget = createWidget('test');
		expect(widget).toBeInstanceOf(TestWidget);
	});
});

describe('isWidgetRegistered helper', () => {
	beforeEach(() => {
		WidgetRegistry.resetInstance();
	});

	it('should check registration in global registry', () => {
		expect(isWidgetRegistered('test')).toBe(false);
		globalWidgetRegistry.register('test', TestWidget);
		expect(isWidgetRegistered('test')).toBe(true);
	});
});
