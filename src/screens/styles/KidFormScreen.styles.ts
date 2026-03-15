import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      paddingHorizontal: theme.spacing(2), // Padding nas laterais
      paddingTop: theme.spacing(2),
    },

    header: {
      marginBottom: theme.spacing(3),
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing(0.5),
    },

    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
    },
  });