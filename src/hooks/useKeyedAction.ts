import { useCallback, useRef, useState } from 'react';

import { graphQlUserMessage } from '../utils/graphqlUserMessage';

import { useFeedbackState } from './useFeedbackState';

/** Loading belongs to an operation, not every button in its containing page. */
export function useKeyedAction() {
  const pending = useRef(new Set<string>());
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [notice, setNotice] = useFeedbackState<string | null>(null, 'info');
  const run = useCallback(
    async (
      key: string,
      operation: () => Promise<void>,
      message: string,
      isCurrent: () => boolean = () => true
    ) => {
      if (pending.current.has(key)) return;
      pending.current.add(key);
      setBusyKeys(new Set(pending.current));
      setError(null);
      setNotice(null);
      try {
        await operation();
        if (message && isCurrent()) setNotice(message);
      } catch (cause) {
        if (isCurrent()) setError(graphQlUserMessage(cause));
      } finally {
        pending.current.delete(key);
        setBusyKeys(new Set(pending.current));
      }
    },
    [setError, setNotice]
  );
  return { run, isBusy: (key: string) => busyKeys.has(key), error, notice, setError };
}
