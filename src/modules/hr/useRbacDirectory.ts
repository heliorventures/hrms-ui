import { useCallback, useEffect, useState } from 'react';

import { RbacAccessBoardDocument, type RbacAccessBoardQuery } from '../../api/rbac/graphql';
import type { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

export function useRbacDirectory(
  client: ReturnType<typeof useGraphClient>,
  setError: (message: string | null) => void
) {
  const [board, setBoard] = useState<RbacAccessBoardQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoard(await client.request(RbacAccessBoardDocument));
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [client, setError]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { board, loading, reload };
}
