import { useCallback, useEffect, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  PayrollArrearsListDocument,
  PayrollBoardDocument,
  PayrollComplianceSettingDocument,
  type PayrollComplianceSettingQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type {
  PayrollArrearRow,
  PayrollBoardData,
  PayrollComplianceFormState,
} from '../payrollTypes';

const DEFAULT_COMPLIANCE_FORM: PayrollComplianceFormState = {
  employerTanInput: '',
  employerLegalNameInput: '',
  baseComponentInput: 'BASIC',
  arrearComponentInput: 'ARREAR',
  payslipHeaderInput: '',
  payslipLogoIdInput: '',
};

function complianceFormFromQuery(
  row: PayrollComplianceSettingQuery['payrollComplianceSetting']
): PayrollComplianceFormState {
  return {
    employerTanInput: row?.employerTan?.trim() ?? '',
    employerLegalNameInput: row?.employerLegalName?.trim() ?? '',
    baseComponentInput: row?.baseSalaryComponentCode?.trim() || 'BASIC',
    arrearComponentInput: row?.arrearSalaryComponentCode?.trim() || 'ARREAR',
    payslipHeaderInput: row?.payslipHeaderTitle?.trim() ?? '',
    payslipLogoIdInput: row?.payslipLogoFileStorageId?.trim() ?? '',
  };
}

export function usePayrollBoard(client: GraphQLClient) {
  const [data, setData] = useState<PayrollBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceForm, setComplianceForm] =
    useState<PayrollComplianceFormState>(DEFAULT_COMPLIANCE_FORM);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.request<PayrollBoardData>(PayrollBoardDocument, { limit: 20 });
      let merged: PayrollBoardData = result;
      try {
        const arrears = await client.request<{ payrollArrears: PayrollArrearRow[] }>(
          PayrollArrearsListDocument,
          { limit: 100 }
        );
        merged = { ...result, payrollArrears: arrears.payrollArrears };
      } catch {
        merged = { ...result, payrollArrears: [] };
      }
      setData(merged);
      try {
        const settings =
          await client.request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument);
        setComplianceForm(complianceFormFromQuery(settings.payrollComplianceSetting));
      } catch {
        setComplianceForm(DEFAULT_COMPLIANCE_FORM);
      }
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const setComplianceField = useCallback(
    (field: keyof PayrollComplianceFormState, value: string) => {
      setComplianceForm((current) => ({ ...current, [field]: value }));
    },
    []
  );

  return {
    data,
    loading,
    error,
    complianceForm,
    setComplianceField,
    loadData,
  };
}
