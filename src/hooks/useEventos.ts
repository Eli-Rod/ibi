import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Evento } from '../types/content';

export function useEventos(opts?: { futuros?: boolean }) {
  const [data, setData] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEventos = useCallback(async () => {
    try {
      // Se opts.futuros for true, usamos a view de próximos eventos
      // Caso contrário, poderíamos buscar todos (ajustável conforme necessidade)
      const table = opts?.futuros ? 'vw_eventos_proximos' : 'eventos';
      
      const { data: eventos, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;
      setData(eventos || []);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [opts?.futuros]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventos();
  }, [fetchEventos]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  return { data, loading, refreshing, onRefresh, hasMore: false, loadMore: () => {} };
}


