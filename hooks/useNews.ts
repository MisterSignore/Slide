'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { NewsBrief, FetchStatus } from '@/types/news';

interface UseNewsResult {
  brief: NewsBrief | null;
  status: FetchStatus;
  error: string | null;
  generatedAt: Date | null;
  refresh: () => void;
  isRefreshing: boolean;
}

export function useNews(): UseNewsResult {
  const [brief, setBrief] = useState<NewsBrief | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(forceRefresh && brief ? 'loading' : 'loading');
    if (forceRefresh && brief) setIsRefreshing(true);
    setError(null);

    try {
      const url = forceRefresh ? '/api/news?refresh=1' : '/api/news';
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const data: NewsBrief = await res.json();
      setBrief(data);
      setStatus('success');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  }, [brief]);

  useEffect(() => {
    fetchNews(false);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => fetchNews(true), [fetchNews]);

  const generatedAt = brief?.generated_at ? new Date(brief.generated_at) : null;

  return { brief, status, error, generatedAt, refresh, isRefreshing };
}
