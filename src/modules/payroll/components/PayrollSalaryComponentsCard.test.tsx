// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import PayrollSalaryComponentsCard from './PayrollSalaryComponentsCard';

afterEach(cleanup);

it('reports a failed catalog with retry instead of claiming there are no components', () => {
  const retry = vi.fn();
  render(
    <PayrollSalaryComponentsCard
      rows={[]}
      loading={false}
      error="Catalog unavailable"
      onRetry={retry}
    />
  );
  expect(screen.queryByText('No Salary Components Found.')).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain('Catalog unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Retry salary components' }));
  expect(retry).toHaveBeenCalledOnce();
});

it('shows an empty catalog only after a successful load', () => {
  render(<PayrollSalaryComponentsCard rows={[]} loading={false} error={null} onRetry={() => {}} />);
  expect(screen.getByText('No Salary Components Found.')).toBeTruthy();
});

it('does not show an empty catalog while loading', () => {
  render(<PayrollSalaryComponentsCard rows={[]} loading error={null} onRetry={() => {}} />);
  expect(screen.getByText('Loading Salary Components...')).toBeTruthy();
  expect(screen.queryByText('No Salary Components Found.')).toBeNull();
});
