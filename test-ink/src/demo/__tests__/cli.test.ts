/**
 * CLI Tests
 *
 * Unit tests for the demo CLI utilities.
 *
 * @module demo/__tests__/cli
 */

import { describe, it, expect } from 'vitest';
import {
	parseArgs,
	validateOptions,
	generateHelp,
	generateVersion,
	parseAndValidate,
	handleSpecialFlags,
} from '../cli.js';

describe('CLI', () => {
	describe('parseArgs', () => {
		it('should parse mode option', () => {
			const result = parseArgs(['--mode', 'dashboard']);
			expect(result.options.mode).toBe('dashboard');
		});

		it('should parse theme option', () => {
			const result = parseArgs(['--theme', 'light']);
			expect(result.options.theme).toBe('light');
		});

		it('should parse verbose flag', () => {
			const result = parseArgs(['--verbose']);
			expect(result.options.verbose).toBe(true);
		});

		it('should parse debug flag', () => {
			const result = parseArgs(['--debug']);
			expect(result.options.debug).toBe(true);
		});

		it('should parse fps option', () => {
			const result = parseArgs(['--fps', '30']);
			expect(result.options.fps).toBe('30');
		});

		it('should parse short flags', () => {
			const result = parseArgs(['-m', 'charts', '-v']);
			expect(result.options.mode).toBe('charts');
			expect(result.options.verbose).toBe(true);
		});

		it('should apply defaults', () => {
			const result = parseArgs([]);
			expect(result.options.mode).toBe('interactive');
			expect(result.options.theme).toBe('dark');
			expect(result.options.fps).toBe(60);
		});
	});

	describe('validateOptions', () => {
		it('should validate valid mode', () => {
			const result = validateOptions({ mode: 'dashboard' });
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject invalid mode', () => {
			const result = validateOptions({ mode: 'invalid' });
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should validate valid theme', () => {
			const result = validateOptions({ theme: 'light' });
			expect(result.valid).toBe(true);
		});

		it('should reject invalid theme', () => {
			const result = validateOptions({ theme: 'invalid' });
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should validate valid FPS', () => {
			const result = validateOptions({ fps: 60 });
			expect(result.valid).toBe(true);
		});

		it('should reject invalid FPS', () => {
			const result = validateOptions({ fps: 200 });
			expect(result.valid).toBe(false);
		});
	});

	describe('generateHelp', () => {
		it('should include application name', () => {
			const help = generateHelp();
			expect(help).toContain('TUI Framework Demo');
		});

		it('should include usage information', () => {
			const help = generateHelp();
			expect(help).toContain('USAGE:');
		});

		it('should include options', () => {
			const help = generateHelp();
			expect(help).toContain('OPTIONS:');
		});

		it('should include demo modes', () => {
			const help = generateHelp();
			expect(help).toContain('DEMO MODES:');
		});

		it('should include themes', () => {
			const help = generateHelp();
			expect(help).toContain('THEMES:');
		});

		it('should include keyboard shortcuts', () => {
			const help = generateHelp();
			expect(help).toContain('KEYBOARD SHORTCUTS');
		});

		it('should include examples', () => {
			const help = generateHelp();
			expect(help).toContain('EXAMPLES:');
		});
	});

	describe('generateVersion', () => {
		it('should return version string', () => {
			const version = generateVersion();
			expect(version).toContain('TUI Framework Demo');
			expect(version).toContain('v1.0.0');
		});
	});

	describe('parseAndValidate', () => {
		it('should return valid result for valid args', () => {
			const result = parseAndValidate(['--mode', 'dashboard']);
			expect(result.valid).toBe(true);
			expect(result.args.options.mode).toBe('dashboard');
		});

		it('should return errors for invalid args', () => {
			const result = parseAndValidate(['--mode', 'invalid']);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe('handleSpecialFlags', () => {
		it('should return true for help flag', () => {
			const result = handleSpecialFlags({ help: true });
			expect(result).toBe(true);
		});

		it('should return true for version flag', () => {
			const result = handleSpecialFlags({ version: true });
			expect(result).toBe(true);
		});

		it('should return false for no special flags', () => {
			const result = handleSpecialFlags({});
			expect(result).toBe(false);
		});
	});
});
