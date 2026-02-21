import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import type { Kid, KidCheckin } from '../types/content';
import { createStyles } from './styles/KidsScreen.styles';

export default function KidsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [kids, setKids] = useState<(Kid & { currentCheckin?: KidCheckin })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  const processingRef = useRef<Set<string>>(new Set());

  const fetchKidsAndCheckins = useCallback(async () => {
    if (!user || !isMounted.current) return;

    try {
      const { data: kidsData, error: kidsError } = await supabase
        .from('kids')
        .select('*')
        .eq('responsavel_id', user.id)
        .order('nome_completo');

      if (kidsError) throw kidsError;

      // Buscar check-ins que NÃO foram finalizados (pendente, aprovado)
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('kids_checkins')
        .select('*')
        .in('status', ['pendente', 'aprovado']);

      if (checkinsError) throw checkinsError;

      const merged = (kidsData || []).map(kid => {
        // Pegar o check-in mais recente para este kid
        const kidCheckins = (checkinsData || []).filter(c => c.kid_id === kid.id);
        const currentCheckin = kidCheckins.length > 0 
          ? kidCheckins.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())[0]
          : undefined;
        
        return {
          ...kid,
          currentCheckin,
        };
      });

      if (isMounted.current) setKids(merged);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    isMounted.current = true;
    fetchKidsAndCheckins();

    const channel = supabase
      .channel('kids_realtime_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kids_checkins' },
        (payload: any) => {
          // Atualizar instantaneamente com os dados do evento
          if (payload.eventType === 'UPDATE') {
            const updatedCheckin = payload.new as KidCheckin;
            setKids(prevKids =>
              prevKids.map(kid => {
                if (kid.id === updatedCheckin.kid_id) {
                  // Se o check-in foi finalizado, remover do estado
                  if (updatedCheckin.status === 'finalizado') {
                    return {
                      ...kid,
                      currentCheckin: undefined,
                    };
                  }
                  return {
                    ...kid,
                    currentCheckin: updatedCheckin,
                  };
                }
                return kid;
              })
            );
          } else {
            // Para INSERT ou DELETE, recarregar
            setTimeout(() => fetchKidsAndCheckins(), 300);
          }
        }
      )
      .subscribe();

    const sub = DeviceEventEmitter.addListener(
      'kids.updated',
      fetchKidsAndCheckins
    );

    return () => {
      isMounted.current = false;
      sub.remove();
      supabase.removeChannel(channel);
    };
  }, [fetchKidsAndCheckins]);

  useEffect(() => {
    if (route.params?.scannedData && route.params?.kidId) {
      handleProcessScan(route.params.kidId, route.params.mode);
      navigation.setParams({
        scannedData: undefined,
        kidId: undefined,
        mode: undefined,
      });
    }
  }, [route.params]);

  const handleProcessScan = async (
    kidId: string,
    mode: 'checkin' | 'checkout'
  ) => {
    // Verificar se já está processando este kid
    if (processingRef.current.has(kidId)) {
      Alert.alert('Aguarde', 'Esta solicitação já está sendo processada.');
      return;
    }

    processingRef.current.add(kidId);

    try {
      setLoading(true);

      if (mode === 'checkin') {
        // Verificar se já existe um check-in pendente ou aprovado para este kid
        const { data: existingCheckin, error: checkError } = await supabase
          .from('kids_checkins')
          .select('id, status')
          .eq('kid_id', kidId)
          .in('status', ['pendente', 'aprovado'])
          .order('criado_em', { ascending: false })
          .limit(1)
          .single();

        // Se existe um check-in ativo, não permitir novo
        if (existingCheckin && !checkError) {
          Alert.alert(
            'Solicitação Existente',
            `Este filho já tem uma solicitação em andamento (Status: ${existingCheckin.status}).`
          );
          processingRef.current.delete(kidId);
          setLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];

        const { data: sessoes } = await supabase
          .from('kids_sessoes')
          .select('id')
          .eq('status', 'aberta')
          .gte('inicio_em', today);

        let sessaoId =
          sessoes && sessoes.length > 0 ? sessoes[0].id : null;

        if (!sessaoId) {
          const { data: novaSessao, error: createError } =
            await supabase
              .from('kids_sessoes')
              .insert({
                nome: `Sessão Geral - ${new Date().toLocaleDateString(
                  'pt-BR'
                )}`,
                status: 'aberta',
                inicio_em: new Date().toISOString(),
              })
              .select()
              .single();

          if (createError) throw createError;
          sessaoId = novaSessao.id;
        }

        const { error } = await supabase.from('kids_checkins').insert({
          kid_id: kidId,
          sessao_id: sessaoId,
          checkin_por: user?.id,
          status: 'pendente',
        });

        if (error) throw error;

        Alert.alert(
          'Solicitado!',
          'Sua solicitação de entrada foi enviada.'
        );
      } else {
        // Para checkout, atualizar o status para pendente (solicitação de saída)
        const { error } = await supabase
          .from('kids_checkins')
          .update({ status: 'pendente' })
          .eq('kid_id', kidId)
          .eq('status', 'aprovado');

        if (error) throw error;

        Alert.alert(
          'Solicitado!',
          'Sua solicitação de saída foi enviada.'
        );
      }

      // Aguardar um pouco e depois recarregar os dados
      await new Promise(resolve => setTimeout(resolve, 800));
      await fetchKidsAndCheckins();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      processingRef.current.delete(kidId);
      setLoading(false);
    }
  };

  const handleCancelRequest = async (checkinId: string) => {
    Alert.alert('Cancelar Solicitação', 'Deseja cancelar este pedido?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase
              .from('kids_checkins')
              .delete()
              .eq('id', checkinId);

            if (error) throw error;

            await fetchKidsAndCheckins();
            Alert.alert('Sucesso', 'Solicitação cancelada.');
          } catch (error: any) {
            Alert.alert('Erro', error.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteKid = async (kidId: string) => {
    Alert.alert(
      'Excluir Criança',
      'Tem certeza que deseja excluir este cadastro?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('kids')
                .delete()
                .eq('id', kidId);

              if (error) throw error;

              await fetchKidsAndCheckins();
              Alert.alert('Sucesso', 'Cadastro excluído.');
            } catch (error: any) {
              Alert.alert('Erro', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchKidsAndCheckins();
  }, [fetchKidsAndCheckins]);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pendente':
        return { label: 'Aguardando Aprovação', color: '#EAB308' };
      case 'aprovado':
        return { label: 'Presente no Kids', color: '#22C55E' };
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <FlatList
        data={kids}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              Módulo Kids
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Gerencie a segurança e o check-in dos seus filhos.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatusLabel(
            item.currentCheckin?.status
          );

          return (
            <ThemedCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.avatarWrap}>
                  {item.foto_url ? (
                    <Image
                      source={{
                        uri: `${item.foto_url}?t=${Date.now()}`,
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Ionicons
                      name="happy-outline"
                      size={30}
                      color={theme.colors.primary}
                    />
                  )}
                </View>

                <View style={styles.flex1}>
                  <ThemedText style={styles.kidName}>
                    {item.nome_completo}
                  </ThemedText>

                  {status ? (
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: status.color },
                        ]}
                      >
                        {status.label}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.kidInfo}>
                      Fora do Kids
                    </ThemedText>
                  )}
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('KidForm', { kid: item })
                    }
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={theme.colors.muted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteKid(item.id)}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#EF4444"
                    />
                  </Pressable>
                </View>
              </View>

              {!item.currentCheckin ? (
                <Pressable
                  onPress={() =>
                    navigation.navigate('Scanner', {
                      kidId: item.id,
                      mode: 'checkin',
                    })
                  }
                  style={[
                    styles.checkinBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <ThemedText style={styles.checkinBtnText}>
                    Realizar Check-in
                  </ThemedText>
                </Pressable>
              ) : item.currentCheckin.status === 'pendente' ? (
                <View style={styles.pendingActions}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <ThemedText style={[styles.flex1, { fontSize: 13, opacity: 0.7 }]}>
                    Solicitação enviada...
                  </ThemedText>
                  <Pressable
                    onPress={() => handleCancelRequest(item.currentCheckin!.id)}
                    style={styles.cancelBtn}
                  >
                    <ThemedText style={{ color: '#EF4444', fontWeight: '700' }}>
                      Cancelar
                    </ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() =>
                    navigation.navigate('Scanner', {
                      kidId: item.id,
                      mode: 'checkout',
                    })
                  }
                  style={[
                    styles.checkinBtn,
                    { backgroundColor: '#F59E0B' },
                  ]}
                >
                  <ThemedText style={styles.checkinBtnText}>
                    Solicitar Check-out
                  </ThemedText>
                </Pressable>
              )}
            </ThemedCard>
          );
        }}
        ListFooterComponent={
          <Pressable
            onPress={() => navigation.navigate('KidForm')}
            style={styles.addBtnOutline}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={theme.colors.primary}
            />
            <ThemedText
              style={{
                color: theme.colors.primary,
                fontWeight: '700',
              }}
            >
              Cadastrar nova criança
            </ThemedText>
          </Pressable>
        }
      />
    </ThemedView>
  );
}