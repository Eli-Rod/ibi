import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

export function ThemedSplashScreen({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const backgroundFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function animate() {
      await SplashScreen.hideAsync();

      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(logoScale, {
              toValue: 0.5,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(backgroundFade, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsReady(true);
          });
        }, 1500);
      });
    }

    animate();
  }, []);

  if (!isReady) {
    const isDark = theme.mode === 'dark';

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#000000' : '#ffffff',
            opacity: backgroundFade
          }
        ]}
      >
        <StatusBar hidden />
        <Image
          source={isDark
            ? require('../../assets/logo_ibi_branco_trans.png')
            : require('../../assets/logo_ibi_preto_trans.png')
          }
          style={[
            styles.logo,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logo: {
    width: width * 0.4,
    height: height * 0.2,
  },
});