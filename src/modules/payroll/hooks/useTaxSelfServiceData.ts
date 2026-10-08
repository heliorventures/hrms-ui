import type { GraphQLClient } from 'graphql-request';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  TaxComputationsListDocument,
  TaxProofLinesDocument,
  TaxSectionDefinitionsDocument,
  type TaxComputationsListQuery,
  type TaxProofLinesQuery,
  type TaxSectionDefinitionsQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { taxSubmissionContextQuery, type TaxSubmissionContext } from '../taxSubmissionContext';

interface TaxData {
  context: TaxSubmissionContext | null;
  computations: TaxComputationsListQuery['taxComputations'];
  proofs: TaxProofLinesQuery['taxProofLines'];
  catalog: TaxSectionDefinitionsQuery['taxSectionDefinitions'];
}
export function useTaxSelfServiceData(
  client: GraphQLClient,
  ownerKey: string,
  fiscalYear: number,
  enabled: boolean
) {
  const key = `${ownerKey}:${fiscalYear}`;
  const generation = useRef(0);
  const [state, setState] = useState<{
    key: string;
    value: TaxData | null;
    loading: boolean;
    error: string | null;
  }>({ key: '', value: null, loading: false, error: null });
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    if (!enabled) return;
    setState((current) => ({
      key,
      value: current.key === key ? current.value : null,
      loading: true,
      error: null,
    }));
    try {
      const [computations, proofs, catalog, context] = await Promise.all([
        client.request<TaxComputationsListQuery>(TaxComputationsListDocument, { limit: 20 }),
        client.request<TaxProofLinesQuery>(TaxProofLinesDocument, {
          employeeId: null,
          taxConfigVersionId: null,
          fiscalYear,
        }),
        client.request<TaxSectionDefinitionsQuery>(TaxSectionDefinitionsDocument, {
          activeOnly: true,
          limit: 120,
        }),
        client.request<{ employeeTaxSubmissionContext: TaxSubmissionContext | null }>(
          taxSubmissionContextQuery,
          { fiscalYear }
        ),
      ]);
      if (request !== generation.current) return;
      setState({
        key,
        loading: false,
        error: null,
        value: {
          context: context.employeeTaxSubmissionContext,
          computations: computations.taxComputations.filter((row) => row.fiscalYear === fiscalYear),
          proofs: proofs.taxProofLines,
          catalog: catalog.taxSectionDefinitions,
        },
      });
    } catch (error) {
      if (request === generation.current)
        setState({ key, value: null, loading: false, error: graphQlUserMessage(error) });
    }
  }, [client, enabled, fiscalYear, key]);
  useEffect(() => {
    void refresh();
    return () => {
      generation.current += 1;
    };
  }, [refresh]);
  const visible = enabled && state.key === key ? state : null;
  return {
    key,
    refresh,
    submissionContext: visible?.value?.context ?? null,
    taxComputationsSelf: visible?.value?.computations ?? null,
    taxProofLinesSelf: visible?.value?.proofs ?? null,
    taxSectionCatalog: visible?.value?.catalog ?? null,
    loadingEmployeeTax: enabled && (visible?.loading ?? true),
    employeeTaxError: visible?.error ?? null,
  };
}
