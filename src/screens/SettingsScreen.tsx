import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme, ColorMode } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, padding: t.spacing(2), gap: t.spacing(2) },
    sectionTitle: { fontWeight: '800', fontSize: 16, marginBottom: 6 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarWrap: {
      width: 80,
      height: 80,
      borderRadius: 999,
      backgroundColor: t.colors.border,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    btnText: { fontWeight: '700' },
    muted: { color: t.colors.muted },
    radio: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
  });

export default function SettingsScreen() {
  const { theme, setMode } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
  const [biometrySupported, setBiometrySupported] = React.useState<boolean>(false);
  const [lockEnabled, setLockEnabled] = React.useState<boolean>(false);
  const [mode, setLocalMode] = React.useState<ColorMode>(theme.mode);

  React.useEffect(() => {
    (async () => {
      // Carrega avatar
      const saved = await AsyncStorage.getItem('user.avatarUri');
      setAvatarUri(saved);

      // Biometria
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      setBiometrySupported(hasHardware && isEnrolled);

      const savedLock = await AsyncStorage.getItem('lock.enabled');
      setLockEnabled(savedLock === 'true');
    })();
  }, []);

  React.useEffect(() => {
    // refletir mudanças de modo local -> provider
    if (mode !== theme.mode) setMode(mode);
  }, [mode]);

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Conceda acesso às fotos para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      const src = result.assets[0].uri;

      // ✅ TS-safe: lê documentDirectory e cacheDirectory via `as any`
      const docDir = (FileSystem as any).documentDirectory as string | null | undefined;
      const cacheDir = (FileSystem as any).cacheDirectory as string | null | undefined;

      // Em iOS/Android: docDir costuma existir. Em Web: use cacheDir.
      const baseDir = docDir ?? cacheDir;
      if (!baseDir) throw new Error('Nenhum diretório de documentos ou cache disponível.');

      const avatarsDir = baseDir + 'avatars/';
      const dirInfo = await FileSystem.getInfoAsync(avatarsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(avatarsDir, { intermediates: true });
      }

      const dest = avatarsDir + 'avatar.jpg';

      const existing = await FileSystem.getInfoAsync(dest);
      if (existing.exists) {
        await FileSystem.deleteAsync(dest, { idempotent: true });
      }

      await FileSystem.copyAsync({ from: src, to: dest });

      await AsyncStorage.setItem('user.avatarUri', dest);
      setAvatarUri(dest);

      Alert.alert('Pronto', 'Avatar atualizado.');
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    }
  }

  async function toggleLock(value: boolean) {
    if (value) {
      // habilitar: verificar suporte e autenticar imediatamente
      if (!biometrySupported) {
        Alert.alert('Indisponível', 'Biometria não suportada ou não cadastrada neste dispositivo.');
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ativar bloqueio por biometria',
        cancelLabel: 'Cancelar',
      });
      if (!res.success) return;
      await AsyncStorage.setItem('lock.enabled', 'true');
      setLockEnabled(true);
      Alert.alert('Ativado', 'Bloqueio por biometria habilitado.');
    } else {
      await AsyncStorage.setItem('lock.enabled', 'false');
      setLockEnabled(false);
      Alert.alert('Desativado', 'Bloqueio por biometria desabilitado.');
    }
  }

  return (
    <ThemedView style={s.container}>
      {/* Perfil */}
      <ThemedCard>
        <ThemedText style={s.sectionTitle}>Perfil</ThemedText>

        <View style={[s.row, { justifyContent: 'flex-start', gap: 16 }]}>
          <View style={s.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 80, height: 80 }} />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                {/* Ícone simples */}
              </View>
            )}
          </View>
          <Pressable onPress={pickAvatar} style={s.btn}>
            <ThemedText style={s.btnText}>Trocar foto</ThemedText>
          </Pressable>
        </View>

        <View style={s.row}>
          <View>
            <ThemedText style={{ fontWeight: '700' }}>Nome</ThemedText>
            <ThemedText style={s.muted}>Defina no futuro (perfil/account)</ThemedText>
          </View>
          <Pressable style={s.btn} onPress={() => Alert.alert('Em breve', 'Tela de editar nome/email.')}>
            <ThemedText style={s.btnText}>Editar</ThemedText>
          </Pressable>
        </View>
      </ThemedCard>

      {/* Aparência */}
      <ThemedCard>
        <ThemedText style={s.sectionTitle}>Aparência</ThemedText>
        <View style={[s.row, { justifyContent: 'flex-start', gap: 8 }]}>
          {(['light', 'dark', 'system'] as ColorMode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable key={m} onPress={() => setLocalMode(m)} style={[s.radio, active && { borderColor: theme.colors.primary }]}>
                <ThemedText style={{ fontWeight: active ? '800' : '600', color: active ? theme.colors.primary : theme.colors.text }}>
                  {m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sistema'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedCard>

      {/* Segurança */}
      <ThemedCard>
        <ThemedText style={s.sectionTitle}>Segurança</ThemedText>
        <View style={s.row}>
          <View>
            <ThemedText style={{ fontWeight: '700' }}>Bloquear com biometria</ThemedText>
            <ThemedText style={s.muted}>
              {biometrySupported ? 'Use sua digital/rosto para desbloquear o app.' : 'Biometria indisponível ou não cadastrada.'}
            </ThemedText>
          </View>
          <Switch
            value={lockEnabled}
            onValueChange={toggleLock}
            disabled={!biometrySupported}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={lockEnabled ? '#fff' : '#fff'}
          />
        </View>

        <View style={s.row}>
          <View>
            <ThemedText style={{ fontWeight: '700' }}>Trocar senha</ThemedText>
            <ThemedText style={s.muted}>Abrir tela para redefinição de senha</ThemedText>
          </View>
          <Pressable style={s.btn} onPress={() => Alert.alert('Em breve', 'Integração com backend de autenticação.')}>
            <ThemedText style={s.btnText}>Abrir</ThemedText>
          </Pressable>
        </View>
      </ThemedCard>
    </ThemedView>
  );
}