import { Platform, StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },

    // Cards de informações bancárias
    bankCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(2.5),
      marginBottom: theme.spacing(2.5),
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

    bankHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(2),
    },

    bankName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },

    bankInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing(1.5),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    bankInfoLabel: {
      fontSize: 14,
      color: theme.colors.muted,
      flex: 1,
    },

    bankInfoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 2,
    },

    copyButton: {
      padding: theme.spacing(1),
    },

    // Seção PIX
    pixSection: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(2.5),
      marginBottom: theme.spacing(2.5),
    },

    pixHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(2),
    },

    pixTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },

    pixSubtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      marginBottom: theme.spacing(2),
    },

    // Input de valor
    valueInputContainer: {
      marginBottom: theme.spacing(2.5),
    },

    valueLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
    },

    valueInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(1.5),
      fontSize: 18,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },

    // QR Code
    qrCodeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(2.5),
      backgroundColor: '#fff',
      borderRadius: theme.radius,
      marginBottom: theme.spacing(2.5),
    },

    qrCodeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(0.5),
    },

    qrCodeValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: theme.spacing(0.5),
    },

    qrCodeInstructions: {
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    // Botões de ação
    actionsContainer: {
      flexDirection: 'row',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(2.5),
    },

    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(2),
      borderRadius: theme.radius,
      backgroundColor: theme.colors.primary,
    },

    actionButtonSecondary: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    actionButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },

    actionButtonTextSecondary: {
      color: theme.colors.text,
    },

    // Valores rápidos
    quickValuesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(2.5),
      justifyContent: 'center',
    },

    quickValueButton: {
      paddingHorizontal: theme.spacing(2.5),
      paddingVertical: theme.spacing(1.5),
      borderRadius: 25,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    quickValueButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    quickValueText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },

    quickValueTextActive: {
      color: '#fff',
    },

    // Chave PIX
    pixKeyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      // padding: theme.spacing(1.5),
      paddingLeft: theme.spacing(1.5),
      marginBottom: theme.spacing(1),
    },

    pixKeyText: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    // Informações adicionais
    infoCard: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.radius,
      padding: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      marginBottom: theme.spacing(2.5),
    },

    infoText: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },

    infoHighlight: {
      color: theme.colors.primary,
      fontWeight: '700',
    },

    // Modal de confirmação
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(2),
    },

    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      padding: theme.spacing(3),
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
    },

    modalIcon: {
      marginBottom: theme.spacing(2),
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
    },

    modalText: {
      fontSize: 16,
      color: theme.colors.muted,
      textAlign: 'center',
      marginBottom: theme.spacing(3),
    },

    modalButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(4),
      borderRadius: theme.radius,
      width: '100%',
      alignItems: 'center',
    },

    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },

    // Separador
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing(2),
    },

    // Loading
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
      fontSize: 16,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: theme.spacing(2),
    },

    modalCloseButton: {
      padding: theme.spacing(1),
      borderRadius: 20,
      backgroundColor: theme.colors.background,
    },

    modalActions: {
      flexDirection: 'column',
      gap: theme.spacing(1.5),
      width: '100%',
      marginTop: theme.spacing(2),
    },

    modalActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(3),
      borderRadius: theme.radius,
      width: '100%',
    },

    modalActionButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },

    modalActionButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },

    modalActionButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    modalActionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },

    modalActionButtonTextOutline: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: '600',
    },
  });