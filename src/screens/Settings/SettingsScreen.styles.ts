import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: t.spacing(2),
      gap: t.spacing(2),
    },

    sectionTitle: {
      fontWeight: '800',
      fontSize: 16,
      marginBottom: 6,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },

    rowStart: {
      justifyContent: 'flex-start',
      gap: 16,
    },

    rowSmallGap: {
      justifyContent: 'flex-start',
      gap: 8,
    },

    inline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    avatarWrap: {
      width: 80,
      height: 80,
      borderRadius: 999,
      backgroundColor: t.colors.border,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarImage: {
      width: 80,
      height: 80,
    },

    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },

    btn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },

    btnText: {
      fontWeight: '700',
    },

    muted: {
      color: t.colors.muted,
    },

    bold: {
      fontWeight: '700',
    },

    radio: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
  });
