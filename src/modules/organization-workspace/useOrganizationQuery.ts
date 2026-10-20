import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { OrganizationAccessContext } from './organizationAccessContext';
import { organizationAccessDenied } from './organizationAccessError';
import { organizationUserMessage } from './organizationDataError';

interface QueryState<T> {
  owner: string | null;
  revision: number;
  data: T | null;
  error: string | null;
  loading: boolean;
  denied: boolean;
}

/** Memory only. Ownership includes the source session, organization and business company. */
export function useOrganizationQuery<T>(owner: string | null, load: () => Promise<T>) {
  const revalidateAccess = useContext(OrganizationAccessContext);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<QueryState<T>>({
    owner: null,
    revision: -1,
    data: null,
    error: null,
    loading: false,
    denied: false,
  });
  const loader = useRef(load);
  loader.current = load;
  useEffect(() => {
    if (!owner) return;
    let current = true;
    setState({ owner, revision, data: null, error: null, loading: true, denied: false });
    void loader.current().then(
      (data) => {
        if (current)
          setState({ owner, revision, data, error: null, loading: false, denied: false });
      },
      (error: unknown) => {
        if (current) {
          setState({
            owner,
            revision,
            data: null,
            error: organizationUserMessage(error),
            loading: false,
            denied: organizationAccessDenied(error),
          });
          if (organizationAccessDenied(error)) revalidateAccess?.();
        }
      }
    );
    return () => {
      current = false;
    };
  }, [owner, revision, revalidateAccess]);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const visible = owner !== null && state.owner === owner && state.revision === revision;
  return {
    data: visible ? state.data : null,
    error: visible ? state.error : null,
    loading: owner !== null && (!visible || state.loading),
    refresh,
    denied: visible && state.denied,
  };
}
