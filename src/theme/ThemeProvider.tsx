import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, ColorMode, Theme } from './tokens';

type ThemeCtx = {
  theme: Theme;
  setMode: (mode: ColorMode) => void;
  isLoading: boolean;
  setUserId: (id: string | null) => void; // 🔥 Nova função para atualizar o userId
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const [mode, setModeState] = useState<ColorMode>((deviceScheme ?? 'light') as ColorMode);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null); // 🔥 Estado para armazenar o userId

  // 🔥 Carregar tema salvo do usuário no AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        if (userId) {
          // Se tem usuário logado, carrega o tema dele
          const savedMode = await AsyncStorage.getItem(`theme.mode.${userId}`);
          if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            setModeState(savedMode as ColorMode);
          } else {
            // Se não tem tema salvo, usa o padrão (sistema)
            setModeState((deviceScheme ?? 'light') as ColorMode);
          }
        } else {
          // Se não tem usuário, usa o tema do sistema
          setModeState((deviceScheme ?? 'light') as ColorMode);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]); // 🔥 Recarrega quando o usuário mudar

  // 🔥 Função para atualizar o modo e salvar no AsyncStorage
  const setMode = async (newMode: ColorMode) => {
    try {
      setModeState(newMode);
      if (userId) {
        // Salva o tema vinculado ao usuário
        await AsyncStorage.setItem(`theme.mode.${userId}`, newMode);
      } else {
        // Se não tiver usuário, salva como tema geral (fallback)
        await AsyncStorage.setItem('theme.mode', newMode);
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const theme = useMemo(() => {
    const t = buildTheme(mode);

    // 🛡️ Garantias adicionais para NUNCA faltar fonts
    if (!t.fonts) {
      t.fonts = { regular: 'System', medium: 'System', bold: 'System' };
    } else {
      t.fonts.regular = t.fonts.regular || 'System';
      t.fonts.medium  = t.fonts.medium  || 'System';
      t.fonts.bold    = t.fonts.bold    || 'System';
    }

    return t;
  }, [mode]);

  return (
    <Ctx.Provider value={{ theme, setMode, isLoading, setUserId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export const useAppTheme = useTheme;