/**
 * ARIA Attributes Module
 *
 * Provides ARIA attribute helpers for the TUI framework.
 * Includes functions for setting accessible names, descriptions, roles, states, and values.
 *
 * @module accessibility/aria
 */

import type {Widget} from '../widgets/types.js';
import {
	AccessibilityRole,
	AccessibilityState,
	LiveRegionType,
	type AccessibilityProps,
	type AccessibilityValue,
} from './types.js';

/**
 * ARIA attribute namespace
 */
export const aria = {
	/**
	 * Sets the accessible name (label) for a widget
	 *
	 * @param widget - The widget
	 * @param label - The accessible name
	 * @returns Updated accessibility props
	 */
	label(widget: Widget, label: string): Partial<AccessibilityProps> {
		return {
			label,
		};
	},

	/**
	 * Sets the accessible description for a widget
	 *
	 * @param widget - The widget
	 * @param description - The accessible description
	 * @returns Updated accessibility props
	 */
	description(widget: Widget, description: string): Partial<AccessibilityProps> {
		return {
			description,
		};
	},

	/**
	 * Sets the accessible role for a widget
	 *
	 * @param widget - The widget
	 * @param role - The accessible role
	 * @returns Updated accessibility props
	 */
	role(widget: Widget, role: AccessibilityRole): Partial<AccessibilityProps> {
		return {
			role,
		};
	},

	/**
	 * Sets an accessibility state for a widget
	 *
	 * @param widget - The widget
	 * @param state - The accessibility state
	 * @param value - Whether the state is active
	 * @returns Updated accessibility props
	 */
	state(
		widget: Widget,
		state: AccessibilityState,
		value: boolean = true,
	): Partial<AccessibilityProps> {
		const existingStates = (widget.props as any).a11y?.states ?? [];
		const newStates = value
			? [...existingStates.filter((s: AccessibilityState) => s !== state), state]
			: existingStates.filter((s: AccessibilityState) => s !== state);

		return {
			states: newStates,
		};
	},

	/**
	 * Sets the accessibility value for a widget
	 *
	 * @param widget - The widget
	 * @param value - The accessibility value
	 * @returns Updated accessibility props
	 */
	value(widget: Widget, value: AccessibilityValue): Partial<AccessibilityProps> {
		return {
			value,
		};
	},

	/**
	 * Sets the widget as checked
	 *
	 * @param widget - The widget
	 * @param checked - Whether the widget is checked
	 * @returns Updated accessibility props
	 */
	checked(widget: Widget, checked: boolean | 'mixed' = true): Partial<AccessibilityProps> {
		return {
			checked,
		};
	},

	/**
	 * Sets the widget as selected
	 *
	 * @param widget - The widget
	 * @param selected - Whether the widget is selected
	 * @returns Updated accessibility props
	 */
	selected(widget: Widget, selected: boolean = true): Partial<AccessibilityProps> {
		return {
			selected,
		};
	},

	/**
	 * Sets the widget as expanded
	 *
	 * @param widget - The widget
	 * @param expanded - Whether the widget is expanded
	 * @returns Updated accessibility props
	 */
	expanded(widget: Widget, expanded: boolean = true): Partial<AccessibilityProps> {
		return {
			expanded,
		};
	},

	/**
	 * Sets the widget as disabled
	 *
	 * @param widget - The widget
	 * @param disabled - Whether the widget is disabled
	 * @returns Updated accessibility props
	 */
	disabled(widget: Widget, disabled: boolean = true): Partial<AccessibilityProps> {
		return {
			disabled,
		};
	},

	/**
	 * Sets the widget as required
	 *
	 * @param widget - The widget
	 * @param required - Whether the widget is required
	 * @returns Updated accessibility props
	 */
	required(widget: Widget, required: boolean = true): Partial<AccessibilityProps> {
		return {
			required,
		};
	},

	/**
	 * Sets the widget as read-only
	 *
	 * @param widget - The widget
	 * @param readonly - Whether the widget is read-only
	 * @returns Updated accessibility props
	 */
	readonly(widget: Widget, readonly: boolean = true): Partial<AccessibilityProps> {
		return {
			readonly,
		};
	},

	/**
	 * Sets the widget as invalid
	 *
	 * @param widget - The widget
	 * @param invalid - Whether the widget is invalid
	 * @param errorMessage - Optional error message
	 * @returns Updated accessibility props
	 */
	invalid(
		widget: Widget,
		invalid: boolean = true,
		errorMessage?: string,
	): Partial<AccessibilityProps> {
		return {
			invalid,
			errorMessage,
		};
	},

	/**
	 * Sets the widget as busy
	 *
	 * @param widget - The widget
	 * @param busy - Whether the widget is busy
	 * @returns Updated accessibility props
	 */
	busy(widget: Widget, busy: boolean = true): Partial<AccessibilityProps> {
		return {
			busy,
		};
	},

	/**
	 * Sets the widget as hidden from accessibility tree
	 *
	 * @param widget - The widget
	 * @param hidden - Whether the widget is hidden
	 * @returns Updated accessibility props
	 */
	hidden(widget: Widget, hidden: boolean = true): Partial<AccessibilityProps> {
		const existingStates = (widget.props as any).a11y?.states ?? [];
		const newStates = hidden
			? [...existingStates, AccessibilityState.HIDDEN]
			: existingStates.filter((s: AccessibilityState) => s !== AccessibilityState.HIDDEN);

		return {
			states: newStates,
		};
	},

	/**
	 * Sets the live region type for a widget
	 *
	 * @param widget - The widget
	 * @param liveRegion - The live region type
	 * @returns Updated accessibility props
	 */
	liveRegion(widget: Widget, liveRegion: LiveRegionType): Partial<AccessibilityProps> {
		return {
			liveRegion,
		};
	},

	/**
	 * Sets the widget as atomic (announced as a whole)
	 *
	 * @param widget - The widget
	 * @param atomic - Whether the widget is atomic
	 * @returns Updated accessibility props
	 */
	atomic(widget: Widget, atomic: boolean = true): Partial<AccessibilityProps> {
		return {
			atomic,
		};
	},

	/**
	 * Sets the heading level for a widget
	 *
	 * @param widget - The widget
	 * @param level - The heading level (1-6)
	 * @returns Updated accessibility props
	 */
	headingLevel(widget: Widget, level: number): Partial<AccessibilityProps> {
		return {
			level: Math.max(1, Math.min(6, level)),
		};
	},

	/**
	 * Sets the widget that this widget controls
	 *
	 * @param widget - The widget
	 * @param controls - The ID of the controlled widget
	 * @returns Updated accessibility props
	 */
	controls(widget: Widget, controls: string): Partial<AccessibilityProps> {
		return {
			controls,
		};
	},

	/**
	 * Sets the widget that describes this widget
	 *
	 * @param widget - The widget
	 * @param describedBy - The ID of the describing widget
	 * @returns Updated accessibility props
	 */
	describedBy(widget: Widget, describedBy: string): Partial<AccessibilityProps> {
		return {
			describedBy,
		};
	},

	/**
	 * Sets the widget that labels this widget
	 *
	 * @param widget - The widget
	 * @param labelledBy - The ID of the labelling widget
	 * @returns Updated accessibility props
	 */
	labelledBy(widget: Widget, labelledBy: string): Partial<AccessibilityProps> {
		return {
			labelledBy,
		};
	},

	/**
	 * Sets the current value for a widget
	 *
	 * @param widget - The widget
	 * @param now - The current value
	 * @returns Updated accessibility props
	 */
	valueNow(widget: Widget, now: number): Partial<AccessibilityProps> {
		return {
			valueNow: now,
		};
	},

	/**
	 * Sets the minimum value for a widget
	 *
	 * @param widget - The widget
	 * @param min - The minimum value
	 * @returns Updated accessibility props
	 */
	valueMin(widget: Widget, min: number): Partial<AccessibilityProps> {
		return {
			valueMin: min,
		};
	},

	/**
	 * Sets the maximum value for a widget
	 *
	 * @param widget - The widget
	 * @param max - The maximum value
	 * @returns Updated accessibility props
	 */
	valueMax(widget: Widget, max: number): Partial<AccessibilityProps> {
		return {
			valueMax: max,
		};
	},

	/**
	 * Sets the text representation of the value for a widget
	 *
	 * @param widget - The widget
	 * @param text - The text representation
	 * @returns Updated accessibility props
	 */
	valueText(widget: Widget, text: string): Partial<AccessibilityProps> {
		return {
			valueText: text,
		};
	},

	/**
	 * Sets the tab index for a widget
	 *
	 * @param widget - The widget
	 * @param tabIndex - The tab index
	 * @returns Updated accessibility props
	 */
	tabIndex(widget: Widget, tabIndex: number): Partial<AccessibilityProps> {
		return {
			tabIndex,
		};
	},

	/**
	 * Sets the widget as focusable
	 *
	 * @param widget - The widget
	 * @param focusable - Whether the widget is focusable
	 * @returns Updated accessibility props
	 */
	focusable(widget: Widget, focusable: boolean = true): Partial<AccessibilityProps> {
		return {
			focusable,
		};
	},

	/**
	 * Sets the hint for a widget
	 *
	 * @param widget - The widget
	 * @param hint - The hint text
	 * @returns Updated accessibility props
	 */
	hint(widget: Widget, hint: string): Partial<AccessibilityProps> {
		return {
			hint,
		};
	},
};

