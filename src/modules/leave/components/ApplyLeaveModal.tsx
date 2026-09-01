import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import PageNotice from '../../../components/common/PageNotice';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { SubmitLeaveRequestDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { ApplyLeaveContextPanel, UpcomingHolidaysList } from './ApplyLeaveSupportingInfo';
import ApplyLeaveFormFields, {
  type ApplyLeaveField,
  type ApplyLeaveFieldErrors,
} from './ApplyLeaveFormFields';
import {
  calendarDaysBeforeLeaveStart,
  requestedLeaveDays,
  type ApplyBalanceRow,
  type ApplyHolidayRow,
  type ApplyLeavePolicyRow,
  type ApplyLeaveTypeOption,
} from './applyLeavePolicy';
import {
  useApplyLeaveDialogOwnership,
  type ApplyLeaveDialogContext,
} from './useApplyLeaveDialogOwnership';

export type { ApplyBalanceRow, ApplyHolidayRow, ApplyLeavePolicyRow, ApplyLeaveTypeOption } from './applyLeavePolicy';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: ApplyLeaveTypeOption[];
  leavePolicies: ApplyLeavePolicyRow[];
  upcomingHolidays: ApplyHolidayRow[];
  leaveBalances: ApplyBalanceRow[];
  onSubmitted: () => void;
}

