import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { createStyles } from './styles/LoginScreen.styles';

export default function LoginScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erro no Login', error.message);
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail) {
      Alert.alert('Erro', 'Preencha o campo de e-mail');
      return;
    }

    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: 'ibi://reset-password',
      });

      if (error) {
        Alert.alert('Erro', error.message);
      } else {
        setResetSent(true);
        Alert.alert(
          'E-mail enviado',
          'Verifique seu e-mail para receber as instruções de recuperação de senha.'
        );
      }
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setForgotLoading(false);
    }
  }

  function handleCloseForgotPassword() {
    setShowForgotPassword(false);
    setForgotEmail('');
    setResetSent(false);
  }

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Bem-vindo</ThemedText>
            <ThemedText style={styles.subtitle}>
              Faça login para acessar sua conta IBI
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>E-mail</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <ThemedText style={styles.label}>Senha</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  Entrar
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <ThemedText style={styles.linkText}>
                Esqueceu sua senha?
              </ThemedText>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <ThemedText style={styles.linkText}>
                Não tem uma conta? Cadastre-se
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Recuperação de Senha */}
      <Modal
        visible={showForgotPassword}
        transparent
        animationType="fade"
        onRequestClose={handleCloseForgotPassword}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <ThemedText style={{ fontSize: 20, fontWeight: '800' }}>
                Recuperar Senha
              </ThemedText>
              <Pressable onPress={handleCloseForgotPassword}>
                <Ionicons name="close-outline" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {!resetSent ? (
              <>
                <ThemedText style={{ color: theme.colors.muted, marginBottom: 16 }}>
                  Digite seu e-mail para receber um link de recuperação de senha.
                </ThemedText>

                <ThemedText style={{ ...styles.label, marginBottom: 8 }}>
                  E-mail
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.colors.muted}
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!forgotLoading}
                />

                <Pressable
                  style={{
                    ...styles.button,
                    marginTop: 24,
                    marginBottom: 12,
                  }}
                  onPress={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.buttonText}>
                      Enviar Link de Recuperação
                    </ThemedText>
                  )}
                </Pressable>

                <Pressable
                  style={{
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                  onPress={handleCloseForgotPassword}
                >
                  <ThemedText style={{ color: theme.colors.primary, fontWeight: '600' }}>
                    Cancelar
                  </ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color={theme.colors.primary}
                    style={{ marginBottom: 12 }}
                  />
                  <ThemedText style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                    E-mail Enviado!
                  </ThemedText>
                  <ThemedText style={{ color: theme.colors.muted, textAlign: 'center' }}>
                    Verifique seu e-mail para receber as instruções de recuperação de senha.
                  </ThemedText>
                </View>

                <Pressable
                  style={styles.button}
                  onPress={handleCloseForgotPassword}
                >
                  <ThemedText style={styles.buttonText}>
                    Voltar para Login
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}