import { describe, expect, it } from 'vitest';

import { validateManualAttendanceSegment } from './attendanceValidation';

const validInput = {
  workDate: '2025-01-15',
  checkInDate: '2025-01-15',
  checkOutDate: '2025-01-15',
  checkIn: '09:00',
  checkOut: '18:00',
  currentWorkDate: '2025-01-20',
  window: {
    workDate: '2025-01-15',
    startsAt: '2025-01-14T23:30:00Z',
    endsAt: '2025-01-15T23:30:00Z',
    timezone: 'Asia/Kolkata',
    boundaryMinutes: 300,
  },
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
      message: 'Punch In must be before Punch Out.',
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

  it('accepts a valid after-midnight interval using actual dates and canonical window bounds', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        workDate: '2026-09-11',
        checkInDate: '2026-09-12',
        checkOutDate: '2026-09-12',
        checkIn: '02:00',
        checkOut: '04:00',
        currentWorkDate: '2026-09-12',
        window: {
          workDate: '2026-09-11',
          startsAt: '2026-09-10T23:30:00Z',
          endsAt: '2026-09-11T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
      })
    ).toBeNull();
  });

  it('rejects actual dates outside the retained historical window', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        checkInDate: '2025-01-14',
        checkOutDate: '2025-01-15',
      })
    ).toEqual({
      field: 'checkInDate',
      message: 'Punch In must be inside the attendance day window.',
    });
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
      message: 'Punch In must be before Punch Out.',
    });
  });

  it('defers cross-segment checks outside the loaded coverage range', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        workDate: '2026-08-24',
        checkInDate: '2026-08-24',
        checkOutDate: '2026-08-24',
        currentWorkDate: '2026-08-24',
        window: {
          workDate: '2026-08-24',
          startsAt: '2026-08-23T23:30:00Z',
          endsAt: '2026-08-24T23:30:00Z',
          timezone: 'Asia/Kolkata',
          boundaryMinutes: 300,
        },
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

  it('rejects an intrinsically 24-hour interval when segment coverage is incomplete', () => {
    expect(
      validateManualAttendanceSegment({
        ...validInput,
        checkInDate: '2025-01-15',
        checkOutDate: '2025-01-16',
        checkIn: '00:00',
        checkOut: '00:00',
        window: {
          workDate: '2025-01-15',
          startsAt: '2025-01-14T23:30:00Z',
          endsAt: '2025-01-16T00:30:00Z',
          timezone: 'UTC',
          boundaryMinutes: 0,
        },
        existingSegmentsComplete: false,
      })
    ).toEqual({
      field: 'form',
      message: 'Total attendance for a day must be less than 24 hours.',
    });
  });

  it('enforces the intrinsic cap outside loaded coverage while accepting an exact-end interval below it', () => {
    const transitionInput = {
      ...validInput,
      checkInDate: '2025-01-15',
      checkOutDate: '2025-01-16',
      checkIn: '00:00',
      checkOut: '00:00',
      window: {
        workDate: '2025-01-15',
        startsAt: '2025-01-14T23:30:00Z',
        endsAt: '2025-01-16T00:30:00Z',
        timezone: 'UTC',
        boundaryMinutes: 0,
      },
      existingSegmentsComplete: true,
      existingSegmentsCoverage: { fromDate: '2025-02-01', toDate: '2025-02-28' },
    };

    expect(validateManualAttendanceSegment(transitionInput)).toEqual({
      field: 'form',
      message: 'Total attendance for a day must be less than 24 hours.',
    });
    expect(
      validateManualAttendanceSegment({
        ...transitionInput,
        checkIn: '00:31',
        checkOut: '00:30',
      })
    ).toBeNull();
  });
});
