/**
 * Widget Registry Module
 *
 * Provides the WidgetRegistry class for registering and creating widget types.
 * Allows custom widget registration and factory-based widget instantiation.
 *
 * @module widgets/registry
 */

import type {Widget, WidgetProps, WidgetConstructor, WidgetRegistration} from './types.js';
import {BaseWidget} from './base.js';

/**
 * Widget registry for managing widget types
 *
 * Provides:
 * - Register widget types by name
 * - Create widget instances by type name
 * - Support for custom widget registration
 * - Widget type lookup and validation
 */
export class WidgetRegistry {
	/** Singleton instance */
	private static instance: WidgetRegistry | null = null;

	/** Registered widget types */
	private widgets: Map<string, WidgetRegistration> = new Map();

	/** Default props for widget types */
	private defaultProps: Map<string, Partial<WidgetProps>> = new Map();

	/**
	 * Get the singleton instance of the registry
	 */
	static getInstance(): WidgetRegistry {
		if (!WidgetRegistry.instance) {
			WidgetRegistry.instance = new WidgetRegistry();
		}
		return WidgetRegistry.instance;
	}

	/**
	 * Reset the singleton instance (useful for testing)
	 */
	static resetInstance(): void {
		WidgetRegistry.instance = null;
	}

	/**
	 * Create a new registry instance (for isolated registries)
	 */
	static create(): WidgetRegistry {
		return new WidgetRegistry();
	}

	/**
	 * Private constructor - use getInstance() or create()
	 */
	private constructor() {}

	/**
	 * Register a widget type
	 *
	 * @param type - Widget type name
	 * @param constructor - Widget constructor
	 * @param defaultProps - Default props for this widget type
	 * @returns This registry for method chaining
	 */
	register(
		type: string,
		widgetConstructor: WidgetConstructor,
		defaultProps?: Partial<WidgetProps>,
	): this {
		if (this.widgets.has(type)) {
			console.warn(`Widget type '${type}' is already registered. Overwriting.`);
		}

		this.widgets.set(type, {
			type,
			constructor: widgetConstructor,
			defaultProps,
		});

		if (defaultProps) {
			this.defaultProps.set(type, defaultProps);
		}

		return this;
	}

	/**
	 * Unregister a widget type
	 *
	 * @param type - Widget type name
	 * @returns True if the type was removed, false if not found
	 */
	unregister(type: string): boolean {
		this.defaultProps.delete(type);
		return this.widgets.delete(type);
	}

	/**
	 * Check if a widget type is registered
	 *
	 * @param type - Widget type name
	 */
	isRegistered(type: string): boolean {
		return this.widgets.has(type);
	}

	/**
	 * Get a widget registration
	 *
	 * @param type - Widget type name
	 * @returns The registration or undefined if not found
	 */
	getRegistration(type: string): WidgetRegistration | undefined {
		return this.widgets.get(type);
	}

	/**
	 * Get the constructor for a widget type
	 *
	 * @param type - Widget type name
	 * @returns The constructor or undefined if not found
	 */
	getConstructor(type: string): WidgetConstructor | undefined {
		return this.widgets.get(type)?.constructor;
	}

	/**
	 * Get default props for a widget type
	 *
	 * @param type - Widget type name
	 * @returns Default props or empty object if not found
	 */
	getDefaultProps(type: string): Partial<WidgetProps> {
		return this.defaultProps.get(type) || {};
	}

	/**
	 * Create a widget instance by type name
	 *
	 * @param type - Widget type name
	 * @param props - Props to pass to the widget
	 * @returns The created widget instance
	 * @throws Error if widget type is not registered
	 */
	create(type: string, props: WidgetProps = {}): Widget {
		const registration = this.widgets.get(type);

		if (!registration) {
			throw new Error(`Widget type '${type}' is not registered`);
		}

		// Merge default props with provided props
		const mergedProps: WidgetProps = {
			...registration.defaultProps,
			...props,
			style: {
				...registration.defaultProps?.style,
				...props.style,
			},
			data: {
				...registration.defaultProps?.data,
				...props.data,
			},
		};

		return new registration.constructor(mergedProps);
	}

	/**
	 * Create a widget instance if type is registered, otherwise return undefined
	 *
	 * @param type - Widget type name
	 * @param props - Props to pass to the widget
	 * @returns The created widget instance or undefined
	 */
	tryCreate(type: string, props: WidgetProps = {}): Widget | undefined {
		if (!this.isRegistered(type)) {
			return undefined;
		}

		try {
			return this.create(type, props);
		} catch {
			return undefined;
		}
	}

	/**
	 * Get all registered widget types
	 */
	getRegisteredTypes(): string[] {
		return Array.from(this.widgets.keys());
	}

	/**
	 * Get count of registered widget types
	 */
	getRegistrationCount(): number {
		return this.widgets.size;
	}

	/**
	 * Clear all registrations
	 */
	clear(): void {
		this.widgets.clear();
		this.defaultProps.clear();
	}

	/**
	 * Register multiple widget types at once
	 *
	 * @param registrations - Array of widget registrations
	 * @returns This registry for method chaining
	 */
	registerMany(registrations: WidgetRegistration[]): this {
		for (const reg of registrations) {
			this.register(reg.type, reg.constructor, reg.defaultProps);
		}
		return this;
	}

	/**
	 * Create multiple widgets of the same type
	 *
	 * @param type - Widget type name
	 * @param propsArray - Array of props for each widget
	 * @returns Array of created widget instances
	 */
	createMany(type: string, propsArray: WidgetProps[]): Widget[] {
		return propsArray.map(props => this.create(type, props));
	}

	/**
	 * Update default props for a widget type
	 *
	 * @param type - Widget type name
	 * @param props - Props to merge with existing defaults
	 * @returns True if updated, false if type not found
	 */
	updateDefaultProps(type: string, props: Partial<WidgetProps>): boolean {
		if (!this.widgets.has(type)) {
			return false;
		}

		const existing = this.defaultProps.get(type) || {};
		this.defaultProps.set(type, {
			...existing,
			...props,
			style: {
				...existing.style,
				...props.style,
			},
			data: {
				...existing.data,
				...props.data,
			},
		});

		// Update the registration as well
		const registration = this.widgets.get(type)!;
		registration.defaultProps = this.defaultProps.get(type);

		return true;
	}
}

/**
 * Global widget registry instance
 */
export const globalWidgetRegistry = WidgetRegistry.getInstance();

/**
 * Decorator for registering a widget class
 *
 * @param type - Widget type name
 * @param defaultProps - Default props for this widget type
 */
export function registerWidget(
	type: string,
	defaultProps?: Partial<WidgetProps>,
): <T extends WidgetConstructor>(widgetConstructor: T) => T {
	return <T extends WidgetConstructor>(widgetConstructor: T): T => {
		globalWidgetRegistry.register(type, widgetConstructor, defaultProps);
		return widgetConstructor;
	};
}

/**
 * Helper function to create a widget by type using the global registry
 *
 * @param type - Widget type name
 * @param props - Props to pass to the widget
 */
export function createWidget(type: string, props?: WidgetProps): Widget {
	return globalWidgetRegistry.create(type, props);
}

/**
 * Helper function to check if a widget type is registered
 *
 * @param type - Widget type name
 */
export function isWidgetRegistered(type: string): boolean {
	return globalWidgetRegistry.isRegistered(type);
}
