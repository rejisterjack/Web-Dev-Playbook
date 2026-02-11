/**
 * Demo Application Main Entry Point
 *
 * Main entry point for the TUI Framework demo application.
 * Initializes all systems and manages the application lifecycle.
 *
 * @module demo/index
 */

import { RawModeManager, TerminalSizeManager, TerminalOutput, TerminalInput, detectCapabilities } from '../terminal/index.js';
import { Renderer, createRenderContext, createBuffer } from '../rendering/index.js';
import { EventLoop, KeyBindings } from '../events/index.js';
import { LayoutEngine, LayoutBuilder } from '../layout/index.js';
import { ThemeManager, darkTheme, lightTheme, highContrastTheme, monochromeTheme } from '../theme/index.js';
import { AccessibilityManager } from '../accessibility/index.js';
import type { CLIOptions, DemoMode } from './cli.js';
import { parseAndValidate, handleSpecialFlags, getBanner, formatOptions } from './cli.js';

/**
 * Demo application configuration
 */
export interface DemoConfig {
	/** CLI options */
	options: CLIOptions;
	/** Whether to show banner */
	showBanner?: boolean;
}

/**
 * Demo application state
 */
export interface DemoState {
	/** Whether the application is running */
	running: boolean;
	/** Current demo mode */
	currentMode: DemoMode;
	/** Frame count */
	frameCount: number;
	/** Start time */
	startTime: number;
}

/**
 * Demo application class
 */
export class DemoApplication {
	private config: DemoConfig;
	private state: DemoState;
	private rawMode?: RawModeManager;
	private sizeManager?: TerminalSizeManager;
	private output?: TerminalOutput;
	private input?: TerminalInput;
	private renderer?: Renderer;
	private eventLoop?: EventLoop;
	private layoutEngine?: LayoutEngine;
	private themeManager?: ThemeManager;
	private accessibilityManager?: AccessibilityManager;
	private keyBindings?: KeyBindings;

	constructor(config: DemoConfig) {
		this.config = config;
		this.state = {
			running: false,
			currentMode: config.options.mode || 'interactive',
			frameCount: 0,
			startTime: Date.now(),
		};
	}

	/**
	 * Initialize the demo application
	 */
	async initialize(): Promise<void> {
		// Detect terminal capabilities
		const capabilities = detectCapabilities();
		if (this.config.options.verbose) {
			console.log('Terminal capabilities:', capabilities);
		}

		// Initialize raw mode
		this.rawMode = new RawModeManager();
		await this.rawMode.enter();

		// Initialize terminal size manager
		this.sizeManager = new TerminalSizeManager();
		this.sizeManager.on('resize', (size) => {
			if (this.config.options.verbose) {
				console.log(`Terminal resized: ${size.columns}x${size.rows}`);
			}
			this.handleResize(size.columns, size.rows);
		});

		// Initialize terminal output
		this.output = new TerminalOutput();

		// Initialize terminal input
		this.input = new TerminalInput({
			rawMode: true,
		});

		// Initialize renderer
		const size = this.sizeManager.getSize();
		this.renderer = new Renderer({
			width: size.columns,
			height: size.rows,
			targetFps: this.config.options.fps || 60,
		});

		// Initialize event loop
		this.eventLoop = new EventLoop({
			mouseSupport: this.config.options.mouse ?? true,
			bracketedPaste: this.config.options.bracketedPaste ?? true,
		});

		// Initialize layout engine
		this.layoutEngine = new LayoutEngine();

		// Initialize theme manager
		this.themeManager = new ThemeManager();
		this.applyTheme(this.config.options.theme || 'dark');

		// Initialize accessibility manager
		this.accessibilityManager = new AccessibilityManager();

		// Set up key bindings
		this.setupKeyBindings();

		// Set up event handlers
		this.setupEventHandlers();

		if (this.config.options.verbose) {
			console.log('Demo application initialized');
		}
	}

	/**
	 * Apply a theme
	 */
	private applyTheme(themeName: string): void {
		switch (themeName) {
			case 'light':
				this.themeManager?.setTheme(lightTheme);
				break;
			case 'dark':
				this.themeManager?.setTheme(darkTheme);
				break;
			case 'high-contrast':
				this.themeManager?.setTheme(highContrastTheme);
				break;
			case 'monochrome':
				this.themeManager?.setTheme(monochromeTheme);
				break;
			default:
				this.themeManager?.setTheme(darkTheme);
		}
	}

