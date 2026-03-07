import { Platform, StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      flex: 1,
      padding: theme.spacing(2),
    },

    // Header da live
    liveHeader: {
      marginBottom: theme.spacing(2),
    },

    liveTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing(0.5),
    },

    liveSubtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
    },

    // Container do vídeo
    videoContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: theme.radius,
      overflow: 'hidden',
      backgroundColor: '#000',
      marginBottom: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    webview: {
      flex: 1,
      backgroundColor: '#000',
    },

    // Status da live
    liveStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
      gap: theme.spacing(1),
    },

    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EF4444',
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(0.5),
      borderRadius: theme.radius / 2,
      gap: 4,
    },

    liveBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    liveIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#fff',
    },

    liveMessage: {
      fontSize: 14,
      color: theme.colors.muted,
      flex: 1,
    },

    // Informações da live
    infoCard: {
      padding: theme.spacing(2),
      borderRadius: theme.radius,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(2),
      gap: theme.spacing(1.5),
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },

    infoText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },

    infoSubtext: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    // Próximas lives
    upcomingSection: {
      marginTop: theme.spacing(1),
    },

    upcomingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(2),
    },

    upcomingCard: {
      padding: theme.spacing(2),
      borderRadius: theme.radius,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(1.5),
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
    },

    upcomingDate: {
      width: 50,
      height: 50,
      borderRadius: theme.radius / 2,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },

    upcomingDay: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primary,
      lineHeight: 20,
    },

    upcomingMonth: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },

    upcomingInfo: {
      flex: 1,
      gap: 4,
    },

    upcomingName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },

    upcomingTime: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    // Botões de ação
    actions: {
      flexDirection: 'row',
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
    },

    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(2),
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },

    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },

    buttonTextPrimary: {
      color: '#fff',
    },

    // Loading e estados vazios
    loadingContainer: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyState: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(2),
    },

    emptyStateText: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    // Separador
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing(2),
    },
  });