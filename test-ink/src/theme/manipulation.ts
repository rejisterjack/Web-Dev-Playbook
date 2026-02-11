/**
 * Color Manipulation Module
 * 
 * Provides functions for manipulating colors including lightening, darkening,
 * saturating, desaturating, rotating hue, mixing colors, and opacity adjustments.
 */

import type { Color, RGBColor, HSLColor } from './types.js';
import { ColorSpace } from './types.js';
import { toRgb, toHsl, hslToRgb, rgbToHex } from './conversion.js';

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Lightens a color by the specified amount
 * @param color - Color to lighten
 * @param amount - Amount to lighten (0-100)
 * @returns Lightened color
 */
export function lighten(color: Color, amount: number): RGBColor {
  const hsl = toHsl(color);
  const newLightness = clamp(hsl.lightness + amount, 0, 100);
  return hslToRgb(hsl.hue, hsl.saturation, newLightness);
}

/**
 * Darkens a color by the specified amount
 * @param color - Color to darken
 * @param amount - Amount to darken (0-100)
 * @returns Darkened color
 */
export function darken(color: Color, amount: number): RGBColor {
  const hsl = toHsl(color);
  const newLightness = clamp(hsl.lightness - amount, 0, 100);
  return hslToRgb(hsl.hue, hsl.saturation, newLightness);
}

/**
 * Saturates a color by the specified amount
 * @param color - Color to saturate
 * @param amount - Amount to saturate (0-100)
 * @returns Saturated color
 */
export function saturate(color: Color, amount: number): RGBColor {
  const hsl = toHsl(color);
  const newSaturation = clamp(hsl.saturation + amount, 0, 100);
  return hslToRgb(hsl.hue, newSaturation, hsl.lightness);
}

/**
 * Desaturates a color by the specified amount
 * @param color - Color to desaturate
 * @param amount - Amount to desaturate (0-100)
 * @returns Desaturated color
 */
export function desaturate(color: Color, amount: number): RGBColor {
  const hsl = toHsl(color);
  const newSaturation = clamp(hsl.saturation - amount, 0, 100);
  return hslToRgb(hsl.hue, newSaturation, hsl.lightness);
}

/**
 * Rotates the hue of a color by the specified degrees
 * @param color - Color to rotate
 * @param degrees - Degrees to rotate (can be negative)
 * @returns Color with rotated hue
 */
export function rotate(color: Color, degrees: number): RGBColor {
  const hsl = toHsl(color);
  let newHue = (hsl.hue + degrees) % 360;
  if (newHue < 0) newHue += 360;
  return hslToRgb(newHue, hsl.saturation, hsl.lightness);
}

/**
 * Mixes two colors together
 * @param color1 - First color
 * @param color2 - Second color
 * @param weight - Weight of color1 in the mix (0-1), 0.5 is equal mix
 * @returns Mixed color
 */
export function mix(color1: Color, color2: Color, weight: number = 0.5): RGBColor {
  const rgb1 = toRgb(color1);
  const rgb2 = toRgb(color2);

  const w = clamp(weight, 0, 1);

  const r = Math.round(rgb1.red * w + rgb2.red * (1 - w));
  const g = Math.round(rgb1.green * w + rgb2.green * (1 - w));
  const b = Math.round(rgb1.blue * w + rgb2.blue * (1 - w));

  const alpha1 = rgb1.alpha ?? 1;
  const alpha2 = rgb2.alpha ?? 1;
  const alpha = alpha1 * w + alpha2 * (1 - w);

  return {
    type: ColorSpace.RGB,
    red: r,
    green: g,
    blue: b,
    alpha: alpha,
  };
}

/**
 * Sets the opacity of a color
 * @param color - Color to modify
 * @param opacity - Opacity value (0-1)
 * @returns Color with specified opacity
 */
export function fade(color: Color, opacity: number): RGBColor {
  const rgb = toRgb(color);
  return {
    type: ColorSpace.RGB,
    red: rgb.red,
    green: rgb.green,
    blue: rgb.blue,
    alpha: clamp(opacity, 0, 1),
  };
}

/**
 * Increases the opacity of a color
 * @param color - Color to modify
 * @param amount - Amount to increase opacity (0-1)
 * @returns Color with increased opacity
 */
