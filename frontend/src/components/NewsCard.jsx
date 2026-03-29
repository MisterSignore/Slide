import React, { useState, useCallback } from 'react';
import { useSwipe } from '../hooks/useSwipe.js';

const CATEGORY_COLORS = {
  politik:      '#4a9eff',
  wirtschaft:   '#00d4aa',
  tech:         '#a855f7',
  faszinierend: '#f97316',
  fun:          '#facc15',
};

const CATEGORY_GRADIENTS = {
  politik:      ['#050d1a', '#0b1f3d'],
  wirtschaft:   ['#051512', '#0a2d26'],
  tech:         ['#0d0519', '#1a0a3d'],
  faszinierend: ['#160800', '#2d1400'],
  fun:          ['#100e00', '#201c00'],
};

const CATEGORY_LABELS = {
  politik:      'Politik',
  wirtschaft:   'Wirtschaft',
  tech:         'Tech & AI',
  faszinierend: 'Faszinierend',
  fun:          'Fun',
};

// Background pattern based on keyword
function CardBackground({ keyword, category }) {
  const color = CATEGORY_COLORS[category] ?? '#4a9eff';
  const [g1, g2] = CATEGORY_GRADIENTS[category] ?? ['#050d1a', '#0a1a2e'];

  return (
    <div style={{ ...styles.bg, background: `linear-gradient(160deg, ${g1} 0%, ${g2} 100%)` }}>
      {/* Decorative blobs */}
      <div style={{ ...styles.blob, background: color, top: '10%', right: '-15%', opacity: 0.12 }} />
      <div style={{ ...styles.blob, background: color, bottom: '20%', left: '-20%', opacity: 0.07, width: 300, height: 300 }} />
    </div>
  );
}

export default function NewsCard({ article, onSwipeUp, onSwipeDown, isActive }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[article.category] ?? '#4a9eff';

  const handleTap = useCallback(() => {
    setExpanded((e) => !e);
  }, []);

  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeUp,
    onSwipeDown,
    onTap: handleTap,
  });

  // Also handle keyboard for desktop
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp')   onSwipeUp?.();
    if (e.key === 'ArrowDown') onSwipeDown?.();
    if (e.key === 'Enter' || e.key === ' ') handleTap();
  }, [onSwipeUp, onSwipeDown, handleTap]);

  if (!article) return null;

  return (
    <div
      style={styles.card}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      role="article"
      aria-label={article.title}
    >
      <CardBackground keyword={article.image_keyword} category={article.category} />

      {/* Content */}
      <div style={styles.content}>
        {/* Category badge */}
        <div style={{ ...styles.badge, background: `${color}22`, borderColor: `${color}55`, color }}>
          {CATEGORY_LABELS[article.category] ?? article.category}
        </div>

        {/* Headline */}
        <h1 style={styles.headline} className="animate-fade-up">
          {article.title}
        </h1>

        {/* Source + date */}
        <p style={styles.meta}>
          {article.source_name}
          {article.published_date && (
            <> · {formatDate(article.published_date)}</>
          )}
        </p>

        {/* Expandable detail */}
        <div
          style={{
            ...styles.detail,
            maxHeight: expanded ? 500 : 0,
            opacity: expanded ? 1 : 0,
          }}
        >
          <p style={styles.summary}>{article.summary}</p>

          {article.why_it_matters && (
            <div style={{ ...styles.whyBox, borderColor: `${color}44`, background: `${color}11` }}>
              <span style={{ ...styles.whyLabel, color }}>Warum das wichtig ist</span>
              <p style={styles.whyText}>{article.why_it_matters}</p>
            </div>
          )}

          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.readMore, borderColor: `${color}55`, color }}
              onClick={(e) => e.stopPropagation()}
            >
              Artikel lesen →
            </a>
          )}
        </div>

        {/* Tap hint */}
        {!expanded && (
          <div style={styles.tapHint}>
            <span style={{ ...styles.tapDot, background: color }} />
            <span style={styles.tapText}>Tippen für mehr</span>
          </div>
        )}

        {/* Swipe hint at bottom */}
        <div style={styles.swipeHint}>
          <div style={{ ...styles.swipeBar, background: color }} />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600)  return `vor ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `vor ${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

const styles = {
  card: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 24px 40px',
    paddingBottom: 'max(40px, calc(40px + var(--safe-bottom)))',
    paddingTop: 'calc(80px + var(--safe-top))',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
  },
  badge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '4px 10px',
    borderRadius: 100,
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  headline: {
    fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#ffffff',
    marginBottom: 10,
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
  },
  meta: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 16,
    letterSpacing: '0.02em',
  },
  detail: {
    overflow: 'hidden',
    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  summary: {
    fontSize: '0.95rem',
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.85)',
  },
  whyBox: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  whyLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  whyText: {
    fontSize: '0.88rem',
    lineHeight: 1.55,
    color: 'rgba(255,255,255,0.8)',
  },
  readMore: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '8px 16px',
    borderRadius: 100,
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: 600,
    textDecoration: 'none',
    marginTop: 4,
    transition: 'background 0.2s',
  },
  tapHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tapDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
    animation: 'pulse 2s infinite',
  },
  tapText: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.03em',
  },
  swipeHint: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
  },
  swipeBar: {
    width: 36,
    height: 3,
    borderRadius: 2,
    opacity: 0.4,
  },
};
