/**
 * Color Palette Module
 * 
 * Provides the ColorPalette class for managing color palettes.
 * Includes predefined color palettes (Material, Tailwind, Nord, Dracula, etc.).
 */

import type { Color, ColorPalette as ColorPaletteType } from './types.js';
import { ColorSpace } from './types.js';

/**
 * ColorPalette class for managing color palettes
 */
export class ColorPalette {
  private palettes: Map<string, ColorPaletteType>;
  private currentPalette: string;

  constructor() {
    this.palettes = new Map();
    this.currentPalette = 'default';
    this.initializePredefinedPalettes();
  }

  /**
   * Initialize predefined color palettes
   */
  private initializePredefinedPalettes(): void {
    // Material Design Palette
    const materialColors = new Map<string, Color>();
    materialColors.set('red', { type: ColorSpace.RGB, red: 244, green: 67, blue: 54 });
    materialColors.set('pink', { type: ColorSpace.RGB, red: 233, green: 30, blue: 99 });
    materialColors.set('purple', { type: ColorSpace.RGB, red: 156, green: 39, blue: 176 });
    materialColors.set('deepPurple', { type: ColorSpace.RGB, red: 103, green: 58, blue: 183 });
    materialColors.set('indigo', { type: ColorSpace.RGB, red: 63, green: 81, blue: 181 });
    materialColors.set('blue', { type: ColorSpace.RGB, red: 33, green: 150, blue: 243 });
    materialColors.set('lightBlue', { type: ColorSpace.RGB, red: 3, green: 169, blue: 244 });
    materialColors.set('cyan', { type: ColorSpace.RGB, red: 0, green: 188, blue: 212 });
    materialColors.set('teal', { type: ColorSpace.RGB, red: 0, green: 150, blue: 136 });
    materialColors.set('green', { type: ColorSpace.RGB, red: 76, green: 175, blue: 80 });
    materialColors.set('lightGreen', { type: ColorSpace.RGB, red: 139, green: 195, blue: 74 });
    materialColors.set('lime', { type: ColorSpace.RGB, red: 205, green: 220, blue: 57 });
    materialColors.set('yellow', { type: ColorSpace.RGB, red: 255, green: 235, blue: 59 });
    materialColors.set('amber', { type: ColorSpace.RGB, red: 255, green: 193, blue: 7 });
    materialColors.set('orange', { type: ColorSpace.RGB, red: 255, green: 152, blue: 0 });
    materialColors.set('deepOrange', { type: ColorSpace.RGB, red: 255, green: 87, blue: 34 });
    materialColors.set('brown', { type: ColorSpace.RGB, red: 121, green: 85, blue: 72 });
    materialColors.set('grey', { type: ColorSpace.RGB, red: 158, green: 158, blue: 158 });
    materialColors.set('blueGrey', { type: ColorSpace.RGB, red: 96, green: 125, blue: 139 });
    materialColors.set('black', { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 });
    materialColors.set('white', { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 });

    this.palettes.set('material', {
      name: 'material',
      colors: materialColors,
      description: 'Material Design color palette',
    });

    // Tailwind CSS Palette
    const tailwindColors = new Map<string, Color>();
    tailwindColors.set('slate50', { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 });
    tailwindColors.set('slate100', { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 });
    tailwindColors.set('slate200', { type: ColorSpace.RGB, red: 226, green: 232, blue: 240 });
    tailwindColors.set('slate300', { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 });
    tailwindColors.set('slate400', { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 });
    tailwindColors.set('slate500', { type: ColorSpace.RGB, red: 100, green: 116, blue: 139 });
    tailwindColors.set('slate600', { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 });
    tailwindColors.set('slate700', { type: ColorSpace.RGB, red: 51, green: 65, blue: 85 });
    tailwindColors.set('slate800', { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 });
    tailwindColors.set('slate900', { type: ColorSpace.RGB, red: 15, green: 23, blue: 42 });
    tailwindColors.set('red50', { type: ColorSpace.RGB, red: 254, green: 242, blue: 242 });
    tailwindColors.set('red100', { type: ColorSpace.RGB, red: 254, green: 226, blue: 226 });
    tailwindColors.set('red200', { type: ColorSpace.RGB, red: 254, green: 202, blue: 202 });
    tailwindColors.set('red300', { type: ColorSpace.RGB, red: 252, green: 165, blue: 165 });
    tailwindColors.set('red400', { type: ColorSpace.RGB, red: 248, green: 113, blue: 113 });
    tailwindColors.set('red500', { type: ColorSpace.RGB, red: 239, green: 68, blue: 68 });
    tailwindColors.set('red600', { type: ColorSpace.RGB, red: 220, green: 38, blue: 38 });
    tailwindColors.set('red700', { type: ColorSpace.RGB, red: 185, green: 28, blue: 28 });
    tailwindColors.set('red800', { type: ColorSpace.RGB, red: 153, green: 27, blue: 27 });
    tailwindColors.set('red900', { type: ColorSpace.RGB, red: 127, green: 29, blue: 29 });
    tailwindColors.set('green50', { type: ColorSpace.RGB, red: 240, green: 253, blue: 244 });
    tailwindColors.set('green100', { type: ColorSpace.RGB, red: 220, green: 252, blue: 231 });
    tailwindColors.set('green200', { type: ColorSpace.RGB, red: 187, green: 247, blue: 208 });
    tailwindColors.set('green300', { type: ColorSpace.RGB, red: 134, green: 239, blue: 172 });
    tailwindColors.set('green400', { type: ColorSpace.RGB, red: 74, green: 222, blue: 128 });
    tailwindColors.set('green500', { type: ColorSpace.RGB, red: 34, green: 197, blue: 94 });
    tailwindColors.set('green600', { type: ColorSpace.RGB, red: 22, green: 163, blue: 74 });
    tailwindColors.set('green700', { type: ColorSpace.RGB, red: 21, green: 128, blue: 61 });
    tailwindColors.set('green800', { type: ColorSpace.RGB, red: 22, green: 101, blue: 52 });
    tailwindColors.set('green900', { type: ColorSpace.RGB, red: 20, green: 83, blue: 45 });
    tailwindColors.set('blue50', { type: ColorSpace.RGB, red: 239, green: 246, blue: 255 });
    tailwindColors.set('blue100', { type: ColorSpace.RGB, red: 219, green: 234, blue: 254 });
    tailwindColors.set('blue200', { type: ColorSpace.RGB, red: 191, green: 219, blue: 254 });
    tailwindColors.set('blue300', { type: ColorSpace.RGB, red: 147, green: 197, blue: 253 });
    tailwindColors.set('blue400', { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 });
    tailwindColors.set('blue500', { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 });
    tailwindColors.set('blue600', { type: ColorSpace.RGB, red: 37, green: 99, blue: 235 });
    tailwindColors.set('blue700', { type: ColorSpace.RGB, red: 29, green: 78, blue: 216 });
    tailwindColors.set('blue800', { type: ColorSpace.RGB, red: 30, green: 64, blue: 175 });
    tailwindColors.set('blue900', { type: ColorSpace.RGB, red: 30, green: 58, blue: 138 });

    this.palettes.set('tailwind', {
      name: 'tailwind',
      colors: tailwindColors,
      description: 'Tailwind CSS color palette',
    });

    // Nord Theme Palette
    const nordColors = new Map<string, Color>();
    nordColors.set('nord0', { type: ColorSpace.RGB, red: 46, green: 52, blue: 64 }); // Polar Night
    nordColors.set('nord1', { type: ColorSpace.RGB, red: 59, green: 66, blue: 82 });
    nordColors.set('nord2', { type: ColorSpace.RGB, red: 67, green: 76, blue: 94 });
    nordColors.set('nord3', { type: ColorSpace.RGB, red: 76, green: 86, blue: 106 });
    nordColors.set('nord4', { type: ColorSpace.RGB, red: 216, green: 222, blue: 233 }); // Snow Storm
    nordColors.set('nord5', { type: ColorSpace.RGB, red: 229, green: 233, blue: 240 });
    nordColors.set('nord6', { type: ColorSpace.RGB, red: 236, green: 239, blue: 244 });
    nordColors.set('nord7', { type: ColorSpace.RGB, red: 143, green: 188, blue: 187 }); // Frost
    nordColors.set('nord8', { type: ColorSpace.RGB, red: 136, green: 192, blue: 208 });
    nordColors.set('nord9', { type: ColorSpace.RGB, red: 129, green: 161, blue: 193 });
    nordColors.set('nord10', { type: ColorSpace.RGB, red: 94, green: 129, blue: 172 });
    nordColors.set('nord11', { type: ColorSpace.RGB, red: 191, green: 97, blue: 106 }); // Aurora
    nordColors.set('nord12', { type: ColorSpace.RGB, red: 208, green: 135, blue: 112 });
    nordColors.set('nord13', { type: ColorSpace.RGB, red: 235, green: 203, blue: 139 });
    nordColors.set('nord14', { type: ColorSpace.RGB, red: 163, green: 190, blue: 140 });
    nordColors.set('nord15', { type: ColorSpace.RGB, red: 180, green: 142, blue: 173 });

    this.palettes.set('nord', {
      name: 'nord',
      colors: nordColors,
      description: 'Nord theme color palette',
    });

    // Dracula Theme Palette
    const draculaColors = new Map<string, Color>();
    draculaColors.set('background', { type: ColorSpace.RGB, red: 40, green: 42, blue: 54 });
    draculaColors.set('currentLine', { type: ColorSpace.RGB, red: 68, green: 71, blue: 90 });
    draculaColors.set('foreground', { type: ColorSpace.RGB, red: 248, green: 248, blue: 242 });
    draculaColors.set('comment', { type: ColorSpace.RGB, red: 98, green: 114, blue: 164 });
    draculaColors.set('cyan', { type: ColorSpace.RGB, red: 139, green: 233, blue: 253 });
    draculaColors.set('green', { type: ColorSpace.RGB, red: 80, green: 250, blue: 123 });
    draculaColors.set('orange', { type: ColorSpace.RGB, red: 255, green: 184, blue: 108 });
    draculaColors.set('pink', { type: ColorSpace.RGB, red: 255, green: 121, blue: 198 });
    draculaColors.set('purple', { type: ColorSpace.RGB, red: 189, green: 147, blue: 249 });
    draculaColors.set('red', { type: ColorSpace.RGB, red: 255, green: 85, blue: 85 });
    draculaColors.set('yellow', { type: ColorSpace.RGB, red: 241, green: 250, blue: 140 });

    this.palettes.set('dracula', {
      name: 'dracula',
      colors: draculaColors,
      description: 'Dracula theme color palette',
    });

    // One Dark Theme Palette
    const oneDarkColors = new Map<string, Color>();
    oneDarkColors.set('background', { type: ColorSpace.RGB, red: 40, green: 44, blue: 52 });
    oneDarkColors.set('foreground', { type: ColorSpace.RGB, red: 171, green: 178, blue: 191 });
    oneDarkColors.set('red', { type: ColorSpace.RGB, red: 224, green: 108, blue: 117 });
    oneDarkColors.set('orange', { type: ColorSpace.RGB, red: 209, green: 154, blue: 102 });
    oneDarkColors.set('yellow', { type: ColorSpace.RGB, red: 229, green: 192, blue: 123 });
    oneDarkColors.set('green', { type: ColorSpace.RGB, red: 152, green: 195, blue: 121 });
    oneDarkColors.set('cyan', { type: ColorSpace.RGB, red: 97, green: 175, blue: 239 });
    oneDarkColors.set('blue', { type: ColorSpace.RGB, red: 97, green: 175, blue: 239 });
    oneDarkColors.set('purple', { type: ColorSpace.RGB, red: 198, green: 120, blue: 221 });
    oneDarkColors.set('magenta', { type: ColorSpace.RGB, red: 198, green: 120, blue: 221 });

    this.palettes.set('onedark', {
      name: 'onedark',
      colors: oneDarkColors,
      description: 'One Dark theme color palette',
    });

    // Solarized Theme Palette
    const solarizedColors = new Map<string, Color>();
    solarizedColors.set('base03', { type: ColorSpace.RGB, red: 0, green: 43, blue: 54 });
    solarizedColors.set('base02', { type: ColorSpace.RGB, red: 7, green: 54, blue: 66 });
    solarizedColors.set('base01', { type: ColorSpace.RGB, red: 88, green: 110, blue: 117 });
    solarizedColors.set('base00', { type: ColorSpace.RGB, red: 101, green: 123, blue: 131 });
    solarizedColors.set('base0', { type: ColorSpace.RGB, red: 131, green: 148, blue: 150 });
    solarizedColors.set('base1', { type: ColorSpace.RGB, red: 147, green: 161, blue: 161 });
    solarizedColors.set('base2', { type: ColorSpace.RGB, red: 238, green: 232, blue: 213 });
    solarizedColors.set('base3', { type: ColorSpace.RGB, red: 253, green: 246, blue: 227 });
    solarizedColors.set('yellow', { type: ColorSpace.RGB, red: 181, green: 137, blue: 0 });
    solarizedColors.set('orange', { type: ColorSpace.RGB, red: 203, green: 75, blue: 22 });
    solarizedColors.set('red', { type: ColorSpace.RGB, red: 220, green: 50, blue: 47 });
    solarizedColors.set('magenta', { type: ColorSpace.RGB, red: 211, green: 54, blue: 130 });
    solarizedColors.set('violet', { type: ColorSpace.RGB, red: 108, green: 113, blue: 196 });
    solarizedColors.set('blue', { type: ColorSpace.RGB, red: 38, green: 139, blue: 210 });
    solarizedColors.set('cyan', { type: ColorSpace.RGB, red: 42, green: 161, blue: 152 });
    solarizedColors.set('green', { type: ColorSpace.RGB, red: 133, green: 153, blue: 0 });

    this.palettes.set('solarized', {
      name: 'solarized',
      colors: solarizedColors,
      description: 'Solarized theme color palette',
    });

    // Set default palette
    this.currentPalette = 'material';
  }

