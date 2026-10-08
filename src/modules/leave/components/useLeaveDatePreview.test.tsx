// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import type { useApplyLeaveFields } from './useApplyLeaveFields';
import type { ApplyLeaveOwnership } from './useApplyLeaveForm';
import { useLeaveDatePreview } from './useLeaveDatePreview';
import { validateLeaveApplication, type LeaveValidationInput } from './validateLeaveApplication';
afterEach(cleanup);
const fields = (fromDate: string) =>
  ({ leaveTypeId: 'annual', fromDate, toDate: fromDate, isHalfDay: false }) as ReturnType<
    typeof useApplyLeaveFields
  >;
function owner(request: ReturnType<typeof vi.fn>) {
  const context = { client: { request }, isOpen: true };
  return {
    dialogContext: context,
    dialogContextRef: { current: context },
  } as unknown as ApplyLeaveOwnership;
}
it('uses the server count for a location working Saturday', async () => {
  const request = vi.fn().mockResolvedValue({ leaveDatePreview: { requestedDays: '1' } });
  const ownership = owner(request);
  const { result } = renderHook(() => useLeaveDatePreview(ownership, fields('2026-10-03'), false));
  await waitFor(() => expect(result.current.requestedDays).toBe(1));
  expect(request.mock.calls[0][1]).toMatchObject({ fromDate: '2026-10-03', isHalfDay: false });
  const input: LeaveValidationInput = {
    ...fields('2026-10-03'),
    reason: 'Family appointment',
    requiresDocument: false,
    supportingDocumentFile: null,
    halfDaySession: '',
    halfDayEligible: true,
    consumesLeaveBalance: false,
    upcomingHolidays: [],
    requestedDays: 1,
  };
  expect(validateLeaveApplication(input)).toBeNull();
});
it('suppresses an old draft calculation and supports retry', async () => {
  let resolveFirst: ((value: unknown) => void) | undefined;
  const request = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    )
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValue({ leaveDatePreview: { requestedDays: '0.5' } });
  const ownership = owner(request);
  const { result, rerender } = renderHook(
    ({ date }) => useLeaveDatePreview(ownership, fields(date), false),
    { initialProps: { date: '2026-10-03' } }
  );
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  rerender({ date: '2026-10-05' });
  await act(async () => resolveFirst?.({ leaveDatePreview: { requestedDays: '99' } }));
  await waitFor(() => expect(result.current.previewError).toBeTruthy());
  expect(result.current.requestedDays).toBeUndefined();
  act(() => result.current.retryPreview());
  await waitFor(() => expect(result.current.requestedDays).toBe(0.5));
});
