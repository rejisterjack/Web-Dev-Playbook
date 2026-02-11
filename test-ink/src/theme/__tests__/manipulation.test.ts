/**
 * Color Manipulation Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  lighten,
  darken,
  saturate,
  desaturate,
  rotate,
  mix,
  fade,
  opacify,
  grayscale,
  invert,
  tint,
  shade,
  complement,
  scale,
  isLight,
  isDark,
} from '../manipulation.js';
import { ColorSpace } from '../types.js';

const redColor = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 };
const blueColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 };
const whiteColor = { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 };
const blackColor = { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 };

describe('lighten', () => {
  it('should lighten a color', () => {
    const result = lighten(blackColor, 50);
    expect(result.lightness).toBeGreaterThan(0);
  });

  it('should clamp to maximum lightness', () => {
    const result = lighten(whiteColor, 50);
    expect(result.lightness).toBeLessThanOrEqual(100);
  });
});

describe('darken', () => {
  it('should darken a color', () => {
    const result = darken(whiteColor, 50);
    expect(result.lightness).toBeLessThan(100);
  });

  it('should clamp to minimum lightness', () => {
    const result = darken(blackColor, 50);
    expect(result.lightness).toBeGreaterThanOrEqual(0);
  });
});

describe('saturate', () => {
  it('should increase saturation', () => {
    const grayColor = { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 };
    const result = saturate(grayColor, 50);
    expect(result.saturation).toBeGreaterThan(0);
  });

  it('should clamp to maximum saturation', () => {
    const result = saturate(redColor, 50);
    expect(result.saturation).toBeLessThanOrEqual(100);
  });
});

describe('desaturate', () => {
  it('should decrease saturation', () => {
    const result = desaturate(redColor, 50);
    expect(result.saturation).toBeLessThan(100);
  });

  it('should clamp to minimum saturation', () => {
    const result = desaturate(redColor, 100);
    expect(result.saturation).toBeGreaterThanOrEqual(0);
  });
});

describe('rotate', () => {
  it('should rotate hue by degrees', () => {
    const result = rotate(redColor, 90);
    expect(result.hue).toBe(90);
  });

  it('should handle negative rotation', () => {
    const result = rotate(redColor, -90);
    expect(result.hue).toBe(270);
  });

  it('should wrap around 360 degrees', () => {
    const result = rotate(redColor, 450);
    expect(result.hue).toBe(90);
  });
});

describe('mix', () => {
  it('should mix two colors equally', () => {
    const result = mix(redColor, blueColor, 0.5);
    expect(result.red).toBe(128);
    expect(result.blue).toBe(128);
  });

  it('should respect weight parameter', () => {
    const result = mix(redColor, blueColor, 0.75);
    expect(result.red).toBeGreaterThan(result.blue);
  });

  it('should handle alpha values', () => {
    const redWithAlpha = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0, alpha: 0.5 };
    const blueWithAlpha = { type: ColorSpace.RGB, red: 0, green: 0, blue: 255, alpha: 1 };
    const result = mix(redWithAlpha, blueWithAlpha, 0.5);
    expect(result.alpha).toBe(0.75);
  });
});

describe('fade', () => {
  it('should set opacity', () => {
    const result = fade(redColor, 0.5);
    expect(result.alpha).toBe(0.5);
  });

  it('should clamp opacity to valid range', () => {
    const result = fade(redColor, 1.5);
    expect(result.alpha).toBe(1);
  });
});

describe('opacify', () => {
  it('should increase opacity', () => {
    const fadedColor = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0, alpha: 0.5 };
    const result = opacify(fadedColor, 0.3);
    expect(result.alpha).toBe(0.8);
  });

  it('should clamp to maximum opacity', () => {
    const fadedColor = { type: ColorSpace.RGB, red: 255, green: 0, blue: 0, alpha: 0.5 };
    const result = opacify(fadedColor, 1);
    expect(result.alpha).toBe(1);
  });
});

describe('grayscale', () => {
  it('should convert color to grayscale', () => {
    const result = grayscale(redColor);
    expect(result.red).toBe(result.green);
    expect(result.green).toBe(result.blue);
  });
});

describe('invert', () => {
  it('should invert color', () => {
    const result = invert(redColor);
    expect(result.red).toBe(0);
    expect(result.green).toBe(255);
    expect(result.blue).toBe(255);
  });
});

describe('tint', () => {
  it('should mix with white', () => {
    const result = tint(redColor, 50);
    expect(result.red).toBeGreaterThan(128);
    expect(result.green).toBeGreaterThan(0);
    expect(result.blue).toBeGreaterThan(0);
  });
});

describe('shade', () => {
  it('should mix with black', () => {
    const result = shade(whiteColor, 50);
    expect(result.red).toBeLessThan(255);
    expect(result.green).toBeLessThan(255);
    expect(result.blue).toBeLessThan(255);
  });
});

describe('complement', () => {
  it('should return complementary color', () => {
    const result = complement(redColor);
    expect(result.hue).toBe(180);
  });
});

describe('scale', () => {
  it('should create color scale', () => {
    const result = scale(redColor, blueColor, 5);
    expect(result).toHaveLength(5);
    expect(result[0].red).toBe(255);
    expect(result[4].blue).toBe(255);
  });

  it('should throw error for less than 2 steps', () => {
    expect(() => scale(redColor, blueColor, 1)).toThrow();
  });
});

describe('isLight', () => {
  it('should identify light colors', () => {
    expect(isLight(whiteColor)).toBe(true);
  });

  it('should identify dark colors as not light', () => {
    expect(isLight(blackColor)).toBe(false);
  });
});

describe('isDark', () => {
  it('should identify dark colors', () => {
    expect(isDark(blackColor)).toBe(true);
  });

  it('should identify light colors as not dark', () => {
    expect(isDark(whiteColor)).toBe(false);
  });
});
