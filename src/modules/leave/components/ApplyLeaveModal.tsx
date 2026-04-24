import { FormEvent, useState } from 'react';
import { gql } from 'graphql-request';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';

const SUBMIT_LEAVE = gql`
  mutation SubmitLeaveRequestUi($input: SubmitLeaveRequestInput!) {
    submitLeaveRequest(input: $input) {
      id
      status
      fromDate
      toDate
      daysRequested
    }
  }
`;

export interface ApplyLeaveTypeOption {
  id: string;
  name: string;
  code: string;
}

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: ApplyLeaveTypeOption[];
  onSubmitted: () => void;
}

const ApplyLeaveModal = ({ isOpen, onClose, leaveTypes, onSubmitted }: ApplyLeaveModalProps) => {
  const client = useGraphClient('client');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!leaveTypeId || !fromDate || !toDate) {
      setFormError('Choose a leave type and date range.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await client.request(SUBMIT_LEAVE, {
        input: {
          leaveTypeId,
          fromDate,
          toDate,
          isHalfDay,
          halfDaySession: halfDaySession.trim() || null,
          reason: reason.trim() || null,
        },
      });
      onSubmitted();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Leave type
          </label>
          <select
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Select…</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="date"
            label="From"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            required
          />
          <Input
            type="date"
            label="To"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isHalfDay}
            onChange={(e) => setIsHalfDay(e.target.checked)}
            className="rounded border-gray-300"
          />
          Half day
        </label>

        {isHalfDay && (
          <Input
            label="Session (e.g. FIRST_HALF)"
            value={halfDaySession}
            onChange={(e) => setHalfDaySession(e.target.value)}
            fullWidth
            placeholder="Optional"
          />
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Optional"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={submitting || !leaveTypes.length}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyLeaveModal;
