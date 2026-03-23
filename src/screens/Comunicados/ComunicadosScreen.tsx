import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ThemedText } from '../../components/Themed';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../theme/ThemeProvider';
import { ComunicadoComAutor } from '../../types/comunicados';
import { createStyles } from './ComunicadosScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Componente de loading skeleton
const ComunicadoSkeleton = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    return () => pulseAnim.stopAnimation();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: '80%', height: 18 }]} />
        <View style={[styles.skeletonLine, { width: '100%', height: 14 }]} />
        <View style={[styles.skeletonLine, { width: '90%', height: 14 }]} />
        <View style={[styles.skeletonLine, { width: '40%', height: 12, marginTop: 8 }]} />
      </View>
    </Animated.View>
  );
};

// Componente do Carrossel - VERSÃO SIMPLES E FUNCIONAL
const CarrosselDestaques = ({
  destaques,
  onItemPress
}: {
  destaques: ComunicadoComAutor[];
  onItemPress: (item: ComunicadoComAutor) => void;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return '#10B981';
      case 'noticia': return '#3B82F6';
      case 'aviso': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const renderItem = ({ item, index }: { item: ComunicadoComAutor; index: number }) => {
    const isActive = index === currentIndex;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onItemPress(item)}
        style={[
          styles.carrosselCard,
          {
            width: SCREEN_WIDTH * 0.85,
            marginHorizontal: 8,
            transform: [{ scale: isActive ? 1 : 0.92 }],
          },
        ]}
      >
        {item.imagem_url ? (
          <Image source={{ uri: item.imagem_url }} style={styles.carrosselImage} />
        ) : (
          <View style={[styles.carrosselImage, { backgroundColor: theme.colors.primary + '40' }]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.carrosselOverlay}
        />

        <View style={styles.carrosselContent}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View style={[styles.carrosselBadge, { backgroundColor: getTipoColor(item.tipo) }]}>
              <ThemedText style={styles.carrosselBadgeText}>
                {item.tipo.toUpperCase()}
              </ThemedText>
            </View>

            {item.data_evento && (
              <View style={[styles.carrosselBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Ionicons name="calendar" size={12} color="#fff" />
                <ThemedText style={styles.carrosselBadgeText}>
                  {formatEventDate(item.data_evento)}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.carrosselTitle} numberOfLines={2}>
            {item.titulo}
          </ThemedText>

          {isActive && item.corpo && (
            <ThemedText style={styles.carrosselDescription} numberOfLines={2}>
              {item.corpo.replace(/<[^>]*>/g, '').substring(0, 80)}...
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const itemWidth = SCREEN_WIDTH * 0.85 + 16; // largura + margem

  return (
    <View style={styles.carrosselContainer}>
      <FlatList
        ref={flatListRef}
        data={destaques}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        snapToAlignment="center"
        contentContainerStyle={styles.carrosselContentContainer}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;
          const newIndex = Math.round(offsetX / itemWidth);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < destaques.length) {
            setCurrentIndex(newIndex);
          }
        }}
        getItemLayout={(data, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
      />

      {destaques.length > 1 && (
        <View style={styles.paginationContainer}>
          {destaques.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
                setCurrentIndex(index);
              }}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentIndex ? theme.colors.primary : 'rgba(255,255,255,0.4)',
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function ComunicadosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Estados
  const [comunicados, setComunicados] = useState<ComunicadoComAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComunicado, setSelectedComunicado] = useState<ComunicadoComAutor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');

  // Buscar comunicados
  const fetchComunicados = async () => {
    try {
      const agora = new Date().toISOString();

      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .lte('publicar_em', agora)
        .or(`data_expiracao.is.null,data_expiracao.gt.${agora}`)
        .order('destaque', { ascending: false })
        .order('fixado', { ascending: false })
        .order('publicar_em', { ascending: false });

      if (error) throw error;

      const comunicadosComAutores = await Promise.all(
        (data || []).map(async (item) => {
          if (item.criado_por) {
            const { data: profileData } = await supabase
              .rpc('get_profile_safe', { user_id: item.criado_por });

            const profile = profileData?.[0];
            return {
              ...item,
              autor_nome: profile?.apelido || profile?.nome_completo?.split(' ')[0] || 'Admin',
              autor_avatar: profile?.avatar_url || null,
            };
          }
          return { ...item, autor_nome: 'Admin' };
        })
      );

      setComunicados(comunicadosComAutores);
    } catch (error) {
      console.error('Erro ao buscar comunicados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comunicados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComunicados();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComunicados();
  };

  // Formatar data relativa
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Formatar data do evento
  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cores e labels por tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return '#10B981';
      case 'noticia': return '#3B82F6';
      case 'aviso': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'evento': return 'EVENTO';
      case 'noticia': return 'NOTÍCIA';
      case 'aviso': return 'AVISO';
      default: return 'COMUNICADO';
    }
  };

  // Filtros de categoria
  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'evento', label: 'Eventos', color: '#10B981' },
    { key: 'noticia', label: 'Notícias', color: '#3B82F6' },
    { key: 'aviso', label: 'Avisos', color: '#F59E0B' },
  ];

  // Separar comunicados
  const comunicadosDestaque = comunicados.filter(c => c.destaque === true);
  const outrosComunicados = comunicados.filter(c => !c.destaque);

  // Filtrar por tipo
  const comunicadosFiltrados = selectedFilter === 'todos'
    ? outrosComunicados
    : outrosComunicados.filter(c => c.tipo === selectedFilter);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 16 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Comunicados"
          subtitle="Fique por dentro das últimas novidades da igreja"
          icon="newspaper-outline"
          badge={comunicados.length}
        />

        {/* Carrossel de destaques */}
        {comunicadosDestaque.length > 0 && (
          <CarrosselDestaques
            destaques={comunicadosDestaque}
            onItemPress={(item) => {
              setSelectedComunicado(item);
              setModalVisible(true);
            }}
          />
        )}

        {/* Filtros de categoria */}
        {comunicados.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.filterChipActive,
                  selectedFilter === filter.key && filter.color && { backgroundColor: filter.color }
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter.key && styles.filterChipTextActive
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Lista de comunicados (formato timeline) */}
        {comunicadosFiltrados.length > 0 ? (
          <View style={styles.timelineContainer}>
            {comunicadosFiltrados.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.timelineCard}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedComunicado(item);
                  setModalVisible(true);
                }}
              >
                {/* Linha do tempo */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: getTipoColor(item.tipo) }]} />
                  {index < comunicadosFiltrados.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>

                {/* Conteúdo do card */}
                <View style={styles.timelineRight}>
                  {item.imagem_url && (
                    <Image source={{ uri: item.imagem_url }} style={styles.timelineImage} />
                  )}

                  <View style={styles.timelineContent}>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <View style={[styles.timelineBadge, { backgroundColor: getTipoColor(item.tipo) }]}>
                        <ThemedText style={styles.timelineBadgeText}>
                          {getTipoLabel(item.tipo)}
                        </ThemedText>
                      </View>

                      {item.data_evento && (
                        <View style={styles.timelineDateBadge}>
                          <Ionicons name="calendar" size={12} color={theme.colors.primary} />
                          <ThemedText style={styles.timelineDateText}>
                            {new Date(item.data_evento).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    <ThemedText style={styles.timelineTitle}>
                      {item.titulo}
                    </ThemedText>

                    {item.corpo && (
                      <ThemedText style={styles.timelineDescription} numberOfLines={2}>
                        {item.corpo.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </ThemedText>
                    )}

                    <View style={styles.timelineFooter}>
                      <View style={styles.timelineMeta}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.muted} />
                        <ThemedText style={styles.timelineMetaText}>
                          {formatRelativeDate(item.publicar_em)}
                        </ThemedText>
                      </View>

                      {item.autor_nome && (
                        <View style={styles.timelineMeta}>
                          <Ionicons name="person-outline" size={12} color={theme.colors.muted} />
                          <ThemedText style={styles.timelineMetaText}>
                            {item.autor_nome}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={theme.colors.muted} />
              <ThemedText style={styles.emptyStateText}>
                Nenhum comunicado disponível no momento
              </ThemedText>
            </View>
          )
        )}
      </ScrollView>

      {/* Loading Skeleton */}
      {loading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
          <ScrollView contentContainerStyle={styles.content}>
            <PageHeader
              title="Comunicados"
              subtitle="Fique por dentro das últimas novidades da igreja"
              icon="newspaper-outline"
            />
            <View style={{ height: 260, marginBottom: 16 }}>
              <ScrollView horizontal>
                {[1, 2, 3].map(i => (
                  <View key={i} style={{ width: SCREEN_WIDTH * 0.85, marginHorizontal: 8 }}>
                    <ComunicadoSkeleton />
                  </View>
                ))}
              </ScrollView>
            </View>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                  <View style={[styles.skeletonLine, { width: '80%', height: 18 }]} />
                  <View style={[styles.skeletonLine, { width: '100%', height: 14 }]} />
                  <View style={[styles.skeletonLine, { width: '60%', height: 12 }]} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modal de detalhes do comunicado */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlayTouch} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle} numberOfLines={1}>
                {selectedComunicado?.titulo}
              </ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalScrollContent}>
                {selectedComunicado?.imagem_url && (
                  <Image source={{ uri: selectedComunicado.imagem_url }} style={styles.modalImage} />
                )}

                <View style={styles.modalMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                    <ThemedText style={styles.modalDate}>
                      {new Date(selectedComunicado?.publicar_em || '').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </ThemedText>
                  </View>

                  {selectedComunicado?.data_evento && (
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                      <ThemedText style={styles.modalDate}>
                        {formatEventDate(selectedComunicado.data_evento)}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {selectedComunicado?.destaque && (
                    <View style={[styles.pinnedBadge, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons name="star" size={14} color="#fff" />
                      <ThemedText style={[styles.pinnedText, { color: '#fff' }]}>Destaque</ThemedText>
                    </View>
                  )}
                  {selectedComunicado?.fixado && !selectedComunicado.destaque && (
                    <View style={styles.pinnedBadge}>
                      <Ionicons name="pin" size={14} color={theme.colors.primary} />
                      <ThemedText style={styles.pinnedText}>Fixado</ThemedText>
                    </View>
                  )}
                  <View style={[styles.pinnedBadge, { backgroundColor: getTipoColor(selectedComunicado?.tipo || 'comunicado') }]}>
                    <ThemedText style={[styles.pinnedText, { color: '#fff' }]}>
                      {getTipoLabel(selectedComunicado?.tipo || 'comunicado')}
                    </ThemedText>
                  </View>
                </View>

                {selectedComunicado?.corpo ? (
                  <ThemedText style={styles.modalBody}>
                    {selectedComunicado.corpo}
                  </ThemedText>
                ) : (
                  <ThemedText style={[styles.modalBody, { color: theme.colors.muted, fontStyle: 'italic' }]}>
                    Sem conteúdo adicional para este comunicado.
                  </ThemedText>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}