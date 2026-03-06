import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Dimensões da imagem original
const IMAGE_WIDTH = 1536;
const IMAGE_HEIGHT = 1024;
const LOGO_HEIGHT = IMAGE_HEIGHT / 2; // 512px cada logo

export function LogoHeader() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  // No modo escuro, queremos o logo branco (parte inferior)
  // No modo claro, queremos o logo preto (parte superior)
  const source = require('../../assets/logo_trans.png');

  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[
          styles.logo,
          {
            transform: [
              {
                translateY: isDark ? -LOGO_HEIGHT : 0,
              },
            ],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 40,
    overflow: 'hidden',
  },
  logo: {
    width: 120 * (IMAGE_WIDTH / LOGO_HEIGHT),
    height: LOGO_HEIGHT,
  },
});