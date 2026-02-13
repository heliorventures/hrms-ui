import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useDataStore } from '../../../store/DataStoreContext';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import type { LeaveType } from '../../../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplyLeaveModal = ({ isOpen, onClose }: ApplyLeaveModalProps) => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { getLeaveBalances, addLeaveApplication } = useDataStore();
  const leaveBalances = user ? getLeaveBalances(currentTenant.id, user.id) : [];

  const [formData, setFormData] = useState({
    leaveType: 'casual' as LeaveType,
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const leaveTypeOptions = leaveBalances.map((lb) => ({
    value: lb.leaveType,
    label: `${lb.leaveType.charAt(0).toUpperCase() + lb.leaveType.slice(1)} (${lb.available} available)`,
  }));

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays();
    const selectedBalance = leaveBalances.find(
      (lb) => lb.leaveType === formData.leaveType
    );

    if (selectedBalance && days > selectedBalance.available) {
      alert('Insufficient leave balance!');
      return;
    }

    if (!user) return;

    addLeaveApplication({
      tenantId: currentTenant.id,
      userId: user.id,
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      days,
      reason: formData.reason,
      status: 'pending',
    });

    setFormData({
      leaveType: 'casual',
      fromDate: '',
      toDate: '',
      reason: '',
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Leave Type"
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          options={leaveTypeOptions}
          required
          fullWidth
        />

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

        {formData.fromDate && formData.toDate && (
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Total Days: <span className="font-semibold">{calculateDays()}</span>
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
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
            Submit Application
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
