import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { ExpenseType } from '../../../types';

interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitExpenseModal = ({ isOpen, onClose }: SubmitExpenseModalProps) => {
  const [formData, setFormData] = useState({
    type: 'travel' as ExpenseType,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const expenseTypeOptions = [
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Meals' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'supplies', label: 'Office Supplies' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Expense claim submitted successfully!');
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Expense Claim">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Expense Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={expenseTypeOptions}
            required
            fullWidth
          />

          <Input
            label="Amount (₹)"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            fullWidth
          />
        </div>

        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          required
          fullWidth
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-600">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Bill (Optional)
          </label>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-700">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Click to upload bill image
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            Submit Claim
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitExpenseModal;
