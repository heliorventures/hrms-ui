import { useCallback, useEffect, useRef, useState } from 'react';
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

interface PayrollBoardAuthorization {
  enabled: boolean;
  ownerKey: string;
}

export function usePayrollBoard(
  client: GraphQLClient,
  { enabled, ownerKey }: PayrollBoardAuthorization
) {
  const [data, setData] = useState<PayrollBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceForm, setComplianceForm] =
    useState<PayrollComplianceFormState>(DEFAULT_COMPLIANCE_FORM);
  const requestGeneration = useRef(0);

  const loadData = useCallback(async () => {
    const generation = ++requestGeneration.current;
    if (!enabled) {
      setData(null);
      setLoading(false);
      setError(null);
      setComplianceForm(DEFAULT_COMPLIANCE_FORM);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [result, arrears, settings] = await Promise.all([
        client.request<PayrollBoardData>(PayrollBoardDocument, { limit: 20 }),
        client
          .request<{ payrollArrears: PayrollArrearRow[] }>(PayrollArrearsListDocument, {
            limit: 100,
          })
          .catch(() => ({ payrollArrears: [] })),
        client
          .request<PayrollComplianceSettingQuery>(PayrollComplianceSettingDocument)
          .catch(() => null),
      ]);
      if (generation !== requestGeneration.current) return;
      setData({ ...result, payrollArrears: arrears.payrollArrears });
      setComplianceForm(
        settings
          ? complianceFormFromQuery(settings.payrollComplianceSetting)
          : DEFAULT_COMPLIANCE_FORM
      );
    } catch (err) {
      if (generation !== requestGeneration.current) return;
      setData(null);
      setError(graphQlUserMessage(err));
    } finally {
      if (generation === requestGeneration.current) setLoading(false);
    }
  }, [client, enabled, ownerKey]);

  useEffect(() => {
    void loadData();
    return () => {
      requestGeneration.current += 1;
    };
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
