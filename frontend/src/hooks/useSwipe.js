import { useRef, useCallback } from 'react';

/**
 * Tracks touch gestures on a container element.
 * Returns { onTouchStart, onTouchEnd } handlers.
 *
 * onSwipeUp    – next card
 * onSwipeDown  – prev card
 * onTap        – quick tap (< 200ms, < 10px movement)
 */
export function useSwipe({ onSwipeUp, onSwipeDown, onTap, threshold = 50 }) {
  const touchStart = useRef(null);
  const touchTime  = useRef(0);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    touchTime.current  = Date.now();
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchStart.current) return;
    const t   = e.changedTouches[0];
    const dx  = t.clientX - touchStart.current.x;
    const dy  = t.clientY - touchStart.current.y;
    const dt  = Date.now() - touchTime.current;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dt < 250 && dist < 10) {
      onTap?.();
    } else if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) onSwipeUp?.();
      else        onSwipeDown?.();
    }

    touchStart.current = null;
  }, [onSwipeUp, onSwipeDown, onTap, threshold]);

  return { onTouchStart, onTouchEnd };
}
