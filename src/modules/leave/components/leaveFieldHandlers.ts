import type { ApplyLeaveTypeOption } from './applyLeavePolicy';
import type { useApplyLeaveFields } from './useApplyLeaveFields';

export function leaveFieldHandlers(
  leaveTypes: ApplyLeaveTypeOption[],
  fields: Pick<
    ReturnType<typeof useApplyLeaveFields>,
    | 'setLeaveTypeId'
    | 'setIsHalfDay'
    | 'setHalfDaySession'
    | 'setReason'
    | 'setSupportingDocumentFile'
    | 'clearFieldError'
  >
) {
  const {
    setLeaveTypeId,
    setIsHalfDay,
    setHalfDaySession,
    setReason,
    setSupportingDocumentFile,
    clearFieldError,
  } = fields;
  const handleLeaveTypeChange = (nextLeaveTypeId: string) => {
    const nextType = leaveTypes.find((type) => type.id === nextLeaveTypeId);
    clearFieldError('leaveTypeId');
    setLeaveTypeId(nextLeaveTypeId);
    if (nextType?.requiresDocument !== true) setSupportingDocumentFile(null);
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
  const handleSupportingDocumentChange = (value: File | null) => {
    clearFieldError('supportingDocumentFile');
    setSupportingDocumentFile(value);
  };

  return {
    handleLeaveTypeChange,
    handleHalfDayChange,
    handleHalfDaySessionChange,
    handleReasonChange,
    handleSupportingDocumentChange,
  };
}
