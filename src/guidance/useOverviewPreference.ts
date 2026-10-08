import { useCallback, useEffect, useRef, useState } from 'react';

import { useGraphClient } from '../hooks/useGraphClient';

import { dismissMyApplicationOverview, loadMyGuidanceState } from './guidanceClient';
import type { OverviewReadState, PreferenceErrorOperation } from './overviewPreferenceTypes';

export function useOverviewPreference(identityKey: string | null) {
  const client = useGraphClient('client');
  const entriesRef = useRef(new Map<string, OverviewReadState>());
  const [entries, setEntries] = useState<ReadonlyMap<string, OverviewReadState>>(new Map());
  const [preferenceErrors, setPreferenceErrors] = useState<
    ReadonlyMap<string, PreferenceErrorOperation>
  >(new Map());
  const [savingIdentityKey, setSavingIdentityKey] = useState<string | null>(null);
  const automaticOverviewKeysRef = useRef(new Set<string>());
  const dismissalRequestsRef = useRef(new Map<string, Promise<void>>());

  const storeReadState = useCallback((key: string, state: OverviewReadState) => {
    entriesRef.current.set(key, state);
    setEntries(new Map(entriesRef.current));
  }, []);

  const setPreferenceError = useCallback(
    (key: string, operation: PreferenceErrorOperation | null) => {
      setPreferenceErrors((current) => {
        const next = new Map(current);
        if (operation) next.set(key, operation);
        else next.delete(key);
        return next;
      });
    },
    []
  );

  const readState = useCallback(
    async (key: string) => {
      storeReadState(key, { status: 'loading' });
      setPreferenceError(key, null);
      try {
        const dismissedAt = await loadMyGuidanceState(client);
        storeReadState(key, { status: 'ready', dismissedAt });
      } catch {
        storeReadState(key, { status: 'error' });
        setPreferenceError(key, 'read');
      }
    },
    [client, setPreferenceError, storeReadState]
  );

  useEffect(() => {
    if (!identityKey || entriesRef.current.has(identityKey)) return;
    void readState(identityKey);
  }, [identityKey, readState]);

  const currentState = identityKey ? entries.get(identityKey) : undefined;
  const persistDismissal = useCallback((): Promise<void> => {
    if (!identityKey) return Promise.resolve();
    const pending = dismissalRequestsRef.current.get(identityKey);
    if (pending) return pending;

    setSavingIdentityKey(identityKey);
    const request = dismissMyApplicationOverview(client)
      .then((dismissedAt) => {
        storeReadState(identityKey, { status: 'ready', dismissedAt });
        setPreferenceError(identityKey, null);
      })
      .catch((error: unknown) => {
        setPreferenceError(identityKey, 'dismiss');
        throw error;
      })
      .finally(() => {
        dismissalRequestsRef.current.delete(identityKey);
        setSavingIdentityKey((current) => (current === identityKey ? null : current));
      });
    dismissalRequestsRef.current.set(identityKey, request);
    return request;
  }, [client, identityKey, setPreferenceError, storeReadState]);

  const dismissalSaving = savingIdentityKey === identityKey;
  const activeError = identityKey ? (preferenceErrors.get(identityKey) ?? null) : null;
  const retryPreference = () => {
    if (!identityKey || dismissalSaving) return;
    if (activeError === 'read') {
      void readState(identityKey);
    } else if (activeError === 'dismiss') {
      void persistDismissal().catch(() => undefined);
    }
  };

  const clearPreferenceError = () => {
    if (identityKey) setPreferenceError(identityKey, null);
  };
  return {
    currentState,
    automaticOverviewKeysRef,
    persistDismissal,
    dismissalSaving,
    activeError,
    retryPreference,
    clearPreferenceError,
  };
}
