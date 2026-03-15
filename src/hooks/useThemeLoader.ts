import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useThemeLoader() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('theme.mode');
        if (savedMode === 'dark') {
          setThemeMode('dark');
        } else if (savedMode === 'light') {
          setThemeMode('light');
        } else {
          // Se for 'system', pegar do sistema
          const systemIsDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
          setThemeMode(systemIsDark ? 'dark' : 'light');
        }
      } catch (error) {
        setThemeMode('light');
      }
    };

    loadTheme();
  }, []);

  return themeMode;
}