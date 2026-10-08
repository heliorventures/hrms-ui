import type { GraphQLClient } from 'graphql-request';
import { useCallback, useState } from 'react';

import { PayrollComplianceSettingDocument } from '../../../api/graphql/graphql';

import { useOwnerQuery } from './useOwnerQuery';
import { usePayslipLogo } from './usePayslipLogo';
import { usePayslipSettingsRevision } from './usePayslipSettingsRevision';

export const usePayslipBranding = (client: GraphQLClient, ownerKey: string, enabled: boolean) => {
  const revision = usePayslipSettingsRevision();
  const [attempt, setAttempt] = useState(0);
  const brandingOwner = `${ownerKey}:${revision}:${attempt}`;
  const load = useCallback(() => client.request(PayrollComplianceSettingDocument), [client]);
  const query = useOwnerQuery(brandingOwner, enabled, load);
  const settings = query.value?.payrollComplianceSetting ?? null;
  const logo = usePayslipLogo(client, brandingOwner, settings?.payslipLogoFileStorageId, enabled);
  return {
    payslipBranding: settings,
    payslipLogoReadUrl: logo.url,
    payslipBrandingLoading: query.loading || logo.loading,
    payslipBrandingError: query.error ?? logo.error,
    retryPayslipBranding: useCallback(() => setAttempt((current) => current + 1), []),
  };
};
