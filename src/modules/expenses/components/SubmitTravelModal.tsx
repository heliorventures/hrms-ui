import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { SubmitTravelRequestDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { EXPENSE_DEFAULT_CURRENCY } from '../constants';

interface SubmitTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const SubmitTravelModal = ({ isOpen, onClose, onSubmitted }: SubmitTravelModalProps) => {
  const client = useGraphClient('client');
  const minTravelDate = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromDate: '',
    toDate: '',
    purpose: '',
    estimatedCost: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const purpose = `${formData.fromLocation} → ${formData.toLocation} — ${formData.purpose.trim()}`;
      const est = formData.estimatedCost.trim();
      await client.request(SubmitTravelRequestDocument, {
        input: {
          originLocation: formData.fromLocation,
          destinationLocation: formData.toLocation,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          purpose,
          estimatedAmount: est === '' ? null : String(Number.parseFloat(est).toFixed(2)),
          currency: EXPENSE_DEFAULT_CURRENCY,
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
      setSubmitError(graphQlUserMessage(err));
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
            min={minTravelDate}
            required
            fullWidth
          />

          <Input
            label="To date"
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            min={formData.fromDate || minTravelDate}
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
          Creates a <strong>pending travel request</strong>. When your tenant configures a{' '}
          <span className="font-mono">TRAVEL_REQUEST</span> workflow, approval follows{' '}
          <strong>manager first</strong>, then designated roles such as <strong>accounting</strong>{' '}
          (fallback single-step routing still applies without a workflow).
        </p>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting}>
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
