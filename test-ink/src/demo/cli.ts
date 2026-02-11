/**
 * Demo CLI Module
 *
 * Provides command-line interface utilities for the demo application.
 * Handles argument parsing, help display, and demo mode selection.
 *
 * @module demo/cli
 */

/**
 * Available demo modes
 */
export type DemoMode =
	| 'interactive'
	| 'dashboard'
	| 'charts'
	| 'widgets'
	| 'layout'
	| 'tasks'
	| 'theme'
	| 'accessibility'
	| 'performance';

/**
 * Available themes
 */
export type ThemeOption = 'light' | 'dark' | 'high-contrast' | 'monochrome';

/**
 * CLI configuration options
 */
export interface CLIOptions {
	/** Demo mode to run */
	mode?: DemoMode;
	/** Theme to use */
	theme?: ThemeOption;
	/** Enable verbose output */
	verbose?: boolean;
	/** Enable debug mode */
	debug?: boolean;
	/** Target FPS for rendering */
	fps?: number;
	/** Enable mouse support */
	mouse?: boolean;
	/** Enable bracketed paste */
	bracketedPaste?: boolean;
	/** Show help and exit */
	help?: boolean;
	/** Show version and exit */
	version?: boolean;
}

/**
 * Parsed CLI arguments
 */
export interface ParsedArgs {
	/** Positional arguments */
	positionals: string[];
	/** Named options */
	options: CLIOptions;
}

/**
 * Command-line argument definition
 */
interface ArgDefinition {
	/** Short flag (e.g., 'h' for -h) */
	short?: string;
	/** Long flag (e.g., 'help' for --help) */
	long?: string;
	/** Description for help text */
	description: string;
	/** Whether the flag takes a value */
	hasValue?: boolean;
	/** Default value */
	default?: unknown;
}

/**
 * Argument definitions for the demo CLI
 */
const ARG_DEFINITIONS: Record<keyof CLIOptions, ArgDefinition> = {
	mode: {
		short: 'm',
		long: 'mode',
		description: 'Demo mode to run (interactive, dashboard, charts, widgets, layout, tasks, theme, accessibility, performance)',
		hasValue: true,
		default: 'interactive',
	},
	theme: {
		short: 't',
		long: 'theme',
		description: 'Theme to use (light, dark, high-contrast, monochrome)',
		hasValue: true,
		default: 'dark',
	},
	verbose: {
		short: 'v',
		long: 'verbose',
		description: 'Enable verbose output',
		default: false,
	},
	debug: {
		short: 'd',
		long: 'debug',
		description: 'Enable debug mode',
		default: false,
	},
	fps: {
		short: 'f',
		long: 'fps',
		description: 'Target FPS for rendering',
		hasValue: true,
		default: 60,
	},
	mouse: {
		long: 'mouse',
		description: 'Enable mouse support',
		default: true,
	},
	bracketedPaste: {
		long: 'bracketed-paste',
		description: 'Enable bracketed paste',
		default: true,
	},
	help: {
		short: 'h',
		long: 'help',
		description: 'Show this help message and exit',
		default: false,
	},
	version: {
		long: 'version',
		description: 'Show version information and exit',
		default: false,
	},
};

/**
 * Parse command-line arguments
 */
export function parseArgs(args: string[] = process.argv.slice(2)): ParsedArgs {
	const positionals: string[] = [];
	const options: CLIOptions = {};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];

		// Check if it's a flag
		if (arg.startsWith('--')) {
			const longFlag = arg.slice(2);
			const def = Object.entries(ARG_DEFINITIONS).find(([, d]) => d.long === longFlag);

			if (def) {
				const [key, definition] = def;
				if (definition.hasValue) {
					options[key as keyof CLIOptions] = args[i + 1] as never;
					i += 2;
				} else {
					options[key as keyof CLIOptions] = true as never;
					i += 1;
				}
			} else {
				i += 1;
			}
		} else if (arg.startsWith('-')) {
			const shortFlag = arg.slice(1);
			const def = Object.entries(ARG_DEFINITIONS).find(([, d]) => d.short === shortFlag);

			if (def) {
				const [key, definition] = def;
				if (definition.hasValue) {
					options[key as keyof CLIOptions] = args[i + 1] as never;
					i += 2;
				} else {
					options[key as keyof CLIOptions] = true as never;
					i += 1;
				}
			} else {
				i += 1;
			}
		} else {
			// Positional argument
			positionals.push(arg);
			i += 1;
		}
	}

	// Apply defaults
	for (const [key, def] of Object.entries(ARG_DEFINITIONS)) {
		if (options[key as keyof CLIOptions] === undefined && def.default !== undefined) {
			options[key as keyof CLIOptions] = def.default as never;
		}
	}

	return { positionals, options };
}

/**
 * Validate CLI options
 */
