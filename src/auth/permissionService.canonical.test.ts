import { describe, expect, it } from 'vitest';

import type { ParsedClientSession } from './clientSession';
import { PERMISSIONS } from './permissions';
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
});

describe('canonical profile authorization', () => {
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
});

describe('canonical self-service route and action authorization', () => {
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
});

describe('canonical aggregate authorization', () => {
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

  it('denies unknown capabilities and routes', () => {
    const service = serviceWith(['role:manage'], [], { 'role:manage': 'ALL' });
    expect(service.canCapability('unknown.capability' as never)).toBe(false);
    expect(service.canRoute('/unknown')).toBe(false);
  });
});
