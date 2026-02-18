import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import AnnouncementItem from '../components/AnnouncementItem';
import EventItem from '../components/EventItem';
import HeroHeader from '../components/HeroHeader';
import { ThemedText, ThemedView } from '../components/Themed';
import { useAvisos } from '../hooks/useAvisos';
import { useEventos } from '../hooks/useEventos';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { padding: t.spacing(2), gap: t.spacing(2) },
    sectionTitle: { fontWeight: '700', marginBottom: 6, marginTop: 10 },
    muted: { color: t.colors.muted },
    loadingContainer: { padding: 20, alignItems: 'center' }
  });

export default function Home() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const { data: avisos, loading: loadingAvisos } = useAvisos({ realtime: true });
  const { data: eventos, loading: loadingEventos } = useEventos({ futuros: true });

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.container}>
        <HeroHeader
          title="Bem-vindo à IBI"
          subtitle="Igreja Batista Identidade"
          onPrimary={() => navigation.navigate('Contribuições')}
          onSecondary={() => navigation.navigate('Mensagens')}
        />

        <ThemedText style={s.sectionTitle}>Avisos</ThemedText>
        {loadingAvisos ? (
          <View style={s.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View>
        ) : avisos.length > 0 ? (
          avisos.map(aviso => (
            <AnnouncementItem 
              key={aviso.id} 
              title={aviso.titulo} 
              detail={aviso.corpo} 
            />
          ))
        ) : (
          <ThemedText style={s.muted}>Nenhum aviso no momento.</ThemedText>
        )}

        <ThemedText style={s.sectionTitle}>Próximos eventos</ThemedText>
        {loadingEventos ? (
          <View style={s.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View>
        ) : eventos.length > 0 ? (
          eventos.map(evento => (
            <EventItem 
              key={evento.id} 
              title={evento.titulo} 
              date={evento.inicio_em ? new Date(evento.inicio_em).toLocaleDateString('pt-BR') : 'Data a definir'} 
              location={evento.local}
            />
          ))
        ) : (
          <ThemedText style={s.muted}>Nenhum evento programado.</ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}