export function opacify(color: Color, amount: number): RGBColor {
  const rgb = toRgb(color);
  const currentAlpha = rgb.alpha ?? 1;
  return {
    type: ColorSpace.RGB,
    red: rgb.red,
    green: rgb.green,
    blue: rgb.blue,
    alpha: clamp(currentAlpha + amount, 0, 1),
  };
}

/**
 * Grayscales a color
 * @param color - Color to grayscale
 * @returns Grayscale color
 */
export function grayscale(color: Color): RGBColor {
  const rgb = toRgb(color);
  // Using luminance formula for grayscale
  const gray = Math.round(0.299 * rgb.red + 0.587 * rgb.green + 0.114 * rgb.blue);
  return {
    type: ColorSpace.RGB,
    red: gray,
    green: gray,
    blue: gray,
    alpha: rgb.alpha,
  };
}

/**
 * Inverts a color
 * @param color - Color to invert
 * @returns Inverted color
 */
export function invert(color: Color): RGBColor {
  const rgb = toRgb(color);
  return {
    type: ColorSpace.RGB,
    red: 255 - rgb.red,
    green: 255 - rgb.green,
    blue: 255 - rgb.blue,
    alpha: rgb.alpha,
  };
}

/**
 * Adjusts the hue, saturation, and lightness of a color
 * @param color - Color to adjust
 * @param hue - Hue adjustment in degrees
 * @param saturation - Saturation adjustment (-100 to 100)
 * @param lightness - Lightness adjustment (-100 to 100)
 * @returns Adjusted color
 */
export function adjust(
  color: Color,
  hue: number = 0,
  saturation: number = 0,
  lightness: number = 0,
): RGBColor {
  const hsl = toHsl(color);
  const newHue = (hsl.hue + hue) % 360;
  const newSaturation = clamp(hsl.saturation + saturation, 0, 100);
  const newLightness = clamp(hsl.lightness + lightness, 0, 100);
  return hslToRgb(newHue < 0 ? newHue + 360 : newHue, newSaturation, newLightness);
}

/**
 * Creates a tint of a color (mixes with white)
 * @param color - Color to tint
 * @param amount - Amount of white to mix (0-100)
 * @returns Tinted color
 */
export function tint(color: Color, amount: number): RGBColor {
  const white: RGBColor = { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };
  return mix(color, white, 1 - amount / 100);
}

/**
 * Creates a shade of a color (mixes with black)
 * @param color - Color to shade
 * @param amount - Amount of black to mix (0-100)
 * @returns Shaded color
 */
export function shade(color: Color, amount: number): RGBColor {
  const black: RGBColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 };
  return mix(color, black, 1 - amount / 100);
}

/**
 * Gets the complement of a color (opposite on color wheel)
 * @param color - Color to get complement of
 * @returns Complementary color
 */
export function complement(color: Color): RGBColor {
  return rotate(color, 180);
}

/**
 * Creates a color scale between two colors
 * @param color1 - Start color
 * @param color2 - End color
 * @param steps - Number of steps in the scale
 * @returns Array of colors in the scale
 */
export function scale(color1: Color, color2: Color, steps: number): RGBColor[] {
  if (steps < 2) {
    throw new Error('Scale must have at least 2 steps');
  }

  const colors: RGBColor[] = [];
  for (let i = 0; i < steps; i++) {
    const weight = i / (steps - 1);
    colors.push(mix(color1, color2, 1 - weight));
  }
  return colors;
}

/**
 * Gets the relative luminance of a color
 * @param color - Color to get luminance of
 * @returns Relative luminance (0-1)
 */
export function getLuminance(color: Color): number {
  const rgb = toRgb(color);

  const toLinear = (c: number): number => {
    const normalized = c / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.red);
  const g = toLinear(rgb.green);
  const b = toLinear(rgb.blue);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determines if a color is light (for text contrast decisions)
 * @param color - Color to check
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if color is light
 */
export function isLight(color: Color, threshold: number = 0.5): boolean {
  return getLuminance(color) > threshold;
}

/**
 * Determines if a color is dark (for text contrast decisions)
 * @param color - Color to check
 * @param threshold - Luminance threshold (default 0.5)
 * @returns True if color is dark
 */
export function isDark(color: Color, threshold: number = 0.5): boolean {
  return getLuminance(color) <= threshold;
}
