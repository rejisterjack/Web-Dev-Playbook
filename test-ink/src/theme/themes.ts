/**
 * Predefined Themes Module
 * 
 * Defines predefined themes for the TUI framework including light, dark,
 * high contrast, and monochrome themes.
 */

import type { Theme } from './theme-types.js';
import { ColorSpace } from './types.js';

/**
 * Light theme
 */
export const lightTheme: Theme = {
  name: 'light',
  type: 'light',
  description: 'Light color scheme for daytime use',
  colors: {
    primary: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    primaryLight: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    primaryDark: { type: ColorSpace.RGB, red: 37, green: 99, blue: 235 },
    secondary: { type: ColorSpace.RGB, red: 107, green: 114, blue: 128 },
    secondaryLight: { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 },
    secondaryDark: { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 },
    accent: { type: ColorSpace.RGB, red: 139, green: 92, blue: 246 },
    accentLight: { type: ColorSpace.RGB, red: 167, green: 139, blue: 250 },
    accentDark: { type: ColorSpace.RGB, red: 124, green: 58, blue: 237 },
    success: { type: ColorSpace.RGB, red: 34, green: 197, blue: 94 },
    successLight: { type: ColorSpace.RGB, red: 74, green: 222, blue: 128 },
    successDark: { type: ColorSpace.RGB, red: 22, green: 163, blue: 74 },
    warning: { type: ColorSpace.RGB, red: 234, green: 179, blue: 8 },
    warningLight: { type: ColorSpace.RGB, red: 250, green: 204, blue: 21 },
    warningDark: { type: ColorSpace.RGB, red: 202, green: 138, blue: 4 },
    error: { type: ColorSpace.RGB, red: 239, green: 68, blue: 68 },
    errorLight: { type: ColorSpace.RGB, red: 248, green: 113, blue: 113 },
    errorDark: { type: ColorSpace.RGB, red: 220, green: 38, blue: 38 },
    info: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    infoLight: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    infoDark: { type: ColorSpace.RGB, red: 37, green: 99, blue: 235 },
    background: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    foreground: { type: ColorSpace.RGB, red: 17, green: 24, blue: 39 },
    surface: { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 },
    surfaceVariant: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
    textPrimary: { type: ColorSpace.RGB, red: 17, green: 24, blue: 39 },
    textSecondary: { type: ColorSpace.RGB, red: 107, green: 114, blue: 128 },
    textTertiary: { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 },
    textDisabled: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
    border: { type: ColorSpace.RGB, red: 226, green: 232, blue: 240 },
    borderLight: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
    borderDark: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
    divider: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
    focus: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    focusRing: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    selection: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    selectionForeground: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    link: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    linkVisited: { type: ColorSpace.RGB, red: 139, green: 92, blue: 246 },
    linkHover: { type: ColorSpace.RGB, red: 37, green: 99, blue: 235 },
    linkActive: { type: ColorSpace.RGB, red: 29, green: 78, blue: 216 },
    codeBackground: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
    codeForeground: { type: ColorSpace.RGB, red: 17, green: 24, blue: 39 },
    scrollbar: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
    scrollbarHover: { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 },
    scrollbarTrack: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
  },
  styles: {
    font: {
      family: 'monospace' as any,
      size: 14,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontSmall: {
      family: 'monospace' as any,
      size: 12,
      weight: 400 as any,
      lineHeight: 1.4,
    },
    fontLarge: {
      family: 'monospace' as any,
      size: 16,
      weight: 400 as any,
      lineHeight: 1.6,
    },
    fontCode: {
      family: 'monospace' as any,
      size: 13,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontHeading: {
      family: 'monospace' as any,
      size: 18,
      weight: 600 as any,
      lineHeight: 1.3,
    },
    border: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 226, green: 232, blue: 240 },
    },
    borderLight: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 241, green: 245, blue: 249 },
    },
    borderHeavy: {
      style: 'solid' as any,
      width: 2,
      color: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
    },
    shadow: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowLight: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowHeavy: {
      style: 'medium' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12,
      full: 9999,
    },
    transitionDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      modal: 1300,
      popover: 1400,
      tooltip: 1500,
    },
  },
};

/**
 * Dark theme
 */
