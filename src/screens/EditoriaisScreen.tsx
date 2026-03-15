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
          title="Editoriais da Semana"
          subtitle="Você terá acesso a conteúdos relevantes para a sua vida espiritual e orientações sobre as atividades desenvolvidas por nossa igreja."
          icon="book-outline"
          // badge={0}
        />
        
        {/* Aqui virá o conteúdo de leitura */}
        
      </View>
    </View>
  );
}