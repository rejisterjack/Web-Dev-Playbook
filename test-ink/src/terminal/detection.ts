/**
 * Terminal Detection Module
 *
 * This module provides functionality to detect terminal capabilities including
 * color support, mouse support modes, Unicode support, and terminal type detection.
 *
 * @module terminal/detection
 */

/**
 * Color support levels
 */
export enum ColorSupport {
	/** No color support */
	NONE = 0,
	/** Basic 16 colors */
	BASIC = 1,
	/** 256 colors (8-bit) */
	ANSI256 = 2,
	/** TrueColor (24-bit RGB) */
	TRUECOLOR = 3,
}

/**
 * Mouse support modes
 */
export enum MouseMode {
	/** No mouse support */
	NONE = 0,
	/** X10 mode - basic mouse tracking */
	X10 = 1,
	/** UTF-8 mode - extended coordinates */
	UTF8 = 2,
	/** SGR mode - modern mouse tracking with extended coordinates */
	SGR = 3,
}

/**
 * Terminal capabilities interface
 */
export interface TerminalCapabilities {
	/** Terminal type (e.g., 'xterm-256color', 'screen') */
	readonly termType: string;

	/** Color support level */
	readonly colorSupport: ColorSupport;

	/** Maximum number of colors supported */
	readonly maxColors: number;

	/** Mouse support mode */
	readonly mouseMode: MouseMode;

	/** Whether the terminal supports Unicode */
	readonly unicodeSupported: boolean;

	/** Whether the terminal supports hyperlinks (OSC 8) */
	readonly hyperlinksSupported: boolean;

	/** Whether the terminal supports bracketed paste */
	readonly bracketedPasteSupported: boolean;

	/** Whether the terminal supports focus events */
	readonly focusEventsSupported: boolean;

	/** Whether the terminal supports truecolor (24-bit RGB) */
	readonly trueColorSupported: boolean;

	/** Terminal version if available */
	readonly termVersion?: string;

	/** Program name if running in a terminal multiplexer */
	readonly program?: string;
}

/**
 * Environment variable names for terminal detection
 */
const ENV_VARS = {
	TERM: 'TERM',
	COLORTERM: 'COLORTERM',
	TERM_PROGRAM: 'TERM_PROGRAM',
	TERM_PROGRAM_VERSION: 'TERM_PROGRAM_VERSION',
	LC_ALL: 'LC_ALL',
	LC_CTYPE: 'LC_CTYPE',
	LANG: 'LANG',
	NO_COLOR: 'NO_COLOR',
	FORCE_COLOR: 'FORCE_COLOR',
	CI: 'CI',
	TEAMCITY_VERSION: 'TEAMCITY_VERSION',
} as const;

/**
 * Terminal types that are known to support TrueColor
 */
const TRUECOLOR_TERMINALS = [
	'xterm-256color',
	'xterm-kitty',
	'xterm-ghostty',
	'wezterm',
	'iterm',
	'iterm2',
	'vte',
	'gnome',
	'gnome-terminal',
	'konsole',
	'alacritty',
	'foot',
	'contour',
	'rio',
	'warp',
	'rio',
	'ghostty',
];

/**
 * Terminal programs that support TrueColor
 */
const TRUECOLOR_PROGRAMS = [
	'Hyper',
	'iTerm.app',
	'Apple_Terminal',
	'WezTerm',
	'vscode',
	'code',
	'rio',
	'ghostty',
	'foot',
	'contour',
	'kitty',
	'alacritty',
	'warp',
];

/**
 * Check if the environment has explicitly disabled colors
 */
function isColorDisabled(): boolean {
	const { env } = process;

	// NO_COLOR takes precedence
	if (env[ENV_VARS.NO_COLOR] !== undefined && env[ENV_VARS.NO_COLOR] !== '') {
		return true;
	}

	return false;
}

/**
 * Check if the environment has explicitly forced colors
 */
