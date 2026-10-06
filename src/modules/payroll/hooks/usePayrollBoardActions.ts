import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useState } from 'react';

import {
  CreatePayrollArrearDocument,
  CreatePayrollCycleDocument,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { defaultCycleName, formatPayrollPeriod } from '../payrollFormatters';
import type {
  PayrollArrearFormState,
  PayrollComplianceFormState,
  PayrollCycleFormState,
} from '../payrollTypes';

import { usePayrollComplianceSave } from './usePayrollComplianceSave';
import { usePayrollDraftActions } from './usePayrollDraftActions';

const now = new Date();
const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;

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
  enabled: boolean;
  complianceReady: boolean;
  ownerKey: string;
  reload: () => Promise<void>;
}

export function usePayrollBoardActions({
  client,
  complianceForm,
  complianceReady,
  enabled,
  ownerKey,
  reload,
}: PayrollBoardActionsParams) {
  const compliance = usePayrollComplianceSave({
    client,
    enabled,
    ownerKey,
    complianceReady,
    complianceForm,
    reload,
  });
  const drafts = usePayrollDraftActions(client, enabled, ownerKey, reload);
  const [cycleForm, setCycleForm] = useState<PayrollCycleFormState>(DEFAULT_CYCLE_FORM);
  const [arrearForm, setArrearForm] = useState<PayrollArrearFormState>(DEFAULT_ARREAR_FORM);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOk, setCreateOk] = useState<string | null>(null);
  const [arrearBusy, setArrearBusy] = useState(false);
  const [arrearError, setArrearError] = useState<string | null>(null);
  const [arrearOk, setArrearOk] = useState<string | null>(null);

  useEffect(() => {
    setCreateBusy(false);
    setCreateError(null);
    setCreateOk(null);
    setArrearBusy(false);
    setArrearError(null);
    setArrearOk(null);
  }, [enabled, ownerKey]);

  const setCycleField = useCallback(
    (field: keyof PayrollCycleFormState, value: string | number) => {
      setCycleForm((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const setArrearField = useCallback((field: keyof PayrollArrearFormState, value: string) => {
    setArrearForm((current) => ({ ...current, [field]: value }));
  }, []);

  const createCycle = useCallback(async () => {
    if (!enabled) return;
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
  }, [client, cycleForm, enabled, reload]);

  const createArrear = useCallback(async () => {
    if (!enabled) return;
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
  }, [arrearForm, client, enabled, reload]);

  return {
    ...drafts,
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
    ...compliance,
  };
}
