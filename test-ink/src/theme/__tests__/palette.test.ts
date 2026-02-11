/**
 * Color Palette Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ColorPalette, colorPalette } from '../palette.js';
import { ColorSpace } from '../types.js';

describe('ColorPalette', () => {
  let palette: ColorPalette;

  beforeEach(() => {
    palette = new ColorPalette();
  });

  describe('initialization', () => {
    it('should initialize with predefined palettes', () => {
      const available = palette.getAvailablePalettes();
      expect(available).toContain('material');
      expect(available).toContain('tailwind');
      expect(available).toContain('nord');
      expect(available).toContain('dracula');
    });

    it('should set default palette', () => {
      expect(palette.getCurrentPaletteName()).toBe('material');
    });
  });

  describe('getColor', () => {
    it('should get color from current palette', () => {
      palette.loadPalette('material');
      const color = palette.getColor('red');
      expect(color).toBeDefined();
      expect(color?.type).toBe(ColorSpace.RGB);
    });

    it('should return undefined for non-existent color', () => {
      const color = palette.getColor('nonexistent');
      expect(color).toBeUndefined();
    });
  });

  describe('getColorFromPalette', () => {
    it('should get color from specific palette', () => {
      const color = palette.getColorFromPalette('material', 'red');
      expect(color).toBeDefined();
    });

    it('should return undefined for non-existent palette', () => {
      const color = palette.getColorFromPalette('nonexistent', 'red');
      expect(color).toBeUndefined();
    });
  });

  describe('setColor', () => {
    it('should set color in current palette', () => {
      const newColor = { type: ColorSpace.RGB, red: 100, green: 100, blue: 100 };
      palette.setColor('custom', newColor);
      const color = palette.getColor('custom');
      expect(color).toEqual(newColor);
    });
  });

  describe('setColorInPalette', () => {
    it('should set color in specific palette', () => {
      const newColor = { type: ColorSpace.RGB, red: 100, green: 100, blue: 100 };
      palette.setColorInPalette('material', 'custom', newColor);
      const color = palette.getColorFromPalette('material', 'custom');
      expect(color).toEqual(newColor);
    });
  });

  describe('getPalette', () => {
    it('should get current palette', () => {
      const current = palette.getPalette();
      expect(current).toBeDefined();
      expect(current?.name).toBe('material');
    });
  });

  describe('getPaletteByName', () => {
    it('should get specific palette', () => {
      const nord = palette.getPaletteByName('nord');
      expect(nord).toBeDefined();
      expect(nord?.name).toBe('nord');
    });

    it('should return undefined for non-existent palette', () => {
      const result = palette.getPaletteByName('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('loadPalette', () => {
    it('should load palette by name', () => {
      const result = palette.loadPalette('nord');
      expect(result).toBe(true);
      expect(palette.getCurrentPaletteName()).toBe('nord');
    });

    it('should return false for non-existent palette', () => {
      const result = palette.loadPalette('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('registerPalette', () => {
    it('should register custom palette', () => {
      const customPalette = {
        name: 'custom',
        colors: new Map([
          ['primary', { type: ColorSpace.RGB, red: 100, green: 100, blue: 100 }],
        ]),
      };
      palette.registerPalette(customPalette);
      const available = palette.getAvailablePalettes();
      expect(available).toContain('custom');
    });
  });

  describe('getAvailablePalettes', () => {
    it('should return array of palette names', () => {
      const available = palette.getAvailablePalettes();
      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);
    });
  });

  describe('getCurrentPaletteName', () => {
    it('should return current palette name', () => {
      palette.loadPalette('nord');
      expect(palette.getCurrentPaletteName()).toBe('nord');
    });
  });

  describe('getAllColors', () => {
    it('should return all colors from current palette', () => {
      const colors = palette.getAllColors();
      expect(colors).toBeInstanceOf(Map);
      expect(colors.size).toBeGreaterThan(0);
    });
  });

  describe('hasColor', () => {
    it('should return true for existing color', () => {
      expect(palette.hasColor('red')).toBe(true);
    });

    it('should return false for non-existent color', () => {
      expect(palette.hasColor('nonexistent')).toBe(false);
    });
  });

  describe('removeColor', () => {
    it('should remove color from palette', () => {
      palette.setColor('temp', { type: ColorSpace.RGB, red: 100, green: 100, blue: 100 });
      const result = palette.removeColor('temp');
      expect(result).toBe(true);
      expect(palette.hasColor('temp')).toBe(false);
    });

    it('should return false for non-existent color', () => {
      const result = palette.removeColor('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clearPalette', () => {
    it('should clear all colors from palette', () => {
      palette.clearPalette();
      const colors = palette.getAllColors();
      expect(colors.size).toBe(0);
    });
  });

  describe('clonePalette', () => {
    it('should clone current palette', () => {
      const clone = palette.clonePalette();
      expect(clone).toBeDefined();
      expect(clone?.name).toContain('clone');
    });
  });
});

describe('colorPalette singleton', () => {
  it('should export singleton instance', () => {
    expect(colorPalette).toBeInstanceOf(ColorPalette);
  });
});
