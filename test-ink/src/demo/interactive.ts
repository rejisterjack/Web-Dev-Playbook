/**
 * Interactive Demo
 *
 * Interactive exploration of all features with navigation menu
 * for switching between demos and help system with keyboard shortcuts.
 *
 * @module demo/interactive
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear } from '../rendering/primitives.js';

/**
 * Demo type
 */
export type DemoType =
	| 'dashboard'
	| 'charts'
	| 'widgets'
	| 'layout'
	| 'tasks'
	| 'theme'
	| 'accessibility'
	| 'performance';

/**
 * Demo info
 */
interface DemoInfo {
	type: DemoType;
	name: string;
	description: string;
	key: string;
}

/**
 * Interactive demo state
 */
export interface InteractiveDemoState {
	/** Currently selected demo */
	selectedDemo: DemoType;
	/** Help visible */
	helpVisible: boolean;
	/** Current time */
	currentTime: Date;
	/** Show shortcuts */
	showShortcuts: boolean;
	/** Demo descriptions */
	demos: DemoInfo[];
}

/**
 * Interactive demo configuration
 */
export interface InteractiveDemoConfig {
	/** Auto-start first demo */
	autoStart?: boolean;
}

/**
 * Interactive demo component
 */
export class InteractiveDemo {
	private state: InteractiveDemoState;
	private config: Required<InteractiveDemoConfig>;
	private updateTimer?: NodeJS.Timeout;

	constructor(config: InteractiveDemoConfig = {}) {
		this.config = {
			autoStart: config.autoStart ?? false,
		};

		this.state = {
			selectedDemo: 'dashboard',
			helpVisible: false,
			currentTime: new Date(),
			showShortcuts: true,
			demos: [
				{
					type: 'dashboard',
					name: 'Dashboard',
					description: 'Comprehensive dashboard with status, charts, and logs',
					key: '1',
				},
				{
					type: 'charts',
					name: 'Charts',
					description: 'All chart types: line, bar, area, scatter, pie, gauge, sparkline, histogram, heatmap',
					key: '2',
				},
				{
					type: 'widgets',
					name: 'Widgets',
					description: 'All widget types: button, input, checkbox, radio, list, tabs, dialog, menu, progress',
					key: '3',
				},
				{
					type: 'layout',
					name: 'Layout',
					description: 'Flexbox, responsive, nested, grid, and absolute positioning',
					key: '4',
				},
				{
					type: 'tasks',
					name: 'Tasks',
					description: 'Async task processing: queue, pool, scheduler, and progress',
					key: '5',
				},
				{
					type: 'theme',
					name: 'Theme',
					description: 'Color themes: light, dark, high contrast, monochrome, and palettes',
					key: '6',
				},
				{
					type: 'accessibility',
					name: 'Accessibility',
					description: 'Screen reader, keyboard nav, high contrast, text scaling, reduced motion',
					key: '7',
				},
				{
					type: 'performance',
					name: 'Performance',
					description: 'Rendering FPS, frame time, event handling, and memory usage',
					key: '8',
				},
			],
		};

		// Start update timer
		this.updateTimer = setInterval(() => {
			this.state.currentTime = new Date();
		}, 1000);
	}

	/**
	 * Start interactive demo
	 */
	start(): void {
		// Timer already started in constructor
	}