function isColorForced(): boolean {
	const { env } = process;

	// FORCE_COLOR takes precedence
	if (env[ENV_VARS.FORCE_COLOR] !== undefined) {
		return env[ENV_VARS.FORCE_COLOR] !== '0';
	}

	return false;
}

/**
 * Detect color support level from environment variables
 */
function detectColorSupport(): ColorSupport {
	const { env } = process;

	// Check if colors are explicitly disabled
	if (isColorDisabled()) {
		return ColorSupport.NONE;
	}

	// Check if colors are explicitly forced
	if (isColorForced()) {
		const forceColor = env[ENV_VARS.FORCE_COLOR];
		if (forceColor === '1' || forceColor === 'true') {
			return ColorSupport.BASIC;
		}

		if (forceColor === '2') {
			return ColorSupport.ANSI256;
		}

		if (forceColor === '3') {
			return ColorSupport.TRUECOLOR;
		}

		return ColorSupport.TRUECOLOR;
	}

	// Check COLORTERM environment variable
	const colorTerm = env[ENV_VARS.COLORTERM];
	if (colorTerm) {
		const normalized = colorTerm.toLowerCase();
		if (normalized.includes('truecolor') || normalized.includes('24bit')) {
			return ColorSupport.TRUECOLOR;
		}
	}

	// Check TERM environment variable
	const term = env[ENV_VARS.TERM];
	if (term) {
		const normalized = term.toLowerCase();

		// Check for TrueColor terminals
		if (TRUECOLOR_TERMINALS.some(t => normalized.includes(t))) {
			return ColorSupport.TRUECOLOR;
		}

		// Check for 256 color support
		if (normalized.includes('256color') || normalized.includes('256')) {
			return ColorSupport.ANSI256;
		}

		// Check for basic color support
		if (normalized.includes('color') || normalized.includes('ansi')) {
			return ColorSupport.BASIC;
		}
	}

	// Check TERM_PROGRAM
	const termProgram = env[ENV_VARS.TERM_PROGRAM];
	if (termProgram) {
		if (TRUECOLOR_PROGRAMS.includes(termProgram)) {
			return ColorSupport.TRUECOLOR;
		}
	}

	// Check for CI environments that typically support colors
	if (env[ENV_VARS.CI] || env[ENV_VARS.TEAMCITY_VERSION]) {
		return ColorSupport.BASIC;
	}

	// Default to no color support if we can't determine
	return ColorSupport.NONE;
}

/**
 * Get the maximum number of colors based on color support level
 */
function getMaxColors(colorSupport: ColorSupport): number {
	switch (colorSupport) {
		case ColorSupport.NONE:
			return 0;
		case ColorSupport.BASIC:
			return 16;
		case ColorSupport.ANSI256:
			return 256;
		case ColorSupport.TRUECOLOR:
			return 16_777_216;
		default:
			return 0;
	}
}

/**
 * Detect if TrueColor (24-bit RGB) is supported
 */
function detectTrueColorSupport(colorSupport: ColorSupport): boolean {
	return colorSupport === ColorSupport.TRUECOLOR;
}

/**
 * Detect mouse support mode based on terminal capabilities
 */
function detectMouseSupport(): MouseMode {
	const { env } = process;
	const term = env[ENV_VARS.TERM]?.toLowerCase() ?? '';
	const termProgram = env[ENV_VARS.TERM_PROGRAM]?.toLowerCase() ?? '';

	// Modern terminals typically support SGR mode (1006)
	const modernTerminals = [
		'xterm',
		'screen',
		'tmux',
		'rxvt',
		'konsole',
		'gnome',
		'vte',
		'kitty',
		'alacritty',
		'wezterm',
		'iterm',
		'ghostty',
		'foot',
		'contour',
		'rio',
		'warp',
	];

	const modernPrograms = [
		'hyper',
		'iterm.app',
		'apple_terminal',
		'wezterm',
		'vscode',
		'code',
		'rio',
		'ghostty',
		'foot',
		'contour',
		'kitty',
		'alacritty',
		'warp',
	];

	// Check for modern terminal support
	if (modernTerminals.some(t => term.includes(t)) || modernPrograms.some(p => termProgram.includes(p))) {
		return MouseMode.SGR;
	}

	// Check for UTF-8 mode support
	if (term.includes('utf8') || term.includes('utf-8')) {
		return MouseMode.UTF8;
	}

	// Basic X10 support for older terminals
	if (term.includes('xterm') || term.includes('rxvt')) {
		return MouseMode.X10;
	}

	return MouseMode.NONE;
}

