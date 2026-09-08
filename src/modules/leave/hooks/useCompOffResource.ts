import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { authorizationStateKey } from '../../../auth/permissionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export function useCompOffOwnerKey() {
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  return `${currentTenant.id}|${authorizationStateKey(clientSession)}`;
}

export function useCompOffResource<T>(document: string, variables: Record<string, unknown>) {
  const client = useGraphClient('client');
  const ownerKey = useCompOffOwnerKey();
  const variablesKey = JSON.stringify(variables);
  const owner = useMemo(
    () => ({ client, ownerKey, document, variablesKey }),
    [client, ownerKey, document, variablesKey]
  );
  const currentOwner = useRef(owner);
  currentOwner.current = owner;
  const generation = useRef(0);
  const mutationOwner = useRef<object | null>(null);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    owner: object;
    data: T | null;
    error: string | null;
    loading: boolean;
    busy: boolean;
  }>({ owner, data: null, error: null, loading: true, busy: false });
  const current =
    state.owner === owner ? state : { owner, data: null, error: null, loading: true, busy: false };

  useEffect(() => {
    const request = ++generation.current;
    setState({ owner, data: null, error: null, loading: true, busy: false });
    client
      .request<T>(document, JSON.parse(variablesKey) as Record<string, unknown>)
      .then((data) => {
        if (request === generation.current)
          setState({ owner, data, error: null, loading: false, busy: false });
      })
      .catch((error: unknown) => {
        if (request === generation.current)
          setState({
            owner,
            data: null,
            error: graphQlUserMessage(error),
            loading: false,
            busy: false,
          });
      });
    return () => {
      generation.current += 1;
    };
  }, [client, document, owner, revision, variablesKey]);

  const mutate = useCallback(
    async (mutation: string, input: Record<string, unknown>) => {
      if (mutationOwner.current === owner) return false;
      mutationOwner.current = owner;
      const request = ++generation.current;
      setState((previous) => ({ ...previous, busy: true, error: null }));
      try {
        await client.request(mutation, input);
        if (currentOwner.current !== owner || generation.current !== request) return false;
        setRevision((value) => value + 1);
        return true;
      } catch (error) {
        if (currentOwner.current === owner && generation.current === request)
          setState((previous) => ({ ...previous, busy: false, error: graphQlUserMessage(error) }));
        return false;
      } finally {
        if (mutationOwner.current === owner) mutationOwner.current = null;
      }
    },
    [client, owner]
  );
  return { ...current, mutate, reload: () => setRevision((value) => value + 1) };
}
