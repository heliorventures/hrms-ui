import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';

import {
  AddManagedAttendanceSegmentDocument,
  UpdateManagedAttendanceSegmentDocument,
} from '../../../api/graphql/graphql';
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
  initialWorkDate?: string;
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
  const { length } = [...value.trim()];
  if (length < MIN_REASON_CHARACTERS) return 'Reason must be at least 5 characters.';
  if (length > MAX_REASON_CHARACTERS) return 'Reason must be 500 characters or fewer.';
  return null;
}

const useAttendanceFields = ({
  isOpen,
  editingRow,
  initialWorkDate,
}: Pick<AttendanceRegularizationModalProps, 'isOpen' | 'editingRow' | 'initialWorkDate'>) => {
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
    setWorkDate(editingRow?.workDate ?? initialWorkDate ?? todayIso());
    setCheckIn(formatBackendTime(editingRow?.checkInTime ?? DEFAULT_CHECK_IN).slice(0, 5));
    setCheckOut(formatBackendTime(editingRow?.checkOutTime ?? DEFAULT_CHECK_OUT).slice(0, 5));
    setReason('');
    setBusy(false);
    setFieldErrors({});
    setFormError(null);
  }, [client, editingRow, initialWorkDate, isOpen]);

  return {
    client,
    workDateRef,
    checkInRef,
    checkOutRef,
    reasonRef,
    mountedRef,
    mutationGeneration,
    workDate,
    setWorkDate,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    reason,
    setReason,
    busy,
    setBusy,
    fieldErrors,
    setFieldErrors,
    formError,
    setFormError,
    isEditing,
  };
};

export const useAttendanceRegularization = ({
  isOpen,
  onClose,
  employee,
  initialWorkDate,
  editingRow,
  existingSegments,
  existingSegmentsComplete,
  existingSegmentsCoverage,
  onSaved,
}: AttendanceRegularizationModalProps) => {
  const fields = useAttendanceFields({ isOpen, editingRow, initialWorkDate });
  const {
    client,
    workDateRef,
    checkInRef,
    checkOutRef,
    reasonRef,
    mountedRef,
    mutationGeneration,
    workDate,
    checkIn,
    checkOut,
    reason,
    setBusy,
    setFieldErrors,
    setFormError,
  } = fields;

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

  return { ...fields, submit };
};
