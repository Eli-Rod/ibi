import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    /* ================= HEADER ================= */

    header: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
      gap: 12,
      backgroundColor: theme.colors.background,
    },

    avatarContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      position: 'relative',
    },

    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
    },

    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
      elevation: 4,
    },

    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },

    userEmail: {
      fontSize: 14,
      color: theme.colors.muted,
    },

    /* ================= TABS ================= */

    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 24,
      borderRadius: 14,
      padding: 4,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
    },

    activeTab: {
      backgroundColor: theme.colors.primary,
    },

    tabText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.muted,
    },

    activeTabText: {
      color: '#fff',
    },

    /* ================= SECTION ================= */

    section: {
      paddingHorizontal: 20,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.muted,
      textTransform: 'uppercase',
      marginBottom: 12,
      letterSpacing: 1,
    },

    /* ================= CARD ================= */

    card: {
      padding: 20,
      marginBottom: 20,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    /* ================= INPUTS ================= */

    inputGroup: {
      marginBottom: 18,
    },

    label: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 6,
      color: theme.colors.muted,
    },

    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 15,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },

    disabledInput: {
      opacity: 0.6,
    },

    /* ================= ACTION BUTTONS ================= */

    actionsRow: {
      marginBottom: 20,
    },

    editPrimaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
    },

    editActions: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },

    saveBtn: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
    },

    primaryBtnText: {
      color: '#fff',
      fontWeight: '700',
    },

    cancelText: {
      fontWeight: '700',
      color: theme.colors.text,
    },

    /* ================= CONFIG ================= */

    configCard: {
      padding: 20,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 20,
      marginBottom: 20,
    },

    configRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    configTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },

    configDesc: {
      fontSize: 12,
      color: theme.colors.muted,
    },

    configDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },

    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
      padding: 18,
    },

    logoutText: {
      color: '#EF4444',
      fontWeight: '700',
      fontSize: 16,
    },
  });
