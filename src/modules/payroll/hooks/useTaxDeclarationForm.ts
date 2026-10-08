import type { GraphQLClient } from 'graphql-request';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { UpsertTaxComputationDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

import { declarationError, declarationInput, hasTaxSubmissionSettings } from './taxFormValidation';

export function useTaxDeclarationForm(
  client: GraphQLClient,
  context: TaxSubmissionContext | null,
  key: string,
  canSubmit: boolean,
  refresh: () => Promise<void>
) {
  const [state, setState] = useState({
    gross: '',
    deductions: '',
    busy: false,
    message: null as string | null,
  });
  const operationKey = `${key}:${canSubmit}:${context?.settings?.regime}:${context?.settings?.effective_from}`;
  const currentKey = useRef(operationKey);
  currentKey.current = operationKey;
  const saved = context?.declaration;
  useEffect(() => {
    setState({
      gross: saved?.input.gross_income ?? '',
      deductions: saved?.input.declared_deductions ?? '',
      busy: false,
      message: null,
    });
  }, [operationKey, saved]);
  const handleDeclUpsert = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const error = declarationError(canSubmit, state.gross, state.deductions);
      if (error || !context || !hasTaxSubmissionSettings(context)) {
        setState((current) => ({
          ...current,
          message: error ?? 'No employee tax settings apply to this financial year. Contact HR.',
        }));
        return;
      }
      setState((current) => ({ ...current, busy: true, message: null }));
      try {
        await client.request(UpsertTaxComputationDocument, {
          input: declarationInput(context, state.gross, state.deductions),
        });
        if (currentKey.current !== operationKey) return;
        await refresh();
        if (currentKey.current === operationKey)
          setState((current) => ({ ...current, message: 'Saved your estimated declaration.' }));
      } catch (failure) {
        if (currentKey.current === operationKey)
          setState((current) => ({ ...current, message: graphQlUserMessage(failure) }));
      } finally {
        if (currentKey.current === operationKey)
          setState((current) => ({ ...current, busy: false }));
      }
    },
    [canSubmit, client, context, operationKey, refresh, state.deductions, state.gross]
  );
  return {
    declGross: state.gross,
    setDeclGross: (gross: string) => setState((current) => ({ ...current, gross })),
    declDed: state.deductions,
    setDeclDed: (deductions: string) => setState((current) => ({ ...current, deductions })),
    declSubmitting: state.busy,
    declMsg: state.message,
    handleDeclUpsert,
  };
}
