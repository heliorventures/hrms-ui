// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadCsv } from '../payrollCsvDownload';

import { usePayrollExports } from './usePayrollExports';

vi.mock('../payrollCsvDownload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../payrollCsvDownload')>()),
  downloadCsv: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('usePayrollExports authorization', () => {
  it('downloads the Form 24Q response using the gateway field name', async () => {
    const request = vi
      .fn()
      .mockResolvedValue({ indiaForm24QSalaryPaymentMonthlyStubCsv: 'salary,csv' });
    const client = new GraphQLClient('https://example.invalid/graphql');
    Object.defineProperty(client, 'request', { value: request });
    const { result } = renderHook(() =>
      usePayrollExports(client, { enabled: true, ownerKey: 'statutory-exporter' })
    );
    act(() => result.current.setLatestCyclePeriod({ month: 10, year: 2026 }));
    await act(async () => result.current.downloadMonthly('form24q'));
    expect(downloadCsv).toHaveBeenCalledWith(
      'india-form24q-salary-month-stub-2026-10.csv',
      'salary,csv'
    );
  });
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
