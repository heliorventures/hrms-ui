import type { RequestDocument } from 'graphql-request';
import { useCallback } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';

import { allLoanPages } from './loanPagination';
import type { LoanConnection } from './loanTypes';

/** Load complete small reference catalogs; never present one page as the entire company policy. */
export function useLoanOptions<T>(document: RequestDocument, field: string) {
  const client = useGraphClient();
  const load = useCallback(async () => {
    const nodes = await allLoanPages<T>(async (after) => {
      const result: Record<string, LoanConnection<T>> = await client.request(document, {
        first: 100,
        after,
      });
      return result[field];
    });
    return { nodes };
  }, [client, document, field]);
  return useRetainedQuery(load);
}
