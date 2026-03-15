import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing(3),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(3),
    },
    backBtn: {
      padding: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing(3),
      gap: theme.spacing(1),
    },
    avatarWrap: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 120,
      height: 120,
    },
    avatarLabel: {
      fontSize: 12,
      opacity: 0.6,
      color: theme.colors.muted,
    },
    form: {
      gap: theme.spacing(2),
    },
    label: {
      fontWeight: '600',
      marginBottom: -8,
      color: theme.colors.text,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: theme.radius,
      paddingHorizontal: theme.spacing(2),
      fontSize: 16,
    },
    textArea: {
      height: 100,
      paddingTop: theme.spacing(1.5),
      textAlignVertical: 'top',
    },
    footerBtns: {
      flexDirection: 'row',
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(2),
    },
    button: {
      height: 50,
      borderRadius: theme.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });