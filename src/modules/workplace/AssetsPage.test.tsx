// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    render(<AssetsPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Search' }).hasAttribute('disabled')).toBe(false)
    );
    expect(screen.getByRole('tab', { name: 'Inventory' }).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(screen.queryByRole('button', { name: 'New Asset' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));
    expect(screen.queryByRole('button', { name: 'New Category' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Assignments & Returns' }));
    expect(screen.queryByRole('button', { name: 'Assign Asset' })).toBeNull();
  });

  it('opens the asset and category editors from their respective workflows', async () => {
    render(<AssetsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New Asset' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: /Category: Select category/ })
    ).toBeTruthy();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));
    fireEvent.click(screen.getByRole('button', { name: 'New Category' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Save Category' })
    ).toBeTruthy();
    await waitFor(() => expect(api.request).toHaveBeenCalled());
  });

  it('shows one workflow at a time and preserves inventory filters across tabs', async () => {
    render(<AssetsPage />);
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
    fireEvent.click(screen.getByRole('tab', { name: 'Categories' }));
    expect(screen.getByRole('button', { name: 'New Category' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'New Asset' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Inventory' }));
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Search' }).value).toBe('Laptop');
    expect(screen.getByRole('button', { name: 'Available' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Inventory' }), { key: 'ArrowRight' });
    expect(
      screen.getByRole('tab', { name: 'Assignments & Returns' }).getAttribute('aria-selected')
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Assign Asset' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('restricts employee navigation to their assigned assets and history', async () => {
    auth.permissions.clear();
    render(<AssetsPage />);
    expect(screen.queryByRole('tab', { name: 'Inventory' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Categories' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'My Assets' }).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(screen.queryByRole('button', { name: 'Assign Asset' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));
    expect(within(screen.getByRole('tabpanel')).getByText('My Asset History')).toBeTruthy();
    await waitFor(() => expect(api.request).toHaveBeenCalled());
  });
});
