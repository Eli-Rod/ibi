import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme, ColorMode } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { padding: t.spacing(2), gap: t.spacing(2) },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontWeight: '800', fontSize: 18, marginBottom: 12 },
    label: { fontWeight: '600', marginBottom: 4, fontSize: 14 },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    avatarWrap: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.border,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnText: { color: '#fff', fontWeight: '700' },
    muted: { color: t.colors.muted, fontSize: 12 },
    radioGroup: { flexDirection: 'row', gap: 8, marginTop: 8 },
    radio: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    signOutButton: {
      marginTop: 24,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.colors.notification,
      alignItems: 'center',
    },
  });

export default function ProfileScreen() {
  const { theme, setMode } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState({
    nome_completo: '',
    apelido: '',
    celular: '',
    cidade: '',
    bairro: '',
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [biometrySupported, setBiometrySupported] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          nome_completo: data.nome_completo || '',
          apelido: data.apelido || '',
          celular: data.celular || '',
          cidade: data.cidade || '',
          bairro: data.bairro || '',
        });
      }

      const savedAvatar = await AsyncStorage.getItem('user.avatarUri');
      setAvatarUri(savedAvatar);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      setBiometrySupported(hasHardware && isEnrolled);

      const savedLock = await AsyncStorage.getItem('lock.enabled');
      setLockEnabled(savedLock === 'true');

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('perfis')
        .update({
          nome_completo: profile.nome_completo,
          apelido: profile.apelido,
          celular: profile.celular,
          cidade: profile.cidade,
          bairro: profile.bairro,
        })
        .eq('id', user?.id);

      if (error) throw error;
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function toggleLock(value: boolean) {
    if (value) {
      if (!biometrySupported) {
        Alert.alert('Indisponível', 'Biometria não suportada neste dispositivo.');
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ativar bloqueio por biometria',
      });
      if (!res.success) return;
      await AsyncStorage.setItem('lock.enabled', 'true');
      setLockEnabled(true);
    } else {
      await AsyncStorage.setItem('lock.enabled', 'false');
      setLockEnabled(false);
    }
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Conceda acesso às fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('user.avatarUri', uri);
      setAvatarUri(uri);
      // Emite evento para o menu lateral atualizar instantaneamente
      DeviceEventEmitter.emit('user.avatarUpdated', uri);
    }
  }

  if (loading) {
    return (
      <ThemedView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container}>
        
        <View style={s.avatarSection}>
          <View style={s.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 100, height: 100 }} />
            ) : (
              <Ionicons name="person" size={50} color={theme.colors.muted} />
            )}
          </View>
          <Pressable onPress={pickAvatar} style={[s.btn, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border }]}>
            <ThemedText style={{ color: theme.colors.text, fontWeight: '700' }}>Trocar Foto</ThemedText>
          </Pressable>
          <ThemedText style={s.muted}>{user?.email}</ThemedText>
        </View>

        <ThemedCard>
          <ThemedText style={s.sectionTitle}>Dados Cadastrais</ThemedText>
          
          <ThemedText style={s.label}>Nome Completo</ThemedText>
          <TextInput
            style={[s.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            value={profile.nome_completo}
            onChangeText={(txt) => setProfile({ ...profile, nome_completo: txt })}
            placeholder="Seu nome completo"
            placeholderTextColor={theme.colors.muted}
          />

          <ThemedText style={s.label}>Como deseja ser chamado? (Apelido)</ThemedText>
          <TextInput
            style={[s.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            value={profile.apelido}
            onChangeText={(txt) => setProfile({ ...profile, apelido: txt })}
            placeholder="Ex: João, Maria..."
            placeholderTextColor={theme.colors.muted}
          />

          <ThemedText style={s.label}>Celular</ThemedText>
          <TextInput
            style={[s.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
            value={profile.celular}
            onChangeText={(txt) => setProfile({ ...profile, celular: txt })}
            keyboardType="phone-pad"
          />

          <Pressable 
            style={[s.btn, { marginTop: 8 }]} 
            onPress={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <ThemedText style={s.btnText}>Salvar Dados</ThemedText>}
          </Pressable>
        </ThemedCard>

        <ThemedCard style={{ marginTop: 16 }}>
          <ThemedText style={s.sectionTitle}>Configurações do App</ThemedText>
          
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: '700' }}>Tema do App</ThemedText>
              <View style={s.radioGroup}>
                {(['light', 'dark', 'system'] as ColorMode[]).map((m) => {
                  const active = theme.mode === m;
                  return (
                    <Pressable 
                      key={m} 
                      onPress={() => setMode(m)} 
                      style={[s.radio, active && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]}
                    >
                      <ThemedText style={{ fontSize: 12, fontWeight: active ? '800' : '600', color: active ? theme.colors.primary : theme.colors.text }}>
                        {m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sistema'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={[s.row, { marginTop: 16 }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: '700' }}>Bloqueio por Biometria</ThemedText>
              <ThemedText style={s.muted}>
                {biometrySupported ? 'Proteja o acesso ao app com sua digital/rosto.' : 'Não suportado neste aparelho.'}
              </ThemedText>
            </View>
            <Switch
              value={lockEnabled}
              onValueChange={toggleLock}
              disabled={!biometrySupported}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </ThemedCard>

        <Pressable style={s.signOutButton} onPress={signOut}>
          <ThemedText style={{ color: theme.colors.notification, fontWeight: '800' }}>Sair da Conta</ThemedText>
        </Pressable>

      </ScrollView>
    </ThemedView>
  );
}