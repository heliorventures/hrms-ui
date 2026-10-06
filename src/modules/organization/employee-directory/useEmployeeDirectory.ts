import type { GraphQLClient } from 'graphql-request';
import { useCallback, useLayoutEffect, useRef } from 'react';

import {
  ClientOpsEmployeesDirectoryDocument,
  type ClientOpsEmployeesDirectoryQuery,
} from '../../../api/graphql/graphql';
import { useRetainedQuery } from '../../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import type { DirectoryEmployee } from './employeeDirectoryModel';

interface DirectoryData {
  rows: DirectoryEmployee[];
  warning: string | null;
}

function partialDirectory(
  cause: unknown,
  signal: AbortSignal,
  rows: Map<string, DirectoryEmployee>
): DirectoryData {
  if (signal.aborted || !rows.size) throw cause;
  return {
    rows: [...rows.values()],
    warning: `Loaded ${rows.size} employees, but a later directory page failed: ${graphQlUserMessage(cause)}`,
  };
}

async function loadDirectory(client: GraphQLClient, signal: AbortSignal): Promise<DirectoryData> {
  const rows = new Map<string, DirectoryEmployee>();
  const cursors = new Set<string>();
  let after: string | undefined;
  do {
    let result: ClientOpsEmployeesDirectoryQuery;
    try {
      if (signal.aborted) throw new Error('Directory request superseded');
      result = await client.request({
        document: ClientOpsEmployeesDirectoryDocument,
        variables: { limit: 100, after },
        signal,
      });
    } catch (cause) {
      return partialDirectory(cause, signal, rows);
    }
    const page = result.employeeDirectoryPage;
    for (const employee of page.rows) rows.set(employee.employeeId, employee);
    if (!page.hasMore) break;
    const cursor = page.nextCursor;
    if (!cursor || cursors.has(cursor)) {
      return {
        rows: [...rows.values()],
        warning: 'The directory could not load its next page. Refresh to try again.',
      };
    }
    cursors.add(cursor);
    after = cursor;
  } while (after);
  return { rows: [...rows.values()], warning: null };
}

export const useEmployeeDirectory = (client: GraphQLClient, ownerKey: string) => {
  const activeRequest = useRef<AbortController | null>(null);
  const retained = useRef<DirectoryData | null>(null);
  useLayoutEffect(() => {
    retained.current = null;
    return () => activeRequest.current?.abort();
  }, [client, ownerKey]);
  const load = useCallback(async () => {
    void ownerKey;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const result = await loadDirectory(client, controller.signal);
    if (controller.signal.aborted) throw new Error('Directory request superseded');
    if (result.warning && retained.current) throw new Error(result.warning);
    retained.current = result;
    return result;
  }, [client, ownerKey]);
  return useRetainedQuery(load);
};
