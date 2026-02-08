import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MenuCarousel from '../components/MenuCarrossel';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: t.spacing(2),
      gap: t.spacing(2),
    },
    header: { gap: 6 },
    title: { fontSize: 22, fontWeight: '800' },
    muted: { color: t.colors.muted },
    sectionTitle: { fontWeight: '700', marginBottom: 6 },
  });

export default function Home() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.container}>
        {/* Cabeçalho */}
        <View style={s.header}>
          <ThemedText style={s.title}>Bem-vindo à IBI</ThemedText>
          <ThemedText style={s.muted}>Igreja Batista Identidade</ThemedText>
        </View>

        {/* Menu rolável */}
        <MenuCarousel />

        {/* Blocos iniciais (placeholders) */}
        <ThemedCard>
          <ThemedText style={s.sectionTitle}>Avisos</ThemedText>
          <ThemedText style={s.muted}>
            Aqui entram os avisos recentes (integraremos depois).
          </ThemedText>
        </ThemedCard>

        <ThemedCard>
          <ThemedText style={s.sectionTitle}>Próximos eventos</ThemedText>
          <ThemedText style={s.muted}>
            Em breve: lista com calendário e filtros.
          </ThemedText>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
}