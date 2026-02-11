/**
 * Widget System Index
 *
 * Main entry point for the widget system.
 * Exports all widget types, base classes, and utilities.
 *
 * @module widgets
 */

// Core types
export type {
	Widget,
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetStyle,
	EdgeValues,
	BorderStyle,
	WidgetTheme,
	WidgetLifecycle,
	WidgetEvent,
	WidgetFocusEvent,
	WidgetMouseEvent,
	WidgetKeyEvent,
	WidgetChangeEvent,
	WidgetSelectEvent,
	WidgetConstructor,
	WidgetRegistration,
	FocusableWidget,
	ContainerWidget as IContainerWidget,
	ScrollableWidget as IScrollableWidget,
	WidgetEventHandler,
	WidgetChangeHandler,
} from './types.js';

export {
	WidgetLifecyclePhase,
	WidgetEventType,
	DEFAULT_THEME,
} from './types.js';

// Base widget
export {BaseWidget} from './base.js';

// Widget registry
export {
	WidgetRegistry,
	globalWidgetRegistry,
	registerWidget,
	createWidget,
	isWidgetRegistered,
} from './registry.js';

// Widget factory
export {
	WidgetFactory,
	createFactory,
	buildWidgetTree,
	makeWidget,
} from './factory.js';

// Focus manager
export {
	FocusManager,
	getGlobalFocusManager,
	setGlobalFocusManager,
	resetGlobalFocusManager,
} from './focus.js';

// Individual widgets
export {
	TextWidget,
	TextWidgetProps,
	TextWidgetState,
	TextAlignment,
	TextWrapMode,
} from './text.js';

export {
	ButtonWidget,
	ButtonWidgetProps,
	ButtonWidgetState,
	ButtonVariant,
} from './button.js';

export {
	InputWidget,
	InputWidgetProps,
	InputWidgetState,
} from './input.js';

export {
	CheckboxWidget,
	CheckboxWidgetProps,
	CheckboxWidgetState,
} from './checkbox.js';

export {
	RadioButtonWidget,
	RadioGroup,
	getRadioGroup,
	RadioButtonWidgetProps,
	RadioButtonWidgetState,
} from './radio.js';

export {
	ListWidget,
	ListItem,
	ListWidgetProps,
	ListWidgetState,
} from './list.js';

export {
	ProgressBarWidget,
	ProgressBarWidgetProps,
	ProgressBarWidgetState,
	ProgressVariant,
} from './progress.js';

export {
	ContainerWidget,
	ContainerWidgetProps,
	ContainerBorder,
} from './container.js';

export {
	ScrollViewWidget,
	ScrollViewWidgetProps,
	ScrollViewWidgetState,
	ScrollDirection,
} from './scroll-view.js';

export {
	TabsWidget,
	Tab,
	TabsWidgetProps,
	TabsWidgetState,
} from './tabs.js';

export {
	DialogWidget,
	DialogAction,
	DialogWidgetProps,
	DialogWidgetState,
} from './dialog.js';

export {
	MenuWidget,
	MenuItem,
	MenuItemType,
	MenuPosition,
	MenuWidgetProps,
	MenuWidgetState,
} from './menu.js';

export {
	StatusBarWidget,
	StatusItem,
	StatusItemAlignment,
	StatusBarWidgetProps,
	StatusBarWidgetState,
} from './status-bar.js';
