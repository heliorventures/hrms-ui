import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { graphQlUserMessage } from '../utils/graphqlUserMessage';

export type RetainedQueryPhase =
  | 'initial-loading'
  | 'initial-error'
  | 'ready'
  | 'refreshing'
  | 'stale-error';

export interface RetainedQueryResult<T> {
  data: T | null;
  error: string | null;
  phase: RetainedQueryPhase;
  refresh: () => Promise<void>;
  refreshChecked: () => Promise<void>;
}

interface RetainedQueryState<T> {
  data: T | null;
  error: string | null;
  hasData: boolean;
  owner: () => Promise<T>;
  phase: RetainedQueryPhase;
}

function initialState<T>(owner: () => Promise<T>): RetainedQueryState<T> {
  return {
    data: null,
    error: null,
    hasData: false,
    owner,
    phase: 'initial-loading',
  };
}

function loadingState<T>(
  current: RetainedQueryState<T>,
  owner: () => Promise<T>
): RetainedQueryState<T> {
  if (current.hasData && current.owner === owner) {
    return { ...current, error: null, phase: 'refreshing' };
  }

  return initialState(owner);
}

function failedState<T>(
  current: RetainedQueryState<T>,
  owner: () => Promise<T>,
  error: string
): RetainedQueryState<T> {
  if (current.hasData && current.owner === owner) {
    return { ...current, error, phase: 'stale-error' };
  }

  return {
    data: null,
    error,
    hasData: false,
    owner,
    phase: 'initial-error',
  };
}

function userMessage(toMessage: (error: unknown) => string, error: unknown): string {
  try {
    return toMessage(error);
  } catch {
    return graphQlUserMessage(error);
  }
}

export function useRetainedQuery<T>(
  load: () => Promise<T>,
  toMessage: (error: unknown) => string = graphQlUserMessage
): RetainedQueryResult<T> {
  const [state, setState] = useState<RetainedQueryState<T>>(() => initialState(load));
  const loadRef = useRef(load);
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const stateRef = useRef(state);
  const toMessageRef = useRef(toMessage);

  loadRef.current = load;
  toMessageRef.current = toMessage;

  const publish = useCallback((next: RetainedQueryState<T>) => {
    stateRef.current = next;
    if (mountedRef.current) setState(next);
  }, []);

  const runRefresh = useCallback(async (checked: boolean) => {
    const requestId = ++requestIdRef.current;
    const { current: requestLoad } = loadRef;
    const { current } = stateRef;
    publish(loadingState(current, requestLoad));

    try {
      const data = await requestLoad();
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        if (checked) throw new Error('The active view changed. Reload current records.');
        return;
      }
      publish({ data, error: null, hasData: true, owner: requestLoad, phase: 'ready' });
    } catch (error) {
      const message = userMessage(toMessageRef.current, error);
      if (mountedRef.current && requestId === requestIdRef.current)
        publish(failedState(stateRef.current, requestLoad, message));
      if (checked) throw new Error(message);
    }
  }, [publish]);
  const refresh = useCallback(() => runRefresh(false), [runRefresh]);
  const refreshChecked = useCallback(() => runRefresh(true), [runRefresh]);

  useLayoutEffect(() => {
    requestIdRef.current += 1;
    publish(initialState(load));
  }, [load, publish]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [load, refresh]);

  const visibleState = state.owner === load ? state : initialState(load);
  return {
    data: visibleState.data,
    error: visibleState.error,
    phase: visibleState.phase,
    refresh,
    refreshChecked,
  };
}
