/**
 * Keyboard Navigation Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {KeyboardNavigation, ShortcutScope, ConflictResolution} from '../keyboard.js';

describe('KeyboardNavigation', () => {
	let keyboardNav: KeyboardNavigation;

	beforeEach(() => {
		keyboardNav = new KeyboardNavigation();
	});

	describe('constructor', () => {
		it('should create keyboard navigation with enabled state', () => {
			expect(keyboardNav.enabled).toBe(true);
		});

		it('should have no active widget initially', () => {
			expect(keyboardNav.activeWidget).toBe(null);
		});
	});

	describe('registerShortcut', () => {
		it('should register shortcut', () => {
			const action = () => {};
			keyboardNav.registerShortcut({
				keys: 'Ctrl+S',
				action,
				description: 'Save',
				global: true,
			});
			expect(keyboardNav.hasShortcut('Ctrl+S')).toBe(true);
		});
	});

	describe('unregisterShortcut', () => {
		it('should unregister shortcut', () => {
			const action = () => {};
			keyboardNav.registerShortcut({
				keys: 'Ctrl+S',
				action,
				global: true,
			});
			keyboardNav.unregisterShortcut('Ctrl+S');
			expect(keyboardNav.hasShortcut('Ctrl+S')).toBe(false);
		});
	});

	describe('hasShortcut', () => {
		it('should return true for registered shortcut', () => {
			const action = () => {};
			keyboardNav.registerShortcut({
				keys: 'Ctrl+S',
				action,
				global: true,
			});
			expect(keyboardNav.hasShortcut('Ctrl+S')).toBe(true);
		});

		it('should return false for unregistered shortcut', () => {
			expect(keyboardNav.hasShortcut('Ctrl+S')).toBe(false);
		});
	});

	describe('getShortcutDescription', () => {
		it('should return shortcut description', () => {
			const action = () => {};
			keyboardNav.registerShortcut({
				keys: 'Ctrl+S',
				action,
				description: 'Save',
				global: true,
			});
			expect(keyboardNav.getShortcutDescription('Ctrl+S')).toBe('Save');
		});
	});

	describe('registerCommonShortcuts', () => {
		it('should register common shortcuts', () => {
			keyboardNav.registerCommonShortcuts();
			expect(keyboardNav.hasShortcut('Tab')).toBe(true);
			expect(keyboardNav.hasShortcut('Enter')).toBe(true);
			expect(keyboardNav.hasShortcut('Escape')).toBe(true);
		});
	});

	describe('conflict resolution', () => {
		it('should set conflict resolution strategy', () => {
			keyboardNav.conflictResolution = ConflictResolution.PRIORITY;
			expect(keyboardNav.conflictResolution).toBe(ConflictResolution.PRIORITY);
		});
	});

	describe('clearAllShortcuts', () => {
		it('should clear all shortcuts', () => {
			const action = () => {};
			keyboardNav.registerShortcut({
				keys: 'Ctrl+S',
				action,
				global: true,
			});
			keyboardNav.clearAllShortcuts();
			expect(keyboardNav.getAllShortcuts().size).toBe(0);
		});
	});

	describe('destroy', () => {
		it('should destroy keyboard navigation', () => {
			keyboardNav.destroy();
			expect(keyboardNav.enabled).toBe(false);
			expect(keyboardNav.getAllShortcuts().size).toBe(0);
		});
	});
});
