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
          title="Células"
          subtitle="Venha fazer parte de uma célula e crescer na fé junto com outros irmãos"
          icon="people-outline"
          // badge={0}
        />
        
        {/* Aqui virá o conteúdo das céluas */}
        
      </View>
    </View>
  );
}