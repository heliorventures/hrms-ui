import { useCallback, useEffect, useRef } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type { PrejoiningActionContext } from './prejoiningActionContext';
import { PrejoiningCandidatesAdminDocument } from './prejoiningAdminDocuments';
import { PAGE_SIZE, replaceCandidate } from './prejoiningAdminHelpers';
import type { PrejoiningCandidate } from './prejoiningAdminTypes';
import { usePrejoiningConfiguration } from './usePrejoiningConfiguration';

export function usePrejoiningAdminData(
  context: Omit<PrejoiningActionContext, 'runAction' | 'applyCandidate'> & {
    canManage: boolean;
    canReview: boolean;
  }
) {
  const { client, ownerRef, ownerToken, canReview } = context;
  const listRequestRef = useRef(0);
  const { setCandidates, setTotal, setSelected, setLoading, setError } = context.state;
  const applyCandidate = useCallback(
    (next: PrejoiningCandidate) => {
      setSelected(next);
      setCandidates((current) => replaceCandidate(current, next));
    },
    [setCandidates, setSelected]
  );

  const loadCandidates = useCallback(
    async (requestOwner: symbol, nextOffset: number, status: string) => {
      const requestSequence = ++listRequestRef.current;
      const owns = () =>
        ownerRef.current === requestOwner && listRequestRef.current === requestSequence;
      setLoading(true);
      setError(null);
      setCandidates([]);
      try {
        const result = await client.request<{
          prejoiningCandidates: { nodes: PrejoiningCandidate[]; total: number };
        }>(PrejoiningCandidatesAdminDocument, {
          offset: nextOffset,
          limit: PAGE_SIZE,
          status: status || null,
        });
        if (ownerRef.current !== requestOwner || listRequestRef.current !== requestSequence) return;
        setCandidates(result.prejoiningCandidates.nodes);
        setTotal(result.prejoiningCandidates.total);
      } catch (cause) {
        if (owns()) setError(graphQlUserMessage(cause));
      } finally {
        if (owns()) setLoading(false);
      }
    },
    [client, ownerRef, setCandidates, setTotal, setLoading, setError]
  );

  usePrejoiningConfiguration(context);
  useEffect(() => {
    if (canReview) void loadCandidates(ownerToken, 0, '');
  }, [canReview, loadCandidates, ownerToken]);

  return { applyCandidate, loadCandidates };
}
