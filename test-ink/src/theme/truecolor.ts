/**
 * TrueColor Renderer Module
 * 
 * Provides the TrueColorRenderer class for TrueColor rendering in terminals.
 * Generates ANSI escape sequences for TrueColor and falls back to 256-color
 * or 16-color when TrueColor is not supported.
 */

import type { Color, RGBColor } from './types.js';
import { ColorSpace, TerminalColorSupport } from './types.js';
import { toRgb } from './conversion.js';

/**
 * ANSI escape sequence prefix
 */
const ESC = '\x1b[';

/**
 * ANSI escape sequence suffix
 */
const CSI = 'm';

/**
 * ANSI color codes for 16-color palette
 */
const ANSI_16_COLORS: Record<string, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  'bright-black': 8,
  'bright-red': 9,
  'bright-green': 10,
  'bright-yellow': 11,
  'bright-blue': 12,
  'bright-magenta': 13,
  'bright-cyan': 14,
  'bright-white': 15,
};

/**
 * Standard 16-color palette RGB values
 */
const ANSI_16_RGB: Array<[number, number, number]> = [
  [0, 0, 0],       // 0: black
  [205, 0, 0],     // 1: red
  [0, 205, 0],     // 2: green
  [205, 205, 0],   // 3: yellow
  [0, 0, 238],     // 4: blue
  [205, 0, 205],   // 5: magenta
  [0, 205, 205],   // 6: cyan
  [229, 229, 229], // 7: white
  [127, 127, 127], // 8: bright black
  [255, 0, 0],     // 9: bright red
  [0, 255, 0],     // 10: bright green
  [255, 255, 0],   // 11: bright yellow
  [92, 92, 255],   // 12: bright blue
  [255, 0, 255],   // 13: bright magenta
  [0, 255, 255],   // 14: bright cyan
  [255, 255, 255], // 15: bright white
];

/**
 * 256-color palette (6x6x6 color cube + 24 grayscale)
 */
function get256ColorPalette(): Array<[number, number, number]> {
  const palette: Array<[number, number, number]> = [];

  // 16 standard colors
  palette.push(...ANSI_16_RGB);

  // 6x6x6 color cube (216 colors)
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette.push([
          r === 0 ? 0 : 55 + r * 40,
          g === 0 ? 0 : 55 + g * 40,
          b === 0 ? 0 : 55 + b * 40,
        ]);
      }
    }
  }

  // 24 grayscale colors
  for (let i = 0; i < 24; i++) {
    const value = 8 + i * 10;
    palette.push([value, value, value]);
  }

  return palette;
}

const ANSI_256_PALETTE = get256ColorPalette();

/**
 * Calculate color distance (Euclidean)
 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  return Math.sqrt(
    (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2,
  );
}

/**
 * Find the closest 16-color ANSI code
 */
