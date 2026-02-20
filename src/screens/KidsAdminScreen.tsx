import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
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

  const fetchRequests = useCallback(async () => {
    try {
      const { data: checkins, error: checkinsError } = await supabase
        .from('kids_checkins')
        .select('*')
        .eq('status', 'pendente')
        .order('criado_em', { ascending: true });

      if (checkinsError) throw checkinsError;

      if (!checkins || checkins.length === 0) {
        setRequests([]);
        return;
      }

      const kidIds = checkins.map(c => c.kid_id);
      const responsavelIds = checkins.map(c => c.checkin_por);

      const [kidsRes, perfisRes] = await Promise.all([
        supabase.from('kids').select('id, nome_completo, foto_url, observacoes').in('id', kidIds),
        supabase.from('perfis').select('id, nome_completo, apelido').in('id', responsavelIds)
      ]);

      const merged = checkins.map(checkin => ({
        ...checkin,
        kids: kidsRes.data?.find(k => k.id === checkin.kid_id),
        perfis: perfisRes.data?.find(p => p.id === checkin.checkin_por)
      }));

      setRequests(merged);
    } catch (error: any) {
      console.error('Erro ao buscar solicitações:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('kids_admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kids_checkins' }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRequests]);

  const handleApprove = async (request: any) => {
    try {
      // Se não tem aprovado_em, é um check-in. Se já tem, é um check-out.
      const isCheckin = !request.aprovado_em;
      const newStatus = isCheckin ? 'aprovado' : 'finalizado';
      
      const updateData: any = {
        status: newStatus,
        aprovado_por: user?.id,
        aprovado_em: isCheckin ? new Date().toISOString() : request.aprovado_em,
      };

      if (!isCheckin) {
        updateData.checkout_em = new Date().toISOString();
        updateData.checkout_por = user?.id;
      }

      const { error } = await supabase
        .from('kids_checkins')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;
      
      setRequests(prev => prev.filter(r => r.id !== request.id));
      Alert.alert('Sucesso', isCheckin ? 'Entrada aprovada!' : 'Saída finalizada!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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
                <Pressable style={[styles.approveBtn, { backgroundColor: isCheckin ? '#22C55E' : '#F59E0B' }]} onPress={() => handleApprove(item)}>
                  <ThemedText style={styles.approveBtnText}>{isCheckin ? 'Aprovar Entrada' : 'Liberar Criança'}</ThemedText>
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
