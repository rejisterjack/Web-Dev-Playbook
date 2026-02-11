/**
 * Unit tests for the AnimationFrameSystem module
 */

import test from 'ava';
import {
	AnimationFrameSystem,
	createAnimationFrameSystem,
	Easing,
	interpolate,
	interpolateColor,
} from '../animation.js';

test('AnimationFrameSystem creates with default options', t => {
	const animation = new AnimationFrameSystem();

	t.false(animation.getIsRunning());
	t.false(animation.getIsPaused());
	t.is(animation.getTargetFps(), 60);
});

test('AnimationFrameSystem creates with custom options', t => {
	const animation = new AnimationFrameSystem({
		targetFps: 30,
		autoStart: true,
	});

	t.is(animation.getTargetFps(), 30);
	t.true(animation.getIsRunning());
});

test('requestAnimationFrame returns unique IDs', t => {
	const animation = new AnimationFrameSystem();

	const id1 = animation.requestAnimationFrame(() => {});
	const id2 = animation.requestAnimationFrame(() => {});

	t.not(id1, id2);
	t.is(animation.getCallbackCount(), 2);
});

test('cancelAnimationFrame removes callback', t => {
	const animation = new AnimationFrameSystem();

	const id = animation.requestAnimationFrame(() => {});
	t.is(animation.getCallbackCount(), 1);

	animation.cancelAnimationFrame(id);
	t.is(animation.getCallbackCount(), 0);
});

test('start begins animation loop', t => {
	const animation = new AnimationFrameSystem();

	animation.start();

	t.true(animation.getIsRunning());
	t.false(animation.getIsPaused());

	animation.stop();
});

test('stop ends animation loop', t => {
	const animation = new AnimationFrameSystem();

	animation.start();
	animation.stop();

	t.false(animation.getIsRunning());
	t.false(animation.getIsPaused());
});

test('pause pauses animation', t => {
	const animation = new AnimationFrameSystem();

	animation.start();
	animation.pause();

	t.true(animation.getIsRunning());
	t.true(animation.getIsPaused());

	animation.stop();
});

test('resume continues animation', t => {
	const animation = new AnimationFrameSystem();

	animation.start();
	animation.pause();
	animation.resume();

	t.true(animation.getIsRunning());
	t.false(animation.getIsPaused());

	animation.stop();
});

test('setTargetFps updates target', t => {
	const animation = new AnimationFrameSystem();

	animation.setTargetFps(30);
	t.is(animation.getTargetFps(), 30);

	animation.setTargetFps(144);
	t.is(animation.getTargetFps(), 144);

	animation.setTargetFps(0);
	t.is(animation.getTargetFps(), 1);

	animation.setTargetFps(200);
	t.is(animation.getTargetFps(), 144);
});

test('getStats returns statistics', t => {
	const animation = new AnimationFrameSystem();

	const stats = animation.getStats();

	t.is(stats.totalFrames, 0);
	t.is(stats.framesSkipped, 0);
	t.is(stats.averageFps, 0);
	t.is(stats.currentFps, 0);
	t.is(stats.minFps, 0);
	t.is(stats.maxFps, 0);
	t.is(stats.averageDeltaTime, 0);
	t.is(stats.totalTime, 0);
});

test('setVisible controls visibility', t => {
	const animation = new AnimationFrameSystem({pauseWhenHidden: true});

	animation.start();
	t.true(animation.getIsVisible());

	animation.setVisible(false);
	t.false(animation.getIsVisible());

	animation.stop();
});

test('resetStats clears statistics', t => {
	const animation = new AnimationFrameSystem();

	animation.start();
	animation.stop();

	animation.resetStats();
	const stats = animation.getStats();

	t.is(stats.totalFrames, 0);
});

test('clearCallbacks removes all callbacks', t => {
	const animation = new AnimationFrameSystem();

	animation.requestAnimationFrame(() => {});
	animation.requestAnimationFrame(() => {});
	t.is(animation.getCallbackCount(), 2);

	animation.clearCallbacks();
	t.is(animation.getCallbackCount(), 0);
});

test('destroy cleans up resources', t => {
	const animation = new AnimationFrameSystem();

	animation.requestAnimationFrame(() => {});
	animation.start();
	animation.destroy();

	t.false(animation.getIsRunning());
	t.is(animation.getCallbackCount(), 0);
});

test('createAnimationFrameSystem factory creates instance', t => {
	const animation = createAnimationFrameSystem({targetFps: 30});

	t.is(animation.getTargetFps(), 30);
});

// Easing function tests
test('Easing.linear returns input', t => {
	t.is(Easing.linear(0), 0);
	t.is(Easing.linear(0.5), 0.5);
	t.is(Easing.linear(1), 1);
});

test('Easing.easeInQuad', t => {
	t.is(Easing.easeInQuad(0), 0);
	t.is(Easing.easeInQuad(0.5), 0.25);
	t.is(Easing.easeInQuad(1), 1);
});

test('Easing.easeOutQuad', t => {
	t.is(Easing.easeOutQuad(0), 0);
	t.is(Easing.easeOutQuad(1), 1);
});

test('Easing.easeInOutQuad', t => {
	t.is(Easing.easeInOutQuad(0), 0);
	t.is(Easing.easeInOutQuad(0.5), 0.5);
	t.is(Easing.easeInOutQuad(1), 1);
});

test('Easing.easeInCubic', t => {
	t.is(Easing.easeInCubic(0), 0);
	t.is(Easing.easeInCubic(0.5), 0.125);
	t.is(Easing.easeInCubic(1), 1);
});

test('Easing.easeOutCubic', t => {
	t.is(Easing.easeOutCubic(0), 0);
	t.is(Easing.easeOutCubic(1), 1);
});

test('Easing.easeInOutCubic', t => {
	t.is(Easing.easeInOutCubic(0), 0);
	t.is(Easing.easeInOutCubic(0.5), 0.5);
	t.is(Easing.easeInOutCubic(1), 1);
});

test('Easing.easeOutElastic returns 0 at start and 1 at end', t => {
	t.true(Math.abs(Easing.easeOutElastic(0)) < 0.001);
	t.true(Math.abs(Easing.easeOutElastic(1) - 1) < 0.001);
});

test('Easing.easeOutBounce returns 0 at start and 1 at end', t => {
	t.is(Easing.easeOutBounce(0), 0);
	t.is(Easing.easeOutBounce(1), 1);
});

// Interpolation tests
test('interpolate with linear easing', t => {
	t.is(interpolate(0, 100, 0), 0);
	t.is(interpolate(0, 100, 0.5), 50);
	t.is(interpolate(0, 100, 1), 100);
});

test('interpolate clamps progress', t => {
	t.is(interpolate(0, 100, -0.5), 0);
	t.is(interpolate(0, 100, 1.5), 100);
});

test('interpolate with custom easing', t => {
	const result = interpolate(0, 100, 0.5, Easing.easeInQuad);
	t.is(result, 25);
});

test('interpolateColor interpolates RGB values', t => {
	const result = interpolateColor([255, 0, 0], [0, 255, 0], 0.5);

	t.deepEqual(result, [128, 128, 0]);
});

test('interpolateColor clamps progress', t => {
	const result1 = interpolateColor([255, 0, 0], [0, 255, 0], -0.5);
	t.deepEqual(result1, [255, 0, 0]);

	const result2 = interpolateColor([255, 0, 0], [0, 255, 0], 1.5);
	t.deepEqual(result2, [0, 255, 0]);
});
