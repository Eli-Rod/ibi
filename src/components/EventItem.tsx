import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import Card from './Card'; // mantém seu Card atual; se preferir, troque por ThemedCard
import { ThemedText } from './Themed';

type Props = {
  name: string;
  date: string; // depois formatamos com dayjs
  location?: string;
};

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { gap: 6 },
    name: { fontSize: 16, fontWeight: '700' },
    meta: { color: t.colors.muted },
  });

export default function EventItem({ name, date, location }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <Card>
      <View style={s.container}>
        <ThemedText style={s.name}>{name}</ThemedText>
        <ThemedText style={s.meta}>
          {date}
          {location ? ` · ${location}` : ''}
        </ThemedText>
      </View>
    </Card>
  );
}