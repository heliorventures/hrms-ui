import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EmployeeProfileAccessDocument,
  PayrollEmploymentHistoryDocument,
  type EmployeeProfileAccessQuery,
  type PayrollEmploymentHistoryQuery,
} from '../../../../api/graphql/graphql';
import { useProfileGuidanceOwner } from '../../../../guidance/ProfileGuidanceContext';
import { useFeedbackState } from '../../../../hooks/useFeedbackState';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';
import { mapBundleToEmployeeProfileModel } from '../lib/mapBundleToModel';
import {
  EmployeePrivateProfileLocationDocument,
  type EmployeeProfileLocationQuery,
} from '../profileDocuments';
import type { EmployeeProfileModel, TenantDocumentTypeOption } from '../types';

type EmployeeProfileDataResult = {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  model: EmployeeProfileModel | null;
  access: NonNullable<EmployeeProfileAccessQuery['employeeProfileAccess']> | null;
  documentTypes: TenantDocumentTypeOption[];
  refreshVersion: number;
  refetch: () => void;
};
export function useEmployeeProfileData(
  client: GraphQLClient,
  employeeId: string | undefined
): EmployeeProfileDataResult {
  const authorizationOwner = useProfileGuidanceOwner();
  const owner = useMemo(
    () => ({ client, employeeId, authorizationOwner }),
    [client, employeeId, authorizationOwner]
  );
  const [accessOwner, setAccessOwner] = useState<typeof owner | null>(null);
  const [modelOwner, setModelOwner] = useState<typeof owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
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
      else setRefreshing(true);
      setError(null);
      try {
        const accessResult = await client.request(EmployeeProfileAccessDocument, {
          employeeId,
        });
        if (cancelled) return;
        const nextAccess = accessResult.employeeProfileAccess ?? null;
        setAccess(nextAccess);
        setAccessOwner(owner);
        if (!nextAccess) {
          if (initialLoad) {
            setModel(null);
            setDocumentTypes([]);
          }
          setError('Employee not found');
          return;
        }
        if (!nextAccess.canViewPrivateProfile) {
          setModel(null);
          setDocumentTypes([]);
          return;
        }

        const canViewPayrollSensitive = nextAccess.canViewPayrollSensitive;
        const [result, payrollResult] = await Promise.all([
          client.request<EmployeeProfileLocationQuery>(EmployeePrivateProfileLocationDocument, {
            employeeId,
          }),
          canViewPayrollSensitive
            ? client.request(PayrollEmploymentHistoryDocument, { employeeId })
            : Promise.resolve({
                employmentHistoryRecords: [],
              } satisfies PayrollEmploymentHistoryQuery),
        ]);
        if (cancelled) return;

        const base = mapBundleToEmployeeProfileModel(
          result,
          payrollResult.employmentHistoryRecords
        );
        if (!base) {
          if (initialLoad) {
            setModel(null);
            setAccess(null);
            setDocumentTypes([]);
          }
          setError('Employee not found');
          return;
        }

        setModel(base);
        setModelOwner(owner);
        setDocumentTypes(result.documentTypes ?? []);
      } catch (e) {
        if (!cancelled) {
          if (initialLoad) {
            setModel(null);
            setDocumentTypes([]);
          }
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) {
          loadedEmployeeId.current = employeeId;
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, employeeId, reloadToken, owner, setError]);

  return {
    loading: loading || (!!employeeId && accessOwner !== owner && !error),
    refreshing,
    error,
    model: modelOwner === owner ? model : null,
    access: accessOwner === owner ? access : null,
    documentTypes: modelOwner === owner ? documentTypes : [],
    refreshVersion: reloadToken,
    refetch,
  };
}
