/**
 * Theme Demo
 *
 * Showcase all themes including light, dark, high contrast,
 * monochrome, color palettes, and TrueColor support.
 *
 * @module demo/theme
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear, drawFill } from '../rendering/primitives.js';
import { darkTheme, lightTheme, highContrastTheme, monochromeTheme } from '../theme/index.js';

/**
 * Theme type for demo
 */
export type ThemeType = 'light' | 'dark' | 'high-contrast' | 'monochrome';

/**
 * Color palette for demo
 */
interface ColorPalette {
	name: string;
	colors: Array<{ name: string; color: { rgb: [number, number, number] }>;
}
/**
 * Theme demo state
 */
export interface ThemeDemoState {
	/** Currently active theme */
	activeTheme: ThemeType;
	/** Color palettes */
	palettes: ColorPalette[];
	/** Selected palette index */
	selectedPalette: number;
	/** Animation progress */
	animationProgress: number;
	/** Show TrueColor demo */
	showTrueColor: boolean;
}

/**
 * Theme demo configuration
 */
export interface ThemeDemoConfig {
	/** Enable animations */
	animationsEnabled?: boolean;
}

/**
 * Theme demo component
 */
export class ThemeDemo {
	private state: ThemeDemoState;
	private config: Required<ThemeDemoConfig>;

	constructor(config: ThemeDemoConfig = {}) {
		this.config = {
			animationsEnabled: config.animationsEnabled ?? true,
		};

		this.state = {
			activeTheme: 'dark',
			palettes: this.createPalettes(),
			selectedPalette: 0,
			animationProgress: 0,
			showTrueColor: false,
		};
	}

	/**
	 * Create color palettes
	 */
	private createPalettes(): ColorPalette[] {
		return [
			{
				name: 'Sunset',
				colors: [
					{ name: 'Red', color: { rgb: [255, 107, 107] as [number, number, number] } },
					{ name: 'Orange', color: { rgb: [255, 159, 67] as [number, number, number] } },
					{ name: 'Yellow', color: { rgb: [255, 234, 167] as [number, number, number] } },
					{ name: 'Pink', color: { rgb: [255, 107, 157] as [number, number, number] } },
				],
			},
			{
				name: 'Ocean',
				colors: [
					{ name: 'Blue', color: { rgb: [69, 183, 209] as [number, number, number] } },
					{ name: 'Cyan', color: { rgb: [78, 205, 196] as [number, number, number] } },
					{ name: 'Teal', color: { rgb: [150, 206, 180] as [number, number, number] } },
					{ name: 'Aqua', color: { rgb: [152, 216, 200] as [number, number, number] } },
				],
			},
			{
				name: 'Forest',
				colors: [
					{ name: 'Green', color: { rgb: [150, 206, 180] as [number, number, number] } },
					{ name: 'Lime', color: { rgb: [247, 220, 111] as [number, number, number] } },
					{ name: 'Olive', color: { rgb: [221, 160, 221] as [number, number, number] } },
					{ name: 'Emerald', color: { rgb: [78, 205, 196] as [number, number, number] } },
				],
			},
			{
				name: 'Berry',
				colors: [
					{ name: 'Purple', color: { rgb: [221, 160, 221] as [number, number, number] } },
					{ name: 'Magenta', color: { rgb: [255, 107, 157] as [number, number, number] } },
					{ name: 'Violet', color: { rgb: [152, 216, 200] as [number, number, number] } },
					{ name: 'Fuchsia', color: { rgb: [255, 107, 107] as [number, number, number] } },
				],
			},
		];
	}

