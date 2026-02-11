import React from 'react';
import { getAvisosPage, observeAvisos } from '../services/firebase';
import type { Aviso } from '../types/content';

export function useAvisos(opts?: { realtime?: boolean; pageSize?: number }) {
  const [data, setData] = React.useState<Aviso[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [cursorId, setCursorId] = React.useState<string | undefined>();
  const [hasMore, setHasMore] = React.useState(true);

  const pageSize = opts?.pageSize ?? 10;

  const loadFirst = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await getAvisosPage({ pageSize });
      setData(page.items);
      setCursorId(page.cursorId);
      setHasMore(!!page.cursorId);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMore = React.useCallback(async () => {
    if (!hasMore || !cursorId) return;
    const page = await getAvisosPage({ pageSize, cursorId });
    setData((prev) => prev.concat(page.items));
    setCursorId(page.cursorId);
    setHasMore(!!page.cursorId);
  }, [cursorId, hasMore, pageSize]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFirst();
    } finally {
      setRefreshing(false);
    }
  }, [loadFirst]);

  React.useEffect(() => {
    if (opts?.realtime) {
      const unsub = observeAvisos((items) => setData(items));
      setLoading(false);
      return () => unsub();
    } else {
      loadFirst();
    }
  }, [opts?.realtime, loadFirst]);

  return { data, loading, refreshing, onRefresh, loadMore, hasMore };
}