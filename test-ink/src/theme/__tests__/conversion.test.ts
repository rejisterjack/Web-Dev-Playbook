/**
 * Color Conversion Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHwb,
  hwbToRgb,
  rgbToCmyk,
  cmykToRgb,
  toRgb,
  toHsl,
  toHex,
} from '../conversion.js';
import { ColorSpace } from '../types.js';

describe('hexToRgb', () => {
  it('should convert 6-digit hex to RGB', () => {
    const result = hexToRgb('#ff0000');
    expect(result).toEqual({
      type: ColorSpace.RGB,
      red: 255,
      green: 0,
      blue: 0,
    });
  });

  it('should convert 3-digit hex to RGB', () => {
    const result = hexToRgb('#f00');
    expect(result).toEqual({
      type: ColorSpace.RGB,
      red: 255,
      green: 0,
      blue: 0,
    });
  });

  it('should convert 8-digit hex with alpha to RGB', () => {
    const result = hexToRgb('#ff0000ff');
    expect(result).toEqual({
      type: ColorSpace.RGB,
      red: 255,
      green: 0,
      blue: 0,
      alpha: 1,
    });
  });

  it('should throw error for invalid hex', () => {
    expect(() => hexToRgb('#invalid')).toThrow();
  });
});

describe('rgbToHex', () => {
  it('should convert RGB to 6-digit hex', () => {
    const result = rgbToHex(255, 0, 0);
    expect(result).toBe('#ff0000');
  });

  it('should convert RGB with alpha to 8-digit hex', () => {
    const result = rgbToHex(255, 0, 0, 0.5);
    expect(result).toBe('#ff000080');
  });

  it('should clamp values to valid range', () => {
    const result = rgbToHex(300, -10, 128);
    expect(result).toBe('#ff0080');
  });
});

describe('rgbToHsl', () => {
  it('should convert red to HSL', () => {
    const result = rgbToHsl(255, 0, 0);
    expect(result.hue).toBe(0);
    expect(result.saturation).toBe(100);
    expect(result.lightness).toBe(50);
  });

  it('should convert white to HSL', () => {
    const result = rgbToHsl(255, 255, 255);
    expect(result.hue).toBe(0);
    expect(result.saturation).toBe(0);
    expect(result.lightness).toBe(100);
  });

  it('should convert black to HSL', () => {
    const result = rgbToHsl(0, 0, 0);
    expect(result.hue).toBe(0);
    expect(result.saturation).toBe(0);
    expect(result.lightness).toBe(0);
  });
});

describe('hslToRgb', () => {
  it('should convert HSL to RGB', () => {
    const result = hslToRgb(0, 100, 50);
    expect(result.red).toBe(255);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });

  it('should handle grayscale colors', () => {
    const result = hslToRgb(0, 0, 50);
    expect(result.red).toBe(128);
    expect(result.green).toBe(128);
    expect(result.blue).toBe(128);
  });
});

describe('rgbToHwb', () => {
  it('should convert RGB to HWB', () => {
    const result = rgbToHwb(255, 0, 0);
    expect(result.hue).toBe(0);
    expect(result.whiteness).toBe(0);
    expect(result.blackness).toBe(0);
  });

  it('should convert white to HWB', () => {
    const result = rgbToHwb(255, 255, 255);
    expect(result.whiteness).toBe(100);
    expect(result.blackness).toBe(0);
  });
});

describe('hwbToRgb', () => {
  it('should convert HWB to RGB', () => {
    const result = hwbToRgb(0, 0, 0);
    expect(result.red).toBe(255);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });

  it('should handle pure white', () => {
    const result = hwbToRgb(0, 100, 0);
    expect(result.red).toBe(255);
    expect(result.green).toBe(255);
    expect(result.blue).toBe(255);
  });
});

describe('rgbToCmyk', () => {
  it('should convert RGB to CMYK', () => {
    const result = rgbToCmyk(255, 0, 0);
    expect(result.cyan).toBe(0);
    expect(result.magenta).toBe(100);
    expect(result.yellow).toBe(100);
    expect(result.key).toBe(0);
  });

  it('should convert black to CMYK', () => {
    const result = rgbToCmyk(0, 0, 0);
    expect(result.key).toBe(100);
  });
});

describe('cmykToRgb', () => {
  it('should convert CMYK to RGB', () => {
    const result = cmykToRgb(0, 100, 100, 0);
    expect(result.red).toBe(255);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });
});

describe('toRgb', () => {
  it('should return RGB color unchanged', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = toRgb(color);
    expect(result).toEqual(color);
  });

  it('should convert HSL to RGB', () => {
    const color = { type: ColorSpace.HSL, hue: 0, saturation: 100, lightness: 50 };
    const result = toRgb(color);
    expect(result.red).toBe(255);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });

  it('should convert hex to RGB', () => {
    const color = { type: 'hex' as const, value: '#ff0000' };
    const result = toRgb(color);
    expect(result.red).toBe(255);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });
});

describe('toHsl', () => {
  it('should convert RGB to HSL', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = toHsl(color);
    expect(result.hue).toBe(0);
    expect(result.saturation).toBe(100);
    expect(result.lightness).toBe(50);
  });
});

describe('toHex', () => {
  it('should convert RGB to hex', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = toHex(color);
    expect(result).toBe('#ff0000');
  });
});
