import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import EventItem from '../components/EventItem';
import { ThemedText, ThemedView } from '../components/Themed';
import { useEventos } from '../hooks/useEventos';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: t.spacing(2), gap: t.spacing(2) },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 20, color: t.colors.muted }
  });

export default function EventosScreen() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const { data: eventos, loading, refreshing, onRefresh } = useEventos({ futuros: true });

  if (loading && !refreshing) {
    return (
      <ThemedView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={s.container}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        renderItem={({ item }) => (
          <EventItem 
            title={item.titulo} 
            date={item.inicio_em ? new Date(item.inicio_em).toLocaleDateString('pt-BR') : 'Data a definir'} 
            location={item.local}
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <ThemedText style={s.emptyText}>Nenhum evento encontrado.</ThemedText>
        }
      />
    </ThemedView>
  );
}