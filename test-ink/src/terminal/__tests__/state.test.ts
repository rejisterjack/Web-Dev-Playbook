/**
 * Terminal State Manager Module Tests
 */

import test from 'ava';
import { TerminalStateManager } from '../state.js';

test('TerminalStateManager can be instantiated', (t) => {
	const state = new TerminalStateManager();
	t.true(state instanceof TerminalStateManager);
});

// Cursor position tests
test('TerminalStateManager getCursorPosition returns default position', (t) => {
	const state = new TerminalStateManager();
	const pos = state.getCursorPosition();

	t.is(pos.x, 1);
	t.is(pos.y, 1);
});

test('TerminalStateManager setCursorPosition updates position', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);

	const pos = state.getCursorPosition();
	t.is(pos.x, 10);
	t.is(pos.y, 5);
});

test('TerminalStateManager setCursorPosition enforces minimum of 1', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(0, 0);

	const pos = state.getCursorPosition();
	t.is(pos.x, 1);
	t.is(pos.y, 1);
});

test('TerminalStateManager moveCursor updates position relatively', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(5, 5);
	state.moveCursor(3, 2);

	const pos = state.getCursorPosition();
	t.is(pos.x, 8);
	t.is(pos.y, 7);
});

test('TerminalStateManager cursorUp moves cursor up', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(5, 10);
	state.cursorUp(3);

	const pos = state.getCursorPosition();
	t.is(pos.x, 5);
	t.is(pos.y, 7);
});

test('TerminalStateManager cursorDown moves cursor down', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(5, 5);
	state.cursorDown(3);

	const pos = state.getCursorPosition();
	t.is(pos.x, 5);
	t.is(pos.y, 8);
});

test('TerminalStateManager cursorForward moves cursor right', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(5, 5);
	state.cursorForward(3);

	const pos = state.getCursorPosition();
	t.is(pos.x, 8);
	t.is(pos.y, 5);
});

test('TerminalStateManager cursorBackward moves cursor left', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);
	state.cursorBackward(3);

	const pos = state.getCursorPosition();
	t.is(pos.x, 7);
	t.is(pos.y, 5);
});

test('TerminalStateManager cursorHome moves to origin', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 10);
	state.cursorHome();

	const pos = state.getCursorPosition();
	t.is(pos.x, 1);
	t.is(pos.y, 1);
});

// Text attributes tests
test('TerminalStateManager getAttributes returns default attributes', (t) => {
	const state = new TerminalStateManager();
	const attrs = state.getAttributes();

	t.is(attrs.foreground, null);
	t.is(attrs.background, null);
	t.is(attrs.bold, false);
	t.is(attrs.italic, false);
	t.is(attrs.underline, false);
});

test('TerminalStateManager setForeground updates foreground color', (t) => {
	const state = new TerminalStateManager();
	state.setForeground(31);

	const attrs = state.getAttributes();
	t.is(attrs.foreground, 31);
});

test('TerminalStateManager setBackground updates background color', (t) => {
	const state = new TerminalStateManager();
	state.setBackground(44);

	const attrs = state.getAttributes();
	t.is(attrs.background, 44);
});

test('TerminalStateManager setBold updates bold attribute', (t) => {
	const state = new TerminalStateManager();
	state.setBold(true);

	const attrs = state.getAttributes();
	t.is(attrs.bold, true);
});

test('TerminalStateManager setItalic updates italic attribute', (t) => {
	const state = new TerminalStateManager();
	state.setItalic(true);

	const attrs = state.getAttributes();
	t.is(attrs.italic, true);
});

test('TerminalStateManager setUnderline updates underline attribute', (t) => {
	const state = new TerminalStateManager();
	state.setUnderline(true);

	const attrs = state.getAttributes();
	t.is(attrs.underline, true);
});

test('TerminalStateManager resetAttributes resets all attributes', (t) => {
	const state = new TerminalStateManager();
	state.setForeground(31);
	state.setBold(true);
	state.setItalic(true);
	state.resetAttributes();

	const attrs = state.getAttributes();
	t.is(attrs.foreground, null);
	t.is(attrs.bold, false);
	t.is(attrs.italic, false);
});

test('TerminalStateManager hasActiveStyles returns true when styles are set', (t) => {
	const state = new TerminalStateManager();
	t.is(state.hasActiveStyles(), false);

	state.setBold(true);
	t.is(state.hasActiveStyles(), true);
});

