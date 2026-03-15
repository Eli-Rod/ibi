import React, { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useEventos } from '../../hooks/useEventos';
import { useTheme } from '../../theme/ThemeProvider';

import { PageHeader } from '../../components/PageHeader';

import { createStyles } from './EventosScreen.styles';


export default function EventosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: eventos, loading, refreshing, onRefresh } = useEventos({ futuros: true });

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <View style={styles.content}>
          <PageHeader
            title="Eventos"
            subtitle="Fique de olho nos eventos que estão acontecendo na igreja."
            icon="calendar-outline"
          // badge={0}
          />

          {/* Aqui virá o conteúdo de leitura */}

        </View>
      </View>
    );
  }
}