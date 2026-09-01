import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';

import {
  AddManagedAttendanceSegmentDocument,
  UpdateManagedAttendanceSegmentDocument,
} from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import Textarea from '../../../components/common/Textarea';
import { useGraphClient } from '../../../hooks/useGraphClient';
import {
  type AttendanceSegmentInterval,
  type ExistingSegmentsCoverage,
  type ManualAttendanceField,
  validateManualAttendanceSegment,
} from '../../../utils/attendanceValidation';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../../utils/timeFormat';

import type { ManagedAttendanceEmployee, ManagedAttendanceRow } from './managedAttendanceTypes';

const DEFAULT_CHECK_IN = '09:00';
const DEFAULT_CHECK_OUT = '18:00';
const MIN_REASON_CHARACTERS = 5;
const MAX_REASON_CHARACTERS = 500;

type FieldErrors = Partial<Record<Exclude<ManualAttendanceField, 'form'> | 'reason', string>>;

export interface AttendanceRegularizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: ManagedAttendanceEmployee;
  editingRow?: ManagedAttendanceRow | null;
  existingSegments: AttendanceSegmentInterval[];
  existingSegmentsComplete: boolean;
  existingSegmentsCoverage: ExistingSegmentsCoverage;
  onSaved: (employeeName: string, workDate: string) => void;
}

function todayIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function reasonError(value: string): string | null {
  const length = [...value.trim()].length;
  if (length < MIN_REASON_CHARACTERS) return 'Reason must be at least 5 characters.';
  if (length > MAX_REASON_CHARACTERS) return 'Reason must be 500 characters or fewer.';
  return null;
}

const AttendanceRegularizationModal = ({
  isOpen,
  onClose,
  employee,
  editingRow,
  existingSegments,
  existingSegmentsComplete,
  existingSegmentsCoverage,
  onSaved,
}: AttendanceRegularizationModalProps) => {
  const client = useGraphClient('client');
  const workDateRef = useRef<HTMLInputElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(false);
  const mutationGeneration = useRef(0);
  const [workDate, setWorkDate] = useState(todayIso);
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = editingRow !== null && editingRow !== undefined;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    mutationGeneration.current += 1;
    return () => {
      mutationGeneration.current += 1;
    };
  }, [client]);

  useEffect(() => {
    if (!isOpen) return;
    setWorkDate(editingRow?.workDate ?? todayIso());
    setCheckIn(formatBackendTime(editingRow?.checkInTime ?? DEFAULT_CHECK_IN).slice(0, 5));
    setCheckOut(formatBackendTime(editingRow?.checkOutTime ?? DEFAULT_CHECK_OUT).slice(0, 5));
    setReason('');
    setBusy(false);
    setFieldErrors({});
    setFormError(null);
  }, [client, editingRow, isOpen]);

  const focusAttendanceField = (field: Exclude<ManualAttendanceField, 'form'>) => {
    const refs = { workDate: workDateRef, checkIn: checkInRef, checkOut: checkOutRef };
    refs[field].current?.focus();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const attendanceError = validateManualAttendanceSegment({
      workDate,
      checkIn,
      checkOut,
      existingSegments,
      existingSegmentsComplete,
      existingSegmentsCoverage,
      excludedSegmentId: editingRow?.id,
    });
    if (attendanceError) {
      if (attendanceError.field === 'form') setFormError(attendanceError.message);
      else {
        setFieldErrors({ [attendanceError.field]: attendanceError.message });
        focusAttendanceField(attendanceError.field);
      }
      return;
    }

    const normalizedReason = reason.trim();
    const invalidReason = reasonError(reason);
    if (invalidReason) {
      setFieldErrors({ reason: invalidReason });
      reasonRef.current?.focus();
      return;
    }

    const attendanceInput = {
      workDate,
      checkInTime: `${checkIn}:00`,
      checkOutTime: `${checkOut}:00`,
      reason: normalizedReason,
    };
    const submissionClient = client;
    const generation = mutationGeneration.current;
    const isCurrentSubmission = () =>
      mountedRef.current && mutationGeneration.current === generation;
    setBusy(true);
    try {
      if (editingRow) {
        await submissionClient.request(UpdateManagedAttendanceSegmentDocument, {
          input: {
            id: editingRow.id,
            expectedUpdatedAt: editingRow.updatedAt,
            ...attendanceInput,
          },
        });
      } else {
        await submissionClient.request(AddManagedAttendanceSegmentDocument, {
          input: { employeeId: employee.employeeId, ...attendanceInput },
        });
      }
      if (!isCurrentSubmission()) return;
      onSaved(employee.employeeName, workDate);
      onClose();
    } catch (error) {
      if (!isCurrentSubmission()) return;
      setFormError(graphQlUserMessage(error, 'attendance-management'));
    } finally {
      if (isCurrentSubmission()) setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Adjust attendance segment' : 'Add attendance segment'}
      description="The employee is fixed from the attendance records in your approved scope."
      isDismissible={!busy}
    >
      <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
        {formError ? (
          <PageNotice variant="error" title="Attendance was not saved" focusOnMount>
            {formError}
          </PageNotice>
        ) : null}

        <div>
          <p className="text-sm font-medium text-content-primary">Employee</p>
          <p className="mt-1 rounded-lg bg-canvas px-3 py-2 text-sm text-content-secondary">
            {employee.employeeName} ({employee.employeeCode})
          </p>
        </div>
        <Input
          ref={workDateRef}
          type="date"
          label="Work Date"
          value={workDate}
          onChange={(event) => {
            setWorkDate(event.target.value);
            setFieldErrors((current) => ({ ...current, workDate: undefined }));
          }}
          error={fieldErrors.workDate}
          fullWidth
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            ref={checkInRef}
            type="time"
            label="Punch In"
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              setFieldErrors((current) => ({ ...current, checkIn: undefined }));
            }}
            error={fieldErrors.checkIn}
            fullWidth
            required
          />
          <Input
            ref={checkOutRef}
            type="time"
            label="Punch Out"
            value={checkOut}
            onChange={(event) => {
              setCheckOut(event.target.value);
              setFieldErrors((current) => ({ ...current, checkOut: undefined }));
            }}
            error={fieldErrors.checkOut}
            fullWidth
            required
          />
        </div>
        <Textarea
          ref={reasonRef}
          label="Reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setFieldErrors((current) => ({ ...current, reason: undefined }));
          }}
          description="Required for the immutable attendance adjustment audit. 5 to 500 characters."
          error={fieldErrors.reason}
          rows={4}
          fullWidth
          required
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Update segment' : 'Save segment'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceRegularizationModal;
