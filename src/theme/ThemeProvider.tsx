// src/theme/ThemeProvider.tsx
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, ColorMode, Theme } from './tokens';

type ThemeCtx = {
  theme: Theme;
  setMode: (mode: ColorMode) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Usa o esquema do dispositivo apenas como valor inicial
  const deviceScheme = useColorScheme();
  const [mode, setMode] = useState<ColorMode>((deviceScheme ?? 'light') as ColorMode);

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

    // (Opcional) se quiser garantir notification no tema base também:
    // t.colors.notification = t.colors.notification || t.colors.primary;

    return t;
  }, [mode]);

  return <Ctx.Provider value={{ theme, setMode }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Alias opcional para evitar colisão com outros hooks chamados useTheme
export const useAppTheme = useTheme;