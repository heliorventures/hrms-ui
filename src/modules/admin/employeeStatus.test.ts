import { describe, expect, it } from 'vitest';

import { EMPLOYEE_STATUS_OPTIONS } from './employeeFormOptions';
import { mapBundleToEmployeeProfileModel } from '../organization/employee-profile/lib/mapBundleToModel';

function profileBundle(status: string) {
  return {
    employee: {
      id: 'employee-1',
      employeeCode: 'E001',
      firstName: 'Test',
      lastName: 'Employee',
      fullName: 'Test Employee',
      status,
      employmentType: null,
      dateOfJoining: '2026-01-01',
      departmentId: null,
      designationId: null,
      userId: null,
      reportingManagerId: null,
      departmentName: null,
      designationTitle: null,
      linkedUserEmail: null,
      linkedUserUsername: null,
      reportingManagerName: null,
      bloodGroup: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    employeePrimaryBank: null,
    employeeIdentityProfile: { pan: null, aadhaar: null },
    employmentHistoryRecords: [],
    employeeDocuments: [],
    employeeEducationRecords: [],
    employeeWorkExperienceRecords: [],
    employeeProfileChangeRequests: [],
  } as never;
}

describe('canonical employee statuses', () => {
  it('offers all six backend status values in employee forms', () => {
    expect(EMPLOYEE_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'ACTIVE',
      'PROBATION',
      'INACTIVE',
      'ON_LEAVE',
      'SUSPENDED',
      'TERMINATED',
    ]);
  });

  it.each([
    'ACTIVE',
    'PROBATION',
    'INACTIVE',
    'ON_LEAVE',
    'SUSPENDED',
    'TERMINATED',
  ])('preserves canonical profile status %s', (status) => {
    expect(mapBundleToEmployeeProfileModel(profileBundle(status))?.statusUi).toBe(status);
  });

  it('does not silently convert an unknown backend status to ACTIVE', () => {
    expect(mapBundleToEmployeeProfileModel(profileBundle('FUTURE_STATUS'))?.statusUi).toBe(
      'UNKNOWN'
    );
  });
});
