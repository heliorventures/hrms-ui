// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import PageHeader from '../components/common/PageHeader';

import { NAVIGATION_DESTINATIONS, type NavigationDestination } from './navigationModel';
import PageWorkspaceProvider from './PageWorkspaceProvider';

const state = vi.hoisted(() => ({ destinations: [] as NavigationDestination[] }));
vi.mock('./useAccessibleNavigation', () => ({ useAccessibleNavigation: () => state.destinations }));

const Page = () => {
  const location = useLocation();
  return (
    <>
      <PageHeader title="Employees" />
      <output>{location.pathname}</output>
    </>
  );
};
const View = () => (
  <MemoryRouter initialEntries={['/organization/employees']}>
    <PageWorkspaceProvider>
      <Page />
    </PageWorkspaceProvider>
  </MemoryRouter>
);

beforeEach(() => {
  state.destinations = NAVIGATION_DESTINATIONS.filter((item) =>
    ['/organization/employees', '/admin/employees'].includes(item.path)
  );
});
afterEach(cleanup);

it('switches related tasks with one heading and preserves their routes', () => {
  render(<View />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'People — Employee Directory' })).toBeTruthy();
  fireEvent.change(screen.getByRole('combobox', { name: 'Workspace task' }), {
    target: { value: '/admin/employees' },
  });
  expect(screen.getByRole('heading', { name: 'People — Manage Employees' })).toBeTruthy();
  expect(screen.getByText('/admin/employees')).toBeTruthy();
});

it('removes inaccessible task choices when permissions change', () => {
  const { rerender } = render(<View />);
  expect(screen.getByRole('option', { name: 'Manage Employees' })).toBeTruthy();
  state.destinations = state.destinations.filter((item) => item.path === '/organization/employees');
  rerender(<View />);
  expect(screen.queryByRole('option', { name: 'Manage Employees' })).toBeNull();
  expect(screen.queryByRole('combobox', { name: 'Workspace task' })).toBeNull();
});
