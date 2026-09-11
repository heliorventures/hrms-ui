import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MutableRefObject,
} from 'react';

import {
  AttendanceAddManagedSegmentDocument,
  AttendanceUpdateManagedSegmentDocument,
} from '../../../api/attendance/graphql';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { localDateAt } from '../../../utils/attendanceDay';
import {
  type AttendanceSegmentInterval,
  type ExistingSegmentsCoverage,
  type ManualAttendanceField,
  validateManualAttendanceSegment,
} from '../../../utils/attendanceValidation';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../../utils/timeFormat';
import { useAttendanceCorrectionWindows } from '../../attendance/hooks/useAttendanceDayWindows';

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

function reasonError(value: string): string | null {
  const { length } = [...value.trim()];
  if (length < MIN_REASON_CHARACTERS) return 'Reason must be at least 5 characters.';
  if (length > MAX_REASON_CHARACTERS) return 'Reason must be 500 characters or fewer.';
  return null;
}

function optionalScalarString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
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
  const checkInDateRef = useRef<HTMLInputElement>(null);
  const checkOutDateRef = useRef<HTMLInputElement>(null);
  const datesTouched = useRef(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(false);
  const mutationGeneration = useRef(0);
  const [workDate, setWorkDate] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = editingRow !== null && editingRow !== undefined;
  const windows = useAttendanceCorrectionWindows(client, isOpen, workDate);

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
    const nextWorkDate = editingRow?.workDate ?? initialWorkDate ?? '';
    setWorkDate(nextWorkDate);
    setCheckInDate(nextWorkDate);
    setCheckOutDate(nextWorkDate);
    datesTouched.current = false;
    setCheckIn(formatBackendTime(editingRow?.checkInTime ?? DEFAULT_CHECK_IN).slice(0, 5));
    setCheckOut(formatBackendTime(editingRow?.checkOutTime ?? DEFAULT_CHECK_OUT).slice(0, 5));
    setReason('');
    setBusy(false);
    setFieldErrors({});
    setFormError(null);
  }, [client, editingRow, initialWorkDate, isOpen]);

  useEffect(() => {
    const selected = windows.data?.selectedWindow;
    if (!isOpen || !selected || datesTouched.current) return;
    const checkInAt = optionalScalarString(editingRow?.checkInAt);
    const checkOutAt = optionalScalarString(editingRow?.checkOutAt);
    setCheckInDate(localDateAt(checkInAt, selected.timezone) ?? workDate);
    setCheckOutDate(
      localDateAt(checkOutAt, selected.timezone) ??
        localDateAt(checkInAt, selected.timezone) ??
        workDate
    );
  }, [editingRow?.checkInAt, editingRow?.checkOutAt, isOpen, windows.data, workDate]);

  return {
    client,
    workDateRef,
    checkInRef,
    checkOutRef,
    checkInDateRef,
    checkOutDateRef,
    reasonRef,
    mountedRef,
    mutationGeneration,
    workDate,
    setWorkDate,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    datesTouched,
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
    windows,
  };
};

type GraphClient = ReturnType<typeof useGraphClient>;

interface ManagedAttendanceInput {
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  reason: string;
  workDate: string;
}

async function saveRegularization(
  client: GraphClient,
  editingRow: ManagedAttendanceRow | null | undefined,
  employeeId: string,
  input: ManagedAttendanceInput
): Promise<void> {
  if (editingRow) {
    await client.request(AttendanceUpdateManagedSegmentDocument, {
      input: {
        id: editingRow.id,
        expectedUpdatedAt: optionalScalarString(editingRow.updatedAt) ?? '',
        ...input,
      },
    });
    return;
  }
  await client.request(AttendanceAddManagedSegmentDocument, {
    input: { employeeId, ...input },
  });
}

function submissionIsCurrent(
  mounted: MutableRefObject<boolean>,
  generationRef: MutableRefObject<number>,
  generation: number
): boolean {
  return mounted.current && generationRef.current === generation;
}

function correctionWindowsReady<T>(
  data: T | null,
  loading: boolean,
  error: string | null
): data is T {
  return data !== null && !loading && error === null;
}

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
    checkInDateRef,
    checkOutDateRef,
    reasonRef,
    mountedRef,
    mutationGeneration,
    workDate,
    checkInDate,
    checkOutDate,
    checkIn,
    checkOut,
    reason,
    setBusy,
    setFieldErrors,
    setFormError,
    windows,
  } = fields;

  const focusAttendanceField = (field: Exclude<ManualAttendanceField, 'form'>) => {
    const refs = {
      workDate: workDateRef,
      checkInDate: checkInDateRef,
      checkOutDate: checkOutDateRef,
      checkIn: checkInRef,
      checkOut: checkOutRef,
    };
    refs[field].current?.focus();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    if (!correctionWindowsReady(windows.data, windows.loading, windows.error)) {
      setFormError(windows.error ?? 'Wait for the attendance day window to load and try again.');
      return;
    }

    const attendanceError = validateManualAttendanceSegment({
      workDate,
      checkInDate,
      checkOutDate,
      checkIn,
      checkOut,
      currentWorkDate: windows.data.currentWindow.workDate,
      window: windows.data.selectedWindow,
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
      checkInDate,
      checkOutDate,
      checkInTime: `${checkIn}:00`,
      checkOutTime: `${checkOut}:00`,
      reason: normalizedReason,
    };
    const generation = mutationGeneration.current;
    const isCurrentSubmission = () =>
      submissionIsCurrent(mountedRef, mutationGeneration, generation);
    setBusy(true);
    try {
      await saveRegularization(client, editingRow, employee.employeeId, attendanceInput);
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
