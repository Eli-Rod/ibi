import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function PrimaryGradientBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  const primary = theme.colors.primary;

  // Converter cor hex para rgba com baixa opacidade
  const hexToRgba = (hex: string, opacity: number): ColorValue => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})` as ColorValue;
  };

  const colors: [ColorValue, ColorValue, ColorValue, ColorValue] = isDark
    ? [
      '#000000',
      hexToRgba(primary, 0.02),
      hexToRgba(primary, 0.04),
      '#000000',
    ]
    : [
      '#ffffff',
      hexToRgba(primary, 0.01),
      hexToRgba(primary, 0.02),
      '#ffffff',
    ];

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </LinearGradient>
  );
}