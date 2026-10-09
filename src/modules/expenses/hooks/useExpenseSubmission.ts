import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { validateTenantUploadFile } from '../../../utils/tenantFileUpload';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
import type { ExpenseSubmissionHints, SubmitExpenseInput } from '../types';
import { normalizeCurrencyCode } from '../utils/amountValidation';
import { expenseDraftError, type ExpenseDraft } from '../utils/expenseSubmissionValidation';

import { useSubmissionFile } from './useSubmissionFile';

interface Options {
  isOpen: boolean;
  submissionHints: ExpenseSubmissionHints | null;
  onCategoryChange: (id: string) => void;
  onClose: () => void;
  onSubmit: (input: SubmitExpenseInput) => Promise<void>;
}
const initialDraft = (): ExpenseDraft => ({
  categoryId: '',
  amount: '',
  currency: EXPENSE_DEFAULT_CURRENCY,
  expenseDate: toDateInputValue(),
  title: '',
  travelRequestId: '',
});

export const useExpenseSubmission = ({
  isOpen,
  submissionHints,
  onCategoryChange,
  onClose,
  onSubmit,
}: Options) => {
  const evidence = useSubmissionFile(useGraphClient('client'));
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const lock = useRef(false);
  const hints = submissionHints?.expenseCategoryId === draft.categoryId ? submissionHints : null;
  const resetFile = evidence.reset;
  const reset = useCallback(() => {
    setDraft(initialDraft());
    setError(null);
    resetFile();
  }, [resetFile, setError]);
  useEffect(() => {
    reset();
    lock.current = false;
    setBusy(false);
    setUploading(false);
  }, [isOpen, evidence.ownerIdentity, reset]);
  useEffect(() => {
    if (isOpen) onCategoryChange(draft.categoryId);
  }, [draft.categoryId, isOpen, onCategoryChange]);
  const change = (values: Partial<ExpenseDraft>) =>
    setDraft((current) => ({ ...current, ...values }));
  const close = () => {
    if (!lock.current) {
      reset();
      onClose();
    }
  };
  const setReceipt = (file: File | null) => {
    evidence.setFile(file);
    setError(file ? validateTenantUploadFile(file, 'Receipt') : null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    const validation = expenseDraftError(draft, hints);
    if (validation || !evidence.file) {
      setError(validation ?? 'A receipt is required for every expense claim.');
      return;
    }
    lock.current = true;
    const stillOwned = evidence.captureOwner();
    setBusy(true);
    setError(null);
    try {
      setUploading(true);
      const receiptFileStorageId = await evidence.ensureUploaded();
      if (!stillOwned()) return;
      setUploading(false);
      await onSubmit({
        expenseCategoryId: draft.categoryId,
        amount: draft.amount.trim(),
        currency: normalizeCurrencyCode(draft.currency) ?? EXPENSE_DEFAULT_CURRENCY,
        expenseDate: draft.expenseDate,
        title: draft.title.trim(),
        travelRequestId: draft.travelRequestId.trim() || undefined,
        receiptFileStorageId,
      });
      if (!stillOwned()) return;
      reset();
      onClose();
    } catch (cause) {
      if (stillOwned()) setError(graphQlUserMessage(cause));
    } finally {
      if (stillOwned()) {
        lock.current = false;
        setBusy(false);
        setUploading(false);
      }
    }
  };
  return {
    draft,
    change,
    error,
    busy,
    uploading,
    hints,
    fileInputKey: evidence.inputKey,
    setReceipt,
    submit,
    close,
  };
};

export type ExpenseSubmissionForm = ReturnType<typeof useExpenseSubmission>;
