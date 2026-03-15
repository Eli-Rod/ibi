import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';

import AnnouncementItem from '../../components/AnnouncementItem';
import EventItem from '../../components/EventItem';
import HeroHeader from '../../components/HeroHeader';
import { ThemedText, ThemedView } from '../../components/Themed';
import { useAvisos } from '../../hooks/useAvisos';
import { useEventos } from '../../hooks/useEventos';
import { useTheme } from '../../theme/ThemeProvider';
import { createStyles } from './Home.styles';

export default function Home() {
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const { 
    data: avisos, 
    loading: loadingAvisos,
    onRefresh: onRefreshAvisos 
  } = useAvisos({ realtime: true });
  
  const { 
    data: eventos, 
    loading: loadingEventos,
    onRefresh: onRefreshEventos 
  } = useEventos({ futuros: true });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([onRefreshAvisos(), onRefreshEventos()]);
    setRefreshing(false);
  }, [onRefreshAvisos, onRefreshEventos]);

  const featuredEvent = eventos && eventos.length > 0 ? eventos[0] : null;
  const otherEvents = eventos && eventos.length > 1 ? eventos.slice(1) : [];

  const handleSeeAllAvisos = () => {
    navigation.navigate('Notícias');
  };

  const handleSeeAllEventos = () => {
    navigation.navigate('Eventos');
  };

  const handleEventPress = (eventoId: string) => {
    navigation.navigate('Eventos', { eventoId });
  };

  // Definindo cores escuras para os gradientes baseadas no tema
  const primaryDark = adjustColor(theme.colors.primary, -30);
  const secondaryDark = adjustColor('#6366F1', -30);
  const successDark = adjustColor(theme.colors.success, -30);
  const warningDark = adjustColor(theme.colors.warning, -30);

  return (
    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ScrollView 
        contentContainerStyle={s.container}
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
        <HeroHeader
          title="Bem-vindo à IBI"
          subtitle="Igreja Batista Identidade"
          onPrimary={() => navigation.navigate('Contribuições')}
          onSecondary={() => navigation.navigate('Mensagens')}
        />

        {/* Cards de Acesso Rápido */}
        <View style={s.quickAccessGrid}>
          <TouchableOpacity 
            style={s.quickAccessCard}
            onPress={() => navigation.navigate('Ao Vivo')}
          >
            <LinearGradient
              colors={[theme.colors.primary, primaryDark]}
              style={s.quickAccessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play-circle" size={28} color="#FFFFFF" />
              <ThemedText style={s.quickAccessText}>Ao Vivo</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.quickAccessCard}
            onPress={() => navigation.navigate('Mensagens')}
          >
            <LinearGradient
              colors={['#6366F1', secondaryDark]}
              style={s.quickAccessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="videocam" size={28} color="#FFFFFF" />
              <ThemedText style={s.quickAccessText}>Mensagens</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.quickAccessCard}
            onPress={() => navigation.navigate('Contribuições')}
          >
            <LinearGradient
              colors={[theme.colors.success, successDark]}
              style={s.quickAccessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="heart" size={28} color="#FFFFFF" />
              <ThemedText style={s.quickAccessText}>Contribuir</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.quickAccessCard}
            onPress={() => navigation.navigate('Orações')}
          >
            <LinearGradient
              colors={[theme.colors.warning, warningDark]}
              style={s.quickAccessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="heart-half" size={28} color="#FFFFFF" />
              <ThemedText style={s.quickAccessText}>Orações</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Seção de Destaque - Próximo Evento */}
        {featuredEvent && (
          <View style={s.featuredSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleContainer}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <ThemedText style={s.featuredTitle}>Próximo Evento</ThemedText>
              </View>
              <TouchableOpacity onPress={handleSeeAllEventos}>
                <ThemedText style={s.seeAllText}>Ver todos</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => handleEventPress(featuredEvent.id)}
              activeOpacity={0.9}
            >
              <View style={s.featuredEventCard}>
                <View style={s.featuredEventDate}>
                  <ThemedText style={s.featuredEventDay}>
                    {new Date(featuredEvent.inicio_em).getDate()}
                  </ThemedText>
                  <ThemedText style={s.featuredEventMonth}>
                    {new Date(featuredEvent.inicio_em).toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')}
                  </ThemedText>
                </View>
                <View style={s.featuredEventInfo}>
                  <ThemedText style={s.featuredEventName} numberOfLines={2}>
                    {featuredEvent.titulo}
                  </ThemedText>
                  <View style={s.featuredEventDetails}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.muted} />
                    <ThemedText style={s.featuredEventDetailText}>
                      {new Date(featuredEvent.inicio_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  {featuredEvent.local && (
                    <View style={s.featuredEventDetails}>
                      <Ionicons name="location-outline" size={14} color={theme.colors.muted} />
                      <ThemedText style={s.featuredEventDetailText} numberOfLines={1}>
                        {featuredEvent.local}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção de Avisos */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleContainer}>
              <Ionicons name="megaphone" size={22} color={theme.colors.primary} />
              <ThemedText style={s.sectionTitle}>Avisos Importantes</ThemedText>
            </View>
            <TouchableOpacity onPress={handleSeeAllAvisos}>
              <ThemedText style={s.seeAllText}>Ver todos</ThemedText>
            </TouchableOpacity>
          </View>

          {loadingAvisos ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : avisos && avisos.length > 0 ? (
            <View style={s.announcementsList}>
              {avisos.slice(0, 3).map((aviso, index) => (
                <AnnouncementItem 
                  key={aviso.id} 
                  title={aviso.titulo} 
                  detail={aviso.corpo}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.colors.muted} />
              <ThemedText style={s.emptyStateText}>Nenhum aviso no momento.</ThemedText>
            </View>
          )}
        </View>

        {/* Próximos Eventos (lista) */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleContainer}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
              <ThemedText style={s.sectionTitle}>Próximos Eventos</ThemedText>
            </View>
            <TouchableOpacity onPress={handleSeeAllEventos}>
              <ThemedText style={s.seeAllText}>Ver todos</ThemedText>
            </TouchableOpacity>
          </View>

          {loadingEventos ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : otherEvents.length > 0 ? (
            <View style={s.eventsList}>
              {otherEvents.map((evento) => (
                <TouchableOpacity 
                  key={evento.id} 
                  onPress={() => handleEventPress(evento.id)}
                >
                  <EventItem 
                    title={evento.titulo} 
                    date={evento.inicio_em ? new Date(evento.inicio_em).toLocaleDateString('pt-BR') : 'Data a definir'} 
                    location={evento.local}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            !featuredEvent && (
              <View style={s.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.muted} />
                <ThemedText style={s.emptyStateText}>Nenhum evento programado.</ThemedText>
              </View>
            )
          )}
        </View>

        {/* Espaço extra no final */}
        <View style={s.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

// Função auxiliar para escurecer cores (se não tiver no seu tema)
function adjustColor(hex: string, percent: number): string {
  // Remove o # se existir
  hex = hex.replace('#', '');
  
  // Converte para RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Ajusta os valores
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));
  
  // Converte de volta para hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}