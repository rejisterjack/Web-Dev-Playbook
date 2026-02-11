/**
 * Color Utilities Module
 * 
 * Provides utility functions for color operations including parsing,
 * validation, random color generation, and color harmony calculations.
 */

import type { Color, RGBColor, HSLColor, ColorValidationResult } from './types.js';
import { ColorSpace } from './types.js';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from './conversion.js';

/**
 * Named color map
 */
const NAMED_COLORS: Record<string, string> = {
  // Basic colors
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',

  // Extended colors
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  blanchedalmond: '#ffebcd',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  rebeccapurple: '#663399',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  whitesmoke: '#f5f5f5',
  yellowgreen: '#9acd32',
};

/**
 * Parse a color from a string
 * @param input - Color string (hex, named, rgb, hsl)
 * @returns Parsed color or undefined if invalid
 */
export function parseColor(input: string): Color | undefined {
  input = input.trim().toLowerCase();

  // Try named color
  if (NAMED_COLORS[input]) {
    return { type: 'hex', value: NAMED_COLORS[input] };
  }

  // Try hex color
  if (input.startsWith('#')) {
    return { type: 'hex', value: input };
  }

  // Try rgb()
  const rgbMatch = input.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;

    if (isValidRgb(r, g, b)) {
      return { type: ColorSpace.RGB, red: r, green: g, blue: b, alpha: a };
    }
  }

  // Try hsl()
  const hslMatch = input.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10);
    const l = parseInt(hslMatch[3], 10);
    const a = hslMatch[4] ? parseFloat(hslMatch[4]) : undefined;

    if (isValidHsl(h, s, l)) {
      return { type: ColorSpace.HSL, hue: h, saturation: s, lightness: l, alpha: a };
    }
  }

  return undefined;
}

/**
 * Validate a color input
 * @param input - Color string or color object
 * @returns Validation result
 */
