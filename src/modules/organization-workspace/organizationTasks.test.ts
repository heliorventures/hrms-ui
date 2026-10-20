import { expect, it } from 'vitest';

import { organizationTasks } from './organizationTasks';

const workspace = {
  canManage: false,
  canDelegate: false,
  canApprove: false,
  canReview: false,
  canReport: false,
  canHistory: false,
  canPayroll: false,
};

it('does not turn organization metadata administration into employee or payroll access', () => {
  expect(
    organizationTasks({ ...workspace, canManage: true }, [
      { capabilities: ['organization:manage'] },
    ])
  ).toEqual([{ value: 'administration', label: 'Administration' }]);
});

it('exposes team tasks for explicit employee-read or feedback capabilities without a private review inbox', () => {
  expect(organizationTasks(workspace, [{ capabilities: ['employee:read'] }])).toEqual([
    { value: 'team', label: 'My team' },
  ]);
  expect(
    organizationTasks({ ...workspace, canReview: true }, [{ capabilities: ['feedback:write'] }])
  ).toEqual([{ value: 'team', label: 'My team' }]);
});

it('keeps business history separate from progress reporting', () => {
  expect(
    organizationTasks({ ...workspace, canReport: true }, [{ capabilities: ['analytics:read'] }])
  ).toEqual([{ value: 'progress', label: 'Company progress' }]);
});

it('opens company tasks from explicit capabilities when workspace metadata flags are false', () => {
  expect(
    organizationTasks(workspace, [
      {
        capabilities: [
          'employee:manage',
          'role:manage',
          'workflow:manage',
          'onboarding:manage',
          'payroll:manage',
          'analytics:read',
          'history:read',
        ],
      },
    ]).map((task) => task.value)
  ).toEqual(['progress', 'history', 'payroll', 'hr']);
  expect(organizationTasks(workspace, [{ capabilities: ['history:export'] }])).toEqual([]);
});
