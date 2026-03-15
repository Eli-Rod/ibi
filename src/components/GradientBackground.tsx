import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGradient } from '../contexts/GradientContext';
import { useTheme } from '../theme/ThemeProvider';

type GradientBackgroundProps = {
  children: React.ReactNode;
};

export function GradientBackground({ children }: GradientBackgroundProps) {
  const { theme } = useTheme();
  const { intensity } = useGradient(); // Pega a intensidade do contexto
  const isDark = theme.mode === 'dark';

  // Ajustar a "força" do degradê baseado na intensidade
  const getHeaderDuration = () => {
    switch (intensity) {
      case 'light': return 0.15;
      case 'medium': return 0.3;
      case 'strong': return 0.45;
      default: return 0.3;
    }
  };

  const headerColor = theme.colors.card;
  
  const bottomColor = isDark 
    ? '#797979'  // Sua cor para tema escuro
    : '#737373'; // Sua cor para tema claro

  const headerDuration = getHeaderDuration();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[headerColor, headerColor, bottomColor]}
        locations={[0, headerDuration, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});