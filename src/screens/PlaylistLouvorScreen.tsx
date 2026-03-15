import React, { useMemo } from 'react';
import { View } from 'react-native';

import { PageHeader } from '../components/PageHeader';

import { useTheme } from '../theme/ThemeProvider';

import { createStyles } from './styles/MinisteriosScreen.styles';

export default function MinisteriosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <PageHeader
          title="Playlist de Louvor"
          subtitle="Aqui você encontrará uma seleção de músicas de louvor para elevar seu espírito à adorar a Deus."
          icon="headset-outline"
          // badge={0}
        />
        
        {/* Aqui virá o conteúdo de leitura */}
        
      </View>
    </View>
  );
}