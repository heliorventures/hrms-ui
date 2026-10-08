import { useCallback, useRef, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export const useAdministrationActionState = () => {
  const pending = useRef(new Set<string>());
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());
  const [message, setMessage] = useState<{ kind: 'error' | 'notice'; text: string } | null>(null);
  const runAction = useCallback(
    async (
      key: string,
      operation: () => Promise<void>,
      notice: string,
      isCurrent: () => boolean = () => true
    ) => {
      if (pending.current.has(key)) return false;
      pending.current.add(key);
      setBusyKeys(new Set(pending.current));
      setMessage(null);
      try {
        await operation();
        if (isCurrent()) setMessage({ kind: 'notice', text: notice });
        return true;
      } catch (cause) {
        if (isCurrent()) setMessage({ kind: 'error', text: graphQlUserMessage(cause) });
        return false;
      } finally {
        pending.current.delete(key);
        setBusyKeys(new Set(pending.current));
      }
    },
    []
  );
  return { isBusy: (key: string) => busyKeys.has(key), message, runAction, setMessage };
};
