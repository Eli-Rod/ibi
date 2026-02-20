import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  Switch,
  View,
} from 'react-native';

import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorMode } from '../theme/tokens';
import { makeStyles } from './styles/SettingsScreen.styles';

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

      const docDir = (FileSystem as any).documentDirectory as string | null | undefined;
      const cacheDir = (FileSystem as any).cacheDirectory as string | null | undefined;

      const baseDir = docDir ?? cacheDir;
      if (!baseDir) throw new Error('Nenhum diretório disponível.');

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
      if (!biometrySupported) {
        Alert.alert('Indisponível', 'Biometria não suportada ou não cadastrada.');
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

        <View style={[s.row, s.rowStart]}>
          <View style={s.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarPlaceholder} />
            )}
          </View>

          <Pressable onPress={pickAvatar} style={s.btn}>
            <ThemedText style={s.btnText}>Trocar foto</ThemedText>
          </Pressable>
        </View>

        <View style={s.row}>
          <View>
            <ThemedText style={s.bold}>Nome</ThemedText>
            <ThemedText style={s.muted}>
              Defina no futuro (perfil/account)
            </ThemedText>
          </View>

          <Pressable
            style={s.btn}
            onPress={() => Alert.alert('Em breve', 'Tela de editar nome/email.')}
          >
            <ThemedText style={s.btnText}>Editar</ThemedText>
          </Pressable>
        </View>
      </ThemedCard>

      {/* Aparência */}
      <ThemedCard>
        <ThemedText style={s.sectionTitle}>Aparência</ThemedText>

        <View style={[s.row, s.rowSmallGap]}>
          {(['light', 'dark', 'system'] as ColorMode[]).map((m) => {
            const active = mode === m;

            return (
              <Pressable
                key={m}
                onPress={() => setLocalMode(m)}
                style={[
                  s.radio,
                  active && { borderColor: theme.colors.primary },
                ]}
              >
                <ThemedText
                  style={{
                    fontWeight: active ? '800' : '600',
                    color: active
                      ? theme.colors.primary
                      : theme.colors.text,
                  }}
                >
                  {m === 'light'
                    ? 'Claro'
                    : m === 'dark'
                    ? 'Escuro'
                    : 'Sistema'}
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
            <ThemedText style={s.bold}>
              Bloquear com biometria
            </ThemedText>
            <ThemedText style={s.muted}>
              {biometrySupported
                ? 'Use sua digital/rosto para desbloquear o app.'
                : 'Biometria indisponível ou não cadastrada.'}
            </ThemedText>
          </View>

          <Switch
            value={lockEnabled}
            onValueChange={toggleLock}
            disabled={!biometrySupported}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#fff"
          />
        </View>

        <View style={s.row}>
          <View>
            <ThemedText style={s.bold}>Trocar senha</ThemedText>
            <ThemedText style={s.muted}>
              Abrir tela para redefinição de senha
            </ThemedText>
          </View>

          <Pressable
            style={s.btn}
            onPress={() =>
              Alert.alert(
                'Em breve',
                'Integração com backend de autenticação.'
              )
            }
          >
            <ThemedText style={s.btnText}>Abrir</ThemedText>
          </Pressable>
        </View>
      </ThemedCard>

    </ThemedView>
  );
}
