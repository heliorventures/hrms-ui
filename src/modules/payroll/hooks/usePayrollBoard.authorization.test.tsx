// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import { PayrollBoardDocument } from '../../../api/graphql/graphql';

import { usePayrollBoard } from './usePayrollBoard';

function clientWith(request: ReturnType<typeof vi.fn>) {
  const client = new GraphQLClient('https://example.invalid/graphql');
  Object.defineProperty(client, 'request', { value: request });
  return client;
}

describe('usePayrollBoard authorization', () => {
  it('does not request or retain payroll data when management authority is absent', async () => {
    const request = vi.fn().mockResolvedValue({ salaryComponents: [], payrollCycles: [] });
    const client = clientWith(request);
    const { result, rerender } = renderHook(
      ({ enabled, ownerKey }) => usePayrollBoard(client, { enabled, ownerKey }),
      { initialProps: { enabled: true, ownerKey: 'manager|payroll:manage=ALL' } }
    );

    await waitFor(() => expect(request).toHaveBeenCalledWith(PayrollBoardDocument, { limit: 20 }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ enabled: false, ownerKey: 'employee|payroll:read=SELF' });

    await waitFor(() => expect(result.current.data).toBeNull());
    expect(result.current.loading).toBe(false);
    expect(request).toHaveBeenCalledTimes(3);
  });
});
