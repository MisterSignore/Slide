'use client';

import { useState } from 'react';
import { ExternalLink, Clock, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Story } from '@/types/news';

interface NewsCardProps {
  story: Story;
  index: number;
  categoryId: string;
  categoryEmoji: string;
  categoryLabel: string;
}

const CAT_COLORS: Record<string, { accent: string; glow: string; badge: string }> = {
  wirtschaft:    { accent: '#00C8FF', glow: 'rgba(0,200,255,0.1)',    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' },
  politik:       { accent: '#818CF8', glow: 'rgba(129,140,248,0.1)',  badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' },
  international: { accent: '#34D399', glow: 'rgba(52,211,153,0.1)',   badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  tech_ai:       { accent: '#F472B6', glow: 'rgba(244,114,182,0.1)',  badge: 'bg-pink-500/15 text-pink-300 border-pink-500/20' },
  fun_trends:    { accent: '#FBBF24', glow: 'rgba(251,191,36,0.1)',   badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20' },
};

const SENTIMENT_CONFIG = {
  positive: { label: 'Positiv', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: TrendingUp },
  neutral:  { label: 'Neutral', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/15', icon: Minus },
  negative: { label: 'Negativ', color: 'text-red-400',   bg: 'bg-red-400/10 border-red-400/20',     icon: TrendingDown },
};

function formatReadTime(s: number) {
  return s < 60 ? `${s}s` : `${Math.round(s / 60)} min`;
}

export default function NewsCard({ story, index, categoryId, categoryEmoji, categoryLabel }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cat = CAT_COLORS[categoryId] ?? CAT_COLORS.wirtschaft;
  const sentiment = SENTIMENT_CONFIG[story.sentiment] ?? SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentiment.icon;
  const hasUrl = story.url?.startsWith('http');

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all duration-300 animate-fade-up"
      style={{
        animationDelay: `${Math.min(index * 50, 400)}ms`,
        animationFillMode: 'both',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
        border: expanded ? `1px solid ${cat.accent}33` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: expanded ? `0 8px 32px ${cat.glow}` : '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${cat.accent}, transparent 80%)` }} />

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cat.badge}`}>
            {categoryEmoji} {categoryLabel}
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sentiment.bg} ${sentiment.color}`}>
            <SentimentIcon size={10} strokeWidth={2.5} />
            {sentiment.label}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={10} strokeWidth={2.5} />
            {formatReadTime(story.read_time_seconds)}
          </span>
        </div>

        <h2 className="text-[15px] font-bold leading-snug mb-2.5 transition-colors duration-200"
          style={{ color: expanded ? cat.accent : 'white' }}>
          {story.title}
        </h2>

        <p className="text-[13px] text-slate-300 leading-relaxed">{story.summary}</p>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center justify-between border-t border-white/5 transition-all duration-200"
        style={{ background: expanded ? `${cat.accent}08` : undefined }}
        aria-expanded={expanded}
      >
        <span className="text-xs font-semibold transition-colors duration-200"
          style={{ color: expanded ? cat.accent : '#64748b' }}>
          {expanded ? 'Weniger anzeigen' : '💡 Warum relevant?'}
        </span>
        <ChevronDown size={14} strokeWidth={2.5}
          className="transition-transform duration-300"
          style={{ color: cat.accent, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-72' : 'max-h-0'}`}>
        <div className="px-4 pb-4 pt-2 space-y-3">
          <div className="flex gap-3 rounded-xl p-3"
            style={{ background: `${cat.accent}10`, border: `1px solid ${cat.accent}22` }}>
            <span className="text-base leading-none mt-0.5">💡</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.accent }}>
                Relevanz für dich
              </p>
              <p className="text-[13px] text-slate-300 leading-relaxed">{story.why_it_matters}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Quelle: <span className="text-slate-400 font-medium">{story.source}</span>
            </span>
            {hasUrl && (
              <a href={story.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ color: cat.accent, background: `${cat.accent}15` }}
                onClick={(e) => e.stopPropagation()}>
                Artikel lesen <ExternalLink size={10} strokeWidth={2.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
