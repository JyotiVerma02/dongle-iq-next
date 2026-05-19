import { useEffect, useRef } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum horizontal pixels to qualify as a swipe. Default: 60 */
  threshold?: number;
}

/**
 * Attaches touch-based swipe detection to the given element ref.
 * Fires onSwipeLeft / onSwipeRight when the horizontal delta exceeds threshold.
 */
export function useSwipeGesture<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { onSwipeLeft, onSwipeRight, threshold = 60 }: SwipeOptions
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      // Only count if horizontal movement dominates
      if (Math.abs(dx) < Math.abs(dy)) {
        touchStart.current = null;
        return;
      }

      if (dx > threshold && onSwipeRight) onSwipeRight();
      if (dx < -threshold && onSwipeLeft) onSwipeLeft();
      touchStart.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}
