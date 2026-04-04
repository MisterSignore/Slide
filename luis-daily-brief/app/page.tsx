'use client';

import { useNews } from '@/hooks/useNews';
import Header from '@/components/Header';
import NewsFeed from '@/components/NewsFeed';
import { LoadingState, ErrorState } from '@/components/LoadingState';

export default function HomePage() {
  const { brief, status, error, generatedAt, refresh, isRefreshing } = useNews();

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Ambient cyan glow at top */}
      <div
        className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(0,200,255,0.12) 0%, transparent 100%)',
        }}
      />

      {/* Header */}
      <Header
        generatedAt={generatedAt}
        onRefresh={refresh}
        isRefreshing={status === 'loading' || isRefreshing}
      />

      {/* Main content – offset for fixed header */}
      <main className="relative z-10 pt-[72px]">
        {status === 'loading' && !brief && <LoadingState />}

        {status === 'error' && !brief && (
          <ErrorState message={error ?? 'Unbekannter Fehler'} onRetry={refresh} />
        )}

        {brief && <NewsFeed brief={brief} />}
      </main>
    </div>
  );
}
