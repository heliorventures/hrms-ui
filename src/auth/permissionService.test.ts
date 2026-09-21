import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';

function serviceWith(
  permissions: string[],
  jwtRoles: string[] = [],
  permissionScopes: Record<string, string> = Object.fromEntries(
    permissions.map((permission) => [permission, 'SELF'])
  )
) {
  const session: ParsedClientSession = {
    jwtRoles,
    permissions: new Set(permissions),
    resourceScopes: {},
    permissionScopes,
    persona: 'EMPLOYEE',
    mustChangePassword: false,
  };

  return createPermissionService(session);
}

describe('performance and survey workspace route permissions', () => {
  it('allows each exact scoped performance persona', () => {
    expect(
      serviceWith(['performance:self'], [], { 'performance:self': 'SELF' }).canRoute(
        '/workplace/performance'
      )
    ).toBe(true);
    expect(
      serviceWith(['performance:evaluate'], [], { 'performance:evaluate': 'TEAM' }).canRoute(
        '/workplace/performance'
      )
    ).toBe(true);
    expect(
      serviceWith(['performance:manage'], [], { 'performance:manage': 'ALL' }).canRoute(
        '/workplace/performance'
      )
    ).toBe(true);
    expect(
      serviceWith(['performance:evaluate'], [], { 'performance:evaluate': 'SELF' }).canRoute(
        '/workplace/performance'
      )
    ).toBe(false);
  });

  it('allows survey respondents and scoped aggregate viewers without broadening scope', () => {
    expect(
      serviceWith(['survey:respond'], [], { 'survey:respond': 'SELF' }).canRoute(
        '/workplace/surveys'
      )
    ).toBe(true);
    expect(
      serviceWith(['survey:results'], [], { 'survey:results': 'DEPARTMENT' }).canRoute(
        '/workplace/surveys'
      )
    ).toBe(true);
    expect(
      serviceWith(['survey:manage'], [], { 'survey:manage': 'ALL' }).canRoute('/workplace/surveys')
    ).toBe(true);
    expect(
      serviceWith(['survey:results'], [], { 'survey:results': 'SELF' }).canRoute(
        '/workplace/surveys'
      )
    ).toBe(false);
  });
});

describe('HR attendance management route permission', () => {
  it('allows the route with attendance:regularize', () => {
    expect(
      serviceWith(['attendance:regularize'], [], { 'attendance:regularize': 'TEAM' }).canRoute(
        '/hr/attendance'
      )
    ).toBe(true);
  });

  it('does not allow an HR_ADMIN role without attendance:regularize', () => {
    expect(serviceWith([], ['HR_ADMIN']).canRoute('/hr/attendance')).toBe(false);
  });

  it('does not allow employee:manage without attendance:regularize', () => {
    expect(serviceWith(['employee:manage']).canRoute('/hr/attendance')).toBe(false);
  });

  it('does not allow an unauthenticated session', () => {
    expect(createPermissionService(null).canRoute('/hr/attendance')).toBe(false);
  });
});

