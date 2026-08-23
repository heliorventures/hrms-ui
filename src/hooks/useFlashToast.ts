import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export type FlashToastTransientVariant = 'success' | 'info';
export type FlashToastVariant = 'error' | FlashToastTransientVariant;
export type FlashToastErrorOptions = { recoverableWithoutAction: true };

export type FlashToastState =
  | { text: string; variant: FlashToastTransientVariant }
  | { text: string; variant: 'error'; recoverableWithoutAction: true };

export type FlashToastShow = (
  ...args:
    | [text: string, variant?: FlashToastTransientVariant]
    | [text: string, variant: 'error', options: FlashToastErrorOptions]
) => void;

/**
 * Fixed-duration message bar (use for approve/reject outcomes where inline Card errors are easy to miss).
 */
export function useFlashToast(durationMs = 8000) {
  const [flash, setFlash] = useState<FlashToastState | null>(null);
  const timerRef = useRef<number | undefined>();
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const flashRef = useRef<FlashToastState | null>(null);
  const normalizedDurationMs = Object.is(durationMs, -0) ? 0 : durationMs;
  const durationRef = useRef(normalizedDurationMs);
  const durationIdentityRef = useRef(0);
  const renderedDurationRef = useRef(normalizedDurationMs);
  const previousDurationRef = useRef(normalizedDurationMs);

  if (!Object.is(renderedDurationRef.current, normalizedDurationMs)) {
    renderedDurationRef.current = normalizedDurationMs;
    durationIdentityRef.current += 1;
  }
  durationRef.current = normalizedDurationMs;

  const invalidateTimer = useCallback(() => {
    generationRef.current += 1;
    if (timerRef.current === undefined) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const scheduleExpiry = useCallback((toast: FlashToastState) => {
    const generation = generationRef.current;
    const durationIdentity = durationIdentityRef.current;
    timerRef.current = window.setTimeout(
      () => {
        if (
          !mountedRef.current ||
          generation !== generationRef.current ||
          durationIdentity !== durationIdentityRef.current ||
          flashRef.current !== toast
        ) {
          return;
        }

        generationRef.current += 1;
        timerRef.current = undefined;
        flashRef.current = null;
        setFlash(null);
      },
      Math.max(0, durationRef.current)
    );
  }, []);

  useLayoutEffect(() => {
    if (Object.is(previousDurationRef.current, normalizedDurationMs)) return;
    previousDurationRef.current = normalizedDurationMs;

    const currentFlash = flashRef.current;
    invalidateTimer();
    if (currentFlash && currentFlash.variant !== 'error') scheduleExpiry(currentFlash);
  }, [normalizedDurationMs, invalidateTimer, scheduleExpiry]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      invalidateTimer();
      flashRef.current = null;
    };
  }, [invalidateTimer]);

  const show = useCallback<FlashToastShow>(
    (...args) => {
      const [text, selectedVariant = 'info'] = args;
      const trimmed = text.trim();
      if (!trimmed) return;
      invalidateTimer();

      if (selectedVariant === 'error') {
        const errorOptions = args[2];
        if (errorOptions?.recoverableWithoutAction !== true) return;

        const nextFlash: FlashToastState = {
          text: trimmed,
          variant: 'error',
          recoverableWithoutAction: true,
        };
        flashRef.current = nextFlash;
        setFlash(nextFlash);
        return;
      }

      const nextFlash: FlashToastState = { text: trimmed, variant: selectedVariant };
      flashRef.current = nextFlash;
      setFlash(nextFlash);
      scheduleExpiry(nextFlash);
    },
    [invalidateTimer, scheduleExpiry]
  );

  const clear = useCallback(() => {
    invalidateTimer();
    flashRef.current = null;
    setFlash(null);
  }, [invalidateTimer]);

  return { flash, show, clear };
}
