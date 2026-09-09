import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import Textarea from '../../../components/common/Textarea';

import {
  useAttendanceRegularization,
  type AttendanceRegularizationModalProps,
} from './useAttendanceRegularization';

export type { AttendanceRegularizationModalProps } from './useAttendanceRegularization';

const AttendanceRegularizationModal = (props: AttendanceRegularizationModalProps) => {
  const { isOpen, onClose, employee } = props;
  const {
    workDateRef,
    checkInRef,
    checkOutRef,
    reasonRef,
    workDate,
    setWorkDate,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    reason,
    setReason,
    busy,
    fieldErrors,
    setFieldErrors,
    formError,
    isEditing,
    submit,
  } = useAttendanceRegularization(props);

  const submitLabel = isEditing ? 'Update segment' : 'Save segment';
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
            {busy ? 'Saving...' : submitLabel}
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
