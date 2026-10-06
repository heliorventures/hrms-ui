// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import type { HrReportKind } from './reportDocuments';
import { useClaimTravelReportFilters } from './useClaimTravelReportFilters';

afterEach(cleanup);
it('keeps draft changes separate from the immutable applied filter', () => {
  const { result } = renderHook(() => useClaimTravelReportFilters('EXPENSE_CLAIMS'));
  act(() => result.current.updateDraft({ paymentStatus: 'PAID' }));
  expect(result.current.applied).toEqual({});
  act(() => result.current.apply());
  const applied = result.current.applied;
  expect(applied).toEqual({ paymentStatus: 'PAID' });
  act(() => result.current.updateDraft({ paymentStatus: 'NONE' }));
  expect(result.current.applied).toBe(applied);
  act(() => result.current.clear());
  expect(result.current.applied).toEqual({});
  expect(result.current.draft).toEqual({});
});
it('clears incompatible values immediately when report kind changes', () => {
  const { result, rerender } = renderHook(
    ({ kind }: { kind: HrReportKind }) => useClaimTravelReportFilters(kind),
    { initialProps: { kind: 'EXPENSE_CLAIMS' as HrReportKind } }
  );
  act(() => result.current.updateDraft({ paymentStatus: 'PAID', expenseCategoryId: 'category-1' }));
  act(() => result.current.apply());
  rerender({ kind: 'TRAVEL_REQUESTS' });
  expect(result.current.applied).toEqual({});
  expect(result.current.draft).toEqual({});
});
