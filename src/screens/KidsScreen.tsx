import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, DeviceEventEmitter, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import type { Kid, KidCheckin } from '../types/content';

export default function KidsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [kids, setKids] = useState<(Kid & { currentCheckin?: KidCheckin })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const fetchKidsAndCheckins = useCallback(async () => {
    if (!user || !isMounted.current) return;
    try {
      const { data: kidsData, error: kidsError } = await supabase
        .from('kids')
        .select('*')
        .eq('responsavel_id', user.id)
        .order('nome_completo');

      if (kidsError) throw kidsError;

      const today = new Date().toISOString().split('T')[0];
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('kids_checkins')
        .select('*')
        .gte('criado_em', today)
        .neq('status', 'finalizado');
      console.log({ checkinsData, checkinsError })
      if (checkinsError) throw checkinsError;

      const merged = (kidsData || []).map(kid => ({
        ...kid,
        currentCheckin: (checkinsData || []).find(c => c.kid_id === kid.id)
      }));

      if (isMounted.current) {
        setKids(merged);
      }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kids_checkins' }, () => {
        fetchKidsAndCheckins();
      })
      .subscribe();

    const sub = DeviceEventEmitter.addListener('kids.updated', () => {
      fetchKidsAndCheckins();
    });

    return () => {
      isMounted.current = false;
      sub.remove();
      supabase.removeChannel(channel);
    };
  }, [fetchKidsAndCheckins]);

  useEffect(() => {
    if (route.params?.scannedData && route.params?.kidId) {
      handleProcessScan(route.params.kidId, route.params.mode);
      navigation.setParams({ scannedData: undefined, kidId: undefined, mode: undefined });
    }
  }, [route.params]);

  const handleProcessScan = async (kidId: string, mode: 'checkin' | 'checkout') => {
    try {
      setLoading(true);
      if (mode === 'checkin') {
        const today = new Date().toISOString().split('T')[0];
        const { data: sessoes } = await supabase.from('kids_sessoes').select('id').eq('status', 'aberta').gte('inicio_em', today);
        let sessaoId = sessoes && sessoes.length > 0 ? sessoes[0].id : null;

        if (!sessaoId) {
          const { data: novaSessao, error: createError } = await supabase.from('kids_sessoes').insert({
            nome: `Sessão Geral - ${new Date().toLocaleDateString('pt-BR')}`,
            status: 'aberta',
            inicio_em: new Date().toISOString()
          }).select().single();
          if (createError) throw createError;
          sessaoId = novaSessao.id;
        }

        const { error } = await supabase.from('kids_checkins').insert({
          kid_id: kidId, sessao_id: sessaoId, checkin_por: user?.id, status: 'pendente'
        });
        if (error) throw error;
        Alert.alert('Solicitado!', 'Sua solicitação de entrada foi enviada.');
      } else {
        const { error } = await supabase.from('kids_checkins').update({ status: 'pendente' }).eq('kid_id', kidId).neq('status', 'finalizado');
        if (error) throw error;
        Alert.alert('Solicitado!', 'Sua solicitação de saída foi enviada.');
      }
      await fetchKidsAndCheckins();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (checkinId: string) => {
    Alert.alert('Cancelar Solicitação', 'Deseja cancelar este pedido?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase.from('kids_checkins').delete().eq('id', checkinId);
            console.log({ error })
            if (error) throw error;
            await fetchKidsAndCheckins();
            Alert.alert('Sucesso', 'Solicitação cancelada.');
          } catch (error: any) { Alert.alert('Erro', error.message); }
          finally { setLoading(false); }
        }
      }
    ]);
  };

  const handleDeleteKid = async (kidId: string) => {
    Alert.alert('Excluir Criança', 'Tem certeza que deseja excluir este cadastro?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, excluir', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase.from('kids').delete().eq('id', kidId);
            if (error) throw error;
            await fetchKidsAndCheckins();
            Alert.alert('Sucesso', 'Cadastro excluído.');
          } catch (error: any) { Alert.alert('Erro', error.message); }
          finally { setLoading(false); }
        }
      }
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchKidsAndCheckins();
  }, [fetchKidsAndCheckins]);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pendente': return { label: 'Aguardando Aprovação', color: '#EAB308' };
      case 'aprovado': return { label: 'Presente no Kids', color: '#22C55E' };
      default: return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={kids}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>Módulo Kids</ThemedText>
            <ThemedText style={styles.subtitle}>Gerencie a segurança e o check-in dos seus filhos.</ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatusLabel(item.currentCheckin?.status);
          return (
            <ThemedCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.avatarWrap, { backgroundColor: theme.colors.border }]}>
                  {item.foto_url ? <Image source={{ uri: `${item.foto_url}?t=${Date.now()}` }} style={styles.avatar} /> :
                    <Ionicons name="happy-outline" size={30} color={theme.colors.primary} />}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.kidName}>{item.nome_completo}</ThemedText>
                  {status ? (
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                      <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
                    </View>
                  ) : <ThemedText style={styles.kidInfo}>Fora do Kids</ThemedText>}
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={() => navigation.navigate('KidForm', { kid: item })} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteKid(item.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                  </Pressable>
                </View>
              </View>

              {item.currentCheckin?.status === 'pendente' ? (
                <View style={styles.pendingActions}>
                  <View style={[styles.checkinBtn, { backgroundColor: theme.colors.border, flex: 1 }]}>
                    <ThemedText style={[styles.checkinBtnText, { color: theme.colors.text }]}>Aguardando Professor...</ThemedText>
                  </View>
                  <Pressable style={styles.cancelBtn} onPress={() => handleCancelRequest(item.currentCheckin!.id)}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </Pressable>
                </View>
              ) : (
                <Pressable style={[styles.checkinBtn, { backgroundColor: theme.colors.primary }]} onPress={() => {
                  if (!item.currentCheckin) navigation.navigate('Scanner', { kidId: item.id, mode: 'checkin' });
                  else if (item.currentCheckin.status === 'aprovado') navigation.navigate('Scanner', { kidId: item.id, mode: 'checkout' });
                }}>
                  <ThemedText style={styles.checkinBtnText}>{!item.currentCheckin ? 'Realizar Check-in' : 'Solicitar Check-out'}</ThemedText>
                </Pressable>
              )}
            </ThemedCard>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={theme.colors.muted} /><ThemedText style={styles.emptyText}>Nenhuma criança cadastrada.</ThemedText>
            <Pressable style={[styles.addBtn, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('KidForm')}><ThemedText style={styles.addBtnText}>Cadastrar Criança</ThemedText></Pressable>
          </View>
        }
        ListFooterComponent={kids.length > 0 ? (
          <Pressable style={[styles.addBtnOutline, { borderColor: theme.colors.primary }]} onPress={() => navigation.navigate('KidForm')}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} /><ThemedText style={{ color: theme.colors.primary, fontWeight: '700' }}>Adicionar Outra Criança</ThemedText>
          </Pressable>
        ) : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { opacity: 0.7, fontSize: 14 },
  card: { marginBottom: 16, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarWrap: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatar: { width: 50, height: 50 },
  kidName: { fontSize: 16, fontWeight: '700' },
  kidInfo: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  checkinBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  checkinBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  pendingActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancelBtn: { padding: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, opacity: 0.6, textAlign: 'center' },
  addBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  addBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginTop: 12 },
});