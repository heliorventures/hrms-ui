// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePayslipUnpaidLeave } from './usePayslipUnpaidLeave';

afterEach(cleanup);

describe('payslip unpaid leave ownership', () => {
  it('does not load without an authorized active payslip', () => {
    const request = vi.fn();
    const client = { request } as unknown as GraphQLClient;
    const { result } = renderHook(() => usePayslipUnpaidLeave(client, 'owner', null));
    expect(request).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });
  it('ignores a stale payslip response after period or tenant changes', async () => {
    let finish!: (value: unknown) => void;
    const request = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          })
      )
      .mockResolvedValueOnce({ payslipUnpaidLeave: null });
    const client = { request } as unknown as GraphQLClient;
    const { result, rerender } = renderHook(
      ({ owner, id }) => usePayslipUnpaidLeave(client, owner, id),
      { initialProps: { owner: 'a', id: 'slip-a' } }
    );
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    rerender({ owner: 'b', id: 'slip-b' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => Promise.resolve(finish({ payslipUnpaidLeave: { amount: '1000' } })));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
  it('reports load failure and supports retry', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error('Details unavailable'))
      .mockResolvedValueOnce({ payslipUnpaidLeave: null });
    const client = { request } as unknown as GraphQLClient;
    const { result } = renderHook(() => usePayslipUnpaidLeave(client, 'owner', 'slip'));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(request).toHaveBeenCalledTimes(2);
  });
});
