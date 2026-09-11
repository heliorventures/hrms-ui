import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  AttendanceAddManualSegmentDocument,
  AttendanceUpdateManualSegmentDocument,
} from '../../../api/attendance/graphql';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { formatAttendanceWindow, localDateAt } from '../../../utils/attendanceDay';
import { attendancePolicyMessage } from '../../../utils/attendancePolicyMessage';
import {
  type AttendanceSegmentInterval,
  type ExistingSegmentsCoverage,
  type ManualAttendanceField,
  validateManualAttendanceSegment,
} from '../../../utils/attendanceValidation';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../../utils/timeFormat';
import { useAttendanceCorrectionWindows } from '../hooks/useAttendanceDayWindows';

const DEFAULT_CHECK_IN = '09:00';
const DEFAULT_CHECK_OUT = '18:00';

type FieldErrors = Partial<Record<Exclude<ManualAttendanceField, 'form'>, string>>;

interface FormError {
  title: string;
  message: string;
}

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkDate: string;
  editingSegmentId?: string | null;
  defaultCheckIn?: string | null;
  defaultCheckOut?: string | null;
  defaultCheckInAt?: string | null;
  defaultCheckOutAt?: string | null;
  existingSegments: AttendanceSegmentInterval[];
  /** Defaults to true for callers that supply a complete list. */
  existingSegmentsComplete?: boolean;
  /** Loaded date range when the supplied list is only complete within that range. */
  existingSegmentsCoverage?: ExistingSegmentsCoverage;
  selfServiceDays: number;
  canRegularize: boolean;
  onSaved: () => void;
}

