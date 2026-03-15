import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContainer } from './src/components/AppContainer';
import { ProfessionalSplashScreen } from './src/components/ProfessionalSplashScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { GradientProvider } from './src/contexts/GradientContext';
import RootNavigator from './src/navigation/RootNavigator';
import LockProvider from './src/security/LockProvider';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

// Manter splash nativa visível até nossa animação começar
SplashScreen.preventAutoHideAsync();

function AppWithTheme() {
  const { theme } = useTheme();

  return (
    <AppContainer>
      <AuthProvider>
        <LockProvider>
          <RootNavigator />
        </LockProvider>
      </AuthProvider>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </AppContainer>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aguardar um pequeno momento para garantir que tudo carregou
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Erro ao preparar app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Quando o app estiver pronto, esconder a splash nativa
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Mantém a splash nativa visível
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GradientProvider>
          <ProfessionalSplashScreen>
            <AppWithTheme />
          </ProfessionalSplashScreen>
        </GradientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}