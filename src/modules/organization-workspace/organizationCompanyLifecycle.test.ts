import { expect, it } from 'vitest';

import {
  companyBusinessReady,
  companyCommandAllowed,
  membershipNeedsInstallation,
} from './organizationCompanyLifecycle';

const company = {
  status: 'ACTIVE',
  runtimeStatus: 'ACTIVE',
  version: 3,
  installedVersion: 3,
  capabilities: ['organization:manage', 'payroll:manage'],
};

it('requires a current active source acknowledgement before business operations', () => {
  expect(companyBusinessReady(company)).toBe(true);
  expect(companyCommandAllowed({ ...company, installedVersion: 2 }, 'payroll_draft')).toBe(false);
  expect(companyCommandAllowed({ ...company, runtimeStatus: 'PENDING' }, 'payroll_draft')).toBe(
    false
  );
  expect(companyCommandAllowed({ ...company, status: 'SUSPENDED' }, 'payroll_draft')).toBe(false);
});

it('retains explicitly authorized membership installation while business access is suspended or detaching', () => {
  expect(companyCommandAllowed({ ...company, status: 'SUSPENDED' }, 'install_membership')).toBe(
    true
  );
  expect(companyCommandAllowed({ ...company, status: 'DETACHING' }, 'install_membership')).toBe(
    true
  );
  expect(companyCommandAllowed({ ...company, status: 'DETACHED' }, 'install_membership')).toBe(
    false
  );
  expect(companyCommandAllowed({ ...company, capabilities: [] }, 'install_membership')).toBe(false);
});

it('requires source installation for activation, suspension and final detachment', () => {
  expect(membershipNeedsInstallation(company)).toBe(false);
  expect(membershipNeedsInstallation({ ...company, status: 'SUSPENDED' })).toBe(true);
  expect(membershipNeedsInstallation({ ...company, status: 'DETACHING' })).toBe(true);
  expect(
    membershipNeedsInstallation({ ...company, status: 'DETACHED', runtimeStatus: 'DETACHED' })
  ).toBe(false);
});
