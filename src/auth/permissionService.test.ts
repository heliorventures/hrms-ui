import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { createPermissionService } from './permissionService';
import { PERMISSIONS } from './permissions';

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

  it('requires every ALL-scoped permission used by the combined reports page', () => {
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
    expect(
      serviceWith(['employee:manage'], [], { 'employee:manage': 'ALL' }).canRoute(path)
    ).toBe(false);
  });

  it('keeps Benefits self-service separate from Benefits configuration', () => {
    expect(
      serviceWith(['benefits:self'], [], { 'benefits:self': 'SELF' }).canRoute(
        '/workplace/benefits'
      )
    ).toBe(true);
    expect(
      serviceWith(['benefits:self'], [], { 'benefits:self': 'ALL' }).canRoute(
        '/workplace/benefits'
      )
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

describe('canonical self-service authorization', () => {
  it('exports every canonical Rust-backed permission code used by React', () => {
    expect(PERMISSIONS).toMatchObject({
      employeeDirectoryRead: 'employee_directory:read',
      employeeRead: 'employee:read',
      employeeManage: 'employee:manage',
      attendanceRead: 'attendance:read',
      timesheetRead: 'timesheet:read',
      timesheetWrite: 'timesheet:write',
      leaveRead: 'leave:read',
      leaveSubmit: 'leave:submit',
      expenseRead: 'expense:read',
      expenseSubmit: 'expense:submit',
      travelRead: 'travel:read',
      travelSubmit: 'travel:submit',
      travelApprove: 'travel:approve',
      travelManage: 'travel:manage',
      payrollRead: 'payroll:read',
      payrollManage: 'payroll:manage',
      taxRead: 'tax:read',
      taxSubmit: 'tax:submit',
      taxManage: 'tax:manage',
      notificationRead: 'notification:read',
    });
  });

  it('uses the directory permission only for company directory routes', () => {
    const directoryAll = serviceWith(['employee_directory:read'], [], {
      'employee_directory:read': 'ALL',
    });

    expect(directoryAll.canRoute('/organization/employees')).toBe(true);
    expect(directoryAll.canRoute('/organization/org-chart')).toBe(true);
    expect(serviceWith(['employee_directory:read']).canRoute('/organization/employees')).toBe(
      false
    );
    expect(
      serviceWith(['employee:read'], [], { 'employee:read': 'ALL' }).canRoute(
        '/organization/employees'
      )
    ).toBe(false);
  });

  it('uses an explicit employee:read scope for profile settings and retires employee:self', () => {
    expect(
      serviceWith(['employee:read'], [], { 'employee:read': 'SELF' }).canRoute('/profile/settings')
    ).toBe(true);
    expect(
      serviceWith(['employee:read'], [], { 'employee:read': 'TEAM' }).canRoute('/profile/settings')
    ).toBe(true);
    expect(serviceWith(['employee:read'], [], {}).canRoute('/profile/settings')).toBe(false);
    expect(
      serviceWith(['employee:self'], [], { 'employee:self': 'SELF' }).canRoute('/profile/settings')
    ).toBe(false);
  });

  it.each([
    ['/attendance', 'attendance:read'],
    ['/timesheet', 'timesheet:read'],
    ['/leave', 'leave:read'],
    ['/leave/holidays', 'leave:read'],
    ['/leave/team-calendar', 'leave:read'],
    ['/notifications', 'notification:read'],
    ['/payroll/payslips', 'payroll:read'],
    ['/payroll/pay', 'payroll:manage'],
    ['/payroll/tax', 'tax:manage'],
  ])('requires %s to have exact permission %s', (path, permission) => {
    expect(serviceWith([]).canRoute(path)).toBe(false);
    expect(
      serviceWith([permission], [], {
        [permission]:
          permission === 'payroll:manage' || permission === 'tax:manage' ? 'ALL' : 'SELF',
      }).canRoute(path)
    ).toBe(true);
  });

  it('keeps employee tax self-service separate from Tax Admin', () => {
    expect(serviceWith(['tax:read'], [], { 'tax:read': 'SELF' }).canRoute('/payroll/tax')).toBe(
      false
    );
    expect(serviceWith(['tax:manage'], [], { 'tax:manage': 'SELF' }).canRoute('/payroll/tax')).toBe(
      false
    );
    expect(serviceWith(['tax:manage'], [], { 'tax:manage': 'ALL' }).canRoute('/payroll/tax')).toBe(
      true
    );
  });

  it('opens expenses for exact scoped read or approval authority', () => {
    expect(serviceWith([]).canRoute('/expenses')).toBe(false);
    expect(serviceWith(['expense:read']).canRoute('/expenses')).toBe(true);
    expect(serviceWith(['travel:read']).canRoute('/expenses')).toBe(true);
    expect(
      serviceWith(['expense:approve'], [], { 'expense:approve': 'TEAM' }).canRoute('/expenses')
    ).toBe(true);
    expect(
      serviceWith(['travel:approve'], [], { 'travel:approve': 'TEAM' }).canRoute('/expenses')
    ).toBe(true);
    expect(
      serviceWith(['expense:submit'], [], { 'expense:submit': 'SELF' }).canRoute('/expenses')
    ).toBe(true);
    expect(serviceWith(['expense:approve']).canRoute('/expenses')).toBe(false);
  });

  it('separates payroll-owned and workplace-owned compensation authority', () => {
    expect(
      serviceWith(['payroll:manage'], [], { 'payroll:manage': 'ALL' }).canRoute(
        '/payroll/compensation'
      )
    ).toBe(true);
    expect(serviceWith(['compensation:manage']).canRoute('/payroll/compensation')).toBe(false);
    expect(serviceWith(['payroll:statutory_export']).canRoute('/payroll/compensation')).toBe(false);

    expect(
      serviceWith(['compensation:manage'], [], { 'compensation:manage': 'ALL' }).canRoute(
        '/workplace/compensation'
      )
    ).toBe(true);
    expect(serviceWith(['payroll:manage']).canRoute('/workplace/compensation')).toBe(false);
  });

  it('fails closed when a scoped permission has no explicit scope', () => {
    const service = serviceWith(['expense:read', 'payroll:read', 'tax:read'], [], {});

    expect(service.canRoute('/expenses')).toBe(false);
    expect(service.canRoute('/payroll/payslips')).toBe(false);
    expect(service.canRoute('/payroll/tax')).toBe(false);
  });

  it('requires ALL scope for payroll management and statutory exports', () => {
    const self = serviceWith(['payroll:manage', 'payroll:statutory_export'], [], {
      'payroll:manage': 'SELF',
      'payroll:statutory_export': 'SELF',
    });
    const all = serviceWith(['payroll:manage', 'payroll:statutory_export'], [], {
      'payroll:manage': 'ALL',
      'payroll:statutory_export': 'ALL',
    });

    expect(self.canCapability('action.payroll.manage')).toBe(false);
    expect(self.canCapability('action.payroll.export')).toBe(false);
    expect(all.canCapability('action.payroll.manage')).toBe(true);
    expect(all.canCapability('action.payroll.export')).toBe(true);
  });

  it('separates SELF tax submission from broad approval and ALL management', () => {
    const self = serviceWith(['tax:submit', 'tax:approve', 'tax:manage'], [], {
      'tax:submit': 'SELF',
      'tax:approve': 'SELF',
      'tax:manage': 'SELF',
    });
    const all = serviceWith(['tax:submit', 'tax:approve', 'tax:manage'], [], {
      'tax:submit': 'ALL',
      'tax:approve': 'ALL',
      'tax:manage': 'ALL',
    });

    expect(self.canCapability('action.tax.submit')).toBe(true);
    expect(self.canCapability('action.tax.approve')).toBe(false);
    expect(self.canCapability('action.tax.manage')).toBe(false);
    expect(all.canCapability('action.tax.submit')).toBe(false);
    expect(all.canCapability('action.tax.approve')).toBe(true);
    expect(all.canCapability('action.tax.manage')).toBe(true);
  });

  it('keeps read and action permissions independent', () => {
    const readOnly = serviceWith([
      'attendance:read',
      'timesheet:read',
      'leave:read',
      'expense:read',
      'travel:read',
      'payroll:read',
      'tax:read',
    ]);

    expect(readOnly.canCapability('action.attendance.punch')).toBe(false);
    expect(readOnly.canCapability('action.timesheet.write')).toBe(false);
    expect(readOnly.canCapability('action.leave.submit')).toBe(false);
    expect(readOnly.canCapability('action.expense.submit')).toBe(false);
    expect(readOnly.canCapability('action.travel.submit')).toBe(false);
    expect(readOnly.canCapability('action.travel.approve')).toBe(false);
    expect(readOnly.canCapability('action.travel.manage')).toBe(false);
    expect(readOnly.canCapability('action.payroll.manage')).toBe(false);
    expect(readOnly.canCapability('action.tax.submit')).toBe(false);
    expect(readOnly.canCapability('action.tax.approve')).toBe(false);
    expect(readOnly.canCapability('action.tax.manage')).toBe(false);
  });

  it.each([
    ['dashboard.attendance', 'attendance:read'],
    ['dashboard.leave', 'leave:read'],
    ['dashboard.notifications', 'notification:read'],
  ] as const)('gates %s with %s', (capability, permission) => {
    expect(serviceWith([]).canCapability(capability)).toBe(false);
    expect(serviceWith([permission]).canCapability(capability)).toBe(true);
  });
});
