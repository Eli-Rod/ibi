import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout do carrossel
const SPACING = 14;
const ITEM_WIDTH = 90;
const SNAP = ITEM_WIDTH + SPACING;

// Largura dos spacers para que o item fique CENTRALIZADO na tela
const SIDE_SPACER = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

// Índice lógico dos itens reais (sem contar spacers de header/footer)
const START_CENTER_INDEX = 1; // queremos começar no item 2 (índice lógico 1)

// Linear helper
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

type DataItem = MenuItem; // agora não colocaremos "spacer" dentro do data

const makeStyles = (t: AppTheme) => {
  const isDark = t.mode === 'dark';

  return StyleSheet.create({
    // Área do “buraco” (neumorphism inset)
    shell: {
      height: 160,
      borderRadius: 20,
      marginBottom: t.spacing(1.5),
      backgroundColor: t.colors.card,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.55 : 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      overflow: 'visible',
    },
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

    listContent: { /* sem padding horizontal */ },
    itemWrap: { width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center', marginRight: SPACING },
    itemCard: {
      width: ITEM_WIDTH,
      height: ITEM_WIDTH,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.card,
      borderColor: t.colors.border,
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

  // Apenas os itens (sem spacers dentro do data)
  const data = React.useMemo<DataItem[]>(() => [...MENU_ITEMS], []);

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatRef = React.useRef<Animated.FlatList<DataItem>>(null);

  // Calcula offset central para um índice lógico (0..data.length-1)
  const getCenterOffsetForIndex = React.useCallback((logicalIndex: number) => {
    // offset = headerSpacer + logicalIndex*(ITEM+SPACING)
    return SIDE_SPACER + logicalIndex * SNAP;
  }, []);

  // Centraliza programaticamente (útil no onLayout e ao tocar)
  function scrollToLogicalIndex(logicalIndex: number, animated = true) {
    const clamped = clamp(logicalIndex, 0, data.length - 1);
    const offset = getCenterOffsetForIndex(clamped);
    (flatRef.current as any)?.scrollToOffset?.({ offset, animated });
  }

  // Ao montar/medir o layout, posiciona no item 2 (índice lógico 1)
  const handleLayout = React.useCallback(() => {
    requestAnimationFrame(() => {
      // sem animação no primeiro frame para evitar “salto”
      scrollToLogicalIndex(START_CENTER_INDEX, false);
    });
  }, [scrollToLogicalIndex]);

  // Melhorar snap: quando a rolagem para, ajusta para a célula mais próxima do centro
  const onMomentumScrollEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      // remove o header spacer para obter a posição lógica
      const logical = (x - SIDE_SPACER) / SNAP;
      const rounded = Math.round(logical);
      scrollToLogicalIndex(rounded);
    },
    [scrollToLogicalIndex]
  );

  // Caso precise detectar o item “mais visível” (não precisamos de estado agora)
  const onViewableItemsChanged = React.useRef(
    (_: { viewableItems: ViewToken[] }) => {}
  ).current;

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;

  function handlePress(item: MenuItem, logicalIndex: number) {
    Haptics.selectionAsync();
    // centraliza e navega
    scrollToLogicalIndex(logicalIndex);
    setTimeout(() => {
      if (item.route) {
        navigation.navigate(item.route);
      } else if (item.externalUrl) {
        navigation.navigate('Mensagens', { externalUrl: item.externalUrl });
      }
    }, 150);
  }

  return (
    <View style={s.shell} onLayout={handleLayout}>
      <View style={s.innerTop} />
      <View style={s.innerBottom} />
      <View style={s.trough} />

      <Animated.FlatList
        ref={flatRef as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(it) => it.id}
        contentContainerStyle={s.listContent}
        // Spacers REAIS como header/footer (nada de paddingHorizontal)
        ListHeaderComponent={<View style={{ width: SIDE_SPACER }} />}
        ListFooterComponent={<View style={{ width: SIDE_SPACER }} />}
        // Snap consistente
        snapToInterval={SNAP}
        snapToAlignment="start"
        decelerationRate={Platform.select({ ios: 'fast', android: 0.98 as any })}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index: logicalIndex }) => {
          // posição base deste item
          const position = getCenterOffsetForIndex(logicalIndex);
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
                  onPress={() => handlePress(item, logicalIndex)}
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