import { describe, expect, it } from 'vitest';

import { canShowPayrollSensitive } from './profileAccess';

describe('employee profile presentation access', () => {
  it('shows salary for payroll-authorized self access without organization management', () => {
    expect(
      canShowPayrollSensitive({
        canViewPayrollSensitive: true,
        canManageOrganizationFields: false,
      })
    ).toBe(true);
  });

  it('hides salary from organization managers without payroll read access', () => {
    expect(
      canShowPayrollSensitive({
        canViewPayrollSensitive: false,
        canManageOrganizationFields: true,
      })
    ).toBe(false);
  });
});
