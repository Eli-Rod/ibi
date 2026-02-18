import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, DeviceEventEmitter, Image, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { styles } from './ProfileScreen.styles';

export default function ProfileScreen() {
  const { theme, setMode } = useTheme();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dados' | 'config'>('dados');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [celular, setCelular] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  useEffect(() => {
    if (profile) {
      setNome(profile.nome_completo || '');
      setApelido(profile.apelido || '');
      setCelular(profile.celular || '');
      setCep(profile.cep || '');
      setLogradouro(profile.logradouro || '');
      setNumero(profile.numero || '');
      setComplemento(profile.complemento || '');
      setBairro(profile.bairro || '');
      setCidade(profile.cidade || '');
      setUf(profile.uf || '');
    }
  }, [profile]);

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setUf(data.uf);
        }
      } catch (e) { console.error('Erro ao buscar CEP'); }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.from('perfis').update({
        nome_completo: nome, apelido, celular, cep, logradouro, numero, complemento, bairro, cidade, uf,
      }).eq('id', user?.id);
      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setLoading(false); }
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
    try {
      setUploading(true);
      const fileName = `${user?.id}/${Date.now()}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const { data, error } = await supabase.storage.from('midias-publicas').upload(fileName, Buffer.from(base64, 'base64'), { contentType: 'image/jpeg', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('midias-publicas').getPublicUrl(fileName);
      await supabase.from('perfis').update({ avatar_url: publicUrl }).eq('id', user?.id);
      await refreshProfile();
      DeviceEventEmitter.emit('profile.updated');
    } catch (e: any) { Alert.alert('Erro no upload', e.message); }
    finally { setUploading(false); }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Pressable onPress={pickImage} style={styles.avatarContainer}>
            {uploading ? <ActivityIndicator color={theme.colors.primary} /> : (
              profile?.avatar_url ? <Image source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }} style={styles.avatar} /> :
              <Ionicons name="person-circle" size={100} color={theme.colors.border} />
            )}
            <View style={styles.editBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
          </Pressable>
          <ThemedText style={styles.userName}>{profile?.nome_completo || 'Membro'}</ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
        </View>

        <View style={styles.tabBar}>
          <Pressable onPress={() => setActiveTab('dados')} style={[styles.tab, activeTab === 'dados' && styles.activeTab]}>
            <ThemedText style={[styles.tabText, activeTab === 'dados' && styles.activeTabText]}>DADOS CADASTRAIS</ThemedText>
          </Pressable>
          <Pressable onPress={() => setActiveTab('config')} style={[styles.tab, activeTab === 'config' && styles.activeTab]}>
            <ThemedText style={[styles.tabText, activeTab === 'config' && styles.activeTabText]}>CONFIGURAÇÃO</ThemedText>
          </Pressable>
        </View>

        {activeTab === 'dados' ? (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 18, fontWeight: '700' }}>Informações Pessoais</ThemedText>
              <Pressable onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={[styles.editBtn, isEditing && { backgroundColor: theme.colors.primary }]}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name={isEditing ? "checkmark-outline" : "create-outline"} size={18} color={isEditing ? "#fff" : theme.colors.primary} />
                    <ThemedText style={{ color: isEditing ? "#fff" : theme.colors.primary, fontWeight: '700', marginLeft: 4 }}>
                      {isEditing ? "Salvar" : "Editar"}
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>

            <ThemedCard style={styles.card}>
              <View style={styles.inputGroup}><ThemedText style={styles.label}>Nome Completo</ThemedText>
                <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={nome} onChangeText={setNome} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
              <View style={styles.inputGroup}><ThemedText style={styles.label}>Como deseja ser chamado?</ThemedText>
                <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={apelido} onChangeText={setApelido} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
              <View style={styles.inputGroup}><ThemedText style={styles.label}>Celular</ThemedText>
                <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={celular} onChangeText={setCelular} editable={isEditing} keyboardType="phone-pad" placeholderTextColor={theme.colors.muted} /></View>
            </ThemedCard>

            <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>Endereço</ThemedText>
            <ThemedCard style={styles.card}>
              <View style={styles.inputGroup}><ThemedText style={styles.label}>CEP</ThemedText>
                <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={cep} onChangeText={setCep} onBlur={handleCepBlur} editable={isEditing} keyboardType="numeric" maxLength={8} placeholderTextColor={theme.colors.muted} /></View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 3 }]}><ThemedText style={styles.label}>Logradouro</ThemedText>
                  <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={logradouro} onChangeText={setLogradouro} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><ThemedText style={styles.label}>Nº</ThemedText>
                  <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={numero} onChangeText={setNumero} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
              </View>
              <View style={styles.inputGroup}><ThemedText style={styles.label}>Bairro</ThemedText>
                <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={bairro} onChangeText={setBairro} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 3 }]}><ThemedText style={styles.label}>Cidade</ThemedText>
                  <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={cidade} onChangeText={setCidade} editable={isEditing} placeholderTextColor={theme.colors.muted} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><ThemedText style={styles.label}>UF</ThemedText>
                  <TextInput style={[styles.input, !isEditing && styles.disabledInput]} value={uf} onChangeText={setUf} editable={isEditing} maxLength={2} autoCapitalize="characters" placeholderTextColor={theme.colors.muted} /></View>
              </View>
            </ThemedCard>
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedCard style={styles.configCard}>
              <View style={styles.configRow}><View style={{ flex: 1 }}><ThemedText style={styles.configTitle}>Tema do Aplicativo</ThemedText><ThemedText style={styles.configDesc}>Escolha entre claro, escuro ou sistema</ThemedText></View>
                <View style={styles.radioGroup}>{(['light', 'dark', 'system'] as const).map((m) => { const active = theme.mode === m; return (<Pressable key={m} onPress={() => setMode(m)} style={[styles.radio, active && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]}><ThemedText style={{ fontSize: 10, fontWeight: active ? '800' : '600', color: active ? theme.colors.primary : theme.colors.text }}>{m === 'light' ? 'Claro' : m === 'dark' ? 'Escuro' : 'Sist.'}</ThemedText></Pressable>); })}</View></View>
              <View style={styles.configDivider} />
              <View style={styles.configRow}>
                <View style={{ flex: 1 }}><ThemedText style={styles.configTitle}>Biometria</ThemedText><ThemedText style={styles.configDesc}>Exigir digital ao abrir o app</ThemedText></View>
                <Switch value={profile?.biometria_ativa || false} onValueChange={async (val) => { try { await supabase.from('perfis').update({ biometria_ativa: val }).eq('id', user?.id); await refreshProfile(); } catch (e: any) { Alert.alert('Erro', e.message); } }} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="#fff" />
              </View>
            </ThemedCard>
            <Pressable style={styles.logoutBtn} onPress={signOut}><Ionicons name="log-out-outline" size={20} color="#EF4444" /><ThemedText style={styles.logoutText}>Sair da Conta</ThemedText></Pressable>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}