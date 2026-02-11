// App.tsx
import { DarkTheme, DefaultTheme, NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import AoVivoScreen from './src/screens/AoVivoScreen';
import ContribuicoesScreen from './src/screens/ContribuicoesScreen';
import DevocionaisScreen from './src/screens/DevocionaisScreen';
import EventosScreen from './src/screens/EventosScreen';
import Home from './src/screens/Home';
import IgrejaScreen from './src/screens/IgrejaScreen';
import KidsScreen from './src/screens/KidsScreen';
import MensagensScreen from './src/screens/MensagensScreen';
import MinisteriosScreen from './src/screens/MinisteriosScreen';
import NoticiasScreen from './src/screens/NoticiasScreen';
import OracoesScreen from './src/screens/OracoesScreen';
import PlaylistLouvorScreen from './src/screens/PlaylistLouvorScreen';

import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();
  console.log('@@ THEME CHECK', theme && theme.fonts);

  // Tema base do React Navigation
  const navThemeBase = {
    dark: theme.mode === 'dark',
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
  } as unknown as NavTheme;

  // 🔧 HOTFIX: injeta 'fonts' no tema do Navigation para evitar crash
  // caso algum componente importe useTheme de @react-navigation/native por engano
  const navThemePatched = {
    ...(navThemeBase as any),
    fonts: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
  } as any;

  return (
    <NavigationContainer theme={navThemePatched}>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="Home" component={Home} options={{ title: 'IBI' }} />
        <Stack.Screen name="Igreja" component={IgrejaScreen} />
        <Stack.Screen name="Ministérios" component={MinisteriosScreen} />
        <Stack.Screen name="Notícias" component={NoticiasScreen} />
        <Stack.Screen name="Mensagens" component={MensagensScreen} />
        <Stack.Screen name="Ao Vivo" component={AoVivoScreen} />
        <Stack.Screen name="Contribuições" component={ContribuicoesScreen} />
        <Stack.Screen name="Devocionais" component={DevocionaisScreen} />
        <Stack.Screen name="Orações" component={OracoesScreen} />
        <Stack.Screen name="Kids" component={KidsScreen} />
        <Stack.Screen name="Playlist de Louvor" component={PlaylistLouvorScreen} />
        <Stack.Screen name="Eventos" component={EventosScreen} />
      </Stack.Navigator>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}