	/**
	 * Stop interactive demo
	 */
	stop(): void {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = undefined;
		}
	}

	/**
	 * Render interactive demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw demo menu
		this.renderDemoMenu(ctx, width, height);

		// Draw help overlay if visible
		if (this.state.helpVisible) {
			this.renderHelpOverlay(ctx, width, height);
		}
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'TUI Framework - Interactive Demo', 2, 1);
		drawText(ctx, this.state.currentTime.toLocaleTimeString(), width - 22, 1);
	}

	/**
	 * Render demo menu
	 */
	private renderDemoMenu(ctx: RenderContext, width: number, height: number): void {
		const menuY = 4;
		const menuHeight = height - 7;
		const menuWidth = width - 4;

		// Draw menu box
		drawBox(ctx, { x: 0, y: menuY, width, height: menuHeight });
		drawText(ctx, 'Select a Demo:', 2, menuY + 1);

		// Draw demo options
		const contentY = menuY + 3;
		const contentHeight = menuHeight - 4;

		for (let i = 0; i < this.state.demos.length; i++) {
			const demo = this.state.demos[i];
			const itemY = contentY + Math.floor(i / 3) * 4;
			const isSelected = demo.type === this.state.selectedDemo;

			// Draw selection indicator
			if (isSelected) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, '►', 2, itemY);
				ctx.restore();
			} else {
				drawText(ctx, '  ', 2, itemY);
			}

			// Draw demo key and name
			drawText(ctx, `[${demo.key}] ${demo.name}`, 4, itemY);

			// Draw description
			const maxWidth = menuWidth - 8;
			let description = demo.description;
			if (description.length > maxWidth) {
				description = description.substring(0, maxWidth - 3) + '...';
			}
			drawText(ctx, description, 8, itemY);
		}

		// Draw selected demo description
		const selectedDemo = this.state.demos.find((d) => d.type === this.state.selectedDemo);
		if (selectedDemo) {
			const descY = contentY + Math.floor((this.state.demos.length + 1) / 3) * 4;
			drawSeparator(ctx, 2, descY, menuWidth - 4);
			drawText(ctx, selectedDemo.description, 4, descY + 1);
		}

		// Draw shortcuts hint
		if (this.state.showShortcuts) {
			const shortcutsY = contentY + Math.floor((this.state.demos.length + 2) / 3) * 4;
			drawText(ctx, 'Press ? for shortcuts', 2, shortcutsY);
		}
	}

	/**
	 * Render help overlay
	 */
	private renderHelpOverlay(ctx: RenderContext, width: number, height: number): void {
		const overlayWidth = Math.min(60, width - 4);
		const overlayHeight = Math.min(20, height - 4);
		const overlayX = Math.floor((width - overlayWidth) / 2);
		const overlayY = Math.floor((height - overlayHeight) / 2);

		// Draw overlay background
		ctx.save();
		ctx.setFg({ rgb: [0, 0, 0] as [number, number, number] });
		ctx.setBg({ rgb: [0, 0, 0] as [number, number, number] });
		drawBox(ctx, { x: overlayX, y: overlayY, width: overlayWidth, height: overlayHeight });
		ctx.restore();

		// Draw help title
		drawText(ctx, 'Keyboard Shortcuts', overlayX + 2, overlayY + 1);

		// Draw shortcuts
		const shortcutsY = overlayY + 3;
		const shortcuts = [
			{ key: '1-8', desc: 'Switch to specific demo' },
			{ key: 'Tab', desc: 'Navigate within demo' },
			{ key: 'Space', desc: 'Toggle options' },
			{ key: 'Enter', desc: 'Activate/Select' },
			{ key: 'Esc', desc: 'Go back / Close' },
			{ key: 'q / Ctrl+C', desc: 'Quit demo' },
			{ key: '?', desc: 'Show this help' },
			{ key: 'h', desc: 'Hide help' },
		{ key: 'a', desc: 'Toggle shortcuts display' },
		{ key: '↑↓←→', desc: 'Navigate (arrows)' },
		{ key: 'r', desc: 'Refresh data' },
		{ key: 't', desc: 'Toggle theme' },
		{ key: '+/-', desc: 'Adjust values' },
		];

		for (let i = 0; i < shortcuts.length; i++) {
			const shortcutY = shortcutsY + i * 2;
			const shortcut = shortcuts[i];
			drawText(ctx, `${shortcut.key.padEnd(8)} ${shortcut.desc}`, overlayX + 2, shortcutY);
		}

		// Draw close hint
		drawText(ctx, 'Press ? or h to close', overlayX + 2, overlayY + shortcuts.length * 2 + 1);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);

		// Draw selected demo info
		const selectedDemo = this.state.demos.find((d) => d.type === this.state.selectedDemo);
		if (selectedDemo) {
			drawText(ctx, `Demo: ${selectedDemo.name} | Press Enter to start`, 2, footerY);
		}

		// Draw help hint
		drawText(ctx, 'Press ? for help | q to quit', width - 25, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				this.stop();
				break;
			case '?':
				this.state.helpVisible = true;
				break;
			case 'h':
				this.state.helpVisible = false;
				break;
			case 'a':
				this.state.showShortcuts = !this.state.showShortcuts;
				break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8': {
				const index = parseInt(key) - 1;
				if (index >= 0 && index < this.state.demos.length) {
					this.state.selectedDemo = this.state.demos[index].type;
				}
				break;
			}
			case 'enter':
				// Signal to start selected demo
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): InteractiveDemoState {
		return { ...this.state };
	}

	/**
	 * Get selected demo
	 */
	getSelectedDemo(): DemoType | null {
		return this.state.selectedDemo;
	}
}

/**
 * Create an interactive demo instance
 */
export function createInteractiveDemo(config?: InteractiveDemoConfig): InteractiveDemo {
	return new InteractiveDemo(config);
}
