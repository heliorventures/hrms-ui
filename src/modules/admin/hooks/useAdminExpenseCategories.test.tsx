// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AdminExpenseCategoriesDocument,
  ExpensePoliciesForAdminDocument,
  ExpensePolicyDirectoryDocument,
  UpsertExpensePolicyAdminDocument,
} from '../../../api/graphql/graphql';

import { useAdminExpenseCategories } from './useAdminExpenseCategories';

type RequestClient = {
  request: ReturnType<typeof vi.fn>;
};

const graphState = vi.hoisted(() => ({
  client: null as RequestClient | null,
}));

vi.mock('../../../hooks/useGraphClient', () => ({
  useGraphClient: () => graphState.client,
}));

vi.mock('../../../contexts/DialogContext', () => ({
  useDialogs: () => ({ confirm: vi.fn() }),
}));

const category = {
  id: 'category-1',
  name: 'Travel',
  code: 'TRAVEL',
  maxAmountPerClaim: null,
};

const directoryResult = (departmentId: string, departmentName: string) => ({
  departments: [{ id: departmentId, name: departmentName, code: departmentName.toUpperCase() }],
  designations: [],
  expenseAssignableRoles: [],
});

const completeDirectoryResult = (tenant: 'a' | 'b') => ({
  departments: [
    {
      id: `department-${tenant}`,
      name: tenant === 'a' ? 'Finance' : 'People',
      code: tenant === 'a' ? 'FINANCE' : 'PEOPLE',
    },
  ],
  designations: [
    {
      id: `designation-${tenant}`,
      title: tenant === 'a' ? 'Analyst' : 'Partner',
      departmentId: `department-${tenant}`,
      level: null,
    },
  ],
  expenseAssignableRoles: [
    {
      id: `role-${tenant}`,
      name: tenant === 'a' ? 'Finance reviewer' : 'People reviewer',
      description: null,
      isSystemRole: false,
    },
  ],
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createClient(directory: Promise<ReturnType<typeof completeDirectoryResult>>) {
  const request = vi.fn();
  request.mockImplementation((document: unknown) => {
    if (document === AdminExpenseCategoriesDocument) {
      return Promise.resolve({ expenseCategories: [category] });
    }
    if (document === ExpensePoliciesForAdminDocument) {
      return Promise.resolve({ expensePoliciesForAdmin: [] });
    }
    if (document === ExpensePolicyDirectoryDocument) return directory;
    if (document === UpsertExpensePolicyAdminDocument) {
      return Promise.resolve({ upsertExpensePolicy: { id: 'policy-1' } });
    }
    throw new Error('Unexpected GraphQL document');
  });
  return { request } satisfies RequestClient;
}

afterEach(() => {
  cleanup();
  graphState.client = null;
  vi.clearAllMocks();
});

describe('useAdminExpenseCategories directory ownership', () => {
  it('does not expose or submit a previous client policy selection after replacement directory loads', async () => {
    graphState.client = createClient(Promise.resolve(completeDirectoryResult('a')));
    const view = renderHook(() => useAdminExpenseCategories());

    await waitFor(() =>
      expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-a'])
    );

    act(() => {
      view.result.current.setPolicyForm({
        ...view.result.current.policyForm,
        applicableTo: 'DEPARTMENT',
        departmentId: 'department-a',
        designationId: 'designation-a',
        roleId: 'role-a',
      });
    });

    const replacementClient = createClient(Promise.resolve(completeDirectoryResult('b')));
    graphState.client = replacementClient;
    view.rerender();

    await waitFor(() => {
      expect(view.result.current.policyPickerBusy).toBe(false);
      expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-b']);
      expect(view.result.current.designationOptions.map(({ id }) => id)).toEqual([
        'designation-b',
      ]);
      expect(view.result.current.roleOptions.map(({ id }) => id)).toEqual(['role-b']);
    });

    expect(view.result.current.policyForm).toMatchObject({
      departmentId: '',
      designationId: '',
      roleId: '',
    });

    await act(async () => {
      await view.result.current.savePolicy({ preventDefault: vi.fn() } as never);
    });

    expect(
      replacementClient.request.mock.calls.some(
        ([document]) => document === UpsertExpensePolicyAdminDocument
      )
    ).toBe(false);
  });

  it('hides retained options and blocks scoped submission until the replacement client directory is confirmed', async () => {
    graphState.client = createClient(
      Promise.resolve(directoryResult('department-a', 'Finance'))
    );
    const firstClient = graphState.client;
    const view = renderHook(() => useAdminExpenseCategories());

    await waitFor(() => {
      expect(view.result.current.policyPickerBusy).toBe(false);
      expect(view.result.current.departmentOptions.map((option) => option.id)).toEqual([
        'department-a',
      ]);
    });

    act(() => {
      view.result.current.setPolicyForm({
        ...view.result.current.policyForm,
        applicableTo: 'DEPARTMENT',
        departmentId: 'department-a',
      });
    });

    const replacementDirectory = deferred<ReturnType<typeof directoryResult>>();
    const replacementClient = createClient(replacementDirectory.promise);
    graphState.client = replacementClient;
    view.rerender();

    await waitFor(() => expect(view.result.current.policyPickerBusy).toBe(true));
    expect(view.result.current.departmentOptions).toEqual([]);
    expect(view.result.current.policyPickerOrgError).toBeNull();

    await act(async () => {
      await view.result.current.savePolicy({ preventDefault: vi.fn() } as never);
    });

    expect(
      replacementClient.request.mock.calls.some(
        ([document]) => document === UpsertExpensePolicyAdminDocument
      )
    ).toBe(false);
    expect(view.result.current.policyError).toBe(
      'Please wait for the organization directory to finish loading before saving this policy.'
    );

    await act(async () => {
      replacementDirectory.resolve(directoryResult('department-b', 'People'));
      await replacementDirectory.promise;
    });

    await waitFor(() => {
      expect(view.result.current.policyPickerBusy).toBe(false);
      expect(view.result.current.departmentOptions.map((option) => option.id)).toContain(
        'department-b'
      );
    });

    expect(firstClient).not.toBe(replacementClient);
  });

  it('exposes UUID fallback state only after the current client directory request fails', async () => {
    graphState.client = createClient(
      Promise.resolve(directoryResult('department-a', 'Finance'))
    );
    const view = renderHook(() => useAdminExpenseCategories());

    await waitFor(() =>
      expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-a'])
    );

    const replacementDirectory = deferred<ReturnType<typeof directoryResult>>();
    graphState.client = createClient(replacementDirectory.promise);
    view.rerender();

    await waitFor(() => expect(view.result.current.policyPickerBusy).toBe(true));
    expect(view.result.current.policyPickerOrgError).toBeNull();

    await act(async () => {
      replacementDirectory.reject(new Error('replacement directory failed'));
      try {
        await replacementDirectory.promise;
      } catch {
        // The hook converts this failure into current-owner fallback state.
      }
    });

    await waitFor(() => {
      expect(view.result.current.policyPickerBusy).toBe(false);
      expect(view.result.current.policyPickerOrgError).toBeTruthy();
      expect(view.result.current.policyPickerDepartments).toEqual([]);
    });
  });

  it.each([
    ['DEPARTMENT', 'departmentId', 'department-outside-directory', 'department'],
    ['DESIGNATION', 'designationId', 'designation-outside-directory', 'designation'],
    ['ROLE', 'roleId', 'role-outside-directory', 'role'],
  ] as const)(
    'blocks a %s policy selection that is not in the current client directory',
    async (applicableTo, field, selectedId, entityLabel) => {
      graphState.client = createClient(Promise.resolve(completeDirectoryResult('b')));
      const currentClient = graphState.client;
      const view = renderHook(() => useAdminExpenseCategories());

      await waitFor(() =>
        expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-b'])
      );

      act(() => {
        view.result.current.setPolicyForm({
          ...view.result.current.policyForm,
          applicableTo,
          [field]: selectedId,
        });
      });

      await act(async () => {
        await view.result.current.savePolicy({ preventDefault: vi.fn() } as never);
      });

      expect(
        currentClient.request.mock.calls.some(
          ([document]) => document === UpsertExpensePolicyAdminDocument
        )
      ).toBe(false);
      expect(view.result.current.policyError).toBe(
        `Choose a ${entityLabel} from the current organization directory before saving this policy.`
      );
    }
  );

  it.each([
    ['DEPARTMENT', 'departmentId', 'manual-department-id'],
    ['DESIGNATION', 'designationId', 'manual-designation-id'],
    ['ROLE', 'roleId', 'manual-role-id'],
  ] as const)(
    'allows a manual %s UUID only after the current client directory request fails',
    async (applicableTo, field, selectedId) => {
      const failingDirectory = deferred<ReturnType<typeof completeDirectoryResult>>();
      graphState.client = createClient(failingDirectory.promise);
      const currentClient = graphState.client;
      const view = renderHook(() => useAdminExpenseCategories());

      await waitFor(() => expect(view.result.current.policyPickerBusy).toBe(true));

      await act(async () => {
        failingDirectory.reject(new Error('current directory failed'));
        try {
          await failingDirectory.promise;
        } catch {
          // The hook publishes the current-owner directory failure for manual UUID fallback.
        }
      });

      await waitFor(() => {
        expect(view.result.current.policyPickerBusy).toBe(false);
        expect(view.result.current.policyPickerOrgError).toBeTruthy();
      });

      act(() => {
        view.result.current.setPolicyForm({
          ...view.result.current.policyForm,
          applicableTo,
          [field]: selectedId,
        });
      });

      await act(async () => {
        await view.result.current.savePolicy({ preventDefault: vi.fn() } as never);
      });

      const upsertCall = currentClient.request.mock.calls.find(
        ([document]) => document === UpsertExpensePolicyAdminDocument
      );
      expect(upsertCall?.[1]).toEqual({
        input: expect.objectContaining({ applicableTo, [field]: selectedId }),
      });
    }
  );

  it('retains current-client form selection and options across a same-owner rerender', async () => {
    graphState.client = createClient(Promise.resolve(completeDirectoryResult('a')));
    const view = renderHook(() => useAdminExpenseCategories());

    await waitFor(() =>
      expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-a'])
    );

    act(() => {
      view.result.current.setPolicyForm({
        ...view.result.current.policyForm,
        applicableTo: 'DEPARTMENT',
        departmentId: 'department-a',
      });
    });
    view.rerender();

    expect(view.result.current.policyForm.departmentId).toBe('department-a');
    expect(view.result.current.departmentOptions.map(({ id }) => id)).toEqual(['department-a']);
  });
});
