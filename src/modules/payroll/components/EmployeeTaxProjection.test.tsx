// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import EmployeeTaxProjection from './EmployeeTaxProjection';

const state = vi.hoisted(() => ({
  load: vi.fn(() => ({ loading: false, error: '', data: null })),
}));
vi.mock('../hooks/useTaxProjection', () => ({ useTaxProjection: state.load }));
vi.mock('../../../contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { timezone: 'Asia/Kolkata' } }),
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});
it('shows a financial-year projection without a self-service withholding month input', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
  render(<EmployeeTaxProjection client={{} as GraphQLClient} ownerKey="self" />);
  expect(screen.queryByLabelText('Withholding month')).toBeNull();
  expect(screen.getByLabelText('Financial year')).toBeTruthy();
  expect(state.load).toHaveBeenLastCalledWith(expect.anything(), 'self', null, 2026, 10);
});
