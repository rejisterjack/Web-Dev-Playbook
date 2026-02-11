/**
 * Accessibility Demo
 *
 * Showcase accessibility features including screen reader output,
 * keyboard navigation, high contrast mode, text scaling, and reduced motion.
 *
 * @module demo/accessibility
 */

import type { RenderContext } from '../rendering/context.js';
import { drawBox, drawText, drawSeparator, drawClear, drawCheckbox } from '../rendering/primitives.js';

/**
 * Accessibility feature for demo
 */
export type AccessibilityFeature =
	| 'screen-reader'
	| 'keyboard-nav'
	| 'high-contrast'
	| 'text-scaling'
	| 'reduced-motion'
	| 'focus-indicator'
	| 'aria-labels';

/**
 * Accessibility demo state
 */
export interface AccessibilityDemoState {
	/** Currently active feature */
	activeFeature: AccessibilityFeature;
	/** Screen reader enabled */
	screenReaderEnabled: boolean;
	/** High contrast enabled */
	highContrastEnabled: boolean;
	/** Text scaling level */
	textScaling: number;
	/** Reduced motion enabled */
	reducedMotionEnabled: boolean;
	/** Focus indicator style */
	focusIndicatorStyle: 'box' | 'underline' | 'bracket';
	/** Current focused element */
	focusedElement: number;
	/** Screen reader announcements */
	announcements: Array<{ message: string; priority: 'low' | 'medium' | 'high'; timestamp: number }>;
}

/**
 * Accessibility demo configuration
 */
export interface AccessibilityDemoConfig {
	/** Enable screen reader simulation */
	screenReaderEnabled?: boolean;
}

/**
 * Accessibility demo component
 */
export class AccessibilityDemo {
	private state: AccessibilityDemoState;
	private config: Required<AccessibilityDemoConfig>;

	constructor(config: AccessibilityDemoConfig = {}) {
		this.config = {
			screenReaderEnabled: config.screenReaderEnabled ?? true,
		};

		this.state = {
			activeFeature: 'screen-reader',
			screenReaderEnabled: this.config.screenReaderEnabled,
			highContrastEnabled: false,
			textScaling: 100,
			reducedMotionEnabled: false,
			focusIndicatorStyle: 'box',
			focusedElement: 0,
			announcements: [],
		};
	}

	/**
	 * Render accessibility demo
	 */
	render(ctx: RenderContext, width: number, height: number): void {
		// Clear screen
		drawClear(ctx, { x: 0, y: 0, width, height });

		// Draw header
		this.renderHeader(ctx, width);

		// Draw feature navigation
		this.renderFeatureNavigation(ctx, width);

		// Draw active feature
		this.renderActiveFeature(ctx, width, height);

		// Draw footer
		this.renderFooter(ctx, width, height);
	}

	/**
	 * Render header
	 */
	private renderHeader(ctx: RenderContext, width: number): void {
		drawBox(ctx, { x: 0, y: 0, width, height: 3 });
		drawText(ctx, 'Accessibility Demo - Inclusive Design', 2, 1);
	}

