/**
 * Accessibility Types Module
 *
 * Core type definitions for the accessibility system.
 * Provides fundamental interfaces for accessibility roles, states,
 * labels, hints, and values used throughout the accessibility system.
 *
 * @module accessibility/types
 */

import type {Widget} from '../widgets/types.js';

/**
 * Accessibility role enumeration for widgets
 * Based on WAI-ARIA roles adapted for terminal UI
 */
export enum AccessibilityRole {
	/** A button that can be pressed */
	BUTTON = 'button',

	/** A checkbox that can be checked/unchecked */
	CHECKBOX = 'checkbox',

	/** A radio button in a radio group */
	RADIO = 'radio',

	/** A text input field */
	TEXTBOX = 'textbox',

	/** A list of items */
	LIST = 'list',

	/** An item in a list */
	LISTITEM = 'listitem',

	/** A menu of options */
	MENU = 'menu',

	/** An item in a menu */
	MENUITEM = 'menuitem',

	/** A tab in a tab container */
	TAB = 'tab',

	/** A container for tabs */
	TABLIST = 'tablist',

	/** A panel associated with a tab */
	TABPANEL = 'tabpanel',

	/** A progress indicator */
	PROGRESSBAR = 'progressbar',

	/** A slider for selecting a value */
	SLIDER = 'slider',

	/** A dialog or modal */
	DIALOG = 'dialog',

	/** An alert or important message */
	ALERT = 'alert',

	/** A status message */
	STATUS = 'status',

	/** A generic container */
	GROUP = 'group',

	/** A heading */
	HEADING = 'heading',

	/** A region of the page */
	REGION = 'region',

	/** A navigation region */
	NAVIGATION = 'navigation',

	/** A main content area */
	MAIN = 'main',

	/** A search region */
	SEARCH = 'search',

	/** A form */
	FORM = 'form',

	/** A table */
	TABLE = 'table',

	/** A table row */
	ROW = 'row',

	/** A table cell */
	CELL = 'cell',

	/** A table header cell */
	HEADERCELL = 'columnheader',

	/** A generic widget */
	GENERIC = 'generic',
}

/**
 * Accessibility state enumeration
 * Based on WAI-ARIA states and properties
 */
export enum AccessibilityState {
	/** Widget is checked (checkbox, radio) */
	CHECKED = 'checked',

	/** Widget is unchecked */
	UNCHECKED = 'unchecked',

	/** Widget is in mixed/indeterminate state */
	MIXED = 'mixed',

	/** Widget is selected (list item, tab) */
	SELECTED = 'selected',

	/** Widget is not selected */
	UNSELECTED = 'unselected',

	/** Widget is expanded (accordion, menu) */
	EXPANDED = 'expanded',

	/** Widget is collapsed */
	COLLAPSED = 'collapsed',

	/** Widget is disabled */
	DISABLED = 'disabled',

	/** Widget is enabled */
	ENABLED = 'enabled',

	/** Widget is busy/loading */
	BUSY = 'busy',

	/** Widget is not busy */
	IDLE = 'idle',

	/** Widget is hidden from accessibility tree */
	HIDDEN = 'hidden',

	/** Widget is visible to accessibility tree */
	VISIBLE = 'visible',

	/** Widget has an error */
	INVALID = 'invalid',

	/** Widget is valid */
	VALID = 'valid',

	/** Widget is required */
	REQUIRED = 'required',

	/** Widget is optional */
	OPTIONAL = 'optional',

	/** Widget is read-only */
	READONLY = 'readonly',

	/** Widget is editable */
	EDITABLE = 'editable',

	/** Widget is pressed (button) */
	PRESSED = 'pressed',

	/** Widget is not pressed */
	UNPRESSED = 'unpressed',
}

/**
 * Accessibility label for screen readers
 */
export interface AccessibilityLabel {
	/** The primary label text */
	text: string;

	/** Optional label ID for reference */
	id?: string;

	/** Whether this label is visible on screen */
	visible?: boolean;
}

/**
 * Accessibility hint for screen readers
 * Provides additional context about how to interact with a widget
 */
export interface AccessibilityHint {
	/** The hint text */
	text: string;

	/** Optional hint ID for reference */
	id?: string;
}

/**
 * Accessibility value for widgets with values
 * Used for progress bars, sliders, etc.
 */
export interface AccessibilityValue {
	/** Current value */
	now: number;

	/** Minimum value */
	min: number;

	/** Maximum value */
	max: number;

	/** Optional text representation of the value */
	text?: string;
}

/**
 * Accessibility description for widgets
 * Provides additional descriptive information
 */
