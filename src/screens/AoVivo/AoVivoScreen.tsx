import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '../../components/Themed';
import { LIVE_CONFIG } from '../../config/live';
import { useTheme } from '../../theme/ThemeProvider';
import { createStyles } from './AoVivoScreen.styles';

// Variaveis ambiente
const {
  EXPO_PUBLIC_YOUTUBE_CHANNEL_ID: channelId,
  EXPO_PUBLIC_YOUTUBE_CHANNEL_HANDLE: channelHandle,
  EXPO_PUBLIC_YOUTUBE_LIVE_VIDEO_ID: liveVideoId,
} = process.env;

// Dados simulados de próximas lives (depois viriam de uma API)
const upcomingLives = [
  {
    id: '1',
    title: 'Culto de Domingo',
    date: '2024-03-10',
    time: '19:00',
  },
  {
    id: '2',
    title: 'Estudo Bíblico',
    date: '2024-03-13',
    time: '20:00',
  },
  {
    id: '3',
    title: 'Culto de Quarta',
    date: '2024-03-15',
    time: '19:30',
  },
];

function buildLiveHtml(channelId: string, liveVideoId?: string) {
  const src = liveVideoId
    ? `https://www.youtube-nocookie.com/embed/${liveVideoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`
    : `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<meta name="referrer" content="strict-origin-when-cross-origin" />
<style>
  html,body { margin:0; padding:0; height:100%; background:#000; }
  .wrap { position:fixed; inset:0; }
  iframe { width:100%; height:100%; border:0; display:block; }
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

async function openChannelExternally(channelHandle?: string, channelId?: string) {
  const urlWeb = channelHandle
    ? `https://www.youtube.com/${channelHandle}/live`
    : channelId
      ? `https://www.youtube.com/channel/${channelId}/live`
      : `https://www.youtube.com`;

  await Linking.openURL(urlWeb);
}

export default function AoVivoScreen() {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  // Simular verificação de live (depois integrar com YouTube API)
  useEffect(() => {
    checkLiveStatus();
  }, []);

  const checkLiveStatus = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com YouTube API para verificar se está ao vivo
      // Por enquanto, simular com timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular live ativa (mudar para false para testar offline)
      setIsLive(true);
    } catch (error) {
      console.error('Erro ao verificar status da live:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setWebViewKey(prev => prev + 1); // Forçar recarregar WebView
    checkLiveStatus();
  };

  const html = buildLiveHtml(LIVE_CONFIG.channelId, (LIVE_CONFIG as any).liveVideoId);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
    };
  };

  return (
    <View style={[s.container, { backgroundColor: 'transparent' }]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={s.liveHeader}>
          <ThemedText style={s.liveTitle}>Ao Vivo</ThemedText>
          <ThemedText style={s.liveSubtitle}>
            Acompanhe os cultos e eventos ao vivo da IBI
          </ThemedText>
        </View>

        {/* Status da Live */}
        <View style={s.liveStatusContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <ThemedText style={s.liveMessage}>Verificando transmissão...</ThemedText>
            </>
          ) : isLive ? (
            <>
              <View style={s.liveBadge}>
                <View style={s.liveIndicator} />
                <ThemedText style={s.liveBadgeText}>AO VIVO</ThemedText>
              </View>
              <ThemedText style={s.liveMessage}>Transmissão iniciada</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="time-outline" size={20} color={theme.colors.muted} />
              <ThemedText style={s.liveMessage}>Nenhuma transmissão no momento</ThemedText>
            </>
          )}
        </View>

        {/* Player */}
        <View style={s.videoContainer}>
          {loading ? (
            <View style={[s.webview, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <WebView
              key={webViewKey}
              style={s.webview}
              originWhitelist={['*']}
              source={{ html, baseUrl: 'https://ibidentidade.org.br/site/' }}
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
                  openChannelExternally(LIVE_CONFIG.channelHandle, LIVE_CONFIG.channelId);
                  return false;
                }
                return true;
              }}
              onError={() => openChannelExternally(LIVE_CONFIG.channelHandle, LIVE_CONFIG.channelId)}
            />
          )}
        </View>

        {/* Informações */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <ThemedText style={s.infoText}>
              {isLive 
                ? 'A transmissão ao vivo está acontecendo agora!'
                : 'Quando a live começar, ela tocará automaticamente aqui.'
              }
            </ThemedText>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.muted} />
            <View>
              <ThemedText style={s.infoText}>Próximas transmissões:</ThemedText>
              <ThemedText style={s.infoSubtext}>
                • Domingo 18h
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Próximas Lives */}
        {!isLive && upcomingLives.length > 0 && (
          <View style={s.upcomingSection}>
            <ThemedText style={s.upcomingTitle}>Próximas Lives</ThemedText>
            {upcomingLives.map((live) => {
              const { day, month } = formatDate(live.date);
              return (
                <Pressable key={live.id} style={s.upcomingCard}>
                  <View style={s.upcomingDate}>
                    <ThemedText style={s.upcomingDay}>{day}</ThemedText>
                    <ThemedText style={s.upcomingMonth}>{month}</ThemedText>
                  </View>
                  <View style={s.upcomingInfo}>
                    <ThemedText style={s.upcomingName}>{live.title}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="time-outline" size={12} color={theme.colors.muted} />
                      <ThemedText style={s.upcomingTime}>{live.time}</ThemedText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Botões de ação */}
        <View style={s.actions}>
          <Pressable
            onPress={() => openChannelExternally(LIVE_CONFIG.channelHandle, LIVE_CONFIG.channelId)}
            style={s.button}
          >
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <ThemedText style={s.buttonText}>YouTube</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => {
              // TODO: Ativar notificações para esta live
            }}
            style={[s.button, s.buttonPrimary, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <ThemedText style={[s.buttonText, s.buttonTextPrimary]}>
              Lembrar-me
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}