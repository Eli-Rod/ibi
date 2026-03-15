import React, { useMemo } from 'react';
import { View } from 'react-native';

import { PageHeader } from '../../components/PageHeader';

import { useTheme } from '../../theme/ThemeProvider';

import { createStyles } from './ContribuicoesScreen.styles';

export default function MinisteriosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <PageHeader
          title="Ore, Oferte e Contribua"
          subtitle='"Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria"  - (2 Coríntios 9:7)'
          icon="card-outline"
          // badge={0}
        />
        
        {/* Aqui virá o conteúdo das céluas */}
        
      </View>
    </View>
  );
}