import type { GraphQLClient } from 'graphql-request';
import { useCallback, useState } from 'react';

import { isMissingPayrollCoreError } from '../payrollFormatters';
import type { PayrollTabId } from '../payrollTypes';

import { useCurrentTenantCalendarPeriod } from './useCurrentTenantCalendarPeriod';
import { useEmployeeSalary, useEmployeePayslips } from './useEmployeePayRecords';
import { useEmployeeTaxSelfService } from './useEmployeeTaxSelfService';

interface PayrollPayAuthorization {
  canReadPayroll: boolean;
  canReadTax: boolean;
  canSubmitTax: boolean;
  ownerKey: string;
  tenantTimezone: string;
}

export function usePayrollPayData(
  client: GraphQLClient,
  activeTab: PayrollTabId,
  { canReadPayroll, canReadTax, canSubmitTax, ownerKey, tenantTimezone }: PayrollPayAuthorization
) {
  const currentPeriod = useCurrentTenantCalendarPeriod(tenantTimezone);
  const [taxFiscalYear, setTaxFiscalYear] = useState(
    currentPeriod.year - (currentPeriod.month < 4 ? 1 : 0)
  );
  const salary = useEmployeeSalary(client, ownerKey, canReadPayroll && activeTab === 'salary');
  const slips = useEmployeePayslips(
    client,
    ownerKey,
    canReadPayroll && (activeTab === 'payslip' || activeTab === 'incometax'),
    activeTab === 'payslip',
    currentPeriod
  );
  const employeeTax = useEmployeeTaxSelfService(client, {
    enabled: canReadTax && activeTab === 'incometax',
    canSubmit: canSubmitTax,
    ownerKey,
    fiscalYear: taxFiscalYear,
  });
  const labelForLine = useCallback(
    (line: { salaryComponentId: string; componentType?: string | null }) => {
      const component = salary.salaryPreview?.lines.find(
        (item) => item.salaryComponentId === line.salaryComponentId
      );
      return (
        component?.componentName ??
        line.componentType ??
        `Component ${line.salaryComponentId.slice(0, 8)}�`
      );
    },
    [salary.salaryPreview]
  );
  return {
    ...salary,
    ...slips,
    ...employeeTax,
    loadingShell: employeeTax.loadingEmployeeTax,
    errorShell: employeeTax.employeeTaxError,
    showMigrationHint:
      salary.salaryMigrationRequired || isMissingPayrollCoreError(employeeTax.employeeTaxError),
    labelForLine,
    taxFiscalYear,
    setTaxFiscalYear,
    payslipIndiaFyTotals: null,
  };
}
