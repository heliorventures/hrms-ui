// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { usePayslipPresentation } from './usePayslipPresentation';

afterEach(cleanup);

it('blocks output when the JSON settlement does not satisfy the payslip statement contract', async () => {
  const request = vi.fn().mockResolvedValue({
    payslipPresentation: { template: 'TABLE', lines: [], statement: { gross: '40000' } },
  });
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() => usePayslipPresentation(client, 'company-a', 'slip-a'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeTruthy();
});

it('refreshes an open payslip after company presentation settings change', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce({
      payslipPresentation: { template: 'EXISTING', lines: [], statement: null },
    })
    .mockResolvedValueOnce({
      payslipPresentation: { template: 'TABLE', lines: [], statement: null },
    });
  const client = new GraphQLClient('https://example.invalid');
  Object.defineProperty(client, 'request', { value: request });
  const { result } = renderHook(() => usePayslipPresentation(client, 'company-a', 'slip-a'));
  await waitFor(() => expect(result.current.data?.template).toBe('EXISTING'));
  act(() => {
    window.dispatchEvent(new Event('company-payslip-settings-changed'));
  });
  await waitFor(() => expect(result.current.data?.template).toBe('TABLE'));
});
