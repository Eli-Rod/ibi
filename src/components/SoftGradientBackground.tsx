import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function SoftGradientBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  // Versão mais suave - quase imperceptível
  const colors: [ColorValue, ColorValue, ColorValue] = isDark
    ? ['#000000', '#0a0a0a', '#000000']
    : ['#ffffff', '#f8f8f8', '#ffffff'];

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    >
      {children}
    </LinearGradient>
  );
}