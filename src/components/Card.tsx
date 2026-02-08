import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

type Props = { children: ReactNode };

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: 14,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: t.colors.card,
      borderColor: t.colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  });

export default function Card({ children }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return <View style={s.card}>{children}</View>;
}