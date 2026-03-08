import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import { registerForPushNotificationsAsync } from '../services/notificationService';
import { supabase } from '../services/supabase';
import { Profile } from '../types/content';

type AuthContextData = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref para controlar tentativas de refresh
  const refreshAttempts = useRef(0);
  const maxRefreshAttempts = 3;

  // Função para salvar push token no banco
  const savePushToken = async (userId: string) => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('📱 Salvando push token:', token);
        
        // Verificar se já existe um token para este usuário
        const { data: existingToken } = await supabase
          .from('user_push_tokens')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingToken) {
          // Atualizar token existente
          const { error } = await supabase
            .from('user_push_tokens')
            .update({
              push_token: token,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) throw error;
          console.log('✅ Push token atualizado');
        } else {
          // Inserir novo token
          const { error } = await supabase
            .from('user_push_tokens')
            .insert({
              user_id: userId,
              push_token: token,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;
          console.log('✅ Push token salvo');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar push token:', error);
    }
  };

  // Função para limpar sessão local completamente
  const clearSession = async () => {
    try {
      console.log('🧹 Limpando sessão local...');
      
      // Limpar apenas localmente sem chamar API
      await supabase.auth.signOut({ scope: 'local' });
      
      // Limpar AsyncStorage manualmente
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
      }
      
      // Resetar estados
      setUser(null);
      setSession(null);
      setProfile(null);
      setUserRoles([]);
      
      console.log('✅ Sessão local limpa com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome_completo, apelido, celular, cep, logradouro, endereco, numero, complemento, bairro, cidade, uf, biometria_ativa, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
      DeviceEventEmitter.emit('profile.updated', data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setProfile(null);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_papeis')
        .select('papel')
        .eq('usuario_id', userId);
      
      if (error) throw error;
      const roles = data?.map(r => r.papel) || [];
      setUserRoles(roles);
    } catch (error) {
      console.error('Erro ao buscar papéis do usuário:', error);
      setUserRoles([]);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        await fetchProfile(user.id);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    }
  };

  // Função para lidar com erros de refresh token
  const handleAuthError = async (error: any) => {
    if (!error) return false;
    
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    
    // Detectar erro de refresh token inválido
    if (errorMessage.includes('Invalid Refresh Token') || 
        errorMessage.includes('Refresh Token Not Found') ||
        errorCode === 'refresh_token_not_found' ||
        error?.status === 401) {
      
      console.log('⚠️ Erro de refresh token detectado:', errorMessage);
      
      refreshAttempts.current += 1;
      
      if (refreshAttempts.current >= maxRefreshAttempts) {
        console.log('🔄 Máximo de tentativas atingido. Limpando sessão...');
        await clearSession();
        refreshAttempts.current = 0;
        return true;
      }
      
      // Tentar recuperar a sessão
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          console.log('❌ Falha ao recuperar sessão:', refreshError);
          await clearSession();
          refreshAttempts.current = 0;
          return true;
        }
        
        console.log('✅ Sessão recuperada com sucesso');
        refreshAttempts.current = 0;
        return false;
      } catch (e) {
        console.log('❌ Exceção ao recuperar sessão:', e);
        await clearSession();
        refreshAttempts.current = 0;
        return true;
      }
    }
    
    return false;
  };

  // Adicionar listener global para erros do Supabase
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
        refreshAttempts.current = 0;
      }
      
      if (event === 'USER_UPDATED') {
        console.log('👤 User updated');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        await clearSession();
      }
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Busca a sessão atual ao iniciar
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          const wasCleared = await handleAuthError(error);
          if (wasCleared && mounted) {
            setLoading(false);
            return;
          }
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRoles(session.user.id)
            ]);
            
            // Salvar push token quando o usuário estiver logado
            await savePushToken(session.user.id);
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Erro na inicialização da auth:', error);
        await handleAuthError(error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('📡 Auth state change:', event);
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
          
          // Salvar push token quando o usuário fizer login
          await savePushToken(session.user.id);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Tentar fazer logout normalmente
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('Erro no signOut normal, forçando limpeza local:', error);
        await clearSession();
      } else {
        // Limpeza adicional para garantir
        await clearSession();
      }
      
      Alert.alert('Sucesso', 'Você saiu da sua conta.');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Em caso de erro, limpar localmente
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      userRoles, 
      hasRole, 
      refreshProfile, 
      signOut,
      clearSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};