export const darkTheme: Theme = {
  name: 'dark',
  type: 'dark',
  description: 'Dark color scheme for nighttime use',
  colors: {
    primary: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    primaryLight: { type: ColorSpace.RGB, red: 147, green: 197, blue: 253 },
    primaryDark: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    secondary: { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 },
    secondaryLight: { type: ColorSpace.RGB, red: 203, green: 213, blue: 225 },
    secondaryDark: { type: ColorSpace.RGB, red: 100, green: 116, blue: 139 },
    accent: { type: ColorSpace.RGB, red: 167, green: 139, blue: 250 },
    accentLight: { type: ColorSpace.RGB, red: 192, green: 132, blue: 252 },
    accentDark: { type: ColorSpace.RGB, red: 139, green: 92, blue: 246 },
    success: { type: ColorSpace.RGB, red: 74, green: 222, blue: 128 },
    successLight: { type: ColorSpace.RGB, red: 134, green: 239, blue: 172 },
    successDark: { type: ColorSpace.RGB, red: 34, green: 197, blue: 94 },
    warning: { type: ColorSpace.RGB, red: 250, green: 204, blue: 21 },
    warningLight: { type: ColorSpace.RGB, red: 254, green: 240, blue: 138 },
    warningDark: { type: ColorSpace.RGB, red: 234, green: 179, blue: 8 },
    error: { type: ColorSpace.RGB, red: 248, green: 113, blue: 113 },
    errorLight: { type: ColorSpace.RGB, red: 252, green: 165, blue: 165 },
    errorDark: { type: ColorSpace.RGB, red: 239, green: 68, blue: 68 },
    info: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    infoLight: { type: ColorSpace.RGB, red: 147, green: 197, blue: 253 },
    infoDark: { type: ColorSpace.RGB, red: 59, green: 130, blue: 246 },
    background: { type: ColorSpace.RGB, red: 15, green: 23, blue: 42 },
    foreground: { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 },
    surface: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
    surfaceVariant: { type: ColorSpace.RGB, red: 51, green: 65, blue: 85 },
    textPrimary: { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 },
    textSecondary: { type: ColorSpace.RGB, red: 148, green: 163, blue: 184 },
    textTertiary: { type: ColorSpace.RGB, red: 100, green: 116, blue: 139 },
    textDisabled: { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 },
    border: { type: ColorSpace.RGB, red: 51, green: 65, blue: 85 },
    borderLight: { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 },
    borderDark: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
    divider: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
    focus: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    focusRing: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    selection: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    selectionForeground: { type: ColorSpace.RGB, red: 15, green: 23, blue: 42 },
    link: { type: ColorSpace.RGB, red: 96, green: 165, blue: 250 },
    linkVisited: { type: ColorSpace.RGB, red: 167, green: 139, blue: 250 },
    linkHover: { type: ColorSpace.RGB, red: 147, green: 197, blue: 253 },
    linkActive: { type: ColorSpace.RGB, red: 129, green: 140, blue: 248 },
    codeBackground: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
    codeForeground: { type: ColorSpace.RGB, red: 248, green: 250, blue: 252 },
    scrollbar: { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 },
    scrollbarHover: { type: ColorSpace.RGB, red: 100, green: 116, blue: 139 },
    scrollbarTrack: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
  },
  styles: {
    font: {
      family: 'monospace' as any,
      size: 14,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontSmall: {
      family: 'monospace' as any,
      size: 12,
      weight: 400 as any,
      lineHeight: 1.4,
    },
    fontLarge: {
      family: 'monospace' as any,
      size: 16,
      weight: 400 as any,
      lineHeight: 1.6,
    },
    fontCode: {
      family: 'monospace' as any,
      size: 13,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontHeading: {
      family: 'monospace' as any,
      size: 18,
      weight: 600 as any,
      lineHeight: 1.3,
    },
    border: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 51, green: 65, blue: 85 },
    },
    borderLight: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 71, green: 85, blue: 105 },
    },
    borderHeavy: {
      style: 'solid' as any,
      width: 2,
      color: { type: ColorSpace.RGB, red: 30, green: 41, blue: 59 },
    },
    shadow: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowLight: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowHeavy: {
      style: 'medium' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12,
      full: 9999,
    },
    transitionDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      modal: 1300,
      popover: 1400,
      tooltip: 1500,
    },
  },
};

/**
 * High contrast theme
 */
export const highContrastTheme: Theme = {
  name: 'high-contrast',
  type: 'high-contrast',
  description: 'High contrast theme for accessibility',
  colors: {
    primary: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    primaryLight: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    primaryDark: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    secondary: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    secondaryLight: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    secondaryDark: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    accent: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 },
    accentLight: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 },
    accentDark: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 },
    success: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 },
    successLight: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 },
    successDark: { type: ColorSpace.RGB, red: 0, green: 255, blue: 0 },
    warning: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    warningLight: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    warningDark: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    error: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
    errorLight: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
    errorDark: { type: ColorSpace.RGB, red: 255, green: 0, blue: 0 },
    info: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    infoLight: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    infoDark: { type: ColorSpace.RGB, red: 0, green: 0, blue: 255 },
    background: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    foreground: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    surface: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    surfaceVariant: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    textPrimary: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    textSecondary: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    textTertiary: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    textDisabled: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    border: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    borderLight: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    borderDark: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    divider: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    focus: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    focusRing: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    selection: { type: ColorSpace.RGB, red: 255, green: 255, blue: 0 },
    selectionForeground: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    link: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 },
    linkVisited: { type: ColorSpace.RGB, red: 255, green: 0, blue: 255 },
    linkHover: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 },
    linkActive: { type: ColorSpace.RGB, red: 0, green: 255, blue: 255 },
    codeBackground: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    codeForeground: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    scrollbar: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    scrollbarHover: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    scrollbarTrack: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
  },
  styles: {
    font: {
      family: 'monospace' as any,
      size: 14,
      weight: 700 as any,
      lineHeight: 1.5,
    },
    fontSmall: {
      family: 'monospace' as any,
      size: 12,
      weight: 700 as any,
      lineHeight: 1.4,
    },
    fontLarge: {
      family: 'monospace' as any,
      size: 16,
      weight: 700 as any,
      lineHeight: 1.6,
    },
    fontCode: {
      family: 'monospace' as any,
      size: 13,
      weight: 700 as any,
      lineHeight: 1.5,
    },
    fontHeading: {
      family: 'monospace' as any,
      size: 18,
      weight: 700 as any,
      lineHeight: 1.3,
    },
    border: {
      style: 'solid' as any,
      width: 2,
      color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    },
    borderLight: {
      style: 'solid' as any,
      width: 2,
      color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    },
    borderHeavy: {
      style: 'solid' as any,
      width: 3,
      color: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    },
    shadow: {
      style: 'none' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowLight: {
      style: 'none' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowHeavy: {
      style: 'none' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
      full: 0,
    },
    transitionDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      modal: 1300,
      popover: 1400,
      tooltip: 1500,
    },
  },
};

