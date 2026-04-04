'use client';

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-16 h-5 rounded-full shimmer" />
        <div className="w-10 h-4 rounded-full shimmer ml-auto" />
      </div>
      <div className="w-full h-5 rounded-lg shimmer" />
      <div className="w-5/6 h-5 rounded-lg shimmer" />
      <div className="space-y-2 pt-1">
        <div className="w-full h-3.5 rounded shimmer" />
        <div className="w-full h-3.5 rounded shimmer" />
        <div className="w-3/4 h-3.5 rounded shimmer" />
      </div>
      <div className="w-2/3 h-3 rounded shimmer" />
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
export function LoadingState() {
  return (
    <div className="px-4 space-y-4 pt-2">
      {/* Status message */}
      <div className="flex items-center gap-2 px-1 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </span>
        <p className="text-sm text-slate-400 font-medium">
          Claude recherchiert die aktuellen Nachrichten...
        </p>
      </div>

      {/* Skeleton cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center gap-5">
      <div className="text-4xl">⚠️</div>
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Fehler beim Laden</h2>
        <p className="text-sm text-slate-400 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-full bg-cyan/10 text-cyan text-sm font-semibold
                   hover:bg-cyan/20 active:scale-95 transition-all"
      >
        Erneut versuchen
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center gap-3">
      <div className="text-3xl">📭</div>
      <p className="text-slate-400 text-sm">
        Keine Nachrichten für <span className="text-white font-medium">{label}</span>
      </p>
    </div>
  );
}
