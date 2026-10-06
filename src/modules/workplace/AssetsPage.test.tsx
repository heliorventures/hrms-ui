// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PERMISSIONS } from '../../auth/permissions';

import AssetsPage from './AssetsPage';

const auth = vi.hoisted(() => ({ permissions: new Set<string>() }));
const api = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ can: (permission: string) => auth.permissions.has(permission) }),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => api }));

beforeEach(() => {
  auth.permissions = new Set([PERMISSIONS.assetsManage]);
  const page = {
    rows: [],
    pageInfo: {
      currentPage: 1,
      perPage: 15,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
  api.request.mockReset().mockResolvedValue({
    assetInventoryPage: page,
    assetCategoriesPage: page,
    assetAllocationsPage: page,
    assetEmployeeOptionsPage: page,
    assetLocationOptions: [],
  });
});
afterEach(cleanup);

describe('asset workspace navigation', () => {
  it('keeps inventory readable without exposing management actions', async () => {
    auth.permissions = new Set([PERMISSIONS.assetsRead]);
    render(
      <MemoryRouter>
        <AssetsPage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Search' }).hasAttribute('disabled')).toBe(false)
    );
    expect(screen.getByRole('combobox', { name: 'Asset section' })).toHaveProperty(
      'value',
      'inventory'
    );
    expect(screen.queryByRole('button', { name: 'New Asset' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'categories' },
    });
    expect(screen.queryByRole('button', { name: 'New Category' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'assignments' },
    });
    expect(screen.queryByRole('button', { name: 'Assign Asset' })).toBeNull();
  });

  it('opens the asset and category editors from their respective workflows', async () => {
    render(
      <MemoryRouter>
        <AssetsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'New Asset' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: /Category: Select category/ })
    ).toBeTruthy();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'categories' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'New Category' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Save Category' })
    ).toBeTruthy();
    await waitFor(() => expect(api.request).toHaveBeenCalled());
  });

  it('shows one workflow at a time and preserves inventory filters across tabs', async () => {
    render(
      <MemoryRouter>
        <AssetsPage />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Search' }).hasAttribute('disabled')).toBe(false)
    );
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'New Category' })).toBeNull();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), {
      target: { value: 'Laptop' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    fireEvent.click(screen.getByRole('button', { name: 'Available' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'categories' },
    });
    expect(screen.getByRole('button', { name: 'New Category' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'New Asset' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'inventory' },
    });
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Search' }).value).toBe('Laptop');
    expect(screen.getByRole('button', { name: 'Available' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'assignments' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Assign Asset' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('restricts employee navigation to their assigned assets and history', async () => {
    auth.permissions.clear();
    render(
      <MemoryRouter>
        <AssetsPage />
      </MemoryRouter>
    );
    expect(screen.queryByRole('option', { name: 'Inventory' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Categories' })).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Asset section' })).toHaveProperty(
      'value',
      'assignments'
    );
    expect(screen.queryByRole('button', { name: 'Assign Asset' })).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: 'Asset section' }), {
      target: { value: 'history' },
    });
    expect(screen.getByRole('tabpanel', { name: 'history' })).toBeTruthy();
    await waitFor(() => expect(api.request).toHaveBeenCalled());
  });
});
