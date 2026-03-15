import React, { useMemo } from 'react';
import { View } from 'react-native';

import { PageHeader } from '../../components/PageHeader';

import { useTheme } from '../../theme/ThemeProvider';

import { createStyles } from './NoticiasScreen.styles';

export default function MinisteriosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <PageHeader
          title="Notícias"
          subtitle="Fique por dentro das últimas novidades da igreja"
          icon="newspaper-outline"
          // badge={0}
        />
        
        {/* Aqui virá o conteúdo informativo */}
        
      </View>
    </View>
  );
}