import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import { ThemedText } from './Themed';

// Ajuste este import se seu arquivo chama "Menu.ts" com M maiúsculo
import { MENU_ITEMS, MenuItem } from '../config/menu';

const { width } = Dimensions.get('window');

// Layout do carrossel
const SPACING = 14;
const ITEM_WIDTH = 110;
const SNAP = ITEM_WIDTH + SPACING;

// Para initialScrollIndex funcionar sem warning, expomos getItemLayout
const getItemLayout = (_: any, index: number) => ({
  length: SNAP,
  offset: SNAP * index,
  index,
});

type DataItem = MenuItem | { spacer: true };

const makeStyles = (t: AppTheme) => {
  const isDark = t.mode === 'dark';

  return StyleSheet.create({
    // Área do “buraco” (neumorphism inset)
    shell: {
      height: 160,
      borderRadius: 20,
      marginBottom: t.spacing(1.5),
      backgroundColor: t.colors.card,
      // Sombra externa (ajuste para claro/escuro)
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.55 : 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    // “Inner shadow” fake: bordas claras/escuras
    innerTop: {
      position: 'absolute',
      top: 0,
      left: 2,
      right: 2,
      height: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
    },
    innerBottom: {
      position: 'absolute',
      bottom: 0,
      left: 2,
      right: 2,
      height: 1,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.08)',
    },
    // Canal onde a lista corre (borda interna sutil)
    trough: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 10,
      bottom: 10,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      overflow: 'hidden',
    },

    listContent: { paddingHorizontal: (width - ITEM_WIDTH) / 2, gap: SPACING },
    itemWrap: { width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' },
    itemCard: {
      width: ITEM_WIDTH,
      height: ITEM_WIDTH,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.card,
      borderColor: t.colors.border,
      // Glow do card
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    label: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  });
};

export default function MenuCarrossel() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  // Spacers nas pontas para centralizar o primeiro/último item
  const data = React.useMemo<DataItem[]>(() => [{ spacer: true }, ...MENU_ITEMS, { spacer: true }], []);

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatRef = React.useRef<Animated.FlatList<DataItem>>(null);

  // Começa no primeiro item real (index 1, pois 0 é spacer)
  const initialScrollIndex = 1;

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Skip: já centralizamos via initialScrollIndex + snap
    }
  ).current;

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;

  function scrollToIndexSafe(index: number) {
    const offset = (index - 1) * SNAP;
    (flatRef.current as any)?.scrollToOffset?.({ offset, animated: true });
  }

  function handlePress(item: MenuItem, index: number) {
    Haptics.selectionAsync();
    scrollToIndexSafe(index);
    setTimeout(() => {
      if (item.route) {
        navigation.navigate(item.route);
      } else if (item.externalUrl) {
        navigation.navigate('Mensagens', { externalUrl: item.externalUrl });
      }
    }, 150);
  }

  return (
    <View style={s.shell}>
      <View style={s.innerTop} />
      <View style={s.innerBottom} />
      <View style={s.trough} />

      <Animated.FlatList
        ref={flatRef as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(it, idx) => ('spacer' in it ? `spacer-${idx}` : it.id)}
        contentContainerStyle={s.listContent}
        snapToInterval={SNAP}
        decelerationRate={Platform.select({ ios: 'fast', android: 0.98 as any })}
        bounces={false}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={getItemLayout}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => {
          if ('spacer' in item) {
            return <View style={{ width: (width - ITEM_WIDTH) / 2 }} />;
          }

          // Base do item (compensando spacer inicial)
          const position = (index - 1) * SNAP;
          const inputRange = [position - SNAP, position, position + SNAP];

          // Destaque do item central
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.86, 1.10, 0.86],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [8, -8, 8],
            extrapolate: 'clamp',
          });
          // Opacidade do card inteiro (laterais mais apagadas)
          const cardOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
          // Rótulo mais visível no centro
          const labelOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          });
          // Parallax sutil do ícone
          const iconTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [2, -2, 2],
            extrapolate: 'clamp',
          });
          // Glow/sombra mais forte no centro
          const shadowOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.08, 0.25, 0.08],
            extrapolate: 'clamp',
          });

          return (
            <View style={s.itemWrap}>
              <Animated.View
                style={[
                  s.itemCard,
                  {
                    transform: [{ scale }, { translateY }],
                    opacity: cardOpacity,
                    shadowOpacity,
                  },
                ]}
              >
                <Pressable
                  onPress={() => handlePress(item, index)}
                  android_ripple={{ color: '#00000012', borderless: true }}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Animated.View style={{ transform: [{ translateY: iconTranslateY }] }}>
                    <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
                  </Animated.View>

                  <Animated.View style={{ opacity: labelOpacity }}>
                    <ThemedText style={s.label} numberOfLines={2}>
                      {item.label}
                    </ThemedText>
                  </Animated.View>
                </Pressable>
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
}