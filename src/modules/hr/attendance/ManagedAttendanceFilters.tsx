import { useState } from 'react';

import Input from '../../../components/common/Input';

import {
  managedAttendanceRangeError,
  type ManagedAttendanceFiltersValue,
} from './managedAttendanceTypes';

interface ManagedAttendanceFiltersProps {
  value: ManagedAttendanceFiltersValue;
  disabled?: boolean;
  onChange: (value: ManagedAttendanceFiltersValue) => void;
}

const ManagedAttendanceFilters = ({ value, disabled = false, onChange }: ManagedAttendanceFiltersProps) => {
  const [draft, setDraft] = useState(value);
  const rangeError = managedAttendanceRangeError(draft.fromDate, draft.toDate);
  const rangeErrorId = rangeError ? 'managed-attendance-range-error' : undefined;

  const updateDates = (nextFromDate: string, nextToDate: string) => {
    const next = { ...draft, fromDate: nextFromDate, toDate: nextToDate };
    setDraft(next);
    if (managedAttendanceRangeError(nextFromDate, nextToDate)) return;
    onChange(next);
  };

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={rangeErrorId}
      className="grid gap-4 md:grid-cols-3"
    >
      <Input
        type="date"
        label="Start date"
        value={draft.fromDate}
        onChange={(event) => updateDates(event.target.value, draft.toDate)}
        aria-invalid={Boolean(rangeError)}
        fullWidth
      />
      <Input
        type="date"
        label="End date"
        value={draft.toDate}
        onChange={(event) => updateDates(draft.fromDate, event.target.value)}
        aria-invalid={Boolean(rangeError)}
        fullWidth
      />
      <Input
        type="search"
        label="Employee name or code"
        value={draft.employeeSearch}
        onChange={(event) => {
          const next = { ...draft, employeeSearch: event.target.value };
          setDraft(next);
          onChange(next);
        }}
        placeholder="Search name or employee code"
        fullWidth
      />
      {rangeError ? (
        <p id={rangeErrorId} role="alert" className="text-sm font-medium text-status-danger md:col-span-3">
          {rangeError}
        </p>
      ) : null}
    </fieldset>
  );
};

export default ManagedAttendanceFilters;
