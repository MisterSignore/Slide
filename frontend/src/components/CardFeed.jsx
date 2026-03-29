import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewsCard from './NewsCard.jsx';

/**
 * Full-screen card feed with CSS scroll-snap.
 * Each card snaps to fill the viewport.
 */
export default function CardFeed({ articles }) {
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  // Reset to top when articles change (category switch)
  useEffect(() => {
    setIndex(0);
  }, [articles]);

  const goTo = useCallback((nextIndex) => {
    if (transitioning) return;
    if (nextIndex < 0 || nextIndex >= articles.length) return;
    setTransitioning(true);
    setIndex(nextIndex);
    setTimeout(() => setTransitioning(false), 400);
  }, [articles.length, transitioning]);

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowUp')   goPrev();
      if (e.key === 'ArrowDown') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // Wheel / trackpad navigation
  useEffect(() => {
    let lastWheel = 0;
    const handler = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 600) return; // debounce
      lastWheel = now;
      if (e.deltaY > 20)       goNext();
      else if (e.deltaY < -20) goPrev();
    };
    const el = containerRef.current;
    el?.addEventListener('wheel', handler, { passive: false });
    return () => el?.removeEventListener('wheel', handler);
  }, [goNext, goPrev]);

  if (!articles.length) return null;

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Progress dots */}
      <div style={styles.progress}>
        {articles.slice(0, 20).map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              ...styles.dot,
              ...(i === index ? styles.dotActive : {}),
            }}
          />
        ))}
      </div>

      {/* Current card */}
      <div
        key={index}
        style={{
          ...styles.cardWrapper,
          animation: 'fadeUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
        }}
      >
        <NewsCard
          article={articles[index]}
          onSwipeUp={goNext}
          onSwipeDown={goPrev}
          isActive
        />
      </div>

      {/* Counter */}
      <div style={styles.counter}>
        {index + 1} / {articles.length}
      </div>

      {/* Arrow buttons (desktop) */}
      {index > 0 && (
        <button style={{ ...styles.arrow, ...styles.arrowUp }} onClick={goPrev} aria-label="Vorherige">
          ↑
        </button>
      )}
      {index < articles.length - 1 && (
        <button style={{ ...styles.arrow, ...styles.arrowDown }} onClick={goNext} aria-label="Nächste">
          ↓
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  cardWrapper: {
    position: 'absolute',
    inset: 0,
  },
  progress: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-50%)',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    pointerEvents: 'none',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    cursor: 'pointer',
    pointerEvents: 'all',
    transition: 'all 0.2s ease',
  },
  dotActive: {
    background: 'rgba(255,255,255,0.9)',
    height: 12,
    borderRadius: 2,
  },
  counter: {
    position: 'absolute',
    bottom: 'max(12px, calc(12px + var(--safe-bottom)))',
    right: 20,
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.2)',
    zIndex: 50,
    pointerEvents: 'none',
  },
  arrow: {
    position: 'absolute',
    right: 20,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  arrowUp: {
    top: 'calc(50% - 44px)',
  },
  arrowDown: {
    top: 'calc(50% + 8px)',
  },
};
