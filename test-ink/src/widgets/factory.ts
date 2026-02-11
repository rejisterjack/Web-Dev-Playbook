/**
 * Widget Factory Module
 *
 * Provides the WidgetFactory class for creating widget instances.
 * Offers factory methods for common widgets and supports widget composition.
 *
 * @module widgets/factory
 */

import type {Widget, WidgetProps} from './types.js';
import {WidgetRegistry, globalWidgetRegistry} from './registry.js';

/**
 * Widget factory for creating and composing widgets
 *
 * Provides:
 * - Factory methods for common widget types
 * - Widget composition and nesting
 * - Batch widget creation
 * - Fluent API for widget construction
 */
export class WidgetFactory {
	/** The registry to use for widget creation */
	private registry: WidgetRegistry;

	/** Stack of parent widgets for nested creation */
	private parentStack: Widget[] = [];

	/**
	 * Create a new widget factory
	 *
	 * @param registry - The registry to use (defaults to global registry)
	 */
	constructor(registry: WidgetRegistry = globalWidgetRegistry) {
		this.registry = registry;
	}

	/**
	 * Get the current parent widget (for nesting)
	 */
	get currentParent(): Widget | null {
		return this.parentStack[this.parentStack.length - 1] || null;
	}

	/**
	 * Create a widget by type name
	 *
	 * @param type - Widget type name
	 * @param props - Props for the widget
	 * @returns The created widget
	 */
	create(type: string, props: WidgetProps = {}): Widget {
		const widget = this.registry.create(type, props);

		// Auto-mount if we have a current parent
		const parent = this.currentParent;
		if (parent) {
			parent.addChild(widget);
		}

		return widget;
	}

	/**
	 * Create a widget and push it as the current parent for nesting
	 *
	 * @param type - Widget type name
	 * @param props - Props for the widget
	 * @returns This factory for method chaining
	 */
	begin(type: string, props: WidgetProps = {}): this {
		const widget = this.create(type, props);
		this.parentStack.push(widget);
		return this;
	}

	/**
	 * Pop the current parent from the stack
	 *
	 * @returns This factory for method chaining
	 */
	end(): this {
		this.parentStack.pop();
		return this;
	}

	/**
	 * Create multiple widgets of the same type
	 *
	 * @param type - Widget type name
	 * @param count - Number of widgets to create
	 * @param propsFn - Function to generate props for each widget
	 * @returns Array of created widgets
	 */
	createMany(
		type: string,
		count: number,
		propsFn?: (index: number) => WidgetProps,
	): Widget[] {
		const widgets: Widget[] = [];

		for (let i = 0; i < count; i++) {
			const props = propsFn ? propsFn(i) : {};
			widgets.push(this.create(type, props));
		}

		return widgets;
	}

	/**
	 * Create a text widget
	 *
	 * @param text - Text content
	 * @param props - Additional props
	 * @returns The created text widget
	 */
	text(text: string, props: Omit<WidgetProps, 'text'> = {}): Widget {
		return this.create('text', {...props, text});
	}

	/**
	 * Create a button widget
	 *
	 * @param label - Button label
	 * @param props - Additional props
	 * @returns The created button widget
	 */
	button(label: string, props: Omit<WidgetProps, 'label'> = {}): Widget {
		return this.create('button', {...props, label});
	}

	/**
	 * Create an input widget
	 *
	 * @param props - Props for the input
	 * @returns The created input widget
	 */
	input(props: WidgetProps = {}): Widget {
		return this.create('input', props);
	}

	/**
	 * Create a checkbox widget
	 *
	 * @param label - Checkbox label
	 * @param checked - Initial checked state
	 * @param props - Additional props
	 * @returns The created checkbox widget
	 */
	checkbox(
		label: string,
		checked = false,
		props: Omit<WidgetProps, 'label' | 'checked'> = {},
	): Widget {
		return this.create('checkbox', {...props, label, checked});
	}

	/**
	 * Create a radio button widget
	 *
	 * @param label - Radio button label
	 * @param value - Radio button value
	 * @param group - Radio button group name
	 * @param props - Additional props
	 * @returns The created radio button widget
	 */
	radio(
		label: string,
		value: string,
		group: string,
		props: Omit<WidgetProps, 'label' | 'value' | 'group'> = {},
	): Widget {
		return this.create('radio', {...props, label, value, group});
	}

	/**
	 * Create a list widget
	 *
	 * @param items - List items
	 * @param props - Additional props
	 * @returns The created list widget
	 */
	list(items: unknown[], props: Omit<WidgetProps, 'items'> = {}): Widget {
		return this.create('list', {...props, items});
	}