export function validateOptions(options: CLIOptions): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Validate mode
	if (options.mode) {
		const validModes: DemoMode[] = [
			'interactive',
			'dashboard',
			'charts',
			'widgets',
			'layout',
			'tasks',
			'theme',
			'accessibility',
			'performance',
		];
		if (!validModes.includes(options.mode as DemoMode)) {
			errors.push(`Invalid mode: ${options.mode}. Valid modes: ${validModes.join(', ')}`);
		}
	}

	// Validate theme
	if (options.theme) {
		const validThemes: ThemeOption[] = ['light', 'dark', 'high-contrast', 'monochrome'];
		if (!validThemes.includes(options.theme as ThemeOption)) {
			errors.push(`Invalid theme: ${options.theme}. Valid themes: ${validThemes.join(', ')}`);
		}
	}

	// Validate FPS
	if (options.fps !== undefined) {
		const fps = Number(options.fps);
		if (isNaN(fps) || fps < 1 || fps > 120) {
			errors.push(`Invalid FPS: ${options.fps}. Must be between 1 and 120`);
		}
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Generate help text
 */
export function generateHelp(): string {
	const lines: string[] = [];

	lines.push('TUI Framework Demo Application');
	lines.push('');
	lines.push('USAGE:');
	lines.push('  demo [OPTIONS]');
	lines.push('');
	lines.push('OPTIONS:');

	// Calculate column widths
	const maxFlagWidth = Math.max(
		...Object.values(ARG_DEFINITIONS).map((def) => {
			const parts: string[] = [];
			if (def.short) parts.push(`-${def.short}`);
			if (def.long) parts.push(`--${def.long}`);
			return parts.join(', ').length;
		}),
	);

	for (const [key, def] of Object.entries(ARG_DEFINITIONS)) {
		const parts: string[] = [];
		if (def.short) parts.push(`-${def.short}`);
		if (def.long) parts.push(`--${def.long}`);
		if (def.hasValue) parts.push(`<${key.toUpperCase()}>`);

		const flagText = parts.join(', ');
		const padding = ' '.repeat(maxFlagWidth - flagText.length + 2);
		lines.push(`  ${flagText}${padding}${def.description}`);
	}

	lines.push('');
	lines.push('DEMO MODES:');
	lines.push('  interactive    Interactive exploration of all features (default)');
	lines.push('  dashboard      Comprehensive dashboard with multiple widgets');
	lines.push('  charts         Showcase all chart types');
	lines.push('  widgets        Showcase all widget types');
	lines.push('  layout         Showcase layout capabilities');
	lines.push('  tasks          Showcase async task processing');
	lines.push('  theme          Showcase theme system');
	lines.push('  accessibility  Showcase accessibility features');
	lines.push('  performance    Showcase performance capabilities');
	lines.push('');
	lines.push('THEMES:');
	lines.push('  light          Light color scheme');
	lines.push('  dark           Dark color scheme (default)');
	lines.push('  high-contrast  High contrast for accessibility');
	lines.push('  monochrome     Monochrome color scheme');
	lines.push('');
	lines.push('KEYBOARD SHORTCUTS (Interactive Mode):');
	lines.push('  q, Ctrl+C      Quit the demo');
	lines.push('  Tab            Navigate between sections');
	lines.push('  Arrow keys     Navigate within sections');
	lines.push('  Enter          Select/activate');
	lines.push('  Esc            Go back / close dialog');
	lines.push('  1-9            Jump to specific demo');
	lines.push('  ?              Show help');
	lines.push('');
	lines.push('EXAMPLES:');
	lines.push('  demo                           # Run interactive demo');
	lines.push('  demo --mode dashboard          # Run dashboard demo');
	lines.push('  demo -m charts -t light        # Run charts demo with light theme');
	lines.push('  demo --fps 30 --verbose        # Run with 30 FPS and verbose output');

	return lines.join('\n');
}

/**
 * Generate version text
 */
export function generateVersion(): string {
	return 'TUI Framework Demo v1.0.0';
}

/**
 * Display help text
 */
export function showHelp(): void {
	console.log(generateHelp());
}

/**
 * Display version text
 */
export function showVersion(): void {
	console.log(generateVersion());
}

/**
 * Format options for display
 */
export function formatOptions(options: CLIOptions): string {
	const lines: string[] = [];

	lines.push('Demo Configuration:');
	lines.push(`  Mode: ${options.mode || 'interactive'}`);
	lines.push(`  Theme: ${options.theme || 'dark'}`);
	lines.push(`  FPS: ${options.fps || 60}`);
	lines.push(`  Verbose: ${options.verbose ? 'Yes' : 'No'}`);
	lines.push(`  Debug: ${options.debug ? 'Yes' : 'No'}`);
	lines.push(`  Mouse: ${options.mouse ? 'Yes' : 'No'}`);
	lines.push(`  Bracketed Paste: ${options.bracketedPaste ? 'Yes' : 'No'}`);

	return lines.join('\n');
}

/**
 * Get banner text for demo startup
 */
export function getBanner(): string {
	return `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ███████╗██╗   ██╗██████╗ ████████╗██████╗  █████╗  ██████╗██╗  ██╗ ║
║   ██╔════╝██║   ██║██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝ ║
║   ███████╗██║   ██║██████╔╝   ██║   ██████╔╝███████║██║     █████╔╝  ║
║   ╚════██║██║   ██║██╔══██╗   ██║   ██╔══██╗██╔══██║██║     ██╔═██╗  ║
║   ███████║╚██████╔╝██████╔╝   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗ ║
║   ╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ║
║                                                                ║
║                    Framework Demo Application                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Parse and validate CLI arguments
 */
export function parseAndValidate(args: string[] = process.argv.slice(2)): {
	valid: boolean;
	args: ParsedArgs;
	errors: string[];
} {
	const parsed = parseArgs(args);
	const validation = validateOptions(parsed.options);

	return {
		valid: validation.valid,
		args: parsed,
		errors: validation.errors,
	};
}

/**
 * Handle special flags (help, version)
 */
export function handleSpecialFlags(options: CLIOptions): boolean {
	if (options.help) {
		showHelp();
		return true;
	}

	if (options.version) {
		showVersion();
		return true;
	}

	return false;
}
