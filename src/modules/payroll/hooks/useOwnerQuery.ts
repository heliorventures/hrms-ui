import { useEffect, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export function useOwnerQuery<T>(ownerKey: string, enabled: boolean, load: () => Promise<T>) {
  const [state, setState] = useState<{
    owner: string;
    value: T | null;
    loading: boolean;
    error: string | null;
  }>({ owner: '', value: null, loading: false, error: null });
  useEffect(() => {
    const controller = new AbortController();
    if (!enabled) {
      setState({ owner: ownerKey, value: null, loading: false, error: null });
      return;
    }
    setState({ owner: ownerKey, value: null, loading: true, error: null });
    void load()
      .then((value) => {
        if (!controller.signal.aborted)
          setState({ owner: ownerKey, value, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            owner: ownerKey,
            value: null,
            loading: false,
            error: graphQlUserMessage(error),
          });
      });
    return () => controller.abort();
  }, [enabled, load, ownerKey]);
  return enabled && state.owner === ownerKey
    ? state
    : { value: null, loading: enabled, error: null };
}
