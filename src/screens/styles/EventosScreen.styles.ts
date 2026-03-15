import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // Remove a cor sólida - o gradiente virá do componente pai
    },

    scrollView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(4),
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing(4),
    },

    eventsList: {
      marginTop: theme.spacing(2),
      gap: theme.spacing(2),
    },

    eventCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      padding: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    // Mantendo estilos originais para referência
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