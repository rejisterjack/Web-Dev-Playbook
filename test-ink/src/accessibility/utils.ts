/**
 * Accessibility Utilities Module
 *
 * Provides utility functions for accessibility.
 * Includes functions for checking focusability, getting focusable widgets,
 * and getting accessible labels and descriptions.
 *
 * @module accessibility/utils
 */

import type {Widget} from '../widgets/types.js';
import type {FocusDirection} from './types.js';
import {AccessibilityFocusManager} from './focus.js';
import {AccessibilityTree} from './tree.js';

/**
 * Checks if a widget is focusable
 *
 * @param widget - The widget to check
 * @param focusManager - The focus manager
 * @returns Whether the widget is focusable
 */
export function isFocusable(
	widget: Widget,
	focusManager: AccessibilityFocusManager,
): boolean {
	return focusManager.isFocusable(widget);
}

/**
 * Gets all focusable widgets in a container
 *
 * @param container - The container widget
 * @param focusManager - The focus manager
 * @returns Array of focusable widgets
 */
export function getFocusableWidgets(
	container: Widget,
	focusManager: AccessibilityFocusManager,
): Widget[] {
	const focusable: Widget[] = [];

	// Check if container itself is focusable
	if (focusManager.isFocusable(container)) {
		focusable.push(container);
	}

	// Check children recursively
	for (const child of container.children) {
		focusable.push(...getFocusableWidgets(child, focusManager));
	}

	return focusable;
}

/**
 * Gets the next focusable widget in the specified direction
 *
 * @param current - The current widget
 * @param direction - The direction to move
 * @param focusManager - The focus manager
 * @returns The next focusable widget, or null if none found
 */
export function getNextFocusableWidget(
	current: Widget,
	direction: FocusDirection,
	focusManager: AccessibilityFocusManager,
): Widget | null {
	return focusManager.getNextFocusableWidget(current, direction);
}

/**
 * Gets the accessible label for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The accessible label
 */
export function getAccessibleLabel(widget: Widget, tree: AccessibilityTree): string {
	const node = tree.getNode(widget.id);
	return node?.label ?? widget.id;
}

/**
 * Gets the accessible description for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The accessible description, or undefined
 */
export function getAccessibleDescription(
	widget: Widget,
	tree: AccessibilityTree,
): string | undefined {
	const node = tree.getNode(widget.id);
	return node?.description;
}

/**
 * Gets the accessible hint for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The accessible hint, or undefined
 */
export function getAccessibleHint(widget: Widget, tree: AccessibilityTree): string | undefined {
	const node = tree.getNode(widget.id);
	return node?.hint;
}

/**
 * Gets the accessibility role for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The accessibility role
 */
export function getAccessibleRole(widget: Widget, tree: AccessibilityTree): string {
	const node = tree.getNode(widget.id);
	return node?.role ?? 'generic';
}

/**
 * Gets the accessibility states for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns Array of accessibility states
 */
export function getAccessibleStates(widget: Widget, tree: AccessibilityTree): string[] {
	const node = tree.getNode(widget.id);
	return node?.states ?? [];
}

/**
 * Checks if a widget has a specific accessibility state
 *
 * @param widget - The widget
 * @param state - The state to check
 * @param tree - The accessibility tree
 * @returns Whether the widget has the state
 */
export function hasAccessibleState(
	widget: Widget,
	state: string,
	tree: AccessibilityTree,
): boolean {
	const node = tree.getNode(widget.id);
	return node?.states.includes(state as any) ?? false;
}

/**
 * Gets the accessibility value for a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The accessibility value, or undefined
 */
export function getAccessibleValue(
	widget: Widget,
	tree: AccessibilityTree,
): {now: number; min: number; max: number; text?: string} | undefined {
	const node = tree.getNode(widget.id);
	return node?.value;
}

/**
 * Checks if a widget is exposed to screen readers
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns Whether the widget is exposed
 */
export function isExposed(widget: Widget, tree: AccessibilityTree): boolean {
	const node = tree.getNode(widget.id);
	return node?.exposed ?? false;
}

/**
 * Gets the depth of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The depth of the widget
 */
