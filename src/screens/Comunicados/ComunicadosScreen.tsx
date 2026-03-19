import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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

import { PageHeader } from '../../components/PageHeader';
import { ThemedText } from '../../components/Themed';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../theme/ThemeProvider';
import { ComunicadoComAutor } from '../../types/comunicados';
import { createStyles } from './ComunicadosScreen.styles';

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

  // Buscar comunicados
  const fetchComunicados = async () => {
    try {
      const agora = new Date().toISOString();

      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .lte('publicar_em', agora) // Já pode publicar
        .or(`data_expiracao.is.null,data_expiracao.gt.${agora}`) // Não expirou OU sem expiração
        .order('destaque', { ascending: false }) // Destaques primeiro
        .order('fixado', { ascending: false }) // Depois fixados
        .order('publicar_em', { ascending: false }); // Por fim, mais recentes

      if (error) throw error;

      // Buscar nomes dos autores (opcional)
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

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
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
      case 'evento': return '#10B981'; // verde
      case 'noticia': return '#3B82F6'; // azul
      case 'aviso': return '#F59E0B'; // laranja
      default: return '#6B7280'; // cinza
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

  // ---------- LÓGICA CORRIGIDA PARA DESTAQUES ----------
  // Separar comunicados por categoria
  const comunicadosDestaque = comunicados.filter(c => c.destaque === true);
  const comunicadosFixados = comunicados.filter(c => !c.destaque && c.fixado === true);
  const comunicadosNormais = comunicados.filter(c => !c.destaque && !c.fixado);

  // Pega o primeiro destaque para o banner (ou o primeiro fixado se não houver destaques)
  const comunicadoDestaque = comunicadosDestaque[0] || comunicadosFixados[0] || null;

  // Lista principal: inclui TODOS os comunicados em ordem hierárquica
  const outrosComunicados = [
    ...comunicadosDestaque.slice(1), // Outros destaques (além do primeiro)
    ...comunicadosFixados,            // Todos os fixados
    ...comunicadosNormais             // Todos os normais
  ];
  // -----------------------------------------------------

  // Renderizar card de comunicado
  const renderComunicadoCard = ({ item }: { item: ComunicadoComAutor }) => (
    <TouchableOpacity
      style={styles.comunicadoCard}
      activeOpacity={0.7}
      onPress={() => {
        setSelectedComunicado(item);
        setModalVisible(true);
      }}
    >
      {item.imagem_url && (
        <Image source={{ uri: item.imagem_url }} style={styles.cardImage} />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {item.destaque && (
              <View style={[styles.pinnedBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="star" size={12} color="#fff" />
                <ThemedText style={[styles.pinnedText, { color: '#fff' }]}>Destaque</ThemedText>
              </View>
            )}
            {item.fixado && !item.destaque && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={12} color={theme.colors.primary} />
                <ThemedText style={styles.pinnedText}>Fixado</ThemedText>
              </View>
            )}
            <View style={[styles.pinnedBadge, { backgroundColor: getTipoColor(item.tipo) }]}>
              <ThemedText style={[styles.pinnedText, { color: '#fff' }]}>
                {getTipoLabel(item.tipo)}
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {item.titulo}
        </ThemedText>

        {item.corpo && (
          <ThemedText style={styles.cardDescription} numberOfLines={3}>
            {item.corpo.replace(/<[^>]*>/g, '').substring(0, 120)}...
          </ThemedText>
        )}

        <View style={styles.cardMeta}>
          <View style={styles.metaLeft}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.muted} />
              <ThemedText style={styles.metaText}>
                {formatRelativeDate(item.publicar_em)}
              </ThemedText>
            </View>

            {item.data_evento && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                <ThemedText style={[styles.metaText, { color: theme.colors.primary }]}>
                  {formatEventDate(item.data_evento)}
                </ThemedText>
              </View>
            )}

            {item.autor_nome && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color={theme.colors.muted} />
                <ThemedText style={styles.metaText} numberOfLines={1}>
                  {item.autor_nome}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.readMoreButton}>
            <ThemedText style={styles.readMoreText}>Ler mais</ThemedText>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={outrosComunicados}
        renderItem={renderComunicadoCard}
        keyExtractor={item => item.id}
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
        ListHeaderComponent={
          <>
            <PageHeader
              title="Comunicados"
              subtitle="Fique por dentro das últimas novidades da igreja"
              icon="newspaper-outline"
              badge={comunicados.length}
            />

            {/* Banner em destaque */}
            {comunicadoDestaque && (
              <View style={styles.featuredContainer}>
                <TouchableOpacity
                  style={styles.featuredCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedComunicado(comunicadoDestaque);
                    setModalVisible(true);
                  }}
                >
                  {comunicadoDestaque.imagem_url ? (
                    <Image source={{ uri: comunicadoDestaque.imagem_url }} style={styles.featuredImage} />
                  ) : (
                    <View style={[styles.featuredImage, { backgroundColor: theme.colors.primary + '40' }]} />
                  )}
                  <View style={styles.featuredOverlay} />
                  <View style={styles.featuredContent}>
                    <View style={[styles.featuredBadge, { backgroundColor: getTipoColor(comunicadoDestaque.tipo) }]}>
                      <ThemedText style={styles.featuredBadgeText}>
                        {comunicadoDestaque.destaque ? 'DESTAQUE' : getTipoLabel(comunicadoDestaque.tipo)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.featuredTitle} numberOfLines={2}>
                      {comunicadoDestaque.titulo}
                    </ThemedText>
                    {comunicadoDestaque.corpo && (
                      <ThemedText style={styles.featuredDescription} numberOfLines={2}>
                        {comunicadoDestaque.corpo.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </ThemedText>
                    )}
                    <View style={styles.featuredMeta}>
                      <Ionicons name="calendar" size={14} color="#fff" />
                      <ThemedText style={styles.featuredDate}>
                        {comunicadoDestaque.data_evento
                          ? formatEventDate(comunicadoDestaque.data_evento)
                          : formatRelativeDate(comunicadoDestaque.publicar_em)}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Título da lista */}
            {outrosComunicados.length > 0 && (
              <ThemedText style={styles.sectionTitle}>Últimas notícias</ThemedText>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={theme.colors.muted} />
              <ThemedText style={styles.emptyStateText}>
                Nenhum comunicado disponível no momento
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Skeleton */}
      {loading && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
          <ScrollView contentContainerStyle={styles.content}>
            <PageHeader
              title="Comunicados"
              subtitle="Fique por dentro das últimas novidades da igreja"
              icon="newspaper-outline"
            />
            <View style={{ height: 200, marginBottom: 16, backgroundColor: theme.colors.border, borderRadius: theme.radius }} />
            {[1, 2, 3].map(i => (
              <ComunicadoSkeleton key={i} />
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
                      Publicado: {new Date(selectedComunicado?.publicar_em || '').toLocaleDateString('pt-BR', {
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
                        Evento: {formatEventDate(selectedComunicado.data_evento)}
                      </ThemedText>
                    </View>
                  )}

                  {selectedComunicado?.autor_nome && (
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
                      <ThemedText style={styles.modalDate}>
                        {selectedComunicado.autor_nome}
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