	/**
	 * Render feature navigation
	 */
	private renderFeatureNavigation(ctx: RenderContext, width: number): void {
		const features: { key: string; type: AccessibilityFeature }[] = [
			{ key: '1', type: 'screen-reader' },
			{ key: '2', type: 'keyboard-nav' },
			{ key: '3', type: 'high-contrast' },
			{ key: '4', type: 'text-scaling' },
			{ key: '5', type: 'reduced-motion' },
			{ key: '6', type: 'focus-indicator' },
			{ key: '7', type: 'aria-labels' },
		];

		const navY = 4;
		drawBox(ctx, { x: 0, y: navY, width, height: 2 });
		drawText(ctx, 'Features: ', 2, navY + 1);

		let xPos = 12;
		for (const feature of features) {
			const isActive = feature.type === this.state.activeFeature;
			const label = `${feature.key}:${feature.type}`;
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
	 * Render active feature
	 */
	private renderActiveFeature(ctx: RenderContext, width: number, height: number): void {
		const featureY = 7;
		const featureHeight = height - 10;
		const featureWidth = width - 4;

		switch (this.state.activeFeature) {
			case 'screen-reader':
				this.renderScreenReaderFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'keyboard-nav':
				this.renderKeyboardNavFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'high-contrast':
				this.renderHighContrastFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'text-scaling':
				this.renderTextScalingFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'reduced-motion':
				this.renderReducedMotionFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'focus-indicator':
				this.renderFocusIndicatorFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
			case 'aria-labels':
				this.renderAriaLabelsFeature(ctx, 2, featureY, featureWidth, featureHeight);
				break;
		}
	}

	/**
	 * Render screen reader feature
	 */
	private renderScreenReaderFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Screen Reader - Text-to-Speech Output', x + 2, y + 1);

		const contentY = y + 3;

		// Draw toggle
		drawCheckbox(ctx, x + 4, contentY, this.state.screenReaderEnabled);
		drawText(ctx, `Screen Reader: ${this.state.screenReaderEnabled ? 'ON' : 'OFF'}`, x + 7, contentY);

		// Draw recent announcements
		drawText(ctx, 'Recent Announcements:', x + 4, contentY + 2);

		const maxAnnouncements = Math.min(this.state.announcements.length, height - 7);
		for (let i = 0; i < maxAnnouncements; i++) {
			const announcement = this.state.announcements[this.state.announcements.length - 1 - i];
			const annY = contentY + 3 + i * 2;

			const priorityColor =
				announcement.priority === 'high' ? { rgb: [255, 107, 107] as [number, number, number] } :
				announcement.priority === 'medium' ? { rgb: [255, 234, 167] as [number, number, number] } :
				{ rgb: [150, 206, 180] as [number, number, number] };

			ctx.save();
			ctx.setFg(priorityColor);
			drawText(ctx, `[${announcement.priority.toUpperCase()}]`, x + 4, annY);
			ctx.restore();

			const maxWidth = width - 20;
			let message = announcement.message;
			if (message.length > maxWidth) {
				message = message.substring(0, maxWidth - 3) + '...';
			}
			drawText(ctx, message, x + 10, annY);
		}

		// Draw instructions
		drawText(ctx, 'Press Space to toggle screen reader', x + 2, y + height - 2);
	}

	/**
	 * Render keyboard navigation feature
	 */
	private renderKeyboardNavFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Keyboard Navigation - Tab & Arrow Keys', x + 2, y + 1);

		const contentY = y + 3;

		// Draw focusable elements
		const elements = ['Button 1', 'Button 2', 'Button 3', 'Input Field', 'Checkbox', 'List Item'];
		const elementWidth = Math.floor((width - 8) / elements.length);

		for (let i = 0; i < elements.length; i++) {
			const elementX = x + 4 + i * (elementWidth + 1);
			const elementY = contentY + Math.floor(i / 2) * 4;

			// Draw focus indicator
			if (i === this.state.focusedElement) {
				this.drawFocusIndicator(ctx, elementX, elementY, elementWidth);
			}

			drawBox(ctx, { x: elementX, y: elementY, width: elementWidth, height: 3 });
			drawText(ctx, elements[i], elementX + 2, elementY + 1);
		}

		// Draw instructions
		drawText(ctx, 'Tab/Arrows to navigate | Enter to activate', x + 2, y + height - 2);
	}

	/**
	 * Draw focus indicator
	 */
	private drawFocusIndicator(ctx: RenderContext, x: number, y: number, width: number): void {
		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
		ctx.setStyles({ bold: true });

		switch (this.state.focusIndicatorStyle) {
			case 'box':
				drawBox(ctx, { x, y, width, height: 3 });
				break;
			case 'underline':
				for (let i = 0; i < width; i++) {
					ctx.drawChar('─', x + i, y + 2);
				}
				break;
			case 'bracket':
				ctx.drawChar('[', x, y);
				ctx.drawChar(']', x + width - 1, y);
				break;
		}

		ctx.restore();
	}