	/**
	 * Create a progress bar widget
	 *
	 * @param value - Current value
	 * @param max - Maximum value
	 * @param props - Additional props
	 * @returns The created progress bar widget
	 */
	progress(
		value: number,
		max = 100,
		props: Omit<WidgetProps, 'value' | 'max'> = {},
	): Widget {
		return this.create('progress', {...props, value, max});
	}

	/**
	 * Create a container widget
	 *
	 * @param props - Props for the container
	 * @returns The created container widget
	 */
	container(props: WidgetProps = {}): Widget {
		return this.create('container', props);
	}

	/**
	 * Create a scroll view widget
	 *
	 * @param props - Props for the scroll view
	 * @returns The created scroll view widget
	 */
	scrollView(props: WidgetProps = {}): Widget {
		return this.create('scroll-view', props);
	}

	/**
	 * Create a tabs widget
	 *
	 * @param tabs - Tab definitions
	 * @param props - Additional props
	 * @returns The created tabs widget
	 */
	tabs(tabs: unknown[], props: Omit<WidgetProps, 'tabs'> = {}): Widget {
		return this.create('tabs', {...props, tabs});
	}

	/**
	 * Create a dialog widget
	 *
	 * @param title - Dialog title
	 * @param props - Additional props
	 * @returns The created dialog widget
	 */
	dialog(title: string, props: Omit<WidgetProps, 'title'> = {}): Widget {
		return this.create('dialog', {...props, title});
	}

	/**
	 * Create a menu widget
	 *
	 * @param items - Menu items
	 * @param props - Additional props
	 * @returns The created menu widget
	 */
	menu(items: unknown[], props: Omit<WidgetProps, 'items'> = {}): Widget {
		return this.create('menu', {...props, items});
	}

	/**
	 * Create a status bar widget
	 *
	 * @param items - Status bar items
	 * @param props - Additional props
	 * @returns The created status bar widget
	 */
	statusBar(items: unknown[], props: Omit<WidgetProps, 'items'> = {}): Widget {
		return this.create('status-bar', {...props, items});
	}

	/**
	 * Add a child to the current parent widget
	 *
	 * @param child - Child widget to add
	 * @returns This factory for method chaining
	 */
	add(child: Widget): this {
		const parent = this.currentParent;
		if (parent) {
			parent.addChild(child);
		}
		return this;
	}

	/**
	 * Add multiple children to the current parent widget
	 *
	 * @param children - Child widgets to add
	 * @returns This factory for method chaining
	 */
	addMany(children: Widget[]): this {
		const parent = this.currentParent;
		if (parent) {
			for (const child of children) {
				parent.addChild(child);
			}
		}
		return this;
	}

	/**
	 * Create a container with children
	 *
	 * @param props - Container props
	 * @param childrenCallback - Callback to create children
	 * @returns The created container with children
	 */
	containerWith(
		props: WidgetProps,
		childrenCallback: (factory: WidgetFactory) => void,
	): Widget {
		this.begin('container', props);
		childrenCallback(this);
		const container = this.currentParent!;
		this.end();
		return container;
	}

	/**
	 * Build a widget tree
	 *
	 * @param callback - Callback to build the tree
	 * @returns The root widget of the tree
	 */
	build(callback: (factory: WidgetFactory) => void): Widget | null {
		this.parentStack = [];
		callback(this);
		const root = this.parentStack[0] || null;
		this.parentStack = [];
		return root;
	}

	/**
	 * Reset the factory state
	 */
	reset(): void {
		this.parentStack = [];
	}

	/**
	 * Check if a widget type is available in the registry
	 *
	 * @param type - Widget type name
	 */
	hasType(type: string): boolean {
		return this.registry.isRegistered(type);
	}

	/**
	 * Get available widget types
	 */
	getAvailableTypes(): string[] {
		return this.registry.getRegisteredTypes();
	}
}

/**
 * Create a widget factory using the global registry
 *
 * @returns A new widget factory instance
 */
export function createFactory(): WidgetFactory {
	return new WidgetFactory();
}

/**
 * Build a widget tree using a fluent API
 *
 * @param callback - Callback to build the tree
 * @returns The root widget of the tree
 */
export function buildWidgetTree(
	callback: (factory: WidgetFactory) => void,
): Widget | null {
	const factory = createFactory();
	return factory.build(callback);
}

/**
 * Create a single widget by type
 *
 * @param type - Widget type name
 * @param props - Widget props
 * @returns The created widget
 */
export function makeWidget(type: string, props?: WidgetProps): Widget {
	const factory = createFactory();
	return factory.create(type, props);
}
