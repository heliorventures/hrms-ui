import { useCallback, useEffect, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';

import { EmployeeProfileBundleDocument } from '../../../../api/graphql/graphql';
import type { EmployeeProfileModel, TenantDocumentTypeOption } from '../types';
import { mapBundleToEmployeeProfileModel } from '../lib/mapBundleToModel';
import { buildEmployeeProfileModel } from '../mock/buildProfileModel';
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

        const synth = buildEmployeeProfileModel(base.core);
        const merged: EmployeeProfileModel = {
          ...base,
          education: base.education.length > 0 ? base.education : synth.education,
          workExperience:
            base.workExperience.length > 0 ? base.workExperience : synth.workExperience,
          leaveBalanceDays: base.leaveBalanceDays ?? synth.leaveBalanceDays,
          companyAssignment:
            base.companyAssignment.leavePolicyName === '—'
              ? synth.companyAssignment
              : base.companyAssignment,
          growthTimeline:
            base.growthTimeline.length > 1 ? base.growthTimeline : synth.growthTimeline,
        };

        setModel(merged);
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
