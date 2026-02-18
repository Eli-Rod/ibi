export type ColorMode = 'light' | 'dark' | 'system';

export const palette = {
  primary: '#1E4DD8',
  bgLight: '#FFFFFF',
  bgDark: '#0B0B0C',
  textLight: '#0B0B0C',
  textDark: '#F5F6F7',
  mutedLight: '#6B7280',
  mutedDark: '#9CA3AF',
  cardLight: '#FFFFFF',
  cardDark: '#121317',
  borderLight: '#E5E7EB',
  borderDark: '#1F2937',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export type Theme = {
  mode: ColorMode;
  colors: {
    background: string;
    text: string;
    muted: string;
    card: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    notification: string; // exigido pelo React Navigation
  };
  spacing: (n: number) => number;
  radius: number;
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
};

import { Appearance } from 'react-native';

export function buildTheme(mode: ColorMode, overrides?: Partial<Theme>): Theme {
  const isSystem = mode === 'system';
  const systemMode = Appearance.getColorScheme() || 'light';
  const activeMode = isSystem ? systemMode : mode;
  const dark = activeMode === 'dark';
  const base: Theme = {
    mode,
    colors: {
      background: dark ? palette.bgDark : palette.bgLight,
      text: dark ? palette.textDark : palette.textLight,
      muted: dark ? palette.mutedDark : palette.mutedLight,
      card: dark ? palette.cardDark : palette.cardLight,
      border: dark ? palette.borderDark : palette.borderLight,
      primary: palette.primary,
      success: palette.success,
      warning: palette.warning,
      danger: palette.danger,
      notification: palette.primary,
    },
    spacing: (n) => n * 8,
    radius: 12,
    // 🔒 SEMPRE presente
    fonts: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
  };

  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...(overrides?.colors || {}) },
    fonts: { ...base.fonts, ...(overrides?.fonts || {}) }, // 🔒 mantém chaves
  };
}