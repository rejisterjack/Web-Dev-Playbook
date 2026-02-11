/**
 * Theme Manager Module
 * 
 * Provides the ThemeManager class for managing themes in the TUI framework.
 * Supports theme loading, switching, inheritance, and composition.
 */

import type { Theme, ThemeConfig, ColorTheme, StyleTheme, ComponentTheme } from './theme-types.js';
import { ColorSpace } from './types.js';

/**
 * Event types for theme changes
 */
export enum ThemeEventType {
  ThemeChanged = 'themeChanged',
  ThemeLoaded = 'themeLoaded',
  ThemeRegistered = 'themeRegistered',
  ThemeUnregistered = 'themeUnregistered',
}

/**
 * Theme event listener
 */
export type ThemeEventListener = (event: ThemeEvent) => void;

/**
 * Theme event
 */
export interface ThemeEvent {
  type: ThemeEventType;
  themeName: string;
  timestamp: number;
  data?: unknown;
}

/**
 * Theme Manager class for managing themes
 */
export class ThemeManager {
  private themes: Map<string, Theme>;
  private currentTheme: string;
  private eventListeners: Map<ThemeEventType, Set<ThemeEventListener>>;

  constructor() {
    this.themes = new Map();
    this.currentTheme = 'default';
    this.eventListeners = new Map();
  }

  /**
   * Register a theme
   * @param theme - Theme to register
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.name, theme);
    this.emit(ThemeEventType.ThemeRegistered, theme.name, { theme });
  }

  /**
   * Unregister a theme
   * @param name - Theme name to unregister
   * @returns True if theme was unregistered
   */
  unregisterTheme(name: string): boolean {
    const result = this.themes.delete(name);
    if (result) {
      this.emit(ThemeEventType.ThemeUnregistered, name);
    }
    return result;
  }

