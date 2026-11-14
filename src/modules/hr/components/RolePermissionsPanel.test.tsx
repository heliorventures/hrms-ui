// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RolePermissionsPanel from './RolePermissionsPanel';

afterEach(cleanup);

const permission = {
  id: 'loan-read',
  resource: 'loan',
  action: 'read',
  description: null,
  supportedScopeTypes: ['SELF', 'TEAM', 'DEPARTMENT', 'ALL'],
};

describe('RolePermissionsPanel', () => {
  it('shows a retained unscoped grant as inactive and requires deliberate scope selection', () => {
    const onScopeChange = vi.fn();
    const props = {
      loading: false,
      permissionIds: new Set(['loan-read']),
      permissionsByResource: new Map([['loan', [permission]]]),
      roles: [{ id: 'hr', name: 'HR', description: null, isSystemRole: true }],
      selectedRoleId: 'hr',
      scopeRows: [],
      saving: false,
      onRoleChange: vi.fn(),
      onSave: vi.fn(),
      onTogglePermission: vi.fn(),
      onScopeChange,
    };
    render(<RolePermissionsPanel {...props} />);
    expect(screen.getByText(/Inactive.*no scope/i)).toBeTruthy();
    const scope = screen.getByLabelText('Scope for loan:read');
    expect((scope as HTMLSelectElement).value).toBe('');
    fireEvent.change(scope, { target: { value: 'SELF' } });
    expect(onScopeChange).toHaveBeenCalledWith(permission, 'SELF');
  });

  it('offers only backend supported scopes and saves permissions and scopes together', () => {
    const props = {
      loading: false,
      permissionIds: new Set(['loan-manage']),
      permissionsByResource: new Map([
        [
          'loan',
          [{ ...permission, id: 'loan-manage', action: 'manage', supportedScopeTypes: ['ALL'] }],
        ],
      ]),
      roles: [],
      selectedRoleId: 'hr',
      scopeRows: [],
      saving: false,
      onRoleChange: vi.fn(),
      onSave: vi.fn(),
      onTogglePermission: vi.fn(),
      onScopeChange: vi.fn(),
    };
    render(<RolePermissionsPanel {...props} />);
    const scope = screen.getByLabelText('Scope for loan:manage');
    expect(Array.from((scope as HTMLSelectElement).options).map((row) => row.value)).toEqual([
      '',
      'ALL',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Save permissions and scopes' }));
    expect(props.onSave).toHaveBeenCalledOnce();
  });
});
