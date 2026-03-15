import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function HeaderIcon() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <View style={styles.container}>
      <Image
        source={isDark 
          ? require('../../assets/logo_ibi_branco_trans.png')
          : require('../../assets/logo_ibi_preto_trans.png')
        }
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  icon: {
    width: 70,
    height: 70,
  },
});