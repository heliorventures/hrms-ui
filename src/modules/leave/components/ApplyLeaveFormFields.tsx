import type { ChangeEvent, ReactNode } from 'react';

import Checkbox from '../../../components/common/Checkbox';
import FileInput from '../../../components/common/FileInput';
import Input from '../../../components/common/Input';
import Select, { type SelectOption } from '../../../components/common/Select';
import Textarea from '../../../components/common/Textarea';

type HalfDaySession = 'FIRST_HALF' | 'SECOND_HALF' | '';

export type ApplyLeaveField =
  | 'leaveTypeId'
  | 'fromDate'
  | 'toDate'
  | 'halfDaySession'
  | 'reason'
  | 'supportingDocumentFile';

export type ApplyLeaveFieldErrors = Partial<Record<ApplyLeaveField, string>>;

export interface ApplyLeaveFormFieldsProps {
  leaveTypeId: string;
  leaveTypeOptions: readonly SelectOption[];
  onLeaveTypeChange: (value: string) => void;
  supportingInformation?: ReactNode;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  halfDayAllowed: boolean;
  halfDayEligible: boolean;
  isHalfDay: boolean;
  onHalfDayChange: (checked: boolean) => void;
  halfDaySession: HalfDaySession;
  onHalfDaySessionChange: (value: HalfDaySession) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  requiresDocument: boolean;
  supportingDocumentFile: File | null;
  onSupportingDocumentFileChange: (value: File | null) => void;
  fieldErrors?: ApplyLeaveFieldErrors;
}

const SESSION_OPTIONS: readonly SelectOption[] = [
  { value: '', label: 'Select...' },
  { value: 'FIRST_HALF', label: 'First Half' },
  { value: 'SECOND_HALF', label: 'Second Half' },
];

const ApplyLeaveFormFields = ({
  leaveTypeId,
  leaveTypeOptions,
  onLeaveTypeChange,
  supportingInformation,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  halfDayAllowed,
  halfDayEligible,
  isHalfDay,
  onHalfDayChange,
  halfDaySession,
  onHalfDaySessionChange,
  reason,
  onReasonChange,
  requiresDocument,
  supportingDocumentFile,
  onSupportingDocumentFileChange,
  fieldErrors = {},
}: ApplyLeaveFormFieldsProps) => {
  const handleLeaveTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLeaveTypeChange(event.target.value);
  };
  const handleFromDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFromDateChange(event.target.value);
  };
  const handleToDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToDateChange(event.target.value);
  };
  const handleHalfDayChange = (event: ChangeEvent<HTMLInputElement>) => {
    onHalfDayChange(event.target.checked);
  };
  const handleSessionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onHalfDaySessionChange(event.target.value as HalfDaySession);
  };
  const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onReasonChange(event.target.value);
  };
  const handleSupportingDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSupportingDocumentFileChange(event.target.files?.[0] ?? null);
  };
  const halfDayDescription = !halfDayAllowed
    ? 'Not allowed for this leave type.'
    : !halfDayEligible
      ? 'Not available for a multi-day range.'
      : undefined;

  return (
    <>
      <Select
        name="leaveTypeId"
        label="Leave type"
        value={leaveTypeId}
        onChange={handleLeaveTypeChange}
        options={leaveTypeOptions}
        fullWidth
        required
        error={fieldErrors.leaveTypeId}
      />

      {supportingInformation}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="fromDate"
          type="date"
          label="From"
          value={fromDate}
          onChange={handleFromDateChange}
          fullWidth
          required
          error={fieldErrors.fromDate}
        />
        <Input
          name="toDate"
          type="date"
          label="To"
          value={toDate}
          onChange={handleToDateChange}
          fullWidth
          required
          error={fieldErrors.toDate}
        />
      </div>

      <Checkbox
        label="Half day"
        description={halfDayDescription}
        checked={halfDayEligible && isHalfDay}
        disabled={!halfDayEligible}
        onChange={handleHalfDayChange}
      />

      {halfDayEligible && isHalfDay ? (
        <Select
          name="halfDaySession"
          label="Session"
          value={halfDaySession}
          onChange={handleSessionChange}
          options={SESSION_OPTIONS}
          fullWidth
          required
          error={fieldErrors.halfDaySession}
        />
      ) : null}

      <Textarea
        name="reason"
        label="Reason"
        value={reason}
        onChange={handleReasonChange}
        rows={2}
        required
        fullWidth
        placeholder="Brief reason for leave"
        autoComplete="off"
        error={fieldErrors.reason}
      />

      {requiresDocument || supportingDocumentFile ? (
        <FileInput
          name="supportingDocumentFile"
          label="Supporting document"
          onChange={handleSupportingDocumentChange}
          fullWidth
          required={requiresDocument}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          description="Upload a PDF, JPG, or PNG file up to 6 MB."
          error={fieldErrors.supportingDocumentFile}
        />
      ) : null}
    </>
  );
};

export default ApplyLeaveFormFields;
