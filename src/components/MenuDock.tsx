import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import { ThemedText } from './Themed';
// ajuste, se necessário, o nome do arquivo de menu
import { MENU_ITEMS, MenuItem } from '../config/menu';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout compacto
const SPACING = 10;
const SLOT = 65;               // slot do item (largura ocupada na FlatList)
const ITEM_RING_MAX = 54;      // diâmetro máximo VISUAL do ring (fixo no layout)
const ITEM_RING_MIN = 48;      // diâmetro visual mínimo que simularemos com scale
const ICON_SIZE_MAX = 24;      // tamanho fixo do Ionicons (vamos escalar)
const SIDE_SPACER = (SCREEN_WIDTH - SLOT) / 1.3;
const START_CENTER_INDEX = 0;  // iniciar no 1º item

// escalas derivadas (evitam animar width/height):
const RING_MIN_SCALE = ITEM_RING_MIN / ITEM_RING_MAX; // ~0.783
const ICON_MIN_SCALE = 20 / ICON_SIZE_MAX;            // ~0.833

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

const makeStyles = (t: AppTheme) => {
  const isDark = t.mode === 'dark';
  return StyleSheet.create({
    container: { marginTop: t.spacing(1), marginBottom: t.spacing(2) },
    dock: {
      height: 124,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    listWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 10,
      bottom: 10,
      justifyContent: 'center',
    },
    slot: {
      width: SLOT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING,
    },
    ringFixed: {
      width: ITEM_RING_MAX,
      height: ITEM_RING_MAX,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    ringInner: { position: 'absolute', inset: 3, borderRadius: 999 },
    label: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  });
};

export default function MenuDock() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const data = React.useMemo<MenuItem[]>(() => [...MENU_ITEMS], []);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatRef = React.useRef<Animated.FlatList<MenuItem>>(null);

  // índice atualmente em foco (central)
  const [centerIndex, setCenterIndex] = React.useState(START_CENTER_INDEX);

  // centro da tela em coordenadas de conteúdo
  // (scrollX + SCREEN_CENTER) → posição x que define o centro “visível”
  const SCREEN_CENTER = SCREEN_WIDTH / 2;
  const scrollXPlusCenter = React.useMemo(
    () => Animated.add(scrollX, new Animated.Value(SCREEN_CENTER)),
    [scrollX]
  );

  const getSlotLeft = React.useCallback((logicalIndex: number) => {
    return SIDE_SPACER + logicalIndex * (SLOT + SPACING);
  }, []);

  const getSlotCenter = React.useCallback(
    (logicalIndex: number) => getSlotLeft(logicalIndex) + SLOT / 2,
    [getSlotLeft]
  );

  const getCenterOffsetForIndex = React.useCallback((logicalIndex: number) => {
    // deslocamento para deixar o item com centro no meio da tela
    return SIDE_SPACER + logicalIndex * (SLOT + SPACING);
  }, []);

  const scrollToLogicalIndex = React.useCallback(
    (logicalIndex: number, animated = true) => {
      const clamped = clamp(logicalIndex, 0, data.length - 1);
      const offset = getCenterOffsetForIndex(clamped);
      (flatRef.current as any)?.scrollToOffset?.({ offset, animated });
    },
    [data.length, getCenterOffsetForIndex]
  );

  const handleLayout = React.useCallback(() => {
    requestAnimationFrame(() => {
      // Sem animação para não “pular”, e fixa o foco lógico
      scrollToLogicalIndex(START_CENTER_INDEX, false);
      setCenterIndex(START_CENTER_INDEX);
    });
  }, [scrollToLogicalIndex]);

  const onMomentumScrollEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      // índice mais próximo do centro
      const logical = (x - SIDE_SPACER) / (SLOT + SPACING);
      const rounded = clamp(Math.round(logical), 0, data.length - 1);
      if (rounded !== centerIndex) setCenterIndex(rounded);
      // “encaixe”
      scrollToLogicalIndex(rounded);
      Haptics.selectionAsync();
    },
    [centerIndex, data.length, scrollToLogicalIndex]
  );

  function handlePress(item: MenuItem, logicalIndex: number) {
    if (logicalIndex !== centerIndex) {
      // 1º toque: só centraliza
      Haptics.selectionAsync();
      setCenterIndex(logicalIndex);
      scrollToLogicalIndex(logicalIndex);
      return;
    }
    // 2º toque (item já em foco): navega
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (item.route) navigation.navigate(item.route);
    else if (item.externalUrl) navigation.navigate('Mensagens', { externalUrl: item.externalUrl });
  }

  return (
    <View style={s.container} onLayout={handleLayout}>
      <View style={s.dock}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 35 : 20}
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
          style={{ flex: 1 }}
        >
          <View style={s.listWrap}>
            <Animated.FlatList
              ref={flatRef as any}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={data}
              keyExtractor={(it) => it.id}
              ListHeaderComponent={<View style={{ width: SIDE_SPACER }} />}
              ListFooterComponent={<View style={{ width: SIDE_SPACER }} />}
              snapToInterval={SLOT + SPACING}
              snapToAlignment="start"
              decelerationRate={Platform.select({ ios: 'fast', android: 0.985 as any })}
              bounces={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item, index: logicalIndex }) => {
                // Centro deste slot em coordenadas da lista
                const ITEM_CENTER_X = getSlotCenter(logicalIndex);

                // Distância do centro da tela → negativo (esq) / zero (centro) / positivo (dir)
                const distToCenter = Animated.subtract(ITEM_CENTER_X, scrollXPlusCenter);

                // Mapear distância → efeitos visuais
                const inputRange = [- (SLOT + SPACING), 0, (SLOT + SPACING)];

                const scale = distToCenter.interpolate({
                  inputRange,
                  outputRange: [0.9, 1.08, 0.9],
                  extrapolate: 'clamp',
                });

                const translateY = distToCenter.interpolate({
                  inputRange,
                  outputRange: [4, -6, 4],
                  extrapolate: 'clamp',
                });

                const ringScale = distToCenter.interpolate({
                  inputRange,
                  outputRange: [RING_MIN_SCALE, 1, RING_MIN_SCALE],
                  extrapolate: 'clamp',
                });

                const iconScale = distToCenter.interpolate({
                  inputRange,
                  outputRange: [ICON_MIN_SCALE, 1, ICON_MIN_SCALE],
                  extrapolate: 'clamp',
                });

                const iconY = distToCenter.interpolate({
                  inputRange,
                  outputRange: [1, -1.5, 1],
                  extrapolate: 'clamp',
                });

                const sideOpacity = distToCenter.interpolate({
                  inputRange,
                  outputRange: [0.45, 1, 0.45],
                  extrapolate: 'clamp',
                });

                const labelOpacity = distToCenter.interpolate({
                  inputRange,
                  outputRange: [0, 1, 0],
                  extrapolate: 'clamp',
                });

                // O item EM FOCO é aquele cujo índice === centerIndex
                const isFocused = logicalIndex === centerIndex;

                return (
                  <View style={s.slot}>
                    <Animated.View
                      style={{
                        transform: [{ scale }, { translateY }],
                        alignItems: 'center',
                        opacity: sideOpacity,
                      }}
                    >
                      {/* Ring fixo (animado em scale) */}
                      <Animated.View style={[s.ringFixed, { transform: [{ scale: ringScale }] }]}>
                        <LinearGradient
                          colors={[theme.colors.primary, theme.mode === 'dark' ? '#1e1f26' : '#ffffff']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ position: 'absolute', inset: 0, borderRadius: 999 }}
                        />
                        <View
                          style={[
                            s.ringInner,
                            {
                              backgroundColor: theme.colors.card,
                              borderWidth: StyleSheet.hairlineWidth,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        />
                        <Animated.View style={{ transform: [{ translateY: iconY }, { scale: iconScale }] }}>
                          <Ionicons name={item.icon as any} size={ICON_SIZE_MAX} color={theme.colors.primary} />
                        </Animated.View>
                      </Animated.View>

                      {/* Rótulo só quando no centro */}
                      <Animated.View style={{ opacity: labelOpacity }}>
                        <ThemedText style={s.label} numberOfLines={1}>
                          {item.label}
                        </ThemedText>
                      </Animated.View>
                    </Animated.View>

                    {/* Área de toque:
                        - Se NÃO estiver em foco: 1º toque só centraliza;
                        - Se estiver em foco: navega. */}
                    <Pressable
                      onPress={() => handlePress(item, logicalIndex)}
                      style={{
                        position: 'absolute',
                        width: SLOT,
                        height: SLOT,
                        top: (124 - SLOT) / 2,
                        left: 0,
                      }}
                      android_ripple={{ color: '#00000012', borderless: true }}
                      accessibilityRole="button"
                      accessibilityHint={
                        isFocused
                          ? `Abrir ${item.label}`
                          : `Centralizar ${item.label}; toque novamente para abrir`
                      }
                      accessibilityLabel={item.label}
                    />
                  </View>
                );
              }}
            />
          </View>
        </BlurView>
      </View>
    </View>
  );
}