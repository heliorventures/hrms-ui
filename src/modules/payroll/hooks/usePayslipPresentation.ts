import type { GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { PayslipPresentationDocument, type PayslipPresentation } from '../payslipPresentation';

export const usePayslipPresentation = (
  client: GraphQLClient,
  ownerKey: string,
  payslipId: string | null
) => {
  const owner = useMemo(() => ({ client, ownerKey, payslipId }), [client, ownerKey, payslipId]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    owner: object;
    data: PayslipPresentation | null;
    loading: boolean;
    error: string | null;
  }>({ owner, data: null, loading: !!payslipId, error: null });
  useEffect(() => {
    let active = true;
    setState({ owner, data: null, loading: !!payslipId, error: null });
    if (payslipId) {
      client
        .request<{ payslipPresentation: PayslipPresentation | null }>(PayslipPresentationDocument, {
          payslipId,
        })
        .then(({ payslipPresentation }) => {
          if (active)
            setState({
              owner,
              data: payslipPresentation,
              loading: false,
              error: payslipPresentation ? null : 'Payslip details are unavailable.',
            });
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
};
