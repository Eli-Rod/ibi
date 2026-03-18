import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUserId } = useTheme();

  const refreshAttempts = useRef(0);
  const maxRefreshAttempts = 3;

  // 🔥 Função para resetar tudo
  const resetState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRoles([]);
  };

  // 🔥 Função melhorada para buscar perfil com retry
  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      console.log(`📥 Buscando perfil para usuário: ${userId} (tentativa ${retryCount + 1})`);

      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome_completo, apelido, celular, cep, logradouro, endereco, numero, complemento, bairro, cidade, uf, biometria_ativa, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);

        // Retry até 3 vezes
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchProfile(userId, retryCount + 1);
        }
        return null;
      }

      if (data) {
        console.log('✅ Perfil encontrado:', data.apelido || data.nome_completo);
        setProfile(data);
        DeviceEventEmitter.emit('profile.updated', data);
        return data;
      } else {
        console.log('⚠️ Perfil não encontrado para o usuário');
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Exceção ao buscar perfil:', error);
      return null;
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
      console.error('Erro ao buscar papéis:', error);
      setUserRoles([]);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const clearSession = async () => {
    try {
      console.log('🧹 Limpando sessão...');
      await supabase.auth.signOut({ scope: 'local' });

      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key =>
        key.includes('supabase') || key.includes('sb-') || key.includes('auth') || key.includes('token')
      );

      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
      }

      resetState();
      console.log('✅ Sessão limpa');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
      resetState();
    }
  };

  // 🔥 Função principal de inicialização com tratamento de erro
  const initializeAuth = async () => {
    try {
      setLoading(true);

      // 🔥 PRIMEIRO: Limpar qualquer sessão local antes de tentar buscar
      // await supabase.auth.signOut({ scope: 'local' });

      // Buscar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao buscar sessão:', error);

        // 🔥 TRATAMENTO ESPECÍFICO PARA REFRESH TOKEN INVÁLIDO
        if (error.message.includes('Invalid Refresh Token') ||
          error.message.includes('Refresh Token Not Found')) {
          console.log('⚠️ Refresh token inválido, limpando sessão local');
          await clearSession();
          setLoading(false);
          return;
        }

        resetState();
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('👤 Usuário encontrado na sessão:', session.user.email);
        setUser(session.user);
        setSession(session);

        // Buscar perfil e papéis em paralelo
        const [profileData] = await Promise.all([
          fetchProfile(session.user.id),
          fetchUserRoles(session.user.id)
        ]);

        if (!profileData) {
          console.log('⚠️ Usuário sem perfil cadastrado');
        }
      } else {
        console.log('👤 Nenhuma sessão ativa');
        resetState();
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Erro na inicialização:', error);

      // 🔥 TRATAMENTO DE ERRO NO CATCH
      if (error.message?.includes('Invalid Refresh Token')) {
        await clearSession();
      }

      resetState();
      setLoading(false);
    }
  };

  // Efeito principal
  useEffect(() => {
    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('📡 Auth event:', event);

      // 🔥 Atualiza o userId no ThemeProvider
      setUserId(session?.user?.id || null);

      if (event === 'SIGNED_IN') {
        console.log('✅ Login detectado');
        setUser(session?.user ?? null);
        setSession(session);

        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchUserRoles(session.user.id)
          ]);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Logout detectado');
        resetState();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token renovado');
        refreshAttempts.current = 0;
      } else if (event === 'USER_UPDATED') {
        console.log('👤 Usuário atualizado');
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === 'INITIAL_SESSION') {
        // Ignorar INITIAL_SESSION - já tratamos no initializeAuth
        console.log('ℹ️ Evento INITIAL_SESSION ignorado');
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log('Erro no logout:', error);
        await clearSession();
      }

      resetState();
      Alert.alert('Sucesso', 'Você saiu da sua conta.');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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