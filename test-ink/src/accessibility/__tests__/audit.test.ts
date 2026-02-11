/**
 * Accessibility Audit Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {AccessibilityAudit} from '../audit.js';
import {AccessibilityTree} from '../tree.js';
import {AccessibilityFocusManager} from '../focus.js';

describe('AccessibilityAudit', () => {
	let audit: AccessibilityAudit;
	let tree: AccessibilityTree;
	let focusManager: AccessibilityFocusManager;

	beforeEach(() => {
		tree = new AccessibilityTree();
		focusManager = new AccessibilityFocusManager();
		audit = new AccessibilityAudit(tree, focusManager);
	});

	describe('constructor', () => {
		it('should create audit with default rules', () => {
			expect(audit.rules.length).toBeGreaterThan(0);
		});
	});

	describe('registerRule', () => {
		it('should register rule', () => {
			audit.registerRule({
				id: 'test-rule',
				name: 'Test Rule',
				description: 'Test description',
				severity: 'error',
				enabled: true,
				check: () => null,
			});
			expect(audit.rules.some((r) => r.id === 'test-rule')).toBe(true);
		});
	});

	describe('unregisterRule', () => {
		it('should unregister rule', () => {
			audit.registerRule({
				id: 'test-rule',
				name: 'Test Rule',
				description: 'Test description',
				severity: 'error',
				enabled: true,
				check: () => null,
			});
			audit.unregisterRule('test-rule');
			expect(audit.rules.some((r) => r.id === 'test-rule')).toBe(false);
		});
	});

	describe('enableRule', () => {
		it('should enable rule', () => {
			audit.registerRule({
				id: 'test-rule',
				name: 'Test Rule',
				description: 'Test description',
				severity: 'error',
				enabled: false,
				check: () => null,
			});
			audit.enableRule('test-rule');
			const rule = audit.rules.find((r) => r.id === 'test-rule');
			expect(rule?.enabled).toBe(true);
		});
	});

	describe('disableRule', () => {
		it('should disable rule', () => {
			audit.registerRule({
				id: 'test-rule',
				name: 'Test Rule',
				description: 'Test description',
				severity: 'error',
				enabled: true,
				check: () => null,
			});
			audit.disableRule('test-rule');
			const rule = audit.rules.find((r) => r.id === 'test-rule');
			expect(rule?.enabled).toBe(false);
		});
	});

	describe('audit', () => {
		it('should run audit', () => {
			const report = audit.audit();
			expect(report).toBeDefined();
			expect(report.result).toBeDefined();
			expect(report.timestamp).toBeDefined();
		});
	});

	describe('generateReport', () => {
		it('should generate report', () => {
			const report = audit.audit();
			const text = audit.generateReport(report);
			expect(text).toContain('Accessibility Audit Report');
		});
	});

	describe('clearRules', () => {
		it('should clear all rules', () => {
			audit.clearRules();
			expect(audit.rules.length).toBe(0);
		});
	});

	describe('destroy', () => {
		it('should destroy audit', () => {
			audit.destroy();
			expect(audit.rules.length).toBe(0);
		});
	});
});
