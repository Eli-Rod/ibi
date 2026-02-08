// src/components/AnnouncementItem.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import Card from './Card'; // mantém seu Card (já adaptado ao tema)
import { ThemedText } from './Themed';

type Props = { title: string; detail?: string };

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { gap: 6 },
    title: { fontSize: 16, fontWeight: '700' },
    detail: { color: t.colors.muted },
  });

export default function AnnouncementItem({ title, detail }: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <Card>
      <View style={s.container}>
        <ThemedText style={s.title}>{title}</ThemedText>
        {!!detail && <ThemedText style={s.detail}>{detail}</ThemedText>}
      </View>
    </Card>
  );
}