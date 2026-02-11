/**
 * Terminal Control Layer
 *
 * This module provides the foundational terminal control layer for the TUI framework.
 * It includes modules for terminal detection, ANSI escape codes, raw mode management,
 * terminal size queries, state tracking, and input/output streams.
 *
 * @module terminal
 *
 * @example
 * ```typescript
 * import {
 *   detectCapabilities,
 *   ANSI,
 *   RawModeManager,
 *   TerminalSizeManager,
 *   TerminalStateManager,
 *   TerminalOutput,
 *   TerminalInput,
 * } from './terminal';
 *
 * // Detect terminal capabilities
 * const caps = detectCapabilities();
 * console.log(`Terminal: ${caps.termType}, Colors: ${caps.colorSupport}`);
 *
 * // Use ANSI escape codes
 * console.log(ANSI.clearScreen());
 * console.log(ANSI.moveCursor(1, 1));
 *
 * // Manage raw mode
 * const rawMode = new RawModeManager();
 * await rawMode.enter();
 *
 * // Handle terminal size
 * const sizeManager = new TerminalSizeManager();
 * sizeManager.on('resize', (size) => {
 *   console.log(`Resized: ${size.columns}x${size.rows}`);
 * });
 *
 * // Track terminal state
 * const state = new TerminalStateManager();
 * state.setCursorPosition(10, 5);
 *
 * // Write to terminal with buffering
 * const output = new TerminalOutput();
 * output.write(ANSI.setTrueColor(255, 0, 0));
 * output.write('Red text');
 * await output.flush();
 *
 * // Read input with escape sequence parsing
 * const input = new TerminalInput();
 * input.on('key', (key) => console.log('Key:', key.name));
 * input.on('mouse', (mouse) => console.log('Mouse:', mouse.type, mouse.x, mouse.y));
 * input.start();
 * ```
 */

// Terminal Detection
export {
	detectCapabilities,
	isTTY,
	isCI,
	describeCapabilities,
	ColorSupport,
	MouseMode,
	type TerminalCapabilities,
} from './detection.js';

// ANSI Escape Codes
export {
	ESC,
	OSC,
	BEL,
	ST,
	Cursor,
	Screen,
	Style,
	Color,
	Text,
	Colors16,
	Colors256,
	TrueColor,
	Modes,
	Queries,
	Hyperlink,
	Window,
	Notification,
	ANSI,
} from './ansi.js';

// Raw Mode Manager
export {
	RawModeManager,
	createRawModeManager,
	supportsRawMode,
	type RawModeOptions,
} from './raw-mode.js';

// Terminal Size
export {
	TerminalSizeManager,
	getGlobalSizeManager,
	getTerminalSize,
	watchTerminalSize,
	isTerminalSizeAvailable,
	type TerminalSize,
	type TerminalSizeOptions,
} from './size.js';

// Terminal State
export {
	TerminalStateManager,
	type TextAttributes,
	type CursorPosition,
	type TerminalModes,
} from './state.js';

// Terminal Output
export {
	TerminalOutput,
	createTerminalOutput,
	getGlobalOutput,
	terminalWrite,
	terminalFlush,
	type TerminalOutputOptions,
	type WriteResult,
} from './output.js';

// Terminal Input
export {
	TerminalInput,
	createTerminalInput,
	getGlobalInput,
	isStdinTTY,
	type TerminalInputOptions,
	type KeyEvent,
	type MouseEvent,
	type FocusEvent,
} from './input.js';
