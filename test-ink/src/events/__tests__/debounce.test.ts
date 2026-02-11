/**
 * Debouncer Tests
 */

import test from 'ava';
import { Debouncer } from '../debounce.js';

test('Debouncer can be instantiated', (t) => {
	const debouncer = new Debouncer();
	t.true(debouncer instanceof Debouncer);
});

test('Debouncer delays execution', async (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	const debounced = debouncer.debounce(
		() => { count++; },
		{ delay: 50, leading: false, trailing: true }
	);

	debounced({ type: 'test' } as any);
	t.is(count, 0); // Should not execute immediately

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 1); // Should execute after delay
});

test('Debouncer leading edge executes immediately', (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	const debounced = debouncer.debounce(
		() => { count++; },
		{ delay: 50, leading: true, trailing: false }
	);

	debounced({ type: 'test' } as any);
	t.is(count, 1); // Should execute immediately
});

test('Debouncer cancel prevents execution', async (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	const debounced = debouncer.debounce(
		() => { count++; },
		{ delay: 50, leading: false, trailing: true }
	);

	debounced({ type: 'test' } as any);
	debounced.cancel();

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 0);
});

test('Debouncer flush executes immediately', (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	const debounced = debouncer.debounce(
		() => { count++; },
		{ delay: 50, leading: false, trailing: true }
	);

	debounced({ type: 'test' } as any);
	t.is(count, 0);

	debounced.flush();
	t.is(count, 1);
});

test('Debouncer pending returns correct state', (t) => {
	const debouncer = new Debouncer();

	const debounced = debouncer.debounce(
		() => {},
		{ delay: 50, leading: false, trailing: true }
	);

	t.false(debounced.pending());
	debounced({ type: 'test' } as any);
	t.true(debounced.pending());
});

test('Debouncer create stores debouncer by key', (t) => {
	const debouncer = new Debouncer();

	const d1 = debouncer.create('test', () => {}, { delay: 50 });
	const d2 = debouncer.getOrCreate('test', () => {}, { delay: 50 });

	t.is(d1, d2);
});

test('Debouncer has checks for existence', (t) => {
	const debouncer = new Debouncer();

	t.false(debouncer.has('test'));
	debouncer.create('test', () => {}, { delay: 50 });
	t.true(debouncer.has('test'));
});

test('Debouncer remove deletes debouncer', (t) => {
	const debouncer = new Debouncer();

	debouncer.create('test', () => {}, { delay: 50 });
	t.true(debouncer.remove('test'));
	t.false(debouncer.has('test'));
	t.false(debouncer.remove('test'));
});

test('Debouncer cancelAll cancels all debouncers', async (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	debouncer.create('test1', () => { count++; }, { delay: 50 });
	debouncer.create('test2', () => { count++; }, { delay: 50 });

	debouncer.getOrCreate('test1', () => {}, { delay: 50 })({ type: 'test' } as any);
	debouncer.getOrCreate('test2', () => {}, { delay: 50 })({ type: 'test' } as any);

	debouncer.cancelAll();

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 0);
});

test('Debouncer keys returns all keys', (t) => {
	const debouncer = new Debouncer();

	debouncer.create('a', () => {}, { delay: 50 });
	debouncer.create('b', () => {}, { delay: 50 });

	const keys = debouncer.keys();
	t.true(keys.includes('a'));
	t.true(keys.includes('b'));
});

test('Debouncer debounceKeyboard creates keyboard debouncer', (t) => {
	const debouncer = new Debouncer();
	let count = 0;

	const debounced = debouncer.debounceKeyboard(() => { count++; }, 50);
	debounced({ type: 'test' } as any);

	t.false(debounced.pending()); // Leading is false by default
});

test('Debouncer debounceScroll creates scroll debouncer', (t) => {
	const debouncer = new Debouncer();

	const debounced = debouncer.debounceScroll(() => {}, 16);
	debounced({ type: 'test' } as any);

	t.true(debounced.pending()); // Leading is true
});

test('Debouncer generateKey creates unique keys', (t) => {
	const key1 = Debouncer.generateKey('prefix');
	const key2 = Debouncer.generateKey('prefix');

	t.not(key1, key2);
	t.true(key1.startsWith('prefix'));
});
