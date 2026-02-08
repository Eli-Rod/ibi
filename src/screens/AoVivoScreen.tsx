import * as Linking from 'expo-linking';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { LIVE_CONFIG } from '../config/live';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    webview: {
      flex: 1,
      minHeight: 280,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    actions: { padding: t.spacing(2), gap: t.spacing(1) },
    button: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    buttonText: { fontWeight: '600' },
    infoCard: { margin: t.spacing(2), marginBottom: 0 },
    title: { fontWeight: '700' },
  });

// Variaveis ambiente
const {
  EXPO_PUBLIC_YOUTUBE_CHANNEL_ID: channelId,
  EXPO_PUBLIC_YOUTUBE_CHANNEL_HANDLE: channelHandle,
  EXPO_PUBLIC_YOUTUBE_LIVE_VIDEO_ID: liveVideoId,
} = process.env;

function buildLiveHtml(channelId: string, liveVideoId?: string) {
  // Se tiver liveVideoId conhecido, embeda direto; senão use live_stream por canal
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
    ${src}</iframe>
  </div>
</body>
</html>`;
}

async function openChannelExternally(channelHandle?: string, channelId?: string) {
  // tenta app do YouTube usando handle; se não, web
  const urlWeb = channelHandle
    ? `https://www.youtube.com/${channelHandle}/live`
    : channelId
      ? `https://www.youtube.com/channel/${channelId}/live`
      : `https://www.youtube.com`;

  // abrir direto a página live do canal no app se possível
  // (o deep link por handle nem sempre é suportado – web é o fallback confiável)
  await Linking.openURL(urlWeb);
}

export default function AoVivoScreen() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  const html = buildLiveHtml(LIVE_CONFIG.channelId, (LIVE_CONFIG as any).liveVideoId);

  return (
    <ThemedView style={s.container}>
      <ThemedCard style={s.infoCard}>
        <ThemedText style={s.title}>Transmissão ao vivo</ThemedText>
        <ThemedText style={{ color: theme.colors.muted }}>
          Quando a live começar, ela toca automaticamente aqui.
        </ThemedText>
      </ThemedCard>

      <WebView
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
          // se tentar sair do embed, abre externamente o canal (live)
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

      <View style={s.actions}>
        <Pressable
          onPress={() => openChannelExternally(LIVE_CONFIG.channelHandle, LIVE_CONFIG.channelId)}
          style={s.button}
        >
          <ThemedText style={s.buttonText}>Abrir no YouTube</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}