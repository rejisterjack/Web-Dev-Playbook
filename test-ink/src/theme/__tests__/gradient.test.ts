/**
 * Gradient Module Tests
 */

import { describe, it, expect } from 'vitest';
import { Gradient } from '../gradient.js';
import { ColorSpace, GradientType } from '../types.js';

describe('Gradient', () => {
  describe('linear', () => {
    it('should create linear gradient', () => {
      const gradient = Gradient.linear([
        { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 0 },
        { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 1 },
      ]);

      expect(gradient.getType()).toBe(GradientType.Linear);
    });

    it('should set angle', () => {
      const gradient = Gradient.linear([
        { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 0 },
        { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 1 },
      ], 45);

      expect(gradient.getAngle()).toBe(45);
    });
  });

  describe('radial', () => {
    it('should create radial gradient', () => {
      const gradient = Gradient.radial([
        { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 0 },
        { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 1 },
      ]);

      expect(gradient.getType()).toBe(GradientType.Radial);
    });
  });

  describe('simple', () => {
    it('should create simple two-color gradient', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      expect(gradient.getStops()).toHaveLength(2);
    });
  });

  describe('getColorAt', () => {
    it('should get color at start position', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const color = gradient.getColorAt(0);
      expect(color.red).toBe(255);
      expect(color.blue).toBe(0);
    });

    it('should get color at end position', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const color = gradient.getColorAt(1);
      expect(color.red).toBe(0);
      expect(color.blue).toBe(255);
    });

    it('should get color at middle position', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const color = gradient.getColorAt(0.5);
      expect(color.red).toBe(128);
      expect(color.blue).toBe(128);
    });

    it('should clamp position to valid range', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const color1 = gradient.getColorAt(-0.5);
      const color2 = gradient.getColorAt(1.5);
      expect(color1.red).toBe(255);
      expect(color2.blue).toBe(255);
    });
  });

  describe('addStop', () => {
    it('should add color stop', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      gradient.addStop({ type: ColorSpace.RGB, red: 0, green: 255, blue: 0 }, 0.5);
      expect(gradient.getStops()).toHaveLength(3);
    });
  });

  describe('removeStop', () => {
    it('should remove color stop', () => {
      const gradient = Gradient.linear([
        { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 0 },
        { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 }, position: 0.5 },
        { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 1 },
      ]);

      const result = gradient.removeStop(0.5);
      expect(result).toBe(true);
      expect(gradient.getStops()).toHaveLength(2);
    });
  });

  describe('getColors', () => {
    it('should get array of colors', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const colors = gradient.getColors(5);
      expect(colors).toHaveLength(5);
      expect(colors[0].red).toBe(255);
      expect(colors[4].blue).toBe(255);
    });

    it('should throw error for less than 1 step', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      expect(() => gradient.getColors(0)).toThrow();
    });
  });

  describe('reverse', () => {
    it('should reverse gradient', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      gradient.reverse();
      const color = gradient.getColorAt(0);
      expect(color.blue).toBe(255);
    });
  });

  describe('clone', () => {
    it('should clone gradient', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const clone = gradient.clone();
      expect(clone.getStops()).toEqual(gradient.getStops());
    });
  });

  describe('toConfig and fromConfig', () => {
    it('should convert to and from config', () => {
      const gradient = Gradient.simple(
        { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
        { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
      );

      const config = gradient.toConfig();
      const restored = Gradient.fromConfig(config);
      expect(restored.getStops()).toEqual(gradient.getStops());
    });
  });

  describe('predefined gradients', () => {
    it('should create rainbow gradient', () => {
      const gradient = Gradient.rainbow();
      expect(gradient.getStops()).toHaveLength(7);
    });

    it('should create grayscale gradient', () => {
      const gradient = Gradient.grayscale();
      const start = gradient.getColorAt(0);
      const end = gradient.getColorAt(1);
      expect(start.red).toBe(0);
      expect(end.red).toBe(255);
    });

    it('should create thermal gradient', () => {
      const gradient = Gradient.thermal();
      expect(gradient.getStops()).toHaveLength(5);
    });

    it('should create spectral gradient', () => {
      const gradient = Gradient.spectral();
      expect(gradient.getStops()).toHaveLength(6);
    });

    it('should create cool gradient', () => {
      const gradient = Gradient.cool();
      expect(gradient.getStops()).toHaveLength(2);
    });

    it('should create warm gradient', () => {
      const gradient = Gradient.warm();
      expect(gradient.getStops()).toHaveLength(2);
    });

    it('should create pastel gradient', () => {
      const gradient = Gradient.pastel();
      expect(gradient.getStops()).toHaveLength(5);
    });

    it('should create neon gradient', () => {
      const gradient = Gradient.neon();
      expect(gradient.getStops()).toHaveLength(3);
    });

    it('should create sunset gradient', () => {
      const gradient = Gradient.sunset();
      expect(gradient.getStops()).toHaveLength(3);
    });

    it('should create ocean gradient', () => {
      const gradient = Gradient.ocean();
      expect(gradient.getStops()).toHaveLength(3);
    });

    it('should create forest gradient', () => {
      const gradient = Gradient.forest();
      expect(gradient.getStops()).toHaveLength(3);
    });

    it('should create magma gradient', () => {
      const gradient = Gradient.magma();
      expect(gradient.getStops()).toHaveLength(4);
    });

    it('should create viridis gradient', () => {
      const gradient = Gradient.viridis();
      expect(gradient.getStops()).toHaveLength(5);
    });
  });
});
