import { useCallback, useEffect, useState } from 'react';

export type FlashToastVariant = 'error' | 'success' | 'info';

export type FlashToastState = { text: string; variant: FlashToastVariant };

/**
 * Fixed-duration message bar (use for approve/reject outcomes where inline Card errors are easy to miss).
 */
export function useFlashToast(durationMs = 8000) {
  const [flash, setFlash] = useState<FlashToastState | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), durationMs);
    return () => window.clearTimeout(t);
  }, [flash, durationMs]);

  const show = useCallback((text: string, variant: FlashToastVariant = 'info') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFlash({ text: trimmed, variant });
  }, []);

  const clear = useCallback(() => setFlash(null), []);

  return { flash, show, clear };
}
