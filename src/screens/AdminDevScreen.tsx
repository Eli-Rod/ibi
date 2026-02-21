import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import { ThemedCard, ThemedText, ThemedView } from '../components/Themed';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeProvider';
import { createStyles } from './styles/AdminDevScreen.styles';

type UserWithRoles = {
  id: string;
  nome_completo: string;
  roles: string[];
};

export default function AdminDevScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const isMounted = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const availableRoles = ['admin', 'kids', 'membro', 'pastor', 'admin-dev'];

  const searchUsers = useCallback(async (query: string) => {
    if (!isMounted.current) return;

    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);

      // Buscar usuários que correspondem ao nome (usando ilike para busca case-insensitive)
      const { data: perfis, error: perfisError } = await supabase
        .from('perfis')
        .select('id, nome_completo')
        .ilike('nome_completo', `%${query}%`)
        .order('nome_completo')
        .limit(20);

      if (perfisError) throw perfisError;

      if (!perfis || perfis.length === 0) {
        if (isMounted.current) setUsers([]);
        return;
      }

      // Buscar papéis de cada usuário encontrado
      const userIds = perfis.map(p => p.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('usuarios_papeis')
        .select('usuario_id, papel')
        .in('usuario_id', userIds);

      if (rolesError) throw rolesError;

      // Mapear dados
      const merged = perfis.map(perfil => {
        const userRoles = rolesData?.filter(r => r.usuario_id === perfil.id).map(r => r.papel) || [];

        return {
          id: perfil.id,
          nome_completo: perfil.nome_completo || 'Sem nome',
          roles: userRoles,
        };
      });

      if (isMounted.current) setUsers(merged);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error.message);
      Alert.alert('Erro', `Erro ao buscar usuários: ${error.message}`);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Debounce na busca
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(text);
    }, 500);
  };

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleAddRole = async (userToUpdate: UserWithRoles, role: string) => {
    if (userToUpdate.roles.includes(role)) {
      Alert.alert('Aviso', 'Este usuário já possui este papel.');
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios_papeis')
        .insert({ usuario_id: userToUpdate.id, papel: role });

      if (error) throw error;

      Alert.alert('Sucesso', `Papel '${role}' adicionado a ${userToUpdate.nome_completo}`);
      
      // Atualizar a lista local
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userToUpdate.id
            ? { ...u, roles: [...u.roles, role] }
            : u
        )
      );
      
      setShowRoleModal(false);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleRemoveRole = async (userToUpdate: UserWithRoles, role: string) => {
    Alert.alert(
      'Confirmar',
      `Deseja remover o papel '${role}' de ${userToUpdate.nome_completo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('usuarios_papeis')
                .delete()
                .eq('usuario_id', userToUpdate.id)
                .eq('papel', role);

              if (error) throw error;

              Alert.alert('Sucesso', `Papel '${role}' removido de ${userToUpdate.nome_completo}`);
              
              // Atualizar a lista local
              setUsers(prevUsers =>
                prevUsers.map(u =>
                  u.id === userToUpdate.id
                    ? { ...u, roles: u.roles.filter(r => r !== role) }
                    : u
                )
              );
            } catch (error: any) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    searchUsers(searchText);
  };

  return (
    <ThemedView style={styles.flex}>
      <FlatList
        data={users}
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
            <ThemedText style={styles.title}>Gerenciador de Papéis</ThemedText>
            <ThemedText style={styles.subtitle}>
              Busque e gerencie os papéis (roles) dos usuários do IBI.
            </ThemedText>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={theme.colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Digite o nome do usuário..."
                placeholderTextColor={theme.colors.muted}
                value={searchText}
                onChangeText={handleSearchChange}
              />
              {loading && (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              )}
            </View>

            {searchText.length > 0 && users.length === 0 && !loading && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={40} color={theme.colors.muted} />
                <ThemedText style={styles.noResultsText}>
                  Nenhum usuário encontrado com "{searchText}"
                </ThemedText>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ThemedCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>{item.nome_completo}</ThemedText>
              </View>
            </View>

            <View style={styles.rolesContainer}>
              {item.roles.length > 0 ? (
                item.roles.map(role => (
                  <Pressable
                    key={role}
                    onPress={() => handleRemoveRole(item, role)}
                    style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}
                  >
                    <ThemedText style={styles.roleBadgeText}>{role}</ThemedText>
                    <Ionicons name="close-circle" size={14} color="white" style={{ marginLeft: 4 }} />
                  </Pressable>
                ))
              ) : (
                <ThemedText style={styles.noRoles}>Sem papéis atribuídos</ThemedText>
              )}
            </View>

            <Pressable
              style={[styles.addRoleBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setSelectedUser(item);
                setShowRoleModal(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color="white" />
              <ThemedText style={styles.addRoleBtnText}>Adicionar Papel</ThemedText>
            </Pressable>
          </ThemedCard>
        )}
        ListEmptyComponent={
          !loading && searchText.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={theme.colors.muted} />
              <ThemedText style={styles.emptyText}>
                Digite o nome de um usuário para começar
              </ThemedText>
            </View>
          ) : null
        }
      />

      {showRoleModal && selectedUser && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Adicionar papel a {selectedUser.nome_completo}</ThemedText>
              <Pressable onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.rolesGrid}>
              {availableRoles.map(role => (
                <Pressable
                  key={role}
                  onPress={() => handleAddRole(selectedUser, role)}
                  disabled={selectedUser.roles.includes(role)}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor: selectedUser.roles.includes(role)
                        ? theme.colors.muted
                        : theme.colors.primary,
                      opacity: selectedUser.roles.includes(role) ? 0.5 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.roleOptionText}>{role}</ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.closeBtn, { backgroundColor: theme.colors.border }]}
              onPress={() => setShowRoleModal(false)}
            >
              <ThemedText style={{ color: theme.colors.text, fontWeight: '700' }}>Fechar</ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </ThemedView>
  );
}