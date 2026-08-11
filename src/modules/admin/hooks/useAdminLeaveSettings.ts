import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDialogs } from '../../../contexts/DialogContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  AdminLeaveConsoleDocument,
  AdjustLeaveBalanceEntitlementAdminDocument,
  DeleteLeavePolicyAdminDocument,
  DeleteLeaveTypeAdminDocument,
  ProvisionLeaveBalancesFromPoliciesDocument,
  UpsertLeaveBalanceAdminDocument,
  UpsertLeavePolicyAdminDocument,
  UpsertLeaveTypeAdminDocument,
  type AdminLeaveConsoleQuery,
} from '../../../api/graphql/graphql';
import type { LeavePolicyRow, LeaveSettingsTabKey, LeaveTypeForm, LeaveTypeRow } from '../leaveSettingsTypes';
import {
  createAdjustmentForm,
  createBalanceForm,
  createEmptyPolicyForm,
  createLeaveTypeForm,
  DELETE_LEAVE_POLICY_DIALOG,
  DELETE_LEAVE_TYPE_DIALOG,
  DEFAULT_LEAVE_TYPE_FORM,
  nullableText,
  numberOrNull,
  provisionBalancesDialog,
} from '../leaveSettingsUtils';
import { useAdminLeaveHolidays } from './useAdminLeaveHolidays';

