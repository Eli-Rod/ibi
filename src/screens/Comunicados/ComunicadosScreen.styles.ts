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

    // Header fixo
    fixedHeader: {
      marginBottom: theme.spacing(3),
    },

    // Banner em destaque
    featuredContainer: {
      marginBottom: theme.spacing(3),
    },

    featuredCard: {
      width: '100%',
      height: 200,
      borderRadius: theme.radius,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },

    featuredImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },

    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },

    featuredContent: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: theme.spacing(2.5),
    },

    featuredBadge: {
      backgroundColor: theme.colors.primary,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(0.5),
      borderRadius: 4,
      marginBottom: theme.spacing(1.5),
    },

    featuredBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    featuredTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#fff',
      marginBottom: theme.spacing(1),
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },

    featuredDescription: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: theme.spacing(1.5),
      lineHeight: 20,
    },

    featuredMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },

    featuredDate: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.8)',
    },

    // Lista de comunicados
    listContainer: {
      marginTop: theme.spacing(2),
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(2),
    },

    // Card de comunicado
    comunicadoCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(2),
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

    cardImage: {
      width: '100%',
      height: 180,
      backgroundColor: theme.colors.primary + '20',
    },

    cardContent: {
      padding: theme.spacing(2),
    },

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing(1),
    },

    pinnedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing(1),
      paddingVertical: theme.spacing(0.5),
      borderRadius: 4,
      gap: 4,
    },

    pinnedText: {
      fontSize: 11,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
      flex: 1,
    },

    cardDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
      marginBottom: theme.spacing(1.5),
    },

    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    metaText: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    readMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    readMoreText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Modal de detalhes
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },

    modalOverlayTouch: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: theme.spacing(2),
      paddingBottom: Platform.select({
        ios: 34,
        android: theme.spacing(2),
      }),
      maxHeight: '90%',
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing(3),
      paddingVertical: theme.spacing(2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      flex: 1,
    },

    modalCloseButton: {
      padding: theme.spacing(1),
    },

    modalScrollContent: {
      padding: theme.spacing(3),
    },

    modalImage: {
      width: '100%',
      height: 250,
      borderRadius: theme.radius,
      marginBottom: theme.spacing(2),
      backgroundColor: theme.colors.primary + '20',
    },

    modalBody: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: theme.spacing(3),
    },

    modalMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },

    modalDate: {
      fontSize: 14,
      color: theme.colors.muted,
    },

    // Estado vazio
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

    // Loading skeleton
    skeletonCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(2),
      overflow: 'hidden',
    },

    skeletonImage: {
      width: '100%',
      height: 180,
      backgroundColor: theme.colors.border,
    },

    skeletonContent: {
      padding: theme.spacing(2),
      gap: 8,
    },

    skeletonLine: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
    },

    loadingContainer: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipoBadge: {
      paddingHorizontal: theme.spacing(1),
      paddingVertical: theme.spacing(0.5),
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
  });