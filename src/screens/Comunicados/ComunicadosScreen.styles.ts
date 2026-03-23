import { Dimensions, Platform, StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    // Carrossel
    carrosselContainer: {
      marginVertical: theme.spacing(2),
      height: 280,
    },

    carrosselContentContainer: {
      paddingHorizontal: (SCREEN_WIDTH - SCREEN_WIDTH * 0.98) / 2,
    },

    carrosselCard: {
      height: 260,
      borderRadius: theme.radius * 1.5,
      overflow: 'hidden',
      backgroundColor: theme.colors.card,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },

    carrosselImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },

    carrosselOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    carrosselContent: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: theme.spacing(2.5),
      zIndex: 2,
    },

    carrosselBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(0.5),
      borderRadius: 4,
      alignSelf: 'flex-start',
    },

    carrosselBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    carrosselTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#fff',
      marginBottom: theme.spacing(1),
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },

    carrosselDescription: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 16,
      marginTop: 4,
    },

    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing(2),
      gap: 8,
    },

    paginationDot: {
      height: 8,
      borderRadius: 4,
      marginHorizontal: 2,
    },

    // Filtros
    filtersContainer: {
      flexDirection: 'row',
      gap: theme.spacing(1.5),
      paddingVertical: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },

    filterChip: {
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(1),
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing(1),
    },

    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
    },

    filterChipTextActive: {
      color: '#fff',
    },

    // Timeline
    timelineContainer: {
      marginTop: theme.spacing(2),
    },

    timelineCard: {
      flexDirection: 'row',
      marginBottom: theme.spacing(2),
    },

    timelineLeft: {
      width: 40,
      alignItems: 'center',
      position: 'relative',
    },

    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginTop: 8,
      zIndex: 2,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },

    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.colors.border,
      position: 'absolute',
      top: 24,
      bottom: -16,
      left: 19,
    },

    timelineRight: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: theme.spacing(1),
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

    timelineImage: {
      width: '100%',
      height: 120,
      backgroundColor: theme.colors.primary + '20',
    },

    timelineContent: {
      padding: theme.spacing(2),
    },

    timelineBadge: {
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },

    timelineBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },

    timelineDateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing(1),
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.primary + '20',
    },

    timelineDateText: {
      fontSize: 11,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    timelineTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
    },

    timelineDescription: {
      fontSize: 13,
      color: theme.colors.muted,
      lineHeight: 18,
      marginBottom: theme.spacing(1.5),
    },

    timelineFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
      marginTop: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    timelineMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    timelineMetaText: {
      fontSize: 11,
      color: theme.colors.muted,
    },

    // Badge fixado/destaque
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

    // Modal
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

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    // Estados vazios e loading
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

    loadingContainer: {
      padding: theme.spacing(5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Skeleton
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

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
  });