import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

const CorrectionRequestModal = ({
  isOpen,
  onClose,
  date,
}: CorrectionRequestModalProps) => {
  const [formData, setFormData] = useState({
    correctPunchIn: '',
    correctPunchOut: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Correction request submitted successfully!');
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise Attendance Correction Request"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Date:{' '}
            <span className="font-medium">
              {new Date(date).toLocaleDateString('en-IN')}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Correct Punch In Time"
            type="time"
            name="correctPunchIn"
            value={formData.correctPunchIn}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Correct Punch Out Time"
            type="time"
            name="correctPunchOut"
            value={formData.correctPunchOut}
            onChange={handleChange}
            required
            fullWidth
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason for Correction
          </label>
          <textarea
            name="reason"
            value={formData.reason}
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

export default CorrectionRequestModal;