test('TerminalStateManager hasActiveColors returns true when colors are set', (t) => {
	const state = new TerminalStateManager();
	t.is(state.hasActiveColors(), false);

	state.setForeground(31);
	t.is(state.hasActiveColors(), true);
});

// Terminal modes tests
test('TerminalStateManager getModes returns default modes', (t) => {
	const state = new TerminalStateManager();
	const modes = state.getModes();

	t.is(modes.alternateScreen, false);
	t.is(modes.mouseTracking, false);
	t.is(modes.bracketedPaste, false);
	t.is(modes.lineWrap, true);
});

test('TerminalStateManager setAlternateScreen updates mode', (t) => {
	const state = new TerminalStateManager();
	state.setAlternateScreen(true);

	const modes = state.getModes();
	t.is(modes.alternateScreen, true);
});

test('TerminalStateManager setMouseTracking updates mode', (t) => {
	const state = new TerminalStateManager();
	state.setMouseTracking(true);

	const modes = state.getModes();
	t.is(modes.mouseTracking, true);
});

test('TerminalStateManager setBracketedPaste updates mode', (t) => {
	const state = new TerminalStateManager();
	state.setBracketedPaste(true);

	const modes = state.getModes();
	t.is(modes.bracketedPaste, true);
});

// State stack tests
test('TerminalStateManager pushState saves current state', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);
	state.setForeground(31);
	state.pushState();

	t.is(state.getStateStackDepth(), 1);
});

test('TerminalStateManager popState restores saved state', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);
	state.setForeground(31);
	state.pushState();

	state.setCursorPosition(20, 10);
	state.setForeground(32);

	const restored = state.popState();
	t.is(restored, true);

	const pos = state.getCursorPosition();
	t.is(pos.x, 10);
	t.is(pos.y, 5);

	const attrs = state.getAttributes();
	t.is(attrs.foreground, 31);
});

test('TerminalStateManager popState returns false when stack is empty', (t) => {
	const state = new TerminalStateManager();
	const restored = state.popState();
	t.is(restored, false);
});

test('TerminalStateManager clearStateStack removes all saved states', (t) => {
	const state = new TerminalStateManager();
	state.pushState();
	state.pushState();
	t.is(state.getStateStackDepth(), 2);

	state.clearStateStack();
	t.is(state.getStateStackDepth(), 0);
});

// Reset and snapshot tests
test('TerminalStateManager reset resets all state', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);
	state.setForeground(31);
	state.setAlternateScreen(true);
	state.pushState();

	state.reset();

	const pos = state.getCursorPosition();
	t.is(pos.x, 1);
	t.is(pos.y, 1);

	const attrs = state.getAttributes();
	t.is(attrs.foreground, null);

	const modes = state.getModes();
	t.is(modes.alternateScreen, false);

	t.is(state.getStateStackDepth(), 0);
});

test('TerminalStateManager getSnapshot returns complete state', (t) => {
	const state = new TerminalStateManager();
	state.setCursorPosition(10, 5);
	state.setForeground(31);
	state.pushState();

	const snapshot = state.getSnapshot();

	t.is(snapshot.cursor.x, 10);
	t.is(snapshot.cursor.y, 5);
	t.is(snapshot.attributes.foreground, 31);
	t.is(snapshot.stateStackDepth, 1);
});

// Event emission tests
test('TerminalStateManager emits cursorMove event', (t) => {
	const state = new TerminalStateManager();
	let eventEmitted = false;

	state.on('cursorMove', (newPos, oldPos) => {
		eventEmitted = true;
		t.is(newPos.x, 10);
		t.is(oldPos.x, 1);
	});

	state.setCursorPosition(10, 5);
	t.is(eventEmitted, true);
});

test('TerminalStateManager emits attributesReset event', (t) => {
	const state = new TerminalStateManager();
	let eventEmitted = false;

	state.on('attributesReset', () => {
		eventEmitted = true;
	});

	state.resetAttributes();
	t.is(eventEmitted, true);
});

test('TerminalStateManager emits reset event', (t) => {
	const state = new TerminalStateManager();
	let eventEmitted = false;

	state.on('reset', () => {
		eventEmitted = true;
	});

	state.reset();
	t.is(eventEmitted, true);
});

test('TerminalStateManager destroy cleans up', (t) => {
	const state = new TerminalStateManager();

	// Should not throw
	state.destroy();
	t.pass();
});
