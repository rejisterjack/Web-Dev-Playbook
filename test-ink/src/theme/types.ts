/**
 * Color Types Module
 * 
 * Defines core color interfaces and types for the TUI framework's color system.
 * Supports multiple color representations including named, hex, RGB, HSL, HWB, and CMYK.
 */

/**
 * Color space enumeration
 */
export enum ColorSpace {
  RGB = 'rgb',
  HSL = 'hsl',
  HWB = 'hwb',
  CMYK = 'cmyk',
}

/**
 * RGB color representation
 */
export interface RGBColor {
  type: ColorSpace;
  red: number;   // 0-255
  green: number; // 0-255
  blue: number;  // 0-255
  alpha?: number; // 0-1
}

/**
 * HSL color representation
 */
export interface HSLColor {
  type: ColorSpace;
  hue: number;        // 0-360
  saturation: number; // 0-100
  lightness: number;  // 0-100
  alpha?: number;     // 0-1
}

/**
 * HWB color representation
 */
export interface HWBColor {
  type: ColorSpace;
  hue: number;        // 0-360
  whiteness: number;  // 0-100
  blackness: number;  // 0-100
  alpha?: number;     // 0-1
}

/**
 * CMYK color representation
 */
export interface CMYKColor {
  type: ColorSpace;
  cyan: number;    // 0-100
  magenta: number; // 0-100
  yellow: number;  // 0-100
  key: number;     // 0-100
  alpha?: number;  // 0-1
}

/**
 * Hex color representation
 */
export interface HexColor {
  type: 'hex';
  value: string; // #RRGGBB or #RRGGBBAA
}

/**
 * Named color representation
 */
export interface NamedColor {
  type: 'named';
  name: string;
}

/**
 * Generic color type that can represent any color format
 */
export type Color =
  | RGBColor
  | HSLColor
  | HWBColor
  | CMYKColor
  | HexColor
  | NamedColor;

/**
 * Color stop for gradients
 */
export interface ColorStop {
  color: Color;
  position: number; // 0-1
}

/**
 * Gradient type
 */
export enum GradientType {
  Linear = 'linear',
  Radial = 'radial',
}

/**
 * Gradient configuration
 */
export interface GradientConfig {
  type: GradientType;
  stops: ColorStop[];
  angle?: number; // For linear gradients, in degrees
}

/**
 * Color palette entry
 */
export interface PaletteEntry {
  name: string;
  color: Color;
  description?: string;
}

/**
 * Color palette
 */
export interface ColorPalette {
  name: string;
  colors: Map<string, Color>;
  description?: string;
}

/**
 * Color contrast level for WCAG compliance
 */
export enum ContrastLevel {
  AA = 'AA',
  AAA = 'AAA',
  LargeTextAA = 'LargeTextAA',
  LargeTextAAA = 'LargeTextAAA',
}

/**
 * Color accessibility info
 */
export interface ColorAccessibility {
  luminance: number;
  contrastRatio: number;
  isAccessibleAA: boolean;
  isAccessibleAAA: boolean;
  isAccessibleLargeTextAA: boolean;
  isAccessibleLargeTextAAA: boolean;
}

/**
 * Terminal color support level
 */
export enum TerminalColorSupport {
  Monochrome = 1,
  Basic16 = 16,
  Extended256 = 256,
  TrueColor = 16777216,
}

/**
 * ANSI color code
 */
export interface ANSIColor {
  code: number;
  isForeground: boolean;
  isBright?: boolean;
}

/**
 * Color cache entry
 */
export interface ColorCacheEntry {
  input: string | Color;
  output: Color | number | string;
  timestamp: number;
}

/**
 * Color validation result
 */
export interface ColorValidationResult {
  isValid: boolean;
  error?: string;
  normalizedColor?: Color;
}
