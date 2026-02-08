import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import { ThemedText } from './Themed';

import { MENU_ITEMS, MenuItem } from '../config/menu';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { height: 120 },
    listContent: { paddingHorizontal: 4, gap: 10 },
    item: {
      width: 110,
      height: 110,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      gap: 8,
      backgroundColor: t.colors.card,
      borderColor: t.colors.border,
    },
    label: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  });

export default function MenuCarrossel() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: MenuItem }) => (
    <Pressable
      onPress={() => {
        if (item.route) navigation.navigate(item.route);
        else if (item.externalUrl) {
          // Linking.openURL(item.externalUrl);
          navigation.navigate('Mensagens', { externalUrl: item.externalUrl });
        }
      }}
      style={({ pressed }) => [s.item, { opacity: pressed ? 0.85 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
      <ThemedText numberOfLines={2} style={s.label}>
        {item.label}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
      />
    </View>
  );
}