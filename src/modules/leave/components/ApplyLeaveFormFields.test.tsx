// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ApplyLeaveFormFields from './ApplyLeaveFormFields';

afterEach(cleanup);

describe('ApplyLeaveFormFields', () => {
  it('associates direct leave fields and keeps mobile-safe control sizing', () => {
    let selectedLeaveType = '';
    render(
      <ApplyLeaveFormFields
        leaveTypeId=""
        leaveTypeOptions={[
          { value: '', label: 'Select...' },
          { value: 'annual', label: 'Annual Leave (AL)' },
        ]}
        onLeaveTypeChange={(value) => {
          selectedLeaveType = value;
        }}
        fromDate="2026-08-24"
        onFromDateChange={() => undefined}
        toDate="2026-08-24"
        onToDateChange={() => undefined}
        halfDayAllowed
        halfDayEligible
        isHalfDay
        onHalfDayChange={() => undefined}
        halfDaySession="FIRST_HALF"
        onHalfDaySessionChange={() => undefined}
        reason="Family appointment"
        onReasonChange={() => undefined}
        requiresDocument
        supportingDocumentReference="ticket-123"
        onSupportingDocumentReferenceChange={() => undefined}
      />
    );

    const leaveType = screen.getByLabelText<HTMLSelectElement>('Leave type');
    const session = screen.getByLabelText<HTMLSelectElement>('Session');
    const reason = screen.getByLabelText<HTMLTextAreaElement>('Reason');

    for (const control of [leaveType, session, reason]) {
      expect(control.className).toContain('min-h-11');
      expect(control.className).toContain('text-base');
      expect(control.className).toContain('md:text-sm');
    }

    fireEvent.change(leaveType, { target: { value: 'annual' } });
    expect(selectedLeaveType).toBe('annual');
    expect(screen.getByLabelText('Supporting document reference')).toBeTruthy();
  });

  it('associates field errors with invalid leave controls', () => {
    render(
      <ApplyLeaveFormFields
        leaveTypeId=""
        leaveTypeOptions={[{ value: '', label: 'Select...' }]}
        onLeaveTypeChange={() => undefined}
        fromDate=""
        onFromDateChange={() => undefined}
        toDate=""
        onToDateChange={() => undefined}
        halfDayAllowed
        halfDayEligible
        isHalfDay={false}
        onHalfDayChange={() => undefined}
        halfDaySession=""
        onHalfDaySessionChange={() => undefined}
        reason=""
        onReasonChange={() => undefined}
        requiresDocument={false}
        supportingDocumentReference=""
        onSupportingDocumentReferenceChange={() => undefined}
        fieldErrors={{
          leaveTypeId: 'Choose a leave type.',
          reason: 'Enter a reason for your leave.',
        }}
      />
    );

    expect(screen.getByLabelText('Leave type').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Reason').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Choose a leave type.').getAttribute('role')).toBe('alert');
    expect(screen.getByText('Enter a reason for your leave.').getAttribute('role')).toBe('alert');
  });
});