interface ApplyLeaveFormError {
  title: string;
  message: string;
  context: ApplyLeaveDialogContext<ReturnType<typeof useGraphClient>>;
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
  const { activeSubmissionRef, dialogContext, dialogContextRef } =
    useApplyLeaveDialogOwnership(client, isOpen);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'FIRST_HALF' | 'SECOND_HALF' | ''>('');
  const [reason, setReason] = useState('');
  const [supportingDocRef, setSupportingDocRef] = useState('');
  const [submittingContext, setSubmittingContext] =
    useState<ApplyLeaveDialogContext<typeof client> | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplyLeaveFieldErrors>({});
  const [formError, setFormError] = useState<ApplyLeaveFormError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const mountedRef = useRef(false);
  const submitting = submittingContext === dialogContext;
  const visibleFormError = formError?.context === dialogContext ? formError : null;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
  const consumesLeaveBalance = selectedType?.isPaid !== false;
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
  }, [halfDayAllowed, isMultiDay, leaveTypeId]);

  const resetForm = () => {
    setLeaveTypeId('');
    setFromDate('');
    setToDate('');
    setIsHalfDay(false);
    setHalfDaySession('');
    setReason('');
    setSupportingDocRef('');
    setFieldErrors({});
    setFormError(null);
  };

  const handleClose = () => {
    if (activeSubmissionRef.current === dialogContext) return;
    resetForm();
    onClose();
  };

  const clearFieldError = (field: ApplyLeaveField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const focusField = (field: ApplyLeaveField) => {
    window.requestAnimationFrame(() => {
      const control = formRef.current?.elements.namedItem(field);
      if (control instanceof HTMLElement) control.focus();
    });
  };

  const showFieldError = (field: ApplyLeaveField, message: string) => {
    setFieldErrors({ [field]: message });
    setFormError(null);
    focusField(field);
  };

  const handleLeaveTypeChange = (nextLeaveTypeId: string) => {
    const nextType = leaveTypes.find((type) => type.id === nextLeaveTypeId);
    clearFieldError('leaveTypeId');
    setLeaveTypeId(nextLeaveTypeId);
    if (nextType?.requiresDocument !== true) setSupportingDocRef('');
  };
  const handleFromDateChange = (value: string) => {
    clearFieldError('fromDate');
    setFromDate(value);
  };
  const handleToDateChange = (value: string) => {
    clearFieldError('toDate');
    setToDate(value);
  };
  const handleHalfDayChange = (checked: boolean) => {
    clearFieldError('halfDaySession');
    setIsHalfDay(checked);
    if (!checked) setHalfDaySession('');
  };
  const handleHalfDaySessionChange = (value: 'FIRST_HALF' | 'SECOND_HALF' | '') => {
    clearFieldError('halfDaySession');
    setHalfDaySession(value);
  };
  const handleReasonChange = (value: string) => {
    clearFieldError('reason');
    setReason(value);
  };
  const handleSupportingDocumentChange = (value: string) => {
    clearFieldError('supportingDocumentReference');
    setSupportingDocRef(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const submissionContext = dialogContextRef.current;
    if (!submissionContext.isOpen || activeSubmissionRef.current === submissionContext) return;
    setFieldErrors({});
    setFormError(null);
    if (!leaveTypeId) {
      showFieldError('leaveTypeId', 'Choose a leave type.');
      return;
    }
    if (!fromDate) {
      showFieldError('fromDate', 'Choose the first day of leave.');
      return;
    }
    if (!toDate) {
      showFieldError('toDate', 'Choose the last day of leave.');
      return;
    }
    if (toDate < fromDate) {
      showFieldError('toDate', 'To date must be on or after from date.');
      return;
    }
    const reasonTrim = reason.trim();
    if (!reasonTrim) {
      showFieldError('reason', 'Enter a reason for your leave.');
      return;
    }
    if (requiresDocument && !supportingDocRef.trim()) {
      showFieldError(
        'supportingDocumentReference',
        'Add a document reference, such as an upload link or ticket ID.'
      );
      return;
    }
    if (isHalfDay && !halfDaySession) {
      showFieldError('halfDaySession', 'Choose first half or second half.');
      return;
    }

    const leadDays = calendarDaysBeforeLeaveStart(fromDate);
    if (
      !Number.isNaN(leadDays) &&
      policyForType?.minNoticeDays != null &&
      policyForType.minNoticeDays > 0 &&
      leadDays < policyForType.minNoticeDays
    ) {
      showFieldError(
        'fromDate',
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
      showFieldError(
        'fromDate',
        'No chargeable working days in this range (weekends and holidays only). Adjust dates or choose another leave type.'
      );
      return;
    }
    if (consumesLeaveBalance && !balanceForType) {
      showFieldError(
        'leaveTypeId',
        'This leave type is not provisioned for your employee record. Ask HR to provision balances first.'
      );
      return;
    }
    const availableDays = Number(balanceForType?.balanceDays ?? 0);
    if (consumesLeaveBalance && Number.isFinite(availableDays) && availableDays < reqDays) {
      showFieldError(
        'leaveTypeId',
        `Insufficient leave balance. Available: ${availableDays} day(s), requested: ${reqDays} day(s).`
      );
      return;
    }
    if (
      policyForType?.maxConsecutiveDays != null &&
      policyForType.maxConsecutiveDays > 0 &&
      reqDays > policyForType.maxConsecutiveDays
    ) {
      showFieldError(
        'toDate',
        `Policy allows at most ${policyForType.maxConsecutiveDays} consecutive day(s) for this leave type (this request is ${reqDays} day(s)).`
      );
      return;
    }

    activeSubmissionRef.current = submissionContext;
    setSubmittingContext(submissionContext);
    try {
      await submissionContext.client.request(SubmitLeaveRequestDocument, {
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
      if (
        mountedRef.current &&
        dialogContextRef.current === submissionContext &&
        activeSubmissionRef.current === submissionContext
      ) {
        onSubmitted();
        resetForm();
        onClose();
      }
    } catch (err) {
      if (
        mountedRef.current &&
        dialogContextRef.current === submissionContext &&
        activeSubmissionRef.current === submissionContext
      ) {
        setFormError({
          context: submissionContext,
          title: 'Leave application was not submitted',
          message: graphQlUserMessage(err),
        });
      }
    } finally {
      if (activeSubmissionRef.current === submissionContext) {
        activeSubmissionRef.current = null;
        if (mountedRef.current && dialogContextRef.current === submissionContext) {
          setSubmittingContext(null);
        }
      }
    }
  };

  const supportingInformation = (
    <>
      <ApplyLeaveContextPanel
        balance={balanceForType}
        leaveType={selectedType}
        policy={policyForType}
        requiresDocument={requiresDocument}
      />
      <UpcomingHolidaysList holidays={upcomingHolidays} />
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Apply For Leave"
      size="lg"
      isDismissible={!submitting}
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        {visibleFormError ? (
          <PageNotice
            key={`${visibleFormError.title}:${visibleFormError.message}`}
            variant="error"
            title={visibleFormError.title}
            focusOnMount
          >
            {visibleFormError.message}
          </PageNotice>
        ) : null}

        <ApplyLeaveFormFields
          leaveTypeId={leaveTypeId}
          leaveTypeOptions={leaveTypeOptions}
          onLeaveTypeChange={handleLeaveTypeChange}
          supportingInformation={supportingInformation}
          fromDate={fromDate}
          onFromDateChange={handleFromDateChange}
          toDate={toDate}
          onToDateChange={handleToDateChange}
          halfDayAllowed={halfDayAllowed}
          halfDayEligible={halfDayEligible}
          isHalfDay={isHalfDay}
          onHalfDayChange={handleHalfDayChange}
          halfDaySession={halfDaySession}
          onHalfDaySessionChange={handleHalfDaySessionChange}
          reason={reason}
          onReasonChange={handleReasonChange}
          requiresDocument={requiresDocument}
          supportingDocumentReference={supportingDocRef}
          onSupportingDocumentReferenceChange={handleSupportingDocumentChange}
          fieldErrors={fieldErrors}
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!leaveTypes.length}
            busy={submitting}
            busyLabel="Submitting leave application…"
          >
            Submit Application
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
