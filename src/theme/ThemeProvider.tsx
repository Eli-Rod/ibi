import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, ColorMode, Theme } from './tokens';

type ThemeCtx = {
  theme: Theme;
  setMode: (mode: ColorMode) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const [mode, setModeState] = useState<ColorMode>((deviceScheme ?? 'light') as ColorMode);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tema salvo do AsyncStorage ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem('theme.mode');
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setModeState(savedMode as ColorMode);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Função para atualizar o modo e salvar no AsyncStorage
  const setMode = async (newMode: ColorMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem('theme.mode', newMode);
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

  // Não renderizar até carregar o tema salvo
  if (isLoading) {
    return null;
  }

  return <Ctx.Provider value={{ theme, setMode }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Alias opcional para evitar colisão com outros hooks chamados useTheme
export const useAppTheme = useTheme;