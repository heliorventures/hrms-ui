// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import PerformanceAdministrationPanel from './PerformanceAdministrationPanel';

const state = vi.hoisted(() => ({
  cycles: [],
  cyclesLoading: false,
  cyclesError: null as string | null,
  reloadCycles: vi.fn(),
}));
vi.mock('./usePerformanceAdministration', () => ({ usePerformanceAdministration: () => state }));
afterEach(() => {
  cleanup();
  state.cyclesLoading = false;
  state.cyclesError = null;
  state.reloadCycles.mockClear();
});

it('does not claim a program is empty after a failed cycle request', () => {
  state.cyclesError = 'Cycles could not load';
  render(<PerformanceAdministrationPanel />);
  expect(screen.queryByText('No cycles match this program.')).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain(state.cyclesError);
  fireEvent.click(screen.getByRole('button', { name: 'Retry cycles' }));
  expect(state.reloadCycles).toHaveBeenCalledOnce();
});

it('distinguishes initial loading from empty success', () => {
  state.cyclesLoading = true;
  const { rerender } = render(<PerformanceAdministrationPanel />);
  expect(screen.getByText('Loading cycles...')).toBeTruthy();
  expect(screen.queryByText('No cycles match this program.')).toBeNull();
  state.cyclesLoading = false;
  rerender(<PerformanceAdministrationPanel />);
  expect(screen.getByText('No cycles match this program.')).toBeTruthy();
});
