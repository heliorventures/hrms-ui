import { useEffect, useRef, useState, type FormEvent } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import { persistLeaveApplication } from './persistLeaveApplication';
import type { useApplyLeaveFields } from './useApplyLeaveFields';
import type { ApplyLeaveOwnership, ApplyLeaveModalProps } from './useApplyLeaveForm';
import type { useApplyLeaveSelection } from './useApplyLeaveSelection';
import { validateLeaveApplication } from './validateLeaveApplication';

export const useApplyLeaveSubmission = (
  props: ApplyLeaveModalProps,
  fields: ReturnType<typeof useApplyLeaveFields>,
  selection: ReturnType<typeof useApplyLeaveSelection>,
  ownership: ApplyLeaveOwnership
) => {
  const {
    upcomingHolidaysLoading,
    upcomingHolidaysFailure,
    upcomingHolidays,
    onSubmitted,
    onClose,
  } = props;
  const { activeSubmissionRef, dialogContext, dialogContextRef } = ownership;
  const { clearDiscard, setFieldErrors, setFormError, showFieldError, resetForm } = fields;
  const [submittingContext, setSubmittingContext] = useState<typeof dialogContext | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const releaseSubmission = (submissionContext: typeof dialogContext) => {
    if (activeSubmissionRef.current !== submissionContext) return;
    activeSubmissionRef.current = null;
    if (mountedRef.current && dialogContextRef.current === submissionContext)
      setSubmittingContext(null);
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const submissionContext = dialogContextRef.current;
    if (!submissionContext.isOpen || activeSubmissionRef.current === submissionContext) return;
    clearDiscard();
    setFieldErrors({});
    setFormError(null);
    if (upcomingHolidaysLoading || upcomingHolidaysFailure) return;
    const failure = validateLeaveApplication({ ...fields, ...selection, upcomingHolidays });
    if (failure) {
      showFieldError(failure.field, failure.message);
      return;
    }
    const isCurrentSubmission = () =>
      mountedRef.current &&
      dialogContextRef.current === submissionContext &&
      activeSubmissionRef.current === submissionContext;
    activeSubmissionRef.current = submissionContext;
    setSubmittingContext(submissionContext);
    try {
      await persistLeaveApplication(
        submissionContext.client,
        fields,
        selection.halfDayEligible,
        isCurrentSubmission
      );
      if (isCurrentSubmission()) {
        onSubmitted();
        resetForm();
        onClose();
      }
    } catch (err) {
      if (isCurrentSubmission()) {
        setFormError({
          context: submissionContext,
          title: 'Leave application was not submitted',
          message: graphQlUserMessage(err),
        });
      }
    } finally {
      releaseSubmission(submissionContext);
    }
  };
  return { handleSubmit, submitting: submittingContext === dialogContext };
};
