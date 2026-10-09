import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { SubmitTravelRequestDocument } from '../../../api/graphql/graphql';
import { useActionFeedback } from '../../../hooks/useActionFeedback';
import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
import { normalizeMoneyForInput } from '../utils/amountValidation';

import { useSubmissionFile } from './useSubmissionFile';

interface TravelSubmissionOptions {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const useTravelSubmission = ({ isOpen, onClose, onSubmitted }: TravelSubmissionOptions) => {
  const notifyAction = useActionFeedback();

  const client = useGraphClient('client');
  const {
    file,
    inputKey,
    setFile,
    reset: resetFile,
    ensureUploaded,
    ownerIdentity,
    captureOwner,
  } = useSubmissionFile(client);
  const submissionLock = useRef(false);
  const minTravelDate = toDateInputValue();
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromDate: '',
    toDate: '',
    purpose: '',
    estimatedCost: '',
  });
  const [submitError, setSubmitError] = useFeedbackState<string | null>(null, 'error');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setFormData({
      fromLocation: '',
      toLocation: '',
      fromDate: '',
      toDate: '',
      purpose: '',
      estimatedCost: '',
    });
    setSubmitError(null);
    resetFile();
  }, [resetFile, setSubmitError]);

  useEffect(() => {
    reset();
    submissionLock.current = false;
    setSubmitting(false);
  }, [isOpen, ownerIdentity, reset]);

  const close = () => {
    if (submissionLock.current) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submissionLock.current) return;
    const estimate = normalizeMoneyForInput(formData.estimatedCost);
    if (
      !file ||
      !formData.purpose.trim() ||
      !formData.fromLocation.trim() ||
      !formData.toLocation.trim()
    ) {
      setSubmitError('Locations, purpose, and a supporting file are required.');
      return;
    }
    if (!estimate) {
      setSubmitError('Estimated cost must be a non-negative amount with up to 2 decimal places.');
      return;
    }
    if (
      !formData.fromDate ||
      !formData.toDate ||
      formData.fromDate < minTravelDate ||
      formData.fromDate > formData.toDate
    ) {
      setSubmitError('Travel dates must start today or later and end on or after the start.');
      return;
    }
    submissionLock.current = true;
    const stillOwned = captureOwner();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const purpose = `${formData.fromLocation} → ${formData.toLocation} — ${formData.purpose.trim()}`;
      const supportingFileStorageId = await ensureUploaded();
      if (!stillOwned()) return;
      const input = {
        originLocation: formData.fromLocation,
        destinationLocation: formData.toLocation,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        purpose,
        estimatedAmount: estimate,
        currency: EXPENSE_DEFAULT_CURRENCY,
        supportingFileStorageId,
      };
      await client.request(SubmitTravelRequestDocument, { input });
      if (!stillOwned()) return;
      notifyAction('submitted');
      onSubmitted?.();
      onClose();
      reset();
    } catch (err) {
      if (stillOwned()) setSubmitError(graphQlUserMessage(err));
    } finally {
      if (stillOwned()) {
        submissionLock.current = false;
        setSubmitting(false);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    submitError,
    submitting,
    minTravelDate,
    inputKey,
    setFile,
    close,
    handleSubmit,
    handleChange,
  };
};

export type TravelSubmissionForm = ReturnType<typeof useTravelSubmission>;
