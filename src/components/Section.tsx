import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import { ThemedText } from './Themed';

type Props = {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
};

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { width: '100%' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    title: { fontSize: 18, fontWeight: '700' },
    seeAll: { color: t.colors.muted, fontWeight: '600' },
    contentGap: { gap: 12 }, // você pode trocar para t.spacing(1.5) se preferir
  });

export default function Section({ title, onSeeAll, children }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[s.container, { marginBottom: theme.spacing(2) }]}>
      <View style={s.header}>
        <ThemedText style={s.title}>{title}</ThemedText>

        {onSeeAll ? (
          <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={8}>
            <ThemedText style={s.seeAll}>Ver tudo</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={s.contentGap}>{children}</View>
    </View>
  );
}