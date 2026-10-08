import type { GraphQLClient } from 'graphql-request';
import { useEffect, useMemo, useState } from 'react';

import { PayslipPresentationDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { decodePayslipPresentation, type PayslipPresentation } from '../payslipPresentation';

import { usePayslipSettingsRevision } from './usePayslipSettingsRevision';

export const usePayslipPresentation = (
  client: GraphQLClient,
  ownerKey: string,
  payslipId: string | null
) => {
  const owner = useMemo(() => ({ client, ownerKey, payslipId }), [client, ownerKey, payslipId]);
  const [attempt, setAttempt] = useState(0);
  const settingsRevision = usePayslipSettingsRevision();
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
        .request(PayslipPresentationDocument, {
          payslipId,
        })
        .then(({ payslipPresentation }) => {
          const data = decodePayslipPresentation(payslipPresentation);
          if (active)
            setState({
              owner,
              data,
              loading: false,
              error: data ? null : 'Payslip details are unavailable.',
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
  }, [client, owner, payslipId, attempt, settingsRevision]);
  return {
    ...(state.owner === owner ? state : { data: null, loading: !!payslipId, error: null }),
    retry: () => setAttempt((value) => value + 1),
  };
};
