import * as Linking from 'expo-linking';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { MESSAGES_CONFIG } from '../config/messages';
import { useTheme } from '../theme/ThemeProvider';
import { makeStyles } from './styles/MensagensScreen.styles';

type Item = { id: string; title: string };

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

export default function MensagensScreen({ route }: any) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  const externalUrlFromRoute: string | undefined = route?.params?.externalUrl;
  const [selected, setSelected] = React.useState<Item | null>(null);

  const renderItem = ({ item }: { item: Item }) => (
    <ThemedCard>
      <View style={s.row}>
        <ThemedText style={s.title}>{item.title}</ThemedText>

        {MESSAGES_CONFIG.openMode === 'external-app' ? (
          <Pressable
            onPress={() => openExternalYouTube(item.id)}
            style={s.videoButton}
          >
            <ThemedText style={s.videoButtonText}>Assistir</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setSelected(item)}
            style={s.videoButton}
          >
            <ThemedText style={s.videoButtonText}>Assistir</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedCard>
  );

  // 1️⃣ Página externa (canal / lista)
  if (externalUrlFromRoute) {
    return (
      <ThemedView style={s.container}>
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

  // 2️⃣ Modo in-app
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

        <View style={s.actionsContainer}>
          <Pressable onPress={() => setSelected(null)} style={s.videoButton}>
            <ThemedText style={s.videoButtonText}>
              Voltar à lista
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => openExternalYouTube(selected.id)}
            style={s.videoButton}
          >
            <ThemedText style={s.videoButtonText}>
              Abrir no YouTube
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  // 3️⃣ Lista padrão
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
