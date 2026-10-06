import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { authorizationStateKey } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export const useCompanyResource = <T, V extends Record<string, unknown>>(
  document: TypedDocumentNode<T, V>,
  variables: V
) => {
  const client = useGraphClient('client');
  const auth = useAuth();
  const key = JSON.stringify([
    auth.tenantId,
    auth.user?.id,
    authorizationStateKey(auth.clientSession),
    document,
    variables,
  ]);
  const owner = useRef({ client, key, variables });
  if (owner.current.client !== client || owner.current.key !== key)
    owner.current = { client, key, variables };
  const [state, setState] = useState<{ owner: typeof owner.current; data?: T; error?: string }>();
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const current = owner.current;
    let cancelled = false;
    setState(undefined);
    void current.client
      .request<T, Record<string, unknown>>(document, current.variables)
      .then((data) => {
        if (!cancelled && owner.current === current) setState({ owner: current, data });
      })
      .catch((error) => {
        if (!cancelled && owner.current === current)
          setState({ owner: current, error: graphQlUserMessage(error) });
      });
    return () => {
      cancelled = true;
    };
    // key contains all variables and authorization identity.
  }, [client, document, key, revision]);
  return {
    client,
    reload,
    data: state?.owner === owner.current ? state.data : undefined,
    error: state?.owner === owner.current ? state.error : undefined,
    loading: state?.owner !== owner.current,
  };
};
