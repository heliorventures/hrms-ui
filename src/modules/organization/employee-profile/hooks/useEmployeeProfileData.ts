import { useCallback, useEffect, useRef, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';

import {
  EmployeePrivateProfileDocument,
  EmployeeProfileAccessDocument,
  type EmployeeProfileAccessQuery,
} from '../../../../api/graphql/graphql';
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
  access: NonNullable<EmployeeProfileAccessQuery['employeeProfileAccess']> | null;
  documentTypes: TenantDocumentTypeOption[];
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<EmployeeProfileModel | null>(null);
  const [access, setAccess] = useState<NonNullable<
    EmployeeProfileAccessQuery['employeeProfileAccess']
  > | null>(null);
  const [documentTypes, setDocumentTypes] = useState<TenantDocumentTypeOption[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const loadedEmployeeId = useRef<string | null>(null);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!employeeId) {
      setModel(null);
      setAccess(null);
      setDocumentTypes([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const initialLoad = loadedEmployeeId.current !== employeeId;
      if (initialLoad) setLoading(true);
      setError(null);
      try {
        const accessResult = await client.request(EmployeeProfileAccessDocument, {
          employeeId,
        });
        if (cancelled) return;
        const nextAccess = accessResult.employeeProfileAccess ?? null;
        setAccess(nextAccess);
        if (!nextAccess) {
          setModel(null);
          setDocumentTypes([]);
          setError('Employee not found');
          return;
        }
        if (!nextAccess.canViewPrivateProfile) {
          setModel(null);
          setDocumentTypes([]);
          return;
        }

        const result = await client.request(EmployeePrivateProfileDocument, { employeeId });
        if (cancelled) return;

        const base = mapBundleToEmployeeProfileModel(result);
        if (!base) {
          setModel(null);
          setAccess(null);
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
        if (!cancelled) {
          loadedEmployeeId.current = employeeId;
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, employeeId, reloadToken]);

  return { loading, error, model, access, documentTypes, refetch };
}