export function isValidColor(input: string | Color): ColorValidationResult {
  try {
    let color: Color;

    if (typeof input === 'string') {
      color = parseColor(input) as Color;
      if (!color) {
        return { isValid: false, error: 'Invalid color string' };
      }
    } else {
      color = input;
    }

    // Validate based on type
    switch (color.type) {
      case ColorSpace.RGB:
        if (!isValidRgb(color.red, color.green, color.blue)) {
          return { isValid: false, error: 'Invalid RGB values' };
        }
        if (color.alpha !== undefined && (color.alpha < 0 || color.alpha > 1)) {
          return { isValid: false, error: 'Invalid alpha value' };
        }
        break;

      case ColorSpace.HSL:
        if (!isValidHsl(color.hue, color.saturation, color.lightness)) {
          return { isValid: false, error: 'Invalid HSL values' };
        }
        if (color.alpha !== undefined && (color.alpha < 0 || color.alpha > 1)) {
          return { isValid: false, error: 'Invalid alpha value' };
        }
        break;

      case ColorSpace.HWB:
        if (!isValidHwb(color.hue, color.whiteness, color.blackness)) {
          return { isValid: false, error: 'Invalid HWB values' };
        }
        if (color.alpha !== undefined && (color.alpha < 0 || color.alpha > 1)) {
          return { isValid: false, error: 'Invalid alpha value' };
        }
        break;

      case ColorSpace.CMYK:
        if (!isValidCmyk(color.cyan, color.magenta, color.yellow, color.key)) {
          return { isValid: false, error: 'Invalid CMYK values' };
        }
        if (color.alpha !== undefined && (color.alpha < 0 || color.alpha > 1)) {
          return { isValid: false, error: 'Invalid alpha value' };
        }
        break;

      case 'hex':
        if (!isValidHex(color.value)) {
          return { isValid: false, error: 'Invalid hex color' };
        }
        break;

      case 'named':
        if (!NAMED_COLORS[color.name.toLowerCase()]) {
          return { isValid: false, error: 'Unknown named color' };
        }
        break;
    }

    return { isValid: true, normalizedColor: color };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if RGB values are valid
 */
function isValidRgb(r: number, g: number, b: number): boolean {
  return (
    Number.isInteger(r) &&
    Number.isInteger(g) &&
    Number.isInteger(b) &&
    r >= 0 &&
    r <= 255 &&
    g >= 0 &&
    g <= 255 &&
    b >= 0 &&
    b <= 255
  );
}

/**
 * Check if HSL values are valid
 */
function isValidHsl(h: number, s: number, l: number): boolean {
  return (
    Number.isFinite(h) &&
    Number.isFinite(s) &&
    Number.isFinite(l) &&
    h >= 0 &&
    h <= 360 &&
    s >= 0 &&
    s <= 100 &&
    l >= 0 &&
    l <= 100
  );
}

/**
 * Check if HWB values are valid
 */
function isValidHwb(h: number, w: number, b: number): boolean {
  return (
    Number.isFinite(h) &&
    Number.isFinite(w) &&
    Number.isFinite(b) &&
    h >= 0 &&
    h <= 360 &&
    w >= 0 &&
    w <= 100 &&
    b >= 0 &&
    b <= 100
  );
}

/**
 * Check if CMYK values are valid
 */
function isValidCmyk(c: number, m: number, y: number, k: number): boolean {
  return (
    Number.isFinite(c) &&
    Number.isFinite(m) &&
    Number.isFinite(y) &&
    Number.isFinite(k) &&
    c >= 0 &&
    c <= 100 &&
    m >= 0 &&
    m <= 100 &&
    y >= 0 &&
    y <= 100 &&
    k >= 0 &&
    k <= 100
  );
}

/**
 * Check if hex color is valid
 */
function isValidHex(hex: string): boolean {
  const cleanHex = hex.replace(/^#/, '');
  return (
    (cleanHex.length === 3 && /^[0-9a-f]{3}$/i.test(cleanHex)) ||
    (cleanHex.length === 6 && /^[0-9a-f]{6}$/i.test(cleanHex)) ||
    (cleanHex.length === 8 && /^[0-9a-f]{8}$/i.test(cleanHex))
  );
}

/**
 * Generate a random color
 * @returns Random RGB color
 */
export function randomColor(): RGBColor {
  return {
    type: ColorSpace.RGB,
    red: Math.floor(Math.random() * 256),
    green: Math.floor(Math.random() * 256),
    blue: Math.floor(Math.random() * 256),
  };
}

/**
 * Generate a random color with constraints
 * @param options - Options for color generation
 * @returns Random RGB color
 */
export function randomColorWithConstraints(options: {
  minLightness?: number;
  maxLightness?: number;
  minSaturation?: number;
  maxSaturation?: number;
}): RGBColor {
  const { minLightness = 0, maxLightness = 100, minSaturation = 0, maxSaturation = 100 } = options;

  let color: RGBColor;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    color = randomColor();
    const hsl = rgbToHsl(color.red, color.green, color.blue);
    attempts++;

    if (
      hsl.lightness >= minLightness &&
      hsl.lightness <= maxLightness &&
      hsl.saturation >= minSaturation &&
      hsl.saturation <= maxSaturation
    ) {
      return color;
    }
  } while (attempts < maxAttempts);

  return color;
}

/**
 * Get the complementary color
 * @param color - Input color
 * @returns Complementary color
 */
export function complementaryColor(color: Color): RGBColor {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  // Rotate hue by 180 degrees
  const newHue = (hsl.hue + 180) % 360;
  return hslToRgb(newHue, hsl.saturation, hsl.lightness);
}

/**
 * Get analogous colors
 * @param color - Input color
 * @param count - Number of analogous colors to return
 * @returns Array of analogous colors
 */
export function analogousColors(color: Color, count: number = 3): RGBColor[] {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  const colors: RGBColor[] = [];
  const step = 30; // 30 degrees between analogous colors

  for (let i = 0; i < count; i++) {
    const hue = (hsl.hue + step * (i - Math.floor(count / 2))) % 360;
    colors.push(hslToRgb(hue < 0 ? hue + 360 : hue, hsl.saturation, hsl.lightness));
  }

  return colors;
}

/**
 * Get triadic colors
 * @param color - Input color
 * @returns Array of triadic colors (3 colors)
 */
export function triadicColors(color: Color): RGBColor[] {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  return [
    hslToRgb(hsl.hue, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 120) % 360, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 240) % 360, hsl.saturation, hsl.lightness),
  ];
}

