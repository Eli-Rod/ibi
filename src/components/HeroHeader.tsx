import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { Theme as AppTheme } from '../theme/tokens';
import { ThemedText } from './Themed';

const makeStyles = (t: AppTheme) =>
  StyleSheet.create({
    wrap: {
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: t.spacing(2),
    },
    inner: {
      paddingHorizontal: t.spacing(2),
      paddingVertical: t.spacing(2),
    },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { marginTop: 6, opacity: 0.9 },
    actions: { flexDirection: 'row', gap: 10, marginTop: t.spacing(2) },
    btnPrimary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: t.colors.primary,
    },
    btnSecondary: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    btnTextPrimary: { fontWeight: '700', color: '#fff' },
    btnTextSecondary: { fontWeight: '700' },
    brandRow: { position: 'absolute', right: 8, top: 8, opacity: 0.12 },
    brandLogo: { width: 90, height: 90, borderRadius: 18 },
  });

type Props = {
  onPrimary?: () => void;   // CTA 1 (ex.: Contribuições / Pix)
  onSecondary?: () => void; // CTA 2 (ex.: Mensagens)
  logo?: any;               // opcional: require('.../logo.png')
  title?: string;
  subtitle?: string;
};

export default function HeroHeader({
  onPrimary,
  onSecondary,
  logo,
  title = 'Bem-vindo à IBI',
  subtitle = 'Igreja Batista Identidade',
}: Props) {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={s.wrap}>
      <LinearGradient
        // Ajuste o gradiente conforme a sua paleta
        colors={[theme.colors.card, theme.colors.primary + '30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={s.inner}
      >
        {!!logo && (
          <View style={s.brandRow}>
            <Image source={logo} style={s.brandLogo} resizeMode="cover" />
          </View>
        )}

        <ThemedText style={s.title}>{title}</ThemedText>
        <ThemedText style={s.subtitle}>{subtitle}</ThemedText>

        <View style={s.actions}>
          <View style={s.btnPrimary}>
            <ThemedText
              style={s.btnTextPrimary}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPrimary?.();
              }}
            >
              Contribuir (Pix)
            </ThemedText>
          </View>

          <View style={s.btnSecondary}>
            <ThemedText
              style={s.btnTextSecondary}
              onPress={async () => {
                await Haptics.selectionAsync();
                onSecondary?.();
              }}
            >
              Mensagens
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
``