/**
 * Text Widget Module
 *
 * Provides the TextWidget class for displaying text content.
 * Supports text wrapping, truncation, alignment, and styling.
 *
 * @module widgets/text
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
	WidgetStyle,
} from './types.js';
import {WidgetEventType} from './types.js';
import type {Color, CellStyles} from '../rendering/cell.js';
import type {ScreenBuffer} from '../rendering/buffer.js';
import {createCell} from '../rendering/cell.js';

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right';

/**
 * Text wrapping mode
 */
export type TextWrapMode = 'none' | 'wrap' | 'truncate' | 'truncate-ellipsis';

/**
 * Props specific to the Text widget
 */
export interface TextWidgetProps extends WidgetProps {
	/** Text content to display */
	text: string;

	/** Text color */
	color?: Color;

	/** Background color */
	backgroundColor?: Color;

	/** Text styles (bold, italic, etc.) */
	styles?: CellStyles;

	/** Text alignment */
	alignment?: TextAlignment;

	/** Text wrapping mode */
	wrap?: TextWrapMode;

	/** Maximum number of lines to display */
	maxLines?: number;
}

/**
 * State specific to the Text widget
 */
export interface TextWidgetState extends WidgetState {
	/** Wrapped lines cache */
	wrappedLines?: string[];

	/** Whether text was truncated */
	isTruncated?: boolean;
}

/**
 * Text widget for displaying text content
 *
 * Features:
 * - Text wrapping with multiple modes
 * - Text truncation with ellipsis
 * - Horizontal alignment (left, center, right)
 * - Custom colors and styles
 * - Multi-line support
 */
export class TextWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'text';

	/** Default props for text widgets */
	static defaultProps: Required<TextWidgetProps> = {
		...BaseWidget.defaultProps,
		text: '',
		color: 'default',
		backgroundColor: 'default',
		styles: {},
		alignment: 'left',
		wrap: 'none',
		maxLines: Infinity,
	};

	/**
	 * Create a new text widget
	 *
	 * @param props - Text widget props
	 */
	constructor(props: TextWidgetProps) {
		super(props);
	}

	/**
	 * Get text-specific props
	 */
	get textProps(): Required<TextWidgetProps> {
		return this._props as Required<TextWidgetProps>;
	}

	/**
	 * Get text-specific state
	 */
	get textState(): TextWidgetState {
		return this._state as TextWidgetState;
	}

	/**
	 * Set the text content
	 *
	 * @param text - New text content
	 */
	setText(text: string): void {
		if (this.textProps.text !== text) {
			this.update({text});
			this.setState({wrappedLines: undefined, isTruncated: false});
		}
	}

	/**
	 * Get the text content
	 */
	getText(): string {
		return this.textProps.text;
	}

	/**
	 * Render the text widget
	 *
	 * @param context - Widget context for rendering
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {text, color, backgroundColor, styles, alignment, wrap, maxLines} =
			this.textProps;

		if (!text) {
			return;
		}

		// Get content area (accounting for padding)
		const contentWidth = bounds.width;
		const contentHeight = bounds.height;

		if (contentWidth <= 0 || contentHeight <= 0) {
			return;
		}

		// Process text based on wrap mode
		const lines = this.processText(
			text,
			contentWidth,
			contentHeight,
			wrap,
			maxLines,
		);

		// Render each line
		for (let i = 0; i < lines.length && i < contentHeight; i++) {
			const line = lines[i];
			const y = bounds.y + i;

			// Skip if outside bounds
			if (y >= bounds.y + bounds.height) {
				break;
			}

			// Calculate x position based on alignment
			let x = bounds.x;
			const lineWidth = this.measureText(line);

			switch (alignment) {
				case 'center':
					x = bounds.x + Math.floor((contentWidth - lineWidth) / 2);
					break;
				case 'right':
					x = bounds.x + (contentWidth - lineWidth);
					break;
				case 'left':
				default:
					x = bounds.x;
					break;
			}

			// Render the line
			this.renderLine(context, line, x, y, color, backgroundColor, styles);
		}
	}

	/**
	 * Process text based on wrap mode
	 */
	private processText(
		text: string,
		maxWidth: number,
		maxHeight: number,
		wrap: TextWrapMode,
		maxLines: number,
	): string[] {
		switch (wrap) {
			case 'wrap':
				return this.wrapText(text, maxWidth, maxLines);
			case 'truncate':
				return this.truncateText(text, maxWidth, maxLines);
			case 'truncate-ellipsis':
				return this.truncateWithEllipsis(text, maxWidth, maxLines);
			case 'none':
			default:
				return text.split('\n').slice(0, maxLines);
		}
	}

	/**
	 * Wrap text to fit within maxWidth
	 */
	private wrapText(text: string, maxWidth: number, maxLines: number): string[] {
		const lines: string[] = [];
		const paragraphs = text.split('\n');

		for (const paragraph of paragraphs) {
			if (lines.length >= maxLines) {
				break;
			}

			let currentLine = '';
			const words = paragraph.split(' ');

			for (const word of words) {
				const testLine = currentLine ? `${currentLine} ${word}` : word;
				const testWidth = this.measureText(testLine);

				if (testWidth <= maxWidth) {
					currentLine = testLine;
				} else {
					if (currentLine) {
						lines.push(currentLine);
						if (lines.length >= maxLines) {
							break;
						}
					}
					currentLine = word;
				}
			}

			if (currentLine && lines.length < maxLines) {
				lines.push(currentLine);
			}
		}

		return lines;
	}

	/**
	 * Truncate text to fit within maxWidth
	 */
	private truncateText(
		text: string,
		maxWidth: number,
		maxLines: number,
	): string[] {
		const lines = text.split('\n').slice(0, maxLines);

		return lines.map(line => {
			if (this.measureText(line) <= maxWidth) {
				return line;
			}

			let truncated = line;
			while (
				truncated.length > 0 &&
				this.measureText(truncated) > maxWidth
			) {
				truncated = truncated.slice(0, -1);
			}

			return truncated;
		});
	}

	/**
	 * Truncate text with ellipsis
	 */
	private truncateWithEllipsis(
		text: string,
		maxWidth: number,
		maxLines: number,
	): string[] {
		const lines = text.split('\n').slice(0, maxLines);

		return lines.map(line => {
			if (this.measureText(line) <= maxWidth) {
				return line;
			}

			const ellipsis = '...';
			let truncated = line;

			while (
				truncated.length > 0 &&
				this.measureText(truncated + ellipsis) > maxWidth
			) {
				truncated = truncated.slice(0, -1);
			}

			return truncated + ellipsis;
		});
	}

	/**
	 * Measure the width of text in cells
	 */
	private measureText(text: string): number {
		// Simple measurement - each character is 1 cell
		// TODO: Handle wide characters (CJK, etc.)
		return text.length;
	}

	/**
	 * Render a single line of text
	 */
	private renderLine(
		context: WidgetContext,
		text: string,
		x: number,
		y: number,
		fg: Color,
		bg: Color,
		styles: CellStyles,
	): void {
		// This would integrate with the rendering engine
		// For now, this is a placeholder that would be called by the renderer
		// The actual implementation would write to a ScreenBuffer
	}

	/**
	 * Handle events (text widget is mostly passive)
	 */
	protected onEvent(event: WidgetEvent): boolean {
		// Text widget doesn't handle most events
		return false;
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Text widgets are not focusable by default
		return false;
	}
}
