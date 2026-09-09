import { validateTenantUploadFile } from '../../../utils/tenantFileUpload';

import type { ApplyLeaveField } from './ApplyLeaveFormFields';
import {
  calendarDaysBeforeLeaveStart,
  requestedLeaveDays,
  type ApplyBalanceRow,
  type ApplyHolidayRow,
  type ApplyLeavePolicyRow,
  type ApplyLeaveTypeOption,
} from './applyLeavePolicy';

export interface LeaveValidationInput {
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  requiresDocument: boolean;
  supportingDocumentFile: File | null;
  isHalfDay: boolean;
  halfDaySession: string;
  halfDayEligible: boolean;
  policyForType?: ApplyLeavePolicyRow;
  selectedType?: ApplyLeaveTypeOption;
  consumesLeaveBalance: boolean;
  balanceForType?: ApplyBalanceRow;
  upcomingHolidays: ApplyHolidayRow[];
}
type LeaveFieldFailure = { field: ApplyLeaveField; message: string } | null;
function validateRequiredFields({
  leaveTypeId,
  fromDate,
  toDate,
  reason,
  requiresDocument,
  supportingDocumentFile,
  isHalfDay,
  halfDaySession,
}: LeaveValidationInput): LeaveFieldFailure {
  if (!leaveTypeId) {
    return { field: 'leaveTypeId', message: 'Choose a leave type.' };
  }
  if (!fromDate) {
    return { field: 'fromDate', message: 'Choose the first day of leave.' };
  }
  if (!toDate) {
    return { field: 'toDate', message: 'Choose the last day of leave.' };
  }
  if (toDate < fromDate) {
    return { field: 'toDate', message: 'To date must be on or after from date.' };
  }
  const reasonTrim = reason.trim();
  if (!reasonTrim) {
    return { field: 'reason', message: 'Enter a reason for your leave.' };
  }
  return validateLeaveEvidence({
    requiresDocument,
    supportingDocumentFile,
    isHalfDay,
    halfDaySession,
  });
}
function validateLeaveEvidence({
  requiresDocument,
  supportingDocumentFile,
  isHalfDay,
  halfDaySession,
}: Pick<
  LeaveValidationInput,
  'requiresDocument' | 'supportingDocumentFile' | 'isHalfDay' | 'halfDaySession'
>): LeaveFieldFailure {
  if (requiresDocument && !supportingDocumentFile) {
    return { field: 'supportingDocumentFile', message: 'Choose the required supporting document.' };
  }
  if (supportingDocumentFile) {
    const fileError = validateTenantUploadFile(supportingDocumentFile, 'Supporting document');
    if (fileError) {
      return { field: 'supportingDocumentFile', message: fileError };
    }
  }
  if (isHalfDay && !halfDaySession) {
    return { field: 'halfDaySession', message: 'Choose first half or second half.' };
  }

  return null;
}
function validateLeaveRange(
  { fromDate, policyForType, halfDayEligible, isHalfDay }: LeaveValidationInput,
  reqDays: number,
  sandwichOn: boolean
): LeaveFieldFailure {
  const leadDays = calendarDaysBeforeLeaveStart(fromDate);
  const minNoticeDays = policyForType?.minNoticeDays ?? 0;
  if (!Number.isNaN(leadDays) && minNoticeDays > 0 && leadDays < minNoticeDays) {
    return {
      field: 'fromDate',
      message: `Policy requires at least ${minNoticeDays} calendar day(s) between today and the first leave day.`,
    };
  }

  if (!sandwichOn && reqDays <= 0 && !(halfDayEligible && isHalfDay)) {
    return {
      field: 'fromDate',
      message:
        'No chargeable working days in this range (weekends and holidays only). Adjust dates or choose another leave type.',
    };
  }
  return null;
}
function validateLeaveBalance(
  { consumesLeaveBalance, balanceForType, policyForType }: LeaveValidationInput,
  reqDays: number
): LeaveFieldFailure {
  if (consumesLeaveBalance && !balanceForType) {
    return {
      field: 'leaveTypeId',
      message:
        'This leave type is not provisioned for your employee record. Ask HR to provision balances first.',
    };
  }
  const availableDays = Number(balanceForType?.balanceDays ?? 0);
  if (consumesLeaveBalance && Number.isFinite(availableDays) && availableDays < reqDays) {
    return {
      field: 'leaveTypeId',
      message: `Insufficient leave balance. Available: ${availableDays} day(s), requested: ${reqDays} day(s).`,
    };
  }
  const maxDays = policyForType?.maxConsecutiveDays ?? 0;
  if (maxDays > 0 && reqDays > maxDays) {
    return {
      field: 'toDate',
      message: `Policy allows at most ${maxDays} consecutive day(s) for this leave type (this request is ${reqDays} day(s)).`,
    };
  }

  return null;
}
export function validateLeaveApplication(input: LeaveValidationInput): LeaveFieldFailure {
  const requiredError = validateRequiredFields(input);
  if (requiredError) return requiredError;
  const sandwichOn = input.selectedType?.sandwichRule === true;
  const reqDays = requestedLeaveDays(
    input.fromDate,
    input.toDate,
    input.halfDayEligible && input.isHalfDay,
    sandwichOn,
    input.upcomingHolidays
  );
  return validateLeaveRange(input, reqDays, sandwichOn) ?? validateLeaveBalance(input, reqDays);
}
