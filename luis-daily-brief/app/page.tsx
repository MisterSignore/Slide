'use client';

import { useNews } from '@/hooks/useNews';
import Header from '@/components/Header';
import NewsFeed from '@/components/NewsFeed';
import { LoadingState, ErrorState } from '@/components/LoadingState';

export default function HomePage() {
  const { brief, status, error, generatedAt, refresh, isRefreshing } = useNews();

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Ambient cyan glow at top */}
      <div
        className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(0,200,255,0.12) 0%, transparent 100%)',
        }}
      />

      {/* Header */}
      <Header
        generatedAt={generatedAt}
        onRefresh={refresh}
        isRefreshing={isLoading || isRefreshing}
      />

      {/* Error toast – shown on top of existing content */}
      {status === 'error' && error && (
        <div className="fixed top-[72px] left-4 right-4 z-50 animate-fade-up">
          <div className="bg-red-950/90 border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-3 backdrop-blur-sm">
            <span className="text-red-400 text-lg leading-none">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-red-300 text-sm font-semibold">Fehler beim Laden</p>
              <p className="text-red-400/80 text-xs mt-0.5 break-words">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="flex-shrink-0 text-xs text-red-300 hover:text-white font-semibold px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 pt-[72px]">
        {isLoading && !brief && <LoadingState />}

        {status === 'error' && !brief && (
          <ErrorState message={error ?? 'Unbekannter Fehler'} onRetry={refresh} />
        )}

        {brief && <NewsFeed brief={brief} />}
      </main>
    </div>
  );
}
