/**
 * Color Conversion Module
 * 
 * Provides functions for converting between different color representations.
 * Supports conversions between hex, RGB, HSL, HWB, and CMYK color spaces.
 */

import type { RGBColor, HSLColor, HWBColor, CMYKColor, Color } from './types.js';
import { ColorSpace } from './types.js';

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts a hex string to RGB color
 * @param hex - Hex color string (e.g., "#ff0000" or "#f00" or "#ff0000ff")
 * @returns RGB color object
 * @throws Error if hex string is invalid
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle shorthand hex (e.g., #f00)
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { type: ColorSpace.RGB, red: r, green: g, blue: b };
  }

  // Handle 6-digit hex (e.g., #ff0000)
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { type: ColorSpace.RGB, red: r, green: g, blue: b };
  }

  // Handle 8-digit hex with alpha (e.g., #ff0000ff)
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = parseInt(cleanHex.substring(6, 8), 16) / 255;
    return { type: ColorSpace.RGB, red: r, green: g, blue: b, alpha: a };
  }

  throw new Error(`Invalid hex color: ${hex}`);
}

/**
 * Converts RGB color to hex string
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Optional alpha component (0-1)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  const toHex = (n: number): string => {
    const hex = Math.round(clamp(n, 0, 255)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  if (a !== undefined) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB color to HSL color
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL color object
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  // Normalize RGB values to 0-1
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case nr:
        h = ((ng - nb) / delta + (ng < nb ? 6 : 0)) / 6;
        break;
      case ng:
        h = ((nb - nr) / delta + 2) / 6;
        break;
      case nb:
        h = ((nr - ng) / delta + 4) / 6;
        break;
    }
  }

  return {
    type: ColorSpace.HSL,
    hue: Math.round(h * 360),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100),
  };
}

/**
 * Converts HSL color to RGB color
 * @param h - Hue component (0-360)
 * @param s - Saturation component (0-100)
 * @param l - Lightness component (0-100)
 * @returns RGB color object
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  let r: number;
  let g: number;
  let b: number;

  if (sat === 0) {
    r = g = b = light;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;

    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return {
    type: ColorSpace.RGB,
    red: Math.round(r * 255),
    green: Math.round(g * 255),
    blue: Math.round(b * 255),
  };
}

/**
 * Converts RGB color to HWB color
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HWB color object
 */
export function rgbToHwb(r: number, g: number, b: number): HWBColor {
  const hsl = rgbToHsl(r, g, b);

  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const white = Math.min(nr, ng, nb);
  const black = 1 - Math.max(nr, ng, nb);

  return {
    type: ColorSpace.HWB,
    hue: hsl.hue,
    whiteness: Math.round(white * 100),
    blackness: Math.round(black * 100),
  };
}

/**
 * Converts HWB color to RGB color
 * @param h - Hue component (0-360)
 * @param w - Whiteness component (0-100)
 * @param b - Blackness component (0-100)
 * @returns RGB color object
 */
export function hwbToRgb(h: number, w: number, b: number): RGBColor {
  const whiteness = w / 100;
  const blackness = b / 100;

  if (whiteness + blackness >= 1) {
    const gray = whiteness / (whiteness + blackness);
    return {
      type: ColorSpace.RGB,
      red: Math.round(gray * 255),
      green: Math.round(gray * 255),
      blue: Math.round(gray * 255),
    };
  }

  const rgb = hslToRgb(h, 100, 50);
  const factor = 1 - whiteness - blackness;

  return {
    type: ColorSpace.RGB,
    red: Math.round((rgb.red / 255) * factor * 255 + whiteness * 255),
    green: Math.round((rgb.green / 255) * factor * 255 + whiteness * 255),
    blue: Math.round((rgb.blue / 255) * factor * 255 + whiteness * 255),
  };
}

/**
 * Converts RGB color to CMYK color
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns CMYK color object
 */
export function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;

  const k = 1 - Math.max(nr, ng, nb);
  const c = (1 - nr - k) / (1 - k) || 0;
  const m = (1 - ng - k) / (1 - k) || 0;
  const y = (1 - nb - k) / (1 - k) || 0;

  return {
    type: ColorSpace.CMYK,
    cyan: Math.round(c * 100),
    magenta: Math.round(m * 100),
    yellow: Math.round(y * 100),
    key: Math.round(k * 100),
  };
}

/**
 * Converts CMYK color to RGB color
 * @param c - Cyan component (0-100)
 * @param m - Magenta component (0-100)
 * @param y - Yellow component (0-100)
 * @param k - Key (black) component (0-100)
 * @returns RGB color object
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): RGBColor {
  const nc = c / 100;
  const nm = m / 100;
  const ny = y / 100;
  const nk = k / 100;

  const r = 255 * (1 - nc) * (1 - nk);
  const g = 255 * (1 - nm) * (1 - nk);
  const b = 255 * (1 - ny) * (1 - nk);

  return {
    type: ColorSpace.RGB,
    red: Math.round(r),
    green: Math.round(g),
    blue: Math.round(b),
  };
}

/**
 * Converts any color to RGB
 * @param color - Color object in any format
 * @returns RGB color object
 */
export function toRgb(color: Color): RGBColor {
  switch (color.type) {
    case ColorSpace.RGB:
      return { ...color };
    case ColorSpace.HSL:
      return hslToRgb(color.hue, color.saturation, color.lightness);
    case ColorSpace.HWB:
      return hwbToRgb(color.hue, color.whiteness, color.blackness);
    case ColorSpace.CMYK:
      return cmykToRgb(color.cyan, color.magenta, color.yellow, color.key);
    case 'hex':
      return hexToRgb(color.value);
    case 'named':
      // Named colors would need a lookup table
      throw new Error(`Named color conversion not implemented: ${color.name}`);
  }
}

/**
 * Converts any color to HSL
 * @param color - Color object in any format
 * @returns HSL color object
 */
export function toHsl(color: Color): HSLColor {
  const rgb = toRgb(color);
  return rgbToHsl(rgb.red, rgb.green, rgb.blue);
}

/**
 * Converts any color to hex string
 * @param color - Color object in any format
 * @returns Hex color string
 */
export function toHex(color: Color): string {
  const rgb = toRgb(color);
  return rgbToHex(rgb.red, rgb.green, rgb.blue, rgb.alpha);
}
