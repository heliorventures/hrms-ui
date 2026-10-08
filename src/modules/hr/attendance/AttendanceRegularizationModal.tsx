import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import PageNotice from '../../../components/common/PageNotice';
import Textarea from '../../../components/common/Textarea';
import { formatAttendanceWindow } from '../../../utils/attendanceDay';

import {
  useAttendanceRegularization,
  type AttendanceRegularizationModalProps,
} from './useAttendanceRegularization';

export type { AttendanceRegularizationModalProps } from './useAttendanceRegularization';

type RegularizationState = ReturnType<typeof useAttendanceRegularization>;

const AttendanceWindowStatus = ({ windows }: { windows: RegularizationState['windows'] }) => (
  <>
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
          <Button type="button" variant="outline" size="sm" onClick={() => void windows.refresh()}>
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
  </>
);

const AttendanceWindowFields = ({ state }: { state: RegularizationState }) => {
  const {
    workDateRef,
    checkInRef,
    checkOutRef,
    checkInDateRef,
    checkOutDateRef,
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
    fieldErrors,
    setFieldErrors,
    isEditing,
    windows,
  } = state;
  return (
    <>
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
      <AttendanceWindowStatus windows={windows} />
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
    </>
  );
};

const AttendanceRegularizationModal = (props: AttendanceRegularizationModalProps) => {
  const { isOpen, onClose, employee } = props;
  const state = useAttendanceRegularization(props);
  const {
    reasonRef,
    reason,
    setReason,
    busy,
    fieldErrors,
    setFieldErrors,
    formError,
    isEditing,
    submit,
  } = state;

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
        <AttendanceWindowFields state={state} />
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
