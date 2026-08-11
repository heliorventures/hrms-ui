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

const DEFAULT_CHECK_IN = '09:00';
const DEFAULT_CHECK_OUT = '18:00';

const UPDATE_MANUAL_ATTENDANCE_SEGMENT_DOCUMENT = `
  mutation UpdateManualAttendanceSegment($input: UpdateManualAttendanceSegmentInput!) {
    updateManualAttendanceSegment(input: $input) {
      id
      workDate
      checkInTime
      checkOutTime
      source
      status
    }
  }
`;

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkDate: string;
  editingSegmentId?: string | null;
  defaultCheckIn?: string | null;
  defaultCheckOut?: string | null;
  existingSegments: AttendanceSegmentInterval[];
  onSaved: () => void;
}

const ManualAttendanceModal = ({
  isOpen,
  onClose,
  defaultWorkDate,
  editingSegmentId,
  defaultCheckIn,
  defaultCheckOut,
  existingSegments,
  onSaved,
}: ManualAttendanceModalProps) => {
  const client = useGraphClient('client');
  const [workDate, setWorkDate] = useState(defaultWorkDate);
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(editingSegmentId);

  useEffect(() => {
    if (isOpen) {
      setWorkDate(defaultWorkDate);
      setCheckIn(formatBackendTime(defaultCheckIn ?? DEFAULT_CHECK_IN).slice(0, 5));
      setCheckOut(formatBackendTime(defaultCheckOut ?? DEFAULT_CHECK_OUT).slice(0, 5));
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
      excludedSegmentId: editingSegmentId,
    });
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setBusy(true);
    const input = {
      workDate,
      checkInTime: `${checkIn}:00`,
      checkOutTime: `${checkOut}:00`,
    };
    try {
      if (editingSegmentId) {
        await client.request(UPDATE_MANUAL_ATTENDANCE_SEGMENT_DOCUMENT, {
          input: {
            id: editingSegmentId,
            ...input,
          },
        });
      } else {
        await client.request(AddManualAttendanceSegmentDocument, { input });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Attendance Segment' : 'Adjust Attendance (Missed Punches)'}
    >
      <form className="space-y-4" onSubmit={(ev) => void submit(ev)}>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Input
          type="date"
          label="Work Date"
          value={workDate}
          onChange={(ev) => setWorkDate(ev.target.value)}
          fullWidth
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label="Punch In"
            value={checkIn}
            onChange={(ev) => setCheckIn(ev.target.value)}
            fullWidth
            required
          />
          <Input
            type="time"
            label="Punch Out"
            value={checkOut}
            onChange={(ev) => setCheckOut(ev.target.value)}
            fullWidth
            required
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isEditing ? 'Updates' : 'Adds'} one completed in/out segment for that calendar day.
          Outside your tenant self-service window the API requires an HR/manager regularization
          permission.
        </p>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving...' : isEditing ? 'Update Segment' : 'Save Segment'}
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
