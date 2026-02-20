import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    flex1: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    listContent: {
      padding: 20,
      paddingBottom: 40,
    },

    header: {
      marginBottom: 24,
    },

    title: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 4,
    },

    subtitle: {
      opacity: 0.7,
      fontSize: 14,
    },

    card: {
      marginBottom: 16,
      padding: 16,
    },

    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },

    avatarWrap: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },

    avatar: {
      width: 50,
      height: 50,
    },

    kidName: {
      fontSize: 16,
      fontWeight: '700',
    },

    kidInfo: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 2,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },

    actions: {
      flexDirection: 'row',
      gap: 8,
    },

    iconBtn: {
      padding: 4,
    },

    checkinBtn: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    checkinBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 14,
    },

    pendingActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    cancelBtn: {
      padding: 8,
    },

    emptyContainer: {
      alignItems: 'center',
      marginTop: 60,
      gap: 12,
    },

    emptyText: {
      fontSize: 16,
      opacity: 0.6,
      textAlign: 'center',
    },

    addBtn: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 8,
    },

    addBtnText: {
      color: '#fff',
      fontWeight: '700',
    },

    addBtnOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      marginTop: 12,
    },
  });
