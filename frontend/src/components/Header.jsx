import React from 'react';

export default function Header({ onRefresh, refreshing }) {
  return (
    <div style={styles.header}>
      <span style={styles.logo}>Slide</span>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        style={styles.refreshBtn}
        title="News aktualisieren"
        aria-label="News aktualisieren"
      >
        <span
          style={{
            display: 'inline-block',
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
          }}
        >
          ↻
        </span>
      </button>
    </div>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 'max(12px, calc(12px + var(--safe-top)))',
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 0,
    pointerEvents: 'none',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#ffffff',
    pointerEvents: 'all',
  },
  refreshBtn: {
    pointerEvents: 'all',
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  },
};
