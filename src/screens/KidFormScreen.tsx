import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';

export default function KidFormScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const kidToEdit = route.params?.kid;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nome_completo: '',
    aniversario: '', 
    observacoes: '',
    foto_url: '',
  });

  useEffect(() => {
    if (kidToEdit) {
      let dataFormatada = '';
      if (kidToEdit.aniversario) {
        const [ano, mes, dia] = kidToEdit.aniversario.split('-');
        dataFormatada = `${dia}/${mes}/${ano}`;
      }
      setForm({
        nome_completo: kidToEdit.nome_completo,
        aniversario: dataFormatada,
        observacoes: kidToEdit.observacoes || '',
        foto_url: kidToEdit.foto_url || '',
      });
    }
  }, [kidToEdit]);

  const handleDateChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    if (cleaned.length > 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    
    setForm({ ...form, aniversario: formatted });
  };

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadImage(result.assets[0].uri);
    }
  }

  async function uploadImage(uri: string) {
    try {
      setUploading(true);
      const fileName = `${user?.id}/${Date.now()}.jpg`;
      
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      
      const { data, error } = await supabase.storage
        .from('kids-anexos')
        .upload(`kids/${fileName}`, decode(base64), {
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('kids-anexos')
        .getPublicUrl(data.path);

      setForm({ ...form, foto_url: urlData.publicUrl });
    } catch (error: any) {
      Alert.alert('Erro no upload', error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.nome_completo) {
      Alert.alert('Erro', 'O nome da criança é obrigatório.');
      return;
    }

    let dataParaBanco = null;
    if (form.aniversario.length === 10) {
      const [dia, mes, ano] = form.aniversario.split('/');
      dataParaBanco = `${ano}-${mes}-${dia}`;
    }

    try {
      setLoading(true);
      const payload = {
        responsavel_id: user?.id,
        nome_completo: form.nome_completo,
        aniversario: dataParaBanco,
        observacoes: form.observacoes,
        foto_url: form.foto_url,
      };

      let error;
      if (kidToEdit) {
        const { error: updateError } = await supabase
          .from('kids')
          .update(payload)
          .eq('id', kidToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('kids')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;
      
      // Emite evento para atualizar a lista automaticamente
      DeviceEventEmitter.emit('kids.updated');
      
      Alert.alert('Sucesso', `Criança ${kidToEdit ? 'atualizada' : 'cadastrada'} com sucesso!`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
            <ThemedText style={styles.title}>{kidToEdit ? 'Editar Criança' : 'Cadastrar Criança'}</ThemedText>
          </View>
          
          <View style={styles.avatarSection}>
            <Pressable onPress={pickImage} style={[styles.avatarWrap, { backgroundColor: theme.colors.border }]}>
              {uploading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : form.foto_url ? (
                <Image source={{ uri: `${form.foto_url}${form.foto_url.includes('?') ? '&' : '?'}t=${Date.now()}` }} style={styles.avatar} />
              ) : (
                <Ionicons name="camera-outline" size={40} color={theme.colors.muted} />
              )}
            </Pressable>
            <ThemedText style={styles.avatarLabel}>Toque para {form.foto_url ? 'trocar' : 'adicionar'} foto</ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Nome Completo</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              value={form.nome_completo}
              onChangeText={(txt) => setForm({ ...form, nome_completo: txt })}
              placeholder="Nome da criança"
              placeholderTextColor={theme.colors.muted}
            />

            <ThemedText style={styles.label}>Data de Nascimento (DD/MM/AAAA)</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              value={form.aniversario}
              onChangeText={handleDateChange}
              placeholder="Ex: 20/05/2015"
              placeholderTextColor={theme.colors.muted}
              keyboardType="numeric"
              maxLength={10}
            />

            <ThemedText style={styles.label}>Observações (Alergias, restrições...)</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              value={form.observacoes}
              onChangeText={(txt) => setForm({ ...form, observacoes: txt })}
              placeholder="Alguma observação importante?"
              placeholderTextColor={theme.colors.muted}
              multiline
              numberOfLines={4}
            />

            <View style={styles.footerBtns}>
              <Pressable 
                style={[styles.button, { flex: 1, backgroundColor: theme.colors.border }]} 
                onPress={() => navigation.goBack()}
              >
                <ThemedText style={{ color: theme.colors.text, fontWeight: '700' }}>Cancelar</ThemedText>
              </Pressable>
              <Pressable 
                style={[styles.button, { flex: 2, backgroundColor: theme.colors.primary }]} 
                onPress={handleSave}
                disabled={loading || uploading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Salvar</ThemedText>}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
  avatarWrap: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 120, height: 120 },
  avatarLabel: { fontSize: 12, opacity: 0.6 },
  form: { gap: 16 },
  label: { fontWeight: '600', marginBottom: -8 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  footerBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  button: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});