/**
 * Sets the accessible name (label) for a widget
 *
 * @param widget - The widget
 * @param label - The accessible name
 * @returns Updated accessibility props
 */
export function ariaLabel(widget: Widget, label: string): Partial<AccessibilityProps> {
	return aria.label(widget, label);
}

/**
 * Sets the accessible description for a widget
 *
 * @param widget - The widget
 * @param description - The accessible description
 * @returns Updated accessibility props
 */
export function ariaDescription(
	widget: Widget,
	description: string,
): Partial<AccessibilityProps> {
	return aria.description(widget, description);
}

/**
 * Sets the accessible role for a widget
 *
 * @param widget - The widget
 * @param role - The accessible role
 * @returns Updated accessibility props
 */
export function ariaRole(widget: Widget, role: AccessibilityRole): Partial<AccessibilityProps> {
	return aria.role(widget, role);
}

/**
 * Sets an accessibility state for a widget
 *
 * @param widget - The widget
 * @param state - The accessibility state
 * @param value - Whether the state is active
 * @returns Updated accessibility props
 */
export function ariaState(
	widget: Widget,
	state: AccessibilityState,
	value: boolean = true,
): Partial<AccessibilityProps> {
	return aria.state(widget, state, value);
}

/**
 * Sets the accessibility value for a widget
 *
 * @param widget - The widget
 * @param value - The accessibility value
 * @returns Updated accessibility props
 */
