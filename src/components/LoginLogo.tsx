import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function LoginLogo() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <View style={styles.container}>
      <Image
        source={isDark 
          ? require('../../assets/ibi_ico_white_256.png')
          : require('../../assets/ibi_ico_black_256.png')
        }
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 150,
  },
});