const ManualAttendanceModal = ({
  isOpen,
  onClose,
  defaultWorkDate,
  editingSegmentId,
  defaultCheckIn,
  defaultCheckOut,
  defaultCheckInAt,
  defaultCheckOutAt,
  existingSegments,
  existingSegmentsComplete = true,
  existingSegmentsCoverage,
  selfServiceDays,
  canRegularize,
  onSaved,
}: ManualAttendanceModalProps) => {
  const client = useGraphClient('client');
  const workDateRef = useRef<HTMLInputElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const checkInDateRef = useRef<HTMLInputElement>(null);
  const checkOutDateRef = useRef<HTMLInputElement>(null);
  const datesTouched = useRef(false);
  const [workDate, setWorkDate] = useState(defaultWorkDate);
  const [checkInDate, setCheckInDate] = useState(defaultWorkDate);
  const [checkOutDate, setCheckOutDate] = useState(defaultWorkDate);
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<FormError | null>(null);
  const isEditing = Boolean(editingSegmentId);
  const windows = useAttendanceCorrectionWindows(client, isOpen, workDate);
  const policyMessage = useMemo(
    () => attendancePolicyMessage(selfServiceDays, canRegularize),
    [canRegularize, selfServiceDays]
  );

  useEffect(() => {
    if (!isOpen) return;
    setWorkDate(defaultWorkDate);
    setCheckInDate(defaultWorkDate);
    setCheckOutDate(defaultWorkDate);
    datesTouched.current = false;
    setCheckIn(formatBackendTime(defaultCheckIn ?? DEFAULT_CHECK_IN).slice(0, 5));
    setCheckOut(formatBackendTime(defaultCheckOut ?? DEFAULT_CHECK_OUT).slice(0, 5));
    setFieldErrors({});
    setFormError(null);
  }, [isOpen, defaultWorkDate, defaultCheckIn, defaultCheckOut]);

  useEffect(() => {
    const selected = windows.data?.selectedWindow;
    if (!isOpen || !selected || datesTouched.current) return;
    setCheckInDate(localDateAt(defaultCheckInAt, selected.timezone) ?? workDate);
    setCheckOutDate(
      localDateAt(defaultCheckOutAt, selected.timezone) ??
        localDateAt(defaultCheckInAt, selected.timezone) ??
        workDate
    );
  }, [defaultCheckInAt, defaultCheckOutAt, isOpen, windows.data, workDate]);

  const focusField = (field: Exclude<ManualAttendanceField, 'form'>) => {
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

    if (!windows.data || windows.loading || windows.error) {
      setFormError({
        title: 'Attendance day window is not ready',
        message: windows.error ?? 'Wait for the attendance day window to load and try again.',
      });
      return;
    }

    const validationError = validateManualAttendanceSegment({
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
      excludedSegmentId: editingSegmentId,
    });
    if (validationError) {
      if (validationError.field === 'form') {
        setFormError({
          title: 'Review the attendance details',
          message: validationError.message,
        });
      } else {
        setFieldErrors({ [validationError.field]: validationError.message });
        focusField(validationError.field);
      }
      return;
    }

    setBusy(true);
    const input = {
      workDate,
      checkInDate,
      checkOutDate,
      checkInTime: `${checkIn}:00`,
      checkOutTime: `${checkOut}:00`,
    };
    try {
      if (editingSegmentId) {
        await client.request(AttendanceUpdateManualSegmentDocument, {
          input: { id: editingSegmentId, ...input },
        });
      } else {
        await client.request(AttendanceAddManualSegmentDocument, { input });
      }
      onSaved();
      onClose();
    } catch (error) {
      setFormError({
        title: 'Attendance was not saved',
        message: graphQlUserMessage(error),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update Attendance Segment' : 'Adjust Attendance (Missed Punches)'}
      isDismissible={!busy}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="manual-attendance-form" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Update Segment' : 'Save Segment'}
          </Button>
        </>
      }
    >
      <form
        id="manual-attendance-form"
        className="space-y-3"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        {formError ? (
          <PageNotice
            key={`${formError.title}:${formError.message}`}
            variant="error"
            title={formError.title}
            focusOnMount
          >
            {formError.message}
          </PageNotice>
        ) : null}

        <Input
          ref={workDateRef}
          type="date"
          label="Work Date"
          value={workDate}
          onChange={(event) => {
            setWorkDate(event.target.value);
            setCheckInDate(event.target.value);
            setCheckOutDate(event.target.value);
            datesTouched.current = false;
            setFieldErrors((current) => ({ ...current, workDate: undefined }));
          }}
          error={fieldErrors.workDate}
          fullWidth
          required
          readOnly={isEditing}
        />
        {windows.loading ? (
          <p role="status" className="text-xs text-content-secondary">
            Loading attendance day window…
          </p>
        ) : null}
        {windows.error ? (
          <PageNotice
            variant="error"
            title="Attendance day window could not be loaded"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void windows.refresh()}
              >
                Try again
              </Button>
            }
          >
            {windows.error}
          </PageNotice>
        ) : null}
        {windows.data ? (
          <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-content-secondary">
            Attendance window: {formatAttendanceWindow(windows.data.selectedWindow)}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            ref={checkInDateRef}
            type="date"
            label="Punch In date"
            value={checkInDate}
            onChange={(event) => {
              datesTouched.current = true;
              setCheckInDate(event.target.value);
              setFieldErrors((current) => ({ ...current, checkInDate: undefined }));
            }}
            error={fieldErrors.checkInDate}
            fullWidth
            required
          />
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
            ref={checkOutDateRef}
            type="date"
            label="Punch Out date"
            value={checkOutDate}
            onChange={(event) => {
              datesTouched.current = true;
              setCheckOutDate(event.target.value);
              setFieldErrors((current) => ({ ...current, checkOutDate: undefined }));
            }}
            error={fieldErrors.checkOutDate}
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

        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
          <p>{policyMessage.employee}</p>
          {policyMessage.regularizer ? <p className="mt-1">{policyMessage.regularizer}</p> : null}
        </div>
      </form>
    </Modal>
  );
};

export default ManualAttendanceModal;
