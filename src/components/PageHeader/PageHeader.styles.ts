import { StyleSheet } from 'react-native';
import type { Theme as AppTheme } from '../../theme/tokens';

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
      position: 'relative',
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
      borderRadius: 15,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    titleWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginLeft: 12,
    },
    badgeText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subtitleLine: {
      width: 40,
      height: 3,
      borderRadius: 2,
      marginRight: 12,
    },
    subtitle: {
      fontSize: 14,
      opacity: 0.7,
      flex: 1,
      lineHeight: 20,
    },
  });