/**
 * Accessibility Audit Module
 *
 * Provides accessibility auditing functionality for the TUI framework.
 * Checks for missing labels, keyboard navigation issues, contrast issues,
 * and generates accessibility reports.
 *
 * @module accessibility/audit
 */

import type {Widget} from '../widgets/types.js';
import {
	AccessibilityIssueType,
	type AccessibilityIssue,
	type AccessibilityWarning,
	type AccessibilityAuditResult,
} from './types.js';
import {AccessibilityTree, TraversalOrder} from './tree.js';
import {AccessibilityFocusManager} from './focus.js';

/**
 * Audit rule configuration
 */
export interface AuditRule {
	/** The rule ID */
	id: string;

	/** The rule name */
	name: string;

	/** The rule description */
	description: string;

	/** The rule severity */
	severity: 'error' | 'warning';

	/** Whether the rule is enabled */
	enabled: boolean;

	/** The check function */
	check: (widget: Widget, context: AuditContext) => AccessibilityIssue | null;
}

/**
 * Audit context
 */
export interface AuditContext {
	/** The accessibility tree */
	tree: AccessibilityTree;

	/** The focus manager */
	focusManager: AccessibilityFocusManager;

	/** All widgets in the tree */
	allWidgets: Widget[];

	/** Focusable widgets */
	focusableWidgets: Widget[];
}

/**
 * Audit report
 */
export interface AuditReport {
	/** The audit result */
	result: AccessibilityAuditResult;

	/** The timestamp of the audit */
	timestamp: number;

	/** The number of widgets audited */
	widgetCount: number;

	/** The number of issues found */
	issueCount: number;

	/** The number of warnings found */
	warningCount: number;

	/** Issues by type */
	issuesByType: Map<AccessibilityIssueType, number>;

	/** Warnings by type */
	warningsByType: Map<string, number>;
}

/**
 * Accessibility Audit class
 */
export class AccessibilityAudit {
	/** Registered audit rules */
	private _rules: Map<string, AuditRule>;

	/** Accessibility tree */
	private _tree: AccessibilityTree;

	/** Focus manager */
	private _focusManager: AccessibilityFocusManager;

	/**
	 * Creates a new AccessibilityAudit instance
	 *
	 * @param tree - The accessibility tree
	 * @param focusManager - The focus manager
	 */
	constructor(tree: AccessibilityTree, focusManager: AccessibilityFocusManager) {
		this._rules = new Map();
		this._tree = tree;
		this._focusManager = focusManager;

		// Register default rules
		this._registerDefaultRules();
	}

	/**
	 * Gets the registered rules
	 */
	get rules(): AuditRule[] {
		return Array.from(this._rules.values());
	}

	/**
	 * Registers an audit rule
	 *
	 * @param rule - The rule to register
	 */
	registerRule(rule: AuditRule): void {
		this._rules.set(rule.id, rule);
	}

	/**
	 * Unregisters an audit rule
	 *
	 * @param ruleId - The rule ID
	 */
	unregisterRule(ruleId: string): void {
		this._rules.delete(ruleId);
	}

	/**
	 * Enables a rule
	 *
	 * @param ruleId - The rule ID
	 */
	enableRule(ruleId: string): void {
		const rule = this._rules.get(ruleId);
		if (rule) {
			rule.enabled = true;
		}
	}

	/**
	 * Disables a rule
	 *
	 * @param ruleId - The rule ID
	 */
	disableRule(ruleId: string): void {
		const rule = this._rules.get(ruleId);
		if (rule) {
			rule.enabled = false;
		}
	}

	/**
	 * Runs an accessibility audit
	 *
	 * @returns The audit report
	 */
	audit(): AuditReport {
		const issues: AccessibilityIssue[] = [];
		const warnings: AccessibilityWarning[] = [];
		const issuesByType = new Map<AccessibilityIssueType, number>();
		const warningsByType = new Map<string, number>();

		// Get all widgets from the tree
		const allWidgets: Widget[] = [];
		this._tree.traverse(TraversalOrder.PRE_ORDER, (node) => {
			allWidgets.push(node.widget);
		});

		// Get focusable widgets
		const focusableWidgets = this._focusManager.focusableWidgets;

		// Create audit context
		const context: AuditContext = {
			tree: this._tree,
			focusManager: this._focusManager,
			allWidgets,
			focusableWidgets,
		};

		// Run all enabled rules
		for (const rule of this._rules.values()) {
			if (!rule.enabled) {
				continue;
			}

			for (const widget of allWidgets) {
				const issue = rule.check(widget, context);
				if (issue) {
					if (issue.severity === 'error') {
						issues.push(issue);
						const count = issuesByType.get(issue.type) ?? 0;
						issuesByType.set(issue.type, count + 1);
					} else {
						warnings.push({
							type: issue.type,
							widget: issue.widget,
							message: issue.message,
							suggestion: issue.suggestion,
						});
						const count = warningsByType.get(issue.type) ?? 0;
						warningsByType.set(issue.type, count + 1);
					}
				}
			}
		}

		// Calculate score
		const score = this._calculateScore(issues, warnings, allWidgets.length);

		// Create result
		const result: AccessibilityAuditResult = {
			passed: issues.length === 0,
			issues,
			warnings,
			score,
		};

		// Create report
		const report: AuditReport = {
			result,
			timestamp: Date.now(),
			widgetCount: allWidgets.length,
			issueCount: issues.length,
			warningCount: warnings.length,
			issuesByType,
			warningsByType,
		};

		return report;
	}

	/**
	 * Generates a human-readable report
	 *
	 * @param report - The audit report
	 * @returns The formatted report string
	 */
	generateReport(report: AuditReport): string {
		const lines: string[] = [];

		lines.push('='.repeat(60));
		lines.push('Accessibility Audit Report');
		lines.push('='.repeat(60));
		lines.push('');
		lines.push(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
		lines.push(`Widgets Audited: ${report.widgetCount}`);
		lines.push(`Issues Found: ${report.issueCount}`);
		lines.push(`Warnings Found: ${report.warningCount}`);
		lines.push(`Accessibility Score: ${report.result.score}/100`);
		lines.push('');
		lines.push(`Overall Status: ${report.result.passed ? 'PASSED' : 'FAILED'}`);
		lines.push('');

		// Print issues
		if (report.result.issues.length > 0) {
			lines.push('-'.repeat(60));
			lines.push('Issues:');
			lines.push('-'.repeat(60));
			for (const issue of report.result.issues) {
				lines.push(`  [${issue.severity.toUpperCase()}] ${issue.type}`);
				lines.push(`  Widget: ${issue.widget.id}`);
				lines.push(`  Message: ${issue.message}`);
				if (issue.suggestion) {
					lines.push(`  Suggestion: ${issue.suggestion}`);
				}
				lines.push('');
			}
		}

		// Print warnings
		if (report.result.warnings.length > 0) {
			lines.push('-'.repeat(60));
			lines.push('Warnings:');
			lines.push('-'.repeat(60));
			for (const warning of report.result.warnings) {
				lines.push(`  [WARNING] ${warning.type}`);
				lines.push(`  Widget: ${warning.widget.id}`);
				lines.push(`  Message: ${warning.message}`);
				if (warning.suggestion) {
					lines.push(`  Suggestion: ${warning.suggestion}`);
				}
				lines.push('');
			}
		}

		// Print issues by type
		if (report.issuesByType.size > 0) {
			lines.push('-'.repeat(60));
			lines.push('Issues by Type:');
			lines.push('-'.repeat(60));
			for (const [type, count] of report.issuesByType) {
				lines.push(`  ${type}: ${count}`);
			}
			lines.push('');
		}

		// Print warnings by type
		if (report.warningsByType.size > 0) {
			lines.push('-'.repeat(60));
			lines.push('Warnings by Type:');
			lines.push('-'.repeat(60));
			for (const [type, count] of report.warningsByType) {
				lines.push(`  ${type}: ${count}`);
			}
			lines.push('');
		}

		lines.push('='.repeat(60));

		return lines.join('\n');
	}

	/**
	 * Clears all registered rules
	 */
	clearRules(): void {
		this._rules.clear();
	}

	/**
	 * Destroys the audit and cleans up resources
	 */
	destroy(): void {
		this._rules.clear();
	}

	/**
	 * Registers the default audit rules
	 */
	private _registerDefaultRules(): void {
		// Missing label rule
		this.registerRule({
			id: 'missing-label',
			name: 'Missing Label',
			description: 'Widgets must have an accessible label',
			severity: 'error',
			enabled: true,
			check: (widget, context) => {
				const node = context.tree.getNode(widget.id);
				if (!node) {
					return null;
				}

				// Check if widget has a label
				if (!node.label || node.label.trim().length === 0) {
					return {
						type: AccessibilityIssueType.MISSING_LABEL,
						widget,
						message: 'Widget is missing an accessible label',
						severity: 'error',
						suggestion: 'Add an aria-label or provide visible text content',
					};
				}

				return null;
			},
		});

		// Missing description rule
		this.registerRule({
			id: 'missing-description',
			name: 'Missing Description',
			description: 'Interactive widgets should have an accessible description',
			severity: 'warning',
			enabled: true,
			check: (widget, context) => {
				const node = context.tree.getNode(widget.id);
				if (!node) {
					return null;
				}

				// Check if widget is interactive
				const interactiveRoles = [
					'button',
					'checkbox',
					'radio',
					'textbox',
					'slider',
					'progressbar',
				];

				if (interactiveRoles.includes(node.role) && !node.description) {
					return {
						type: AccessibilityIssueType.MISSING_DESCRIPTION,
						widget,
						message: 'Interactive widget is missing an accessible description',
						severity: 'warning',
						suggestion: 'Add an aria-description to provide additional context',
					};
				}

				return null;
			},
		});

		// No keyboard navigation rule
		this.registerRule({
			id: 'no-keyboard-navigation',
			name: 'No Keyboard Navigation',
			description: 'Interactive widgets must be keyboard accessible',
			severity: 'error',
			enabled: true,
			check: (widget, context) => {
				const node = context.tree.getNode(widget.id);
				if (!node) {
					return null;
				}

				// Check if widget is interactive
				const interactiveRoles = [
					'button',
					'checkbox',
					'radio',
					'textbox',
					'slider',
					'progressbar',
				];

				if (interactiveRoles.includes(node.role)) {
					// Check if widget is focusable
					if (!context.focusManager.isFocusable(widget)) {
						return {
							type: AccessibilityIssueType.NO_KEYBOARD_NAVIGATION,
							widget,
							message: 'Interactive widget is not keyboard accessible',
							severity: 'error',
							suggestion: 'Add tabIndex or make the widget focusable',
						};
					}
				}

				return null;
			},
		});

		// Missing focus indicator rule
		this.registerRule({
			id: 'missing-focus-indicator',
			name: 'Missing Focus Indicator',
			description: 'Focusable widgets must have a visible focus indicator',
			severity: 'warning',
			enabled: true,
			check: (widget, context) => {
				// Check if widget is focusable
				if (context.focusManager.isFocusable(widget)) {
					// This is a simplified check - in a real implementation,
					// we would check if the widget has a visual focus indicator
					return {
						type: AccessibilityIssueType.MISSING_FOCUS_INDICATOR,
						widget,
						message: 'Focusable widget may not have a visible focus indicator',
						severity: 'warning',
						suggestion: 'Ensure focusable widgets have a visible focus indicator',
					};
				}

				return null;
			},
		});

		// Invalid role rule
		this.registerRule({
			id: 'invalid-role',
			name: 'Invalid Role',
			description: 'Widgets must have a valid accessibility role',
			severity: 'error',
			enabled: true,
			check: (widget, context) => {
				const node = context.tree.getNode(widget.id);
				if (!node) {
					return null;
				}

				// Check if widget has a role
				if (!node.role) {
					return {
						type: AccessibilityIssueType.INVALID_ROLE,
						widget,
						message: 'Widget is missing an accessibility role',
						severity: 'error',
						suggestion: 'Add an aria-role to the widget',
					};
				}

				return null;
			},
		});

		// Missing required attribute rule
		this.registerRule({
			id: 'missing-required-attribute',
			name: 'Missing Required Attribute',
			description: 'Required form fields must be marked as required',
			severity: 'warning',
			enabled: true,
			check: (widget, context) => {
				const node = context.tree.getNode(widget.id);
				if (!node) {
					return null;
				}

				// Check if widget is a required form field
				if (node.role === 'textbox' || node.role === 'checkbox' || node.role === 'radio') {
					// This is a simplified check - in a real implementation,
					// we would check if the widget is actually required
					return {
						type: AccessibilityIssueType.MISSING_REQUIRED_ATTRIBUTE,
						widget,
						message: 'Form field may need to be marked as required',
						severity: 'warning',
						suggestion: 'Add aria-required if the field is required',
					};
				}

				return null;
			},
		});
	}

	/**
	 * Calculates the accessibility score
	 *
	 * @param issues - The issues found
	 * @param warnings - The warnings found
	 * @param widgetCount - The number of widgets audited
	 * @returns The score (0-100)
	 */
	private _calculateScore(
		issues: AccessibilityIssue[],
		warnings: AccessibilityWarning[],
		widgetCount: number,
	): number {
		if (widgetCount === 0) {
			return 100;
		}

		// Calculate penalty for issues
		const issuePenalty = issues.length * 10;
		const warningPenalty = warnings.length * 5;

		// Calculate score
		let score = 100 - issuePenalty - warningPenalty;

		// Ensure score is between 0 and 100
		return Math.max(0, Math.min(100, score));
	}
}
