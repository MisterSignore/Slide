'use client';

import { useState } from 'react';
import { ExternalLink, Clock, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Story } from '@/types/news';

interface NewsCardProps {
  story: Story;
  index: number;
  categoryEmoji: string;
  categoryLabel: string;
}

const SENTIMENT_CONFIG = {
  positive: {
    label: 'Positiv',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    icon: TrendingUp,
  },
  neutral: {
    label: 'Neutral',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    icon: Minus,
  },
  negative: {
    label: 'Negativ',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    icon: TrendingDown,
  },
};

function formatReadTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

export default function NewsCard({ story, index, categoryEmoji, categoryLabel }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sentiment = SENTIMENT_CONFIG[story.sentiment] ?? SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentiment.icon;
  const hasUrl = story.url && story.url.startsWith('http');

  return (
    <article
      className="glass-card rounded-2xl overflow-hidden transition-all duration-300
                 hover:border-cyan/20 group animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4">
        {/* Top row: category badge + sentiment + read time */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
            <span>{categoryEmoji}</span>
            <span>{categoryLabel}</span>
          </span>

          <span
            className={`
              flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border
              ${sentiment.bg} ${sentiment.color} ${sentiment.border}
            `}
          >
            <SentimentIcon size={10} strokeWidth={2.5} />
            {sentiment.label}
          </span>

          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={10} strokeWidth={2.5} />
            {formatReadTime(story.read_time_seconds)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-cyan transition-colors duration-200">
          {story.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed">
          {story.summary}
        </p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-2.5 flex items-center justify-between
                   border-t border-white/5 hover:border-cyan/10
                   text-xs font-semibold text-slate-500 hover:text-cyan
                   transition-all duration-200 group/btn"
        aria-expanded={expanded}
      >
        <span>{expanded ? 'Weniger anzeigen' : 'Warum relevant?'}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      <div
        className={`story-expand overflow-hidden ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-4 pt-1 space-y-3">
          {/* Why it matters box */}
          <div className="flex gap-3 bg-cyan/5 border border-cyan/15 rounded-xl p-3.5">
            <span className="text-cyan text-lg leading-none mt-0.5">💡</span>
            <div>
              <p className="text-[11px] font-bold text-cyan uppercase tracking-wider mb-1">
                Relevanz für dich
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {story.why_it_matters}
              </p>
            </div>
          </div>

          {/* Source + link */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Quelle: <span className="text-slate-400">{story.source}</span>
            </span>
            {hasUrl && (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan
                           hover:text-white transition-colors px-2.5 py-1 rounded-lg
                           bg-cyan/10 hover:bg-cyan/20"
                onClick={(e) => e.stopPropagation()}
              >
                Artikel lesen
                <ExternalLink size={11} strokeWidth={2.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
