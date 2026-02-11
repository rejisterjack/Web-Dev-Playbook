/**
 * Accessibility Module
 *
 * Main entry point for the accessibility system.
 * Exports all accessibility types, classes, and utility functions.
 *
 * @module accessibility
 */

// Types
export * from './types.js';

// Screen Reader
export {ScreenReader, AnnouncementPriority} from './screen-reader.js';
export type {AnnouncementConfig, LiveRegionConfig} from './screen-reader.js';

// Focus Management
export {
	AccessibilityFocusManager,
	FocusEventType,
	FocusOrderStrategy,
	FocusIndicatorStyle,
} from './focus.js';
export type {FocusEventHandler, FocusEvent, FocusIndicatorConfig} from './focus.js';

// Keyboard Navigation
export {KeyboardNavigation, ShortcutScope, ConflictResolution} from './keyboard.js';
export type {ShortcutMatch} from './keyboard.js';

// High Contrast Mode
export {HighContrastMode, HighContrastDetectionMethod, HighContrastPreset} from './high-contrast.js';
export type {HighContrastConfig} from './high-contrast.js';

// Text Scaling
export {TextScaling, TextScalingPreset} from './text-scaling.js';
export type {TextScalingOptions} from './text-scaling.js';

// Reduced Motion
export {ReducedMotion, ReducedMotionDetectionMethod, AnimationType} from './reduced-motion.js';
export type {AnimationConfig, ReducedMotionConfig} from './reduced-motion.js';

// Accessibility Tree
export {AccessibilityTree, TraversalOrder} from './tree.js';
export type {TreeQueryFilter} from './tree.js';

// ARIA Attributes
export {aria} from './aria.js';
export {
	ariaLabel,
	ariaDescription,
	ariaRole,
	ariaState,
	ariaValue,
	ariaChecked,
	ariaSelected,
	ariaExpanded,
	ariaDisabled,
	ariaRequired,
	ariaReadonly,
	ariaInvalid,
	ariaBusy,
	ariaHidden,
	ariaLive,
	ariaAtomic,
	ariaHeadingLevel,
	ariaControls,
	ariaDescribedBy,
	ariaLabelledBy,
	ariaValueNow,
	ariaValueMin,
	ariaValueMax,
	ariaValueText,
	ariaTabIndex,
	ariaFocusable,
	ariaHint,
} from './aria.js';

// Accessibility Manager
export {AccessibilityManager} from './manager.js';

// Accessibility Audit
export {AccessibilityAudit} from './audit.js';
export type {AuditRule, AuditContext, AuditReport} from './audit.js';

// Utilities
export {
	isFocusable,
	getFocusableWidgets,
	getNextFocusableWidget,
	getAccessibleLabel,
	getAccessibleDescription,
	getAccessibleHint,
	getAccessibleRole,
	getAccessibleStates,
	hasAccessibleState,
	getAccessibleValue,
	isExposed,
	getAccessibilityDepth,
	getAccessibilityPath,
	getAccessibilityParent,
	getAccessibilityChildren,
	getAccessibilitySiblings,
	getPreviousSibling,
	getNextSibling,
	getFirstChild,
	getLastChild,
	findByRole,
	findByState,
	getExposedWidgets,
	formatAccessibilityLabel,
	generateAccessibilityId,
	validateAccessibilityLabel,
	validateAccessibilityDescription,
	checkContrastAA,
	checkContrastAAA,
	calculateContrastRatio,
	getLuminance,
	hexToRgb,
	normalizeKeyCombination,
	matchesKeyCombination,
} from './utils.js';
