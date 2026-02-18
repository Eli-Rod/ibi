import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
      setLoading(false);
    } else {
      Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro!');
      navigation.navigate('Login');
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Criar Conta</ThemedText>
            <ThemedText style={{ color: theme.colors.muted }}>Junte-se à nossa comunidade IBI</ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>E-mail</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <ThemedText style={styles.label}>Senha</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <ThemedText style={styles.label}>Confirmar Senha</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
              placeholder="Repita sua senha"
              placeholderTextColor={theme.colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Pressable 
              style={[styles.button, { backgroundColor: theme.colors.primary }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Cadastrar</ThemedText>
              )}
            </Pressable>

            <Pressable 
              style={styles.linkButton} 
              onPress={() => navigation.navigate('Login')}
            >
              <ThemedText style={{ color: theme.colors.primary }}>Já tem uma conta? Faça login</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  form: { gap: 16 },
  label: { fontWeight: '600', marginBottom: -8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkButton: { alignItems: 'center', marginTop: 16 },
});