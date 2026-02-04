import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

interface SubmitTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitTravelModal = ({ isOpen, onClose }: SubmitTravelModalProps) => {
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromDate: '',
    toDate: '',
    purpose: '',
    estimatedCost: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Travel request submitted successfully!');
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Travel Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="From Location"
            type="text"
            name="fromLocation"
            value={formData.fromLocation}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="To Location"
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
            label="From Date"
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            fullWidth
          />

          <Input
            label="To Date"
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
          label="Estimated Cost (₹)"
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
            Purpose of Travel
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

        <div className="flex gap-3">
          <Button type="submit" variant="primary">
            Submit Request
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
