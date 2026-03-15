import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './Themed';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
};

export function PageHeader({ title, subtitle, icon, badge }: PageHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.primary + '20', 
      borderRadius: 15,
      paddingBottom: 10,
      paddingTop: 6,
      }]}>
      {/* Camada de fundo com efeito glassmorphism */}
      <LinearGradient
        colors={[
          theme.colors.card + (isDark ? '80' : '40'), // Com transparência
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={styles.content}>
        {/* Linha superior com ícone e título */}
        <View style={styles.titleRow}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
          )}

          <View style={styles.titleWrapper}>
            <ThemedText style={styles.title}>
              {title}
            </ThemedText>

            {/* Badge opcional (para contadores, etc) */}
            {badge !== undefined && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={styles.badgeText}>
                  {badge}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Subtítulo com linha decorativa */}
        {subtitle && (
          <View style={styles.subtitleRow}>
            <View style={[styles.subtitleLine, { backgroundColor: theme.colors.primary }]} />
            <ThemedText style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderRadius: 15,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
    lineHeight: 20,
  },
});