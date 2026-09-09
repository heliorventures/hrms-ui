import { useCallback, useRef, useState } from 'react';

import { graphQlUserMessage } from '../utils/graphqlUserMessage';

/** Loading belongs to an operation, not every button in its containing page. */
export function useKeyedAction() {
  const pending = useRef(new Set<string>());
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const run = useCallback(async (key: string, operation: () => Promise<void>, message: string) => {
    if (pending.current.has(key)) return;
    pending.current.add(key);
    setBusyKeys(new Set(pending.current));
    setError(null);
    setNotice(null);
    try {
      await operation();
      if (message) setNotice(message);
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      pending.current.delete(key);
      setBusyKeys(new Set(pending.current));
    }
  }, []);
  return { run, isBusy: (key: string) => busyKeys.has(key), error, notice, setError };
}
