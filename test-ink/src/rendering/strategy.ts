/**
 * Render Strategy Module
 *
 * This module defines render strategies for different scenarios.
 * Strategies determine how the screen should be rendered based on the amount
 * and type of changes, optimizing for performance and visual quality.
 *
 * @module rendering/strategy
 */

import {ScreenBuffer} from './buffer.js';
import {
	DifferentialRenderer,
	DifferentialStats,
	RenderInstruction,
} from './differential.js';

export {RenderInstruction} from './differential.js';

/**
 * Base interface for all render strategies
 */
export interface RenderStrategy {
	/** Strategy name */
	readonly name: string;

	/**
	 * Render the buffer and return instructions
	 *
	 * @param frontBuffer - Current visible buffer
	 * @param backBuffer - Buffer being rendered
	 * @returns Render instructions and statistics
	 */
	render(
		frontBuffer: ScreenBuffer,
		backBuffer: ScreenBuffer,
	): {instructions: RenderInstruction; stats: RenderStats};

	/**
	 * Determine if this strategy should be used based on context
	 *
	 * @param context - Render context information
	 * @returns True if this strategy is suitable
	 */
	shouldUse(context: RenderContext): boolean;
}

/**
 * Extended render statistics
 */
export interface RenderStats extends DifferentialStats {
	/** Strategy used for rendering */
	strategy: string;

	/** Whether a full render was performed */
	isFullRender: boolean;
}

/**
 * Context information for strategy selection
 */
export interface RenderContext {
	/** Percentage of cells that changed (0-100) */
	changePercentage: number;

	/** Number of frames since last full render */
	framesSinceFullRender: number;

	/** Whether this is the first render */
	isFirstRender: boolean;

	/** Terminal dimensions */
	terminalWidth: number;

	/** Terminal height */
	terminalHeight: number;

	/** Target frame rate */
	targetFps: number;

	/** Current frame rate */
	currentFps: number;

	/** Whether terminal supports differential updates efficiently */
	supportsDifferential: boolean;
}

/**
 * Options for full render strategy
 */
export interface FullRenderStrategyOptions {
	/** Whether to clear screen before rendering */
	clearScreen?: boolean;

	/** Whether to reset styles before rendering */
	resetStyles?: boolean;
}

/**
 * Full render strategy - renders the entire screen
 * Best for: initial render, major changes, or when differential rendering would be slower
 */
export class FullRenderStrategy implements RenderStrategy {
	readonly name = 'full';

	private options: Required<FullRenderStrategyOptions>;

	constructor(options: FullRenderStrategyOptions = {}) {
		this.options = {
			clearScreen: true,
			resetStyles: true,
			...options,
		};
	}

	render(
		_frontBuffer: ScreenBuffer,
		backBuffer: ScreenBuffer,
	): {instructions: RenderInstruction; stats: RenderStats} {
		const startTime = performance.now();
		const sequences: string[] = [];

		// Clear screen if requested
		if (this.options.clearScreen) {
			sequences.push('\u001B[2J\u001B[H'); // Clear and home
		} else {
			sequences.push('\u001B[H'); // Just home
		}

		// Reset styles if requested
		if (this.options.resetStyles) {
			sequences.push('\u001B[0m');
		}

		// Build full screen content
		const width = backBuffer.getWidth();
		const height = backBuffer.getHeight();

		let currentFg: string | null = null;
		let currentBg: string | null = null;
		let currentStyles = '';

		for (let y = 0; y < height; y++) {
			const rowSequences: string[] = [];

			for (let x = 0; x < width; x++) {
				const cell = backBuffer.getCell(x, y);

				if (cell) {
					// Build style sequence if different
					const fgCode = this.getColorCode(cell.fg, true);
					const bgCode = this.getColorCode(cell.bg, false);
					const styleCode = this.getStyleCode(cell.styles);

					const styleKey = `${fgCode}:${bgCode}:${styleCode}`;

					if (styleKey !== currentStyles) {
						const codes: string[] = [];
						if (fgCode) codes.push(fgCode);
						if (bgCode) codes.push(bgCode);
						if (styleCode) codes.push(styleCode);

						if (codes.length > 0) {
							rowSequences.push(`\u001B[${codes.join(';')}m`);
						}

						currentStyles = styleKey;
					}

					rowSequences.push(cell.char);
				} else {
					rowSequences.push(' ');
				}
			}

			sequences.push(rowSequences.join(''));

			// Move to next line (except for last row)
			if (y < height - 1) {
				sequences.push('\r\n');
			}
		}

		const endTime = performance.now();
		const totalCells = width * height;

		const stats: RenderStats = {
			strategy: this.name,
			isFullRender: true,
			totalCells,
			changedCells: totalCells,
			operations: totalCells,
			sequences: sequences.length,
			timeMs: endTime - startTime,
		};

		return {
			instructions: {
				sequences,
				finalX: width,
				finalY: height,
			},
			stats,
		};
	}

