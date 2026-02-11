/**
 * Layout Demo
 *
 * Showcase layout capabilities including flexbox, responsive,
 * nested layouts, and terminal resize handling.
 *
 * @module demo/layout
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear, drawFill } from '../rendering/primitives.js';

/**
 * Layout type for demo
 */
export type LayoutType =
	| 'flex-row'
	| 'flex-column'
	| 'flex-wrap'
	| 'nested'
	| 'responsive'
	| 'grid'
	| 'absolute';

/**
 * Layout demo state
 */
export interface LayoutDemoState {
	/** Currently active layout */
	activeLayout: LayoutType;
	/** Terminal size */
	terminalSize: { width: number; height: number };
	/** Animation progress */
	animationProgress: number;
	/** Flex direction */
	flexDirection: 'row' | 'column';
	/** Wrap enabled */
	wrapEnabled: boolean;
}

/**
 * Layout demo configuration
 */
export interface LayoutDemoConfig {
	/** Enable animations */
	animationsEnabled?: boolean;
}

/**
 * Layout demo component
 */
export class LayoutDemo {
	private state: LayoutDemoState;
	private config: Required<LayoutDemoConfig>;

	constructor(config: LayoutDemoConfig = {}) {
		this.config = {
			animationsEnabled: config.animationsEnabled ?? true,
		};

		this.state = {
			activeLayout: 'flex-row',
			terminalSize: { width: 80, height: 24 },
			animationProgress: 0,
			flexDirection: 'row',
			wrapEnabled: false,
		};
	}

