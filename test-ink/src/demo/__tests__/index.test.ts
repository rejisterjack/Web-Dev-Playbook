/**
 * Index Tests
 *
 * Unit tests for the demo main entry point.
 *
 * @module demo/__tests__/index
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DemoApplication, DemoState, DemoConfig } from '../index.js';

describe('DemoApplication', () => {
	let app: DemoApplication;

	beforeEach(() => {
		const config: DemoConfig = {
			options: {
				mode: 'interactive',
				theme: 'dark',
				verbose: false,
				debug: false,
				fps: 60,
				mouse: true,
				bracketedPaste: true,
			},
			showBanner: false,
		};
		app = new DemoApplication(config);
	});

	describe('constructor', () => {
		it('should create an application instance', () => {
			expect(app).toBeInstanceOf(DemoApplication);
		});

		it('should store configuration', () => {
			const config = app.getConfig();
			expect(config.options.mode).toBe('interactive');
		});

		it('should initialize state', () => {
			const state = app.getState();
			expect(state.running).toBe(false);
			expect(state.currentMode).toBe('interactive');
			expect(state.frameCount).toBe(0);
		});
	});

	describe('getState', () => {
		it('should return current state', () => {
			const state = app.getState();
			expect(state).toHaveProperty('running');
			expect(state).toHaveProperty('currentMode');
			expect(state).toHaveProperty('frameCount');
			expect(state).toHaveProperty('startTime');
		});
	});

	describe('getConfig', () => {
		it('should return configuration', () => {
			const config = app.getConfig();
			expect(config).toHaveProperty('options');
			expect(config).toHaveProperty('showBanner');
		});
	});
});
