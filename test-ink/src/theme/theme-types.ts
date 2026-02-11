/**
 * Theme Types Module
 * 
 * Defines theme interfaces and types for the TUI framework's theming system.
 * Supports complete theme configuration including colors, styles, and component overrides.
 */

import type { Color } from './types.js';

/**
 * Font family options
 */
export enum FontFamily {
  Monospace = 'monospace',
  SansSerif = 'sans-serif',
  Serif = 'serif',
  System = 'system',
}

/**
 * Font weight options
 */
export enum FontWeight {
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Regular = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Black = 900,
}

/**
 * Border style options
 */
export enum BorderStyle {
  None = 'none',
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted',
  Double = 'double',
  Rounded = 'rounded',
}

/**
 * Shadow style options
 */
export enum ShadowStyle {
  None = 'none',
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Inset = 'inset',
}

/**
 * Color theme definition
 */
export interface ColorTheme {
  // Primary colors
  primary: Color;
  primaryLight?: Color;
  primaryDark?: Color;

  // Secondary colors
  secondary: Color;
  secondaryLight?: Color;
  secondaryDark?: Color;

  // Accent colors
  accent: Color;
  accentLight?: Color;
  accentDark?: Color;

  // Success colors
  success: Color;
  successLight?: Color;
  successDark?: Color;

  // Warning colors
  warning: Color;
  warningLight?: Color;
  warningDark?: Color;

  // Error colors
  error: Color;
  errorLight?: Color;
  errorDark?: Color;

  // Info colors
  info: Color;
  infoLight?: Color;
  infoDark?: Color;

  // Neutral colors
  background: Color;
  foreground: Color;
  surface: Color;
  surfaceVariant?: Color;

  // Text colors
  textPrimary: Color;
  textSecondary: Color;
  textTertiary?: Color;
  textDisabled?: Color;

  // Border colors
  border: Color;
  borderLight?: Color;
  borderDark?: Color;

  // Divider colors
  divider: Color;

  // Focus colors
  focus: Color;
  focusRing?: Color;

  // Selection colors
  selection: Color;
  selectionForeground?: Color;

  // Link colors
  link: Color;
  linkVisited?: Color;
  linkHover?: Color;
  linkActive?: Color;

  // Code colors
  codeBackground?: Color;
  codeForeground?: Color;

  // Scrollbar colors
  scrollbar?: Color;
  scrollbarHover?: Color;
  scrollbarTrack?: Color;
}

/**
 * Font definition
 */
export interface Font {
  family: FontFamily;
  size: number;
  weight: FontWeight;
  lineHeight: number;
  letterSpacing?: number;
}

/**
 * Border definition
 */
export interface Border {
  style: BorderStyle;
  width: number;
  color: Color;
  radius?: number;
}

/**
 * Shadow definition
 */
export interface Shadow {
  style: ShadowStyle;
  color: Color;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  spread?: number;
}

/**
 * Spacing definition
 */
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/**
 * Style theme definition
 */
export interface StyleTheme {
  // Fonts
  font: Font;
  fontSmall?: Font;
  fontLarge?: Font;
  fontCode?: Font;
  fontHeading?: Font;

  // Borders
  border: Border;
  borderLight?: Border;
  borderHeavy?: Border;

  // Shadows
  shadow: Shadow;
  shadowLight?: Shadow;
  shadowHeavy?: Shadow;

  // Spacing
  spacing: Spacing;

  // Border radius
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  // Transitions
  transitionDuration?: {
    fast: number;
    normal: number;
    slow: number;
  };

  // Z-index layers
  zIndex?: {
    dropdown: number;
    sticky: number;
    fixed: number;
    modal: number;
    popover: number;
    tooltip: number;
  };
}

/**
 * Button theme
 */
export interface ButtonTheme {
  primary: {
    background: Color;
    foreground: Color;
    hoverBackground?: Color;
    hoverForeground?: Color;
    activeBackground?: Color;
    activeForeground?: Color;
    disabledBackground?: Color;
    disabledForeground?: Color;
    border?: Border;
  };
  secondary: {
    background: Color;
    foreground: Color;
    hoverBackground?: Color;
    hoverForeground?: Color;
    activeBackground?: Color;
    activeForeground?: Color;
    disabledBackground?: Color;
    disabledForeground?: Color;
    border?: Border;
  };
  tertiary: {
    background: Color;
    foreground: Color;
    hoverBackground?: Color;
    hoverForeground?: Color;
    activeBackground?: Color;
    activeForeground?: Color;
    disabledBackground?: Color;
    disabledForeground?: Color;
    border?: Border;
  };
  danger: {
    background: Color;
    foreground: Color;
    hoverBackground?: Color;
    hoverForeground?: Color;
    activeBackground?: Color;
    activeForeground?: Color;
    disabledBackground?: Color;
    disabledForeground?: Color;
    border?: Border;
  };
}

