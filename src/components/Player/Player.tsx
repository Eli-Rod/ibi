import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemedText } from '../Themed';
import { createStyles } from './Player.styles';

type Song = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  platform: 'youtube' | 'spotify';
  platform_url: string;
  audio_url?: string; // Para músicas próprias
};

type PlayerProps = {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose?: () => void;
  isExpanded?: boolean;
  onExpand?: () => void;
};

export const MiniPlayer = ({ song, isPlaying, onPlayPause, onExpand }: PlayerProps) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!song) return null;

  return (
    <TouchableOpacity style={styles.miniPlayer} onPress={onExpand} activeOpacity={0.9}>
      <Image source={{ uri: song.thumbnail }} style={styles.miniPlayerImage} />
      <View style={styles.miniPlayerInfo}>
        <ThemedText style={styles.miniPlayerTitle} numberOfLines={1}>
          {song.title}
        </ThemedText>
        <ThemedText style={styles.miniPlayerArtist} numberOfLines={1}>
          {song.artist}
        </ThemedText>
      </View>
      <View style={styles.miniPlayerControls}>
        <TouchableOpacity onPress={onPlayPause} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={44}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const ExpandedPlayer = ({ 
  song, 
  isPlaying, 
  onPlayPause, 
  onClose,
  visible 
}: PlayerProps & { visible: boolean }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  // Carregar áudio se tiver audio_url
  useEffect(() => {
    if (song?.audio_url) {
      loadAudio();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [song]);

  useEffect(() => {
    if (isPlaying && sound) {
      sound.playAsync();
      startProgressAnimation();
    } else if (sound) {
      sound.pauseAsync();
      progress.stopAnimation();
    }
  }, [isPlaying]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song?.audio_url || '' },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.log('Erro ao carregar áudio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      
      // Atualizar barra de progresso
      if (status.durationMillis) {
        const progressValue = status.positionMillis / status.durationMillis;
        progress.setValue(progressValue);
      }

      // Quando terminar, voltar ao início
      if (status.didJustFinish) {
        progress.setValue(0);
        setPosition(0);
        onPlayPause(); // Pausa automaticamente
      }
    }
  };

  const startProgressAnimation = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: duration - position,
      useNativeDriver: false,
    }).start();
  };

  const seekTo = (value: number) => {
    if (sound) {
      const newPosition = value * duration;
      sound.setPositionAsync(newPosition);
      progress.setValue(value);
      setPosition(newPosition);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const platformInfo = song?.platform === 'youtube' 
    ? { icon: 'logo-youtube', label: 'YouTube', color: '#FF0000' }
    : { icon: 'musical-notes', label: 'Spotify', color: '#1DB954' };

  if (!song) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlayTouch} onPress={onClose} />
        <View style={[styles.expandedPlayerModal, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Tocando agora</ThemedText>
            <Pressable onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <Image source={{ uri: song.thumbnail }} style={styles.expandedArtwork} />

            <ThemedText style={styles.expandedTitle}>{song.title}</ThemedText>
            <ThemedText style={styles.expandedArtist}>{song.artist}</ThemedText>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              <View style={styles.timeLabels}>
                <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
                <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
              </View>
            </View>

            <View style={styles.expandedControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="shuffle" size={24} color={theme.colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="play-skip-back" size={28} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseButton} onPress={onPlayPause}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="play-skip-forward" size={28} color={theme.colors.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="repeat" size={24} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.platformButton, { backgroundColor: platformInfo.color }]}
              onPress={() => song.platform_url && Linking.openURL(song.platform_url)}
            >
              <Ionicons name={platformInfo.icon as any} size={20} color="#fff" />
              <ThemedText style={styles.platformButtonText}>
                Ouvir no {platformInfo.label}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};