/**
 * Detect Unicode support based on locale and environment
 */
function detectUnicodeSupport(): boolean {
	const { env } = process;

	// Check locale environment variables
	const localeVars = [env[ENV_VARS.LC_ALL], env[ENV_VARS.LC_CTYPE], env[ENV_VARS.LANG]];

	for (const locale of localeVars) {
		if (locale) {
			const normalized = locale.toLowerCase();
			// Check for UTF-8 in locale
			if (normalized.includes('utf-8') || normalized.includes('utf8')) {
				return true;
			}
		}
	}

	// Check if we're on a modern terminal that likely supports Unicode
	const term = env[ENV_VARS.TERM]?.toLowerCase() ?? '';
	const termProgram = env[ENV_VARS.TERM_PROGRAM]?.toLowerCase() ?? '';

	const unicodeTerminals = [
		'xterm',
		'xterm-256color',
		'xterm-kitty',
		'screen',
		'tmux',
		'rxvt-unicode',
		'kitty',
		'alacritty',
		'wezterm',
		'iterm',
		'ghostty',
		'foot',
		'contour',
		'rio',
		'warp',
	];

	if (unicodeTerminals.some(t => term.includes(t))) {
		return true;
	}

	// Check for modern terminal programs
	const unicodePrograms = [
		'hyper',
		'iterm.app',
		'apple_terminal',
		'wezterm',
		'vscode',
		'code',
		'rio',
		'ghostty',
		'foot',
		'contour',
		'kitty',
		'alacritty',
		'warp',
	];

	if (unicodePrograms.some(p => termProgram.includes(p))) {
		return true;
	}

	// Default: assume Unicode is supported on modern systems
	return true;
}

/**
 * Detect hyperlink support (OSC 8)
 */
function detectHyperlinkSupport(): boolean {
	const { env } = process;
	const termProgram = env[ENV_VARS.TERM_PROGRAM]?.toLowerCase() ?? '';

	// Known terminals that support hyperlinks
	const hyperlinkTerminals = [
		'iterm',
		'iterm.app',
		'wezterm',
		'kitty',
		'gnome-terminal',
		'konsole',
		'vscode',
		'code',
		'hyper',
		'alacritty',
		'ghostty',
		'foot',
		'contour',
		'rio',
		'warp',
	];

	return hyperlinkTerminals.some(t => termProgram.includes(t));
}

/**
 * Detect bracketed paste support
 */
function detectBracketedPasteSupport(): boolean {
	const { env } = process;
	const term = env[ENV_VARS.TERM]?.toLowerCase() ?? '';

	// Most modern terminals support bracketed paste
	const supportedTerminals = [
		'xterm',
		'screen',
		'tmux',
		'rxvt',
		'konsole',
		'gnome',
		'vte',
		'kitty',
		'alacritty',
		'wezterm',
		'iterm',
		'ghostty',
		'foot',
		'contour',
		'rio',
		'warp',
	];

	return supportedTerminals.some(t => term.includes(t));
}

/**
 * Detect focus event support
 */
function detectFocusEventSupport(): boolean {
	const { env } = process;
	const term = env[ENV_VARS.TERM]?.toLowerCase() ?? '';
	const termProgram = env[ENV_VARS.TERM_PROGRAM]?.toLowerCase() ?? '';

	// Terminals that support focus events
	const supportedTerminals = [
		'xterm',
		'xterm-256color',
		'kitty',
		'wezterm',
		'iterm',
		'ghostty',
		'foot',
		'contour',
		'rio',
		'warp',
	];

	const supportedPrograms = [
		'iterm.app',
		'wezterm',
		'vscode',
		'code',
		'rio',
		'ghostty',
		'foot',
		'contour',
		'kitty',
		'warp',
	];

	return supportedTerminals.some(t => term.includes(t)) || supportedPrograms.some(p => termProgram.includes(p));
}