export function getAccessibilityDepth(widget: Widget, tree: AccessibilityTree): number {
	const node = tree.getNode(widget.id);
	return node?.depth ?? 0;
}

/**
 * Gets the path from the root to a widget
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns Array of widgets from root to the widget
 */
export function getAccessibilityPath(widget: Widget, tree: AccessibilityTree): Widget[] {
	const node = tree.getNode(widget.id);
	if (!node) {
		return [];
	}

	const pathNodes = tree.getPath(node);
	return pathNodes.map((n) => n.widget);
}

/**
 * Gets the parent of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The parent widget, or null if the widget is the root
 */
export function getAccessibilityParent(widget: Widget, tree: AccessibilityTree): Widget | null {
	const node = tree.getNode(widget.id);
	return node?.parent?.widget ?? null;
}

/**
 * Gets the children of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns Array of child widgets
 */
export function getAccessibilityChildren(widget: Widget, tree: AccessibilityTree): Widget[] {
	const node = tree.getNode(widget.id);
	return node?.children.map((n) => n.widget) ?? [];
}

/**
 * Gets the siblings of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns Array of sibling widgets
 */
export function getAccessibilitySiblings(widget: Widget, tree: AccessibilityTree): Widget[] {
	const node = tree.getNode(widget.id);
	return node ? tree.getSiblings(node).map((n) => n.widget) : [];
}

/**
 * Gets the previous sibling of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The previous sibling widget, or undefined
 */
export function getPreviousSibling(widget: Widget, tree: AccessibilityTree): Widget | undefined {
	const node = tree.getNode(widget.id);
	return node?.parent ? tree.getPreviousSibling(node)?.widget : undefined;
}

/**
 * Gets the next sibling of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The next sibling widget, or undefined
 */
export function getNextSibling(widget: Widget, tree: AccessibilityTree): Widget | undefined {
	const node = tree.getNode(widget.id);
	return node?.parent ? tree.getNextSibling(node)?.widget : undefined;
}

/**
 * Gets the first child of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The first child widget, or undefined
 */
export function getFirstChild(widget: Widget, tree: AccessibilityTree): Widget | undefined {
	const node = tree.getNode(widget.id);
	if (!node) {
		return undefined;
	}
	return tree.getFirstChild(node)?.widget;
}

/**
 * Gets the last child of a widget in the accessibility tree
 *
 * @param widget - The widget
 * @param tree - The accessibility tree
 * @returns The last child widget, or undefined
 */
export function getLastChild(widget: Widget, tree: AccessibilityTree): Widget | undefined {
	const node = tree.getNode(widget.id);
	if (!node) {
		return undefined;
	}
	return tree.getLastChild(node)?.widget;
}

/**
 * Finds widgets by accessibility role
 *
 * @param role - The role to find
 * @param tree - The accessibility tree
 * @returns Array of widgets with the role
 */
export function findByRole(role: string, tree: AccessibilityTree): Widget[] {
	const nodes = tree.findByRole(role as any);
	return nodes.map((n) => n.widget);
}

/**
 * Finds widgets by accessibility state
 *
 * @param state - The state to find
 * @param tree - The accessibility tree
 * @returns Array of widgets with the state
 */
export function findByState(state: string, tree: AccessibilityTree): Widget[] {
	const nodes = tree.findByState(state as any);
	return nodes.map((n) => n.widget);
}

/**
 * Gets all exposed widgets
 *
 * @param tree - The accessibility tree
 * @returns Array of exposed widgets
 */
export function getExposedWidgets(tree: AccessibilityTree): Widget[] {
	const nodes = tree.getExposedNodes();
	return nodes.map((n) => n.widget);
}

/**
 * Formats an accessibility label for screen readers
 *
 * @param label - The label text
 * @param role - The widget role
 * @param state - The widget state
 * @returns Formatted label
 */
export function formatAccessibilityLabel(
	label: string,
	role?: string,
	state?: string[],
): string {
	let formatted = label;

	// Add role if provided
	if (role) {
		formatted += `, ${role}`;
	}

	// Add states if provided
	if (state && state.length > 0) {
		formatted += `, ${state.join(', ')}`;
	}

	return formatted;
}