  /**
   * Load a theme by name
   * @param name - Theme name to load
   * @returns True if theme was loaded successfully
   */
  loadTheme(name: string): boolean {
    if (!this.themes.has(name)) {
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = name;

    this.emit(ThemeEventType.ThemeLoaded, name, { previousTheme });
    this.emit(ThemeEventType.ThemeChanged, name, { previousTheme });

    return true;
  }

  /**
   * Set a theme directly
   * @param theme - Theme to set
   */
  setTheme(theme: Theme): void {
    this.registerTheme(theme);
    this.loadTheme(theme.name);
  }

  /**
   * Get the current theme
   * @returns Current theme object
   */
  getCurrentTheme(): Theme | undefined {
    return this.themes.get(this.currentTheme);
  }

  /**
   * Get a theme by name
   * @param name - Theme name
   * @returns Theme object or undefined
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * Get the current theme name
   * @returns Current theme name
   */
  getCurrentThemeName(): string {
    return this.currentTheme;
  }

  /**
   * Get all registered theme names
   * @returns Array of theme names
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Check if a theme is registered
   * @param name - Theme name
   * @returns True if theme is registered
   */
  hasTheme(name: string): boolean {
    return this.themes.has(name);
  }

  /**
   * Create a theme from configuration
   * @param config - Theme configuration
   * @returns Complete theme object
   */
  createTheme(config: ThemeConfig): Theme {
    const baseTheme = config.extends ? this.themes.get(config.extends) : undefined;

    const colors = this.mergeColors(baseTheme?.colors, config.colors);
    const styles = this.mergeStyles(baseTheme?.styles, config.styles);
    const components = this.mergeComponents(baseTheme?.components, config.components);

    return {
      name: config.name,
      type: config.type,
      colors,
      styles,
      components,
      extends: config.extends,
    };
  }

  /**
   * Merge color themes
   */
  private mergeColors(base?: ColorTheme, override?: Partial<ColorTheme>): ColorTheme {
    const defaultColors: ColorTheme = {
      primary: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
      secondary: { type: ColorSpace.RGB, red: 107, green: 114, blue: 128 },
      accent: { type: ColorSpace.RGB, red: 139, green: 92, blue: 246 },
      success: { type: ColorSpace.RGB, red: 34, green: 197, blue: 94 },
      warning: { type: ColorSpace.RGB, red: 234, green: 179, blue: 8 },
      error: { type: ColorSpace.RGB, red: 239, green: 68, blue: 68 },
      info: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
      background: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
      foreground: { type: ColorSpace.RGB, red: 17, green: 24, blue: 39 },
      surface: { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 },
      textPrimary: { type: ColorSpace.RGB, red: 17, green: 24, blue: 39 },
      textSecondary: { type: ColorSpace.RGB, red: 107, green: 114, blue: 128 },
      textDisabled: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
      border: { type: ColorSpace.RGB, red: 226, green: 232, blue: 240 },
      divider: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
      focus: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
      selection: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
      link: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    };

    return {
      ...defaultColors,
      ...base,
      ...override,
    };
  }

  /**
   * Merge style themes
   */
  private mergeStyles(base?: StyleTheme, override?: Partial<StyleTheme>): StyleTheme {
    const defaultStyles: StyleTheme = {
      font: {
        family: 'monospace' as any,
        size: 14,
        weight: 400 as any,
        lineHeight: 1.5,
      },
      border: {
        style: 'solid' as any,
        width: 1,
        color: { type: ColorSpace.RGB, red: 226, green: 232, blue: 240 },
      },
      shadow: {
        style: 'light' as any,
        color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      borderRadius: {
        sm: 2,
        md: 4,
        lg: 8,
        xl: 12,
        full: 9999,
      },
      transitionDuration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      zIndex: {
        dropdown: 1000,
        sticky: 1100,
        fixed: 1200,
        modal: 1300,
        popover: 1400,
        tooltip: 1500,
      },
    };

    return {
      ...defaultStyles,
      ...base,
      ...override,
      font: { ...defaultStyles.font, ...base?.font, ...override?.font },
      border: { ...defaultStyles.border, ...base?.border, ...override?.border },
      shadow: { ...defaultStyles.shadow, ...base?.shadow, ...override?.shadow },
      spacing: { ...defaultStyles.spacing, ...base?.spacing, ...override?.spacing },
      borderRadius: { ...defaultStyles.borderRadius, ...base?.borderRadius, ...override?.borderRadius },
      transitionDuration: {
        ...defaultStyles.transitionDuration,
        ...base?.transitionDuration,
        ...override?.transitionDuration,
      },
      zIndex: { ...defaultStyles.zIndex, ...base?.zIndex, ...override?.zIndex },
    };
  }

  /**
   * Merge component themes
   */
  private mergeComponents(
    base?: ComponentTheme,
    override?: Partial<ComponentTheme>,
  ): ComponentTheme | undefined {
    if (!base && !override) {
      return undefined;
    }

    return {
      ...base,
      ...override,
      button: { ...base?.button, ...override?.button },
      input: { ...base?.input, ...override?.input },
      card: { ...base?.card, ...override?.card },
      dialog: { ...base?.dialog, ...override?.dialog },
      menu: { ...base?.menu, ...override?.menu },
      progress: { ...base?.progress, ...override?.progress },
      statusBar: { ...base?.statusBar, ...override?.statusBar },
      tabs: { ...base?.tabs, ...override?.tabs },
      list: { ...base?.list, ...override?.list },
      checkbox: { ...base?.checkbox, ...override?.checkbox },
      radio: { ...base?.radio, ...override?.radio },
    };
  }

  /**
   * Compose multiple themes into one
   * @param themes - Array of themes to compose
   * @param name - Name for the composed theme
   * @returns Composed theme
   */
  composeThemes(themes: Theme[], name: string): Theme {
    if (themes.length === 0) {
      throw new Error('Cannot compose empty theme list');
    }

    const [first, ...rest] = themes;

    let composed: Theme = { ...first };

    for (const theme of rest) {
      composed.colors = { ...composed.colors, ...theme.colors };
      composed.styles = this.mergeStyles(composed.styles, theme.styles);
      composed.components = this.mergeComponents(composed.components, theme.components);
    }

    composed.name = name;
    composed.extends = first.name;

    return composed;
  }

  /**
   * Add an event listener
   * @param eventType - Event type to listen for
   * @param listener - Event listener function
   */
  addEventListener(eventType: ThemeEventType, listener: ThemeEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener
   * @param eventType - Event type
   * @param listener - Event listener function
   */
  removeEventListener(eventType: ThemeEventType, listener: ThemeEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit a theme event
   * @param eventType - Event type
   * @param themeName - Theme name
   * @param data - Optional event data
   */
  private emit(eventType: ThemeEventType, themeName: string, data?: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: ThemeEvent = {
        type: eventType,
        themeName,
        timestamp: Date.now(),
        data,
      };

      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in theme event listener:`, error);
        }
      }
    }
  }

  /**
   * Get a color from the current theme
   * @param colorName - Color name
   * @returns Color object or undefined
   */
  getColor(colorName: keyof ColorTheme): Color | undefined {
    const theme = this.getCurrentTheme();
    return theme?.colors[colorName];
  }

  /**
   * Get a style property from the current theme
   * @param stylePath - Dot-separated path to style property
   * @returns Style value or undefined
   */
  getStyle(stylePath: string): unknown {
    const theme = this.getCurrentTheme();
    if (!theme) return undefined;

    const parts = stylePath.split('.');
    let value: unknown = theme.styles;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Get component theme from current theme
   * @param componentName - Component name
   * @returns Component theme or undefined
   */
  getComponentTheme<K extends keyof ComponentTheme>(
    componentName: K,
  ): ComponentTheme[K] | undefined {
    const theme = this.getCurrentTheme();
    return theme?.components?.[componentName];
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    if (this.themes.has('default')) {
      this.loadTheme('default');
    }
  }

  /**
   * Clear all themes
   */
  clearAllThemes(): void {
    this.themes.clear();
    this.currentTheme = 'default';
  }

  /**
   * Export a theme as JSON
   * @param name - Theme name
   * @returns JSON string of the theme
   */
  exportTheme(name: string): string | undefined {
    const theme = this.themes.get(name);
    return theme ? JSON.stringify(theme, null, 2) : undefined;
  }

  /**
   * Import a theme from JSON
   * @param json - JSON string of the theme
   * @returns Imported theme
   */
  importTheme(json: string): Theme {
    const theme = JSON.parse(json) as Theme;
    this.registerTheme(theme);
    return theme;
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();