export function ariaValue(widget: Widget, value: AccessibilityValue): Partial<AccessibilityProps> {
	return aria.value(widget, value);
}

/**
 * Sets the widget as checked
 *
 * @param widget - The widget
 * @param checked - Whether the widget is checked
 * @returns Updated accessibility props
 */
export function ariaChecked(widget: Widget, checked: boolean | 'mixed' = true): Partial<AccessibilityProps> {
	return aria.checked(widget, checked);
}

/**
 * Sets the widget as selected
 *
 * @param widget - The widget
 * @param selected - Whether the widget is selected
 * @returns Updated accessibility props
 */
export function ariaSelected(widget: Widget, selected: boolean = true): Partial<AccessibilityProps> {
	return aria.selected(widget, selected);
}

/**
 * Sets the widget as expanded
 *
 * @param widget - The widget
 * @param expanded - Whether the widget is expanded
 * @returns Updated accessibility props
 */
export function ariaExpanded(widget: Widget, expanded: boolean = true): Partial<AccessibilityProps> {
	return aria.expanded(widget, expanded);
}

/**
 * Sets the widget as disabled
 *
 * @param widget - The widget
 * @param disabled - Whether the widget is disabled
 * @returns Updated accessibility props
 */
export function ariaDisabled(widget: Widget, disabled: boolean = true): Partial<AccessibilityProps> {
	return aria.disabled(widget, disabled);
}

/**
 * Sets the widget as required
 *
 * @param widget - The widget
 * @param required - Whether the widget is required
 * @returns Updated accessibility props
 */
export function ariaRequired(widget: Widget, required: boolean = true): Partial<AccessibilityProps> {
	return aria.required(widget, required);
}

/**
 * Sets the widget as read-only
 *
 * @param widget - The widget
 * @param readonly - Whether the widget is read-only
 * @returns Updated accessibility props
 */
export function ariaReadonly(widget: Widget, readonly: boolean = true): Partial<AccessibilityProps> {
	return aria.readonly(widget, readonly);
}

/**
 * Sets the widget as invalid
 *
 * @param widget - The widget
 * @param invalid - Whether the widget is invalid
 * @param errorMessage - Optional error message
 * @returns Updated accessibility props
 */
export function ariaInvalid(
	widget: Widget,
	invalid: boolean = true,
	errorMessage?: string,
): Partial<AccessibilityProps> {
	return aria.invalid(widget, invalid, errorMessage);
}

/**
 * Sets the widget as busy
 *
 * @param widget - The widget
 * @param busy - Whether the widget is busy
 * @returns Updated accessibility props
 */
