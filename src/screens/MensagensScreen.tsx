import * as Linking from 'expo-linking';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { MESSAGES_CONFIG } from '../config/messages';
import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';

type Item = { id: string; title: string };

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: { padding: t.spacing(2), gap: t.spacing(2) },
    row: { gap: 8 },
    title: { fontWeight: '700' },
    videoButton: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    videoButtonText: { fontWeight: '600' },
    webview: {
      flex: 1,
      minHeight: 280,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
  });

/** HTML completo com IFRAME correto + referrer policy (para evitar erro 153) */
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
  <!-- Política de referenciador exigida pelo player -->
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

/** Fallback: abrir no app do YouTube; se não houver, no navegador */
async function openExternalYouTube(videoId: string) {
  const urlApp = `vnd.youtube://${videoId}`;
  const urlWeb = `https://www.youtube.com/watch?v=${videoId}`;
  const can = await Linking.canOpenURL(urlApp);
  await Linking.openURL(can ? urlApp : urlWeb);
}

export default function MensagensScreen({ route }: any) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  // Se veio página externa (canal/lista) via navegação
  const externalUrlFromRoute: string | undefined = route?.params?.externalUrl;

  const [selected, setSelected] = React.useState<Item | null>(null);

  const renderItem = ({ item }: { item: Item }) => (
    <ThemedCard>
      <View style={s.row}>
        <ThemedText style={s.title}>{item.title}</ThemedText>
        {MESSAGES_CONFIG.openMode === 'external-app' ? (
          <Pressable onPress={() => openExternalYouTube(item.id)} style={s.videoButton}>
            <ThemedText style={s.videoButtonText}>Assistir</ThemedText>
          </Pressable>
        ) : (
          <Pressable onPress={() => setSelected(item)} style={s.videoButton}>
            <ThemedText style={s.videoButtonText}>Assistir</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedCard>
  );

  // 1) Página externa (canal / lista de vídeos)
  if (externalUrlFromRoute) {
    return (
      <ThemedView style={s.container}>
        <WebView
          style={s.webview}
          originWhitelist={['*']}
          source={{
            uri: externalUrlFromRoute,
            headers: {
              // UA de mobile moderno ajuda o layout do YouTube
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

  // 2) Modo in-app (iframe embed em HTML) — baseUrl https para Referer válido
  if (MESSAGES_CONFIG.openMode === 'in-app' && selected) {
    const html = buildEmbedHtml(selected.id);

    return (
      <ThemedView style={s.container}>
        <ThemedCard>
          <ThemedText style={s.title}>{selected.title}</ThemedText>
        </ThemedCard>

        <WebView
          style={s.webview}
          originWhitelist={['*']}
          source={{
            html,
            // 🔑 fornece uma origem/Referer https ao documento da WebView
            baseUrl: 'https://ibi.local',
          }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          // Se o player tentar sair do embed (/watch/app), usa fallback externo
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
          onError={() => openExternalYouTube(selected.id)} // erro 153 / restrição -> abre fora
        />

        <View style={{ padding: theme.spacing(2), gap: theme.spacing(1) }}>
          <Pressable onPress={() => setSelected(null)} style={s.videoButton}>
            <ThemedText style={s.videoButtonText}>Voltar à lista</ThemedText>
          </Pressable>
          <Pressable onPress={() => openExternalYouTube(selected.id)} style={s.videoButton}>
            <ThemedText style={s.videoButtonText}>Abrir no YouTube</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  // 3) Lista (MVP)
  return (
    <ThemedView style={s.container}>
      <FlatList
        contentContainerStyle={s.content}
        data={MESSAGES_CONFIG.items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />
    </ThemedView>
  );
}