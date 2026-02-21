import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, View } from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { createStyles } from './styles/KidsAdminScreen.styles';

export default function KidsAdminScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const processingRef = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);

  const fetchRequests = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      // Buscar APENAS check-ins com status 'pendente'
      const { data: checkins, error: checkinsError } = await supabase
        .from('kids_checkins')
        .select('*')
        .eq('status', 'pendente')
        .order('criado_em', { ascending: true });

      if (checkinsError) throw checkinsError;

      if (!checkins || checkins.length === 0) {
        if (isMounted.current) setRequests([]);
        return;
      }

      // Deduplicar por kid_id - manter apenas o mais recente
      const deduplicatedMap = new Map<string, any>();
      checkins.forEach(checkin => {
        const existing = deduplicatedMap.get(checkin.kid_id);
        if (!existing || new Date(checkin.criado_em) > new Date(existing.criado_em)) {
          deduplicatedMap.set(checkin.kid_id, checkin);
        }
      });

      const deduplicatedCheckins = Array.from(deduplicatedMap.values());

      const kidIds = deduplicatedCheckins.map(c => c.kid_id);
      const responsavelIds = deduplicatedCheckins.map(c => c.checkin_por);

      const [kidsRes, perfisRes] = await Promise.all([
        supabase.from('kids').select('id, nome_completo, foto_url, observacoes').in('id', kidIds),
        supabase.from('perfis').select('id, nome_completo, apelido').in('id', responsavelIds)
      ]);

      const merged = deduplicatedCheckins.map(checkin => ({
        ...checkin,
        kids: kidsRes.data?.find(k => k.id === checkin.kid_id),
        perfis: perfisRes.data?.find(p => p.id === checkin.checkin_por)
      }));

      if (isMounted.current) setRequests(merged);
    } catch (error: any) {
      console.error('Erro ao buscar solicitações:', error.message);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchRequests();

    const channel = supabase
      .channel('kids_admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kids_checkins' }, () => {
        // Delay para garantir que o banco foi atualizado
        setTimeout(() => fetchRequests(), 800);
      })
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const handleApprove = async (request: any) => {
    // Verificar se já está processando este request
    if (processingRef.current.has(request.id)) {
      Alert.alert('Aguarde', 'Esta solicitação já está sendo processada.');
      return;
    }

    processingRef.current.add(request.id);

    try {
      console.log('=== INICIANDO APROVAÇÃO ===');
      console.log('Request ID:', request.id);
      console.log('Request atual:', JSON.stringify(request, null, 2));

      // Se não tem aprovado_em, é um check-in. Se já tem, é um check-out.
      const isCheckin = !request.aprovado_em;
      const newStatus = isCheckin ? 'aprovado' : 'finalizado';
      
      console.log('É check-in?', isCheckin);
      console.log('Novo status:', newStatus);

      const updateData: any = {
        status: newStatus,
        aprovado_por: user?.id,
      };

      // Só atualizar aprovado_em se for check-in (primeira aprovação)
      if (isCheckin) {
        updateData.aprovado_em = new Date().toISOString();
      }

      // Se for check-out (segunda aprovação)
      if (!isCheckin) {
        updateData.checkout_em = new Date().toISOString();
        updateData.checkout_por = user?.id;
      }

      console.log('Dados para atualizar:', JSON.stringify(updateData, null, 2));

      const { data, error } = await supabase
        .from('kids_checkins')
        .update(updateData)
        .eq('id', request.id)
        .select();

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro na atualização:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum registro foi atualizado. Verifique se o ID existe.');
      }

      console.log('Registro atualizado com sucesso:', data);

      // Remover imediatamente da lista local
      setRequests(prev => prev.filter(r => r.id !== request.id));
      
      Alert.alert('Sucesso', isCheckin ? 'Entrada aprovada!' : 'Saída finalizada!');

      // Recarregar após delay para garantir sincronização
      setTimeout(() => {
        fetchRequests();
      }, 1200);
    } catch (error: any) {
      console.error('Erro completo:', error);
      Alert.alert('Erro', error.message || 'Erro ao aprovar solicitação');
      // Se houve erro, recarregar a lista
      setTimeout(() => {
        fetchRequests();
      }, 500);
    } finally {
      processingRef.current.delete(request.id);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
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
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>Painel do Professor</ThemedText>
            <ThemedText style={styles.subtitle}>Aprove as entradas e saídas das crianças.</ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const isCheckin = !item.aprovado_em;
          return (
            <ThemedCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.avatarWrap, { backgroundColor: theme.colors.border }]}>
                  {item.kids?.foto_url ? <Image source={{ uri: `${item.kids.foto_url}?t=${Date.now()}` }} style={styles.avatar} /> :
                    <Ionicons name="happy-outline" size={30} color={theme.colors.primary} />}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.kidName}>{item.kids?.nome_completo || 'Criança'}</ThemedText>
                  <ThemedText style={styles.parentInfo}>Responsável: {item.perfis?.apelido || item.perfis?.nome_completo || 'Membro'}</ThemedText>
                  {item.kids?.observacoes && <View style={styles.obsBadge}><ThemedText style={styles.obsText}>Obs: {item.kids.observacoes}</ThemedText></View>}
                </View>
              </View>
              <View style={styles.footer}>
                <View style={[styles.typeBadge, { backgroundColor: isCheckin ? '#DBEAFE' : '#FEF3C7' }]}>
                  <ThemedText style={[styles.typeText, { color: isCheckin ? '#1E40AF' : '#92400E' }]}>{isCheckin ? 'SOLICITAÇÃO DE ENTRADA' : 'SOLICITAÇÃO DE SAÍDA'}</ThemedText>
                </View>
                <Pressable 
                  style={[styles.approveBtn, { backgroundColor: isCheckin ? '#22C55E' : '#F59E0B', opacity: processingRef.current.has(item.id) ? 0.6 : 1 }]} 
                  onPress={() => handleApprove(item)}
                  disabled={processingRef.current.has(item.id)}
                >
                  <ThemedText style={styles.approveBtnText}>
                    {isCheckin ? 'Aprovar Entrada' : 'Liberar Criança'}
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedCard>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color={theme.colors.muted} />
            <ThemedText style={styles.emptyText}>Nenhuma solicitação pendente.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}