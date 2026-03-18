import { Platform, StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Mini Player
    miniPlayer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(1.5),
      gap: theme.spacing(2),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    miniPlayerImage: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: theme.colors.primary + '20',
    },

    miniPlayerInfo: {
      flex: 1,
    },

    miniPlayerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },

    miniPlayerArtist: {
      fontSize: 11,
      color: theme.colors.muted,
    },

    miniPlayerControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    // Expanded Player
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },

    modalOverlayTouch: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    expandedPlayerModal: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing(3),
      width: '100%',
      height: '85%',
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },

    expandedArtwork: {
      width: 240,
      height: 240,
      borderRadius: 16,
      marginVertical: theme.spacing(3),
      backgroundColor: theme.colors.primary + '20',
    },

    expandedTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },

    expandedArtist: {
      fontSize: 16,
      color: theme.colors.muted,
      textAlign: 'center',
      marginBottom: theme.spacing(3),
    },

    progressContainer: {
      width: '100%',
      marginVertical: theme.spacing(3),
    },

    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },

    timeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },

    timeText: {
      fontSize: 11,
      color: theme.colors.muted,
    },

    expandedControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing(3),
      marginVertical: theme.spacing(3),
    },

    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },

    playPauseButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    platformButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1.5),
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(4),
      borderRadius: 30,
      marginTop: theme.spacing(2),
    },

    platformButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });