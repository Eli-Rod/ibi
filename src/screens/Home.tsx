import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HeroHeader from '../components/HeroHeader';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { padding: t.spacing(2), gap: t.spacing(2) },
    sectionTitle: { fontWeight: '700', marginBottom: 6 },
    muted: { color: t.colors.muted },
  });

export default function Home() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container}>
        {/* Header com gradiente + CTAs */}
        <HeroHeader
          title="Bem-vindo à IBI"
          subtitle="Igreja Batista Identidade"
          // logo={require('../../assets/logoIbi.png')}  // se quiser inserir a marca no canto
          onPrimary={() => navigation.navigate('Contribuições')}
          onSecondary={() => navigation.navigate('Mensagens')}
        />

        {/* Menu carrossel com efeito center-pop
        <MenuDock /> */}

        {/* Seções (placeholders) */}
        <ThemedCard>
          <ThemedText style={s.sectionTitle}>Avisos</ThemedText>
          <ThemedText style={s.muted}>Em breve: avisos automáticos da semana.</ThemedText>
        </ThemedCard>

        <ThemedCard>
          <ThemedText style={s.sectionTitle}>Próximos eventos</ThemedText>
          <ThemedText style={s.muted}>Em breve: calendário com filtros.</ThemedText>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
}