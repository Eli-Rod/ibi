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
    },

    // Seção de categorias
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(1.5),
      marginTop: theme.spacing(2),
    },

    categoriesContainer: {
      marginBottom: theme.spacing(2),
    },

    categoriesScroll: {
      flexGrow: 0,
      paddingBottom: theme.spacing(1),
    },

    categoryCard: {
      width: 140,
      height: 100,
      borderRadius: theme.radius,
      marginRight: theme.spacing(2),
      overflow: 'hidden',
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

    categoryGradient: {
      flex: 1,
      padding: theme.spacing(1.5),
      justifyContent: 'flex-end',
    },

    categoryTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    },

    categoryCount: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
    },

    // Cards de playlist (horizontal)
    playlistCard: {
      width: 200,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      marginRight: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },

    playlistImage: {
      width: '100%',
      height: 120,
      backgroundColor: theme.colors.primary + '20',
    },

    playlistInfo: {
      padding: theme.spacing(1.5),
    },

    playlistName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },

    playlistMeta: {
      fontSize: 11,
      color: theme.colors.muted,
      marginBottom: 4,
    },

    playlistPlatform: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },

    platformIcon: {
      width: 16,
      height: 16,
      borderRadius: 4,
    },

    platformText: {
      fontSize: 10,
      color: theme.colors.muted,
    },

    // Lista de músicas (vertical)
    songsList: {
      marginTop: theme.spacing(2),
    },

    songItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing(1.5),
      paddingHorizontal: theme.spacing(1),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing(2),
    },

    songImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      backgroundColor: theme.colors.primary + '20',
    },

    songInfo: {
      flex: 1,
    },

    songTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },

    songArtist: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    songDuration: {
      fontSize: 11,
      color: theme.colors.muted,
      marginRight: theme.spacing(1),
    },

    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Player inferior
    miniPlayer: {
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
      width: 40,
      height: 40,
      borderRadius: 6,
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
      gap: theme.spacing(2),
    },

    // Modal de player expandido
    expandedPlayerModal: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing(3),
      width: '100%',
      height: '90%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },

    expandedArtwork: {
      width: 250,
      height: 250,
      borderRadius: 16,
      alignSelf: 'center',
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
      width: '45%',
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
      gap: theme.spacing(4),
      marginVertical: theme.spacing(3),
    },

    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
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

    // Integração com plataformas
    platformSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: theme.spacing(2),
      paddingVertical: theme.spacing(1),
      backgroundColor: theme.colors.background,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    platformOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: theme.spacing(1),
      paddingHorizontal: theme.spacing(2),
      borderRadius: 20,
    },

    platformOptionActive: {
      backgroundColor: theme.colors.primary + '20',
    },

    platformOptionText: {
      fontSize: 12,
      color: theme.colors.text,
    },

    platformOptionTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Botão de adicionar playlist
    addButton: {
      position: 'absolute',
      bottom: 24,
      right: 16,
      backgroundColor: theme.colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
        },
      }),
      zIndex: 10,
    },

    // Loading skeleton
    skeletonCard: {
      width: 200,
      height: 180,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      marginRight: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    skeletonImage: {
      width: '100%',
      height: 120,
      backgroundColor: theme.colors.border,
    },

    skeletonLine: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      marginTop: 8,
    },

    // Modal styles (ADICIONADOS)
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

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
    },

    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing(3),
      maxHeight: '90%',
    },

    modalField: {
      marginBottom: theme.spacing(2),
    },

    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
    },

    modalInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      padding: theme.spacing(1.5),
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },

    modalTextArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },

    modalButton: {
      paddingVertical: theme.spacing(2),
      borderRadius: theme.radius,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing(2),
      flexDirection: 'row',
    },

    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },

    modalButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },

    modalButtonCancel: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: theme.spacing(1),
    },

    modalButtonCancelText: {
      color: theme.colors.muted,
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

    searchContainer: {
      marginVertical: theme.spacing(2),
    },

    searchInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: Platform.OS === 'ios' ? theme.spacing(1.5) : 0,
      backgroundColor: theme.colors.background,
    },

    searchTextInput: {
      flex: 1,
      marginLeft: theme.spacing(1),
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: Platform.OS === 'ios' ? theme.spacing(1.5) : theme.spacing(1),
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });

// import { StyleSheet } from 'react-native';
// import type { Theme as AppTheme } from '../../theme/tokens';

// export const createStyles = (theme: AppTheme) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       // backgroundColor: theme.colors.background,
//     },

//     content: {
//       flex: 1,
//       paddingHorizontal: theme.spacing(2), // Padding nas laterais
//       paddingTop: theme.spacing(2),
//     },

//     header: {
//       marginBottom: theme.spacing(3),
//     },

//     headerTitle: {
//       fontSize: 28,
//       fontWeight: '800',
//       color: theme.colors.text,
//       marginBottom: theme.spacing(0.5),
//     },

//     headerSubtitle: {
//       fontSize: 14,
//       color: theme.colors.muted,
//       lineHeight: 20,
//     },
//   });