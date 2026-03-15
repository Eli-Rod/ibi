import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

// Impedir que a splash screen nativa suma automaticamente
SplashScreen.preventAutoHideAsync();

export function AnimatedSplashScreen({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  
  // Animações
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Simular carregamento de recursos (fontes, etc)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Animação de entrada do logo
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start();

        // Pequena pausa para apreciar o logo
        await new Promise(resolve => setTimeout(resolve, 600));

        // Animar texto
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Aguardar um pouco mais
        await new Promise(resolve => setTimeout(resolve, 800));

        // Animação de saída
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.5,
            duration: 500,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setAppIsReady(true);
          
          // Aguardar um frame para garantir que a animação terminou
          requestAnimationFrame(async () => {
            setSplashAnimationComplete(true);
            await SplashScreen.hideAsync();
          });
        });

      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!appIsReady || !splashAnimationComplete) {
    const isDark = theme.mode === 'dark';
    
    return (
      <Animated.View 
        style={[
          styles.container,
          { 
            backgroundColor: isDark ? '#000000' : '#ffffff',
            opacity: backgroundOpacity 
          }
        ]}
      >
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />
        
        <View style={styles.content}>
          <Animated.Image
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
          
          <Animated.Text 
            style={[
              styles.text,
              { 
                opacity: textOpacity,
                color: isDark ? '#ffffff' : '#000000',
              }
            ]}
          >
            Igreja Batista Identidade
          </Animated.Text>
        </View>
      </Animated.View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
  },
  logo: {
    width: width * 0.4,
    height: height * 0.2,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});