/**
 * Input theme
 */
export interface InputTheme {
  background: Color;
  foreground: Color;
  placeholder?: Color;
  border: Border;
  focusBorder?: Border;
  errorBorder?: Border;
  disabledBackground?: Color;
  disabledForeground?: Color;
  disabledBorder?: Border;
  selection?: Color;
  selectionForeground?: Color;
}

/**
 * Card theme
 */
export interface CardTheme {
  background: Color;
  foreground: Color;
  border?: Border;
  shadow?: Shadow;
  hoverBackground?: Color;
  hoverShadow?: Shadow;
}

/**
 * Dialog theme
 */
export interface DialogTheme {
  background: Color;
  foreground: Color;
  border?: Border;
  shadow?: Shadow;
  overlay?: Color;
  title?: Color;
  description?: Color;
}

/**
 * Menu theme
 */
export interface MenuTheme {
  background: Color;
  foreground: Color;
  border?: Border;
  shadow?: Shadow;
  hoverBackground?: Color;
  hoverForeground?: Color;
  selectedBackground?: Color;
  selectedForeground?: Color;
  disabledForeground?: Color;
  separator?: Color;
}

/**
 * Progress theme
 */
export interface ProgressTheme {
  background: Color;
  foreground: Color;
  success?: Color;
  warning?: Color;
  error?: Color;
}

/**
 * Status bar theme
 */
export interface StatusBarTheme {
  background: Color;
  foreground: Color;
  border?: Border;
  sectionBackground?: Color;
  sectionForeground?: Color;
}

/**
 * Tabs theme
 */
export interface TabsTheme {
  background: Color;
  foreground: Color;
  activeBackground?: Color;
  activeForeground?: Color;
  hoverBackground?: Color;
  hoverForeground?: Color;
  border?: Border;
  indicator?: Color;
}

/**
 * List theme
 */
export interface ListTheme {
  background: Color;
  foreground: Color;
  hoverBackground?: Color;
  hoverForeground?: Color;
  selectedBackground?: Color;
  selectedForeground?: Color;
  disabledForeground?: Color;
  border?: Border;
}

/**
 * Checkbox theme
 */
export interface CheckboxTheme {
  background: Color;
  foreground: Color;
  border: Border;
  checkedBackground?: Color;
  checkedForeground?: Color;
  disabledBackground?: Color;
  disabledForeground?: Color;
  disabledBorder?: Border;
}

/**
 * Radio theme
 */
export interface RadioTheme {
  background: Color;
  foreground: Color;
  border: Border;
  selectedBackground?: Color;
  selectedForeground?: Color;
  disabledBackground?: Color;
  disabledForeground?: Color;
  disabledBorder?: Border;
}

/**
 * Component-specific theme overrides
 */
export interface ComponentTheme {
  button?: ButtonTheme;
  input?: InputTheme;
  card?: CardTheme;
  dialog?: DialogTheme;
  menu?: MenuTheme;
  progress?: ProgressTheme;
  statusBar?: StatusBarTheme;
  tabs?: TabsTheme;
  list?: ListTheme;
  checkbox?: CheckboxTheme;
  radio?: RadioTheme;
}

/**
 * Complete theme configuration
 */
export interface Theme {
  // Theme metadata
  name: string;
  version?: string;
  description?: string;
  author?: string;

  // Theme type
  type: 'light' | 'dark' | 'high-contrast' | 'monochrome' | 'custom';

  // Color definitions
  colors: ColorTheme;

  // Style definitions
  styles: StyleTheme;

  // Component overrides
  components?: ComponentTheme;

  // Parent theme for inheritance
  extends?: string;

  // Custom properties
  custom?: Record<string, unknown>;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  name: string;
  type: Theme['type'];
  colors: Partial<ColorTheme>;
  styles?: Partial<StyleTheme>;
  components?: Partial<ComponentTheme>;
  extends?: string;
}

/**
 * Theme inheritance configuration
 */
export interface ThemeInheritance {
  parent: string;
  overrides: Partial<Theme>;
}
