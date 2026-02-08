// src/hooks/useThemeColor.ts
import { useTheme } from '../theme/ThemeProvider';

export function useThemeColor() {
  const { theme } = useTheme();
  return theme;
}

export default useThemeColor;