export function useAdminLeaveSettings() {
  const client = useGraphClient('client');
  const { confirm, alert: showAlert } = useDialogs();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [tab, setTab] = useState<LeaveSettingsTabKey>('types');
  const [data, setData] = useState<AdminLeaveConsoleQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provisionBusy, setProvisionBusy] = useState(false);
  const [provisionYear, setProvisionYear] = useState(currentYear);
  const [typeModal, setTypeModal] = useState(false);
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<LeaveTypeForm>(DEFAULT_LEAVE_TYPE_FORM);
  const [policyModal, setPolicyModal] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState(createEmptyPolicyForm());
  const [balanceForm, setBalanceForm] = useState(createBalanceForm(currentYear));
  const [adjustmentForm, setAdjustmentForm] = useState(createAdjustmentForm(currentYear));

  const load = useCallback(async () => {
    return client.request<AdminLeaveConsoleQuery>(AdminLeaveConsoleDocument, {
      calendarYear: currentYear,
    });
  }, [client, currentYear]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setData(await load());
      setError(null);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await load();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const leaveTypeCodeById = useMemo(() => {
    const codes = new Map<string, string>();
    for (const leaveType of data?.leaveTypes ?? []) codes.set(leaveType.id, leaveType.code);
    return codes;
  }, [data?.leaveTypes]);

  const runProvisionFromPolicies = async () => {
    const ok = await confirm(provisionBalancesDialog(provisionYear));
    if (!ok) return;
    try {
      setProvisionBusy(true);
      setError(null);
      const result = await client.request<{ provisionLeaveBalancesFromPolicies: number }>(
        ProvisionLeaveBalancesFromPoliciesDocument,
        { year: provisionYear }
      );
      await showAlert({
        title: 'Provisioning Complete',
        message: `Updated ${result.provisionLeaveBalancesFromPolicies} employee / leave-type balance row(s).`,
        variant: 'success',
      });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setProvisionBusy(false);
    }
  };

  const openNewType = () => {
    setEditTypeId(null);
    setTypeForm(DEFAULT_LEAVE_TYPE_FORM);
    setTypeModal(true);
  };

  const openEditType = (row: LeaveTypeRow) => {
    setEditTypeId(row.id);
    setTypeForm(createLeaveTypeForm(row));
    setTypeModal(true);
  };

  const saveType = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeaveTypeAdminDocument, {
        input: {
          id: editTypeId,
          name: typeForm.name.trim(),
          code: typeForm.code.trim(),
          isPaid: typeForm.isPaid,
          carryForward: typeForm.carryForward,
          maxCarryForwardDays: numberOrNull(typeForm.maxCf),
          sandwichRule: typeForm.sandwich,
          halfDayAllowed: typeForm.halfDay,
          requiresDocument: typeForm.reqDoc,
        },
      });
      setTypeModal(false);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deleteType = async (id: string) => {
    const ok = await confirm(DELETE_LEAVE_TYPE_DIALOG);
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteLeaveTypeAdminDocument, { leaveTypeId: id });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const openNewPolicy = () => {
    setEditPolicyId(null);
    setPolicyForm(createEmptyPolicyForm(data?.leaveTypes[0]?.id ?? ''));
    setPolicyModal(true);
  };

  const openEditPolicy = (row: LeavePolicyRow) => {
    setEditPolicyId(row.id);
    setPolicyForm({
      leaveTypeId: row.leaveTypeId,
      applicableTo: row.applicableTo ?? '',
      annual: row.annualEntitlement != null ? String(row.annualEntitlement) : '',
      freq: row.accrualFrequency ?? '',
      accrualDays: row.accrualDays ?? '',
      maxCons: row.maxConsecutiveDays != null ? String(row.maxConsecutiveDays) : '',
      minNotice: row.minNoticeDays != null ? String(row.minNoticeDays) : '',
    });
    setPolicyModal(true);
  };

  const savePolicy = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeavePolicyAdminDocument, {
        input: {
          id: editPolicyId,
          leaveTypeId: policyForm.leaveTypeId,
          applicableTo: nullableText(policyForm.applicableTo),
          annualEntitlement: numberOrNull(policyForm.annual),
          accrualFrequency: nullableText(policyForm.freq),
          accrualDays: nullableText(policyForm.accrualDays),
          maxConsecutiveDays: numberOrNull(policyForm.maxCons),
          minNoticeDays: numberOrNull(policyForm.minNotice),
        },
      });
      setPolicyModal(false);
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const deletePolicy = async (id: string) => {
    const ok = await confirm(DELETE_LEAVE_POLICY_DIALOG);
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteLeavePolicyAdminDocument, { leavePolicyId: id });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const saveBalance = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await client.request(UpsertLeaveBalanceAdminDocument, {
        input: {
          employeeId: balanceForm.employeeId.trim(),
          leaveTypeId: balanceForm.leaveTypeId,
          year: Number(balanceForm.year),
          entitledDays: balanceForm.entitled,
          usedDays: balanceForm.used,
          pendingDays: balanceForm.pending,
          carriedForwardDays: balanceForm.carried,
        },
      });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const adjustBalance = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await client.request(AdjustLeaveBalanceEntitlementAdminDocument, {
        input: {
          employeeId: adjustmentForm.employeeId.trim(),
          leaveTypeId: adjustmentForm.leaveTypeId,
          year: Number(adjustmentForm.year),
          entitledDelta: adjustmentForm.delta,
          alsoCreditBalance: adjustmentForm.alsoCredit,
        },
      });
      await refresh();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const holidays = useAdminLeaveHolidays({ client, confirm, currentYear, refresh, setError });

  return {
    currentYear,
    tab,
    setTab,
    data,
    loading,
    error,
    provisionBusy,
    provisionYear,
    setProvisionYear,
    typeModal,
    setTypeModal,
    editTypeId,
    typeForm,
    setTypeForm,
    policyModal,
    setPolicyModal,
    editPolicyId,
    policyForm,
    setPolicyForm,
    balanceForm,
    setBalanceForm,
    adjustmentForm,
    setAdjustmentForm,
    leaveTypeCodeById,
    refresh,
    runProvisionFromPolicies,
    openNewType,
    openEditType,
    saveType,
    deleteType,
    openNewPolicy,
    openEditPolicy,
    savePolicy,
    deletePolicy,
    saveBalance,
    adjustBalance,
    ...holidays,
  };
}

export type AdminLeaveSettingsModel = ReturnType<typeof useAdminLeaveSettings>;