	shouldUse(context: RenderContext): boolean {
		// Use full render for first render or when most cells changed
		if (context.isFirstRender) return true;
		if (context.changePercentage > 70) return true;
		if (context.framesSinceFullRender > 60) return true; // Periodic full render
		return false;
	}

	/**
	 * Convert color to ANSI code
	 */
	private getColorCode(
		color: ScreenBuffer extends {getCell(x: number, y: number): infer C}
			? C extends {fg: infer F}
				? F
				: never
			: never,
		isForeground: boolean,
	): string | null {
		if (typeof color !== 'string') {
			// Handle object colors (256 or RGB)
			if (color && typeof color === 'object') {
				if ('index' in color) {
					return `${isForeground ? 38 : 48};5;${color.index}`;
				}
				if ('rgb' in color && Array.isArray(color.rgb)) {
					return `${isForeground ? 38 : 48};2;${color.rgb[0]};${color.rgb[1]};${
						color.rgb[2]
					}`;
				}
			}
			return null;
		}

		const base = isForeground ? 30 : 40;

		const colorMap: Record<string, number> = {
			default: isForeground ? 39 : 49,
			black: 0,
			red: 1,
			green: 2,
			yellow: 3,
			blue: 4,
			magenta: 5,
			cyan: 6,
			white: 7,
			gray: 8,
			brightBlack: 8,
			brightRed: 9,
			brightGreen: 10,
			brightYellow: 11,
			brightBlue: 12,
			brightMagenta: 13,
			brightCyan: 14,
			brightWhite: 15,
		};

		const code = colorMap[color];
		if (code === undefined) return null;

		if (code < 8) {
			return String(base + code);
		} else if (code < 16) {
			return String(base + 60 + (code - 8));
		} else {
			return String(code);
		}
	}

	/**
	 * Convert styles to ANSI code string
	 */
	private getStyleCode(styles: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		strikethrough?: boolean;
		dim?: boolean;
		blink?: boolean;
		reverse?: boolean;
		hidden?: boolean;
	}): string {
		const codes: number[] = [];

		if (styles.bold) codes.push(1);
		if (styles.dim) codes.push(2);
		if (styles.italic) codes.push(3);
		if (styles.underline) codes.push(4);
		if (styles.blink) codes.push(5);
		if (styles.reverse) codes.push(7);
		if (styles.hidden) codes.push(8);
		if (styles.strikethrough) codes.push(9);

		return codes.join(';');
	}
}

/**
 * Options for differential render strategy
 */
export interface DifferentialRenderStrategyOptions {
	/** Differential renderer options */
	differentialOptions?: ConstructorParameters<typeof DifferentialRenderer>[0];
}

/**
 * Differential render strategy - renders only changed cells
 * Best for: minor updates, animations, when few cells changed
 */
export class DifferentialRenderStrategy implements RenderStrategy {
	readonly name = 'differential';

	private differentialRenderer: DifferentialRenderer;

	constructor(options: DifferentialRenderStrategyOptions = {}) {
		this.differentialRenderer = new DifferentialRenderer(
			options.differentialOptions,
		);
	}

	render(
		frontBuffer: ScreenBuffer,
		backBuffer: ScreenBuffer,
	): {instructions: RenderInstruction; stats: RenderStats} {
		const startTime = performance.now();

		const result = this.differentialRenderer.render(frontBuffer, backBuffer);

		const endTime = performance.now();

		const stats: RenderStats = {
			strategy: this.name,
			isFullRender: false,
			...result.stats,
			timeMs: endTime - startTime,
		};

		return {
			instructions: result.instructions,
			stats,
		};
	}

	shouldUse(context: RenderContext): boolean {
		// Use differential when few cells changed and not first render
		if (context.isFirstRender) return false;
		if (context.changePercentage > 50) return false;
		if (!context.supportsDifferential) return false;
		return true;
	}

	/**
	 * Reset the differential renderer state
	 */
	reset(): void {
		this.differentialRenderer.resetState();
	}
}

