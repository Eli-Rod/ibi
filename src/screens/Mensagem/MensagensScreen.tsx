import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React from 'react';
import { FlatList, Image, Pressable, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { PageHeader } from '../../components/PageHeader/PageHeader';
import { ThemedCard, ThemedText, ThemedView } from '../../components/Themed';
import { MESSAGES_CONFIG } from '../../config/messages';
import { useTheme } from '../../theme/ThemeProvider';
import { makeStyles } from './MensagensScreen.styles';

type Item = { id: string; title: string };

// URL da thumbnail do YouTube
function getYouTubeThumbnail(videoId: string, quality: 'maxres' | 'high' | 'medium' | 'default' = 'maxres') {
  // Qualidades disponíveis:
  // maxresdefault.jpg - 1280x720 (melhor qualidade)
  // hqdefault.jpg - 480x360
  // mqdefault.jpg - 320x180
  // sddefault.jpg - 640x480
  // default.jpg - 120x90
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/** HTML completo com IFRAME correto + referrer policy */
function buildEmbedHtml(videoId: string) {
  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #000; }
    .wrap { position: fixed; inset: 0; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
</head>
<body>
  <div class="wrap">
    <iframe
      src="${src}"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
</body>
</html>`;
}

async function openExternalYouTube(videoId: string) {
  const urlApp = `vnd.youtube://${videoId}`;
  const urlWeb = `https://www.youtube.com/watch?v=${videoId}`;
  const can = await Linking.canOpenURL(urlApp);
  await Linking.openURL(can ? urlApp : urlWeb);
}

// Extrair data do título (formato: DD/MM/AAAA)
function extractDateFromTitle(title: string): string {
  const match = title.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : '';
}

export default function MensagensScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  const externalUrlFromRoute: string | undefined = route?.params?.externalUrl;
  const [selected, setSelected] = React.useState<Item | null>(null);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const handleImageError = (videoId: string) => {
    setImageErrors(prev => ({ ...prev, [videoId]: true }));
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    const date = extractDateFromTitle(item.title);
    const titleWithoutDate = item.title.replace(/\d{2}\/\d{2}\/\d{4}\s*-\s*/, '');
    const thumbnailUrl = getYouTubeThumbnail(item.id, 'maxres');
    const hasImageError = imageErrors[item.id];

    return (
      <ThemedCard style={s.videoCard}>
        {/* Thumbnail real do YouTube */}
        <TouchableOpacity
          onPress={() => {
            if (MESSAGES_CONFIG.openMode === 'external-app') {
              openExternalYouTube(item.id);
            } else {
              setSelected(item);
            }
          }}
          activeOpacity={0.9}
        >
          <View style={s.thumbnailContainer}>
            {!hasImageError ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={s.thumbnailImage}
                resizeMode="cover"
                onError={() => handleImageError(item.id)}
              />
            ) : (
              // Fallback gradiente se a imagem não carregar
              <LinearGradient
                colors={[theme.colors.primary + '40', theme.colors.primary + '80']}
                style={s.thumbnailGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}

            {/* Overlay escuro para destacar o botão play */}
            <View style={s.thumbnailOverlay}>
              <View style={s.playButton}>
                <Ionicons name="play" size={30} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Informações do vídeo */}
        <View style={s.videoInfo}>
          <ThemedText style={s.videoTitle} numberOfLines={2}>
            {titleWithoutDate}
          </ThemedText>

          <View style={s.videoMeta}>
            {date ? (
              <>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.muted} />
                <ThemedText style={s.videoDate}>{date}</ThemedText>
              </>
            ) : null}
            <Ionicons name="time-outline" size={14} color={theme.colors.muted} />
            <ThemedText style={s.videoDuration}>Culto</ThemedText>
          </View>
        </View>

        {/* Ações do card */}
        <View style={s.videoActions}>
          <Pressable
            onPress={() => {
              if (MESSAGES_CONFIG.openMode === 'external-app') {
                openExternalYouTube(item.id);
              } else {
                setSelected(item);
              }
            }}
            style={[s.actionButton, s.actionButtonLeft]}
          >
            <Ionicons name="play-circle" size={20} color={theme.colors.primary} />
            <ThemedText style={[s.actionButtonText, { color: theme.colors.primary }]}>
              Assistir
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => openExternalYouTube(item.id)}
            style={s.actionButton}
          >
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <ThemedText style={[s.actionButtonText, { color: '#FF0000' }]}>
              YouTube
            </ThemedText>
          </Pressable>
        </View>
      </ThemedCard>
    );
  };

  // 1️⃣ Página externa (canal / lista)
  if (externalUrlFromRoute) {
    return (
      <ThemedView style={s.externalContainer}>
        <View style={s.externalHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText style={s.externalTitle}>YouTube</ThemedText>
        </View>
        <WebView
          style={s.webview}
          originWhitelist={['*']}
          source={{
            uri: externalUrlFromRoute,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
            },
          }}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
        />
      </ThemedView>
    );
  }

  // 2️⃣ Modo in-app com vídeo selecionado
  if (MESSAGES_CONFIG.openMode === 'in-app' && selected) {
    const html = buildEmbedHtml(selected.id);
    const titleWithoutDate = selected.title.replace(/\d{2}\/\d{2}\/\d{4}\s*-\s*/, '');

    return (
      <ThemedView style={s.videoPlayerContainer}>
        {/* Header do player */}
        <View style={s.videoPlayerHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={s.videoPlayerTitle} numberOfLines={1}>
            {titleWithoutDate}
          </ThemedText>
          <TouchableOpacity onPress={() => openExternalYouTube(selected.id)} style={s.closeButton}>
            <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          </TouchableOpacity>
        </View>

        {/* Player */}
        <WebView
          style={s.videoPlayer}
          originWhitelist={['*']}
          source={{
            html,
            baseUrl: 'https://ibi.local',
          }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(req) => {
            const isEmbed =
              req.url.startsWith('https://www.youtube.com/embed/') ||
              req.url.startsWith('https://www.youtube-nocookie.com/embed/');
            if (!isEmbed && req.navigationType !== 'other') {
              openExternalYouTube(selected.id);
              return false;
            }
            return true;
          }}
          onError={() => openExternalYouTube(selected.id)}
        />

        {/* Controles inferiores */}
        <View style={s.playerControls}>
          <TouchableOpacity
            onPress={() => setSelected(null)}
            style={s.playerControlButton}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <ThemedText style={s.playerControlText}>Lista</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openExternalYouTube(selected.id)}
            style={s.playerControlButton}
          >
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <ThemedText style={s.playerControlText}>YouTube</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // 3️⃣ Lista padrão
  return (
    <>
      <View style={[s.container, { backgroundColor: 'transparent', flex: 1  }]}>
        <PageHeader
          title="Cultos e Mensagens"
          subtitle="Reveja as mensagens e cultos da sua igreja."
          icon="videocam-outline"
        // badge={0}
        />
        <FlatList
          contentContainerStyle={s.content}
          data={MESSAGES_CONFIG.items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}