/**
 * Color Contrast Module
 * 
 * Provides functions for calculating color contrast ratios and checking
 * WCAG accessibility compliance for color combinations.
 */

import type { Color, RGBColor, ColorAccessibility } from './types.js';
import { ColorSpace, ContrastLevel } from './types.js';
import { toRgb } from './conversion.js';

/**
 * WCAG contrast ratio thresholds
 */
const WCAG_THRESHOLDS = {
  AA: 4.5,
  AAA: 7.0,
  LargeTextAA: 3.0,
  LargeTextAAA: 4.5,
};

/**
 * Converts a color component to linear RGB space
 * @param c - Color component (0-255)
 * @returns Linear RGB value
 */
function toLinear(c: number): number {
  const normalized = c / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of a color
 * @param color - Color to calculate luminance for
 * @returns Relative luminance (0-1)
 */
export function getLuminance(color: Color): number {
  const rgb = toRgb(color);

  const r = toLinear(rgb.red);
  const g = toLinear(rgb.green);
  const b = toLinear(rgb.blue);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors
 * @param color1 - First color
 * @param color2 - Second color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: Color, color2: Color): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Gets comprehensive accessibility information for a color pair
 * @param foreground - Foreground color
 * @param background - Background color
 * @returns Color accessibility information
 */
export function getColorAccessibility(
  foreground: Color,
  background: Color,
): ColorAccessibility {
  const contrastRatio = getContrastRatio(foreground, background);

  return {
    luminance: getLuminance(foreground),
    contrastRatio,
    isAccessibleAA: contrastRatio >= WCAG_THRESHOLDS.AA,
    isAccessibleAAA: contrastRatio >= WCAG_THRESHOLDS.AAA,
    isAccessibleLargeTextAA: contrastRatio >= WCAG_THRESHOLDS.LargeTextAA,
    isAccessibleLargeTextAAA: contrastRatio >= WCAG_THRESHOLDS.LargeTextAAA,
  };
}

/**
 * Checks if two colors meet WCAG accessibility requirements
 * @param color1 - First color
 * @param color2 - Second color
 * @param level - WCAG contrast level to check
 * @returns True if colors meet the accessibility requirement
 */
export function isAccessible(
  color1: Color,
  color2: Color,
  level: ContrastLevel,
): boolean {
  const contrastRatio = getContrastRatio(color1, color2);
  return contrastRatio >= WCAG_THRESHOLDS[level];
}

/**
 * Finds an accessible text color for a given background
 * @param background - Background color
 * @param minContrast - Minimum contrast ratio required (default 4.5 for AA)
 * @returns Accessible text color (black or white)
 */
export function getAccessibleColor(
  background: Color,
  minContrast: number = WCAG_THRESHOLDS.AA,
): RGBColor {
  const black: RGBColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 };
  const white: RGBColor = { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };

  const contrastWithBlack = getContrastRatio(black, background);
  const contrastWithWhite = getContrastRatio(white, background);

  if (contrastWithBlack >= minContrast && contrastWithBlack >= contrastWithWhite) {
    return black;
  }
  if (contrastWithWhite >= minContrast) {
    return white;
  }

  // If neither meets the requirement, return the one with higher contrast
  return contrastWithBlack > contrastWithWhite ? black : white;
}

/**
 * Finds the best accessible text color for a given background
 * @param background - Background color
 * @param candidates - Array of candidate text colors
 * @param minContrast - Minimum contrast ratio required
 * @returns Best accessible color or undefined if none meet the requirement
 */
export function findBestAccessibleColor(
  background: Color,
  candidates: Color[],
  minContrast: number = WCAG_THRESHOLDS.AA,
): Color | undefined {
  let bestColor: Color | undefined;
  let bestContrast = 0;

  for (const candidate of candidates) {
    const contrast = getContrastRatio(candidate, background);
    if (contrast >= minContrast && contrast > bestContrast) {
      bestContrast = contrast;
      bestColor = candidate;
    }
  }

  return bestColor;
}

/**
 * Adjusts a color to meet a minimum contrast ratio with a background
 * @param color - Color to adjust
 * @param background - Background color
 * @param minContrast - Minimum contrast ratio required
 * @param maxIterations - Maximum adjustment iterations
 * @returns Adjusted color or original if unable to meet requirement
 */
