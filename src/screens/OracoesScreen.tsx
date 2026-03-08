import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { cancelPrayerReminder, schedulePrayerReminder } from '../services/notificationService';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { createStyles } from './styles/OracoesScreen.styles';

// Tipos
type PrayerRequest = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string | null;
  title: string;
  description: string;
  expires_at: string;
  created_at: string;
  tags: string[];
  prayers_count: number;
  comments_count: number;
  user_prayed: boolean;
  user_reminded: boolean;
  notification_id?: string | null;
  status?: string;
};

type PrayerStats = {
  total: number;
  active: number;
  answered: number;
};

type Profile = {
  id: string;
  nome_completo: string;
  apelido: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
};

const availableTags = [
  'Família',
  'Saúde',
  'Trabalho',
  'Estudos',
  'Ministério',
  'Finanças',
  'Relacionamento',
  'Viagem',
  'Espiritual',
  'Outro',
];

// Componente de Loading Skeleton
const PrayerLoadingSkeleton = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.loadingSkeleton}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonHeaderText}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '60%' }]} />
        </View>
      </View>

      {/* Content Skeleton */}
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: '80%', height: 20 }]} />
        <View style={[styles.skeletonLine, { width: '100%', height: 16 }]} />
        <View style={[styles.skeletonLine, { width: '90%', height: 16 }]} />
        
        {/* Tags Skeleton */}
        <View style={styles.skeletonTags}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonTag} />
          ))}
        </View>

        {/* Expiry Skeleton */}
        <View style={styles.skeletonExpiry} />
      </View>

      {/* Interactions Skeleton */}
      <View style={styles.skeletonInteractions}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.skeletonInteractionButton} />
        ))}
      </View>
    </View>
  );
};

