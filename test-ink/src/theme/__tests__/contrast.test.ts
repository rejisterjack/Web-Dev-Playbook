/**
 * Color Contrast Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  getContrastRatio,
  getColorAccessibility,
  isAccessible,
  getAccessibleColor,
  findBestAccessibleColor,
  getContrastRating,
  isReadableOnLight,
  isReadableOnDark,
  getRecommendedTextColor,
  validateColorCombination,
} from '../contrast.js';
import { ContrastLevel, ColorSpace, type RGBColor } from '../types.js';

const blackColor: RGBColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 };
const whiteColor: RGBColor = { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };
const redColor: RGBColor = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
const darkGrayColor: RGBColor = { type: ColorSpace.RGB, red: 50, green: 50, blue: 50 };

describe('getLuminance', () => {
  it('should calculate luminance for black', () => {
    const result = getLuminance(blackColor);
    expect(result).toBe(0);
  });

  it('should calculate luminance for white', () => {
    const result = getLuminance(whiteColor);
    expect(result).toBe(1);
  });

  it('should calculate luminance for red', () => {
    const result = getLuminance(redColor);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });
});

describe('getContrastRatio', () => {
  it('should calculate contrast ratio for black and white', () => {
    const result = getContrastRatio(blackColor, whiteColor);
    expect(result).toBe(21);
  });

  it('should calculate contrast ratio for same colors', () => {
    const result = getContrastRatio(redColor, redColor);
    expect(result).toBe(1);
  });

  it('should return value between 1 and 21', () => {
    const result = getContrastRatio(blackColor, redColor);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(21);
  });
});

describe('getColorAccessibility', () => {
  it('should return accessibility info for black on white', () => {
    const result = getColorAccessibility(blackColor, whiteColor);
    expect(result.luminance).toBe(0);
    expect(result.contrastRatio).toBe(21);
    expect(result.isAccessibleAA).toBe(true);
    expect(result.isAccessibleAAA).toBe(true);
  });

  it('should return accessibility info for low contrast', () => {
    const lightGray = { type: ColorSpace.RGB, red: 200, green: 200, blue: 200 };
    const result = getColorAccessibility(lightGray, whiteColor);
    expect(result.isAccessibleAA).toBe(false);
  });
});

describe('isAccessible', () => {
  it('should check AA compliance', () => {
    const result = isAccessible(blackColor, whiteColor, ContrastLevel.AA);
    expect(result).toBe(true);
  });

  it('should check AAA compliance', () => {
    const result = isAccessible(blackColor, whiteColor, ContrastLevel.AAA);
    expect(result).toBe(true);
  });

  it('should return false for non-compliant colors', () => {
    const lightGray = { type: ColorSpace.RGB, red: 200, green: 200, blue: 200 };
    const result = isAccessible(lightGray, whiteColor, ContrastLevel.AA);
    expect(result).toBe(false);
  });
});

describe('getAccessibleColor', () => {
  it('should return black for light background', () => {
    const result = getAccessibleColor(whiteColor);
    expect(result.red).toBe(0);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });

  it('should return white for dark background', () => {
    const result = getAccessibleColor(blackColor);
    expect(result.red).toBe(255);
    expect(result.green).toBe(255);
    expect(result.blue).toBe(255);
  });
});

describe('findBestAccessibleColor', () => {
  it('should find best accessible color from candidates', () => {
    const candidates = [
      { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
      { type: ColorSpace.RGB, red: 50, green: 50, blue: 50 },
      { type: ColorSpace.RGB, red: 100, green: 100, blue: 100 },
    ];
    const result = findBestAccessibleColor(whiteColor, candidates);
    expect(result).toBeDefined();
    expect(result?.red).toBe(0);
  });

  it('should return undefined if no color meets requirement', () => {
    const candidates = [
      { type: ColorSpace.RGB, red: 200, green: 200, blue: 200 },
      { type: ColorSpace.RGB, red: 210, green: 210, blue: 210 },
    ];
    const result = findBestAccessibleColor(whiteColor, candidates, 10);
    expect(result).toBeUndefined();
  });
});

describe('getContrastRating', () => {
  it('should return AAA for high contrast', () => {
    const result = getContrastRating(blackColor, whiteColor);
    expect(result).toBe('AAA');
  });

  it('should return AA for medium contrast', () => {
    const result = getContrastRating(darkGrayColor, whiteColor);
    expect(result).toBe('AA');
  });

  it('should return Fail for low contrast', () => {
    const lightGray = { type: ColorSpace.RGB, red: 200, green: 200, blue: 200 };
    const result = getContrastRating(lightGray, whiteColor);
    expect(result).toBe('Fail');
  });
});

describe('isReadableOnLight', () => {
  it('should return true for dark text on light background', () => {
    expect(isReadableOnLight(blackColor)).toBe(true);
  });

  it('should return false for light text on light background', () => {
    expect(isReadableOnLight(whiteColor)).toBe(false);
  });
});

describe('isReadableOnDark', () => {
  it('should return true for light text on dark background', () => {
    expect(isReadableOnDark(whiteColor)).toBe(true);
  });

  it('should return false for dark text on dark background', () => {
    expect(isReadableOnDark(blackColor)).toBe(false);
  });
});

describe('getRecommendedTextColor', () => {
  it('should return black for light background', () => {
    const result = getRecommendedTextColor(whiteColor);
    expect(result.red).toBe(0);
    expect(result.green).toBe(0);
    expect(result.blue).toBe(0);
  });

  it('should return white for dark background', () => {
    const result = getRecommendedTextColor(blackColor);
    expect(result.red).toBe(255);
    expect(result.green).toBe(255);
    expect(result.blue).toBe(255);
  });
});

describe('validateColorCombination', () => {
  it('should validate accessible combination', () => {
    const result = validateColorCombination(blackColor, whiteColor);
    expect(result.isValid).toBe(true);
    expect(result.meetsAA).toBe(true);
    expect(result.meetsAAA).toBe(true);
  });

  it('should validate for large text', () => {
    const result = validateColorCombination(darkGrayColor, whiteColor, true);
    expect(result.isValid).toBe(true);
  });

  it('should return recommended level', () => {
    const result = validateColorCombination(blackColor, whiteColor);
    expect(result.recommendedLevel).toBe(ContrastLevel.AAA);
  });
});
