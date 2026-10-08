import type { GraphQLClient } from 'graphql-request';
import { useCallback, useState } from 'react';

import { PayslipLogoSignedReadUrlDocument } from '../../../api/graphql/graphql';

import { useOwnerQuery } from './useOwnerQuery';

export const usePayslipLogo = (
  client: GraphQLClient,
  ownerKey: string,
  fileStorageId: string | null | undefined,
  enabled: boolean
) => {
  const logoId = fileStorageId?.trim() ?? '';
  const [attempt, setAttempt] = useState(0);
  const load = useCallback(
    () =>
      client.request(PayslipLogoSignedReadUrlDocument, {
        fileStorageId: logoId,
      }),
    [client, logoId]
  );
  const query = useOwnerQuery(`${ownerKey}:${logoId}:${attempt}`, enabled && Boolean(logoId), load);
  return {
    url: query.value?.payslipLogoSignedReadUrl ?? null,
    loading: enabled && Boolean(logoId) && query.loading,
    error: query.error,
    retry: useCallback(() => setAttempt((current) => current + 1), []),
  };
};
