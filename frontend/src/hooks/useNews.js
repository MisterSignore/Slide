import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function useNews(category) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(null);

  const fetchArticles = useCallback(async (cat, showLoader = true) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (showLoader) setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE}/news?category=${cat}&limit=50`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(category);
    return () => abortRef.current?.abort();
  }, [category, fetchArticles]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_BASE}/refresh`, { method: 'POST' });
      // Wait a beat then re-fetch (backend runs async)
      await new Promise((r) => setTimeout(r, 3000));
      await fetchArticles(category, false);
    } finally {
      setRefreshing(false);
    }
  }, [category, fetchArticles]);

  return { articles, loading, error, refresh, refreshing };
}

export function useCategories() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return categories;
}