export function ariaBusy(widget: Widget, busy: boolean = true): Partial<AccessibilityProps> {
	return aria.busy(widget, busy);
}

/**
 * Sets the widget as hidden from accessibility tree
 *
 * @param widget - The widget
 * @param hidden - Whether the widget is hidden
 * @returns Updated accessibility props
 */
export function ariaHidden(widget: Widget, hidden: boolean = true): Partial<AccessibilityProps> {
	return aria.hidden(widget, hidden);
}

/**
 * Sets the live region type for a widget
 *
 * @param widget - The widget
 * @param liveRegion - The live region type
 * @returns Updated accessibility props
 */
export function ariaLive(
	widget: Widget,
	liveRegion: LiveRegionType,
): Partial<AccessibilityProps> {
	return aria.liveRegion(widget, liveRegion);
}

/**
 * Sets the widget as atomic (announced as a whole)
 *
 * @param widget - The widget
 * @param atomic - Whether the widget is atomic
 * @returns Updated accessibility props
 */
export function ariaAtomic(widget: Widget, atomic: boolean = true): Partial<AccessibilityProps> {
	return aria.atomic(widget, atomic);
}

/**
 * Sets the heading level for a widget
 *
 * @param widget - The widget
 * @param level - The heading level (1-6)
 * @returns Updated accessibility props
 */
export function ariaHeadingLevel(widget: Widget, level: number): Partial<AccessibilityProps> {
	return aria.headingLevel(widget, level);
}

/**
 * Sets the widget that this widget controls
 *
 * @param widget - The widget
 * @param controls - The ID of the controlled widget
 * @returns Updated accessibility props
 */
export function ariaControls(widget: Widget, controls: string): Partial<AccessibilityProps> {
	return aria.controls(widget, controls);
}

/**
 * Sets the widget that describes this widget
 *
 * @param widget - The widget
 * @param describedBy - The ID of the describing widget
 * @returns Updated accessibility props
 */
export function ariaDescribedBy(
	widget: Widget,
	describedBy: string,
): Partial<AccessibilityProps> {
	return aria.describedBy(widget, describedBy);
}

/**
 * Sets the widget that labels this widget
 *
 * @param widget - The widget
 * @param labelledBy - The ID of the labelling widget
 * @returns Updated accessibility props
 */
export function ariaLabelledBy(
	widget: Widget,
	labelledBy: string,
): Partial<AccessibilityProps> {
	return aria.labelledBy(widget, labelledBy);
}

/**
 * Sets the current value for a widget
 *
 * @param widget - The widget
 * @param now - The current value
 * @returns Updated accessibility props
 */
export function ariaValueNow(widget: Widget, now: number): Partial<AccessibilityProps> {
	return aria.valueNow(widget, now);
}

/**
 * Sets the minimum value for a widget
 *
 * @param widget - The widget
 * @param min - The minimum value
 * @returns Updated accessibility props
 */
export function ariaValueMin(widget: Widget, min: number): Partial<AccessibilityProps> {
	return aria.valueMin(widget, min);
}

/**
 * Sets the maximum value for a widget
 *
 * @param widget - The widget
 * @param max - The maximum value
 * @returns Updated accessibility props
 */
export function ariaValueMax(widget: Widget, max: number): Partial<AccessibilityProps> {
	return aria.valueMax(widget, max);
}

/**
 * Sets the text representation of the value for a widget
 *
 * @param widget - The widget
 * @param text - The text representation
 * @returns Updated accessibility props
 */
export function ariaValueText(widget: Widget, text: string): Partial<AccessibilityProps> {
	return aria.valueText(widget, text);
}

/**
 * Sets the tab index for a widget
 *
 * @param widget - The widget
 * @param tabIndex - The tab index
 * @returns Updated accessibility props
 */
export function ariaTabIndex(widget: Widget, tabIndex: number): Partial<AccessibilityProps> {
	return aria.tabIndex(widget, tabIndex);
}

/**
 * Sets the widget as focusable
 *
 * @param widget - The widget
 * @param focusable - Whether the widget is focusable
 * @returns Updated accessibility props
 */
export function ariaFocusable(widget: Widget, focusable: boolean = true): Partial<AccessibilityProps> {
	return aria.focusable(widget, focusable);
}

/**
 * Sets the hint for a widget
 *
 * @param widget - The widget
 * @param hint - The hint text
 * @returns Updated accessibility props
 */
export function ariaHint(widget: Widget, hint: string): Partial<AccessibilityProps> {
	return aria.hint(widget, hint);
}
