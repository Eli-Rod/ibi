import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      padding: t.spacing(2),
      gap: t.spacing(2),
    },

    // 🔥 CORREÇÃO AQUI
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    title: {
      flex: 1,
      fontWeight: '700',
      marginRight: 8,
    },

    videoButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.primary, // 🔥 agora fica visível
    },

    videoButtonText: {
      fontWeight: '600',
      color: t.colors.background,
    },

    webview: {
      flex: 1,
      minHeight: 280,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#000',
      marginTop: t.spacing(2),
    },

    actionsContainer: {
      padding: t.spacing(2),
      gap: t.spacing(1),
    },
  });
