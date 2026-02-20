import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    container: {
      padding: 24,
      flexGrow: 1,
      justifyContent: 'center',
    },

    header: {
      marginBottom: 32,
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 8,
    },

    subtitle: {
      color: theme.colors.muted,
    },

    form: {
      gap: 16,
    },

    label: {
      fontWeight: '600',
      marginBottom: -8,
    },

    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors.text,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    button: {
      height: 50,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      backgroundColor: theme.colors.primary,
    },

    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },

    linkButton: {
      alignItems: 'center',
      marginTop: 16,
    },

    linkText: {
      color: theme.colors.primary,
    },
  });
