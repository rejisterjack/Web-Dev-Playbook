# Theming Guide

Comprehensive guide to the TUI Framework's theming system, including color management, predefined themes, and custom theme creation.

## Table of Contents

- [Introduction](#introduction)
- [Color System](#color-system)
- [Color Spaces](#color-spaces)
- [Color Manipulation](#color-manipulation)
- [Contrast and Accessibility](#contrast-and-accessibility)
- [Theme Structure](#theme-structure)
- [Predefined Themes](#predefined-themes)
- [Custom Themes](#custom-themes)
- [Gradients](#gradients)
- [Best Practices](#best-practices)

## Introduction

The TUI Framework provides a comprehensive theming system that supports multiple color spaces, automatic color fallback, and accessibility-compliant color combinations.

### Key Features

- **Multiple Color Spaces**: RGB, HSL, HWB, CMYK, Hex, and Named colors
- **TrueColor Support**: Full 24-bit RGB with automatic fallback
- **Color Manipulation**: Lighten, darken, saturate, and more
- **Accessibility**: WCAG-compliant contrast ratios
- **Dynamic Themes**: Runtime theme switching
- **Gradients**: Linear and radial gradients

## Color System

### Color Types

The framework supports multiple color representations:

```typescript
type Color = RGBColor | HSLColor | HWBColor | CMYKColor | HexColor | NamedColor;

// RGB (Red, Green, Blue)
interface RGBColor {
  type: ColorSpace.RGB;
  red: number;      // 0-255
  green: number;    // 0-255
  blue: number;     // 0-255
  alpha?: number;   // 0-1
}

// HSL (Hue, Saturation, Lightness)
interface HSLColor {
  type: ColorSpace.HSL;
  hue: number;           // 0-360
  saturation: number;    // 0-100
  lightness: number;     // 0-100
  alpha?: number;        // 0-1
}

// HWB (Hue, Whiteness, Blackness)
interface HWBColor {
  type: ColorSpace.HWB;
  hue: number;        // 0-360
  whiteness: number;  // 0-100
  blackness: number;  // 0-100
  alpha?: number;     // 0-1
}

// CMYK (Cyan, Magenta, Yellow, Key/Black)
interface CMYKColor {
  type: ColorSpace.CMYK;
  cyan: number;     // 0-100
  magenta: number;  // 0-100
  yellow: number;   // 0-100
  key: number;      // 0-100
  alpha?: number;   // 0-1
}

// Hexadecimal
interface HexColor {
  type: 'hex';
  value: string;  // #RRGGBB or #RRGGBBAA
}

// Named colors
interface NamedColor {
  type: 'named';
  name: string;  // 'red', 'blue', etc.
}
```

### Terminal Color Support

```typescript
enum TerminalColorSupport {
  Monochrome = 1,       // No colors
  Basic16 = 16,         // 16 standard colors
  Extended256 = 256,    // 256 color palette
  TrueColor = 16777216, // 16.7 million colors (24-bit)
}
```

The framework automatically detects terminal capabilities and falls back to the best available color mode.

## Color Spaces

### RGB (Red, Green, Blue)

The most common color space for digital displays.

```typescript
import { rgb } from 'tui-framework';

// Create RGB colors
const red: RGBColor = {
  type: ColorSpace.RGB,
  red: 255,
  green: 0,
  blue: 0,
};

// With alpha
const semiTransparent: RGBColor = {
  type: ColorSpace.RGB,
  red: 0,
  green: 128,
  blue: 255,
  alpha: 0.5,
};

// Helper function
const blue = rgb(0, 0, 255);
```

### HSL (Hue, Saturation, Lightness)

Intuitive for color manipulation and theming.

```typescript
import { hsl } from 'tui-framework';

// Create HSL colors
const red: HSLColor = {
  type: ColorSpace.HSL,
  hue: 0,           // Red
  saturation: 100,  // Fully saturated
  lightness: 50,    // Medium lightness
};

// Helper function
const blue = hsl(240, 100, 50);

// HSL is great for creating color variations
const lightBlue = hsl(240, 100, 75);  // Increase lightness
const darkBlue = hsl(240, 100, 25);   // Decrease lightness
const paleBlue = hsl(240, 50, 50);    // Decrease saturation
```

**Visual HSL Guide:**

```
Hue (0-360):
0°    60°   120°  180°  240°  300°  360°
Red  Yel  Grn   Cyn   Blu   Mag   Red

Saturation (0-100):
0%        50%       100%
Gray ─────┼───────── Color

Lightness (0-100):
0%   25%   50%   75%   100%
Blk  Dark  Base  Light White
```

### Hex Colors

Web-standard hexadecimal notation.

```typescript
import { hex } from 'tui-framework';

// Short form
const red = hex('#f00');

// Long form
const blue = hex('#0000ff');

// With alpha
const semiTransparent = hex('#0000ff80');

// RGB to Hex
const hexValue = rgbToHex({ type: ColorSpace.RGB, red: 255, green: 0, blue: 0 });
// Returns: '#ff0000'

// Hex to RGB
const rgb = hexToRgb('#ff0000');
// Returns: { type: 'rgb', red: 255, green: 0, blue: 0 }
```

### Named Colors

Standard CSS color names.

```typescript
import { named } from 'tui-framework';

const red = named('red');
const blue = named('cornflowerblue');
const transparent = named('transparent');

// All CSS named colors are supported:
// red, blue, green, black, white, gray, etc.
// cornflowerblue, rebeccapurple, etc.
```

## Color Manipulation

### Lighten and Darken

```typescript
import { lighten, darken, hsl } from 'tui-framework';

const baseColor = hsl(220, 80, 50);  // Bright blue

// Lighten by 20%
const lighter = lighten(baseColor, 20);
// hsl(220, 80, 70)

// Darken by 20%
const darker = darken(baseColor, 20);
// hsl(220, 80, 30)

// Create a monochromatic palette
const palette = {
  100: lighten(baseColor, 40),
  200: lighten(baseColor, 30),
  300: lighten(baseColor, 20),
  400: lighten(baseColor, 10),
  500: baseColor,
  600: darken(baseColor, 10),
  700: darken(baseColor, 20),
  800: darken(baseColor, 30),
  900: darken(baseColor, 40),
};
```

### Saturate and Desaturate

```typescript
import { saturate, desaturate, hsl } from 'tui-framework';

const baseColor = hsl(220, 50, 50);  // Muted blue

// Increase saturation
const vibrant = saturate(baseColor, 30);
// hsl(220, 80, 50)

// Decrease saturation
const muted = desaturate(baseColor, 30);
// hsl(220, 20, 50)

// Grayscale
const gray = desaturate(baseColor, 100);
// hsl(220, 0, 50)
```

### Hue Rotation

```typescript
import { rotate, hsl } from 'tui-framework';

const baseColor = hsl(0, 100, 50);  // Red

// Rotate hue by 120 degrees
const green = rotate(baseColor, 120);
// hsl(120, 100, 50)

// Rotate hue by 240 degrees
const blue = rotate(baseColor, 240);
// hsl(240, 100, 50)

// Create complementary color
const complementary = rotate(baseColor, 180);
// hsl(180, 100, 50) - Cyan

// Create triadic colors
const triadic1 = baseColor;
const triadic2 = rotate(baseColor, 120);
const triadic3 = rotate(baseColor, 240);
```

### Color Mixing

```typescript
import { mix, rgb } from 'tui-framework';

const red = rgb(255, 0, 0);
const blue = rgb(0, 0, 255);

// Mix 50% red, 50% blue
const purple = mix(red, blue, 0.5);
// rgb(128, 0, 128)

// Mix 75% red, 25% blue
const reddish = mix(red, blue, 0.25);
// rgb(191, 0, 64)

// Tint (mix with white)
import { tint } from 'tui-framework';
const lightRed = tint(red, 50);

// Shade (mix with black)
import { shade } from 'tui-framework';
const darkRed = shade(red, 50);
```

### Alpha and Transparency

```typescript
import { fade, opacify, rgb } from 'tui-framework';

const color = rgb(255, 0, 0);

// Set alpha to 50%
const semiTransparent = fade(color, 0.5);

// Increase opacity by 25%
const moreOpaque = opacify(color, 0.25);

// Decrease opacity by 25%
const moreTransparent = fade(color, 0.25);
```

### Color Inversion

```typescript
import { invert, rgb } from 'tui-framework';

const red = rgb(255, 0, 0);
const cyan = invert(red);
// rgb(0, 255, 255)

// Partial inversion
const partial = invert(red, 50);
// rgb(128, 128, 128)
```

### Complementary Colors

```typescript
import { complement, hsl } from 'tui-framework';

const baseColor = hsl(30, 100, 50);  // Orange
const complementColor = complement(baseColor);
// hsl(210, 100, 50) - Blue
```

## Contrast and Accessibility

### Contrast Ratio

WCAG 2.1 defines contrast ratio requirements:

```typescript
import { getContrastRatio, getLuminance, rgb } from 'tui-framework';

const white = rgb(255, 255, 255);
const black = rgb(0, 0, 0);
const gray = rgb(128, 128, 128);

// Calculate contrast ratio
const whiteBlackRatio = getContrastRatio(white, black);
// 21:1 (maximum contrast)

const whiteGrayRatio = getContrastRatio(white, gray);
// 3.94:1 (insufficient for normal text)

// Get luminance
const luminance = getLuminance(gray);
// 0.215 (21.5% luminance)
```

### WCAG Compliance

```typescript
import { 
  isAccessible, 
  getColorAccessibility,
  ContrastLevel,
  rgb 
} from 'tui-framework';

const background = rgb(255, 255, 255);
const text = rgb(128, 128, 128);

// Check AA compliance (minimum for normal text)
const isAA = isAccessible(text, background, ContrastLevel.AA);
// false (ratio is 3.94:1, needs 4.5:1)

// Check AAA compliance (enhanced)
const isAAA = isAccessible(text, background, ContrastLevel.AAA);
// false (needs 7:1)

// Get full accessibility report
const report = getColorAccessibility(text, background);
// {
//   luminance: 0.215,
//   contrastRatio: 3.94,
//   isAccessibleAA: false,
//   isAccessibleAAA: false,
//   isAccessibleLargeTextAA: true,
//   isAccessibleLargeTextAAA: false
// }
```

**WCAG Contrast Requirements:**

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| AA    | 4.5:1       | 3:1        | 3:1           |
| AAA   | 7:1         | 4.5:1      | -             |

### Finding Accessible Colors

```typescript
import { 
  findBestAccessibleColor,
  adjustColorForContrast,
  rgb 
} from 'tui-framework';

const background = rgb(255, 255, 255);
const candidates = [
  rgb(200, 200, 200),  // Too light
  rgb(100, 100, 100),  // Good
  rgb(50, 50, 50),     // Good
  rgb(0, 0, 0),        // Best
];

// Find best accessible color
const best = findBestAccessibleColor(background, candidates, ContrastLevel.AA);
// Returns rgb(100, 100, 100) or better

// Adjust color to meet contrast requirements
const adjusted = adjustColorForContrast(
  rgb(200, 200, 200),
  background,
  ContrastLevel.AA
);
// Returns a darker gray that meets 4.5:1 ratio
```

### Recommended Text Colors

```typescript
import { getRecommendedTextColor, rgb } from 'tui-framework';

const background = rgb(100, 150, 200);

// Get recommended text color (black or white)
const textColor = getRecommendedTextColor(background);
// Returns rgb(0, 0, 0) or rgb(255, 255, 255)
```

## Theme Structure

### Theme Interface

```typescript
interface Theme {
  name: string;
  colors: ThemeColors;
  styles: ThemeStyles;
}

interface ThemeColors {
  // Background colors
  background: Color;
  backgroundSecondary: Color;
  backgroundTertiary: Color;
  
  // Text colors
  text: Color;
  textSecondary: Color;
  textMuted: Color;
  
  // Accent colors
  primary: Color;
  secondary: Color;
  accent: Color;
  
  // Semantic colors
  success: Color;
  warning: Color;
  error: Color;
  info: Color;
  
  // Border colors
  border: Color;
  borderFocus: Color;
  
  // Component-specific colors
  button: ButtonColors;
  input: InputColors;
  // ... etc
}

interface ThemeStyles {
  border: BorderStyle;
  shadow: ShadowStyle;
  // ... etc
}
```

### Creating a Theme

```typescript
import { Theme, rgb, hsl } from 'tui-framework';

const myTheme: Theme = {
  name: 'my-theme',
  colors: {
    // Backgrounds
    background: rgb(30, 30, 30),
    backgroundSecondary: rgb(45, 45, 45),
    backgroundTertiary: rgb(60, 60, 60),
    
    // Text
    text: rgb(255, 255, 255),
    textSecondary: rgb(180, 180, 180),
    textMuted: rgb(120, 120, 120),
    
    // Accents
    primary: hsl(220, 80, 60),
    secondary: hsl(280, 60, 60),
    accent: hsl(30, 100, 60),
    
    // Semantic
    success: hsl(140, 70, 45),
    warning: hsl(40, 90, 55),
    error: hsl(0, 80, 60),
    info: hsl(200, 80, 60),
    
    // Borders
    border: rgb(80, 80, 80),
    borderFocus: hsl(220, 80, 60),
    
    // Components
    button: {
      background: hsl(220, 80, 60),
      backgroundHover: hsl(220, 80, 70),
      backgroundActive: hsl(220, 80, 50),
      text: rgb(255, 255, 255),
    },
    input: {
      background: rgb(45, 45, 45),
      border: rgb(80, 80, 80),
      borderFocus: hsl(220, 80, 60),
      text: rgb(255, 255, 255),
      placeholder: rgb(120, 120, 120),
    },
  },
  styles: {
    border: {
      style: 'single',
      color: rgb(80, 80, 80),
    },
  },
};
```

### Theme Manager

```typescript
import { ThemeManager, darkTheme, lightTheme } from 'tui-framework';

const themeManager = new ThemeManager();

// Set theme
themeManager.setTheme(darkTheme);

// Switch themes
themeManager.setTheme(lightTheme);

// Register custom theme
themeManager.registerTheme('custom', myTheme);
themeManager.setThemeByName('custom');

// Get current theme
const currentTheme = themeManager.getTheme();

// Get color
const primaryColor = themeManager.getColor('primary');

// Listen for theme changes
themeManager.on('themeChange', (theme) => {
  console.log('Theme changed to:', theme.name);
});
```

## Predefined Themes

### Dark Theme

```typescript
import { darkTheme } from 'tui-framework';

// Dark theme colors:
// - Background: rgb(30, 30, 30)
// - Text: rgb(255, 255, 255)
// - Primary: hsl(220, 80, 60)
// - Success: hsl(140, 70, 45)
// - Warning: hsl(40, 90, 55)
// - Error: hsl(0, 80, 60)
```

### Light Theme

```typescript
import { lightTheme } from 'tui-framework';

// Light theme colors:
// - Background: rgb(255, 255, 255)
// - Text: rgb(30, 30, 30)
// - Primary: hsl(220, 80, 50)
// - Success: hsl(140, 70, 40)
// - Warning: hsl(40, 90, 50)
// - Error: hsl(0, 80, 55)
```

### High Contrast Theme

```typescript
import { highContrastTheme } from 'tui-framework';

// High contrast theme:
// - Pure black/white backgrounds
// - Maximum contrast text
// - Distinct accent colors
// - Designed for accessibility
```

### Monochrome Theme

```typescript
import { monochromeTheme } from 'tui-framework';

// Monochrome theme:
// - Grayscale only
// - No color accents
// - Uses patterns/bold for emphasis
```

## Custom Themes

### Creating a Brand Theme

```typescript
import { 
  Theme, 
  hsl, 
  rgb, 
  lighten, 
  darken,
  getRecommendedTextColor 
} from 'tui-framework';

// Define brand color
const brandHue = 260; // Purple
const brandPrimary = hsl(brandHue, 80, 50);

// Generate palette
const brandTheme: Theme = {
  name: 'brand',
  colors: {
    // Primary variations
    primary: brandPrimary,
    primaryLight: lighten(brandPrimary, 20),
    primaryDark: darken(brandPrimary, 20),
    
    // Backgrounds
    background: hsl(brandHue, 10, 10),
    backgroundSecondary: hsl(brandHue, 10, 15),
    backgroundTertiary: hsl(brandHue, 10, 20),
    
    // Text (automatically calculated for contrast)
    text: getRecommendedTextColor(hsl(brandHue, 10, 10)),
    textSecondary: hsl(brandHue, 10, 70),
    textMuted: hsl(brandHue, 10, 50),
    
    // Accents
    secondary: hsl((brandHue + 60) % 360, 70, 50),
    accent: hsl((brandHue + 180) % 360, 80, 60),
    
    // Semantic (adjusted for brand)
    success: hsl(140, 70, 45),
    warning: hsl(40, 90, 55),
    error: hsl(0, 80, 60),
    info: hsl(200, 80, 60),
    
    // Borders
    border: hsl(brandHue, 10, 30),
    borderFocus: brandPrimary,
  },
  styles: {
    border: { style: 'single' },
  },
};
```

### Theme Variations

```typescript
// Create light/dark variations
function createThemeVariation(
  baseHue: number,
  isDark: boolean
): Theme {
  const bgLightness = isDark ? 10 : 95;
  const textLightness = isDark ? 95 : 10;
  
  return {
    name: isDark ? 'dark' : 'light',
    colors: {
      background: hsl(baseHue, 10, bgLightness),
      text: hsl(baseHue, 10, textLightness),
      primary: hsl(baseHue, 80, 50),
      // ... etc
    },
    styles: {},
  };
}

const darkPurple = createThemeVariation(260, true);
const lightPurple = createThemeVariation(260, false);
```

### Dynamic Theme Generation

```typescript
// Generate theme from a single color
function generateThemeFromColor(
  baseColor: Color,
  name: string
): Theme {
  const hsl = toHsl(baseColor);
  
  return {
    name,
    colors: {
      primary: baseColor,
      primaryLight: lighten(baseColor, 20),
      primaryDark: darken(baseColor, 20),
      
      // Analogous colors
      secondary: rotate(baseColor, 30),
      accent: rotate(baseColor, -30),
      
      // Complementary
      complementary: rotate(baseColor, 180),
      
      // Backgrounds
      background: hsl,
      backgroundSecondary: adjust(hsl, { lightness: 10 }),
      
      // Text
      text: getRecommendedTextColor(hsl),
    },
    styles: {},
  };
}
```

## Gradients

### Linear Gradients

```typescript
import { createGradient, GradientType } from 'tui-framework';

const gradient = createGradient({
  type: GradientType.Linear,
  stops: [
    { color: rgb(255, 0, 0), position: 0 },
    { color: rgb(0, 0, 255), position: 1 },
  ],
  angle: 45, // degrees
});

// Get color at position
const colorAt50Percent = getGradientColor(gradient, 0.5);
// Returns purple (mix of red and blue)

// Render gradient
const colors = renderGradient(gradient, 10);
// Returns array of 10 colors from red to blue
```

### Multi-Stop Gradients

```typescript
const rainbowGradient = createGradient({
  type: GradientType.Linear,
  stops: [
    { color: hsl(0, 100, 50), position: 0 },    // Red
    { color: hsl(60, 100, 50), position: 0.2 }, // Yellow
    { color: hsl(120, 100, 50), position: 0.4 }, // Green
    { color: hsl(180, 100, 50), position: 0.6 }, // Cyan
    { color: hsl(240, 100, 50), position: 0.8 }, // Blue
    { color: hsl(300, 100, 50), position: 1 },   // Magenta
  ],
});
```

### Gradient Presets

```typescript
const gradients = {
  sunset: createGradient({
    type: GradientType.Linear,
    stops: [
      { color: hsl(20, 100, 60), position: 0 },
      { color: hsl(0, 80, 60), position: 0.5 },
      { color: hsl(280, 60, 40), position: 1 },
    ],
  }),
  
  ocean: createGradient({
    type: GradientType.Linear,
    stops: [
      { color: hsl(200, 80, 80), position: 0 },
      { color: hsl(220, 80, 50), position: 1 },
    ],
  }),
  
  forest: createGradient({
    type: GradientType.Linear,
    stops: [
      { color: hsl(120, 60, 70), position: 0 },
      { color: hsl(140, 80, 30), position: 1 },
    ],
  }),
};
```

## Best Practices

### 1. Use Semantic Color Names

```typescript
// ❌ Bad: Arbitrary names
const theme = {
  colors: {
    color1: rgb(255, 0, 0),
    color2: rgb(0, 255, 0),
  },
};

// ✅ Good: Semantic names
const theme = {
  colors: {
    error: rgb(255, 0, 0),
    success: rgb(0, 255, 0),
  },
};
```

### 2. Ensure Accessibility

```typescript
// ✅ Always check contrast
import { isAccessible, ContrastLevel } from 'tui-framework';

function validateTheme(theme: Theme): boolean {
  const pairs = [
    [theme.colors.text, theme.colors.background],
    [theme.colors.primary, theme.colors.background],
  ];
  
  for (const [fg, bg] of pairs) {
    if (!isAccessible(fg, bg, ContrastLevel.AA)) {
      console.warn('Theme fails accessibility check');
      return false;
    }
  }
  
  return true;
}
```

### 3. Use HSL for Variations

```typescript
// ✅ Good: HSL makes variations easy
const primary = hsl(220, 80, 50);
const primaryLight = hsl(220, 80, 70);
const primaryDark = hsl(220, 80, 30);

// ❌ Bad: RGB variations are harder
const primary = rgb(26, 115, 232);
// How do you make it lighter?
```

### 4. Limit Color Palette

```typescript
// ✅ Good: Limited, consistent palette
const theme = {
  colors: {
    primary: hsl(220, 80, 50),
    secondary: hsl(280, 60, 50),
    success: hsl(140, 70, 45),
    warning: hsl(40, 90, 55),
    error: hsl(0, 80, 60),
  },
};

// ❌ Bad: Too many colors
const theme = {
  colors: {
    red1: hsl(0, 80, 50),
    red2: hsl(5, 80, 50),
    red3: hsl(10, 80, 50),
    // ... 50 more colors
  },
};
```

### 5. Support Color Modes

```typescript
// ✅ Good: Provide both light and dark
const themes = {
  light: createLightTheme(),
  dark: createDarkTheme(),
  highContrast: createHighContrastTheme(),
};

// Auto-detect preference
const prefersDark = process.env.COLORFGBG === '0;15';
themeManager.setTheme(prefersDark ? themes.dark : themes.light);
```

### 6. Document Theme Colors

```typescript
/**
 * Theme color usage guide:
 * 
 * - primary: Main actions, links, focus states
 * - secondary: Alternative actions, less prominent elements
 * - success: Success messages, positive indicators
 * - warning: Warnings, cautionary information
 * - error: Errors, destructive actions
 * - text: Primary text content
 * - textSecondary: Subtitles, descriptions
 * - textMuted: Disabled text, placeholders
 * - background: Main background
 * - backgroundSecondary: Cards, panels
 * - backgroundTertiary: Elevated surfaces
 * - border: Dividers, borders
 * - borderFocus: Focus rings
 */
```

This guide covers the comprehensive theming system in the TUI Framework. For more details on specific functions and APIs, see the [API Reference](api.md).