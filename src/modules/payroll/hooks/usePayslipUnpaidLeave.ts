import type { GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { PayslipUnpaidLeaveDocument, type UnpaidLeaveSnapshot } from '../unpaidLeaveDocuments';

export function usePayslipUnpaidLeave(
  client: GraphQLClient,
  ownerKey: string,
  payslipId: string | null
) {
  const owner = useMemo(() => ({ client, ownerKey, payslipId }), [client, ownerKey, payslipId]);
  const [state, setState] = useState<{
    owner: object;
    data: UnpaidLeaveSnapshot | null;
    loading: boolean;
    error: string | null;
  }>({ owner, data: null, loading: !!payslipId, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ owner, data: null, loading: !!payslipId, error: null });
    if (payslipId) {
      client
        .request<{ payslipUnpaidLeave: UnpaidLeaveSnapshot | null }>(PayslipUnpaidLeaveDocument, {
          payslipId,
        })
        .then((result) => {
          if (active)
            setState({ owner, data: result.payslipUnpaidLeave, loading: false, error: null });
        })
        .catch((error: unknown) => {
          if (active)
            setState({ owner, data: null, loading: false, error: graphQlUserMessage(error) });
        });
    }
    return () => {
      active = false;
    };
  }, [client, owner, payslipId, attempt]);
  return {
    ...(state.owner === owner ? state : { data: null, loading: !!payslipId, error: null }),
    retry: () => setAttempt((value) => value + 1),
  };
}
