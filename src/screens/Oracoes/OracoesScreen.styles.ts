import { Platform, StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';


export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.colors.background,
    },

    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(4),
    },

    // Header
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

    // Botão flutuante de adicionar
    fab: {
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

    // Estatísticas
    statsContainer: {
      flexDirection: 'row',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },

    statCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      padding: theme.spacing(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },

    statNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.primary,
      marginBottom: 4,
    },

    statLabel: {
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    // Filtros
    filtersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },

    filtersScroll: {
      flexGrow: 0,
    },

    filterChip: {
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(1),
      borderRadius: 20,
      backgroundColor: theme.colors.card,
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
      color: theme.colors.text,
    },

    filterChipTextActive: {
      color: '#fff',
    },

    filterIcon: {
      padding: theme.spacing(1),
    },

    // Cards de oração
    prayerCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(2),
      overflow: 'hidden',
      position: 'relative',
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

    // Badge "Meu pedido" (NOVO)
    myPrayerBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 10,
    },

    myPrayerBadgeText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '600',
    },

    prayerHeader: {
      flexDirection: 'row',
      padding: theme.spacing(2),
      alignItems: 'center',
      gap: theme.spacing(2),
    },

    prayerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },

    prayerAvatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },

    prayerAuthorInfo: {
      flex: 1,
    },

    prayerAuthorName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },

    prayerTime: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    prayerMenuButton: {
      padding: theme.spacing(1),
    },

    prayerContent: {
      paddingHorizontal: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },

    prayerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing(1),
    },

    prayerDescription: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: theme.spacing(2),
    },

    // Tags
    prayerTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },

    tag: {
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(0.5),
      borderRadius: theme.radius / 2,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    tagText: {
      fontSize: 11,
      color: theme.colors.muted,
    },

    // Data de expiração
    expiryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },

    expiryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: theme.spacing(1.5),
      paddingVertical: theme.spacing(0.5),
      borderRadius: theme.radius / 2,
      gap: 4,
    },

    expiryBadgeUrgent: {
      backgroundColor: '#FEE2E2',
    },

    expiryText: {
      fontSize: 12,
      color: '#92400E',
      fontWeight: '600',
    },

    expiryTextUrgent: {
      color: '#B91C1C',
    },

    // Interações
    prayerInteractions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    interactionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(1),
      paddingVertical: theme.spacing(1.5),
    },

    interactionButtonLeft: {
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },

    interactionText: {
      fontSize: 13,
      color: theme.colors.text,
    },

    interactionTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Lembretes
    reminderBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.card,
    },

    reminderBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
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
      fontSize: 16,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    emptyStateButton: {
      marginTop: theme.spacing(2),
      paddingHorizontal: theme.spacing(4),
      paddingVertical: theme.spacing(2),
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius,
    },

    emptyStateButtonText: {
      color: '#fff',
      fontWeight: '700',
    },

    // Modal de criação
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },

    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing(3),
      maxHeight: '90%',
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

    modalCloseButton: {
      padding: theme.spacing(1),
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

    // Date picker
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      padding: theme.spacing(1.5),
      backgroundColor: theme.colors.background,
    },

    datePickerText: {
      fontSize: 16,
      color: theme.colors.text,
    },

    // Tags selector
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
    },

    tagSelector: {
      paddingHorizontal: theme.spacing(2),
      paddingVertical: theme.spacing(1),
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    tagSelectorActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    tagSelectorText: {
      fontSize: 13,
      color: theme.colors.text,
    },

    tagSelectorTextActive: {
      color: '#fff',
    },



    prayersListModal: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius * 2,
      padding: theme.spacing(2),
    },

    prayersListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
      paddingVertical: theme.spacing(1.5),
      paddingHorizontal: theme.spacing(2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    prayersListName: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },

    // Separador
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing(2),
    },
    commentItem: {
      flexDirection: 'row',
      gap: theme.spacing(2),
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },

    commentContent: {
      flex: 1,
      gap: theme.spacing(1),
    },

    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    commentAuthor: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },

    commentTime: {
      fontSize: 11,
      color: theme.colors.muted,
    },

    commentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },

    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(2),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    commentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      padding: theme.spacing(1.5),
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      maxHeight: 100,
    },

    commentSendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
    },

    // Skeletons para Loading
    loadingSkeleton: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },

    skeletonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },

    skeletonAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.border,
    },

    skeletonHeaderText: {
      flex: 1,
      gap: 8,
    },

    skeletonLine: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      opacity: 0.7,
    },

    skeletonContent: {
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },

    skeletonTags: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },

    skeletonTag: {
      width: 60,
      height: 24,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius / 2,
      opacity: 0.7,
    },

    skeletonExpiry: {
      width: 120,
      height: 24,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius / 2,
      opacity: 0.7,
      marginTop: 8,
    },

    skeletonInteractions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 8,
      paddingTop: 12,
      gap: 12,
    },

    skeletonInteractionButton: {
      flex: 1,
      height: 36,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radius / 2,
      opacity: 0.7,
    },

    // Loading Container Principal
    mainLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing(4),
    },

    mainLoadingText: {
      marginTop: theme.spacing(2),
      color: theme.colors.muted,
      fontSize: 14,
    },

    // Menu de opções
    optionsMenu: {
      position: 'absolute',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing(1),
      minWidth: 200,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
      zIndex: 1000,
    },

    optionsMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      paddingVertical: theme.spacing(1.5),
      paddingHorizontal: theme.spacing(2),
    },

    optionsMenuText: {
      fontSize: 14,
      color: theme.colors.text,
    },

    optionsMenuDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing(1),
    },

    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 999,
    },

    // Modal de configuração de lembrete
    reminderConfigModal: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius,
      padding: theme.spacing(3),
      width: '90%',
      maxWidth: 400,
    },

    reminderConfigContent: {
      marginTop: theme.spacing(2),
      gap: theme.spacing(2),
    },

    reminderConfigText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },

    reminderInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(2),
    },

    reminderInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius,
      padding: theme.spacing(1.5),
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      textAlign: 'center',
    },

    reminderTypeButtons: {
      flex: 2,
      flexDirection: 'row',
      gap: theme.spacing(1),
    },

    reminderTypeButton: {
      flex: 1,
      paddingVertical: theme.spacing(1.5),
      paddingHorizontal: theme.spacing(1),
      borderRadius: theme.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },

    reminderTypeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    reminderTypeButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },

    reminderTypeButtonTextActive: {
      color: '#fff',
    },

    reminderConfigNote: {
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: 'center',
    },

    reminderConfigActions: {
      flexDirection: 'row',
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
    },

    reminderConfigButton: {
      flex: 1,
      paddingVertical: theme.spacing(2),
      borderRadius: theme.radius,
      alignItems: 'center',
    },

    reminderConfigButtonText: {
      color: '#fff',
      fontWeight: '700',
    },

    reminderConfigButtonCancel: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    reminderConfigButtonCancelText: {
      color: theme.colors.muted,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    modalOverlayTouch: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    commentsListContainer: {
      flex: 1,
      minHeight: 200,
      maxHeight: 400,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },

    // commentsModalContent: {
    //   backgroundColor: theme.colors.card,
    //   borderTopLeftRadius: 24,
    //   borderTopRightRadius: 24,
    //   paddingHorizontal: theme.spacing(3),
    //   paddingTop: theme.spacing(3),
    //   paddingBottom: Platform.select({
    //     ios: getBottomSpace ? getBottomSpace() + theme.spacing(2) : 34,
    //     android: theme.spacing(3),
    //     default: theme.spacing(3),
    //   }),
    //   width: '100%',
    //   height: '80%', // Aumentei para 80% para garantir cobertura total
    //   zIndex: 10,
    //   position: 'absolute',
    //   bottom: 0,
    //   left: 0,
    //   right: 0,
    //   // Sombra para dar profundidade
    //   shadowColor: '#000',
    //   shadowOffset: { width: 0, height: -3 },
    //   shadowOpacity: 0.1,
    //   shadowRadius: 5,
    //   elevation: 10,
    // },

    // prayersListModalFull: {
    //   backgroundColor: theme.colors.card,
    //   borderTopLeftRadius: 24,
    //   borderTopRightRadius: 24,
    //   paddingHorizontal: theme.spacing(3),
    //   paddingTop: theme.spacing(3),
    //   paddingBottom: Platform.select({
    //     ios: getBottomSpace ? getBottomSpace() + theme.spacing(2) : 34,
    //     android: theme.spacing(3),
    //     default: theme.spacing(3),
    //   }),
    //   width: '100%',
    //   height: '80%',
    //   zIndex: 10,
    //   position: 'absolute',
    //   bottom: 0,
    //   left: 0,
    //   right: 0,
    //   // Sombra para dar profundidade
    //   shadowColor: '#000',
    //   shadowOffset: { width: 0, height: -3 },
    //   shadowOpacity: 0.1,
    //   shadowRadius: 5,
    //   elevation: 10,
    // },
    commentsModalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: theme.spacing(3),
      paddingTop: theme.spacing(3),
      paddingBottom: 0,
      width: '100%',
      height: '85%', // Altura fixa, o SafeArea vai ajustar
      zIndex: 10,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 10,
    },

    prayersListModalFull: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: theme.spacing(3),
      paddingTop: theme.spacing(3),
      paddingBottom: 0,
      width: '100%',
      height: '85%',
      zIndex: 10,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 10,
    },

    modalHeaderWithTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Mudado de 'center' para 'flex-start'
      marginBottom: theme.spacing(2),
      gap: theme.spacing(2),
    },

    modalTitleWithBreak: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      flex: 1, // Ocupa o espaço disponível
      flexWrap: 'wrap', // Permite quebra de linha
    },

    commentsList: {
      flex: 1,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },

    commentsListContent: {
      paddingVertical: theme.spacing(1),
      paddingHorizontal: theme.spacing(1),
    },


  });