function findClosest16Color(r: number, g: number, b: number): number {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < ANSI_16_RGB.length; i++) {
    const [cr, cg, cb] = ANSI_16_RGB[i];
    const distance = colorDistance(r, g, b, cr, cg, cb);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * Find the closest 256-color ANSI code
 */
function findClosest256Color(r: number, g: number, b: number): number {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < ANSI_256_PALETTE.length; i++) {
    const [cr, cg, cb] = ANSI_256_PALETTE[i];
    const distance = colorDistance(r, g, b, cr, cg, cb);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * TrueColor Renderer class
 */
export class TrueColorRenderer {
  private colorSupport: TerminalColorSupport;
  private forceMode: TerminalColorSupport | null;

  constructor() {
    this.colorSupport = this.detectColorSupport();
    this.forceMode = null;
  }

  /**
   * Detect terminal color support
   */
  private detectColorSupport(): TerminalColorSupport {
    // Check environment variables
    const colorterm = process.env.COLORTERM?.toLowerCase() || '';
    const term = process.env.TERM?.toLowerCase() || '';

    // Check for TrueColor support
    if (
      colorterm.includes('truecolor') ||
      colorterm.includes('24bit') ||
      term.includes('xterm-256color')
    ) {
      return TerminalColorSupport.TrueColor;
    }

    // Check for 256-color support
    if (
      term.includes('256color') ||
      term.includes('xterm-256color') ||
      term.includes('screen-256color')
    ) {
      return TerminalColorSupport.Extended256;
    }

    // Check for basic 16-color support
    if (
      term.includes('xterm') ||
      term.includes('screen') ||
      term.includes('vt100') ||
      term.includes('ansi')
    ) {
      return TerminalColorSupport.Basic16;
    }

    // Default to monochrome
    return TerminalColorSupport.Monochrome;
  }

  /**
   * Get the current color support level
   */
  getColorSupport(): TerminalColorSupport {
    return this.forceMode ?? this.colorSupport;
  }

  /**
   * Force a specific color mode
   */
  forceColorMode(mode: TerminalColorSupport | null): void {
    this.forceMode = mode;
  }

  /**
   * Reset to auto-detected color mode
   */
  resetColorMode(): void {
    this.forceMode = null;
  }

  /**
   * Check if TrueColor is supported
   */
  isTrueColorSupported(): boolean {
    return this.getColorSupport() === TerminalColorSupport.TrueColor;
  }

  /**
   * Check if 256-color is supported
   */
  is256ColorSupported(): boolean {
    const support = this.getColorSupport();
    return (
      support === TerminalColorSupport.TrueColor ||
      support === TerminalColorSupport.Extended256
    );
  }

  /**
   * Generate TrueColor foreground ANSI sequence
   */
  private trueColorForeground(r: number, g: number, b: number): string {
    return `${ESC}38;2;${r};${g};${b}${CSI}`;
  }

  /**
   * Generate TrueColor background ANSI sequence
   */
  private trueColorBackground(r: number, g: number, b: number): string {
    return `${ESC}48;2;${r};${g};${b}${CSI}`;
  }

  /**
   * Generate 256-color foreground ANSI sequence
   */
  private color256Foreground(code: number): string {
    return `${ESC}38;5;${code}${CSI}`;
  }

  /**
   * Generate 256-color background ANSI sequence
   */
  private color256Background(code: number): string {
    return `${ESC}48;5;${code}${CSI}`;
  }

  /**
   * Generate 16-color foreground ANSI sequence
   */
  private color16Foreground(code: number): string {
    return `${ESC}${30 + code}${CSI}`;
  }

  /**
   * Generate 16-color background ANSI sequence
   */
  private color16Background(code: number): string {
    return `${ESC}${40 + code}${CSI}`;
  }

  /**
   * Generate foreground color ANSI sequence
   */
  foreground(color: Color): string {
    const rgb = toRgb(color);
    const support = this.getColorSupport();

    switch (support) {
      case TerminalColorSupport.TrueColor:
        return this.trueColorForeground(rgb.red, rgb.green, rgb.blue);

      case TerminalColorSupport.Extended256: {
        const code256 = findClosest256Color(rgb.red, rgb.green, rgb.blue);
        return this.color256Foreground(code256);
      }

      case TerminalColorSupport.Basic16: {
        const code16 = findClosest16Color(rgb.red, rgb.green, rgb.blue);
        return this.color16Foreground(code16);
      }

      default:
        return '';
    }
  }

  /**
   * Generate background color ANSI sequence
   */
  background(color: Color): string {
    const rgb = toRgb(color);
    const support = this.getColorSupport();

    switch (support) {
      case TerminalColorSupport.TrueColor:
        return this.trueColorBackground(rgb.red, rgb.green, rgb.blue);

      case TerminalColorSupport.Extended256: {
        const code256 = findClosest256Color(rgb.red, rgb.green, rgb.blue);
        return this.color256Background(code256);
      }

      case TerminalColorSupport.Basic16: {
        const code16 = findClosest16Color(rgb.red, rgb.green, rgb.blue);
        return this.color16Background(code16);
      }

      default:
        return '';
    }
  }

  /**
   * Generate both foreground and background color ANSI sequences
   */
  colors(fg: Color, bg: Color): string {
    return `${this.foreground(fg)}${this.background(bg)}`;
  }

  /**
   * Reset all colors to default
   */
  reset(): string {
    return `${ESC}0${CSI}`;
  }

  /**
   * Reset foreground color to default
   */
  resetForeground(): string {
    return `${ESC}39${CSI}`;
  }

  /**
   * Reset background color to default
   */
  resetBackground(): string {
    return `${ESC}49${CSI}`;
  }

  /**
   * Apply color to text
   */
  colorize(text: string, color: Color, isBackground: boolean = false): string {
    const sequence = isBackground ? this.background(color) : this.foreground(color);
    return `${sequence}${text}${this.reset()}`;
  }

  /**
   * Apply foreground and background colors to text
   */
  colorizeBoth(text: string, fg: Color, bg: Color): string {
    const sequence = this.colors(fg, bg);
    return `${sequence}${text}${this.reset()}`;
  }

  /**
   * Get the best matching color code for a given color
   */
  getColorCode(color: Color): number {
    const rgb = toRgb(color);
    const support = this.getColorSupport();

    switch (support) {
      case TerminalColorSupport.TrueColor:
        return (rgb.red << 16) | (rgb.green << 8) | rgb.blue;

      case TerminalColorSupport.Extended256:
        return findClosest256Color(rgb.red, rgb.green, rgb.blue);

      case TerminalColorSupport.Basic16:
        return findClosest16Color(rgb.red, rgb.green, rgb.blue);

      default:
        return 0;
    }
  }

  /**
   * Get RGB values for a color code
   */
  getRgbFromCode(code: number): [number, number, number] {
    const support = this.getColorSupport();

    switch (support) {
      case TerminalColorSupport.TrueColor:
        return [(code >> 16) & 0xff, (code >> 8) & 0xff, code & 0xff];

      case TerminalColorSupport.Extended256:
        return ANSI_256_PALETTE[code] || [0, 0, 0];

      case TerminalColorSupport.Basic16:
        return ANSI_16_RGB[code] || [0, 0, 0];

      default:
        return [0, 0, 0];
    }
  }

  /**
   * Create a color gradient string
   */
  gradient(
    text: string,
    startColor: Color,
    endColor: Color,
    isBackground: boolean = false,
  ): string {
    if (text.length === 0) {
      return '';
    }

    const startRgb = toRgb(startColor);
    const endRgb = toRgb(endColor);

    let result = '';
    for (let i = 0; i < text.length; i++) {
      const t = text.length > 1 ? i / (text.length - 1) : 0;
      const r = Math.round(startRgb.red + (endRgb.red - startRgb.red) * t);
      const g = Math.round(startRgb.green + (endRgb.green - startRgb.green) * t);
      const b = Math.round(startRgb.blue + (endRgb.blue - startRgb.blue) * t);

      const color: RGBColor = { type: ColorSpace.RGB, red: r, green: g, blue: b };
      const sequence = isBackground ? this.background(color) : this.foreground(color);
      result += `${sequence}${text[i]}`;
    }

    return `${result}${this.reset()}`;
  }

  /**
   * Strip ANSI color codes from a string
   */
  stripColors(text: string): string {
    const ansiRegex = new RegExp(`${ESC}\\[[0-9;]*m`, 'g');
    return text.replace(ansiRegex, '');
  }

  /**
   * Check if a string contains ANSI color codes
   */
  hasColors(text: string): boolean {
    const ansiRegex = new RegExp(`${ESC}\\[[0-9;]*m`);
    return ansiRegex.test(text);
  }

  /**
   * Get the visible length of a string (excluding ANSI codes)
   */
  visibleLength(text: string): number {
    return this.stripColors(text).length;
  }
}

// Export singleton instance
export const trueColorRenderer = new TrueColorRenderer();