/**
 * Get terminal type from environment
 */
function getTerminalType(): string {
	return process.env[ENV_VARS.TERM] ?? 'unknown';
}

/**
 * Get terminal program name if available
 */
function getTerminalProgram(): string | undefined {
	return process.env[ENV_VARS.TERM_PROGRAM];
}

/**
 * Get terminal version if available
 */
function getTerminalVersion(): string | undefined {
	return process.env[ENV_VARS.TERM_PROGRAM_VERSION];
}

/**
 * Detect all terminal capabilities
 *
 * @returns {TerminalCapabilities} Object containing all detected terminal capabilities
 *
 * @example
 * ```typescript
 * const caps = detectCapabilities();
 * console.log(`Terminal: ${caps.termType}`);
 * console.log(`Color support: ${caps.colorSupport}`);
 * console.log(`Mouse mode: ${caps.mouseMode}`);
 * ```
 */
export function detectCapabilities(): TerminalCapabilities {
	const colorSupport = detectColorSupport();

	return {
		termType: getTerminalType(),
		colorSupport,
		maxColors: getMaxColors(colorSupport),
		mouseMode: detectMouseSupport(),
		unicodeSupported: detectUnicodeSupport(),
		hyperlinksSupported: detectHyperlinkSupport(),
		bracketedPasteSupported: detectBracketedPasteSupport(),
		focusEventsSupported: detectFocusEventSupport(),
		trueColorSupported: detectTrueColorSupport(colorSupport),
		termVersion: getTerminalVersion(),
		program: getTerminalProgram(),
	};
}

/**
 * Check if the current environment is a TTY
 *
 * @returns {boolean} True if stdin, stdout, and stderr are all TTYs
 */
export function isTTY(): boolean {
	return (
		process.stdin.isTTY === true &&
		process.stdout.isTTY === true &&
		process.stderr.isTTY === true
	);
}

/**
 * Check if running in a CI environment
 *
 * @returns {boolean} True if running in a CI environment
 */
export function isCI(): boolean {
	const ciEnvVars = [
		'CI',
		'TEAMCITY_VERSION',
		'TRAVIS',
		'CIRCLECI',
		'APPVEYOR',
		'GITLAB_CI',
		'GITHUB_ACTIONS',
		'BUILDKITE',
		'DRONE',
		'JENKINS_URL',
		'HUDSON_URL',
	];

	return ciEnvVars.some(varName => process.env[varName] !== undefined);
}

/**
 * Get a human-readable description of terminal capabilities
 *
 * @param {TerminalCapabilities} caps - The capabilities to describe
 * @returns {string} Human-readable description
 */
export function describeCapabilities(caps: TerminalCapabilities): string {
	const lines: string[] = [
		`Terminal Type: ${caps.termType}`,
		`Program: ${caps.program ?? 'N/A'}`,
		`Version: ${caps.termVersion ?? 'N/A'}`,
		`Color Support: ${ColorSupport[caps.colorSupport]} (${caps.maxColors} colors)`,
		`TrueColor: ${caps.trueColorSupported ? 'Yes' : 'No'}`,
		`Mouse Mode: ${MouseMode[caps.mouseMode]}`,
		`Unicode: ${caps.unicodeSupported ? 'Yes' : 'No'}`,
		`Hyperlinks: ${caps.hyperlinksSupported ? 'Yes' : 'No'}`,
		`Bracketed Paste: ${caps.bracketedPasteSupported ? 'Yes' : 'No'}`,
		`Focus Events: ${caps.focusEventsSupported ? 'Yes' : 'No'}`,
	];

	return lines.join('\n');
}
