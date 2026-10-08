import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { LeaveBoardQuery } from '../../../api/graphql/graphql';
import {
  HrLeaveApprovalBoardDocument,
  type HrLeaveApprovalBoardQuery,
} from '../../../api/leave-queue/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { HrLeaveFilter } from '../components/HrLeaveFilterTabs';

export const HR_LEAVE_LIMIT = 20;
export function recoverQueueFocus(queue: HTMLElement | null) {
  const active = document.activeElement;
  if (queue?.isConnected && (!active || active === document.body || !active.isConnected)) {
    queue.focus();
  }
}
type Client = ReturnType<typeof useGraphClient>;
export type HrLeaveApprovalBoard = Omit<LeaveBoardQuery, '__typename' | 'upcomingHolidays'> & {
  leaveApprovalQueue: HrLeaveApprovalBoardQuery['leaveApprovalQueue'];
};
type Failure = { message: string; operation: 'board' | 'mutation' };
interface BoardOwner {
  client: Client;
  key: string;
}
interface BoardState {
  owner: BoardOwner;
  data: HrLeaveApprovalBoard | null;
  loading: boolean;
  failure: Failure | null;
}
interface BoardOptions {
  client: Client;
  identity: string;
  balanceYear: number;
  requestPage: number;
  filter: HrLeaveFilter;
  clearWorkflowFailure: () => void;
}

export const useHrLeaveApprovalBoard = ({
  client,
  identity,
  balanceYear,
  requestPage,
  filter,
  clearWorkflowFailure,
}: BoardOptions) => {
  const key = `${identity}:${balanceYear}:${requestPage}:${filter}`;
  const owner = useMemo(() => ({ client, key }), [client, key]);
  const currentOwner = useRef<BoardOwner | null>(owner);
  const generation = useRef(0);
  const queueRef = useRef<HTMLElement>(null);
  const focusFrame = useRef<number>();
  const [snapshot, setSnapshot] = useState<BoardState | null>(null);
  useLayoutEffect(() => {
    currentOwner.current = owner;
    generation.current += 1;
    return () => {
      currentOwner.current = null;
      generation.current += 1;
      if (focusFrame.current !== undefined) window.cancelAnimationFrame(focusFrame.current);
    };
  }, [owner]);
  const isCurrent = useCallback(() => currentOwner.current === owner, [owner]);
  const setFailure = useCallback(
    (failure: Failure | null) => {
      if (!isCurrent()) return;
      setSnapshot((previous) =>
        previous?.owner === owner
          ? { ...previous, failure }
          : { owner, data: null, loading: false, failure }
      );
    },
    [isCurrent, owner]
  );

  const reload = useCallback(
    async (preserveFailure = false, removedRequestId?: string) => {
      if (!isCurrent()) return;
      const revision = ++generation.current;
      const ownsResult = () => isCurrent() && generation.current === revision;
      setSnapshot((previous) => ({
        owner,
        data: previous?.owner === owner ? previous.data : null,
        loading: true,
        failure: preserveFailure && previous?.owner === owner ? previous.failure : null,
      }));
      clearWorkflowFailure();
      try {
        const result = await client.request(HrLeaveApprovalBoardDocument, {
          limit: HR_LEAVE_LIMIT,
          offset: requestPage * HR_LEAVE_LIMIT,
          balanceYear,
          fromDate: `${balanceYear}-01-01`,
          toDate: `${balanceYear}-12-31`,
          status: filter === 'all' || filter === 'actionable' ? null : filter.toUpperCase(),
          needsMyAction: filter === 'actionable',
        });
        if (!ownsResult()) return;
        const data = {
          ...result,
          leaveRequests: result.leaveApprovalQueue.rows,
          leaveRequestCount: result.leaveApprovalQueue.totalCount,
        };
        setSnapshot((previous) => ({
          owner,
          data,
          loading: false,
          failure: preserveFailure && previous?.owner === owner ? previous.failure : null,
        }));
        if (removedRequestId && !data.leaveRequests.some((row) => row.id === removedRequestId)) {
          focusFrame.current = window.requestAnimationFrame(() => {
            if (!ownsResult() || !queueRef.current?.isConnected) return;
            recoverQueueFocus(queueRef.current);
          });
        }
      } catch (error) {
        if (!ownsResult()) return;
        setSnapshot((previous) => ({
          owner,
          data: previous?.owner === owner ? previous.data : null,
          loading: false,
          failure:
            preserveFailure &&
            previous?.owner === owner &&
            previous.failure?.operation === 'mutation'
              ? previous.failure
              : { message: graphQlUserMessage(error), operation: 'board' },
        }));
      }
    },
    [balanceYear, clearWorkflowFailure, client, filter, isCurrent, owner, requestPage]
  );
  useEffect(() => {
    void reload();
  }, [reload]);
  const visible = snapshot?.owner === owner ? snapshot : null;
  return {
    data: visible?.data ?? null,
    loading: visible?.loading ?? true,
    failure: visible?.failure ?? null,
    setFailure,
    reload,
    isCurrent,
    queueRef,
  };
};
