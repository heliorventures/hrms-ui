import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { ActiveTour, TourContext, TourDefinition } from './tourTypes';

type Options = {
  contextKey: string;
  tourContext?: Omit<TourContext, 'routePath'>;
  onOverviewDismiss?: () => void | Promise<void>;
  onOverviewDismissError?: (error: unknown) => void;
};

export function useTourController({
  contextKey,
  tourContext,
  onOverviewDismiss,
  onOverviewDismissError,
}: Options) {
  const [activeTour, setActiveTour] = useState<ActiveTour | null>(null);
  const activeTourRef = useRef<ActiveTour | null>(null);
  const allowedContext = useRef<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const callbacks = useRef({ onOverviewDismiss, onOverviewDismissError });
  callbacks.current = { onOverviewDismiss, onOverviewDismissError };
  const previousContext = useRef({
    contextKey,
    canPermission: tourContext?.canPermission,
    canCapability: tourContext?.canCapability,
    canScopedPermission: tourContext?.canScopedPermission,
  });

  useLayoutEffect(() => {
    const nextContext = {
      contextKey,
      canPermission: tourContext?.canPermission,
      canCapability: tourContext?.canCapability,
      canScopedPermission: tourContext?.canScopedPermission,
    };
    const previous = previousContext.current;
    if (
      previous.contextKey === nextContext.contextKey &&
      previous.canPermission === nextContext.canPermission &&
      previous.canCapability === nextContext.canCapability &&
      previous.canScopedPermission === nextContext.canScopedPermission
    )
      return;
    previousContext.current = nextContext;
    if (
      allowedContext.current === nextContext.contextKey &&
      previous.canCapability === nextContext.canCapability &&
      previous.canScopedPermission === nextContext.canScopedPermission &&
      previous.canPermission === nextContext.canPermission
    ) {
      allowedContext.current = null;
      return;
    }
    allowedContext.current = null;
    returnFocusRef.current = null;
    activeTourRef.current = null;
    setActiveTour(null);
  }, [
    contextKey,
    tourContext?.canPermission,
    tourContext?.canCapability,
    tourContext?.canScopedPermission,
  ]);

  const closeTour = useCallback(() => {
    const current = activeTourRef.current;
    if (!current) return;
    activeTourRef.current = null;
    setActiveTour(null);
    if (current.kind !== 'overview' || !current.persistDismissalOnClose) return;
    try {
      void Promise.resolve(callbacks.current.onOverviewDismiss?.()).catch((error: unknown) => {
        callbacks.current.onOverviewDismissError?.(error);
      });
    } catch (error) {
      callbacks.current.onOverviewDismissError?.(error);
    }
  }, []);

  const startTour = useCallback(
    (definition: TourDefinition, kind: ActiveTour['kind'], persistDismissalOnClose = false) => {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const next = { definition, kind, persistDismissalOnClose };
      activeTourRef.current = next;
      setActiveTour(next);
      return true;
    },
    []
  );

  const allowContextChange = useCallback((key: string) => {
    allowedContext.current = key;
  }, []);
  return { activeTour, returnFocusRef, closeTour, startTour, allowContextChange };
}
