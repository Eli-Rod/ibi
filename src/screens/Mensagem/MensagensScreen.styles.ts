import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(4),
      gap: theme.spacing(2),
      // paddingBottom: theme.spacing(4),
    },

    // Card de vídeo
    videoCard: {
      borderRadius: theme.radius,
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Thumbnail do vídeo (placeholder)
    thumbnailContainer: {
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.primary + '20', // 20 = 12% de opacidade
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    thumbnailGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    // Info do vídeo
    videoInfo: {
      padding: theme.spacing(2),
      gap: theme.spacing(1.5),
    },
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
    },
    videoMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    videoDate: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    videoDuration: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    // Ações do card
    videoActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(1.5),
    },
    actionButtonLeft: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Tela de vídeo em reprodução
    videoPlayerContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    videoPlayerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    videoPlayerTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginRight: theme.spacing(2),
    },
    closeButton: {
      padding: theme.spacing(1),
    },
    videoPlayer: {
      flex: 1,
    },

    // Tela de lista externa (YouTube)
    externalContainer: {
      flex: 1,
    },
    externalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing(2),
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    externalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: theme.spacing(2),
    },
    webview: {
      flex: 1,
    },

    // Controles do player
    playerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    playerControlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(1),
      paddingHorizontal: theme.spacing(2),
      borderRadius: theme.radius,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    playerControlText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    // Loading
    loadingContainer: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Adicione dentro do objeto de estilos:

    thumbnailImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    thumbnailOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });