/**
 * Throttler Tests
 */

import test from 'ava';
import { Throttler } from '../throttle.js';

test('Throttler can be instantiated', (t) => {
	const throttler = new Throttler();
	t.true(throttler instanceof Throttler);
});

test('Throttler limits execution rate', async (t) => {
	const throttler = new Throttler();
	let count = 0;

	const throttled = throttler.throttle(
		() => { count++; },
		{ interval: 100, leading: true, trailing: false }
	);

	throttled({ type: 'test' } as any);
	throttled({ type: 'test' } as any);
	throttled({ type: 'test' } as any);

	t.is(count, 1); // Only first should execute immediately

	await new Promise(resolve => setTimeout(resolve, 110));
	t.is(count, 1); // No trailing execution
});

test('Throttler leading edge executes immediately', (t) => {
	const throttler = new Throttler();
	let count = 0;

	const throttled = throttler.throttle(
		() => { count++; },
		{ interval: 100, leading: true, trailing: false }
	);

	throttled({ type: 'test' } as any);
	t.is(count, 1);
});

test('Throttler trailing edge executes after interval', async (t) => {
	const throttler = new Throttler();
	let count = 0;

	const throttled = throttler.throttle(
		() => { count++; },
		{ interval: 50, leading: false, trailing: true }
	);

	throttled({ type: 'test' } as any);
	t.is(count, 0);

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 1);
});

test('Throttler cancel prevents execution', async (t) => {
	const throttler = new Throttler();
	let count = 0;

	const throttled = throttler.throttle(
		() => { count++; },
		{ interval: 50, leading: false, trailing: true }
	);

	throttled({ type: 'test' } as any);
	throttled.cancel();

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 0);
});

test('Throttler flush executes immediately', (t) => {
	const throttler = new Throttler();
	let count = 0;

	const throttled = throttler.throttle(
		() => { count++; },
		{ interval: 100, leading: false, trailing: true }
	);

	throttled({ type: 'test' } as any);
	t.is(count, 0);

	throttled.flush();
	t.is(count, 1);
});

test('Throttler pending returns correct state', (t) => {
	const throttler = new Throttler();

	const throttled = throttler.throttle(
		() => {},
		{ interval: 100, leading: false, trailing: true }
	);

	t.false(throttled.pending());
	throttled({ type: 'test' } as any);
	t.true(throttled.pending());
});

test('Throttler create stores throttler by key', (t) => {
	const throttler = new Throttler();

	const t1 = throttler.create('test', () => {}, { interval: 100 });
	const t2 = throttler.getOrCreate('test', () => {}, { interval: 100 });

	t.is(t1, t2);
});

test('Throttler has checks for existence', (t) => {
	const throttler = new Throttler();

	t.false(throttler.has('test'));
	throttler.create('test', () => {}, { interval: 100 });
	t.true(throttler.has('test'));
});

test('Throttler remove deletes throttler', (t) => {
	const throttler = new Throttler();

	throttler.create('test', () => {}, { interval: 100 });
	t.true(throttler.remove('test'));
	t.false(throttler.has('test'));
	t.false(throttler.remove('test'));
});

test('Throttler cancelAll cancels all throttlers', async (t) => {
	const throttler = new Throttler();
	let count = 0;

	throttler.create('test1', () => { count++; }, { interval: 50, leading: false, trailing: true });
	throttler.create('test2', () => { count++; }, { interval: 50, leading: false, trailing: true });

	throttler.getOrCreate('test1', () => {}, { interval: 50 })({ type: 'test' } as any);
	throttler.getOrCreate('test2', () => {}, { interval: 50 })({ type: 'test' } as any);

	throttler.cancelAll();

	await new Promise(resolve => setTimeout(resolve, 60));
	t.is(count, 0);
});

test('Throttler keys returns all keys', (t) => {
	const throttler = new Throttler();

	throttler.create('a', () => {}, { interval: 100 });
	throttler.create('b', () => {}, { interval: 100 });

	const keys = throttler.keys();
	t.true(keys.includes('a'));
	t.true(keys.includes('b'));
});

test('Throttler throttleResize creates resize throttler', (t) => {
	const throttler = new Throttler();

	const throttled = throttler.throttleResize(() => {}, 100);
	throttled({ type: 'test' } as any);

	t.false(throttled.pending()); // Leading is false
});

test('Throttler throttleMouseMove creates mouse throttler', (t) => {
	const throttler = new Throttler();

	const throttled = throttler.throttleMouseMove(() => {}, 16);
	throttled({ type: 'test' } as any);

	t.true(throttled.pending()); // Leading is true
});

test('Throttler generateKey creates unique keys', (t) => {
	const key1 = Throttler.generateKey('prefix');
	const key2 = Throttler.generateKey('prefix');

	t.not(key1, key2);
	t.true(key1.startsWith('prefix'));
});
