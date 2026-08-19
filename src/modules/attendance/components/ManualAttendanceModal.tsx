import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import {
  AddManualAttendanceSegmentDocument,
  UpdateManualAttendanceSegmentDocument,
} from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { attendancePolicyMessage } from '../../../utils/attendancePolicyMessage';
import {
  type AttendanceSegmentInterval,
  type ManualAttendanceField,
  validateManualAttendanceSegment,
} from '../../../utils/attendanceValidation';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../../utils/timeFormat';

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
  existingSegments: AttendanceSegmentInterval[];
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
  existingSegments,
  selfServiceDays,
  canRegularize,
  onSaved,
}: ManualAttendanceModalProps) => {
  const client = useGraphClient('client');
  const workDateRef = useRef<HTMLInputElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const [workDate, setWorkDate] = useState(defaultWorkDate);
  const [checkIn, setCheckIn] = useState(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState(DEFAULT_CHECK_OUT);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<FormError | null>(null);
  const isEditing = Boolean(editingSegmentId);
  const policyMessage = useMemo(
    () => attendancePolicyMessage(selfServiceDays, canRegularize),
    [canRegularize, selfServiceDays]
  );

  useEffect(() => {
    if (!isOpen) return;
    setWorkDate(defaultWorkDate);
    setCheckIn(formatBackendTime(defaultCheckIn ?? DEFAULT_CHECK_IN).slice(0, 5));
    setCheckOut(formatBackendTime(defaultCheckOut ?? DEFAULT_CHECK_OUT).slice(0, 5));
    setFieldErrors({});
    setFormError(null);
  }, [isOpen, defaultWorkDate, defaultCheckIn, defaultCheckOut]);

  const focusField = (field: Exclude<ManualAttendanceField, 'form'>) => {
    const refs = {
      workDate: workDateRef,
      checkIn: checkInRef,
      checkOut: checkOutRef,
    };
    refs[field].current?.focus();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const validationError = validateManualAttendanceSegment({
      workDate,
      checkIn,
      checkOut,
      existingSegments,
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
      checkInTime: `${checkIn}:00`,
      checkOutTime: `${checkOut}:00`,
    };
    try {
      if (editingSegmentId) {
        await client.request(UpdateManualAttendanceSegmentDocument, {
          input: { id: editingSegmentId, ...input },
        });
      } else {
        await client.request(AddManualAttendanceSegmentDocument, { input });
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
    >
      <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
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

        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
          <p>{policyMessage.employee}</p>
          {policyMessage.regularizer ? <p className="mt-1">{policyMessage.regularizer}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Update Segment' : 'Save Segment'}
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
