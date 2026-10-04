import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ClientOpsPayslipsForPayrollHubDocument,
  PayrollComplianceSettingDocument,
  type PayrollComplianceSettingQuery,
} from '../../../api/graphql/graphql';
import type { TenantCalendarPeriod } from '../../../utils/tenantCalendar';
import { PayslipLogoSignedReadUrlDocument } from '../documents';
import { ImportedSalaryPreviewDocument } from '../importSalaryPreview';
import { isMissingPayrollCoreError } from '../payrollFormatters';
import type { EmployeeSalaryPreview, PayslipPeriodOption, PayslipRow } from '../payrollTypes';

import { useOwnerQuery } from './useOwnerQuery';

export function useEmployeeSalary(client: GraphQLClient, ownerKey: string, enabled: boolean) {
  const load = useCallback(
    () =>
      client.request<{ employeeSalaryBreakupPreview: EmployeeSalaryPreview }>(
        ImportedSalaryPreviewDocument,
        { asOf: null }
      ),
    [client]
  );
  const query = useOwnerQuery(ownerKey, enabled, load);
  return {
    salaryPreview: query.value?.employeeSalaryBreakupPreview ?? null,
    loadingSalary: query.loading,
    errorSalary: query.error,
    salaryMigrationRequired: isMissingPayrollCoreError(query.error),
  };
}

function periodOptions(
  period: TenantCalendarPeriod,
  payslips: PayslipRow[] | null
): PayslipPeriodOption[] {
  if (!payslips) return [];
  const formatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
  const byPeriod = new Map<string, PayslipRow>();
  for (const slip of payslips) {
    const key = `${slip.periodYear}-${String(slip.periodMonth).padStart(2, '0')}`;
    if (!byPeriod.has(key)) byPeriod.set(key, slip);
  }
  return Array.from({ length: period.month }, (_, index) => {
    const month = period.month - index;
    const key = `${period.year}-${String(month).padStart(2, '0')}`;
    return {
      periodKey: key,
      label: formatter.format(new Date(period.year, month - 1, 1)),
      month,
      year: period.year,
      payslip: byPeriod.get(key) ?? null,
    };
  });
}

export function useEmployeePayslips(
  client: GraphQLClient,
  ownerKey: string,
  enabled: boolean,
  showBranding: boolean,
  period: TenantCalendarPeriod
) {
  const load = useCallback(
    () =>
      client.request<{ payslips: PayslipRow[] }>(ClientOpsPayslipsForPayrollHubDocument, {
        limit: 24,
      }),
    [client]
  );
  const query = useOwnerQuery(ownerKey, enabled, load);
  const payslips = query.value?.payslips ?? null;
  const loadBranding = useCallback(
    () => client.request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument),
    [client]
  );
  const branding = useOwnerQuery(ownerKey, enabled && showBranding, loadBranding);
  const payslipBranding = branding.value?.payrollComplianceSetting ?? null;
  const logoId = payslipBranding?.payslipLogoFileStorageId?.trim() ?? '';
  const loadLogo = useCallback(
    () =>
      client.request<{ payslipLogoSignedReadUrl: string }>(PayslipLogoSignedReadUrlDocument, {
        fileStorageId: logoId,
      }),
    [client, logoId]
  );
  const logo = useOwnerQuery(
    `${ownerKey}:${logoId}`,
    enabled && showBranding && Boolean(logoId),
    loadLogo
  );
  const [selected, setSelected] = useState<{ owner: string; key: string | null }>({
    owner: ownerKey,
    key: null,
  });
  const selectedPeriodKey = selected.owner === ownerKey ? selected.key : null;
  const options = useMemo(() => periodOptions(period, payslips), [period, payslips]);
  useEffect(() => {
    if (!options.length) setSelected({ owner: ownerKey, key: null });
    else if (!options.some((option) => option.periodKey === selectedPeriodKey))
      setSelected({ owner: ownerKey, key: options[0].periodKey });
  }, [options, ownerKey, selectedPeriodKey]);
  const setSelectedPeriodKey = useCallback(
    (key: string | null) => setSelected({ owner: ownerKey, key }),
    [ownerKey]
  );
  return {
    payslips,
    payslipError: query.error,
    payslipMigrationRequired: isMissingPayrollCoreError(query.error),
    payslipsLoading: query.loading,
    selectedPeriodKey,
    setSelectedPeriodKey,
    payslipBranding,
    payslipLogoReadUrl: logo.value?.payslipLogoSignedReadUrl ?? null,
    payslipPeriodOptions: options,
    activePayslip:
      options.find((option) => option.periodKey === selectedPeriodKey)?.payslip ?? null,
  };
}
