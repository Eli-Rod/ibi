import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ExpandedPlayer, MiniPlayer } from '../../components/Player/Player';
import { ThemedText } from '../../components/Themed';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../theme/ThemeProvider';
import { createStyles } from './PlaylistLouvorScreen.styles';

// Tipos - Apenas YouTube e Spotify
type PlatformType = 'youtube' | 'spotify';

type Song = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  platform: PlatformType;
  platform_url: string;
  category_id?: string;
  audio_url?: string;
};

type Playlist = {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  platform: PlatformType;
  platform_url: string;
  song_count: number;
  is_featured: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  song_count: number;
  order: number;
};

type SuggestionForm = {
  name: string;
  description: string;
  platform_url: string;
  platform: PlatformType;
};

// Apenas YouTube e Spotify
const platforms: { key: PlatformType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
  { key: 'spotify', label: 'Spotify', icon: 'musical-notes', color: '#1DB954' },
];

export default function PlaylistLouvorScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('youtube');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExpandedPlayer, setShowExpandedPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestionForm, setSuggestionForm] = useState<SuggestionForm>({
    name: '',
    description: '',
    platform_url: '',
    platform: 'youtube'
  });

  // Buscar dados do Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('playlist_categories')
        .select('*')
        .order('order', { ascending: true });

      if (categoriesError) throw categoriesError;
      if (categoriesData) setCategories(categoriesData);

      // Buscar playlists em destaque
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_featured', true)
        .limit(10);

      if (playlistsError) throw playlistsError;
      if (playlistsData) setPlaylists(playlistsData);

      // Buscar músicas
      let songsQuery = supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        songsQuery = songsQuery.eq('category_id', selectedCategory);
      }

      const { data: songsData, error: songsError } = await songsQuery.limit(50);

      if (songsError) throw songsError;
      if (songsData) setSongs(songsData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar as músicas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setShowExpandedPlayer(true);
    }
  };

  const handleOpenPlatform = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Linking.openURL(url);
    }
  };

  const handleAddPlaylist = () => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para sugerir uma playlist');
      return;
    }
    setSuggestionForm({
      name: '',
      description: '',
      platform_url: '',
      platform: 'youtube'
    });
    setShowAddModal(true);
  };

  const handleSuggestPlaylist = async () => {
    if (!suggestionForm.name.trim()) {
      Alert.alert('Validação', 'O nome da playlist é obrigatório');
      return;
    }
    if (!suggestionForm.platform_url.trim()) {
      Alert.alert('Validação', 'O link da playlist é obrigatório');
      return;
    }

    try {
      const { error } = await supabase
        .from('playlist_suggestions')
        .insert({
          user_id: user?.id,
          name: suggestionForm.name,
          description: suggestionForm.description,
          platform: suggestionForm.platform,
          platform_url: suggestionForm.platform_url,
          status: 'pending'
        });

      if (error) throw error;

      Alert.alert('Obrigado!', 'Sua sugestão foi enviada para análise');
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Erro ao enviar sugestão:', error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar sua sugestão');
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && { borderWidth: 2, borderColor: item.color }
      ]}
      activeOpacity={0.7}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <LinearGradient
        colors={[item.color, item.color + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryGradient}
      >
        <Ionicons name={item.icon} size={24} color="#fff" />
        <ThemedText style={styles.categoryTitle}>{item.name}</ThemedText>
        <ThemedText style={styles.categoryCount}>{item.song_count} músicas</ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const platformInfo = platforms.find(p => p.key === item.platform) || platforms[0];

    return (
      <TouchableOpacity
        style={styles.playlistCard}
        activeOpacity={0.7}
        onPress={() => handleOpenPlatform(item.platform_url)}
      >
        <Image source={{ uri: item.cover_image }} style={styles.playlistImage} />
        <View style={styles.playlistInfo}>
          <ThemedText style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.playlistMeta} numberOfLines={1}>
            {item.song_count} músicas
          </ThemedText>
          <View style={styles.playlistPlatform}>
            <Ionicons
              name={platformInfo.icon}
              size={14}
              color={platformInfo.color}
            />
            <ThemedText style={styles.platformText}>
              {platformInfo.label}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSongItem = ({ item }: { item: Song }) => {
    const platformInfo = platforms.find(p => p.key === item.platform) || platforms[0];
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.songItem,
          isCurrentSong && { backgroundColor: theme.colors.primary + '10' }
        ]}
        onPress={() => handlePlaySong(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.songImage} />
        <View style={styles.songInfo}>
          <ThemedText style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </ThemedText>
          <View style={styles.playlistPlatform}>
            <Ionicons name={platformInfo.icon} size={12} color={platformInfo.color} />
            <ThemedText style={styles.platformText}>{platformInfo.label}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.songDuration}>{item.duration}</ThemedText>
        <TouchableOpacity
          style={[
            styles.playButton,
            isCurrentSong && isPlaying && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => handlePlaySong(item)}
        >
          <Ionicons
            name={isCurrentSong && isPlaying ? 'pause' : 'play'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSongs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.content,
          { 
            flexGrow: 1,
            paddingBottom: (currentSong ? 100 : 0) + insets.bottom + 16 
          }
        ]}
        style={{ flex: 1 }}
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
              title="Playlist de Louvor"
              subtitle="Músicas para elevar seu espírito e adorar a Deus"
              icon="headset-outline"
            />

            {/* Seletor de Plataforma */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.platformSelector}
            >
              {platforms.map(platform => (
                <TouchableOpacity
                  key={platform.key}
                  style={[
                    styles.platformOption,
                    selectedPlatform === platform.key && styles.platformOptionActive
                  ]}
                  onPress={() => setSelectedPlatform(platform.key)}
                >
                  <Ionicons
                    name={platform.icon}
                    size={18}
                    color={selectedPlatform === platform.key ? platform.color : theme.colors.muted}
                  />
                  <ThemedText
                    style={[
                      styles.platformOptionText,
                      selectedPlatform === platform.key && styles.platformOptionTextActive
                    ]}
                  >
                    {platform.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Categorias */}
            {categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ThemedText style={styles.sectionTitle}>Categorias</ThemedText>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScroll}
                />
              </View>
            )}

            {/* Playlists em Destaque */}
            {playlists.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ThemedText style={styles.sectionTitle}>Playlists em Destaque</ThemedText>
                <FlatList
                  data={playlists}
                  renderItem={renderPlaylistItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScroll}
                />
              </View>
            )}

            {/* Busca */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInput}>
                <Ionicons name="search" size={20} color={theme.colors.muted} />
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Buscar música ou artista..."
                  placeholderTextColor={theme.colors.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Lista de Músicas - Título */}
            <ThemedText style={styles.sectionTitle}>
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name || 'Músicas'
                : 'Últimos Lançamentos'}
            </ThemedText>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={[styles.emptyState, { minHeight: 200 }]}>
              <Ionicons name="musical-notes-outline" size={64} color={theme.colors.muted} />
              <ThemedText style={styles.emptyStateText}>
                {searchQuery ? 'Nenhuma música encontrada' : 'Nenhuma música disponível'}
              </ThemedText>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Botão de Adicionar Playlist */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: (currentSong ? 100 : 24) + insets.bottom }]}
        onPress={handleAddPlaylist}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Mini Player */}
      {currentSong && (
        <MiniPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onExpand={() => setShowExpandedPlayer(true)}
        />
      )}

      {/* Player Expandido */}
      <ExpandedPlayer
        visible={showExpandedPlayer}
        song={currentSong}
        isPlaying={isPlaying}
        onClose={() => setShowExpandedPlayer(false)}
        onPlayPause={() => setIsPlaying(!isPlaying)}
      />

      {/* Modal de Sugestão de Playlist */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlayTouch} onPress={() => setShowAddModal(false)} />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sugerir Playlist</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Nome da Playlist *</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Louvores para domingo"
                  placeholderTextColor={theme.colors.muted}
                  value={suggestionForm.name}
                  onChangeText={(text) => setSuggestionForm({ ...suggestionForm, name: text })}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Descrição</ThemedText>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Descreva a playlist..."
                  placeholderTextColor={theme.colors.muted}
                  multiline
                  numberOfLines={3}
                  value={suggestionForm.description}
                  onChangeText={(text) => setSuggestionForm({ ...suggestionForm, description: text })}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Plataforma *</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.platformSelector}
                >
                  {platforms.map(platform => (
                    <TouchableOpacity
                      key={platform.key}
                      style={[
                        styles.platformOption,
                        suggestionForm.platform === platform.key && styles.platformOptionActive
                      ]}
                      onPress={() => setSuggestionForm({ ...suggestionForm, platform: platform.key })}
                    >
                      <Ionicons
                        name={platform.icon}
                        size={18}
                        color={suggestionForm.platform === platform.key ? platform.color : theme.colors.muted}
                      />
                      <ThemedText
                        style={[
                          styles.platformOptionText,
                          suggestionForm.platform === platform.key && styles.platformOptionTextActive
                        ]}
                      >
                        {platform.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Link da Playlist *</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://..."
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="url"
                  autoCapitalize="none"
                  value={suggestionForm.platform_url}
                  onChangeText={(text) => setSuggestionForm({ ...suggestionForm, platform_url: text })}
                />
              </View>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSuggestPlaylist}
              >
                <ThemedText style={styles.modalButtonText}>Enviar Sugestão</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={styles.modalButtonCancelText}>Cancelar</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}