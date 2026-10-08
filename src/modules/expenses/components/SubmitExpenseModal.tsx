import { useMemo } from 'react';

import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { useExpenseSubmission } from '../hooks/useExpenseSubmission';
import type {
  ExpenseCategoryRow,
  ExpenseSubmissionHints,
  SubmitExpenseInput,
  TravelRequestRow,
} from '../types';

import ExpenseClaimFields from './ExpenseClaimFields';

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

const SubmitExpenseModal = (props: SubmitExpenseModalProps) => {
  const { categories, isOpen, loading, submitting, travelRequests } = props;
  const form = useExpenseSubmission(props);
  const busy = submitting || form.busy;
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
  return (
    <Modal
      isOpen={isOpen}
      isDismissible={!busy}
      onClose={form.close}
      title="Submit Expense Claim"
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={form.close} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-expense-form"
            variant="primary"
            disabled={busy || loading || categories.length === 0}
          >
            {form.uploading ? 'Uploading...' : busy ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      }
    >
      <form
        id="submit-expense-form"
        onSubmit={(event) => void form.submit(event)}
        className="space-y-3"
        autoComplete="off"
      >
        {form.error ? (
          <p role="alert" className="text-sm text-status-danger">
            {form.error}
          </p>
        ) : null}
        <ExpenseClaimFields
          form={form}
          disabled={busy}
          categoryOptions={categoryOptions}
          travelOptions={travelOptions}
        />
      </form>
    </Modal>
  );
};

export default SubmitExpenseModal;
