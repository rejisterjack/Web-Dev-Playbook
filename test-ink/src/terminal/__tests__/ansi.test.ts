/**
 * ANSI Escape Codes Module Tests
 */

import test from 'ava';
import {
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
} from '../ansi.js';

// Constants
test('ESC constant is correct', (t) => {
	t.is(ESC, '\u001B[');
});

test('OSC constant is correct', (t) => {
	t.is(OSC, '\u001B]');
});

test('BEL constant is correct', (t) => {
	t.is(BEL, '\u0007');
});

test('ST constant is correct', (t) => {
	t.is(ST, '\u001B\\');
});

// Cursor movement
test('Cursor.up generates correct sequence', (t) => {
	t.is(Cursor.up(), '\u001B[1A');
	t.is(Cursor.up(5), '\u001B[5A');
});

test('Cursor.down generates correct sequence', (t) => {
	t.is(Cursor.down(), '\u001B[1B');
	t.is(Cursor.down(3), '\u001B[3B');
});

test('Cursor.forward generates correct sequence', (t) => {
	t.is(Cursor.forward(), '\u001B[1C');
	t.is(Cursor.forward(10), '\u001B[10C');
});

test('Cursor.backward generates correct sequence', (t) => {
	t.is(Cursor.backward(), '\u001B[1D');
	t.is(Cursor.backward(5), '\u001B[5D');
});

test('Cursor.to generates correct sequence', (t) => {
	t.is(Cursor.to(1, 1), '\u001B[1;1H');
	t.is(Cursor.to(10, 5), '\u001B[5;10H');
});

test('Cursor.hide generates correct sequence', (t) => {
	t.is(Cursor.hide(), '\u001B[?25l');
});

test('Cursor.show generates correct sequence', (t) => {
	t.is(Cursor.show(), '\u001B[?25h');
});

// Screen clearing
test('Screen.clear generates correct sequence', (t) => {
	t.is(Screen.clear(), '\u001B[2J');
});

test('Screen.clearLine generates correct sequence', (t) => {
	t.is(Screen.clearLine(), '\u001B[2K');
});

test('Screen.clearLineDown generates correct sequence', (t) => {
	t.is(Screen.clearLineDown(), '\u001B[0K');
});

// Text styling
test('Text.reset generates correct sequence', (t) => {
	t.is(Text.reset(), '\u001B[0m');
});

test('Text.bold generates correct sequence', (t) => {
	t.is(Text.bold(), '\u001B[1m');
	t.is(Text.bold('test'), '\u001B[1mtest\u001B[22m');
});

test('Text.underline generates correct sequence', (t) => {
	t.is(Text.underline(), '\u001B[4m');
	t.is(Text.underline('test'), '\u001B[4mtest\u001B[24m');
});

test('Text.style applies multiple styles', (t) => {
	t.is(Text.style(1, 31), '\u001B[1;31m');
});

// Colors 16
test('Colors16.foreground generates correct sequence', (t) => {
	t.is(Colors16.foreground(0), '\u001B[30m'); // Black
	t.is(Colors16.foreground(7), '\u001B[37m'); // White
	t.is(Colors16.foreground(8), '\u001B[90m'); // Bright Black
	t.is(Colors16.foreground(15), '\u001B[97m'); // Bright White
});

test('Colors16.background generates correct sequence', (t) => {
	t.is(Colors16.background(0), '\u001B[40m'); // Black
	t.is(Colors16.background(7), '\u001B[47m'); // White
});

// Colors 256
test('Colors256.foreground generates correct sequence', (t) => {
	t.is(Colors256.foreground(0), '\u001B[38;5;0m');
	t.is(Colors256.foreground(255), '\u001B[38;5;255m');
});

test('Colors256.background generates correct sequence', (t) => {
	t.is(Colors256.background(0), '\u001B[48;5;0m');
	t.is(Colors256.background(255), '\u001B[48;5;255m');
});

// TrueColor
test('TrueColor.foreground generates correct sequence', (t) => {
	t.is(TrueColor.foreground(255, 0, 0), '\u001B[38;2;255;0;0m');
	t.is(TrueColor.foreground(0, 255, 0), '\u001B[38;2;0;255;0m');
	t.is(TrueColor.foreground(0, 0, 255), '\u001B[38;2;0;0;255m');
});

test('TrueColor.background generates correct sequence', (t) => {
	t.is(TrueColor.background(255, 0, 0), '\u001B[48;2;255;0;0m');
});

