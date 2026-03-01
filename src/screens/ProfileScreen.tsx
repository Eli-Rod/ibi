import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedCard, ThemedText } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { lookupCep } from '../utils/handleCepLookup';
import { createStyles } from './styles/ProfileScreen.styles';

export default function ProfileScreen() {
  const { theme, setMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { user, profile, refreshProfile, signOut } = useAuth();

  // Estados do perfil
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

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'config'>('perfil');

  // Configurações
  const [biometrySupported, setBiometrySupported] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);

  // Estados para mostrar/ocultar senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alterar senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    loadAvatar();
    checkBiometrySupport();
    loadLockStatus();
  }, []);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome_completo || '');
      setApelido(profile.apelido || '');
      setCelular(profile.celular || '');
      setCep(profile.cep || '');
      setEndereco(profile.logradouro || '');
      setNumero(profile.numero || '');
      setComplemento(profile.complemento || '');
      setBairro(profile.bairro || '');
      setCidade(profile.cidade || '');
      setUf(profile.uf || '');
    }
  }, [profile]);

  const checkBiometrySupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
    setBiometrySupported(hasHardware && isEnrolled);
  };

  const loadLockStatus = async () => {
    const savedLock = await AsyncStorage.getItem('lock.enabled');
    setLockEnabled(savedLock === 'true');
  };

  const loadAvatar = async () => {
    if (!user?.id) return;

    try {
      if (profile?.avatar_url) {
        setAvatarUri(profile.avatar_url);
        await AsyncStorage.setItem(`avatar_${user.id}`, profile.avatar_url);
        return;
      }

      const cachedAvatar = await AsyncStorage.getItem(`avatar_${user.id}`);
      if (cachedAvatar) {
        setAvatarUri(cachedAvatar);
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  const handleCepBlur = async () => {
    const data = await lookupCep(cep);
    if (!data) return;

    setEndereco(data.logradouro || '');
    setBairro(data.bairro || '');
    setCidade(data.localidade || '');
    setUf(data.uf || '');
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Validação', 'Nome completo é obrigatório');
      return;
    }
    if (!celular.trim()) {
      Alert.alert('Validação', 'Celular é obrigatório');
      return;
    }
    if (!cep.trim()) {
      Alert.alert('Validação', 'CEP é obrigatório');
      return;
    }
    if (!endereco.trim()) {
      Alert.alert('Validação', 'Endereço é obrigatório');
      return;
    }
    if (!numero.trim()) {
      Alert.alert('Validação', 'Número é obrigatório');
      return;
    }
    if (!bairro.trim()) {
      Alert.alert('Validação', 'Bairro é obrigatório');
      return;
    }
    if (!cidade.trim()) {
      Alert.alert('Validação', 'Cidade é obrigatório');
      return;
    }
    if (!uf.trim()) {
      Alert.alert('Validação', 'UF é obrigatório');
      return;
    }

    try {
      const updates = {
        nome_completo: nome,
        apelido: apelido || null,
        celular,
        cep,
        logradouro: endereco,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        uf: uf.toUpperCase(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('perfis')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      DeviceEventEmitter.emit('profile.updated', updates);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o perfil');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!nome || nome.trim() === '') {
      Alert.alert('Validação', 'Preencha o nome completo antes de fazer upload da foto');
      return;
    }

    try {
      setUploading(true);
      if (!user?.id) throw new Error('Usuário não autenticado');

      console.log('Iniciando upload para usuário:', user.id);

      const fileName = `${user.id}.jpg`;
      console.log('Nome do arquivo:', fileName);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log(`Imagem convertida: ${(bytes.length / 1024).toFixed(2)} KB`);

      console.log('Enviando para o Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('midias-publicas')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);

        const errorMessage = uploadError.message.toLowerCase();

        if (errorMessage.includes('54001') || errorMessage.includes('permission') || errorMessage.includes('policy')) {
          throw new Error('Erro de permissão no Storage. Verifique as políticas do bucket.');
        } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
          throw new Error('Imagem muito grande. Máximo 5MB.');
        } else {
          throw uploadError;
        }
      }

      console.log('Upload concluído:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('midias-publicas')
        .getPublicUrl(fileName);

      const urlComTimestamp = `${publicUrl}?t=${Date.now()}`;
      console.log('URL gerada:', urlComTimestamp);

      console.log('Salvando URL no perfil...');
      const { error: updateError } = await supabase
        .from('perfis')
        .update({
          avatar_url: urlComTimestamp,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao salvar URL no perfil:', updateError);
        throw updateError;
      }

      await AsyncStorage.setItem(`avatar_${user.id}`, urlComTimestamp);
      setAvatarUri(urlComTimestamp);
      await refreshProfile();

      DeviceEventEmitter.emit('avatar.updated', urlComTimestamp);
      DeviceEventEmitter.emit('profile.updated', { avatar_url: urlComTimestamp });

      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');

    } catch (e: any) {
      console.error('Erro detalhado:', e);

      let errorMessage = 'Não foi possível fazer upload da imagem';

      if (e.message) {
        const msg = e.message.toLowerCase();
        if (msg.includes('54001') || msg.includes('permission') || msg.includes('policy')) {
          errorMessage = 'Erro de permissão no Storage. Configure as políticas do bucket.';
        } else if (msg.includes('size') || msg.includes('large')) {
          errorMessage = 'Imagem muito grande. Máximo 5MB.';
        } else {
          errorMessage = e.message;
        }
      }

      Alert.alert('Erro no upload', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    Alert.alert(
      'Remover foto',
      'Deseja realmente remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);

              const { error } = await supabase
                .from('perfis')
                .update({
                  avatar_url: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

              if (error) throw error;

              const fileName = `${user?.id}.jpg`;
              await supabase.storage
                .from('midias-publicas')
                .remove([fileName]);

              await AsyncStorage.removeItem(`avatar_${user?.id}`);
              setAvatarUri(null);
              await refreshProfile();

              DeviceEventEmitter.emit('avatar.updated', null);

              Alert.alert('Sucesso', 'Foto removida com sucesso!');

            } catch (error: any) {
              console.error('Erro ao remover avatar:', error);
              Alert.alert('Erro', 'Não foi possível remover a foto');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

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

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Erro', 'Digite sua senha atual');
      return;
    }
    if (!newPassword) {
      Alert.alert('Erro', 'Digite a nova senha');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoadingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert('Erro', error.message || 'Não foi possível alterar a senha');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!profile) {
    return (
      <View style={[styles.header, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={pickImage} style={styles.avatarContainer}>
          {uploading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : avatarUri ? (
            <Image
              source={{ uri: `${avatarUri}` }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons
              name="person-circle"
              size={90}
              color={theme.colors.border}
            />
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>

        {avatarUri && !uploading && (
          <TouchableOpacity
            style={[styles.editBadge, {
              backgroundColor: '#EF4444',
              position: 'absolute',
              right: 110,
              top: 20
            }]}
            onPress={removeAvatar}
          >
            <Ionicons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <ThemedText style={styles.userName}>{nome || 'Usuário'}</ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setActiveTab('perfil')}
          style={[styles.tab, activeTab === 'perfil' && styles.activeTab]}
        >
          <ThemedText style={[styles.tabText, activeTab === 'perfil' && styles.activeTabText]}>
            MEU PERFIL
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('config')}
          style={[styles.tab, activeTab === 'config' && styles.activeTab]}
        >
          <ThemedText style={[styles.tabText, activeTab === 'config' && styles.activeTabText]}>
            CONFIGURAÇÕES
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === 'perfil' ? (
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={[styles.editPrimaryBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <ThemedText style={styles.primaryBtnText}>EDITAR PERFIL</ThemedText>
              </Pressable>
            ) : (
              <View style={styles.editActions}>
                <Pressable onPress={() => setIsEditing(false)} style={[styles.cancelBtn, { borderColor: theme.colors.border }]}>
                  <ThemedText style={[styles.cancelText, { color: theme.colors.muted }]}>CANCELAR</ThemedText>
                </Pressable>
                <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <ThemedText style={styles.primaryBtnText}>SALVAR</ThemedText>
                </Pressable>
              </View>
            )}
          </View>

          <ThemedText style={styles.sectionTitle}>Informações Pessoais</ThemedText>
          <ThemedCard style={styles.card}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nome Completo *</ThemedText>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
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
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={apelido}
                onChangeText={setApelido}
                editable={isEditing}
                placeholder="Como quer ser chamado"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Celular *</ThemedText>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={celular}
                onChangeText={setCelular}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
          </ThemedCard>

          <ThemedText style={styles.sectionTitle}>Endereço</ThemedText>
          <ThemedCard style={styles.card}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>CEP *</ThemedText>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={cep}
                onChangeText={setCep}
                onBlur={handleCepBlur}
                editable={isEditing}
                placeholder="00000-000"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Endereço *</ThemedText>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={endereco}
                onChangeText={setEndereco}
                editable={isEditing}
                placeholder="Rua, Avenida..."
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Número *</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput, {
                    backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  value={numero}
                  onChangeText={setNumero}
                  editable={isEditing}
                  placeholder="Nº"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <ThemedText style={styles.label}>Complemento</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput, {
                    backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  value={complemento}
                  onChangeText={setComplemento}
                  editable={isEditing}
                  placeholder="Apto, Bloco..."
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bairro *</ThemedText>
              <TextInput
                style={[styles.input, !isEditing && styles.disabledInput, {
                  backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={bairro}
                onChangeText={setBairro}
                editable={isEditing}
                placeholder="Seu bairro"
                placeholderTextColor={theme.colors.muted}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 3 }]}>
                <ThemedText style={styles.label}>Cidade *</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput, {
                    backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  value={cidade}
                  onChangeText={setCidade}
                  editable={isEditing}
                  placeholder="Sua cidade"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>UF *</ThemedText>
                <TextInput
                  style={[styles.input, !isEditing && styles.disabledInput, {
                    backgroundColor: isEditing ? theme.colors.background : theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }]}
                  value={uf}
                  onChangeText={(t) => setUf(t.toUpperCase())}
                  editable={isEditing}
                  maxLength={2}
                  placeholder="UF"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>
            </View>
          </ThemedCard>
        </View>
      ) : (
        <View style={styles.section}>
          {/* APARÊNCIA */}
          <ThemedText style={styles.sectionTitle}>Aparência</ThemedText>
          <ThemedCard style={styles.configCard}>
            <View style={styles.configRow}>
              <View>
                <ThemedText style={styles.configTitle}>Tema do Aplicativo</ThemedText>
                <ThemedText style={styles.configDesc}>Escolha entre claro, escuro ou sistema</ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {(['light', 'dark', 'system'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.mode === m ? theme.colors.primary : theme.colors.border,
                    backgroundColor: theme.mode === m ? theme.colors.primary + '20' : pressed ? theme.colors.border + '30' : 'transparent',
                    alignItems: 'center'
                  })}
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

          {/* SEGURANÇA */}
          <ThemedText style={styles.sectionTitle}>Segurança</ThemedText>
          <ThemedCard style={styles.configCard}>
            <View style={styles.configRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.configTitle}>Bloqueio por Biometria</ThemedText>
                <ThemedText style={styles.configDesc}>
                  {biometrySupported
                    ? lockEnabled
                      ? 'Biometria ativa - use digital ao abrir o app'
                      : 'Use digital ou reconhecimento facial'
                    : 'Não disponível neste dispositivo'}
                </ThemedText>
              </View>
              <Switch
                value={lockEnabled}
                onValueChange={toggleLock}
                disabled={!biometrySupported}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={[styles.configDivider, { backgroundColor: theme.colors.border }]} />

            {/* ALTERAR SENHA */}
            <View>
              <Pressable
                onPress={() => setShowPasswordForm(!showPasswordForm)}
                style={styles.configRow}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.configTitle}>Alterar Senha</ThemedText>
                  <ThemedText style={styles.configDesc}>
                    {showPasswordForm ? 'Clique para fechar' : 'Altere sua senha de acesso'}
                  </ThemedText>
                </View>
                <Ionicons
                  name={showPasswordForm ? 'chevron-up' : 'chevron-forward'}
                  size={20}
                  color={theme.colors.muted}
                />
              </Pressable>

              {showPasswordForm && (
                <View style={{ marginTop: 20, gap: 16 }}>
                  {/* Senha Atual */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Senha Atual</ThemedText>
                    <View style={[styles.passwordContainer, {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background
                    }]}>
                      <TextInput
                        style={styles.passwordInput}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                        placeholder="Digite sua senha atual"
                        placeholderTextColor={theme.colors.muted}
                      />
                      <Pressable
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={22}
                          color={theme.colors.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Nova Senha */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Nova Senha</ThemedText>
                    <View style={[styles.passwordContainer, {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background
                    }]}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor={theme.colors.muted}
                      />
                      <Pressable
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={22}
                          color={theme.colors.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirmar Nova Senha */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Confirmar Nova Senha</ThemedText>
                    <View style={[styles.passwordContainer, {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background
                    }]}>
                      <TextInput
                        style={styles.passwordInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Confirme a nova senha"
                        placeholderTextColor={theme.colors.muted}
                      />
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={22}
                          color={theme.colors.muted}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleChangePassword}
                    disabled={loadingPassword}
                    style={[styles.saveBtn, {
                      backgroundColor: theme.colors.primary,
                      marginTop: 8,
                      opacity: loadingPassword ? 0.7 : 1
                    }]}
                  >
                    {loadingPassword ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="lock-closed" size={18} color="#fff" />
                        <ThemedText style={styles.primaryBtnText}>ALTERAR SENHA</ThemedText>
                      </>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </ThemedCard>

          {/* CONTA */}
          <ThemedText style={styles.sectionTitle}>Conta</ThemedText>
          <ThemedCard style={styles.configCard}>
            <Pressable onPress={signOut} style={styles.configRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.configTitle, { color: '#EF4444' }]}>Sair da conta</ThemedText>
                <ThemedText style={styles.configDesc}>Encerrar sessão do aplicativo</ThemedText>
              </View>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </Pressable>
          </ThemedCard>
        </View>
      )}
    </ScrollView>
  );
}