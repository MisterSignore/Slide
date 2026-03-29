import React from 'react';

const CATEGORY_ORDER = ['all', 'politik', 'wirtschaft', 'tech', 'faszinierend', 'fun'];

export default function CategoryBar({ active, onChange, categoryMeta }) {
  if (!categoryMeta) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.track}>
        {CATEGORY_ORDER.map((cat) => {
          const meta = categoryMeta[cat];
          if (!meta) return null;
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              style={{
                ...styles.pill,
                ...(isActive ? {
                  background: `${meta.color}22`,
                  borderColor: meta.color,
                  color: meta.color,
                  fontWeight: 700,
                } : {}),
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    top: 'var(--safe-top)',
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'linear-gradient(to bottom, rgba(10,10,15,0.95) 80%, transparent)',
    paddingTop: 12,
    paddingBottom: 8,
  },
  track: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingLeft: 16,
    paddingRight: 16,
    scrollbarWidth: 'none',
  },
  pill: {
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: 100,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.82rem',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
  },
};
