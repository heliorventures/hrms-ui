import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { leaveImportHistoryDocument, type ImportedLeaveHistory } from '../importedLeaveTypes';

// The personal-leave owner subtree remounts on identity, client and year changes.
export const useImportedLeaveHistory = (
  client: GraphQLClient,
  year: number,
  employeeId?: string
) => {
  const [data, setData] = useState<ImportedLeaveHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    client
      .request<{ leaveImportHistory: ImportedLeaveHistory | null }>(leaveImportHistoryDocument, {
        year,
        employeeId,
      })
      .then((result) => {
        if (active) setData(result.leaveImportHistory);
      })
      .catch((reason: unknown) => {
        if (active) setError(graphQlUserMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [client, year, employeeId, attempt]);
  return { data, error, retry: () => setAttempt((value) => value + 1) };
};