  /**
   * Get a color from the current palette
   * @param name - Color name
   * @returns Color object or undefined if not found
   */
  getColor(name: string): Color | undefined {
    const palette = this.palettes.get(this.currentPalette);
    return palette?.colors.get(name);
  }

  /**
   * Get a color from a specific palette
   * @param paletteName - Palette name
   * @param colorName - Color name
   * @returns Color object or undefined if not found
   */
  getColorFromPalette(paletteName: string, colorName: string): Color | undefined {
    const palette = this.palettes.get(paletteName);
    return palette?.colors.get(colorName);
  }

  /**
   * Set a color in the current palette
   * @param name - Color name
   * @param color - Color object
   */
  setColor(name: string, color: Color): void {
    const palette = this.palettes.get(this.currentPalette);
    if (palette) {
      palette.colors.set(name, color);
    }
  }

  /**
   * Set a color in a specific palette
   * @param paletteName - Palette name
   * @param colorName - Color name
   * @param color - Color object
   */
  setColorInPalette(paletteName: string, colorName: string, color: Color): void {
    const palette = this.palettes.get(paletteName);
    if (palette) {
      palette.colors.set(colorName, color);
    }
  }

  /**
   * Get the current palette
   * @returns Current palette object
   */
  getPalette(): ColorPaletteType | undefined {
    return this.palettes.get(this.currentPalette);
  }

