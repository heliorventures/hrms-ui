import { expect, it } from 'vitest';

import {
  employeeManagerName,
  employeeManagerOwnershipLabel,
  localManagerUpdate,
} from './employeeManagerPresentation';

it('uses the canonical verified manager and labels cross-company ownership without a legacy ID fallback', () => {
  const employee = {
    reportingManagerName: 'Canonical Manager',
    reportingManagerId: null,
    reportingManagerTenantId: 'foreign-company',
    reportingManagerOrganizationManaged: true,
  };
  expect(employeeManagerName(employee)).toBe('Canonical Manager');
  expect(employeeManagerOwnershipLabel(employee)).toBe(
    'Cross-company manager · organization-managed'
  );
  expect(
    employeeManagerName({
      ...employee,
      reportingManagerName: null,
      reportingManagerId: 'old-local-manager',
    })
  ).toBe('Manager details unavailable');
});

it('omits local manager writes under organization ownership even if a stale form contains a manager selection', () => {
  expect(localManagerUpdate(true, 'old-local-manager')).toEqual({});
  expect(localManagerUpdate(true, null)).toEqual({});
  expect(localManagerUpdate(false, 'local-manager')).toEqual({
    reportingManagerId: 'local-manager',
  });
  expect(localManagerUpdate(false, null)).toEqual({ reportingManagerId: null });
  expect(localManagerUpdate(false, undefined)).toEqual({});
});

it('preserves tenant-local manager presentation when organization ownership is absent', () => {
  expect(
    employeeManagerName({
      reportingManagerName: 'Local Manager',
      reportingManagerOrganizationManaged: false,
    })
  ).toBe('Local Manager');
  expect(employeeManagerOwnershipLabel({ reportingManagerOrganizationManaged: false })).toBeNull();
});
