/**
 * ARIA Attributes Tests
 */

import {describe, it, expect} from 'vitest';
import {aria, ariaLabel, ariaDescription, ariaRole, ariaChecked, ariaSelected} from '../aria.js';
import {AccessibilityRole} from '../types.js';

describe('ARIA Attributes', () => {
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

	describe('aria.label', () => {
		it('should return label props', () => {
			const result = aria.label(mockWidget as any, 'Test Label');
			expect(result.label).toBe('Test Label');
		});
	});

	describe('aria.description', () => {
		it('should return description props', () => {
			const result = aria.description(mockWidget as any, 'Test Description');
			expect(result.description).toBe('Test Description');
		});
	});

	describe('aria.role', () => {
		it('should return role props', () => {
			const result = aria.role(mockWidget as any, AccessibilityRole.BUTTON);
			expect(result.role).toBe(AccessibilityRole.BUTTON);
		});
	});

	describe('aria.checked', () => {
		it('should return checked props', () => {
			const result = aria.checked(mockWidget as any, true);
			expect(result.checked).toBe(true);
		});
	});

	describe('aria.selected', () => {
		it('should return selected props', () => {
			const result = aria.selected(mockWidget as any, true);
			expect(result.selected).toBe(true);
		});
	});

	describe('ariaLabel', () => {
		it('should return label props', () => {
			const result = ariaLabel(mockWidget as any, 'Test Label');
			expect(result.label).toBe('Test Label');
		});
	});

	describe('ariaDescription', () => {
		it('should return description props', () => {
			const result = ariaDescription(mockWidget as any, 'Test Description');
			expect(result.description).toBe('Test Description');
		});
	});

	describe('ariaRole', () => {
		it('should return role props', () => {
			const result = ariaRole(mockWidget as any, AccessibilityRole.BUTTON);
			expect(result.role).toBe(AccessibilityRole.BUTTON);
		});
	});

	describe('ariaChecked', () => {
		it('should return checked props', () => {
			const result = ariaChecked(mockWidget as any, true);
			expect(result.checked).toBe(true);
		});
	});

	describe('ariaSelected', () => {
		it('should return selected props', () => {
			const result = ariaSelected(mockWidget as any, true);
			expect(result.selected).toBe(true);
		});
	});
});