	/**
	 * Render high contrast feature
	 */
	private renderHighContrastFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'High Contrast Mode - Enhanced Visibility', x + 2, y + 1);

		const contentY = y + 3;

		// Draw toggle
		drawCheckbox(ctx, x + 4, contentY, this.state.highContrastEnabled);
		drawText(ctx, `High Contrast: ${this.state.highContrastEnabled ? 'ON' : 'OFF'}`, x + 7, contentY);

		// Draw sample UI with high contrast
		drawText(ctx, 'Sample UI (High Contrast):', x + 4, contentY + 2);

		if (this.state.highContrastEnabled) {
			ctx.save();
			ctx.setFg({ rgb: [255, 255, 255] as [number, number, number] });
			ctx.setBg({ rgb: [0, 0, 0] as [number, number, number] });
			drawBox(ctx, { x: x + 4, y: contentY + 4, width: width - 8, height: 6 });
			drawText(ctx, 'Button  [X]', x + 6, contentY + 6);
			drawText(ctx, 'Input: [________]', x + 6, contentY + 7);
			drawText(ctx, '[✓] Checkbox', x + 6, contentY + 8);
			ctx.restore();
		} else {
			drawBox(ctx, { x: x + 4, y: contentY + 4, width: width - 8, height: 6 });
			drawText(ctx, 'Button  [X]', x + 6, contentY + 6);
			drawText(ctx, 'Input: [________]', x + 6, contentY + 7);
			drawText(ctx, '[✓] Checkbox', x + 6, contentY + 8);
		}

		// Draw instructions
		drawText(ctx, 'Press Space to toggle high contrast', x + 2, y + height - 2);
	}

	/**
	 * Render text scaling feature
	 */
	private renderTextScalingFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Text Scaling - Adjustable Font Size', x + 2, y + 1);

		const contentY = y + 3;

		// Draw scaling control
		drawText(ctx, 'Text Size:', x + 4, contentY);
		drawText(ctx, `${this.state.textScaling}%`, x + 15, contentY);

		// Draw scale bar
		const barWidth = width - 20;
		const barX = x + 4;
		const barY = contentY + 2;
		const filledWidth = Math.floor(barWidth * (this.state.textScaling / 200));

		ctx.save();
		ctx.setFg({ rgb: [78, 205, 196] as [number, number, number] });
		for (let i = 0; i < filledWidth; i++) {
			ctx.drawChar('█', barX + i, barY);
		}
		ctx.restore();

		ctx.save();
		ctx.setFg({ rgb: [150, 150, 150] as [number, number, number] });
		for (let i = filledWidth; i < barWidth; i++) {
			ctx.drawChar('░', barX + i, barY);
		}
		ctx.restore();

		// Draw sample text at different sizes
		drawText(ctx, 'Sample Text:', x + 4, contentY + 4);

		const sizes = [75, 100, 125, 150, 200];
		for (let i = 0; i < sizes.length; i++) {
			const sizeY = contentY + 5 + Math.floor(i / 3) * 2;
			const sampleText = i === this.state.textScaling / 25 ? '→ ' : '  ';
			drawText(ctx, `${sizes[i]}% ${sampleText} Sample Text`, x + 4, sizeY);
		}

		// Draw instructions
		drawText(ctx, 'Arrow keys to adjust text size', x + 2, y + height - 2);
	}

	/**
	 * Render reduced motion feature
	 */
	private renderReducedMotionFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Reduced Motion - Disable Animations', x + 2, y + 1);

		const contentY = y + 3;

		// Draw toggle
		drawCheckbox(ctx, x + 4, contentY, this.state.reducedMotionEnabled);
		drawText(ctx, `Reduced Motion: ${this.state.reducedMotionEnabled ? 'ON' : 'OFF'}`, x + 7, contentY);

		// Draw animation demo
		drawText(ctx, 'Animation Demo:', x + 4, contentY + 2);

		const animY = contentY + 4;
		const animWidth = width - 8;

		if (this.state.reducedMotionEnabled) {
			// Static elements
			drawBox(ctx, { x: x + 4, y: animY, width: 15, height: 3 });
			drawText(ctx, 'Static', x + 6, animY + 1);

			drawBox(ctx, { x: x + 21, y: animY, width: 15, height: 3 });
			drawText(ctx, 'Static', x + 23, animY + 1);
		} else {
			// Animated elements (simulated)
			const animChars = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
			const char = animChars[Math.floor(Date.now() / 200) % animChars.length];

			drawBox(ctx, { x: x + 4, y: animY, width: 15, height: 3 });
			drawText(ctx, char, x + 7, animY + 1);

			drawBox(ctx, { x: x + 21, y: animY, width: 15, height: 3 });
			drawText(ctx, char, x + 24, animY + 1);
		}

		// Draw instructions
		drawText(ctx, 'Press Space to toggle reduced motion', x + 2, y + height - 2);
	}

	/**
	 * Render focus indicator feature
	 */
	private renderFocusIndicatorFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'Focus Indicator - Visual Focus Tracking', x + 2, y + 1);

		const contentY = y + 3;

		// Draw style selector
		drawText(ctx, 'Focus Style:', x + 4, contentY);
		drawText(ctx, this.state.focusIndicatorStyle, x + 18, contentY);

		// Draw sample with current style
		drawText(ctx, 'Sample:', x + 4, contentY + 2);

		const sampleY = contentY + 4;
		const sampleWidth = width - 8;

		// Draw focusable elements
		const elements = ['Button 1', 'Button 2', 'Button 3'];
		const elementWidth = Math.floor(sampleWidth / elements.length);

		for (let i = 0; i < elements.length; i++) {
			const elementX = x + 4 + i * (elementWidth + 1);
			const elementY = sampleY + Math.floor(i / 2) * 3;

			if (i === this.state.focusedElement) {
				this.drawFocusIndicator(ctx, elementX, elementY, elementWidth);
			}

			drawBox(ctx, { x: elementX, y: elementY, width: elementWidth, height: 3 });
			drawText(ctx, elements[i], elementX + 2, elementY + 1);
		}

		// Draw style options
		drawText(ctx, 'Styles: box, underline, bracket (Tab to switch)', x + 2, y + height - 2);
	}

	/**
	 * Render ARIA labels feature
	 */
	private renderAriaLabelsFeature(ctx: RenderContext, x: number, y: number, width: number, height: number): void {
		drawBox(ctx, { x, y, width, height });
		drawText(ctx, 'ARIA Labels - Screen Reader Descriptions', x + 2, y + 1);

		const contentY = y + 3;

		// Draw ARIA attributes examples
		const examples = [
			{ element: 'Button', role: 'button', label: 'Submit form' },
			{ element: 'Input', role: 'textbox', label: 'Enter your name' },
			{ element: 'Checkbox', role: 'checkbox', label: 'Agree to terms' },
			{ element: 'Link', role: 'link', label: 'View documentation' },
			{ element: 'Progress', role: 'progressbar', label: 'Loading progress' },
		{ element: 'Alert', role: 'alert', label: 'Important message' },
		];

		for (let i = 0; i < examples.length; i++) {
			const exampleY = contentY + i * 3;
			const example = examples[i];

			drawText(ctx, `Element: ${example.element}`, x + 4, exampleY);
			drawText(ctx, `Role: ${example.role}`, x + 4, exampleY + 1);
			drawText(ctx, `Label: ${example.label}`, x + 4, exampleY + 2);
		}

		// Draw instructions
		drawText(ctx, 'ARIA attributes provide context for assistive technologies', x + 2, y + height - 2);
	}

	/**
	 * Render footer
	 */
	private renderFooter(ctx: RenderContext, width: number, height: number): void {
		const footerY = height - 1;
		drawSeparator(ctx, 0, footerY - 1, width);
		drawText(ctx, 'Press 1-7 to switch features | q to quit', 2, footerY);
	}

	/**
	 * Handle key input
	 */
	handleKey(key: string): void {
		switch (key) {
			case 'q':
				return; // Handled by parent

			case '1':
				this.state.activeFeature = 'screen-reader';
				break;
			case '2':
				this.state.activeFeature = 'keyboard-nav';
				break;
			case '3':
				this.state.activeFeature = 'high-contrast';
				break;
			case '4':
				this.state.activeFeature = 'text-scaling';
				break;
			case '5':
				this.state.activeFeature = 'reduced-motion';
				break;
			case '6':
				this.state.activeFeature = 'focus-indicator';
				break;
			case '7':
				this.state.activeFeature = 'aria-labels';
				break;
			case ' ':
				this.state.screenReaderEnabled = !this.state.screenReaderEnabled;
				break;
			case 'h':
				this.state.highContrastEnabled = !this.state.highContrastEnabled;
				break;
			case 'r':
				this.state.reducedMotionEnabled = !this.state.reducedMotionEnabled;
				break;
			case 'up':
				if (this.state.activeFeature === 'text-scaling') {
					this.state.textScaling = Math.min(200, this.state.textScaling + 25);
				} else if (this.state.activeFeature === 'keyboard-nav' || this.state.activeFeature === 'focus-indicator') {
					this.state.focusedElement = Math.max(0, this.state.focusedElement - 1);
				}
				break;
			case 'down':
				if (this.state.activeFeature === 'text-scaling') {
					this.state.textScaling = Math.max(50, this.state.textScaling - 25);
				} else if (this.state.activeFeature === 'keyboard-nav' || this.state.activeFeature === 'focus-indicator') {
					this.state.focusedElement = Math.min(2, this.state.focusedElement + 1);
				}
				break;
			case 'tab':
				if (this.state.activeFeature === 'focus-indicator') {
					this.state.focusIndicatorStyle = this.state.focusIndicatorStyle === 'box' ? 'underline' : this.state.focusIndicatorStyle === 'underline' ? 'bracket' : 'box';
				}
				break;
		}

		// Add screen reader announcement
		if (this.state.screenReaderEnabled) {
			this.state.announcements.push({
				message: `Feature: ${this.state.activeFeature}`,
				priority: 'medium',
				timestamp: Date.now(),
			});
			if (this.state.announcements.length > 10) {
				this.state.announcements.shift();
			}
		}
	}

	/**
	 * Get current state
	 */
	getState(): AccessibilityDemoState {
		return { ...this.state };
	}
}

/**
 * Create an accessibility demo instance
 */
export function createAccessibilityDemo(config?: AccessibilityDemoConfig): AccessibilityDemo {
	return new AccessibilityDemo(config);
}
