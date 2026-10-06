import { useEffect, useRef, useState } from 'react';

import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export const useCompanyMutation = () => {
  const client = useGraphClient('client');
  const auth = useAuth();
  const identity = JSON.stringify([
    auth.tenantId,
    auth.user?.id,
    authorizationStateKey(auth.clientSession),
  ]);
  const current = useRef({ client, identity });
  const mounted = useRef(false);
  const lock = useRef(false);
  if (current.current.client !== client || current.current.identity !== identity)
    current.current = { client, identity };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    lock.current = false;
    setBusy(false);
    setError(null);
  }, [client, identity]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function run<T>(document: string, variables: Record<string, unknown>): Promise<T | null> {
    if (
      !mounted.current ||
      lock.current ||
      current.current.client !== client ||
      current.current.identity !== identity
    )
      return null;
    lock.current = true;
    setBusy(true);
    setError(null);
    const owner = current.current;
    try {
      const data = await client.request<T>(document, variables);
      return mounted.current && current.current === owner ? data : null;
    } catch (failure) {
      if (mounted.current && current.current === owner) setError(graphQlUserMessage(failure));
      return null;
    } finally {
      if (mounted.current && current.current === owner) {
        lock.current = false;
        setBusy(false);
      }
    }
  }
  return { run, busy, error, setError };
};