	/**
	 * Render theme demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw theme navigation
		this.renderThemeNavigation(ctx, width);

		// Draw theme preview
		this.renderThemePreview(ctx, width, height);

		// Draw color palette
		this.renderColorPalette(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Theme Demo - Color & Visual Themes', 2, 1);
		drawText(ctx, `Theme: ${this.state.activeTheme}`, width - 15, 1);
	}

	/**
	 * Render theme navigation
	 */
	private renderThemeNavigation(ctx: RenderContext, width: number): void {
		const themes: { key: string; type: ThemeType }[] = [
			{ key: '1', type: 'light' },
			{ key: '2', type: 'dark' },
			{ key: '3', type: 'high-contrast' },
			{ key: '4', type: 'monochrome' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Themes: ', 2, navY + 1);

		let xPos = 10;
		for (const theme of themes) {
			const isActive = theme.type === this.state.activeTheme;
			const label = `${theme.key}:${theme.type}`;
			if (isActive) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${label}]`, xPos, navY + 1);
				ctx.restore();
			} else {
				drawText(ctx, ` ${label} `, xPos, navY + 1);
			}
			xPos += label.length + 2;
		}
	}

	/**
	 * Render theme preview
	 */
	private renderThemePreview(ctx: RenderContext, width: number, height: number): void {
		const previewY = 7;
		const previewHeight = Math.floor((height - 15) / 2);
		const previewWidth = width - 4;

		// Draw theme preview box
		drawBox(ctx, { x: 2, y: previewY, width: previewWidth, height: previewHeight });
		drawText(ctx, 'Theme Preview', 4, previewY + 1);

		// Draw sample UI elements
		this.drawSampleUI(ctx, 4, previewY + 3, previewWidth - 4, previewHeight - 4);
	}

	/**
	 * Draw sample UI elements
	 */
	private drawSampleUI(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		// Get theme colors
		const colors = this.getThemeColors();

		// Draw sample button
		drawBox(ctx, { x: x + 2, y: y + 2, width: 15, height: 3 });
		drawText(ctx, 'Button', x + 4, y + 3);
		ctx.save();
		ctx.setFg(colors.primary);
		for (let j = 0; j < 1; j++) {
			for (let k = 0; k < 11; k++) {
				ctx.drawChar('█', x + 4 + k, y + 4 + j);
			}
		}
		ctx.restore();

		// Draw sample input
		drawBox(ctx, { x: x + 20, y: y + 2, width: 20, height: 3 });
		drawText(ctx, 'Input Field', x + 22, y + 3);
		ctx.save();
		ctx.setFg(colors.text);
		for (let j = 0; j < 1; j++) {
			for (let k = 0; k < 16; k++) {
				ctx.drawChar('░', x + 22 + k, y + 4 + j);
			}
		}
		ctx.restore();

		// Draw sample checkbox
		drawBox(ctx, { x: x + 42, y: y + 2, width: 3, height: 3 });
		ctx.save();
		ctx.setFg(colors.accent);
		ctx.drawChar('☑', x + 43, y + 3);
		ctx.restore();
		drawText(ctx, 'Checked', x + 47, y + 3);

		// Draw sample progress bar
		drawText(ctx, 'Progress:', x + 2, y + 6);
		ctx.save();
		ctx.setFg(colors.primary);
		for (let k = 0; k < 20; k++) {
			ctx.drawChar('█', x + 12 + k, y + 6);
		}
		ctx.restore();
		ctx.save();
		ctx.setFg(colors.secondary);
		for (let k = 20; k < 40; k++) {
			ctx.drawChar('░', x + 12 + k, y + 6);
		}
		ctx.restore();

		// Draw sample list items
		drawText(ctx, 'List Items:', x + 2, y + 8);
		ctx.save();
		ctx.setFg(colors.text);
		drawText(ctx, '• Item 1', x + 13, y + 8);
		drawText(ctx, '• Item 2', x + 13, y + 9);
		drawText(ctx, '• Item 3', x + 13, y + 10);
		ctx.restore();
	}

	/**
	 * Get theme colors
	 */
	private getThemeColors(): {
		primary: { rgb: [number, number, number] };
		secondary: { rgb: [number, number, number] };
		accent: { rgb: [number, number, number] };
		text: { rgb: [number, number, number] };
	} {
		switch (this.state.activeTheme) {
			case 'light':
				return {
					primary: { rgb: [69, 183, 209] as [number, number, number] },
					secondary: { rgb: [150, 206, 180] as [number, number, number] },
					accent: { rgb: [78, 205, 196] as [number, number, number] },
					text: { rgb: [50, 50, 50] as [number, number, number] },
				};
			case 'dark':
				return {
					primary: { rgb: [78, 205, 196] as [number, number, number] },
					secondary: { rgb: [69, 183, 209] as [number, number, number] },
					accent: { rgb: [150, 206, 180] as [number, number, number] },
					text: { rgb: [220, 220, 220] as [number, number, number] },
				};
			case 'high-contrast':
				return {
					primary: { rgb: [255, 255, 0] as [number, number, number] },
					secondary: { rgb: [0, 0, 0] as [number, number, number] },
					accent: { rgb: [255, 255, 255] as [number, number, number] },
					text: { rgb: [255, 255, 255] as [number, number, number] },
				};
			case 'monochrome':
				return {
					primary: { rgb: [255, 255, 255] as [number, number, number] },
					secondary: { rgb: [150, 150, 150] as [number, number, number] },
					accent: { rgb: [200, 200, 200] as [number, number, number] },
					text: { rgb: [255, 255, 255] as [number, number, number] },
				};
		}
	}

	/**
	 * Render color palette
	 */
	private renderColorPalette(ctx: RenderContext, width: number, height: number): void {
		const paletteY = 7 + Math.floor((height - 15) / 2);
		const paletteHeight = height - paletteY - 2;
		const paletteWidth = width - 4;

		// Draw palette box
		drawBox(ctx, { x: 2, y: paletteY, width: paletteWidth, height: paletteHeight });
		drawText(ctx, 'Color Palettes', 4, paletteY + 1);

		// Draw palette navigation
		const paletteNames = this.state.palettes.map((p, i) => `${i + 1}:${p.name}`);
		let xPos = 4;
		for (let i = 0; i < paletteNames.length; i++) {
			const isActive = i === this.state.selectedPalette;
			const label = paletteNames[i];
			if (isActive) {
				ctx.save();
				ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
				ctx.setStyles({ bold: true });
				drawText(ctx, `[${label}]`, xPos, paletteY + 3);
				ctx.restore();
			} else {
				drawText(ctx, ` ${label} `, xPos, paletteY + 3);
			}
			xPos += label.length + 2;
		}

		// Draw selected palette colors
		const colorsY = paletteY + 5;
		const palette = this.state.palettes[this.state.selectedPalette];
		const colorWidth = Math.floor((paletteWidth - 8) / palette.colors.length);

		for (let i = 0; i < palette.colors.length; i++) {
			const colorX = 4 + i * (colorWidth + 1);
			const color = palette.colors[i];

			drawBox(ctx, { x: colorX, y: colorsY, width: colorWidth, height: 4 });
			drawText(ctx, color.name, colorX + 2, colorsY + 1);

			ctx.save();
			ctx.setFg(color.color);
			for (let j = 0; j < 2; j++) {
				for (let k = 0; k < colorWidth - 4; k++) {
					ctx.drawChar('█', colorX + 2 + k, colorsY + 2 + j);
				}
			}
			ctx.restore();
		}

		// Draw TrueColor demo
		if (this.state.showTrueColor) {
			this.renderTrueColorDemo(ctx, 4, paletteY + 10, paletteWidth - 4, paletteHeight - 12);
		}
	}

	/**
	 * Render TrueColor demo
	 */
	private renderTrueColorDemo(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'TrueColor Gradient Demo', x + 2, y + 1);

		const gradientY = y + 3;
		const gradientHeight = height - 5;
		const gradientWidth = width - 8;

		// Draw gradient
		for (let row = 0; row < gradientHeight; row++) {
			for (let col = 0; col < gradientWidth; col++) {
				const progress = col / gradientWidth;
				const r = Math.floor(255 * (1 - progress));
				const g = Math.floor(255 * progress);
				const b = Math.floor(100 + 155 * progress);

				ctx.save();
				ctx.setFg({ rgb: [r, g, b] as [number, number, number] });
				ctx.drawChar('█', x + 2 + col, gradientY + row);
				ctx.restore();
			}
		}

		// Draw color labels
		drawText(ctx, 'Red', x + 2, gradientY + gradientHeight + 1);
		ctx.save();
		ctx.setFg({ rgb: [255, 0, 0] as [number, number, number] });
		drawText(ctx, '█', x + 7, gradientY + gradientHeight + 1);
		ctx.restore();

		drawText(ctx, 'Green', x + 12, gradientY + gradientHeight + 1);
		ctx.save();
		ctx.setFg({ rgb: [0, 255, 0] as [number, number, number] });
		drawText(ctx, '█', x + 19, gradientY + gradientHeight + 1);
		ctx.restore();

		drawText(ctx, 'Blue', x + 24, gradientY + gradientHeight + 1);
		ctx.save();
		ctx.setFg({ rgb: [0, 0, 255] as [number, number, number] });
		drawText(ctx, '█', x + 30, gradientY + gradientHeight + 1);
		ctx.restore();
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-4 to switch themes | Tab to switch palettes | t to toggle TrueColor | q to quit', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				this.stop();
				break;
			case '1':
				this.state.activeTheme = 'light';
				break;
			case '2':
				this.state.activeTheme = 'dark';
				break;
			case '3':
				this.state.activeTheme = 'high-contrast';
				break;
			case '4':
				this.state.activeTheme = 'monochrome';
				break;
			case 'tab':
				this.state.selectedPalette = (this.state.selectedPalette + 1) % this.state.palettes.length;
				break;
			case 't':
				this.state.showTrueColor = !this.state.showTrueColor;
				break;
		}
	}

	/**
	 * Stop theme demo
	 */
	stop(): void {
		// No specific cleanup needed
	}

	/**
	 * Get current state
	 */
	getState(): ThemeDemoState {
		return { ...this.state };
	}
}

/**
 * Create a theme demo instance
 */
export function createThemeDemo(config?: ThemeDemoConfig): ThemeDemo {
	return new ThemeDemo(config);
}
