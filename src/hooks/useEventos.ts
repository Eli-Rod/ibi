import React from 'react';
import { getEventosPage, getProximosEventos, observeEventos } from '../services/firebase';
import type { Evento } from '../types/content';

export function useEventos(opts?: { realtime?: boolean; pageSize?: number; futuros?: boolean }) {
  const [data, setData] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [cursorId, setCursorId] = React.useState<string | undefined>();
  const [hasMore, setHasMore] = React.useState(true);

  const pageSize = opts?.pageSize ?? 10;

  const loadFirst = React.useCallback(async () => {
    setLoading(true);
    try {
      if (opts?.futuros) {
        const items = await getProximosEventos();
        setData(items);
        setCursorId(undefined);
        setHasMore(false);
      } else {
        const page = await getEventosPage({ pageSize });
        setData(page.items);
        setCursorId(page.cursorId);
        setHasMore(!!page.cursorId);
      }
    } finally {
      setLoading(false);
    }
  }, [opts?.futuros, pageSize]);

  const loadMore = React.useCallback(async () => {
    if (!hasMore || !cursorId || opts?.futuros) return;
    const page = await getEventosPage({ pageSize, cursorId });
    setData((prev) => prev.concat(page.items));
    setCursorId(page.cursorId);
    setHasMore(!!page.cursorId);
  }, [cursorId, hasMore, pageSize, opts?.futuros]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFirst();
    } finally {
      setRefreshing(false);
    }
  }, [loadFirst]);

  React.useEffect(() => {
    if (opts?.realtime && !opts.futuros) {
      const unsub = observeEventos((items) => setData(items));
      setLoading(false);
      return () => unsub();
    } else {
      loadFirst();
    }
  }, [opts?.realtime, opts?.futuros, loadFirst]);

  return { data, loading, refreshing, onRefresh, loadMore, hasMore };
}