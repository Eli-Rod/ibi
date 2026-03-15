import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

// Import dos novos componentes/contextos
import { GradientBackground } from '../components/GradientBackground';
import { HeaderIcon } from '../components/HeaderIcon';
import { HeaderShadow } from '../components/HeaderShadow'; // NOVO COMPONENTE
import { LogoHeader } from '../components/LogoHeader';
import { OnboardingModal } from '../components/OnboardingModal';
import { OnboardingProvider, useOnboarding } from '../contexts/OnboardingContext';

import AdminDevScreen from '../screens/AdminDev/AdminDevScreen';
import AoVivoScreen from '../screens/AoVivo/AoVivoScreen';
import CelulasScreen from '../screens/Celulas/CelulasScreen';
import ContribuicoesScreen from '../screens/Contribuicoes/ContribuicoesScreen';
import EditoriaisScreen from '../screens/Editoriais/EditoriaisScreen';
import EventosScreen from '../screens/Eventos/EventosScreen';
import Home from '../screens/Home/Home';
import IgrejaScreen from '../screens/Igreja/IgrejaScreen';
import KidFormScreen from '../screens/Kids/KidForm/KidFormScreen';
import KidsScreen from '../screens/Kids/KidsScreen';
import ScannerScreen from '../screens/Kids/Scanner/ScannerScreen';
import KidsAdminScreen from '../screens/KidsProfessor/KidsAdminScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Login/Register/RegisterScreen';
import MensagensScreen from '../screens/Mensagem/MensagensScreen';
import MinisteriosScreen from '../screens/Ministerios/MinisteriosScreen';
import NoticiasScreen from '../screens/Noticias/NoticiasScreen';
import OracoesScreen from '../screens/Oracoes/OracoesScreen';
import PlaylistLouvorScreen from '../screens/Playlist/PlaylistLouvorScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

import { ThemedText } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';

type DrawerParamList = {
  Home: undefined;
  Igreja: undefined;
  'Ministérios': undefined;
  'Células': undefined;
  'Notícias': undefined;
  'Mensagens': undefined;
  'Ao Vivo': undefined;
  'Contribuições': undefined;
  Editoriais: undefined;
  'Orações': undefined;
  KidsStack: undefined;
  'Playlist de Louvor': undefined;
  Eventos: undefined;
  'Perfil': undefined;
  'Kids Admin': undefined;
  'Admin Dev': undefined;
};

type KidsStackParamList = {
  KidsMain: { scannedData?: string; kidId?: string; mode?: 'checkin' | 'checkout' };
  KidForm: { kid?: any };
  Scanner: { kidId: string; mode: 'checkin' | 'checkout' };
};

type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const KidsStack = createNativeStackNavigator<KidsStackParamList>();

function KidsStackNavigator() {
  const { theme } = useTheme();
  return (
    <KidsStack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' }
    }}>
      <KidsStack.Screen name="KidsMain" component={KidsScreen} />
      <KidsStack.Screen name="KidForm" component={KidFormScreen} />
      <KidsStack.Screen name="Scanner" component={ScannerScreen} options={{ presentation: 'modal' }} />
    </KidsStack.Navigator>
  );
}

// Componente separado para a parte autenticada
function AuthenticatedApp() {
  const { theme } = useTheme();
  const { hasRole } = useAuth();
  const { needsOnboarding } = useOnboarding();

  return (
    <GradientBackground>
      {/* HeaderShadow adicionado AQUI - dentro do GradientBackground, antes do Drawer */}
      <HeaderShadow />
      <Drawer.Navigator
        initialRouteName={needsOnboarding ? "Perfil" : "Home"}
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: theme.colors.card, // Header com cor sólida
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ marginRight: 25, flexDirection: 'row', alignItems: 'center' }}>
              <HeaderIcon />
            </View>
          ),
          headerTitle: () => <LogoHeader />,
          headerTitleAlign: 'center',
          drawerStyle: {
            width: 290,
            backgroundColor: theme.colors.background,
          },
          sceneStyle: { backgroundColor: 'transparent' }, // Fundo transparente para ver o gradiente
          unmountOnBlur: true,
        })}
      >
        <Drawer.Screen
          name="Home"
          component={Home}
          options={{ title: undefined }}
        />
        <Drawer.Screen name="Igreja" component={IgrejaScreen} />
        <Drawer.Screen name="Ministérios" component={MinisteriosScreen} />
        <Drawer.Screen name="Células" component={CelulasScreen} />
        <Drawer.Screen name="Notícias" component={NoticiasScreen} />
        <Drawer.Screen name="Mensagens" component={MensagensScreen} />
        <Drawer.Screen name="Ao Vivo" component={AoVivoScreen} />
        <Drawer.Screen name="Contribuições" component={ContribuicoesScreen} />
        <Drawer.Screen name="Editoriais" component={EditoriaisScreen} />
        <Drawer.Screen name="Orações" component={OracoesScreen} />
        <Drawer.Screen
          name="KidsStack"
          component={KidsStackNavigator}
          options={{ title: 'Kids' }}
        />
        <Drawer.Screen name="Playlist de Louvor" component={PlaylistLouvorScreen} />
        <Drawer.Screen name="Eventos" component={EventosScreen} />
        <Drawer.Screen name="Perfil" component={ProfileScreen} />
        {hasRole('kids') && (
          <Drawer.Screen name="Kids Admin" component={KidsAdminScreen} options={{ title: 'Kids (Professor)' }} />
        )}
        {hasRole('admin-dev') && (
          <Drawer.Screen name="Admin Dev" component={AdminDevScreen} options={{ title: 'Gerenciador de Papéis' }} />
        )}
      </Drawer.Navigator>

      {/* Modal de onboarding global */}
      <OnboardingModal />
    </GradientBackground>
  );
}