/**
 * Generates a unique accessibility ID
 *
 * @param prefix - Optional prefix for the ID
 * @returns A unique accessibility ID
 */
export function generateAccessibilityId(prefix: string = 'a11y'): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates an accessibility label
 *
 * @param label - The label to validate
 * @returns Whether the label is valid
 */
export function validateAccessibilityLabel(label: string): boolean {
	// Label must not be empty
	if (!label || label.trim().length === 0) {
		return false;
	}

	// Label must not be too long (screen readers may truncate)
	if (label.length > 200) {
		return false;
	}

	// Label must not contain only special characters
	if (!/[a-zA-Z0-9]/.test(label)) {
		return false;
	}

	return true;
}

/**
 * Validates an accessibility description
 *
 * @param description - The description to validate
 * @returns Whether the description is valid
 */
export function validateAccessibilityDescription(description: string): boolean {
	// Description can be empty
	if (!description || description.trim().length === 0) {
		return true;
	}

	// Description must not be too long
	if (description.length > 500) {
		return false;
	}

	return true;
}

/**
 * Checks if a color contrast meets WCAG AA requirements
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param largeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Whether the contrast meets WCAG AA requirements
 */
export function checkContrastAA(
	foreground: string,
	background: string,
	largeText: boolean = false,
): boolean {
	const ratio = calculateContrastRatio(foreground, background);
	const threshold = largeText ? 3.0 : 4.5;
	return ratio >= threshold;
}

/**
 * Checks if a color contrast meets WCAG AAA requirements
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param largeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Whether the contrast meets WCAG AAA requirements
 */
export function checkContrastAAA(
	foreground: string,
	background: string,
	largeText: boolean = false,
): boolean {
	const ratio = calculateContrastRatio(foreground, background);
	const threshold = largeText ? 4.5 : 7.0;
	return ratio >= threshold;
}

/**
 * Calculates the contrast ratio between two colors
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns The contrast ratio
 */
export function calculateContrastRatio(foreground: string, background: string): number {
	const fgLuminance = getLuminance(foreground);
	const bgLuminance = getLuminance(background);

	const lighter = Math.max(fgLuminance, bgLuminance);
	const darker = Math.min(fgLuminance, bgLuminance);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Gets the relative luminance of a color
 *
 * @param color - The color (hex format)
 * @returns The relative luminance
 */
export function getLuminance(color: string): number {
	const rgb = hexToRgb(color);
	if (!rgb) {
		return 0;
	}

	const [r, g, b] = rgb.map((c) => {
		const sRGB = c / 255;
		return sRGB <= 0.03928
			? sRGB / 12.92
			: Math.pow((sRGB + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts a hex color to RGB
 *
 * @param hex - The hex color
 * @returns The RGB values, or null if invalid
 */
export function hexToRgb(hex: string): [number, number, number] | null {
	// Remove # if present
	const cleanHex = hex.replace('#', '');

	// Parse hex
	if (cleanHex.length === 3) {
		const r = parseInt(cleanHex[0] + cleanHex[0], 16);
		const g = parseInt(cleanHex[1] + cleanHex[1], 16);
		const b = parseInt(cleanHex[2] + cleanHex[2], 16);
		return [r, g, b];
	}

	if (cleanHex.length === 6) {
		const r = parseInt(cleanHex.substring(0, 2), 16);
		const g = parseInt(cleanHex.substring(2, 4), 16);
		const b = parseInt(cleanHex.substring(4, 6), 16);
		return [r, g, b];
	}

	return null;
}

/**
 * Normalizes a key combination string
 *
 * @param keys - The key combination
 * @returns Normalized key combination
 */
export function normalizeKeyCombination(keys: string): string {
	return keys
		.toLowerCase()
		.split('+')
		.map((k) => k.trim())
		.sort()
		.join('+');
}

/**
 * Checks if a key combination matches a pattern
 *
 * @param keys - The key combination to check
 * @param pattern - The pattern to match
 * @returns Whether the key combination matches
 */
export function matchesKeyCombination(keys: string, pattern: string): boolean {
	return normalizeKeyCombination(keys) === normalizeKeyCombination(pattern);
}
