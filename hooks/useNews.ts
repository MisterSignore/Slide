'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { NewsBrief, FetchStatus } from '@/types/news';

const STORAGE_KEY = 'luis-brief-cache';
const CACHE_TTL_MS = 30 * 60 * 1000;      // 30 min localStorage cache
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown on manual refresh

interface StoredBrief { data: NewsBrief; savedAt: number }

function readStorage(): StoredBrief | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredBrief = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function writeStorage(data: NewsBrief) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {}
}

export interface UseNewsResult {
  brief: NewsBrief | null;
  status: FetchStatus;
  error: string | null;
  generatedAt: Date | null;
  refresh: () => void;
  isRefreshing: boolean;
  cooldownSeconds: number | null;
}

export function useNews(): UseNewsResult {
  const [brief, setBrief] = useState<NewsBrief | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    // Enforce cooldown on manual refresh
    if (forceRefresh) {
      const elapsed = Date.now() - lastRefreshRef.current;
      if (elapsed < REFRESH_COOLDOWN_MS) {
        setCooldownSeconds(Math.ceil((REFRESH_COOLDOWN_MS - elapsed) / 1000));
        return;
      }
    }

    // Serve from localStorage if data is fresh enough
    if (!forceRefresh) {
      const stored = readStorage();
      if (stored) {
        setBrief(stored.data);
        setStatus('success');
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    if (forceRefresh && brief) setIsRefreshing(true);
    setError(null);
    setCooldownSeconds(null);

    try {
      const res = await fetch('/api/news', { signal: controller.signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data: NewsBrief = await res.json();
      writeStorage(data);
      setBrief(data);
      setStatus('success');
      lastRefreshRef.current = Date.now();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  }, [brief]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!cooldownSeconds || cooldownSeconds <= 0) { setCooldownSeconds(null); return; }
    const t = setTimeout(() => setCooldownSeconds((s) => (s && s > 1 ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [cooldownSeconds]);

  useEffect(() => {
    fetchNews(false);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => fetchNews(true), [fetchNews]);
  const generatedAt = brief?.generated_at ? new Date(brief.generated_at) : null;

  return { brief, status, error, generatedAt, refresh, isRefreshing, cooldownSeconds };
}
