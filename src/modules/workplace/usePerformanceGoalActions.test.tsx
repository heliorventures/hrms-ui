// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';

import { usePerformanceGoalActions } from './usePerformanceGoalActions';

const deferred = () => {
  let resolve: (() => void) | undefined;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve: () => resolve?.() };
};

it('serializes mutations for one participant while allowing another review to progress', async () => {
  const { result } = renderHook(() => usePerformanceGoalActions());
  const first = deferred();
  const second = deferred();

  let firstResult: Promise<boolean> | undefined;
  let duplicateResult: Promise<boolean> | undefined;
  let secondResult: Promise<boolean> | undefined;
  act(() => {
    firstResult = result.current.runGoalAction({
      participantId: 'participant-a',
      operation: () => first.promise,
      successMessage: 'Saved A.',
      isCurrent: () => true,
    });
    duplicateResult = result.current.runGoalAction({
      participantId: 'participant-a',
      operation: () => Promise.resolve(),
      successMessage: 'Duplicate.',
      isCurrent: () => true,
    });
    secondResult = result.current.runGoalAction({
      participantId: 'participant-b',
      operation: () => second.promise,
      successMessage: 'Saved B.',
      isCurrent: () => true,
    });
  });

  expect(result.current.isBusy('participant-a')).toBe(true);
  expect(result.current.isBusy('participant-b')).toBe(true);
  await expect(duplicateResult).resolves.toBe(false);

  act(() => first.resolve());
  act(() => second.resolve());
  await expect(firstResult).resolves.toBe(true);
  await expect(secondResult).resolves.toBe(true);
  await waitFor(() => expect(result.current.busyParticipantIds.size).toBe(0));
});

it('suppresses a completion once the selected review revision is stale', async () => {
  const { result } = renderHook(() => usePerformanceGoalActions());
  const request = deferred();
  let current = true;
  let outcome: Promise<boolean> | undefined;

  act(() => {
    outcome = result.current.runGoalAction({
      participantId: 'participant-a',
      operation: () => request.promise,
      successMessage: 'Goal saved.',
      isCurrent: () => current,
    });
  });
  current = false;
  act(() => request.resolve());

  await expect(outcome).resolves.toBe(true);
  await waitFor(() => expect(result.current.busyParticipantIds.size).toBe(0));
  expect(result.current.result).toBeNull();
});
