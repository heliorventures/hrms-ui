import { FormEvent, useEffect, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { AddManualAttendanceSegmentDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  type AttendanceSegmentInterval,
  validateManualAttendanceSegment,
} from '../../../utils/attendanceValidation';
import { formatBackendTime } from '../../../utils/timeFormat';

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkDate: string;
  defaultCheckIn?: string | null;
  defaultCheckOut?: string | null;
  existingSegments: AttendanceSegmentInterval[];
  onSaved: () => void;
}

const ManualAttendanceModal = ({
  isOpen,
  onClose,
  defaultWorkDate,
  defaultCheckIn,
  defaultCheckOut,
  existingSegments,
  onSaved,
}: ManualAttendanceModalProps) => {
  const client = useGraphClient('client');
  const [workDate, setWorkDate] = useState(defaultWorkDate);
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWorkDate(defaultWorkDate);
      setCheckIn(formatBackendTime(defaultCheckIn ?? '09:00').slice(0, 5));
      setCheckOut(formatBackendTime(defaultCheckOut ?? '18:00').slice(0, 5));
      setError(null);
    }
  }, [isOpen, defaultWorkDate, defaultCheckIn, defaultCheckOut]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationMessage = validateManualAttendanceSegment({
      workDate,
      checkIn,
      checkOut,
      existingSegments,
    });
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setBusy(true);
    try {
      await client.request(AddManualAttendanceSegmentDocument, {
        input: {
          workDate,
          checkInTime: `${checkIn}:00`,
          checkOutTime: `${checkOut}:00`,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust attendance (missed punches)">
      <form className="space-y-4" onSubmit={(ev) => void submit(ev)}>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Input
          type="date"
          label="Work date"
          value={workDate}
          onChange={(ev) => setWorkDate(ev.target.value)}
          fullWidth
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label="Punch in"
            value={checkIn}
            onChange={(ev) => setCheckIn(ev.target.value)}
            fullWidth
            required
          />
          <Input
            type="time"
            label="Punch out"
            value={checkOut}
            onChange={(ev) => setCheckOut(ev.target.value)}
            fullWidth
            required
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Adds one completed in/out segment for that calendar day. Outside your tenant self-service
          window the API requires an HR/manager regularization permission.
        </p>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save segment'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManualAttendanceModal;