describe('runtime authorization uses permissions instead of role names', () => {
  it('denies expense approval to an HR_ADMIN role without expense:approve', () => {
    expect(serviceWith([], ['HR_ADMIN']).canCapability('action.expense.approve')).toBe(false);
  });

  it('allows expense approval with expense:approve', () => {
    expect(
      serviceWith(['expense:approve'], [], { 'expense:approve': 'TEAM' }).canCapability(
        'action.expense.approve'
      )
    ).toBe(true);
  });

  it('opens the report catalogue for an exact ALL-scoped report domain', () => {
    expect(serviceWith(['attendance:read']).canRoute('/admin/reports')).toBe(false);
    expect(
      serviceWith(['attendance:read', 'employee:read', 'leave:read', 'payroll:manage'], [], {
        'attendance:read': 'ALL',
        'employee:read': 'ALL',
        'leave:read': 'ALL',
        'payroll:manage': 'ALL',
      }).canRoute('/admin/reports')
    ).toBe(true);
    expect(
      serviceWith(['attendance:read', 'employee:read', 'leave:read', 'payroll:manage'], [], {
        'attendance:read': 'ALL',
        'employee:read': 'ALL',
        'leave:read': 'SELF',
        'payroll:manage': 'ALL',
      }).canRoute('/admin/reports')
    ).toBe(true);
    expect(
      serviceWith(['payroll:read'], [], { 'payroll:read': 'ALL' }).canRoute('/admin/reports')
    ).toBe(true);
    expect(
      serviceWith(['payroll:manage'], [], { 'payroll:manage': 'ALL' }).canRoute('/admin/reports')
    ).toBe(false);
    expect(serviceWith(['employee:write']).canRoute('/admin/reports')).toBe(false);
    expect(serviceWith(['payroll:statutory_export']).canRoute('/admin/reports')).toBe(false);
  });

  it('uses explicit approval scopes for HR workbench routes', () => {
    const leaveTeam = serviceWith(['leave:approve'], [], { 'leave:approve': 'TEAM' });
    const timesheetTeam = serviceWith(['timesheet:approve'], [], { 'timesheet:approve': 'TEAM' });

    expect(leaveTeam.canCapability('action.leave.approve')).toBe(true);
    expect(leaveTeam.canRoute('/hr')).toBe(true);
    expect(leaveTeam.canRoute('/hr/leaves')).toBe(true);
    expect(timesheetTeam.canCapability('action.timesheet.approve')).toBe(true);
    expect(timesheetTeam.canRoute('/hr')).toBe(true);
    expect(timesheetTeam.canRoute('/hr/timesheets')).toBe(true);

    expect(
      serviceWith(['leave:approve'], [], { 'leave:approve': 'SELF' }).canRoute('/hr/leaves')
    ).toBe(false);
    expect(
      serviceWith(['timesheet:approve'], [], { 'timesheet:approve': 'SELF' }).canRoute(
        '/hr/timesheets'
      )
    ).toBe(false);
  });

  it('keeps timesheet assignment administration separate from approval', () => {
    expect(
      serviceWith(['timesheet:approve'], [], { 'timesheet:approve': 'TEAM' }).canRoute(
        '/hr/timesheet-assignments'
      )
    ).toBe(false);
    expect(
      serviceWith(['timesheet:manage'], [], { 'timesheet:manage': 'ALL' }).canRoute(
        '/hr/timesheet-assignments'
      )
    ).toBe(true);
  });

  it('uses the company directory grant for people search', () => {
    expect(
      serviceWith(['employee_directory:read'], [], {
        'employee_directory:read': 'ALL',
      }).canCapability('action.people.search')
    ).toBe(true);
    expect(
      serviceWith(['leave:manage'], [], { 'leave:manage': 'ALL' }).canCapability(
        'action.people.search'
      )
    ).toBe(false);
  });

  it.each([
    ['/admin/access', 'role:manage'],
    ['/admin/attendance-policy', 'attendance:punch_policy'],
    ['/admin/employees', 'employee:manage'],
    ['/admin/expense-categories', 'expense:manage'],
    ['/admin/leave-settings', 'leave:manage'],
    ['/admin/module-health', 'role:manage'],
    ['/admin/notifications', 'notification:manage'],
    ['/admin/settings', 'role:manage'],
  ] as const)('requires ALL scope for tenant administration route %s', (path, permission) => {
    expect(serviceWith([permission], [], { [permission]: 'SELF' }).canRoute(path)).toBe(false);
    expect(serviceWith([permission], [], { [permission]: 'ALL' }).canRoute(path)).toBe(true);
  });
});

describe('runtime authorization combined administration routes', () => {
  it('requires both ALL-scoped policy permissions for the combined timesheet settings page', () => {
    expect(
      serviceWith(['timesheet:manage'], [], { 'timesheet:manage': 'SELF' }).canRoute(
        '/admin/timesheet-settings'
      )
    ).toBe(false);
    expect(
      serviceWith(['timesheet:manage'], [], { 'timesheet:manage': 'ALL' }).canRoute(
        '/admin/timesheet-settings'
      )
    ).toBe(false);
    expect(
      serviceWith(['attendance:punch_policy'], [], { 'attendance:punch_policy': 'ALL' }).canRoute(
        '/admin/timesheet-settings'
      )
    ).toBe(false);
    expect(
      serviceWith(['timesheet:manage', 'attendance:punch_policy'], [], {
        'timesheet:manage': 'ALL',
        'attendance:punch_policy': 'ALL',
      }).canRoute('/admin/timesheet-settings')
    ).toBe(true);
  });

  it.each([
    ['/workplace/recruitment', 'recruitment:manage'],
    ['/workplace/performance', 'performance:manage'],
    ['/workplace/learning', 'learning:manage'],
    ['/workplace/succession', 'succession:manage'],
    ['/workplace/compensation', 'compensation:manage'],
  ] as const)('guards workplace configuration route %s with ALL-scoped %s', (path, permission) => {
    expect(serviceWith([]).canRoute(path)).toBe(false);
    expect(serviceWith([permission], [], {}).canRoute(path)).toBe(false);
    for (const scope of ['SELF', 'TEAM', 'DEPARTMENT'] as const) {
      expect(serviceWith([permission], [], { [permission]: scope }).canRoute(path)).toBe(false);
    }
    expect(serviceWith([permission], [], { [permission]: 'ALL' }).canRoute(path)).toBe(true);
    expect(serviceWith(['employee:manage'], [], { 'employee:manage': 'ALL' }).canRoute(path)).toBe(
      false
    );
  });

  it('keeps Benefits self-service separate from Benefits configuration', () => {
    expect(
      serviceWith(['benefits:self'], [], { 'benefits:self': 'SELF' }).canRoute(
        '/workplace/benefits'
      )
    ).toBe(true);
    expect(
      serviceWith(['benefits:self'], [], { 'benefits:self': 'ALL' }).canRoute('/workplace/benefits')
    ).toBe(false);
    expect(
      serviceWith(['benefits:manage'], [], { 'benefits:manage': 'TEAM' }).canRoute(
        '/workplace/benefits'
      )
    ).toBe(false);
    expect(
      serviceWith(['benefits:manage'], [], { 'benefits:manage': 'ALL' }).canRoute(
        '/workplace/benefits'
      )
    ).toBe(true);
  });
});
