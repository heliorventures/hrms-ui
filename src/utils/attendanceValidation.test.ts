import { describe, expect, it } from 'vitest';

import { validateManualAttendanceSegment } from './attendanceValidation';

const validInput = {
  workDate: '2025-01-15',
  checkIn: '09:00',
  checkOut: '18:00',
  existingSegments: [],
};

describe('validateManualAttendanceSegment', () => {
  it('associates a missing date with the date field', () => {
    expect(validateManualAttendanceSegment({ ...validInput, workDate: '' })).toEqual({
      field: 'workDate',
      message: 'Enter work date, punch in, and punch out.',
    });
  });

  it('associates a future date with the date field', () => {
    expect(validateManualAttendanceSegment({ ...validInput, workDate: '2999-01-01' })).toEqual({
      field: 'workDate',
      message: 'Future attendance cannot be regularized.',
    });
  });

  it('associates a missing punch in with the punch-in field', () => {
    expect(validateManualAttendanceSegment({ ...validInput, checkIn: '' })).toEqual({
      field: 'checkIn',
      message: 'Enter work date, punch in, and punch out.',
    });
  });

  it('associates a missing or earlier punch out with the punch-out field', () => {
    expect(validateManualAttendanceSegment({ ...validInput, checkOut: '' })).toEqual({
      field: 'checkOut',
      message: 'Enter work date, punch in, and punch out.',
    });
    expect(
      validateManualAttendanceSegment({ ...validInput, checkIn: '18:00', checkOut: '09:00' })
    ).toEqual({
      field: 'checkOut',
      message: 'Punch In must be before Punch Out for the same calendar day.',
    });
  });

  it('returns form-level overlap and total-duration errors', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        checkIn: '10:00',
        checkOut: '12:00',
        existingSegments: [
          {
            id: 'existing',
            workDate: validInput.workDate,
            checkInTime: '08:00:00',
            checkOutTime: '11:00:00',
          },
        ],
      })
    ).toEqual({
      field: 'form',
      message: 'This punch range overlaps an existing attendance segment for the day.',
    });

    expect(
      validateManualAttendanceSegment({
        ...validInput,
        checkIn: '23:00',
        checkOut: '23:30',
        existingSegments: [
          {
            id: 'existing-1',
            workDate: validInput.workDate,
            checkInTime: '00:00:00',
            checkOutTime: '12:00:00',
          },
          {
            id: 'existing-2',
            workDate: validInput.workDate,
            checkInTime: '00:00:00',
            checkOutTime: '12:00:00',
          },
        ],
      })
    ).toEqual({
      field: 'form',
      message: 'Total attendance for a day must be less than 24 hours.',
    });

    expect(
      validateManualAttendanceSegment({
        ...validInput,
        checkIn: '23:00',
        checkOut: '23:30',
        existingSegments: [
          {
            id: 'existing-exact-cap-1',
            workDate: validInput.workDate,
            checkInTime: '00:00:00',
            checkOutTime: '12:00:00',
          },
          {
            id: 'existing-exact-cap-2',
            workDate: validInput.workDate,
            checkInTime: '00:00:00',
            checkOutTime: '11:30:00',
          },
        ],
      })
    ).toEqual({
      field: 'form',
      message: 'Total attendance for a day must be less than 24 hours.',
    });
  });

  it('accepts a valid non-overlapping interval', () => {
    expect(validateManualAttendanceSegment(validInput)).toBeNull();
  });

  it('normalizes hidden seconds only for legacy manual segments', () => {
    const existingSegment = {
      id: 'legacy-segment',
      workDate: validInput.workDate,
      checkInTime: '08:00:45',
      checkOutTime: '09:00:45',
    };
    const request = {
      ...validInput,
      checkIn: '09:00',
      checkOut: '10:00',
    };

    expect(
      validateManualAttendanceSegment({
        ...request,
        existingSegments: [{ ...existingSegment, source: 'WEB+MANUAL' }],
      })
    ).toBeNull();
    expect(
      validateManualAttendanceSegment({
        ...request,
        existingSegments: [{ ...existingSegment, source: 'BIOMETRIC' }],
      })
    ).toEqual({
      field: 'form',
      message: 'This punch range overlaps an existing attendance segment for the day.',
    });
  });

  it('defers overlap and daily-cap checks when existing segments are incomplete', () => {
    const partialInput = {
      ...validInput,
      existingSegmentsComplete: false,
      existingSegments: [
        {
          id: 'existing',
          workDate: validInput.workDate,
          checkInTime: '08:00:00',
          checkOutTime: '18:00:00',
        },
      ],
    };

    expect(
      validateManualAttendanceSegment({ ...partialInput, checkIn: '10:00', checkOut: '12:00' })
    ).toBeNull();
    expect(
      validateManualAttendanceSegment({ ...partialInput, checkIn: '23:00', checkOut: '23:30' })
    ).toBeNull();
    expect(
      validateManualAttendanceSegment({ ...partialInput, checkIn: '18:00', checkOut: '09:00' })
    ).toEqual({
      field: 'checkOut',
      message: 'Punch In must be before Punch Out for the same calendar day.',
    });
  });

  it('defers cross-segment checks outside the loaded coverage range', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        workDate: '2026-08-24',
        checkIn: '10:00',
        checkOut: '12:00',
        existingSegmentsComplete: true,
        existingSegmentsCoverage: { fromDate: '2025-01-01', toDate: '2025-01-31' },
        existingSegments: [
          {
            id: 'outside-coverage',
            workDate: '2026-08-24',
            checkInTime: '08:00:00',
            checkOutTime: '11:00:00',
          },
        ],
      })
    ).toBeNull();
  });
});
