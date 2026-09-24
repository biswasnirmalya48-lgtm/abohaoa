import { useEffect, useRef, useState } from "react";

const THRESHOLD = 76;
const MAX_PULL = 130;

/**
 * Touch-based pull-to-refresh. Only engages when the page cannot scroll up
 * further and the gesture is mostly vertical.
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, enabled: boolean) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const pulling = useRef(false);
  const lockedVertical = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-no-pull]")) return;
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      pulling.current = true;
      lockedVertical.current = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      const dx = e.touches[0].clientX - startX.current;
      if (!lockedVertical.current) {
        if (Math.abs(dx) > Math.abs(dy)) {
          pulling.current = false; // horizontal swipe — let city switching handle it
          return;
        }
        if (Math.abs(dy) > 8) lockedVertical.current = true;
      }
      if (dy > 0) {
        setPull(Math.min(dy * 0.5, MAX_PULL));
        if (e.cancelable) e.preventDefault();
      }
    };

    const onEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      const triggered = pullRef.current > THRESHOLD;
      setPull(0);
      if (triggered && !refreshRef.current) {
        setRefreshing(true);
        refreshRef.current = true;
        try {
          await onRefresh();
        } finally {
          refreshRef.current = false;
          setRefreshing(false);
        }
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [enabled, onRefresh, refreshing]);

  const pullRef = useRef(pull);
  const refreshRef = useRef(refreshing);
  pullRef.current = pull;
  refreshRef.current = refreshing;

  return { pull, refreshing: refreshing || pull > 0 };
}
