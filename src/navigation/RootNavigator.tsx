import { Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import SettingsScreen from '../screens/SettingsScreen';

import AoVivoScreen from '../screens/AoVivoScreen';
import ContribuicoesScreen from '../screens/ContribuicoesScreen';
import DevocionaisScreen from '../screens/DevocionaisScreen';
import EventosScreen from '../screens/EventosScreen';
import Home from '../screens/Home';
import IgrejaScreen from '../screens/IgrejaScreen';
import KidsScreen from '../screens/KidsScreen';
import MensagensScreen from '../screens/MensagensScreen';
import MinisteriosScreen from '../screens/MinisteriosScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import OracoesScreen from '../screens/OracoesScreen';
import PlaylistLouvorScreen from '../screens/PlaylistLouvorScreen';

import { ThemedText } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';

type DrawerParamList = {
  Home: undefined;
  Igreja: undefined;
  'Ministérios': undefined;
  'Notícias': undefined;
  'Mensagens': undefined;
  'Ao Vivo': undefined;
  'Contribuições': undefined;
  Devocionais: undefined;
  'Orações': undefined;
  Kids: undefined;
  'Playlist de Louvor': undefined;
  Eventos: undefined;
  'Configurações': undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function RootNavigator() {
  const { theme } = useTheme();

  // 🔧 Constrói o tema do Navigation com tipagem explícita
  const base = theme.mode === 'dark' ? NavDarkTheme : NavDefaultTheme;

  const navTheme = {
    ...base,
    dark: theme.mode === 'dark',
    colors: {
      ...base.colors,
      // seus overrides
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.notification,
    },
  } as unknown as NavTheme; // 👈 ignora augmentation que pede `fonts`

  return (
    <NavigationContainer theme={navTheme}>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.toggleDrawer()}
              style={{ paddingHorizontal: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Abrir menu"
            >
              <Ionicons name="menu-outline" size={24} color={theme.colors.text} />
            </Pressable>
          ),
          drawerStyle: {
            width: 290,
            backgroundColor: theme.colors.background,
          },
          sceneStyle: { backgroundColor: theme.colors.background },
        })}
      >
        <Drawer.Screen name="Home" component={Home} options={{ title: 'IBI' }} />
        <Drawer.Screen name="Igreja" component={IgrejaScreen} />
        <Drawer.Screen name="Ministérios" component={MinisteriosScreen} />
        <Drawer.Screen name="Notícias" component={NoticiasScreen} />
        <Drawer.Screen name="Mensagens" component={MensagensScreen} />
        <Drawer.Screen name="Ao Vivo" component={AoVivoScreen} />
        <Drawer.Screen name="Contribuições" component={ContribuicoesScreen} />
        <Drawer.Screen name="Devocionais" component={DevocionaisScreen} />
        <Drawer.Screen name="Orações" component={OracoesScreen} />
        <Drawer.Screen name="Kids" component={KidsScreen} />
        <Drawer.Screen name="Playlist de Louvor" component={PlaylistLouvorScreen} />
        <Drawer.Screen name="Eventos" component={EventosScreen} />
        <Drawer.Screen name="Configurações" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

/** Drawer custom */
function CustomDrawer(props: DrawerContentComponentProps) {
  const { theme } = useTheme();
  const activeKey = props.state.routeNames[props.state.index] as string;

  // Carrega avatar salvo
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  React.useEffect(() => {
    AsyncStorage.getItem('user.avatarUri').then((uri) => setAvatarUri(uri));
  }, []);

  const items: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Home', label: 'Início', icon: 'home-outline' },
    { key: 'Igreja', label: 'Igreja', icon: 'business-outline' },
    { key: 'Ministérios', label: 'Ministérios', icon: 'people-outline' },
    { key: 'Notícias', label: 'Notícias', icon: 'newspaper-outline' },
    { key: 'Mensagens', label: 'Mensagens', icon: 'videocam-outline' },
    { key: 'Ao Vivo', label: 'Ao Vivo', icon: 'radio-outline' },
    { key: 'Contribuições', label: 'Contribuições', icon: 'card-outline' },
    { key: 'Devocionais', label: 'Devocionais', icon: 'book-outline' },
    { key: 'Orações', label: 'Orações', icon: 'heart-outline' },
    { key: 'Kids', label: 'Kids', icon: 'happy-outline' },
    { key: 'Playlist de Louvor', label: 'Playlist de Louvor', icon: 'musical-notes-outline' },
    { key: 'Eventos', label: 'Eventos', icon: 'calendar-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0, backgroundColor: theme.colors.background, flexGrow: 1 }}
      >
        {/* Cabeçalho com avatar */}
        <View
          style={{
            padding: 16,
            paddingTop: 36,
            backgroundColor: theme.colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              backgroundColor: theme.colors.border,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 48, height: 48 }} />
            ) : (
              <Ionicons name="person-circle-outline" size={44} color={theme.colors.muted} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '800' }}>IBI</ThemedText>
            <ThemedText style={{ color: theme.colors.muted, marginTop: 2 }}>
              Igreja Batista Identidade
            </ThemedText>
          </View>
        </View>

        {/* Itens principais */}
        <View style={{ padding: 8, gap: 4 }}>
          {items.map((it) => {
            const focused = activeKey === it.key;
            return (
              <Pressable
                key={it.key}
                onPress={() => props.navigation.navigate(it.key as never)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: focused
                    ? theme.mode === 'dark'
                      ? '#1b1c21'
                      : '#eef2ff'
                    : 'transparent',
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={it.label}
              >
                <Ionicons
                  name={it.icon}
                  size={20}
                  color={focused ? theme.colors.primary : theme.colors.muted}
                />
                <ThemedText
                  style={{
                    fontWeight: focused ? '700' : '600',
                    color: focused ? theme.colors.primary : theme.colors.text,
                  }}
                >
                  {it.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* Espaçador para empurrar o rodapé */}
        <View style={{ flex: 1 }} />
        {/* Rodapé: Usuário/Configurações */}
        <View
          style={{
            padding: 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.border,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => props.navigation.navigate('Configurações' as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
            }}
            accessibilityRole="button"
            accessibilityLabel="Usuário e Configurações"
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
            <ThemedText style={{ fontWeight: '700' }}>Usuário</ThemedText>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}