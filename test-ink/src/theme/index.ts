/**
 * Theme Module
 * 
 * Comprehensive color management and theming system for the TUI framework.
 * Provides TrueColor support, color conversion, manipulation, palettes,
 * contrast calculation, theme management, caching, and gradients.
 */

// Types
export type {
  Color,
  RGBColor,
  HSLColor,
  HWBColor,
  CMYKColor,
  HexColor,
  NamedColor,
  ColorStop,
  GradientConfig,
  ColorPalette as ColorPaletteType,
  ColorAccessibility,
  ANSIColor,
  ColorCacheEntry,
  ColorValidationResult,
} from './types.js';

export {
  ColorSpace,
  GradientType,
  ContrastLevel,
  TerminalColorSupport,
} from './types.js';

// Conversion
export {
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
} from './conversion.js';

// Manipulation
export {
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
  adjust,
  tint,
  shade,
  complement,
  scale,
  getLuminance as getManipulationLuminance,
  isLight,
  isDark,
} from './manipulation.js';

// Palette
export { ColorPalette, colorPalette } from './palette.js';

// Contrast
export {
  getLuminance,
  getContrastRatio,
  getColorAccessibility,
  isAccessible,
  getAccessibleColor,
  findBestAccessibleColor,
  adjustColorForContrast,
  getContrastRating,
  isReadableOnLight,
  isReadableOnDark,
  getRecommendedTextColor,
  createContrastScale,
  validateColorCombination,
} from './contrast.js';

// Theme Types
export type {
  FontFamily,
  FontWeight,
  BorderStyle,
  ShadowStyle,
  ColorTheme,
  Font,
  Border,
  Shadow,
  Spacing,
  StyleTheme,
  ButtonTheme,
  InputTheme,
  CardTheme,
  DialogTheme,
  MenuTheme,
  ProgressTheme,
  StatusBarTheme,
  TabsTheme,
  ListTheme,
  CheckboxTheme,
  RadioTheme,
  ComponentTheme,
  Theme,
  ThemeConfig,
  ThemeInheritance,
} from './theme-types.js';

// Theme Manager
export {
  ThemeManager,
  themeManager,
  ThemeEventType,
  ThemeEventListener,
  ThemeEvent,
} from './manager.js';

// Predefined Themes
export {
  lightTheme,
  darkTheme,
  highContrastTheme,
  monochromeTheme,
  defaultTheme,
  getAllPredefinedThemes,
  getPredefinedTheme,
} from './themes.js';

// Cache
export {
  ColorCache,
  colorCache,
  CacheConfig,
  CacheStats,
  cached,
} from './cache.js';

// TrueColor Renderer
export {
  TrueColorRenderer,
  trueColorRenderer,
} from './truecolor.js';

// Gradient
export {
  Gradient,
} from './gradient.js';

// Utilities
export {
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
} from './utils.js';