export function adjustColorForContrast(
  color: Color,
  background: Color,
  minContrast: number = WCAG_THRESHOLDS.AA,
  maxIterations: number = 100,
): RGBColor {
  let adjusted = toRgb(color);
  const bgLuminance = getLuminance(background);
  const colorLuminance = getLuminance(adjusted);

  // Determine if we need to lighten or darken
  const shouldLighten = colorLuminance < bgLuminance;

  for (let i = 0; i < maxIterations; i++) {
    const contrast = getContrastRatio(adjusted, background);
    if (contrast >= minContrast) {
      return adjusted;
    }

    // Adjust color
    const factor = shouldLighten ? 1.05 : 0.95;
    adjusted.red = Math.min(255, Math.max(0, Math.round(adjusted.red * factor)));
    adjusted.green = Math.min(255, Math.max(0, Math.round(adjusted.green * factor)));
    adjusted.blue = Math.min(255, Math.max(0, Math.round(adjusted.blue * factor)));
  }

  return adjusted;
}

/**
 * Gets the contrast rating for a color pair
 * @param color1 - First color
 * @param color2 - Second color
 * @returns Contrast rating string
 */
export function getContrastRating(color1: Color, color2: Color): string {
  const ratio = getContrastRatio(color1, color2);

  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3.0) return 'AA Large';
  return 'Fail';
}

/**
 * Checks if a color is readable on a light background
 * @param color - Color to check
 * @returns True if color is readable on light background
 */
export function isReadableOnLight(color: Color): boolean {
  const white: RGBColor = { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };
  return getContrastRatio(color, white) >= WCAG_THRESHOLDS.AA;
}

/**
 * Checks if a color is readable on a dark background
 * @param color - Color to check
 * @returns True if color is readable on dark background
 */
export function isReadableOnDark(color: Color): boolean {
  const black: RGBColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 };
  return getContrastRatio(color, black) >= WCAG_THRESHOLDS.AA;
}

/**
 * Gets the recommended text color for a background
 * @param background - Background color
 * @returns Recommended text color (black or white)
 */
export function getRecommendedTextColor(background: Color): RGBColor {
  const luminance = getLuminance(background);
  return luminance > 0.5
    ? { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 }
    : { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };
}

/**
 * Creates a color scale with guaranteed contrast between adjacent colors
 * @param startColor - Starting color
 * @param endColor - Ending color
 * @param steps - Number of steps
 * @param minContrast - Minimum contrast between adjacent colors
 * @returns Array of colors with guaranteed contrast
 */
export function createContrastScale(
  startColor: Color,
  endColor: Color,
  steps: number,
  minContrast: number = 3.0,
): RGBColor[] {
  const colors: RGBColor[] = [toRgb(startColor)];
  const stepSize = 1 / (steps - 1);

  for (let i = 1; i < steps - 1; i++) {
    const weight = i * stepSize;
    // Simple linear interpolation
    const rgb1 = toRgb(startColor);
    const rgb2 = toRgb(endColor);

    const r = Math.round(rgb1.red * (1 - weight) + rgb2.red * weight);
    const g = Math.round(rgb1.green * (1 - weight) + rgb2.green * weight);
    const b = Math.round(rgb1.blue * (1 - weight) + rgb2.blue * weight);

    const newColor: RGBColor = { type: ColorSpace.RGB, red: r, green: g, blue: b };

    // Ensure contrast with previous color
    if (colors.length > 0) {
      const contrast = getContrastRatio(newColor, colors[colors.length - 1]);
      if (contrast < minContrast) {
        // Adjust to meet contrast requirement
        const adjusted = adjustColorForContrast(newColor, colors[colors.length - 1], minContrast);
        colors.push(adjusted);
      } else {
        colors.push(newColor);
      }
    } else {
      colors.push(newColor);
    }
  }

  colors.push(toRgb(endColor));
  return colors;
}

/**
 * Validates a color combination for accessibility
 * @param foreground - Foreground color
 * @param background - Background color
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns Validation result with details
 */
export function validateColorCombination(
  foreground: Color,
  background: Color,
  isLargeText: boolean = false,
): {
  isValid: boolean;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  recommendedLevel: ContrastLevel | null;
} {
  const contrastRatio = getContrastRatio(foreground, background);
  const meetsAA = isLargeText
    ? contrastRatio >= WCAG_THRESHOLDS.LargeTextAA
    : contrastRatio >= WCAG_THRESHOLDS.AA;
  const meetsAAA = isLargeText
    ? contrastRatio >= WCAG_THRESHOLDS.LargeTextAAA
    : contrastRatio >= WCAG_THRESHOLDS.AAA;

  let recommendedLevel: ContrastLevel | null = null;
  if (meetsAAA) recommendedLevel = ContrastLevel.AAA;
  else if (meetsAA) recommendedLevel = ContrastLevel.AA;

  return {
    isValid: meetsAA,
    contrastRatio,
    meetsAA,
    meetsAAA,
    recommendedLevel,
  };
}
