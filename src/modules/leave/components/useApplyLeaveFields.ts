import { useRef, useState } from 'react';

import type { ApplyLeaveField, ApplyLeaveFieldErrors } from './ApplyLeaveFormFields';
import { useApplyLeaveFocus } from './useApplyLeaveFocus';
import type { ApplyLeaveOwnership } from './useApplyLeaveForm';
import { useLeaveEntry } from './useLeaveEntry';

export interface ApplyLeaveFormError {
  title: string;
  message: string;
  context: unknown;
}
export const useApplyLeaveFields = (onClose: () => void, ownership: ApplyLeaveOwnership) => {
  const { activeSubmissionRef, dialogContext } = ownership;
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'FIRST_HALF' | 'SECOND_HALF' | ''>('');
  const [reason, setReason] = useState('');
  const [supportingDocumentFile, setSupportingDocumentFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplyLeaveFieldErrors>({});
  const [formError, setFormError] = useState<ApplyLeaveFormError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    fromDate,
    toDate,
    confirmDiscard,
    resetEntry,
    handleFromDateChange,
    handleToDateChange,
    handleClose,
    handleDiscard,
    clearDiscard,
  } = useLeaveEntry({
    hasOtherInput: [leaveTypeId, isHalfDay, halfDaySession, reason, supportingDocumentFile].some(
      Boolean
    ),
    canDismiss: () => activeSubmissionRef.current !== dialogContext,
    onDiscard: () => {
      resetForm();
      onClose();
    },
    onDateChange: (field) => clearFieldError(field),
  });

  const resetForm = () => {
    setLeaveTypeId('');
    resetEntry();
    setIsHalfDay(false);
    setHalfDaySession('');
    setReason('');
    setSupportingDocumentFile(null);
    formRef.current?.reset();
    setFieldErrors({});
    setFormError(null);
  };

  const clearFieldError = (field: ApplyLeaveField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const focusField = useApplyLeaveFocus(formRef, ownership);

  const showFieldError = (field: ApplyLeaveField, message: string) => {
    setFieldErrors({ [field]: message });
    setFormError(null);
    focusField(field);
  };

  return {
    leaveTypeId,
    isHalfDay,
    halfDaySession,
    reason,
    supportingDocumentFile,
    setLeaveTypeId,
    setIsHalfDay,
    setHalfDaySession,
    setReason,
    setSupportingDocumentFile,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    formRef,
    fromDate,
    toDate,
    confirmDiscard,
    handleFromDateChange,
    handleToDateChange,
    handleClose,
    handleDiscard,
    clearDiscard,
    resetForm,
    clearFieldError,
    focusField,
    showFieldError,
  };
};