/**
 * Monochrome theme
 */
export const monochromeTheme: Theme = {
  name: 'monochrome',
  type: 'monochrome',
  description: 'Monochrome theme for minimal distraction',
  colors: {
    primary: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    primaryLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    primaryDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    secondary: { type: ColorSpace.RGB, red: 160, green: 160, blue: 160 },
    secondaryLight: { type: ColorSpace.RGB, red: 224, green: 224, blue: 224 },
    secondaryDark: { type: ColorSpace.RGB, red: 96, green: 96, blue: 96 },
    accent: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    accentLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    accentDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    success: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    successLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    successDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    warning: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    warningLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    warningDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    error: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    errorLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    errorDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    info: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    infoLight: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    infoDark: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    background: { type: ColorSpace.RGB, red: 255, green: 255, blue: 255 },
    foreground: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    surface: { type: ColorSpace.RGB, red: 248, green: 248, blue: 248 },
    surfaceVariant: { type: ColorSpace.RGB, red: 240, green: 240, blue: 240 },
    textPrimary: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    textSecondary: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    textTertiary: { type: ColorSpace.RGB, red: 128, green: 128, blue: 128 },
    textDisabled: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    border: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    borderLight: { type: ColorSpace.RGB, red: 224, green: 224, blue: 224 },
    borderDark: { type: ColorSpace.RGB, red: 160, green: 160, blue: 160 },
    divider: { type: ColorSpace.RGB, red: 224, green: 224, blue: 224 },
    focus: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    focusRing: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    selection: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    selectionForeground: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    link: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    linkVisited: { type: ColorSpace.RGB, red: 64, green: 64, blue: 64 },
    linkHover: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    linkActive: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    codeBackground: { type: ColorSpace.RGB, red: 248, green: 248, blue: 248 },
    codeForeground: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    scrollbar: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    scrollbarHover: { type: ColorSpace.RGB, red: 160, green: 160, blue: 160 },
    scrollbarTrack: { type: ColorSpace.RGB, red: 240, green: 240, blue: 240 },
  },
  styles: {
    font: {
      family: 'monospace' as any,
      size: 14,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontSmall: {
      family: 'monospace' as any,
      size: 12,
      weight: 400 as any,
      lineHeight: 1.4,
    },
    fontLarge: {
      family: 'monospace' as any,
      size: 16,
      weight: 400 as any,
      lineHeight: 1.6,
    },
    fontCode: {
      family: 'monospace' as any,
      size: 13,
      weight: 400 as any,
      lineHeight: 1.5,
    },
    fontHeading: {
      family: 'monospace' as any,
      size: 18,
      weight: 600 as any,
      lineHeight: 1.3,
    },
    border: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 192, green: 192, blue: 192 },
    },
    borderLight: {
      style: 'solid' as any,
      width: 1,
      color: { type: ColorSpace.RGB, red: 224, green: 224, blue: 224 },
    },
    borderHeavy: {
      style: 'solid' as any,
      width: 2,
      color: { type: ColorSpace.RGB, red: 160, green: 160, blue: 160 },
    },
    shadow: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowLight: {
      style: 'light' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    shadowHeavy: {
      style: 'medium' as any,
      color: { type: ColorSpace.RGB, red: 0, green: 0, blue: 0 },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12,
      full: 9999,
    },
    transitionDuration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1100,
      fixed: 1200,
      modal: 1300,
      popover: 1400,
      tooltip: 1500,
    },
  },
};

/**
 * Default theme (alias for light theme)
 */
export const defaultTheme = lightTheme;

/**
 * Get all predefined themes
 * @returns Array of all predefined themes
 */
export function getAllPredefinedThemes(): Theme[] {
  return [lightTheme, darkTheme, highContrastTheme, monochromeTheme];
}

/**
 * Get a predefined theme by name
 * @param name - Theme name
 * @returns Theme or undefined
 */
export function getPredefinedTheme(name: string): Theme | undefined {
  switch (name) {
    case 'light':
    case 'default':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'high-contrast':
    case 'highContrast':
      return highContrastTheme;
    case 'monochrome':
      return monochromeTheme;
    default:
      return undefined;
  }
}
