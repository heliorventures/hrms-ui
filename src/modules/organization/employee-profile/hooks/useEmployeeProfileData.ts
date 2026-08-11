import { useCallback, useEffect, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';

import { EmployeeProfileBundleDocument } from '../../../../api/graphql/graphql';
import type { EmployeeProfileModel, TenantDocumentTypeOption } from '../types';
import { mapBundleToEmployeeProfileModel } from '../lib/mapBundleToModel';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

export function useEmployeeProfileData(
  client: GraphQLClient,
  employeeId: string | undefined
): {
  loading: boolean;
  error: string | null;
  model: EmployeeProfileModel | null;
  documentTypes: TenantDocumentTypeOption[];
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<EmployeeProfileModel | null>(null);
  const [documentTypes, setDocumentTypes] = useState<TenantDocumentTypeOption[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!employeeId) {
      setModel(null);
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.request(EmployeeProfileBundleDocument, {
          employeeId,
        });
        if (cancelled) return;

        const base = mapBundleToEmployeeProfileModel(result);
        if (!base) {
          setModel(null);
          setDocumentTypes([]);
          setError('Employee not found');
          return;
        }

        setModel(base);
        setDocumentTypes(result.documentTypes ?? []);
      } catch (e) {
        if (!cancelled) {
          setModel(null);
          setDocumentTypes([]);
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, employeeId, reloadToken]);

  return { loading, error, model, documentTypes, refetch };
}
