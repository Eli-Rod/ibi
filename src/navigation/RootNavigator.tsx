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

import AoVivoScreen from '../screens/AoVivoScreen';
import ContribuicoesScreen from '../screens/ContribuicoesScreen';
import DevocionaisScreen from '../screens/DevocionaisScreen';
import EventosScreen from '../screens/EventosScreen';
import Home from '../screens/Home';
import IgrejaScreen from '../screens/IgrejaScreen';
import KidFormScreen from '../screens/KidFormScreen';
import KidsAdminScreen from '../screens/KidsAdminScreen';
import KidsScreen from '../screens/KidsScreen';
import LoginScreen from '../screens/LoginScreen';
import MensagensScreen from '../screens/MensagensScreen';
import MinisteriosScreen from '../screens/MinisteriosScreen';
import NoticiasScreen from '../screens/NoticiasScreen';
import OracoesScreen from '../screens/OracoesScreen';
import PlaylistLouvorScreen from '../screens/PlaylistLouvorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ScannerScreen from '../screens/ScannerScreen';

import { ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
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
  KidsStack: undefined;
  'Playlist de Louvor': undefined;
  Eventos: undefined;
  'Perfil': undefined;
  'Kids Admin': undefined;
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
      contentStyle: { backgroundColor: theme.colors.background }
    }}>
      <KidsStack.Screen name="KidsMain" component={KidsScreen} />
      <KidsStack.Screen name="KidForm" component={KidFormScreen} />
      <KidsStack.Screen name="Scanner" component={ScannerScreen} options={{ presentation: 'modal' }} />
    </KidsStack.Navigator>
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
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.notification,
    },
  } as unknown as NavTheme;

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
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
              >
                <Ionicons name="menu-outline" size={24} color={theme.colors.text} />
              </Pressable>
            ),
            drawerStyle: {
              width: 290,
              backgroundColor: theme.colors.background,
            },
            sceneStyle: { backgroundColor: theme.colors.background },
            unmountOnBlur: true, // Garante que a navegação resete ao sair da aba
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
          <Drawer.Screen name="KidsStack" component={KidsStackNavigator} options={{ title: 'Kids' }} />
          <Drawer.Screen name="Playlist de Louvor" component={PlaylistLouvorScreen} />
          <Drawer.Screen name="Eventos" component={EventosScreen} />
          <Drawer.Screen name="Perfil" component={ProfileScreen} />
          <Drawer.Screen name="Kids Admin" component={KidsAdminScreen} options={{ title: 'Kids (Professor)' }} />
        </Drawer.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Cadastro" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

function CustomDrawer(props: DrawerContentComponentProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const activeKey = props.state.routeNames[props.state.index] as string;

  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfileData();
      
      // Listener para atualização instantânea da foto
      const sub = DeviceEventEmitter.addListener('user.avatarUpdated', (uri) => {
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
          updateNameFromProfile(payload.new);
        })
        .subscribe();

      return () => {
        sub.remove();
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchProfileData() {
    const { data } = await supabase
      .from('perfis')
      .select('nome_completo, apelido')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      updateNameFromProfile(data);
    } else {
      setDisplayName(user?.email?.split('@')[0] || 'Membro');
    }

    const savedAvatar = await AsyncStorage.getItem('user.avatarUri');
    setAvatarUri(savedAvatar);
  }

  function updateNameFromProfile(data: any) {
    if (data.apelido) {
      setDisplayName(data.apelido);
    } else if (data.nome_completo) {
      setDisplayName(data.nome_completo.split(' ')[0]);
    } else {
      setDisplayName(user?.email?.split('@')[0] || 'Membro');
    }
  }

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
    { key: 'KidsStack', label: 'Kids', icon: 'happy-outline' },
    { key: 'Playlist de Louvor', label: 'Playlist de Louvor', icon: 'musical-notes-outline' },
    { key: 'Eventos', label: 'Eventos', icon: 'calendar-outline' },
    { key: 'Kids Admin', label: 'Kids (Professor)', icon: 'shield-checkmark-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0, backgroundColor: theme.colors.background, flexGrow: 1 }}
      >
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
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
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
        </View>
      </DrawerContentScrollView>
    </View>
  );
}