export interface AccessibilityDescription {
	/** The description text */
	text: string;

	/** Optional description ID for reference */
	id?: string;
}

/**
 * Accessibility properties for a widget
 * Combines all accessibility-related properties
 */
export interface AccessibilityProps {
	/** The accessibility role of the widget */
	role?: AccessibilityRole;

	/** The accessible label */
	label?: string | AccessibilityLabel;

	/** The accessible description */
	description?: string | AccessibilityDescription;

	/** The accessible hint */
	hint?: string | AccessibilityHint;

	/** The accessibility value (for widgets with values) */
	value?: AccessibilityValue;

	/** Current accessibility states */
	states?: AccessibilityState[];

	/** Tab index for keyboard navigation */
	tabIndex?: number;

	/** Whether the widget is focusable */
	focusable?: boolean;

	/** Whether the widget is in a live region */
	liveRegion?: LiveRegionType;

	/** Whether the widget is atomic (announced as a whole) */
	atomic?: boolean;

	/** Whether the widget has relevant changes */
	relevant?: LiveRegionRelevant[];

	/** Whether the widget is busy */
	busy?: boolean;

	/** Heading level (for heading roles) */
	level?: number;

	/** Value now (for progress bars, sliders) */
	valueNow?: number;

	/** Value minimum (for progress bars, sliders) */
	valueMin?: number;

	/** Value maximum (for progress bars, sliders) */
	valueMax?: number;

	/** Value text (for progress bars, sliders) */
	valueText?: string;

	/** Whether the widget is checked (for checkboxes, radios) */
	checked?: boolean | 'mixed';

	/** Whether the widget is selected (for list items, tabs) */
	selected?: boolean;

	/** Whether the widget is expanded (for accordions, menus) */
	expanded?: boolean;

	/** Whether the widget is disabled */
	disabled?: boolean;

	/** Whether the widget is required */
	required?: boolean;

	/** Whether the widget is read-only */
	readonly?: boolean;

	/** Whether the widget is invalid */
	invalid?: boolean;

	/** Error message for invalid state */
	errorMessage?: string;

	/** Controls which widget this widget controls */
	controls?: string;

	/** Describes which widget this widget is described by */
	describedBy?: string;

	/** Labels which widget this widget is labelled by */
	labelledBy?: string;
}

/**
 * Live region type for dynamic content
 */
export enum LiveRegionType {
	/** Updates are announced when the user is idle */
	POLITE = 'polite',

	/** Updates are announced immediately */
	ASSERTIVE = 'assertive',

	/** Updates are not announced */
	OFF = 'off',
}

/**
 * Live region relevant settings
 * Determines what types of changes are announced
 */
export enum LiveRegionRelevant {
	/** Additions are relevant */
	ADDITIONS = 'additions',

	/** Removals are relevant */
	REMOVALS = 'removals',

	/** Text changes are relevant */
	TEXT = 'text',

	/** All changes are relevant */
	ALL = 'all',
}

/**
 * Focus navigation direction
 */
export enum FocusDirection {
	/** Move to next widget */
	NEXT = 'next',

	/** Move to previous widget */
	PREVIOUS = 'previous',

	/** Move to first widget */
	FIRST = 'first',

	/** Move to last widget */
	LAST = 'last',

	/** Move up */
	UP = 'up',

	/** Move down */
	DOWN = 'down',

	/** Move left */
	LEFT = 'left',

	/** Move right */
	RIGHT = 'right',
}

/**
 * Focus trap configuration
 */
export interface FocusTrap {
	/** The container widget */
	container: Widget;

	/** Whether focus is currently trapped */
	active: boolean;

	/** Widget to return focus to when trap is deactivated */
	returnFocusTo?: Widget;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
	/** The key combination (e.g., 'Ctrl+S', 'Alt+F') */
	keys: string;

	/** The action to perform */
	action: () => void | Promise<void>;

	/** Optional description of the shortcut */
	description?: string;

	/** Whether the shortcut is global (works anywhere) */
	global?: boolean;

	/** Widget ID this shortcut is scoped to (if not global) */
	widgetId?: string;

	/** Priority for conflict resolution */
	priority?: number;
}

/**
 * High contrast color palette
 */
export interface HighContrastPalette {
	/** Primary foreground color */
	foreground: string;

	/** Primary background color */
	background: string;

	/** Highlight/selection color */
	highlight: string;

	/** Highlight text color */
	highlightText: string;

	/** Border color */
	border: string;

	/** Focus indicator color */
	focus: string;

	/** Success color */
	success: string;

	/** Warning color */
	warning: string;

