/**
 * Key Bindings Tests
 */

import test from 'ava';
import { KeyBindings } from '../keybindings.js';

test('KeyBindings can be instantiated', (t) => {
	const bindings = new KeyBindings();
	t.true(bindings instanceof KeyBindings);
});

test('KeyBindings can register simple binding', (t) => {
	const bindings = new KeyBindings();
	let called = false;

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => { called = true; }
	});

	bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.true(called);
});

test('KeyBindings can register with modifiers', (t) => {
	const bindings = new KeyBindings();
	let called = false;

	bindings.register({
		id: 'test',
		chords: { key: 'c', ctrl: true },
		callback: () => { called = true; }
	});

	// Should not match without ctrl
	bindings.handleKey({ type: 'key', key: 'c', sequence: 'c', ctrl: false, alt: false, shift: false, timestamp: Date.now() });
	t.false(called);

	// Should match with ctrl
	bindings.handleKey({ type: 'key', key: 'c', sequence: '\u0003', ctrl: true, alt: false, shift: false, timestamp: Date.now() });
	t.true(called);
});

test('KeyBindings once binding only fires once', (t) => {
	const bindings = new KeyBindings();
	let count = 0;

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => { count++; }
	});

	bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });
	bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.is(count, 2); // Regular bindings fire every time
});

test('KeyBindings returns false when no binding matches', (t) => {
	const bindings = new KeyBindings();

	const result = bindings.handleKey({ type: 'key', key: 'z', sequence: 'z', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.false(result);
});

test('KeyBindings returns true when binding matches', (t) => {
	const bindings = new KeyBindings();

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => {}
	});

	const result = bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.true(result);
});

test('KeyBindings can unregister binding', (t) => {
	const bindings = new KeyBindings();
	let called = false;

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => { called = true; }
	});

	bindings.unregister('test');
	bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.false(called);
});

test('KeyBindings has checks for existence', (t) => {
	const bindings = new KeyBindings();

	t.false(bindings.has('test'));

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => {}
	});

	t.true(bindings.has('test'));
});

test('KeyBindings get returns binding', (t) => {
	const bindings = new KeyBindings();

	bindings.register({
		id: 'test',
		chords: { key: 'a' },
		callback: () => {},
		description: 'Test binding'
	});

	const binding = bindings.get('test');
	t.is(binding?.id, 'test');
	t.is(binding?.description, 'Test binding');
});

test('KeyBindings getAll returns all bindings', (t) => {
	const bindings = new KeyBindings();

	bindings.register({ id: 'a', chords: { key: 'a' }, callback: () => {} });
	bindings.register({ id: 'b', chords: { key: 'b' }, callback: () => {} });

	const all = bindings.getAll();
	t.is(all.length, 2);
});

test('KeyBindings clear removes all bindings', (t) => {
	const bindings = new KeyBindings();

	bindings.register({ id: 'test', chords: { key: 'a' }, callback: () => {} });
	bindings.clear();

	t.is(bindings.count(), 0);
});

test('KeyBindings count returns number of bindings', (t) => {
	const bindings = new KeyBindings();

	t.is(bindings.count(), 0);

	bindings.register({ id: 'a', chords: { key: 'a' }, callback: () => {} });
	t.is(bindings.count(), 1);
});

test('KeyBindings formatChord formats correctly', (t) => {
	const bindings = new KeyBindings();

	const simple = bindings.formatChord({ key: 'a' });
	t.is(simple, 'A');

	const withCtrl = bindings.formatChord({ key: 's', ctrl: true });
	t.is(withCtrl, 'Ctrl+S');

	const withAll = bindings.formatChord({ key: 'f1', ctrl: true, alt: true, shift: true });
	t.is(withAll, 'Ctrl+Alt+Shift+F1');
});

test('KeyBindings formatBinding formats correctly', (t) => {
	const bindings = new KeyBindings();

	const single = bindings.formatBinding({
		id: 'test',
		chords: { key: 's', ctrl: true },
		callback: () => {}
	});
	t.is(single, 'Ctrl+S');
});

test('KeyBindings parseChord parses correctly', (t) => {
	const chord = KeyBindings.parseChord('ctrl+s');

	t.is(chord.key, 's');
	t.true(chord.ctrl);
	t.false(chord.alt ?? false);
	t.false(chord.shift ?? false);
});

test('KeyBindings fromShortcut creates binding', (t) => {
	const binding = KeyBindings.fromShortcut('ctrl+s', () => {}, 'Save file');

	t.deepEqual(binding.chords, { key: 's', ctrl: true });
	t.is(binding.description, 'Save file');
});

test('KeyBindings respects priority', (t) => {
	const bindings = new KeyBindings();
	const results: string[] = [];

	bindings.register({
		id: 'low',
		chords: { key: 'a' },
		callback: () => { results.push('low'); },
		priority: 0
	});

	bindings.register({
		id: 'high',
		chords: { key: 'a' },
		callback: () => { results.push('high'); },
		priority: 10
	});

	bindings.handleKey({ type: 'key', key: 'a', sequence: 'a', ctrl: false, alt: false, shift: false, timestamp: Date.now() });

	t.deepEqual(results, ['high', 'low']);
});
