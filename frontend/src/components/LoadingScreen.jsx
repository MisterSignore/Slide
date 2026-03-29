import React from 'react';

export default function LoadingScreen({ message = 'Lade News...' }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.logo}>Slide</div>
      <div style={styles.spinner} />
      <p style={styles.message}>{message}</p>
    </div>
  );
}

export function EmptyState({ onRefresh, refreshing }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.logo}>Slide</div>
      <p style={styles.emptyText}>Noch keine News für diese Kategorie.</p>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        style={styles.refreshBtn}
      >
        {refreshing ? 'Wird aktualisiert…' : 'News laden'}
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    background: '#0a0a0f',
    padding: 32,
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#ffffff',
    fontFamily: 'inherit',
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: 'rgba(255,255,255,0.6)',
    animation: 'spin 0.8s linear infinite',
  },
  message: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 1.6,
    maxWidth: 280,
  },
  emptyText: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  refreshBtn: {
    padding: '10px 24px',
    borderRadius: 100,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.07)',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
