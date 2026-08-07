import { useCallback, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  CreatePayrollArrearDocument,
  CreatePayrollCycleDocument,
  RunPayrollForCycleDocument,
  UpsertPayrollComplianceSettingDocument,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { defaultCycleName, formatPayrollPeriod } from '../payrollFormatters';
import type {
  PayrollArrearFormState,
  PayrollComplianceFormState,
  PayrollCycleFormState,
} from '../payrollTypes';

const now = new Date();

const DEFAULT_CYCLE_FORM: PayrollCycleFormState = {
  newCycleName: defaultCycleName(),
  newCycleMonth: now.getMonth() + 1,
  newCycleYear: now.getFullYear(),
  newCyclePayDate: '',
};

const DEFAULT_ARREAR_FORM: PayrollArrearFormState = {
  arrearEmployeeId: '',
  arrearAmount: '',
  arrearReason: '',
};

interface PayrollBoardActionsParams {
  client: GraphQLClient;
  complianceForm: PayrollComplianceFormState;
  reload: () => Promise<void>;
}

export function usePayrollBoardActions({
  client,
  complianceForm,
  reload,
}: PayrollBoardActionsParams) {
  const [cycleForm, setCycleForm] = useState<PayrollCycleFormState>(DEFAULT_CYCLE_FORM);
  const [arrearForm, setArrearForm] = useState<PayrollArrearFormState>(DEFAULT_ARREAR_FORM);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOk, setCreateOk] = useState<string | null>(null);
  const [arrearBusy, setArrearBusy] = useState(false);
  const [arrearError, setArrearError] = useState<string | null>(null);
  const [arrearOk, setArrearOk] = useState<string | null>(null);
  const [runBusy, setRunBusy] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runOk, setRunOk] = useState<string | null>(null);
  const [complianceSaveBusy, setComplianceSaveBusy] = useState(false);
  const [complianceSaveError, setComplianceSaveError] = useState<string | null>(null);
  const [complianceSaveOk, setComplianceSaveOk] = useState<string | null>(null);

  const setCycleField = useCallback((field: keyof PayrollCycleFormState, value: string | number) => {
    setCycleForm((current) => ({ ...current, [field]: value }));
  }, []);

  const setArrearField = useCallback((field: keyof PayrollArrearFormState, value: string) => {
    setArrearForm((current) => ({ ...current, [field]: value }));
  }, []);

  const savePayrollCompliance = useCallback(async () => {
    setComplianceSaveBusy(true);
    setComplianceSaveError(null);
    setComplianceSaveOk(null);
    try {
      await client.request(UpsertPayrollComplianceSettingDocument, {
        input: {
          employerTan: complianceForm.employerTanInput.trim() || null,
          employerLegalName: complianceForm.employerLegalNameInput.trim() || null,
          baseSalaryComponentCode: complianceForm.baseComponentInput.trim() || null,
          arrearSalaryComponentCode: complianceForm.arrearComponentInput.trim() || null,
          payslipHeaderTitle: complianceForm.payslipHeaderInput.trim() || null,
          payslipLogoFileStorageId: complianceForm.payslipLogoIdInput.trim() || null,
        },
      });
      setComplianceSaveOk(
        'Payroll compliance settings saved (CSV placeholders, component codes, payslip header/logo).'
      );
      await reload();
    } catch (err) {
      setComplianceSaveError(graphQlUserMessage(err));
    } finally {
      setComplianceSaveBusy(false);
    }
  }, [client, complianceForm, reload]);

  const createCycle = useCallback(async () => {
    setCreateBusy(true);
    setCreateError(null);
    setCreateOk(null);
    try {
      await client.request(CreatePayrollCycleDocument, {
        input: {
          name: cycleForm.newCycleName.trim(),
          month: cycleForm.newCycleMonth,
          year: cycleForm.newCycleYear,
          ...(cycleForm.newCyclePayDate ? { paymentDate: cycleForm.newCyclePayDate } : {}),
        },
      });
      setCreateOk(
        `Draft cycle created for ${formatPayrollPeriod({
          id: '',
          name: '',
          status: 'DRAFT',
          month: cycleForm.newCycleMonth,
          year: cycleForm.newCycleYear,
        })}.`
      );
      await reload();
    } catch (err) {
      setCreateError(graphQlUserMessage(err));
    } finally {
      setCreateBusy(false);
    }
  }, [client, cycleForm, reload]);

  const createArrear = useCallback(async () => {
    setArrearBusy(true);
    setArrearError(null);
    setArrearOk(null);
    try {
      await client.request(CreatePayrollArrearDocument, {
        input: {
          employeeId: arrearForm.arrearEmployeeId.trim(),
          amount: arrearForm.arrearAmount.trim(),
          reason: arrearForm.arrearReason.trim() || null,
        },
      });
      setArrearOk('PENDING arrear saved — it will be paid in the next run with an ARREAR line.');
      setArrearForm((current) => ({ ...current, arrearAmount: '', arrearReason: '' }));
      await reload();
    } catch (err) {
      setArrearError(graphQlUserMessage(err));
    } finally {
      setArrearBusy(false);
    }
  }, [arrearForm, client, reload]);

  const runPayroll = useCallback(
    async (payrollCycleId: string) => {
      setRunBusy(payrollCycleId);
      setRunError(null);
      setRunOk(null);
      try {
        await client.request(RunPayrollForCycleDocument, { payrollCycleId });
        setRunOk(
          'Pay run completed — cycle is PROCESSED (v1: employment salary + arrears mapped to tenant component codes).'
        );
        await reload();
      } catch (err) {
        setRunError(graphQlUserMessage(err));
      } finally {
        setRunBusy(null);
      }
    },
    [client, reload]
  );

  return {
    cycleForm,
    setCycleField,
    createCycle,
    createBusy,
    createError,
    createOk,
    arrearForm,
    setArrearField,
    createArrear,
    arrearBusy,
    arrearError,
    arrearOk,
    runPayroll,
    runBusy,
    runError,
    runOk,
    savePayrollCompliance,
    complianceSaveBusy,
    complianceSaveError,
    complianceSaveOk,
  };
}
