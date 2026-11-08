import type { RequestDocument } from 'graphql-request';
import { useCallback, useLayoutEffect, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';

import type { LoanConnection } from './loanTypes';

export function useLoanPage<T>(
  document: RequestDocument,
  field: string,
  employeeId?: string,
  loanId?: string,
  search?: string,
  state?: string
) {
  const client = useGraphClient();
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const after = cursors[cursors.length - 1];
  const load = useCallback(async () => {
    const result = await client.request<Record<string, LoanConnection<T>>>(document, {
      first: 25,
      after,
      employeeId: employeeId || null,
      loanId,
      search: search || null,
      state: state || null,
    });
    return result[field];
  }, [after, client, document, employeeId, field, loanId, search, state]);
  useLayoutEffect(() => {
    setCursors([null]);
  }, [client, employeeId, loanId, search, state]);
  const query = useRetainedQuery(load);
  return {
    ...query,
    page: cursors.length,
    next: () => {
      const cursor = query.data?.pageInfo.endCursor;
      if (cursor) setCursors((current) => [...current, cursor]);
    },
    previous: () => setCursors((current) => current.slice(0, -1)),
  };
}
