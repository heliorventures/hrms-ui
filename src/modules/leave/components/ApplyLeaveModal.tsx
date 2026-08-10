import { FormEvent, useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { SubmitLeaveRequestDocument } from '../../../api/graphql/graphql';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { ApplyLeaveContextPanel, UpcomingHolidaysList } from './ApplyLeaveSupportingInfo';

/** Calendar days from local midnight today → start date (0 = today). */
function calendarDaysBeforeLeaveStart(fromDateStr: string): number {
  const [y, m, d] = fromDateStr.split('-').map(Number);
  if (!y || !m || !d) return NaN;
  const from = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  return Math.round((from.getTime() - today.getTime()) / 86400000);
}

export interface ApplyLeaveTypeOption {
  id: string;
  name: string;
  code: string;
  halfDayAllowed?: boolean;
  requiresDocument?: boolean;
  sandwichRule?: boolean;
}

export type ApplyLeavePolicyRow = LeaveBoardQuery['leavePolicies'][number];
export type ApplyHolidayRow = LeaveBoardQuery['upcomingHolidays'][number];
export type ApplyBalanceRow = LeaveBoardQuery['leaveBalances'][number];

function holidayDateIso(h: ApplyHolidayRow): string {
  const v = h.holidayDate as string;
  return typeof v === 'string' ? v.slice(0, 10) : '';
}

/** Mirrors backend `compute_requested_days` for policy/balance hints (half-day = 0.5). */
function requestedLeaveDays(
  from: string,
  to: string,
  half: boolean,
  sandwichRule: boolean,
  holidays: ApplyHolidayRow[]
): number {
  if (half) return 0.5;
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  if (sandwichRule) {
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }
  const holidaySet = new Set(
    holidays
      .map(holidayDateIso)
      .filter((d) => d && d >= from && d <= to)
  );
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(
      cur.getDate()
    ).padStart(2, '0')}`;
    if (dow !== 0 && dow !== 6 && !holidaySet.has(iso)) {
      count += 1;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: ApplyLeaveTypeOption[];
  leavePolicies: ApplyLeavePolicyRow[];
  upcomingHolidays: ApplyHolidayRow[];
  leaveBalances: ApplyBalanceRow[];
  onSubmitted: () => void;
}

const ApplyLeaveModal = ({
  isOpen,
  onClose,
  leaveTypes,
  leavePolicies,
  upcomingHolidays,
  leaveBalances,
  onSubmitted,
}: ApplyLeaveModalProps) => {
  const client = useGraphClient('client');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'FIRST_HALF' | 'SECOND_HALF' | ''>('');
  const [reason, setReason] = useState('');
  const [supportingDocRef, setSupportingDocRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
  const isMultiDay = Boolean(fromDate && toDate && fromDate !== toDate);
  const halfDayEligible = halfDayAllowed && !isMultiDay;

  useEffect(() => {
    if (!halfDayAllowed || isMultiDay) {
      setIsHalfDay(false);
      setHalfDaySession('');
    }
  }, [halfDayAllowed, isMultiDay, leaveTypeId]);

  const resetForm = () => {
    setLeaveTypeId('');
    setFromDate('');
    setToDate('');
    setIsHalfDay(false);
    setHalfDaySession('');
    setReason('');
    setSupportingDocRef('');
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clearFormError = () => setFormError(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !fromDate || !toDate) {
      setFormError('Choose a leave type and date range.');
      return;
    }
    const reasonTrim = reason.trim();
    if (!reasonTrim) {
      setFormError('Reason is required.');
      return;
    }
    if (requiresDocument && !supportingDocRef.trim()) {
      setFormError('This leave type requires a document reference (link or ticket ID).');
      return;
    }
    if (isHalfDay && !halfDaySession) {
      setFormError('Choose first half or second half for a half-day leave.');
      return;
    }

    const leadDays = calendarDaysBeforeLeaveStart(fromDate);
    if (
      !Number.isNaN(leadDays) &&
      policyForType?.minNoticeDays != null &&
      policyForType.minNoticeDays > 0 &&
      leadDays < policyForType.minNoticeDays
    ) {
      setFormError(
        `Policy requires at least ${policyForType.minNoticeDays} calendar day(s) between today and the first leave day.`
      );
      return;
    }

    const sandwichOn = selectedType?.sandwichRule === true;
    const reqDays = requestedLeaveDays(
      fromDate,
      toDate,
      halfDayEligible && isHalfDay,
      sandwichOn,
      upcomingHolidays
    );
    if (!sandwichOn && reqDays <= 0 && !(halfDayEligible && isHalfDay)) {
      setFormError(
        'No chargeable working days in this range (weekends and holidays only). Adjust dates or choose another leave type.'
      );
      return;
    }
    if (
      policyForType?.maxConsecutiveDays != null &&
      policyForType.maxConsecutiveDays > 0 &&
      reqDays > policyForType.maxConsecutiveDays
    ) {
      setFormError(
        `Policy allows at most ${policyForType.maxConsecutiveDays} consecutive day(s) for this leave type (this request is ${reqDays} day(s)).`
      );
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await client.request(SubmitLeaveRequestDocument, {
        input: {
          leaveTypeId,
          fromDate,
          toDate,
          isHalfDay: halfDayEligible && isHalfDay,
          halfDaySession: halfDayEligible && isHalfDay && halfDaySession ? halfDaySession : null,
          reason: reasonTrim,
          supportingDocumentReference: supportingDocRef.trim() || null,
        },
      });
      onSubmitted();
      resetForm();
      onClose();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Leave" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Leave type
          </label>
          <select
            value={leaveTypeId}
            onChange={(e) => {
              const nextLeaveTypeId = e.target.value;
              const nextType = leaveTypes.find((type) => type.id === nextLeaveTypeId);
              clearFormError();
              setLeaveTypeId(nextLeaveTypeId);
              if (nextType?.requiresDocument !== true) setSupportingDocRef('');
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Select…</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <ApplyLeaveContextPanel
          balance={balanceForType}
          leaveType={selectedType}
          policy={policyForType}
          requiresDocument={requiresDocument}
        />

        <UpcomingHolidaysList holidays={upcomingHolidays} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => {
              clearFormError();
              setFromDate(e.target.value);
            }}
            fullWidth
            required
          />
          <Input
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => {
              clearFormError();
              setToDate(e.target.value);
            }}
            fullWidth
            required
          />
        </div>

        <label
          className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ${
            !halfDayEligible ? 'cursor-not-allowed opacity-60' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={halfDayEligible && isHalfDay}
            disabled={!halfDayEligible}
            onChange={(e) => {
              clearFormError();
              const on = e.target.checked;
              setIsHalfDay(on);
              if (!on) setHalfDaySession('');
            }}
            className="rounded border-gray-300"
          />
          Half day
          {!halfDayAllowed && (
            <span className="text-xs text-gray-500">(not allowed for this leave type)</span>
          )}
          {isMultiDay && halfDayAllowed && (
            <span className="text-xs text-gray-500">(not available for multi-day range)</span>
          )}
        </label>

        {halfDayEligible && isHalfDay && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session <span className="text-red-500">*</span>
            </label>
            <select
              value={halfDaySession}
              onChange={(e) => {
                clearFormError();
                setHalfDaySession(e.target.value as 'FIRST_HALF' | 'SECOND_HALF' | '');
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Select…</option>
              <option value="FIRST_HALF">First half</option>
              <option value="SECOND_HALF">Second half</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              clearFormError();
              setReason(e.target.value);
            }}
            rows={3}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Brief reason for leave"
          />
        </div>

        {(requiresDocument || supportingDocRef.trim()) && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Supporting document reference {requiresDocument && <span className="text-red-500">*</span>}
            </label>
            <Input
              value={supportingDocRef}
              onChange={(e) => {
                clearFormError();
                setSupportingDocRef(e.target.value);
              }}
              fullWidth
              placeholder="Link to uploaded file or ticket / reference ID"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting || !leaveTypes.length}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
