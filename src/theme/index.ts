// src/theme/index.ts
import { ColorSchemeName } from 'react-native';

export const palette = {
  primary: '#1E4DD8', // azul IBI (ajuste depois)
  primaryDark: '#1537A3',
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

export const theme = (scheme: ColorSchemeName) => {
  const dark = scheme === 'dark';
  return {
    dark,
    colors: {
      background: dark ? palette.bgDark : palette.bgLight,
      text: dark ? palette.textDark : palette.textLight,
      muted: dark ? palette.mutedDark : palette.mutedLight,
      card: dark ? palette.cardDark : palette.cardLight,
      border: dark ? palette.borderDark : palette.borderLight,
      primary: palette.primary,
    },
    spacing: (n: number) => n * 8,
    radius: 12,
  };
};