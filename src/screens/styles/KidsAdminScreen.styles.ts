import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
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
      color: theme.colors.text,
    },
    subtitle: {
      opacity: 0.7,
      fontSize: 14,
      color: theme.colors.text,
    },
    card: {
      marginBottom: 16,
      padding: 16,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    avatarWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatar: {
      width: 60,
      height: 60,
    },
    kidName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    parentInfo: {
      fontSize: 13,
      opacity: 0.6,
      marginTop: 2,
      color: theme.colors.text,
    },
    obsBadge: {
      backgroundColor: '#FEE2E2',
      padding: 6,
      borderRadius: 6,
      marginTop: 6,
    },
    obsText: {
      fontSize: 11,
      color: '#991B1B',
      fontWeight: '600',
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
      gap: 12,
    },
    typeBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    typeText: {
      fontSize: 10,
      fontWeight: '800',
    },
    approveBtn: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    approveBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 80,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      opacity: 0.6,
      textAlign: 'center',
      color: theme.colors.text,
    },
  });
