import { useEffect, useMemo } from 'react';

import type { useApplyLeaveFields } from './useApplyLeaveFields';
import type { ApplyLeaveModalProps } from './useApplyLeaveForm';

export const useApplyLeaveSelection = (
  { leaveTypes, leavePolicies, leaveBalances }: ApplyLeaveModalProps,
  {
    leaveTypeId,
    fromDate,
    toDate,
    setIsHalfDay,
    setHalfDaySession,
  }: ReturnType<typeof useApplyLeaveFields>
) => {
  const selectedType = useMemo(
    () => leaveTypes.find((t) => t.id === leaveTypeId),
    [leaveTypes, leaveTypeId]
  );

  const policyForType = useMemo(
    () => leavePolicies.find((p) => p.leaveTypeId === leaveTypeId),
    [leavePolicies, leaveTypeId]
  );

  const balanceForType = useMemo(
    () => leaveBalances.find((b) => b.leaveTypeId === leaveTypeId),
    [leaveBalances, leaveTypeId]
  );

  const halfDayAllowed = selectedType?.halfDayAllowed !== false;
  const requiresDocument = selectedType?.requiresDocument === true;
  const consumesLeaveBalance = selectedType?.isPaid !== false && selectedType?.code !== 'COMP_OFF';
  const isMultiDay = Boolean(fromDate && toDate && fromDate !== toDate);
  const halfDayEligible = halfDayAllowed && !isMultiDay;
  const leaveTypeOptions = useMemo(
    () => [
      { value: '', label: 'Select...' },
      ...leaveTypes.map((leaveType) => ({
        value: leaveType.id,
        label: `${leaveType.name} (${leaveType.code})`,
      })),
    ],
    [leaveTypes]
  );

  useEffect(() => {
    if (!halfDayAllowed || isMultiDay) {
      setIsHalfDay(false);
      setHalfDaySession('');
    }
  }, [halfDayAllowed, isMultiDay, leaveTypeId, setIsHalfDay, setHalfDaySession]);

  return {
    selectedType,
    policyForType,
    balanceForType,
    halfDayAllowed,
    requiresDocument,
    consumesLeaveBalance,
    halfDayEligible,
    leaveTypeOptions,
  };
};