/**
 * Options for smart render strategy
 */
export interface SmartRenderStrategyOptions {
	/** Threshold for switching to full render (percentage) */
	fullRenderThreshold?: number;

	/** Minimum FPS before forcing full render */
	minFpsForDifferential?: number;

	/** Maximum frames between full renders */
	maxFramesBetweenFullRenders?: number;

	/** Full render strategy options */
	fullRenderOptions?: FullRenderStrategyOptions;

	/** Differential render strategy options */
	differentialOptions?: DifferentialRenderStrategyOptions;
}

/**
 * Smart render strategy - automatically chooses between full and differential rendering
 * Best for: general use, adapts to changing conditions
 */
export class SmartRenderStrategy implements RenderStrategy {
	readonly name = 'smart';

	private fullStrategy: FullRenderStrategy;
	private differentialStrategy: DifferentialRenderStrategy;
	private options: Required<
		Omit<
			SmartRenderStrategyOptions,
			'fullRenderOptions' | 'differentialOptions'
		>
	>;

	/** Frame counter since last full render */
	private framesSinceFullRender = 0;

	constructor(options: SmartRenderStrategyOptions = {}) {
		this.options = {
			fullRenderThreshold: options.fullRenderThreshold ?? 50,
			minFpsForDifferential: options.minFpsForDifferential ?? 10,
			maxFramesBetweenFullRenders: options.maxFramesBetweenFullRenders ?? 60,
		};

		this.fullStrategy = new FullRenderStrategy(options.fullRenderOptions);
		this.differentialStrategy = new DifferentialRenderStrategy(
			options.differentialOptions,
		);
	}

	render(
		frontBuffer: ScreenBuffer,
		backBuffer: ScreenBuffer,
	): {instructions: RenderInstruction; stats: RenderStats} {
		// Determine which strategy to use
		const context = this.createRenderContext(frontBuffer, backBuffer);

		let result: {instructions: RenderInstruction; stats: RenderStats};

		if (this.fullStrategy.shouldUse(context)) {
			result = this.fullStrategy.render(frontBuffer, backBuffer);
			this.framesSinceFullRender = 0;
		} else {
			result = this.differentialStrategy.render(frontBuffer, backBuffer);
			this.framesSinceFullRender++;
		}

		return result;
	}

	shouldUse(): boolean {
		// Smart strategy is always usable
		return true;
	}

	/**
	 * Create render context for strategy decision
	 */
	private createRenderContext(
		frontBuffer: ScreenBuffer,
		backBuffer: ScreenBuffer,
	): RenderContext {
		// Calculate change percentage
		const width = frontBuffer.getWidth();
		const height = frontBuffer.getHeight();
		const totalCells = width * height;

		let changedCells = 0;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const frontCell = frontBuffer.getCell(x, y);
				const backCell = backBuffer.getCell(x, y);

				// Quick check - if references differ and one is undefined, it's a change
				if (frontCell !== backCell) {
					changedCells++;
				}
			}
		}

		const changePercentage =
			totalCells > 0 ? (changedCells / totalCells) * 100 : 0;

		return {
			changePercentage,
			framesSinceFullRender: this.framesSinceFullRender,
			isFirstRender: this.framesSinceFullRender === 0,
			terminalWidth: width,
			terminalHeight: height,
			targetFps: 60,
			currentFps: 60, // Would be calculated from actual timing
			supportsDifferential: true,
		};
	}

	/**
	 * Reset frame counter and strategies
	 */
	reset(): void {
		this.framesSinceFullRender = 0;
		this.differentialStrategy.reset();
	}
}

/**
 * Factory function to create appropriate strategy
 *
 * @param type - Strategy type
 * @param options - Strategy options
 * @returns Render strategy instance
 */
export function createRenderStrategy(
	type: 'full' | 'differential' | 'smart',
	options?: SmartRenderStrategyOptions &
		DifferentialRenderStrategyOptions &
		FullRenderStrategyOptions,
): RenderStrategy {
	switch (type) {
		case 'full':
			return new FullRenderStrategy(options as FullRenderStrategyOptions);
		case 'differential':
			return new DifferentialRenderStrategy(
				options as DifferentialRenderStrategyOptions,
			);
		case 'smart':
			return new SmartRenderStrategy(options as SmartRenderStrategyOptions);
		default:
			throw new Error(`Unknown render strategy: ${type}`);
	}
}
