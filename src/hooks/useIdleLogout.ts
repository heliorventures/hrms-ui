import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

/**
 * Resets an idle timer on user activity; calls `onIdle` after `timeoutMs` with no activity.
 * For tenant client app only (see `AppLayout`).
 */
export function useIdleLogout(options: {
  enabled: boolean;
  timeoutMs: number;
  onIdle: () => void;
}): void {
  const { enabled, timeoutMs, onIdle } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    const clearTimer = () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const arm = () => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onIdleRef.current();
      }, timeoutMs);
    };

    arm();

    const bump = () => arm();
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, bump, { passive: true });
    }
    const onVis = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearTimer();
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, bump);
      }
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [enabled, timeoutMs]);
}
