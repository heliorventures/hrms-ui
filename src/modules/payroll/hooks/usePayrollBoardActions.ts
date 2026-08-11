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
const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
const COMPONENT_CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,31}$/;
const TAN_PATTERN = /^[A-Z]{4}\d{5}[A-Z]$/;

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

const parseMoneyInput = (value: string): number => {
  const trimmed = value.trim();
  if (!MONEY_PATTERN.test(trimmed)) return NaN;
  return Number(trimmed);
};

const isValidIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

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
    setComplianceSaveError(null);
    setComplianceSaveOk(null);
    const employerTan = complianceForm.employerTanInput.trim().toUpperCase();
    const baseComponentCode = complianceForm.baseComponentInput.trim().toUpperCase();
    const arrearComponentCode = complianceForm.arrearComponentInput.trim().toUpperCase();
    if (employerTan && !TAN_PATTERN.test(employerTan)) {
      setComplianceSaveError('Employer TAN must match the Indian TAN format, for example ABCD12345E.');
      return;
    }
    if (baseComponentCode && !COMPONENT_CODE_PATTERN.test(baseComponentCode)) {
      setComplianceSaveError('Base salary component code must start with a letter and use A-Z, 0-9, or underscore.');
      return;
    }
    if (arrearComponentCode && !COMPONENT_CODE_PATTERN.test(arrearComponentCode)) {
      setComplianceSaveError('Arrear component code must start with a letter and use A-Z, 0-9, or underscore.');
      return;
    }
    if (baseComponentCode && arrearComponentCode && baseComponentCode === arrearComponentCode) {
      setComplianceSaveError('Base and arrear component codes must be different.');
      return;
    }
    setComplianceSaveBusy(true);
    try {
      await client.request(UpsertPayrollComplianceSettingDocument, {
        input: {
          employerTan: employerTan || null,
          employerLegalName: complianceForm.employerLegalNameInput.trim() || null,
          baseSalaryComponentCode: baseComponentCode || null,
          arrearSalaryComponentCode: arrearComponentCode || null,
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
    setCreateError(null);
    setCreateOk(null);
    const cycleName = cycleForm.newCycleName.trim();
    const cycleMonth = Number(cycleForm.newCycleMonth);
    const cycleYear = Number(cycleForm.newCycleYear);
    if (!cycleName) {
      setCreateError('Cycle name is required.');
      return;
    }
    if (!Number.isInteger(cycleMonth) || cycleMonth < 1 || cycleMonth > 12) {
      setCreateError('Payroll month must be between 1 and 12.');
      return;
    }
    if (!Number.isInteger(cycleYear) || cycleYear < 2000 || cycleYear > 2100) {
      setCreateError('Payroll year must be between 2000 and 2100.');
      return;
    }
    if (cycleForm.newCyclePayDate && !isValidIsoDate(cycleForm.newCyclePayDate)) {
      setCreateError('Payment date must be a valid date.');
      return;
    }
    setCreateBusy(true);
    try {
      await client.request(CreatePayrollCycleDocument, {
        input: {
          name: cycleName,
          month: cycleMonth,
          year: cycleYear,
          ...(cycleForm.newCyclePayDate ? { paymentDate: cycleForm.newCyclePayDate } : {}),
        },
      });
      setCreateOk(
        `Draft cycle created for ${formatPayrollPeriod({
          id: '',
          name: '',
          status: 'DRAFT',
          month: cycleMonth,
          year: cycleYear,
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
    setArrearError(null);
    setArrearOk(null);
    const employeeId = arrearForm.arrearEmployeeId.trim();
    const amount = parseMoneyInput(arrearForm.arrearAmount);
    const reason = arrearForm.arrearReason.trim();
    if (!employeeId) {
      setArrearError('Select an employee for the arrear.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setArrearError('Arrear amount must be a positive amount with up to 2 decimal places.');
      return;
    }
    if (!reason) {
      setArrearError('Arrear reason is required for payroll audit history.');
      return;
    }
    setArrearBusy(true);
    try {
      await client.request(CreatePayrollArrearDocument, {
        input: {
          employeeId,
          amount: arrearForm.arrearAmount.trim(),
          reason,
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
      const confirmed = window.confirm(
        'Run payroll for this cycle now? This calculates salary, arrears, and processed payslips for the cycle.'
      );
      if (!confirmed) return;
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
