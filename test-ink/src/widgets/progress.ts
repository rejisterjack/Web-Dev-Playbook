/**
 * Progress Bar Widget Module
 *
 * Provides the ProgressBarWidget class for displaying progress.
 * Supports determinate and indeterminate progress modes.
 *
 * @module widgets/progress
 */

import {BaseWidget} from './base.js';
import type {
	WidgetProps,
	WidgetState,
	WidgetContext,
	WidgetEvent,
} from './types.js';
import type {Color} from '../rendering/cell.js';

/**
 * Progress bar variant
 */
export type ProgressVariant = 'determinate' | 'indeterminate';

/**
 * Props specific to the ProgressBar widget
 */
export interface ProgressBarWidgetProps extends WidgetProps {
	/** Current value */
	value?: number;

	/** Maximum value */
	max?: number;

	/** Minimum value */
	min?: number;

	/** Whether to show percentage label */
	showLabel?: boolean;

	/** Progress variant */
	variant?: ProgressVariant;

	/** Progress bar width */
	width?: number;

	/** Fill character */
	fillChar?: string;

	/** Empty character */
	emptyChar?: string;
}

/**
 * State specific to the ProgressBar widget
 */
export interface ProgressBarWidgetState extends WidgetState {
	/** Animation frame for indeterminate mode */
	animationFrame: number;

	/** Last animation timestamp */
	lastAnimationTime: number;
}

/**
 * Progress bar widget for displaying progress
 *
 * Features:
 * - Determinate mode (0-100%)
 * - Indeterminate mode (animated)
 * - Customizable characters and colors
 * - Optional percentage label
 */
export class ProgressBarWidget extends BaseWidget {
	/** Widget type */
	readonly type = 'progress';

	/** Animation speed in ms */
	static readonly ANIMATION_SPEED = 100;

	/** Default props for progress bar widgets */
	static defaultProps: Required<ProgressBarWidgetProps> = {
		...BaseWidget.defaultProps,
		value: 0,
		max: 100,
		min: 0,
		showLabel: true,
		variant: 'determinate',
		width: 20,
		fillChar: '█',
		emptyChar: '░',
	};

	/**
	 * Create a new progress bar widget
	 *
	 * @param props - Progress bar widget props
	 */
	constructor(props: ProgressBarWidgetProps = {}) {
		super(props);
		this._state = {
			...this._state,
			animationFrame: 0,
			lastAnimationTime: 0,
		};
	}

	/**
	 * Get progress bar-specific props
	 */
	get progressProps(): Required<ProgressBarWidgetProps> {
		return this._props as Required<ProgressBarWidgetProps>;
	}

	/**
	 * Get progress bar-specific state
	 */
	get progressState(): ProgressBarWidgetState {
		return this._state as ProgressBarWidgetState;
	}

	/**
	 * Get the current value
	 */
	getValue(): number {
		return this.progressProps.value;
	}

	/**
	 * Set the current value
	 *
	 * @param value - New value
	 */
	setValue(value: number): void {
		const {min, max} = this.progressProps;
		const clampedValue = Math.max(min, Math.min(value, max));

		if (this.progressProps.value !== clampedValue) {
			this.update({...this._props, value: clampedValue} as WidgetProps);
		}
	}

	/**
	 * Get the percentage (0-100)
	 */
	getPercentage(): number {
		const {value, min, max} = this.progressProps;
		if (max === min) {
			return 0;
		}
		return ((value - min) / (max - min)) * 100;
	}

	/**
	 * Increment the value
	 *
	 * @param amount - Amount to increment
	 */
	increment(amount = 1): void {
		this.setValue(this.progressProps.value + amount);
	}

	/**
	 * Decrement the value
	 *
	 * @param amount - Amount to decrement
	 */
	decrement(amount = 1): void {
		this.setValue(this.progressProps.value - amount);
	}

	/**
	 * Set progress to complete (100%)
	 */
	complete(): void {
		this.setValue(this.progressProps.max);
	}

	/**
	 * Reset progress to minimum
	 */
	reset(): void {
		this.setValue(this.progressProps.min);
		this.setState({animationFrame: 0});
	}

	/**
	 * Check if progress is complete
	 */
	isComplete(): boolean {
		return this.progressProps.value >= this.progressProps.max;
	}

	/**
	 * Render the progress bar widget
	 */
	render(context: WidgetContext): void {
		if (!this._layoutNode) {
			return;
		}

		const bounds = this.getBounds();
		if (!bounds) {
			return;
		}

		const {variant, width, showLabel, fillChar, emptyChar} =
			this.progressProps;

		let displayText: string;

		if (variant === 'indeterminate') {
			displayText = this.renderIndeterminate(width, fillChar, emptyChar);
		} else {
			displayText = this.renderDeterminate(width, fillChar, emptyChar);
		}

		// Add label if enabled
		if (showLabel) {
			const percentage = Math.round(this.getPercentage());
			displayText += ` ${percentage}%`;
		}

		// Actual rendering would happen here
	}

	/**
	 * Render determinate progress bar
	 */
	private renderDeterminate(
		width: number,
		fillChar: string,
		emptyChar: string,
	): string {
		const percentage = this.getPercentage() / 100;
		const filledLength = Math.round(width * percentage);
		const emptyLength = width - filledLength;

		return fillChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
	}

	/**
	 * Render indeterminate progress bar
	 */
	private renderIndeterminate(
		width: number,
		fillChar: string,
		emptyChar: string,
	): string {
		const {animationFrame} = this.progressState;
		const segmentLength = Math.max(3, Math.floor(width / 4));

		// Create a moving segment effect
		const position = animationFrame % (width + segmentLength);
		const result: string[] = [];

		for (let i = 0; i < width; i++) {
			const segmentStart = position - segmentLength;
			const segmentEnd = position;

			if (i >= segmentStart && i < segmentEnd) {
				result.push(fillChar);
			} else {
				result.push(emptyChar);
			}
		}

		return result.join('');
	}

	/**
	 * Update animation frame for indeterminate mode
	 */
	updateAnimation(): void {
		if (this.progressProps.variant !== 'indeterminate') {
			return;
		}

		const now = Date.now();
		const {lastAnimationTime} = this.progressState;

		if (now - lastAnimationTime >= ProgressBarWidget.ANIMATION_SPEED) {
			this.setState({
				animationFrame: this.progressState.animationFrame + 1,
				lastAnimationTime: now,
			});
			this.invalidate();
		}
	}

	/**
	 * Get colors based on progress
	 */
	getColors(): {fg: Color; bg: Color} {
		const percentage = this.getPercentage();

		if (percentage < 30) {
			return {fg: {rgb: [239, 68, 68]}, bg: 'default'}; // Red
		} else if (percentage < 70) {
			return {fg: {rgb: [234, 179, 8]}, bg: 'default'}; // Yellow
		} else {
			return {fg: {rgb: [34, 197, 94]}, bg: 'default'}; // Green
		}
	}

	/**
	 * Handle events (progress bar is mostly passive)
	 */
	protected onEvent(event: WidgetEvent): boolean {
		// Progress bar doesn't handle most events
		return false;
	}

	/**
	 * Check if this widget can receive focus
	 */
	isFocusable(): boolean {
		// Progress bars are not focusable by default
		return false;
	}
}
