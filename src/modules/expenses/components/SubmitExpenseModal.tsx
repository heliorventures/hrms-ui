import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import { toDateInputValue } from '../../../utils/dateInput';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';
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
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(EXPENSE_DEFAULT_CURRENCY);
  const [expenseDate, setExpenseDate] = useState(() => toDateInputValue());
  const [title, setTitle] = useState('');
  const [travelRequestId, setTravelRequestId] = useState('');
  const [receiptFileStorageId, setReceiptFileStorageId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Select category' },
      ...categories.map((category) => ({
        value: category.id,
        label: `${category.name} (${category.code})`,
      })),
    ],
    [categories]
  );

  const travelOptions = useMemo(
    () => [
      { value: '', label: 'No linked trip' },
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
    setReceiptFileStorageId('');
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
    setFormError(null);
    try {
      await onSubmit({
        expenseCategoryId: categoryId,
        amount: amount.trim(),
        currency: currency.trim() || EXPENSE_DEFAULT_CURRENCY,
        expenseDate,
        title: title.trim(),
        ...(travelRequestId.trim() ? { travelRequestId: travelRequestId.trim() } : {}),
        ...(receiptFileStorageId.trim()
          ? { receiptFileStorageId: receiptFileStorageId.trim() }
          : {}),
      });
      close();
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Submit expense claim"
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
                Receipt file ID is required for this category.
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
          label="Expense date"
          value={expenseDate}
          onChange={(event) => setExpenseDate(event.target.value)}
          fullWidth
          required
        />
        <Input
          label="Receipt file ID"
          value={receiptFileStorageId}
          onChange={(event) => setReceiptFileStorageId(event.target.value)}
          fullWidth
          placeholder="Uploaded file UUID when required"
        />
        <Select
          label="Linked travel request"
          value={travelRequestId}
          onChange={(event) => setTravelRequestId(event.target.value)}
          options={travelOptions}
          fullWidth
        />
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loading || categories.length === 0}
          >
            {submitting ? 'Submitting...' : 'Submit'}
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