	/**
	 * Render layout demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Update terminal size
		this.state.terminalSize = { width, height };

		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw layout navigation
		this.renderNavigation(ctx, width);

		// Draw active layout
		this.renderActiveLayout(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Layout Demo - Flexbox & Responsive', 2, 1);
		drawText(ctx, `Size: ${this.state.terminalSize.width}x${this.state.terminalSize.height}`, width - 18, 1);
	}

	/**
	 * Render layout navigation
	 */
	private renderNavigation(ctx: RenderContext, width: number): void {
		const layouts: { key: string; type: LayoutType }[] = [
			{ key: '1', type: 'flex-row' },
			{ key: '2', type: 'flex-column' },
			{ key: '3', type: 'flex-wrap' },
			{ key: '4', type: 'nested' },
			{ key: '5', type: 'responsive' },
			{ key: '6', type: 'grid' },
			{ key: '7', type: 'absolute' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Layouts: ', 2, navY + 1);

		let xPos = 11;
		for (const layout of layouts) {
			const isActive = layout.type === this.state.activeLayout;
			const label = `${layout.key}:${layout.type}`;
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
	 * Render active layout
	 */
	private renderActiveLayout(ctx: RenderContext, width: number, height: number): void {
		const layoutY = 7;
		const layoutHeight = height - 10;
		const layoutWidth = width - 4;

		switch (this.state.activeLayout) {
			case 'flex-row':
				this.renderFlexRow(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'flex-column':
				this.renderFlexColumn(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'flex-wrap':
				this.renderFlexWrap(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'nested':
				this.renderNestedLayout(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'responsive':
				this.renderResponsiveLayout(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'grid':
				this.renderGridLayout(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
			case 'absolute':
				this.renderAbsoluteLayout(ctx, 2, layoutY, layoutWidth, layoutHeight);
				break;
		}
	}

	/**
	 * Render flex row layout
	 */
	private renderFlexRow(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Flex Row - Items flow horizontally', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;
		const itemWidth = Math.floor((width - 8) / 4);

		// Draw flex items
		for (let i = 0; i < 4; i++) {
			const itemX = x + 4 + i * (itemWidth + 1);
			const colors = [
				{ rgb: [255, 107, 107] as [number, number, number] },
				{ rgb: [78, 205, 196] as [number, number, number] },
				{ rgb: [69, 183, 209] as [number, number, number] },
				{ rgb: [150, 206, 180] as [number, number, number] },
			];

			drawBox(ctx, { x: itemX, y: contentY, width: itemWidth, height: contentHeight });
			drawText(ctx, `Item ${i + 1}`, itemX + 2, contentY + 1);

			ctx.save();
			ctx.setFg(colors[i]);
			for (let j = 0; j < contentHeight - 3; j++) {
				for (let k = 0; k < itemWidth - 4; k++) {
					ctx.drawChar('█', itemX + 2 + k, contentY + 3 + j);
				}
			}
			ctx.restore();
		}

		// Draw instructions
		drawText(ctx, 'Resize terminal to see flex behavior', x + 2, y + height - 2);
	}

	/**
	 * Render flex column layout
	 */
	private renderFlexColumn(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Flex Column - Items flow vertically', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = Math.floor((height - 5) / 4);
		const itemWidth = width - 8;

		// Draw flex items
		for (let i = 0; i < 4; i++) {
			const itemY = contentY + i * (contentHeight + 1);
			const colors = [
				{ rgb: [255, 107, 107] as [number, number, number] },
				{ rgb: [78, 205, 196] as [number, number, number] },
				{ rgb: [69, 183, 209] as [number, number, number] },
				{ rgb: [150, 206, 180] as [number, number, number] },
			];

			drawBox(ctx, { x: x + 4, y: itemY, width: itemWidth, height: contentHeight });
			drawText(ctx, `Item ${i + 1}`, x + 6, itemY + 1);

			ctx.save();
			ctx.setFg(colors[i]);
			for (let j = 0; j < contentHeight - 3; j++) {
				for (let k = 0; k < itemWidth - 4; k++) {
					ctx.drawChar('█', x + 6 + k, itemY + 3 + j);
				}
			}
			ctx.restore();
		}

		// Draw instructions
		drawText(ctx, 'Resize terminal to see flex behavior', x + 2, y + height - 2);
	}

	/**
	 * Render flex wrap layout
	 */
	private renderFlexWrap(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Flex Wrap - Items wrap to next line', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;
		const itemWidth = 15;

		// Draw wrapped items
		let itemX = x + 4;
		let itemY = contentY;
		const colors = [
			{ rgb: [255, 107, 107] as [number, number, number] },
			{ rgb: [78, 205, 196] as [number, number, number] },
			{ rgb: [69, 183, 209] as [number, number, number] },
			{ rgb: [150, 206, 180] as [number, number, number] },
		];

		for (let i = 0; i < 8; i++) {
			// Check if we need to wrap
			if (itemX + itemWidth > x + width - 4) {
				itemX = x + 4;
				itemY += 4;
			}

			drawBox(ctx, { x: itemX, y: itemY, width: itemWidth, height: 3 });
			drawText(ctx, `${i + 1}`, itemX + 6, itemY + 1);

			ctx.save();
			ctx.setFg(colors[i % colors.length]);
			for (let j = 0; j < 1; j++) {
				for (let k = 0; k < itemWidth - 4; k++) {
					ctx.drawChar('█', itemX + 6 + k, itemY + 1 + j);
				}
			}
			ctx.restore();

			itemX += itemWidth + 1;
		}

		// Draw instructions
		drawText(ctx, 'Resize terminal to see wrapping behavior', x + 2, y + height - 2);
	}

	/**
	 * Render nested layout
	 */
	private renderNestedLayout(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Nested Layout - Containers within containers', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Outer container
		drawBox(ctx, { x: x + 4, y: contentY, width: width - 8, height: contentHeight });

		// Inner row container
		const innerY = contentY + 2;
		const innerHeight = Math.floor((contentHeight - 4) / 2);
		const itemWidth = Math.floor((width - 16) / 3);

		drawBox(ctx, { x: x + 8, y: innerY, width: width - 16, height: innerHeight });

		// Inner items
		const colors = [
			{ rgb: [255, 107, 107] as [number, number, number] },
			{ rgb: [78, 205, 196] as [number, number, number] },
			{ rgb: [69, 183, 209] as [number, number, number] },
		];

		for (let i = 0; i < 3; i++) {
			const itemX = x + 10 + i * (itemWidth + 1);
			drawBox(ctx, { x: itemX, y: innerY + 1, width: itemWidth, height: innerHeight - 2 });
			drawText(ctx, `${i + 1}`, itemX + 2, innerY + 2);

			ctx.save();
			ctx.setFg(colors[i]);
			for (let j = 0; j < innerHeight - 4; j++) {
				for (let k = 0; k < itemWidth - 4; k++) {
					ctx.drawChar('█', itemX + 2 + k, innerY + 3 + j);
				}
			}
			ctx.restore();
		}

		// Inner column container
		const columnY = innerY + innerHeight + 1;
		const columnItemHeight = Math.floor((contentHeight - innerHeight - 3) / 2);

		drawBox(ctx, { x: x + 8, y: columnY, width: width - 16, height: contentHeight - innerHeight - 3 });

		// Column items
		for (let i = 0; i < 2; i++) {
			const itemY = columnY + 1 + i * (columnItemHeight + 1);
			drawBox(ctx, { x: x + 10, y: itemY, width: width - 20, height: columnItemHeight });
			drawText(ctx, `N${i + 1}`, x + 12, itemY + 1);

			ctx.save();
			ctx.setFg(colors[i]);
			for (let j = 0; j < columnItemHeight - 2; j++) {
				for (let k = 0; k < width - 24; k++) {
					ctx.drawChar('█', x + 12 + k, itemY + 1 + j);
				}
			}
			ctx.restore();
		}

		// Draw instructions
		drawText(ctx, 'Nested containers demonstrate layout composition', x + 2, y + height - 2);
	}

	/**
	 * Render responsive layout
	 */
	private renderResponsiveLayout(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Responsive Layout - Adapts to terminal size', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;

		// Determine breakpoint
		let layout: 'mobile' | 'tablet' | 'desktop';
		if (width < 60) {
			layout = 'mobile';
		} else if (width < 100) {
			layout = 'tablet';
		} else {
			layout = 'desktop';
		}

		// Draw breakpoint indicator
		drawText(ctx, `Breakpoint: ${layout}`, x + 2, y + height - 2);

		// Render based on breakpoint
		if (layout === 'mobile') {
			// Single column
			const itemHeight = Math.floor(contentHeight / 3);
			const colors = [
				{ rgb: [255, 107, 107] as [number, number, number] },
				{ rgb: [78, 205, 196] as [number, number, number] },
				{ rgb: [69, 183, 209] as [number, number, number] },
			];

			for (let i = 0; i < 3; i++) {
				const itemY = contentY + i * (itemHeight + 1);
				drawBox(ctx, { x: x + 4, y: itemY, width: width - 8, height: itemHeight });
				drawText(ctx, `Mobile ${i + 1}`, x + 6, itemY + 1);

				ctx.save();
				ctx.setFg(colors[i]);
				for (let j = 0; j < itemHeight - 3; j++) {
					for (let k = 0; k < width - 12; k++) {
						ctx.drawChar('█', x + 6 + k, itemY + 3 + j);
					}
				}
				ctx.restore();
			}
		} else if (layout === 'tablet') {
			// Two columns
			const colWidth = Math.floor((width - 10) / 2);
			const itemHeight = Math.floor(contentHeight / 3);
			const colors = [
				{ rgb: [255, 107, 107] as [number, number, number] },
				{ rgb: [78, 205, 196] as [number, number, number] },
				{ rgb: [69, 183, 209] as [number, number, number] },
				{ rgb: [150, 206, 180] as [number, number, number] },
				{ rgb: [255, 234, 167] as [number, number, number] },
				{ rgb: [221, 160, 221] as [number, number, number] },
			];

			for (let col = 0; col < 2; col++) {
				const colX = x + 4 + col * (colWidth + 1);
				drawBox(ctx, { x: colX, y: contentY, width: colWidth, height: contentHeight });

				for (let i = 0; i < 3; i++) {
					const itemY = contentY + 1 + i * (itemHeight / 3);
					drawBox(ctx, { x: colX + 2, y: itemY, width: colWidth - 4, height: Math.floor(itemHeight / 3) - 1 });
					drawText(ctx, `T${col + 1}-${i + 1}`, colX + 4, itemY + 1);

					ctx.save();
					ctx.setFg(colors[col * 3 + i]);
					for (let j = 0; j < Math.floor(itemHeight / 3) - 2; j++) {
						for (let k = 0; k < colWidth - 8; k++) {
							ctx.drawChar('█', colX + 4 + k, itemY + 3 + j);
						}
					}
					ctx.restore();
				}
			}
		} else {
			// Three columns (desktop)
			const colWidth = Math.floor((width - 12) / 3);
			const itemHeight = Math.floor(contentHeight / 3);
			const colors = [
				{ rgb: [255, 107, 107] as [number, number, number] },
				{ rgb: [78, 205, 196] as [number, number, number] },
				{ rgb: [69, 183, 209] as [number, number, number] },
				{ rgb: [150, 206, 180] as [number, number, number] },
				{ rgb: [255, 234, 167] as [number, number, number] },
				{ rgb: [221, 160, 221] as [number, number, number] },
				{ rgb: [152, 216, 200] as [number, number, number] },
				{ rgb: [247, 220, 111] as [number, number, number] },
			];

			for (let col = 0; col < 3; col++) {
				const colX = x + 4 + col * (colWidth + 1);
				drawBox(ctx, { x: colX, y: contentY, width: colWidth, height: contentHeight });

				for (let i = 0; i < 3; i++) {
					const itemY = contentY + 1 + i * (itemHeight / 3);
					drawBox(ctx, { x: colX + 2, y: itemY, width: colWidth - 4, height: Math.floor(itemHeight / 3) - 1 });
					drawText(ctx, `D${col + 1}-${i + 1}`, colX + 4, itemY + 1);

					ctx.save();
					ctx.setFg(colors[col * 3 + i]);
					for (let j = 0; j < Math.floor(itemHeight / 3) - 2; j++) {
						for (let k = 0; k < colWidth - 8; k++) {
							ctx.drawChar('█', colX + 4 + k, itemY + 3 + j);
						}
					}
					ctx.restore();
				}
			}
		}
	}

	/**
	 * Render grid layout
	 */
	private renderGridLayout(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Grid Layout - Items in 2D grid', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;
		const cols = 4;
		const rows = 3;
		const cellWidth = Math.floor((width - 8) / cols);
		const cellHeight = Math.floor(contentHeight / rows);

		// Draw grid cells
		const colors = [
			{ rgb: [255, 107, 107] as [number, number, number] },
			{ rgb: [78, 205, 196] as [number, number, number] },
			{ rgb: [69, 183, 209] as [number, number, number] },
			{ rgb: [150, 206, 180] as [number, number, number] },
			{ rgb: [255, 234, 167] as [number, number, number] },
			{ rgb: [221, 160, 221] as [number, number, number] },
			{ rgb: [152, 216, 200] as [number, number, number] },
			{ rgb: [247, 220, 111] as [number, number, number] },
			{ rgb: [255, 107, 107] as [number, number, number] },
			{ rgb: [78, 205, 196] as [number, number, number] },
			{ rgb: [69, 183, 209] as [number, number, number] },
		];

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const cellX = x + 4 + col * (cellWidth + 1);
				const cellY = contentY + row * (cellHeight + 1);

				drawBox(ctx, { x: cellX, y: cellY, width: cellWidth, height: cellHeight });
				drawText(ctx, `[${row},${col}]`, cellX + 2, cellY + 1);

				ctx.save();
				ctx.setFg(colors[row * cols + col]);
				for (let j = 0; j < cellHeight - 3; j++) {
					for (let k = 0; k < cellWidth - 4; k++) {
						ctx.drawChar('█', cellX + 2 + k, cellY + 3 + j);
					}
				}
				ctx.restore();
			}
		}

		// Draw instructions
		drawText(ctx, 'Grid provides 2D positioning for items', x + 2, y + height - 2);
	}

	/**
	 * Render absolute layout
	 */
	private renderAbsoluteLayout(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Absolute Layout - Items positioned absolutely', x + 2, y + 1);

		const contentY = y + 3;
		const contentHeight = height - 5;
		const contentWidth = width - 8;

		// Draw container
		drawBox(ctx, { x: x + 4, y: contentY, width: contentWidth, height: contentHeight });

		// Draw absolutely positioned items
		const items = [
			{ x: 5, y: 2, w: 10, h: 4, color: { rgb: [255, 107, 107] as [number, number, number] }, label: '1' },
			{ x: 25, y: 2, w: 10, h: 4, color: { rgb: [78, 205, 196] as [number, number, number] }, label: '2' },
			{ x: 45, y: 2, w: 10, h: 4, color: { rgb: [69, 183, 209] as [number, number, number] }, label: '3' },
			{ x: 5, y: 8, w: 10, h: 4, color: { rgb: [150, 206, 180] as [number, number, number] }, label: '4' },
			{ x: 25, y: 8, w: 10, h: 4, color: { rgb: [255, 234, 167] as [number, number, number] }, label: '5' },
			{ x: 45, y: 8, w: 10, h: 4, color: { rgb: [221, 160, 221] as [number, number, number] }, label: '6' },
			{ x: 15, y: 14, w: 20, h: 4, color: { rgb: [152, 216, 200] as [number, number, number] }, label: '7' },
			{ x: 40, y: 14, w: 20, h: 4, color: { rgb: [247, 220, 111] as [number, number, number] }, label: '8' },
		];

		for (const item of items) {
			const itemX = x + 4 + item.x;
			const itemY = contentY + item.y;

			drawBox(ctx, { x: itemX, y: itemY, width: item.w, height: item.h });
			drawText(ctx, item.label, itemX + Math.floor(item.w / 2), itemY + 1);

			ctx.save();
			ctx.setFg(item.color);
			for (let j = 0; j < item.h - 2; j++) {
				for (let k = 0; k < item.w - 2; k++) {
					ctx.drawChar('█', itemX + 1 + k, itemY + 2 + j);
				}
			}
			ctx.restore();
		}

		// Draw instructions
		drawText(ctx, 'Items positioned with absolute coordinates', x + 2, y + height - 2);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-7 to switch layouts | q to quit', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				return; // Handled by parent

			case '1':
				this.state.activeLayout = 'flex-row';
				break;
			case '2':
				this.state.activeLayout = 'flex-column';
				break;
			case '3':
				this.state.activeLayout = 'flex-wrap';
				break;
			case '4':
				this.state.activeLayout = 'nested';
				break;
			case '5':
				this.state.activeLayout = 'responsive';
				break;
			case '6':
				this.state.activeLayout = 'grid';
				break;
			case '7':
				this.state.activeLayout = 'absolute';
				break;
		}
	}

	/**
	 * Get current state
	 */
	getState(): LayoutDemoState {
		return { ...this.state };
	}
}

/**
 * Create a layout demo instance
 */
export function createLayoutDemo(config?: LayoutDemoConfig): LayoutDemo {
	return new LayoutDemo(config);
}
