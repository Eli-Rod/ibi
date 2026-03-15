import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';


export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 4,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
    },
    card: {
      marginBottom: 12,
      padding: 16,
    },
    cardHeader: {
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    rolesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    noRoles: {
      fontSize: 12,
      color: theme.colors.muted,
      fontStyle: 'italic',
    },
    addRoleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
    },
    addRoleBtnText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.muted,
      marginTop: 12,
    },
    noResultsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    noResultsText: {
      fontSize: 14,
      color: theme.colors.muted,
      marginTop: 12,
      textAlign: 'center',
    },
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 30,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
    },
    rolesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    roleOption: {
      flex: 0.48,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roleOptionText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
    },
    closeBtn: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });