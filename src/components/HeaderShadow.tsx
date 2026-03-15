import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function HeaderShadow() {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[
          theme.colors.card,
          'transparent',
        ]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 5,
  },
  gradient: {
    flex: 1,
  },
});