	/** Error color */
	error: string;
}

/**
 * Text scaling configuration
 */
export interface TextScalingConfig {
	/** Scale factor for text size (1.0 = normal) */
	scale: number;

	/** Line spacing multiplier (1.0 = normal) */
	lineSpacing: number;

	/** Font weight adjustment */
	fontWeight: 'normal' | 'bold' | 'light';
}

/**
 * Reduced motion preference
 */
export enum ReducedMotionPreference {
	/** User prefers reduced motion */
	REDUCED = 'reduced',

	/** User prefers normal motion */
	NORMAL = 'normal',
}

/**
 * Accessibility tree node
 * Represents a widget in the accessibility tree
 */
export interface AccessibilityTreeNode {
	/** The widget this node represents */
	widget: Widget;

	/** The accessibility role */
	role: AccessibilityRole;

	/** The accessible label */
	label: string;

	/** The accessible description */
	description?: string;

	/** The accessible hint */
	hint?: string;

	/** Current accessibility states */
	states: AccessibilityState[];

	/** The accessibility value (if applicable) */
	value?: AccessibilityValue;

	/** Child nodes in the accessibility tree */
	children: AccessibilityTreeNode[];

	/** Parent node in the accessibility tree */
	parent: AccessibilityTreeNode | null;

	/** Whether this node is exposed to screen readers */
	exposed: boolean;

	/** Depth in the accessibility tree */
	depth: number;

	/** Index among siblings */
	index: number;
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAuditResult {
	/** Whether the audit passed */
	passed: boolean;

	/** List of issues found */
	issues: AccessibilityIssue[];

	/** List of warnings found */
	warnings: AccessibilityWarning[];

	/** Overall score (0-100) */
	score: number;
}

/**
 * Accessibility issue type
 */
export enum AccessibilityIssueType {
	/** Missing label */
	MISSING_LABEL = 'missing_label',

	/** Missing description */
	MISSING_DESCRIPTION = 'missing_description',

	/** Invalid contrast */
	INVALID_CONTRAST = 'invalid_contrast',

	/** No keyboard navigation */
	NO_KEYBOARD_NAVIGATION = 'no_keyboard_navigation',

	/** Missing focus indicator */
	MISSING_FOCUS_INDICATOR = 'missing_focus_indicator',

	/** Invalid role */
	INVALID_ROLE = 'invalid_role',

	/** Invalid state */
	INVALID_STATE = 'invalid_state',

	/** Missing required attribute */
	MISSING_REQUIRED_ATTRIBUTE = 'missing_required_attribute',
}

/**
 * Accessibility issue
 */
export interface AccessibilityIssue {
	/** The issue type */
	type: AccessibilityIssueType;

	/** The widget with the issue */
	widget: Widget;

	/** Description of the issue */
	message: string;

	/** Severity level */
	severity: 'error' | 'warning';

	/** Suggested fix */
	suggestion?: string;
}

/**
 * Accessibility warning
 */
export interface AccessibilityWarning {
	/** The warning type */
	type: string;

	/** The widget with the warning */
	widget: Widget;

	/** Description of the warning */
	message: string;

	/** Suggested improvement */
	suggestion?: string;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
	/** Whether screen reader support is enabled */
	screenReaderEnabled: boolean;

	/** Whether high contrast mode is enabled */
	highContrastEnabled: boolean;

	/** Whether reduced motion is enabled */
	reducedMotionEnabled: boolean;

	/** Text scaling configuration */
	textScaling: TextScalingConfig;

	/** Whether focus indicators are enabled */
	focusIndicatorsEnabled: boolean;

	/** Whether keyboard navigation is enabled */
	keyboardNavigationEnabled: boolean;

	/** Live region announcement type */
	defaultLiveRegionType: LiveRegionType;
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
	screenReaderEnabled: true,
	highContrastEnabled: false,
	reducedMotionEnabled: false,
	textScaling: {
		scale: 1.0,
		lineSpacing: 1.0,
		fontWeight: 'normal',
	},
	focusIndicatorsEnabled: true,
	keyboardNavigationEnabled: true,
	defaultLiveRegionType: LiveRegionType.POLITE,
};

/**
 * Default high contrast palette
 */
export const DEFAULT_HIGH_CONTRAST_PALETTE: HighContrastPalette = {
	foreground: '#FFFFFF',
	background: '#000000',
	highlight: '#FFFF00',
	highlightText: '#000000',
	border: '#FFFFFF',
	focus: '#FFFF00',
	success: '#00FF00',
	warning: '#FFFF00',
	error: '#FF0000',
};
