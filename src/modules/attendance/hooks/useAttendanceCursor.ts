import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import type { useGraphClient } from '../../../hooks/useGraphClient';

import { cursorOwnerIdentityMatches, type CursorOwnerIdentity } from './attendanceRequestIdentity';

export function useAttendanceCursor(
  client: ReturnType<typeof useGraphClient>,
  employeeId: string | undefined,
  monthBounds: { start: string; end: string }
) {
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [cursorStackOwner, setCursorStackOwner] = useState<CursorOwnerIdentity | null>(null);

  const cursorOwnerIdentity = useMemo(
    () => ({ client, employeeId, fromDate: monthBounds.start, toDate: monthBounds.end }),
    [client, employeeId, monthBounds.end, monthBounds.start]
  );
  const cursorStackIsCurrent = cursorOwnerIdentityMatches(cursorStackOwner, cursorOwnerIdentity);
  const effectiveCursorStack = cursorStackIsCurrent ? cursorStack : [];
  const activeCursor = effectiveCursorStack.length
    ? effectiveCursorStack[effectiveCursorStack.length - 1]
    : undefined;
  const queryKey = `${monthBounds.start}:${monthBounds.end}:${activeCursor ?? ''}`;
  const requestIdentity = useMemo(
    () => ({ client, employeeId, queryKey }),
    [client, employeeId, queryKey]
  );
  useLayoutEffect(() => {
    if (cursorStackIsCurrent) return;
    setCursorStack((current) => (current.length === 0 ? current : []));
    setCursorStackOwner(cursorOwnerIdentity);
  }, [cursorOwnerIdentity, cursorStackIsCurrent]);

  const changeCursor = useCallback((nextCursor: string | undefined) => {
    setCursorStack((current) => {
      if (!nextCursor) return [];
      if (current[current.length - 1] === nextCursor) return current;
      if (current.length > 1 && current[current.length - 2] === nextCursor) {
        return current.slice(0, -1);
      }
      return [...current, nextCursor];
    });
  }, []);

  const resetCursorStack = useCallback(() => {
    setCursorStack([]);
  }, []);

  return {
    effectiveCursorStack,
    activeCursor,
    queryKey,
    requestIdentity,
    changeCursor,
    resetCursorStack,
  };
}
