// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { describe, expect, it, vi } from 'vitest';

import { usePayrollExports } from './usePayrollExports';

describe('usePayrollExports authorization', () => {
  it('suppresses exports when statutory export authority is absent', async () => {
    const request = vi.fn();
    const client = new GraphQLClient('https://example.invalid/graphql');
    Object.defineProperty(client, 'request', { value: request });
    const { result } = renderHook(() =>
      usePayrollExports(client, {
        enabled: false,
        ownerKey: 'payroll-admin|payroll:manage=ALL',
      })
    );

    await act(async () => result.current.downloadMonthly('tds'));
    await act(async () => result.current.downloadFy('fyTotals'));

    expect(request).not.toHaveBeenCalled();
  });
});