/**
 * Get split complementary colors
 * @param color - Input color
 * @returns Array of split complementary colors (3 colors)
 */
export function splitComplementaryColors(color: Color): RGBColor[] {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  return [
    hslToRgb(hsl.hue, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 150) % 360, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 210) % 360, hsl.saturation, hsl.lightness),
  ];
}

/**
 * Get tetradic colors
 * @param color - Input color
 * @returns Array of tetradic colors (4 colors)
 */
export function tetradicColors(color: Color): RGBColor[] {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  return [
    hslToRgb(hsl.hue, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 90) % 360, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 180) % 360, hsl.saturation, hsl.lightness),
    hslToRgb((hsl.hue + 270) % 360, hsl.saturation, hsl.lightness),
  ];
}

/**
 * Get monochromatic colors
 * @param color - Input color
 * @param count - Number of monochromatic colors to return
 * @returns Array of monochromatic colors
 */
export function monochromaticColors(color: Color, count: number = 5): RGBColor[] {
  const hsl = rgbToHsl(
    color.type === ColorSpace.RGB ? color.red : 0,
    color.type === ColorSpace.RGB ? color.green : 0,
    color.type === ColorSpace.RGB ? color.blue : 0,
  );

  const colors: RGBColor[] = [];
  const step = 100 / (count + 1);

  for (let i = 1; i <= count; i++) {
    const lightness = Math.round(i * step);
    colors.push(hslToRgb(hsl.hue, hsl.saturation, lightness));
  }

  return colors;
}

/**
 * Convert color to string representation
 * @param color - Color to convert
 * @param format - Output format ('hex', 'rgb', 'hsl')
 * @returns String representation
 */
export function colorToString(color: Color, format: 'hex' | 'rgb' | 'hsl' = 'hex'): string {
  switch (format) {
    case 'hex':
      return rgbToHex(
        color.type === ColorSpace.RGB ? color.red : 0,
        color.type === ColorSpace.RGB ? color.green : 0,
        color.type === ColorSpace.RGB ? color.blue : 0,
        color.type === ColorSpace.RGB ? color.alpha : undefined,
      );

    case 'rgb': {
      const r = color.type === ColorSpace.RGB ? color.red : 0;
      const g = color.type === ColorSpace.RGB ? color.green : 0;
      const b = color.type === ColorSpace.RGB ? color.blue : 0;
      const a = color.type === ColorSpace.RGB ? color.alpha : undefined;
      return a !== undefined ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    }

    case 'hsl': {
      const hsl = rgbToHsl(
        color.type === ColorSpace.RGB ? color.red : 0,
        color.type === ColorSpace.RGB ? color.green : 0,
        color.type === ColorSpace.RGB ? color.blue : 0,
      );
      const alpha = color.type === ColorSpace.RGB ? color.alpha : undefined;
      return alpha !== undefined
        ? `hsla(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`
        : `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%)`;
    }
  }
}

/**
 * Get all named colors
 * @returns Object mapping color names to hex values
 */
export function getNamedColors(): Record<string, string> {
  return { ...NAMED_COLORS };
}

/**
 * Check if a color name exists
 * @param name - Color name
 * @returns True if color name exists
 */
export function isNamedColor(name: string): boolean {
  return name.toLowerCase() in NAMED_COLORS;
}

/**
 * Get hex value for a named color
 * @param name - Color name
 * @returns Hex value or undefined
 */
export function getNamedColorHex(name: string): string | undefined {
  return NAMED_COLORS[name.toLowerCase()];
}
