import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
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
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome_completo, apelido, celular, cep, logradouro, endereco, numero, complemento, bairro, cidade, uf, biometria_ativa')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
      // Emitir evento quando o perfil é carregado
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

  useEffect(() => {
    // Busca a sessão atual ao iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    // Escuta mudanças na autenticação (login, logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserRoles(session.user.id);
      } else {
        setProfile(null);
        setUserRoles([]);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, userRoles, hasRole, refreshProfile, signOut }}>
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