export default function OracoesScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Estados
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PrayerStats>({
    total: 0,
    active: 0,
    answered: 0,
  });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPrayersList, setShowPrayersList] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [prayersList, setPrayersList] = useState<{ user_id: string; author_name: string; author_avatar?: string | null }[]>([]);
  const [loadingPrayersList, setLoadingPrayersList] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Estados do formulário
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Buscar pedidos de oração
  const fetchPrayers = async () => {
    try {
      let query = supabase
        .from('prayer_requests')
        .select('*')
        .gte('expires_at', new Date().toISOString());

      if (activeFilter) {
        switch (activeFilter) {
          case 'recentes':
            query = query.order('created_at', { ascending: false });
            break;
          case 'populares':
            query = query.order('created_at', { ascending: false });
            break;
          case 'urgentes':
            query = query.order('expires_at', { ascending: true });
            break;
          case 'meus':
            if (user) {
              query = query.eq('user_id', user.id);
            }
            break;
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: prayerData, error: prayerError } = await query;

      if (prayerError) throw prayerError;

      if (!prayerData || prayerData.length === 0) {
        setPrayers([]);
        setStats({ total: 0, active: 0, answered: 0 });
        setLoading(false);
        return;
      }

      const prayerIds = prayerData.map(p => p.id);

      const { data: prayersData, error: prayersError } = await supabase
        .from('prayers')
        .select('prayer_request_id, user_id')
        .in('prayer_request_id', prayerIds);

      if (prayersError) throw prayersError;

      const { data: commentsData, error: commentsError } = await supabase
        .from('prayer_comments')
        .select('prayer_request_id')
        .in('prayer_request_id', prayerIds);

      if (commentsError) throw commentsError;

      const processedPrayers: PrayerRequest[] = prayerData.map(item => {
        const prayersForItem = prayersData?.filter(p => p.prayer_request_id === item.id) || [];
        const commentsForItem = commentsData?.filter(c => c.prayer_request_id === item.id) || [];

        return {
          ...item,
          prayers_count: prayersForItem.length,
          comments_count: commentsForItem.length,
          user_prayed: prayersForItem.some(p => p.user_id === user?.id) || false,
          user_reminded: false,
          notification_id: null,
        };
      });

      if (user) {
        const { data: remindersData } = await supabase
          .from('prayer_reminders')
          .select('prayer_request_id, notification_id')
          .eq('user_id', user.id);

        if (remindersData) {
          const remindedMap = new Map(
            remindersData.map(r => [r.prayer_request_id, r.notification_id])
          );
          processedPrayers.forEach(p => {
            p.user_reminded = remindedMap.has(p.id);
            p.notification_id = remindedMap.get(p.id) || null;
          });
        }
      }

      let sortedPrayers = processedPrayers;
      if (activeFilter === 'populares') {
        sortedPrayers = [...processedPrayers].sort((a, b) => b.prayers_count - a.prayers_count);
      }

      setPrayers(sortedPrayers);

      const now = new Date();
      const active = sortedPrayers.filter(p => new Date(p.expires_at) > now).length;
      const answered = sortedPrayers.filter(p => p.status === 'answered').length;

      setStats({
        total: sortedPrayers.length,
        active,
        answered,
      });

    } catch (error) {
      console.error('Erro ao buscar pedidos de oração:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pedidos de oração');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrayers();

    const subscription = supabase
      .channel('prayer_requests')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_requests' },
        () => {
          fetchPrayers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [activeFilter, user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrayers();
  };

  const handleCreatePrayer = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Validação', 'O título é obrigatório');
      return;
    }
    if (!newDescription.trim()) {
      Alert.alert('Validação', 'A descrição é obrigatória');
      return;
    }
    if (selectedTags.length === 0) {
      Alert.alert('Validação', 'Selecione pelo menos uma tag');
      return;
    }

    setSubmitting(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('apelido, nome_completo, avatar_url')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      let displayName = 'Usuário';
      if (profileData?.apelido) {
        displayName = profileData.apelido;
      } else if (profileData?.nome_completo) {
        displayName = profileData.nome_completo.split(' ')[0];
      }

      const { error } = await supabase.from('prayer_requests').insert({
        user_id: user?.id,
        author_name: displayName,
        author_avatar: profileData?.avatar_url || null,
        title: newTitle.trim(),
        description: newDescription.trim(),
        expires_at: newExpiryDate.toISOString(),
        tags: selectedTags,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setNewTitle('');
      setNewDescription('');
      setNewExpiryDate(new Date());
      setSelectedTags([]);
      setShowCreateModal(false);

      Alert.alert('Sucesso', 'Seu pedido de oração foi criado!');
      fetchPrayers();

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar o pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrayer = async (prayer: PrayerRequest) => {
    Alert.alert('Em breve', 'Função de edição será implementada em breve');
  };

  const handleDeletePrayer = async (prayerId: string) => {
    Alert.alert(
      'Excluir pedido',
      'Tem certeza que deseja excluir este pedido de oração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('prayer_requests')
                .delete()
                .eq('id', prayerId);

              if (error) throw error;

              Alert.alert('Sucesso', 'Pedido excluído com sucesso');
              fetchPrayers();
            } catch (error: any) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const showOptionsMenu = (prayer: PrayerRequest) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Editar', 'Excluir'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleEditPrayer(prayer);
          } else if (buttonIndex === 2) {
            handleDeletePrayer(prayer.id);
          }
        }
      );
    } else {
      Alert.alert(
        'Opções',
        'Escolha uma ação',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Editar', onPress: () => handleEditPrayer(prayer) },
          { text: 'Excluir', onPress: () => handleDeletePrayer(prayer.id), style: 'destructive' },
        ]
      );
    }
  };

  const fetchPrayersList = async (prayerId: string) => {
    setLoadingPrayersList(true);
    try {
      const { data: prayersData, error: prayersError } = await supabase
        .from('prayers')
        .select('user_id')
        .eq('prayer_request_id', prayerId)
        .order('created_at', { ascending: false });

      if (prayersError) throw prayersError;

      if (!prayersData || prayersData.length === 0) {
        setPrayersList([]);
        return;
      }

      const userIds = prayersData.map(p => p.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('perfis')
        .select('id, nome_completo, apelido, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map();
      (profilesData || []).forEach((profile: Profile) => {
        profilesMap.set(profile.id, profile);
      });

      const formattedData = prayersData.map(item => {
        const profile = profilesMap.get(item.user_id) as Profile | undefined;

        let displayName = 'Usuário';
        if (profile?.apelido) {
          displayName = profile.apelido;
        } else if (profile?.nome_completo) {
          displayName = profile.nome_completo.split(' ')[0];
        }

        return {
          user_id: item.user_id,
          author_name: displayName,
          author_avatar: profile?.avatar_url || null,
        };
      });

      setPrayersList(formattedData);
    } catch (error) {
      console.error('Erro ao buscar lista de orações:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de quem orou');
    } finally {
      setLoadingPrayersList(false);
    }
  };

  const fetchComments = async (prayerId: string) => {
    setLoadingComments(true);
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('prayer_comments')
        .select('id, content, created_at, user_id')
        .eq('prayer_request_id', prayerId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      const userIds = commentsData.map(c => c.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('perfis')
        .select('id, nome_completo, apelido, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.id, profile);
      });

      const formattedComments: Comment[] = commentsData.map(item => {
        const profile = profilesMap.get(item.user_id);

        return {
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          user_id: item.user_id,
          author_name: profile?.apelido || profile?.nome_completo?.split(' ')[0] || 'Usuário',
          author_avatar: profile?.avatar_url || null,
        };
      });

      setComments(formattedComments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPrayerId) return;

    setSubmittingComment(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .select('apelido, nome_completo')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      let authorName = 'Usuário';
      if (profileData?.apelido) {
        authorName = profileData.apelido;
      } else if (profileData?.nome_completo) {
        authorName = profileData.nome_completo.split(' ')[0];
      }

      const { error } = await supabase.from('prayer_comments').insert({
        prayer_request_id: selectedPrayerId,
        user_id: user?.id,
        author_name: authorName,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setNewComment('');
      fetchComments(selectedPrayerId);

      setPrayers(prev =>
        prev.map(p =>
          p.id === selectedPrayerId
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePray = async (prayerId: string) => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para orar por este pedido');
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('prayers')
        .select('id')
        .eq('prayer_request_id', prayerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: deleteError } = await supabase
          .from('prayers')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;

        setPrayers(prev =>
          prev.map(p =>
            p.id === prayerId
              ? { ...p, prayers_count: p.prayers_count - 1, user_prayed: false }
              : p
          )
        );
      } else {
        const { error: insertError } = await supabase
          .from('prayers')
          .insert({
            prayer_request_id: prayerId,
            user_id: user.id,
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        setPrayers(prev =>
          prev.map(p =>
            p.id === prayerId
              ? { ...p, prayers_count: p.prayers_count + 1, user_prayed: true }
              : p
          )
        );
      }

    } catch (error: any) {
      console.error('Erro ao processar oração:', error);
      Alert.alert('Erro', error.message || 'Não foi possível processar sua oração');
    }
  };

  const handleSetReminder = async (prayer: PrayerRequest) => {
    if (!user) {
      Alert.alert('Login necessário', 'Faça login para ativar lembretes');
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('prayer_reminders')
        .select('*')
        .eq('prayer_request_id', prayer.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Se já tem lembrete, remover
        if (existing.notification_id) {
          await cancelPrayerReminder(existing.notification_id);
        }

        const { error: deleteError } = await supabase
          .from('prayer_reminders')
          .delete()
          .eq('prayer_request_id', prayer.id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        Alert.alert('Lembrete removido', 'Você não receberá notificações para este pedido');

        setPrayers(prev =>
          prev.map(p =>
            p.id === prayer.id
              ? { ...p, user_reminded: false, notification_id: null }
              : p
          )
        );
      } else {
        // Calcular data do lembrete (30 minutos antes)
        const expiryDate = new Date(prayer.expires_at);
        
        // Agendar notificação
        const notificationId = await schedulePrayerReminder(
          prayer.id,
          prayer.title,
          expiryDate
        );

        // Criar novo lembrete no banco
        const { error: insertError } = await supabase
          .from('prayer_reminders')
          .insert({
            prayer_request_id: prayer.id,
            user_id: user.id,
            reminder_date: prayer.expires_at,
            notification_id: notificationId,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          if (insertError.code === '23505') {
            setPrayers(prev =>
              prev.map(p =>
                p.id === prayer.id
                  ? { ...p, user_reminded: true }
                  : p
              )
            );
            Alert.alert('Lembrete já ativo', 'Você já possui um lembrete para este pedido.');
            return;
          }
          throw insertError;
        }

        Alert.alert(
          'Lembrete ativado',
          'Você será notificado 30 minutos antes do horário limite deste pedido.'
        );

        setPrayers(prev =>
          prev.map(p =>
            p.id === prayer.id
              ? { ...p, user_reminded: true, notification_id: notificationId }
              : p
          )
        );
      }

    } catch (error: any) {
      console.error('Erro ao processar lembrete:', error);
      Alert.alert('Erro', error.message || 'Não foi possível processar o lembrete');
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff < 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return days === 1 ? '1 dia' : `${days} dias`;
    } else if (hours > 0) {
      return hours === 1 ? '1 hora' : `${hours} horas`;
    } else {
      return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
    }
  };

  const formatExpiry = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff < 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 1) {
      return `Encerra em ${days} dias`;
    } else if (days === 1) {
      return `Encerra amanhã`;
    } else if (hours > 0) {
      return `Encerra em ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `Encerra hoje`;
    }
  };

  const renderPrayerCard = ({ item }: { item: PrayerRequest }) => {
    const timeRemaining = getTimeRemaining(item.expires_at);
    const isUrgent = timeRemaining.includes('hora') || timeRemaining.includes('minuto');
    const isMyPrayer = user && item.user_id === user.id;

    return (
      <View style={styles.prayerCard}>
        {isMyPrayer && (
          <View style={styles.myPrayerBadge}>
            <ThemedText style={styles.myPrayerBadgeText}>Meu pedido</ThemedText>
          </View>
        )}

        <View style={styles.prayerHeader}>
          <View style={styles.prayerAvatar}>
            {item.author_avatar ? (
              <Image source={{ uri: item.author_avatar }} style={styles.prayerAvatarImage} />
            ) : (
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            )}
          </View>
          <View style={styles.prayerAuthorInfo}>
            <ThemedText style={styles.prayerAuthorName}>
              {item.author_name}
            </ThemedText>
            <ThemedText style={styles.prayerTime}>
              Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </ThemedText>
          </View>

          {isMyPrayer && (
            <TouchableOpacity
              style={styles.prayerMenuButton}
              onPress={() => showOptionsMenu(item)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.prayerContent}>
          <ThemedText style={styles.prayerTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.prayerDescription}>{item.description}</ThemedText>

          <View style={styles.prayerTags}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.expiryContainer}>
            <View style={[styles.expiryBadge, isUrgent && styles.expiryBadgeUrgent]}>
              <Ionicons
                name={isUrgent ? 'alert-circle' : 'time-outline'}
                size={14}
                color={isUrgent ? '#B91C1C' : '#92400E'}
              />
              <ThemedText style={[styles.expiryText, isUrgent && styles.expiryTextUrgent]}>
                {formatExpiry(item.expires_at)}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.prayerInteractions}>
          <TouchableOpacity
            style={[styles.interactionButton, styles.interactionButtonLeft]}
            onPress={() => handlePray(item.id)}
            onLongPress={() => {
              setSelectedPrayerId(item.id);
              fetchPrayersList(item.id);
              setShowPrayersList(true);
            }}
            delayLongPress={500}
          >
            <Ionicons
              name={item.user_prayed ? 'heart' : 'heart-outline'}
              size={20}
              color={item.user_prayed ? theme.colors.primary : theme.colors.muted}
            />
            <ThemedText
              style={[
                styles.interactionText,
                item.user_prayed && styles.interactionTextActive,
              ]}
            >
              {item.prayers_count} {item.prayers_count === 1 ? 'Oração' : 'Orações'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => {
              setSelectedPrayerId(item.id);
              setSelectedPrayer(item);
              fetchComments(item.id);
              setShowCommentsModal(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.muted} />
            <ThemedText style={styles.interactionText}>
              {item.comments_count} {item.comments_count === 1 ? 'Comentário' : 'Comentários'}
            </ThemedText>
          </TouchableOpacity>

          <Pressable
            style={styles.interactionButton}
            onPress={() => handleSetReminder(item)}
          >
            <View>
              <Ionicons
                name={item.user_reminded ? 'notifications' : 'notifications-outline'}
                size={20}
                color={item.user_reminded ? theme.colors.primary : theme.colors.muted}
              />
              {item.user_reminded && (
                <View style={styles.reminderBadge}>
                  <ThemedText style={styles.reminderBadgeText}>✓</ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  const filters = [
    { key: 'recentes', label: 'Recentes' },
    { key: 'populares', label: 'Populares' },
    { key: 'urgentes', label: 'Urgentes' },
    { key: 'meus', label: 'Meus Pedidos' },
  ];

  return (
    <ThemedView style={styles.container}>
      {loading && prayers.length === 0 ? (
        // Loading inicial com skeleton
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Skeleton */}
          <View style={styles.header}>
            <View style={[styles.skeletonLine, { width: 150, height: 36 }]} />
            <View style={[styles.skeletonLine, { width: '100%', height: 20, marginTop: 8 }]} />
          </View>

          {/* Stats Skeleton */}
          <View style={styles.statsContainer}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.skeletonLine, { width: 40, height: 24 }]} />
                <View style={[styles.skeletonLine, { width: 50, height: 16, marginTop: 8 }]} />
              </View>
            ))}
          </View>

          {/* Filters Skeleton */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={[styles.filterChip, { width: 80, height: 36, backgroundColor: theme.colors.border, opacity: 0.5 }]} />
              ))}
            </ScrollView>
          </View>

          {/* Prayer Cards Skeleton */}
          {[1, 2, 3].map(i => (
            <PrayerLoadingSkeleton key={i} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={prayers}
          renderItem={renderPrayerCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Orações</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  Compartilhe seus pedidos e ore por outros irmãos
                </ThemedText>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statNumber}>{stats.active}</ThemedText>
                  <ThemedText style={styles.statLabel}>Ativos</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statNumber}>{stats.answered}</ThemedText>
                  <ThemedText style={styles.statLabel}>Respondidos</ThemedText>
                </View>
              </View>

              <View style={styles.filtersContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtersScroll}
                >
                  <Pressable
                    style={[
                      styles.filterChip,
                      activeFilter === null && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(null)}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        activeFilter === null && styles.filterChipTextActive,
                      ]}
                    >
                      Todos
                    </ThemedText>
                  </Pressable>
                  {filters.map(filter => (
                    <Pressable
                      key={filter.key}
                      style={[
                        styles.filterChip,
                        activeFilter === filter.key && styles.filterChipActive,
                      ]}
                      onPress={() => setActiveFilter(filter.key)}
                    >
                      <ThemedText
                        style={[
                          styles.filterChipText,
                          activeFilter === filter.key && styles.filterChipTextActive,
                        ]}
                      >
                        {filter.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </>
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={theme.colors.muted} />
                <ThemedText style={styles.emptyStateText}>
                  Nenhum pedido de oração encontrado
                </ThemedText>
                <Pressable
                  style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowCreateModal(true)}
                >
                  <ThemedText style={styles.emptyStateButtonText}>
                    Criar primeiro pedido
                  </ThemedText>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>

      {/* Modais - mantidos iguais */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Novo Pedido</ThemedText>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Título *</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Cirurgia do meu pai"
                  placeholderTextColor={theme.colors.muted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Descrição *</ThemedText>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Descreva seu pedido de oração..."
                  placeholderTextColor={theme.colors.muted}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Data e hora de expiração *</ThemedText>

                <Pressable
                  style={[styles.datePickerButton, { marginBottom: 8 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText style={styles.datePickerText}>
                    {newExpiryDate.toLocaleDateString('pt-BR')}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.muted} />
                </Pressable>

                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <ThemedText style={styles.datePickerText}>
                    {newExpiryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                  <Ionicons name="time-outline" size={20} color={theme.colors.muted} />
                </Pressable>
              </View>

              <View style={styles.modalField}>
                <ThemedText style={styles.modalLabel}>Tags *</ThemedText>
                <View style={styles.tagsContainer}>
                  {availableTags.map(tag => (
                    <Pressable
                      key={tag}
                      style={[
                        styles.tagSelector,
                        selectedTags.includes(tag) && styles.tagSelectorActive,
                      ]}
                      onPress={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      <ThemedText
                        style={[
                          styles.tagSelectorText,
                          selectedTags.includes(tag) && styles.tagSelectorTextActive,
                        ]}
                      >
                        {tag}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreatePrayer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.modalButtonText}>
                    Criar Pedido
                  </ThemedText>
                )}
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCreateModal(false)}
              >
                <ThemedText style={styles.modalButtonCancelText}>
                  Cancelar
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={newExpiryDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setNewExpiryDate(selectedDate);
            }
          }}
        />
      )}

      {/* TimePicker */}
      {showTimePicker && (
        <DateTimePicker
          value={newExpiryDate}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const newDate = new Date(newExpiryDate);
              newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setNewExpiryDate(newDate);
            }
          }}
        />
      )}

      {/* Modal de lista de quem orou */}
      <Modal
        visible={showPrayersList}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrayersList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.prayersListModal}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Pessoas que oraram</ThemedText>
              <Pressable onPress={() => setShowPrayersList(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {loadingPrayersList ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : prayersList.length > 0 ? (
              <FlatList
                data={prayersList}
                keyExtractor={(item, index) => `${item.user_id}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.prayersListItem}>
                    <View style={[styles.prayerAvatar, { width: 40, height: 40 }]}>
                      {item.author_avatar ? (
                        <Image source={{ uri: item.author_avatar }} style={[styles.prayerAvatarImage, { width: 40, height: 40 }]} />
                      ) : (
                        <Ionicons name="person" size={20} color={theme.colors.primary} />
                      )}
                    </View>
                    <ThemedText style={styles.prayersListName}>{item.author_name}</ThemedText>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={48} color={theme.colors.muted} />
                <ThemedText style={styles.emptyStateText}>
                  Ninguém orou por este pedido ainda
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de comentários */}
      <Modal
        visible={showCommentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Comentários - {selectedPrayer?.title}
              </ThemedText>
              <Pressable onPress={() => setShowCommentsModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <View style={[styles.prayerAvatar, { width: 32, height: 32 }]}>
                      {item.author_avatar ? (
                        <Image source={{ uri: item.author_avatar }} style={[styles.prayerAvatarImage, { width: 32, height: 32 }]} />
                      ) : (
                        <Ionicons name="person" size={16} color={theme.colors.primary} />
                      )}
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <ThemedText style={styles.commentAuthor}>{item.author_name}</ThemedText>
                        <ThemedText style={styles.commentTime}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.commentText}>{item.content}</ThemedText>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </ThemedText>
                  </View>
                }
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            )}

            {user && (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escreva um comentário..."
                  placeholderTextColor={theme.colors.muted}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.commentSendButton,
                    { backgroundColor: theme.colors.primary },
                    (!newComment.trim() || submittingComment) && { opacity: 0.5 },
                  ]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}