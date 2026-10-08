import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { projectionQuery, type TaxProjection } from '../projectionViewTypes';

export const useTaxProjection = (
  client: GraphQLClient,
  ownerKey: string,
  employeeId: string | null,
  fiscalYear: number,
  month: number
) => {
  const key = `${ownerKey}:${employeeId ?? 'self'}:${fiscalYear}:${month}`;
  const [state, setState] = useState<{
    key: string;
    data: TaxProjection | null;
    error: string;
    loading: boolean;
  }>({ key: '', data: null, error: '', loading: true });
  useEffect(() => {
    let active = true;
    setState({ key, data: null, error: '', loading: true });
    void client
      .request<{ employeeTaxProjection: TaxProjection }>(projectionQuery, {
        employeeId,
        fiscalYear,
        month,
      })
      .then((value) => {
        if (active) setState({ key, data: value.employeeTaxProjection, error: '', loading: false });
      })
      .catch((cause: unknown) => {
        if (active) setState({ key, data: null, error: graphQlUserMessage(cause), loading: false });
      });
    return () => {
      active = false;
    };
  }, [client, key, employeeId, fiscalYear, month]);
  return state.key === key ? state : { key, data: null, error: '', loading: true };
};