  /**
   * Get a specific palette
   * @param name - Palette name
   * @returns Palette object or undefined if not found
   */
  getPaletteByName(name: string): ColorPaletteType | undefined {
    return this.palettes.get(name);
  }

  /**
   * Load a palette by name
   * @param name - Palette name
   * @returns True if palette was loaded, false otherwise
   */
  loadPalette(name: string): boolean {
    if (this.palettes.has(name)) {
      this.currentPalette = name;
      return true;
    }
    return false;
  }

  /**
   * Register a custom palette
   * @param palette - Palette object
   */
  registerPalette(palette: ColorPaletteType): void {
    this.palettes.set(palette.name, palette);
  }

  /**
   * Get all available palette names
   * @returns Array of palette names
   */
  getAvailablePalettes(): string[] {
    return Array.from(this.palettes.keys());
  }

  /**
   * Get the current palette name
   * @returns Current palette name
   */
  getCurrentPaletteName(): string {
    return this.currentPalette;
  }

  /**
   * Get all colors from the current palette
   * @returns Map of color names to colors
   */
  getAllColors(): Map<string, Color> {
    const palette = this.palettes.get(this.currentPalette);
    return palette ? new Map(palette.colors) : new Map();
  }

  /**
   * Check if a color exists in the current palette
   * @param name - Color name
   * @returns True if color exists
   */
  hasColor(name: string): boolean {
    const palette = this.palettes.get(this.currentPalette);
    return palette?.colors.has(name) ?? false;
  }

  /**
   * Remove a color from the current palette
   * @param name - Color name
   * @returns True if color was removed
   */
  removeColor(name: string): boolean {
    const palette = this.palettes.get(this.currentPalette);
    return palette?.colors.delete(name) ?? false;
  }

  /**
   * Clear all colors from the current palette
   */
  clearPalette(): void {
    const palette = this.palettes.get(this.currentPalette);
    if (palette) {
      palette.colors.clear();
    }
  }

  /**
   * Clone the current palette
   * @returns Cloned palette object
   */
  clonePalette(): ColorPaletteType | undefined {
    const palette = this.palettes.get(this.currentPalette);
    if (!palette) return undefined;

    return {
      name: `${palette.name}-clone`,
      colors: new Map(palette.colors),
      description: palette.description,
    };
  }
}

// Export singleton instance
export const colorPalette = new ColorPalette();
