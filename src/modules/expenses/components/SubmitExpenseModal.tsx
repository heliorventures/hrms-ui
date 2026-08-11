import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { uploadTenantFile, validateTenantUploadFile } from '../../../utils/tenantFileUpload';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
import {
  normalizeCurrencyCode,
  parseStrictMoney,
  validatePositiveMoney,
} from '../utils/amountValidation';
import { formatCurrency } from '../utils/formatters';
import type {
  ExpenseCategoryRow,
  ExpenseSubmissionHints,
  SubmitExpenseInput,
  TravelRequestRow,
} from '../types';

interface SubmitExpenseModalProps {
  categories: ExpenseCategoryRow[];
  isOpen: boolean;
  loading: boolean;
  submissionHints: ExpenseSubmissionHints | null;
  submitting: boolean;
  travelRequests: TravelRequestRow[];
  onCategoryChange: (expenseCategoryId: string) => void;
  onClose: () => void;
  onSubmit: (input: SubmitExpenseInput) => Promise<void>;
}

const SubmitExpenseModal = ({
  categories,
  isOpen,
  loading,
  submissionHints,
  submitting,
  travelRequests,
  onCategoryChange,
  onClose,
  onSubmit,
}: SubmitExpenseModalProps) => {
  const client = useGraphClient('client');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(EXPENSE_DEFAULT_CURRENCY);
  const [expenseDate, setExpenseDate] = useState(() => toDateInputValue());
  const [title, setTitle] = useState('');
  const [travelRequestId, setTravelRequestId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Select Category' },
      ...categories.map((category) => ({
        value: category.id,
        label: `${category.name} (${category.code})`,
      })),
    ],
    [categories]
  );

  const travelOptions = useMemo(
    () => [
      { value: '', label: 'No Linked Trip' },
      ...travelRequests
        .filter((row) => row.status.toUpperCase() !== 'REJECTED')
        .map((row) => ({
          value: row.id,
          label: `${row.destinationLocation ?? row.originLocation ?? 'Trip'} - ${row.fromDate}`,
        })),
    ],
    [travelRequests]
  );

  useEffect(() => {
    if (isOpen) onCategoryChange(categoryId);
  }, [categoryId, isOpen, onCategoryChange]);

  const reset = useCallback(() => {
    setCategoryId('');
    setAmount('');
    setCurrency(EXPENSE_DEFAULT_CURRENCY);
    setExpenseDate(toDateInputValue());
    setTitle('');
    setTravelRequestId('');
    setReceiptFile(null);
    setUploadingReceipt(false);
    setFormError(null);
  }, []);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryId || !title.trim() || !amount.trim()) {
      setFormError('Category, title, and amount are required.');
      return;
    }
    const amountError = validatePositiveMoney(amount, 'Amount');
    if (amountError) {
      setFormError(amountError);
      return;
    }
    const normalizedCurrency = normalizeCurrencyCode(currency);
    if (!normalizedCurrency) {
      setFormError('Currency must be a 3-letter ISO code.');
      return;
    }
    if (expenseDate > toDateInputValue()) {
      setFormError('Expense date cannot be in the future.');
      return;
    }
    const claimAmount = parseStrictMoney(amount);
    const maxAmountSource = submissionHints?.maxAmountPerClaim ?? '';
    const maxAmount = maxAmountSource ? parseStrictMoney(maxAmountSource) : NaN;
    if (Number.isFinite(maxAmount) && claimAmount > maxAmount) {
      setFormError(
        `Amount exceeds the category limit of ${formatCurrency(maxAmountSource, normalizedCurrency)}.`
      );
      return;
    }
    if (submissionHints?.receiptRequired && !receiptFile) {
      setFormError('Receipt is required for this category.');
      return;
    }
    if (receiptFile) {
      const receiptError = validateTenantUploadFile(receiptFile, 'Receipt');
      if (receiptError) {
        setFormError(receiptError);
        return;
      }
    }
    setFormError(null);
    let receiptFileStorageId: string | undefined;
    try {
      if (receiptFile) {
        setUploadingReceipt(true);
        receiptFileStorageId = await uploadTenantFile(client, receiptFile);
      }
      setUploadingReceipt(false);
      await onSubmit({
        expenseCategoryId: categoryId,
        amount: amount.trim(),
        currency: normalizedCurrency,
        expenseDate,
        title: title.trim(),
        ...(travelRequestId.trim() ? { travelRequestId: travelRequestId.trim() } : {}),
        ...(receiptFileStorageId ? { receiptFileStorageId } : {}),
      });
      close();
    } catch (err) {
      setUploadingReceipt(false);
      setFormError(graphQlUserMessage(err));
    }
  };

  const handleReceiptChange = (file: File | null) => {
    setReceiptFile(file);
    if (!file) {
      setFormError(null);
      return;
    }
    const receiptError = validateTenantUploadFile(file, 'Receipt');
    if (receiptError) {
      setFormError(receiptError);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Submit Expense Claim"
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4"
      >
        {formError ? <p className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}
        <Select
          label="Category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          options={categoryOptions}
          required
          fullWidth
        />
        {submissionHints ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {submissionHints.maxAmountPerClaim ? (
              <p>
                Max per claim:{' '}
                <strong>{formatCurrency(submissionHints.maxAmountPerClaim, currency)}</strong>
              </p>
            ) : null}
            {submissionHints.limitPerMonth ? (
              <p className="mt-1">
                Monthly limit:{' '}
                <strong>{formatCurrency(submissionHints.limitPerMonth, currency)}</strong>
              </p>
            ) : null}
            {submissionHints.receiptRequired ? (
              <p className="mt-1 font-medium text-amber-900 dark:text-amber-200">
                Receipt upload is required for this category.
              </p>
            ) : null}
          </div>
        ) : null}
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            fullWidth
            required
            inputMode="decimal"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            fullWidth
          />
        </div>
        <Input
          type="date"
          label="Expense Date"
          value={expenseDate}
          onChange={(event) => setExpenseDate(event.target.value)}
          fullWidth
          required
        />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Receipt
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(event) => handleReceiptChange(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:file:bg-gray-700 dark:file:text-gray-100"
            required={Boolean(submissionHints?.receiptRequired)}
          />
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            PDF, JPG, or PNG up to 6 MB.
          </span>
        </label>
        <Select
          label="Linked Travel Request"
          value={travelRequestId}
          onChange={(event) => setTravelRequestId(event.target.value)}
          options={travelOptions}
          fullWidth
        />
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || uploadingReceipt || loading || categories.length === 0}
          >
            {uploadingReceipt ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={close}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitExpenseModal;
