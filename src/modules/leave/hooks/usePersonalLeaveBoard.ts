import { useCallback, useEffect, useRef, useState } from 'react';

import { LeaveBoardDocument, type LeaveBoardQuery } from '../../../api/graphql/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

export type PersonalLeaveClient = ReturnType<typeof useGraphClient>;
export type PersonalLeaveFailure = { message: string; operation: 'board' | 'mutation' };
export const PERSONAL_LEAVE_LIMIT = 20;

// The parent remounts this owner when identity, client, year or page changes.
export function usePersonalLeaveBoard(client: PersonalLeaveClient, year: number, page: number) {
  const [data, setData] = useState<LeaveBoardQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<PersonalLeaveFailure | null>(null);
  const mounted = useRef(false);
  const sequence = useRef(0);
  const isCurrent = useCallback(() => mounted.current, []);
  const refresh = useCallback(
    async (silent = false) => {
      if (!isCurrent()) return;
      const request = ++sequence.current;
      if (!silent) {
        setLoading(true);
        setFailure(null);
      }
      try {
        const result = await client.request(LeaveBoardDocument, {
          limit: PERSONAL_LEAVE_LIMIT,
          requestOffset: page * PERSONAL_LEAVE_LIMIT,
          balanceYear: year,
          fromDate: `${year}-01-01`,
          toDate: `${year}-12-31`,
        });
        if (isCurrent() && sequence.current === request) setData(result);
      } catch (error) {
        if (isCurrent() && sequence.current === request) {
          setFailure({ message: graphQlUserMessage(error), operation: 'board' });
        }
      } finally {
        if (isCurrent() && sequence.current === request) setLoading(false);
      }
    },
    [client, year, page, isCurrent]
  );
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      sequence.current += 1;
    };
  }, [refresh]);
  return { data, loading, failure, setFailure, refresh, isCurrent };
}
