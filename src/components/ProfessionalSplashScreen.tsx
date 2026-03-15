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

export function ProfessionalSplashScreen({ children }: { children: React.ReactNode }) {
  const { theme, isLoading: themeLoading } = useTheme();
  const [isReady, setIsReady] = useState(false);
  
  // Animações
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Aguardar o tema carregar
        if (themeLoading) {
          return;
        }

        // Esconder splash nativa do Expo
        await SplashScreen.hideAsync();
        
        // Pequeno delay para garantir que a tela está pronta
        await new Promise(resolve => setTimeout(resolve, 100));

        // Iniciar animação de entrada
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
        ]).start();

        // Texto aparece depois
        setTimeout(() => {
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 1200);

        // Manter por 2 segundos e depois mostrar o app
        setTimeout(() => {
          setIsReady(true);
        }, 3000);

      } catch (e) {
        console.warn('Erro na splash screen:', e);
        setIsReady(true);
      }
    }

    prepare();
  }, [themeLoading]);

  if (!isReady) {
    const isDark = theme.mode === 'dark';
    
    return (
      <View 
        style={[
          styles.container,
          { backgroundColor: isDark ? '#000000' : '#ffffff' }
        ]}
      >
        <StatusBar hidden />
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
      </View>
    );
  }

  // Quando a splash terminar, o AppContainer já terá o fundo correto
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
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
  },
});