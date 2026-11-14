// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  RoleAccessConfigurationDocument,
  SetRoleAccessDocument,
  type RbacAccessBoardQuery,
} from '../../api/rbac/graphql';
import type { useGraphClient } from '../../hooks/useGraphClient';

import { useRbacRoleAccess } from './useRbacRoleAccess';

const { confirm } = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock('../../contexts/DialogContext', () => ({ useDialogs: () => ({ confirm }) }));
afterEach(cleanup);
beforeEach(() => {
  confirm.mockReset().mockResolvedValue(true);
});

const permission = {
  id: 'loan-read',
  resource: 'loan',
  action: 'read',
  description: null,
  supportedScopeTypes: ['SELF', 'TEAM', 'DEPARTMENT', 'ALL'],
};
const board: RbacAccessBoardQuery = {
  tenantDirectoryUsers: [],
  tenantDirectoryRoles: [{ id: 'hr', name: 'HR', isSystemRole: true }],
  tenantCatalogPermissions: [permission],
};

function editor(
  existing: string[],
  failLoad = false,
  oldScopes: { resource: string; action: string; scopeType: string }[] = []
) {
  const request = vi.fn().mockImplementation((document: unknown) => {
    if (document === RoleAccessConfigurationDocument) {
      if (failLoad) return Promise.reject(new Error('load failed'));
      return Promise.resolve({
        permissionIdsForRole: existing,
        permissionScopesForRole: oldScopes,
      });
    }
    return Promise.resolve({ setRoleAccess: true });
  });
  const client = { request } as unknown as ReturnType<typeof useGraphClient>;
  const setError = vi.fn();
  const setInfo = vi.fn();
  const hook = renderHook(() => useRbacRoleAccess(client, board, setError, setInfo));
  act(() => {
    hook.result.current.selectRole('hr');
  });
  return { ...hook, request, setError };
}

describe('Access configuration save', () => {
  it('does not reuse an orphan scope when an unassigned permission is selected', async () => {
    const { result, request, setError } = editor([], false, [
      { resource: 'loan', action: 'read', scopeType: 'ALL' },
    ]);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    act(() => {
      result.current.toggle('loan-read');
    });
    await act(async () => {
      await result.current.save();
    });
    expect(setError).toHaveBeenCalledWith('Select a supported scope for loan:read.');
    expect(
      request.mock.calls.filter(([document]) => document === SetRoleAccessDocument)
    ).toHaveLength(0);
  });
  it('retains an existing unscoped extra without inferring ALL or a separate scope write', async () => {
    const { result, request } = editor(['loan-read']);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    await act(async () => {
      await result.current.save();
    });
    const writes = request.mock.calls.filter(([document]) => document === SetRoleAccessDocument);
    expect(writes).toEqual([
      [SetRoleAccessDocument, { roleId: 'hr', permissionIds: ['loan-read'], scopes: [] }],
    ]);
  });
  it('requires a deliberate scope for a new grant then submits one coherent mutation', async () => {
    const { result, request, setError } = editor([]);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    act(() => {
      result.current.toggle('loan-read');
    });
    await act(async () => {
      await result.current.save();
    });
    expect(setError).toHaveBeenCalledWith('Select a supported scope for loan:read.');
    expect(
      request.mock.calls.filter(([document]) => document === SetRoleAccessDocument)
    ).toHaveLength(0);
    act(() => {
      result.current.changeScope(permission, 'SELF');
    });
    await act(async () => {
      await result.current.save();
    });
    expect(request.mock.calls.filter(([document]) => document === SetRoleAccessDocument)).toEqual([
      [
        SetRoleAccessDocument,
        {
          roleId: 'hr',
          permissionIds: ['loan-read'],
          scopes: [{ resource: 'loan', action: 'read', scopeType: 'SELF' }],
        },
      ],
    ]);
  });
  it('does not replace a role with an empty configuration after a failed load', async () => {
    const { result, request, setError } = editor([], true);
    await waitFor(() => {
      expect(setError).toHaveBeenCalled();
    });
    await act(async () => {
      await result.current.save();
    });
    expect(
      request.mock.calls.filter(([document]) => document === SetRoleAccessDocument)
    ).toHaveLength(0);
    expect(confirm).not.toHaveBeenCalled();
  });
});
