import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
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
  Switch,
  TextInput,
  View
} from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { createStyles } from './styles/ProfileScreen.styles';

export default function ProfileScreen() {
  const { theme, setMode } = useTheme();
  const styles = createStyles(theme);

  const { user, profile, refreshProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'dados' | 'config'>('dados');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [celular, setCelular] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  // Configurações
  const [biometrySupported, setBiometrySupported] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);

  useEffect(() => {
    loadAvatar();
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      const data = {
        nome: profile.nome_completo || '',
        apelido: profile.apelido || '',
        celular: profile.celular || '',
        cep: profile.cep || '',
        endereco: profile.logradouro || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        uf: profile.uf || '',
      };

      setOriginalData(data);

      setNome(data.nome);
      setApelido(data.apelido);
      setCelular(data.celular);
      setCep(data.cep);
      setEndereco(data.endereco);
      setNumero(data.numero);
      setComplemento(data.complemento);
      setBairro(data.bairro);
      setCidade(data.cidade);
      setUf(data.uf);
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      setBiometrySupported(hasHardware && isEnrolled);

      const savedLock = await AsyncStorage.getItem('lock.enabled');
      setLockEnabled(savedLock === 'true');
    })();
  }, []);

  const loadAvatar = async () => {
    if (!user?.id) return;
    try {
      const savedUri = await AsyncStorage.getItem(`avatar_${user.id}`);
      if (savedUri) {
        setAvatarUri(savedUri);
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setEndereco(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setUf(data.uf);
      }
    } catch {
      console.log('Erro ao buscar CEP');
    }
  };

  const handleSave = async () => {
    // Validar campos obrigatorios
    if (!nome || nome.trim() === '') {
      Alert.alert('Validacao', 'Nome completo eh obrigatorio');
      return;
    }

    // if (!celular || celular.trim() === '') {
    //   Alert.alert('Validacao', 'Celular eh obrigatorio');
    //   return;
    // }

    if (!cep || cep.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar o CEP');
      return;
    }

    if (!endereco || endereco.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar o Endereco');
      return;
    }

    if (!numero || numero.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar um Número');
      return;
    }

    if (!bairro || bairro.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar o Bairro');
      return;
    }

    if (!cidade || cidade.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar a Cidade');
      return;
    }

    if (!uf || uf.trim() === '') {
      Alert.alert('Preenchimento obrigatório', 'Favor informar a UF');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('perfis')
        .update({
          nome_completo: nome.trim(),
          apelido: apelido.trim(),
          celular: celular.trim(),
          cep: cep.trim(),
          logradouro: endereco.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.trim(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!originalData) return;

    setNome(originalData.nome);
    setApelido(originalData.apelido);
    setCelular(originalData.celular);
    setCep(originalData.cep);
    setEndereco(originalData.endereco);
    setNumero(originalData.numero);
    setComplemento(originalData.complemento);
    setBairro(originalData.bairro);
    setCidade(originalData.cidade);
    setUf(originalData.uf);

    setIsEditing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    // Validar se o nome esta preenchido antes de fazer upload
    if (!nome || nome.trim() === '') {
      Alert.alert('Validacao', 'Preencha o nome completo antes de fazer upload da foto');
      return;
    }

    try {
      setUploading(true);

      if (!user?.id) {
        throw new Error('Usuario nao autenticado');
      }

      const fileName = `avatars/${user.id}.jpg`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Converter base64 para Uint8Array para React Native
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('midias-publicas')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('midias-publicas').getPublicUrl(fileName);
      // Salvar a URL do avatar no cache local
      await AsyncStorage.setItem(`avatar_${user.id}`, publicUrl);
      setAvatarUri(publicUrl);

      // Emitir evento para atualizar o menu
      DeviceEventEmitter.emit('avatar.updated', publicUrl);

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (e: any) {
      console.error('Erro no upload: ', e);
      Alert.alert('Erro no upload', e.message || 'Nao foi possivel fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  async function toggleLock(value: boolean) {
    if (value) {
      if (!biometrySupported) {
        Alert.alert('Indisponivel', 'Biometria nao suportada ou nao cadastrada.');
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
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={pickImage} style={styles.avatarContainer}>
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : avatarUri ? (
              <Image
                source={{ uri: `${avatarUri}?t=${Date.now()}` }}
                style={styles.avatar}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={90}
                color={theme.colors.border}
              />
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>

          <ThemedText style={styles.userName}>
            {profile?.nome_completo || 'Membro'}
          </ThemedText>

          <ThemedText style={styles.userEmail}>
            {user?.email}
          </ThemedText>
        </View>

        {/* TABS */}
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setActiveTab('dados')}
            style={[styles.tab, activeTab === 'dados' && styles.activeTab]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'dados' && styles.activeTabText,
              ]}
            >
              Dados
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('config')}
            style={[styles.tab, activeTab === 'config' && styles.activeTab]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'config' && styles.activeTabText,
              ]}
            >
              Configuracoes
            </ThemedText>
          </Pressable>
        </View>

        {/* DADOS */}
        {activeTab === 'dados' && (
          <View style={styles.section}>
            <View style={styles.actionsRow}>
              {!isEditing ? (
                <Pressable
                  onPress={() => setIsEditing(true)}
                  style={styles.editPrimaryBtn}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <ThemedText style={styles.primaryBtnText}>Editar Perfil</ThemedText>
                </Pressable>
              ) : (
                <View style={styles.editActions}>
                  <Pressable onPress={handleCancel} style={styles.cancelBtn}>
                    <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
                  </Pressable>
                  <Pressable onPress={handleSave} style={styles.saveBtn}>
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-outline" size={18} color="#fff" />
                        <ThemedText style={styles.primaryBtnText}>Salvar</ThemedText>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            <ThemedCard style={styles.card}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Nome Completo</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={nome}
                  onChangeText={setNome}
                  editable={isEditing}
                  placeholder="Seu nome completo"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Apelido</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={apelido}
                  onChangeText={setApelido}
                  editable={isEditing}
                  placeholder="Seu apelido"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Celular</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={celular}
                  onChangeText={setCelular}
                  editable={isEditing}
                  placeholder="Seu celular"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>CEP</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={cep}
                  onChangeText={setCep}
                  onBlur={handleCepBlur}
                  editable={isEditing}
                  placeholder="Seu CEP"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Endereco</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={endereco}
                  onChangeText={setEndereco}
                  editable={isEditing}
                  placeholder="Seu endereco"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <ThemedText style={styles.label}>Numero</ThemedText>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={numero}
                    onChangeText={setNumero}
                    editable={isEditing}
                    placeholder="Numero"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 3 }]}>
                  <ThemedText style={styles.label}>Complemento</ThemedText>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={complemento}
                    onChangeText={setComplemento}
                    editable={isEditing}
                    placeholder="Complemento"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Bairro</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput]}
                  value={bairro}
                  onChangeText={setBairro}
                  editable={isEditing}
                  placeholder="Seu bairro"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 3 }]}>
                  <ThemedText style={styles.label}>Cidade</ThemedText>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={cidade}
                    onChangeText={setCidade}
                    editable={isEditing}
                    placeholder="Sua cidade"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText style={styles.label}>UF</ThemedText>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={uf}
                    onChangeText={setUf}
                    editable={isEditing}
                    maxLength={2}
                    autoCapitalize="characters"
                    placeholder="SP"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
              </View>
            </ThemedCard>
          </View>
        )}
        {/* CONFIGURACOES */}
        {activeTab === 'config' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Aparencia</ThemedText>
            <ThemedCard style={styles.configCard}>
              <View style={styles.configRow}>
                <View>
                  <ThemedText style={styles.configTitle}>Tema do Aplicativo</ThemedText>
                  <ThemedText style={styles.configDesc}>Escolha entre claro, escuro ou sistema</ThemedText>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['light', 'dark', 'system'] as const).map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.mode === m ? theme.colors.primary : theme.colors.border,
                      backgroundColor: theme.mode === m ? theme.colors.primary + '10' : 'transparent',
                      alignItems: 'center'
                    }}
                  >
                    <ThemedText style={{ 
                      fontSize: 12, 
                      fontWeight: '700',
                      color: theme.mode === m ? theme.colors.primary : theme.colors.text 
                    }}>
                      {m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sistema'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ThemedCard>
            <ThemedText style={styles.sectionTitle}>Seguranca</ThemedText>
            <ThemedCard style={styles.configCard}>
              <View style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.configTitle}>Bloqueio por Biometria</ThemedText>
                  <ThemedText style={styles.configDesc}>
                    {biometrySupported 
                      ? 'Use digital ou reconhecimento facial' 
                      : 'Nao disponivel neste dispositivo'}
                  </ThemedText>
                </View>
                <Switch
                  value={lockEnabled}
                  onValueChange={toggleLock}
                  disabled={!biometrySupported}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </ThemedCard>
            <ThemedText style={styles.sectionTitle}>Conta</ThemedText>
            <ThemedCard style={styles.configCard}>
              <View style={styles.configRow}>
                <View>
                  <ThemedText style={styles.configTitle}>Sair da conta</ThemedText>
                  <ThemedText style={styles.configDesc}>Encerrar sessao do aplicativo</ThemedText>
                </View>
              </View>
            </ThemedCard>
            <Pressable onPress={signOut} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <ThemedText style={styles.logoutText}>Sair do aplicativo</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}