export default function RootNavigator() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();

  const base = theme.mode === 'dark' ? NavDarkTheme : NavDefaultTheme;
  const navTheme = {
    ...base,
    dark: theme.mode === 'dark',
    colors: {
      ...base.colors,
      background: 'transparent', // Fundo transparente para ver o gradiente
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.notification,
    },
  } as unknown as NavTheme;

  if (loading) {
    return (
      <GradientBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingProvider>
        <NavigationContainer theme={navTheme}>
          {user ? (
            <AuthenticatedApp />
          ) : (
            <GradientBackground>
              <View style={{ flex: 1 }}>
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                  <AuthStack.Screen name="Login" component={LoginScreen} />
                  <AuthStack.Screen name="Cadastro" component={RegisterScreen} />
                </AuthStack.Navigator>
              </View>
            </GradientBackground>
          )}
        </NavigationContainer>
      </OnboardingProvider>
    </View>
  );
}

// CustomDrawer permanece igual
function CustomDrawer(props: DrawerContentComponentProps) {
  const { theme } = useTheme();
  const { user, hasRole, signOut } = useAuth();
  const activeKey = props.state.routeNames[props.state.index] as string;

  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();

      const profileSub = DeviceEventEmitter.addListener('profile.updated', (profileData) => {
        if (profileData) {
          updateNameFromProfile(profileData);
        }
      });

      const avatarSub = DeviceEventEmitter.addListener('avatar.updated', (uri) => {
        setAvatarUri(uri);
      });

      const channel = supabase
        .channel('profile_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'perfis',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload?.new) {
            updateNameFromProfile(payload.new);
          }
        })
        .subscribe();

      return () => {
        profileSub.remove();
        avatarSub.remove();
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchProfileData() {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('nome_completo, apelido')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        updateNameFromProfile(data);
      }

      if (user?.id) {
        const savedAvatar = await AsyncStorage.getItem(`avatar_${user.id}`);
        if (savedAvatar) {
          setAvatarUri(savedAvatar);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
    }
  }

  function updateNameFromProfile(data: any) {
    if (!data) return;

    if (data?.apelido && data.apelido.trim() !== '') {
      setDisplayName(data.apelido);
    } else if (data?.nome_completo && data.nome_completo.trim() !== '') {
      setDisplayName(data.nome_completo.split(' ')[0]);
    }
  }

  const { hasRole: userHasRole } = useAuth();

  const items: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'Home', label: 'Início', icon: 'home-outline' },
    { key: 'Igreja', label: 'Igreja', icon: 'business-outline' },
    { key: 'Ministérios', label: 'Ministérios', icon: 'list-outline' },
    { key: 'Células', label: 'Células', icon: 'people-outline' },
    { key: 'Notícias', label: 'Notícias', icon: 'newspaper-outline' },
    { key: 'Mensagens', label: 'Mensagens', icon: 'videocam-outline' },
    { key: 'Ao Vivo', label: 'Ao Vivo', icon: 'radio-outline' },
    { key: 'Contribuições', label: 'Contribuições', icon: 'card-outline' },
    { key: 'Editoriais', label: 'Editoriais', icon: 'book-outline' },
    { key: 'Orações', label: 'Orações', icon: 'heart-outline' },
    { key: 'KidsStack', label: 'Kids', icon: 'happy-outline' },
    { key: 'Playlist de Louvor', label: 'Playlist de Louvor', icon: 'headset-outline' },
    { key: 'Eventos', label: 'Eventos', icon: 'calendar-outline' },
    ...(userHasRole('kids') ? [{ key: 'Kids Admin', label: 'Kids (Professor)', icon: 'id-card-outline' as const }] : []),
    ...(userHasRole('admin-dev') ? [{ key: 'Admin Dev', label: 'Gerenciador de Papéis', icon: 'settings-outline' as const }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* View do avatar fixa com zIndex */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: 16,
          paddingTop: 36,
          backgroundColor: theme.colors.card,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 54, height: 54 }} />
          ) : (
            <Ionicons name="person-outline" size={28} color={theme.colors.muted} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '800' }}>Olá, {displayName}</ThemedText>
          <ThemedText style={{ color: theme.colors.muted, fontSize: 12 }}>
            Membro IBI
          </ThemedText>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          paddingTop: 106,
          backgroundColor: 'transparent',
          flexGrow: 1
        }}
      >
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
                    ? theme.mode === 'dark' ? '#1b1c21' : '#eef2ff'
                    : 'transparent',
                }}
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

        <View style={{ flex: 1 }} />

        <View
          style={{
            padding: 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.border,
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => props.navigation.navigate('Perfil' as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
            }}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
            <ThemedText style={{ fontWeight: '700' }}>Perfil e Configurações</ThemedText>
          </Pressable>

          <Pressable
            onPress={signOut}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <ThemedText style={{ fontWeight: '700', color: '#EF4444' }}>Sair do aplicativo</ThemedText>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}