/**
 * Color Utilities Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseColor,
  isValidColor,
  randomColor,
  randomColorWithConstraints,
  complementaryColor,
  analogousColors,
  triadicColors,
  splitComplementaryColors,
  tetradicColors,
  monochromaticColors,
  colorToString,
  getNamedColors,
  isNamedColor,
  getNamedColorHex,
} from '../utils.js';
import { ColorSpace } from '../types.js';

describe('parseColor', () => {
  it('should parse hex color', () => {
    const result = parseColor('#ff0000');
    expect(result).toEqual({ type: 'hex', value: '#ff0000' });
  });

  it('should parse named color', () => {
    const result = parseColor('red');
    expect(result).toEqual({ type: 'hex', value: '#ff0000' });
  });

  it('should parse rgb color', () => {
    const result = parseColor('rgb(255, 0, 0)');
    expect(result?.type).toBe(ColorSpace.RGB);
    if (result && result.type === ColorSpace.RGB) {
      expect(result.red).toBe(255);
      expect(result.green).toBe(0);
      expect(result.blue).toBe(0);
    }
  });

  it('should parse rgba color', () => {
    const result = parseColor('rgba(255, 0, 0, 0.5)');
    expect(result?.type).toBe(ColorSpace.RGB);
    if (result?.type === ColorSpace.RGB) {
      expect(result.alpha).toBe(0.5);
    }
  });

  it('should parse hsl color', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result?.type).toBe(ColorSpace.HSL);
  });

  it('should return undefined for invalid color', () => {
    const result = parseColor('invalid');
    expect(result).toBeUndefined();
  });
});

describe('isValidColor', () => {
  it('should validate hex color', () => {
    const result = isValidColor('#ff0000');
    expect(result.isValid).toBe(true);
  });

  it('should validate named color', () => {
    const result = isValidColor('red');
    expect(result.isValid).toBe(true);
  });

  it('should validate RGB color', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = isValidColor(color);
    expect(result.isValid).toBe(true);
  });

  it('should invalidate invalid RGB values', () => {
    const color = { type: ColorSpace.RGB, red: 300, green: 0, blue: 0 };
    const result = isValidColor(color);
    expect(result.isValid).toBe(false);
  });

  it('should invalidate invalid alpha', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0, alpha: 2 };
    const result = isValidColor(color);
    expect(result.isValid).toBe(false);
  });
});

describe('randomColor', () => {
  it('should generate random color', () => {
    const color = randomColor();
    expect(color.type).toBe(ColorSpace.RGB);
    expect(color.red).toBeGreaterThanOrEqual(0);
    expect(color.red).toBeLessThanOrEqual(255);
  });
});

describe('randomColorWithConstraints', () => {
  it('should generate color with constraints', () => {
    const color = randomColorWithConstraints({
      minLightness: 50,
      maxLightness: 100,
    });
    expect(color.type).toBe(ColorSpace.RGB);
  });
});

describe('complementaryColor', () => {
  it('should get complementary color', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = complementaryColor(color);
    expect(result.type).toBe(ColorSpace.RGB);
  });
});

describe('analogousColors', () => {
  it('should get analogous colors', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = analogousColors(color, 3);
    expect(result).toHaveLength(3);
  });
});

describe('triadicColors', () => {
  it('should get triadic colors', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = triadicColors(color);
    expect(result).toHaveLength(3);
  });
});

describe('splitComplementaryColors', () => {
  it('should get split complementary colors', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = splitComplementaryColors(color);
    expect(result).toHaveLength(3);
  });
});

describe('tetradicColors', () => {
  it('should get tetradic colors', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = tetradicColors(color);
    expect(result).toHaveLength(4);
  });
});

describe('monochromaticColors', () => {
  it('should get monochromatic colors', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = monochromaticColors(color, 5);
    expect(result).toHaveLength(5);
  });
});

describe('colorToString', () => {
  it('should convert to hex', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = colorToString(color, 'hex');
    expect(result).toBe('#ff0000');
  });

  it('should convert to rgb', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = colorToString(color, 'rgb');
    expect(result).toBe('rgb(255, 0, 0)');
  });

  it('should convert to rgba', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0, alpha: 0.5 };
    const result = colorToString(color, 'rgb');
    expect(result).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('should convert to hsl', () => {
    const color = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
    const result = colorToString(color, 'hsl');
    expect(result).toContain('hsl');
  });
});

describe('getNamedColors', () => {
  it('should return all named colors', () => {
    const colors = getNamedColors();
    expect(colors.red).toBe('#ff0000');
    expect(colors.blue).toBe('#0000ff');
  });
});

describe('isNamedColor', () => {
  it('should return true for named color', () => {
    expect(isNamedColor('red')).toBe(true);
  });

  it('should return false for non-named color', () => {
    expect(isNamedColor('notacolor')).toBe(false);
  });
});

describe('getNamedColorHex', () => {
  it('should get hex for named color', () => {
    const result = getNamedColorHex('red');
    expect(result).toBe('#ff0000');
  });

  it('should return undefined for non-named color', () => {
    const result = getNamedColorHex('notacolor');
    expect(result).toBeUndefined();
  });
});
