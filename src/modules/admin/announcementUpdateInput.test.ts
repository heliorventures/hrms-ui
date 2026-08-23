import { describe, expect, it } from 'vitest';

import {
  buildAnnouncementAudienceUpdate,
  roleCodeFromTargetAudience,
} from './announcementUpdateInput';

describe('announcement audience update input', () => {
  it('extracts and normalizes a stored ROLE audience', () => {
    expect(roleCodeFromTargetAudience('ROLE:hr_admin')).toBe('HR_ADMIN');
  });

  it('preserves an existing role unless explicit clearing is selected', () => {
    expect(
      buildAnnouncementAudienceUpdate({
        existingTargetAudience: 'ROLE:HR_ADMIN',
        roleCode: 'HR_ADMIN',
        clearRoleAudience: false,
        departmentId: '',
        locationId: '',
      })
    ).toEqual({
      targetRoleCode: 'HR_ADMIN',
      clearRoleAudience: false,
      targetDepartmentId: null,
      targetLocationId: null,
    });
  });

  it('preserves the stored role when roleCode is manually emptied without explicit clear intent', () => {
    expect(
      buildAnnouncementAudienceUpdate({
        existingTargetAudience: 'ROLE:HR_ADMIN',
        roleCode: '',
        clearRoleAudience: false,
        departmentId: '',
        locationId: '',
      })
    ).toEqual({
      targetRoleCode: 'HR_ADMIN',
      clearRoleAudience: false,
      targetDepartmentId: null,
      targetLocationId: null,
    });
  });

  it('clears a stored role only after explicit confirmation', () => {
    expect(
      buildAnnouncementAudienceUpdate({
        existingTargetAudience: 'ROLE:HR_ADMIN',
        roleCode: '',
        clearRoleAudience: true,
        departmentId: '',
        locationId: '',
      })
    ).toMatchObject({ targetRoleCode: null, clearRoleAudience: true });
  });
});
