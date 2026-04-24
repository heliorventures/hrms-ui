import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';

const CATEGORIES = gql`
  query TravelExpenseCategories($limit: Int! = 50) {
    expenseCategories(limit: $limit) {
      id
      code
      name
    }
  }
`;

const SUBMIT = gql`
  mutation SubmitTravelExpense($input: SubmitExpenseInput!) {
    submitExpense(input: $input) {
      id
      status
      amount
      title
    }
  }
`;

interface SubmitTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const SubmitTravelModal = ({ isOpen, onClose, onSubmitted }: SubmitTravelModalProps) => {
  const client = useGraphClient('client');
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromDate: '',
    toDate: '',
    purpose: '',
    estimatedCost: '',
  });
  const [travelCategoryId, setTravelCategoryId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!isOpen) return;
    setLoadError(null);
    try {
      const res = await client.request<{
        expenseCategories: { id: string; code: string; name: string }[];
      }>(CATEGORIES, { limit: 50 });
      const travel = res.expenseCategories.find(
        (c) => c.code.toUpperCase() === 'TRAVEL' || c.name.toLowerCase().includes('travel')
      );
      setTravelCategoryId(travel?.id ?? res.expenseCategories[0]?.id ?? null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load categories');
    }
  }, [client, isOpen]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelCategoryId) {
      setSubmitError('No expense category available. Seed demo data or create a TRAVEL category.');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const title = `Travel: ${formData.fromLocation} → ${formData.toLocation} — ${formData.purpose.trim()}`;
      await client.request(SUBMIT, {
        input: {
          expenseCategoryId: travelCategoryId,
          amount: String(Number.parseFloat(formData.estimatedCost).toFixed(2)),
          currency: 'INR',
          expenseDate: formData.fromDate,
          title,
        },
      });
      onSubmitted?.();
      onClose();
      setFormData({
        fromLocation: '',
        toLocation: '',
        fromDate: '',
        toDate: '',
        purpose: '',
        estimatedCost: '',
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit travel request">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {loadError && <p className="text-sm text-amber-800 dark:text-amber-200">{loadError}</p>}
        {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="From location"
            type="text"
            name="fromLocation"
            value={formData.fromLocation}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="To location"
            type="text"
            name="toLocation"
            value={formData.toLocation}
            onChange={handleChange}
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="From date"
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            fullWidth
          />

          <Input
            label="To date"
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            min={formData.fromDate || new Date().toISOString().split('T')[0]}
            required
            fullWidth
          />
        </div>

        <Input
          label="Estimated cost (₹)"
          type="number"
          name="estimatedCost"
          value={formData.estimatedCost}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          fullWidth
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Purpose of travel
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Submits as a <strong>pending expense</strong> in the Travel category (see Expenses for
          approval flow).
        </p>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting || !travelCategoryId}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitTravelModal;