test('TrueColor.foregroundHex converts hex to RGB', (t) => {
	t.is(TrueColor.foregroundHex('#FF0000'), '\u001B[38;2;255;0;0m');
	t.is(TrueColor.foregroundHex('00FF00'), '\u001B[38;2;0;255;0m');
	t.is(TrueColor.foregroundHex('#ABC'), '\u001B[38;2;170;187;204m');
});

// Modes
test('Modes.enableAlternateScreen generates correct sequence', (t) => {
	t.is(Modes.enableAlternateScreen(), '\u001B[?1049h');
});

test('Modes.disableAlternateScreen generates correct sequence', (t) => {
	t.is(Modes.disableAlternateScreen(), '\u001B[?1049l');
});

test('Modes.enableBracketedPaste generates correct sequence', (t) => {
	t.is(Modes.enableBracketedPaste(), '\u001B[?2004h');
});

test('Modes.disableBracketedPaste generates correct sequence', (t) => {
	t.is(Modes.disableBracketedPaste(), '\u001B[?2004l');
});

test('Modes.enableMouseSGR generates correct sequence', (t) => {
	t.is(Modes.enableMouseSGR(), '\u001B[?1006h');
});

test('Modes.disableMouseSGR generates correct sequence', (t) => {
	t.is(Modes.disableMouseSGR(), '\u001B[?1006l');
});

// Queries
test('Queries.cursorPosition generates correct sequence', (t) => {
	t.is(Queries.cursorPosition(), '\u001B[6n');
});

test('Queries.terminalSize generates correct sequence', (t) => {
	t.is(Queries.terminalSize(), '\u001B[18t');
});

// Hyperlink
test('Hyperlink.create generates correct sequence', (t) => {
	const link = Hyperlink.create('https://example.com', 'Click here');
	t.true(link.includes('https://example.com'));
	t.true(link.includes('Click here'));
	t.true(link.startsWith(OSC + '8;'));
});

// Window
test('Window.setTitle generates correct sequence', (t) => {
	t.is(Window.setTitle('My Title'), '\u001B]2;My Title\u0007');
});

// Notification
test('Notification.bell generates correct sequence', (t) => {
	t.is(Notification.bell(), '\u0007');
});

// ANSI class static methods
test('ANSI.moveCursor generates correct sequence', (t) => {
	t.is(ANSI.moveCursor(5, 10), '\u001B[10;5H');
});

test('ANSI.clearScreen generates correct sequence', (t) => {
	t.is(ANSI.clearScreen(), '\u001B[2J');
});

test('ANSI.hideCursor generates correct sequence', (t) => {
	t.is(ANSI.hideCursor(), '\u001B[?25l');
});

test('ANSI.showCursor generates correct sequence', (t) => {
	t.is(ANSI.showCursor(), '\u001B[?25h');
});

test('ANSI.setTrueColor generates correct sequence', (t) => {
	t.is(ANSI.setTrueColor(255, 128, 0), '\u001B[38;2;255;128;0m');
});

test('ANSI.reset generates correct sequence', (t) => {
	t.is(ANSI.reset(), '\u001B[0m');
});

test('ANSI.enableAlternateScreen generates correct sequence', (t) => {
	t.is(ANSI.enableAlternateScreen(), '\u001B[?1049h');
});

test('ANSI.disableAlternateScreen generates correct sequence', (t) => {
	t.is(ANSI.disableAlternateScreen(), '\u001B[?1049l');
});

test('ANSI.setTitle generates correct sequence', (t) => {
	t.is(ANSI.setTitle('Test'), '\u001B]2;Test\u0007');
});

// Style and Color constants
test('Style constants are correct', (t) => {
	t.is(Style.reset, 0);
	t.is(Style.bold, 1);
	t.is(Style.dim, 2);
	t.is(Style.italic, 3);
	t.is(Style.underline, 4);
	t.is(Style.blink, 5);
	t.is(Style.reverse, 7);
	t.is(Style.hidden, 8);
	t.is(Style.strikethrough, 9);
});

test('Color constants are correct', (t) => {
	t.is(Color.black, 30);
	t.is(Color.red, 31);
	t.is(Color.green, 32);
	t.is(Color.yellow, 33);
	t.is(Color.blue, 34);
	t.is(Color.magenta, 35);
	t.is(Color.cyan, 36);
	t.is(Color.white, 37);
	t.is(Color.default, 39);
});
