import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemedText } from '../Themed';
import { createStyles } from './PageHeader.styles';


type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
};

export function PageHeader({ title, subtitle, icon, badge }: PageHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const styles = createStyles(theme);  

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