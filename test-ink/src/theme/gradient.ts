/**
 * Gradient Module
 * 
 * Provides the Gradient class for creating and managing color gradients.
 * Supports linear and radial gradients with multiple color stops.
 */

import type { Color, RGBColor, ColorStop, GradientConfig } from './types.js';
import { ColorSpace, GradientType } from './types.js';
import { toRgb } from './conversion.js';

/**
 * Interpolate between two RGB colors
 */
function interpolateColor(color1: RGBColor, color2: RGBColor, t: number): RGBColor {
  return {
    type: ColorSpace.RGB,
    red: Math.round(color1.red + (color2.red - color1.red) * t),
    green: Math.round(color1.green + (color2.green - color1.green) * t),
    blue: Math.round(color1.blue + (color2.blue - color1.blue) * t),
    alpha: color1.alpha !== undefined && color2.alpha !== undefined
      ? color1.alpha + (color2.alpha - color1.alpha) * t
      : undefined,
  };
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sort color stops by position
 */
function sortStops(stops: ColorStop[]): ColorStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

/**
 * Validate color stops
 */
function validateStops(stops: ColorStop[]): void {
  if (stops.length < 2) {
    throw new Error('Gradient must have at least 2 color stops');
  }

  for (const stop of stops) {
    if (stop.position < 0 || stop.position > 1) {
      throw new Error(`Color stop position must be between 0 and 1, got ${stop.position}`);
    }
  }
}

/**
 * Gradient class for creating and managing color gradients
 */
export class Gradient {
  private type: GradientType;
  private stops: ColorStop[];
  private angle: number;

  constructor(config: GradientConfig) {
    this.type = config.type;
    this.stops = sortStops(config.stops);
    this.angle = config.angle ?? 0;

    validateStops(this.stops);
  }

  /**
   * Create a linear gradient
   */
  static linear(stops: ColorStop[], angle: number = 0): Gradient {
    return new Gradient({
      type: GradientType.Linear,
      stops,
      angle,
    });
  }

  /**
   * Create a radial gradient
   */
  static radial(stops: ColorStop[]): Gradient {
    return new Gradient({
      type: GradientType.Radial,
      stops,
    });
  }

  /**
   * Create a simple two-color gradient
   */
  static simple(startColor: Color, endColor: Color): Gradient {
    return Gradient.linear([
      { color: startColor, position: 0 },
      { color: endColor, position: 1 },
    ]);
  }

  /**
   * Get the gradient type
   */
  getType(): GradientType {
    return this.type;
  }

  /**
   * Get the gradient angle (for linear gradients)
   */
  getAngle(): number {
    return this.angle;
  }

  /**
   * Set the gradient angle (for linear gradients)
   */
  setAngle(angle: number): void {
    this.angle = angle;
  }

  /**
   * Get all color stops
   */
  getStops(): ColorStop[] {
    return [...this.stops];
  }

  /**
   * Get a color at a specific position
   * @param position - Position in the gradient (0-1)
   * @returns Color at the specified position
   */
  getColorAt(position: number): RGBColor {
    position = clamp(position, 0, 1);

    // Find the two stops to interpolate between
    let startStop = this.stops[0];
    let endStop = this.stops[this.stops.length - 1];

    for (let i = 0; i < this.stops.length - 1; i++) {
      if (position >= this.stops[i].position && position <= this.stops[i + 1].position) {
        startStop = this.stops[i];
        endStop = this.stops[i + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const range = endStop.position - startStop.position;
    const t = range === 0 ? 0 : (position - startStop.position) / range;

    return interpolateColor(toRgb(startStop.color), toRgb(endStop.color), t);
  }

  /**
   * Add a color stop
   */
  addStop(color: Color, position: number): void {
    this.stops.push({ color, position: clamp(position, 0, 1) });
    this.stops = sortStops(this.stops);
  }

  /**
   * Remove a color stop at a specific position
   */
  removeStop(position: number): boolean {
    const index = this.stops.findIndex((stop) => stop.position === position);
    if (index !== -1) {
      this.stops.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update a color stop
   */
  updateStop(position: number, color: Color): boolean {
    const stop = this.stops.find((s) => s.position === position);
    if (stop) {
      stop.color = color;
      return true;
    }
    return false;
  }

  /**
   * Get an array of colors at evenly spaced positions
   * @param steps - Number of steps
   * @returns Array of colors
   */
  getColors(steps: number): RGBColor[] {
    if (steps < 1) {
      throw new Error('Steps must be at least 1');
    }

    const colors: RGBColor[] = [];
    for (let i = 0; i < steps; i++) {
      const position = steps > 1 ? i / (steps - 1) : 0;
      colors.push(this.getColorAt(position));
    }
    return colors;
  }

  /**
   * Reverse the gradient
   */
  reverse(): void {
    this.stops = this.stops.map((stop) => ({
      color: stop.color,
      position: 1 - stop.position,
    }));
    this.stops = sortStops(this.stops);
  }

  /**
   * Clone the gradient
   */
  clone(): Gradient {
    return new Gradient({
      type: this.type,
      stops: this.stops.map((stop) => ({
        color: stop.color,
        position: stop.position,
      })),
      angle: this.angle,
    });
  }

  /**
   * Convert gradient to configuration object
   */
  toConfig(): GradientConfig {
    return {
      type: this.type,
      stops: this.stops.map((stop) => ({
        color: stop.color,
        position: stop.position,
      })),
      angle: this.angle,
    };
  }

  /**
   * Create a gradient from configuration
   */
  static fromConfig(config: GradientConfig): Gradient {
    return new Gradient(config);
  }

  /**
   * Create a rainbow gradient
   */
  static rainbow(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 255, green: 165, blue: 0 }, position: 0.17 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 }, position: 0.33 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 }, position: 0.67 },
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 0.83 },
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 }, position: 1 },
    ]);
  }

  /**
   * Create a grayscale gradient
   */
  static grayscale(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 }, position: 1 },
    ]);
  }

  /**
   * Create a thermal gradient (blue to red)
   */
  static thermal(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 }, position: 0.25 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 }, position: 0.75 },
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 1 },
    ]);
  }

  /**
   * Create a spectral gradient (like a spectrum)
   */
  static spectral(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 75, green: 0, blue: 130 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 148, green: 0, blue: 211 }, position: 0.2 },
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 0.4 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 }, position: 0.6 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 }, position: 0.8 },
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 1 },
    ]);
  }

  /**
   * Create a cool gradient (cyan to blue)
   */
  static cool(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 }, position: 1 },
    ]);
  }

  /**
   * Create a warm gradient (yellow to red)
   */
  static warm(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 }, position: 1 },
    ]);
  }

  /**
   * Create a pastel gradient
   */
  static pastel(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 255, green: 179, blue: 186 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 255, green: 223, blue: 186 }, position: 0.25 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 186 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 186, green: 255, blue: 201 }, position: 0.75 },
      { color: { type: ColorSpace.RGB, red: 186, green: 225, blue: 255 }, position: 1 },
    ]);
  }

  /**
   * Create a neon gradient
   */
  static neon(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 }, position: 1 },
    ]);
  }

  /**
   * Create a sunset gradient
   */
  static sunset(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 255, green: 94, blue: 77 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 255, green: 154, blue: 0 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 255, green: 206, blue: 84 }, position: 1 },
    ]);
  }

  /**
   * Create an ocean gradient
   */
  static ocean(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 119, blue: 190 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 0, green: 180, blue: 216 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 144, green: 224, blue: 239 }, position: 1 },
    ]);
  }

  /**
   * Create a forest gradient
   */
  static forest(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 100, blue: 0 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 34, green: 139, blue: 34 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 154, green: 205, blue: 50 }, position: 1 },
    ]);
  }

  /**
   * Create a magma gradient (black to red to yellow to white)
   */
  static magma(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 127, green: 0, blue: 0 }, position: 0.33 },
      { color: { type: ColorSpace.RGB, red: 255, green: 127, blue: 0 }, position: 0.67 },
      { color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 }, position: 1 },
    ]);
  }

  /**
   * Create a viridis gradient (perceptually uniform)
   */
  static viridis(): Gradient {
    return Gradient.linear([
      { color: { type: ColorSpace.RGB, red: 68, green: 1, blue: 84 }, position: 0 },
      { color: { type: ColorSpace.RGB, red: 59, green: 82, blue: 139 }, position: 0.25 },
      { color: { type: ColorSpace.RGB, red: 33, green: 145, blue: 140 }, position: 0.5 },
      { color: { type: ColorSpace.RGB, red: 94, green: 201, blue: 98 }, position: 0.75 },
      { color: { type: ColorSpace.RGB, red: 253, green: 231, blue: 37 }, position: 1 },
    ]);
  }
}