	/**
	 * Set up key bindings
	 */
	private setupKeyBindings(): void {
		this.keyBindings = new KeyBindings();

		// Quit
		this.keyBindings.register({
			id: 'quit',
			chords: { key: 'q', ctrl: true },
			callback: () => {
				void this.stop();
			},
		});

		this.keyBindings.register({
			id: 'quit-alt',
			chords: { key: 'c', ctrl: true },
			callback: () => {
				void this.stop();
			},
		});

		// Help
		this.keyBindings.register({
			id: 'help',
			chords: { key: '?' },
			callback: () => this.showHelp(),
		});

		// Mode switching
		this.keyBindings.register({
			id: 'mode-dashboard',
			chords: { key: '1' },
			callback: () => this.switchMode('dashboard'),
		});

		this.keyBindings.register({
			id: 'mode-charts',
			chords: { key: '2' },
			callback: () => this.switchMode('charts'),
		});

		this.keyBindings.register({
			id: 'mode-widgets',
			chords: { key: '3' },
			callback: () => this.switchMode('widgets'),
		});

		this.keyBindings.register({
			id: 'mode-layout',
			chords: { key: '4' },
			callback: () => this.switchMode('layout'),
		});

		this.keyBindings.register({
			id: 'mode-tasks',
			chords: { key: '5' },
			callback: () => this.switchMode('tasks'),
		});

		this.keyBindings.register({
			id: 'mode-theme',
			chords: { key: '6' },
			callback: () => this.switchMode('theme'),
		});

		this.keyBindings.register({
			id: 'mode-accessibility',
			chords: { key: '7' },
			callback: () => this.switchMode('accessibility'),
		});

		this.keyBindings.register({
			id: 'mode-performance',
			chords: { key: '8' },
			callback: () => this.switchMode('performance'),
		});

		// Theme switching
		this.keyBindings.register({
			id: 'theme-light',
			chords: { key: 'l', alt: true },
			callback: () => this.applyTheme('light'),
		});

		this.keyBindings.register({
			id: 'theme-dark',
			chords: { key: 'd', alt: true },
			callback: () => this.applyTheme('dark'),
		});

		this.keyBindings.register({
			id: 'theme-high-contrast',
			chords: { key: 'h', alt: true },
			callback: () => this.applyTheme('high-contrast'),
		});

		this.keyBindings.register({
			id: 'theme-monochrome',
			chords: { key: 'm', alt: true },
			callback: () => this.applyTheme('monochrome'),
		});
	}

	/**
	 * Set up event handlers
	 */
	private setupEventHandlers(): void {
		if (!this.eventLoop) return;

		this.eventLoop.on('key', (event) => {
			this.keyBindings?.handleKey(event);
		});

		this.eventLoop.on('resize', (event) => {
			if (event.type === 'resize') {
				this.handleResize(event.columns, event.rows);
			}
		});
	}

	/**
	 * Handle terminal resize
	 */
	private handleResize(columns: number, rows: number): void {
		if (this.renderer) {
			this.renderer.resize(columns, rows);
		}
	}

	/**
	 * Switch to a different demo mode
	 */
	private switchMode(mode: DemoMode): void {
		this.state.currentMode = mode;
		if (this.config.options.verbose) {
			console.log(`Switched to mode: ${mode}`);
		}
	}

	/**
	 * Show help
	 */
	private showHelp(): void {
		// This would display a help overlay in the actual demo
		if (this.config.options.verbose) {
			console.log('Help: Press q or Ctrl+C to quit');
		}
	}

	/**
	 * Start the demo application
	 */
	async start(): Promise<void> {
		if (this.state.running) {
			return;
		}

		this.state.running = true;
		this.state.startTime = Date.now();

		// Show banner if configured
		if (this.config.showBanner) {
			this.output?.write(getBanner());
			await this.output?.flush();
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		// Show configuration if verbose
		if (this.config.options.verbose) {
			console.log(formatOptions(this.config.options));
		}

		// Start event loop
		await this.eventLoop?.start();

		// Start render loop
		this.renderLoop();
	}

	/**
	 * Main render loop
	 */
	private renderLoop(): void {
		if (!this.state.running || !this.renderer) {
			return;
		}

		// Get back buffer
		const buffer = this.renderer.getBackBuffer();
		const ctx = createRenderContext(buffer);

		// Render current mode
		this.renderCurrentMode(ctx);

		// Render to screen
		void this.renderer.render().then(() => {
			this.state.frameCount++;
			const fps = this.config.options.fps || 60;
			setTimeout(() => this.renderLoop(), 1000 / fps);
		});
	}

	/**
	 * Render the current demo mode
	 */
	private renderCurrentMode(ctx: any): void {
		// This would delegate to specific demo renderers
		// For now, just clear the screen
		// ctx.clear();
	}

	/**
	 * Stop the demo application
	 */
	async stop(): Promise<void> {
		if (!this.state.running) {
			return;
		}

		this.state.running = false;

		// Stop event loop
		this.eventLoop?.stop();

		// Exit raw mode
		await this.rawMode?.exit();

		// Clear screen
		this.output?.write('\x1b[2J\x1b[H');
		await this.output?.flush();

		if (this.config.options.verbose) {
			const elapsed = Date.now() - this.state.startTime;
			console.log(`Demo stopped. Frames: ${this.state.frameCount}, Time: ${elapsed}ms`);
		}
	}

	/**
	 * Get the current state
	 */
	getState(): DemoState {
		return { ...this.state };
	}

	/**
	 * Get the configuration
	 */
	getConfig(): DemoConfig {
		return { ...this.config };
	}
}

/**
 * Create and run a demo application
 */
export async function runDemo(config: DemoConfig): Promise<void> {
	const app = new DemoApplication(config);

	// Handle special flags
	if (handleSpecialFlags(config.options)) {
		return;
	}

	try {
		await app.initialize();
		await app.start();
	} catch (error) {
		console.error('Demo error:', error);
		await app.stop();
		process.exit(1);
	}
}

/**
 * Main entry point for the demo application
 */
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
	const result = parseAndValidate(args);

	if (!result.valid) {
		console.error('Invalid arguments:');
		for (const error of result.errors) {
			console.error(`  - ${error}`);
		}
		console.log('\nRun with --help for usage information.');
		process.exit(1);
	}

	await runDemo({
		options: result.args.options,
		showBanner: true,
	});
}

// Export demo types
export type { CLIOptions, DemoMode } from './cli.js';
export * from './cli.js';
export * from './data-generator.js';
