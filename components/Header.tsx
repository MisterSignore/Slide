'use client';

import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  generatedAt: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  cooldownSeconds: number | null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatCooldown(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')} min` : `${sec}s`;
}

export default function Header({ generatedAt, onRefresh, isRefreshing, cooldownSeconds }: HeaderProps) {
  const onCooldown = !!cooldownSeconds && cooldownSeconds > 0;
  const disabled = isRefreshing || onCooldown;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className="relative px-4 pt-3 pb-3 flex items-center justify-between">
        <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl border-b border-white/5" />

        {/* Logo */}
        <div className="relative flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Daily
            <span className="text-cyan ml-1" style={{ textShadow: '0 0 16px rgba(0,200,255,0.7)' }}>
              Brief
            </span>
          </h1>
          {generatedAt ? (
            <p className="text-[11px] text-slate-400 font-medium">
              {formatDate(generatedAt)} · {formatTime(generatedAt)}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">Wird geladen...</p>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={disabled}
          aria-label="News aktualisieren"
          className={`
            relative flex items-center gap-1.5 px-3 py-1.5 rounded-full
            text-xs font-semibold transition-all duration-200
            ${disabled
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-cyan/10 text-cyan hover:bg-cyan/20 active:scale-95'
            }
          `}
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin-slow' : ''} strokeWidth={2.5} />
          <span>
            {isRefreshing ? 'Lädt...' : onCooldown ? formatCooldown(cooldownSeconds!) : 'Refresh'}
          </span>
        </button>
      </div>
    </header>
  );
}
