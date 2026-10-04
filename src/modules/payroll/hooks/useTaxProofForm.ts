import type { GraphQLClient } from 'graphql-request';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { SubmitTaxProofLineDocument } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { uploadTenantFile, validateTenantUploadFile } from '../../../utils/tenantFileUpload';
import type { TaxSectionCatalogRow } from '../payrollTypes';
import type { TaxSubmissionContext } from '../taxSubmissionContext';

import { proofError, proofInput } from './taxFormValidation';

const emptyForm = {
  section: '',
  declared: '',
  actual: '',
  file: null as File | null,
  busy: false,
  message: null as string | null,
};

export function useTaxProofForm(
  client: GraphQLClient,
  context: TaxSubmissionContext | null,
  key: string,
  canSubmit: boolean,
  catalog: TaxSectionCatalogRow[] | null,
  refresh: () => Promise<void>
) {
  const [state, setState] = useState(emptyForm);
  const operationKey = `${key}:${canSubmit}`;
  const currentKey = useRef(operationKey);
  currentKey.current = operationKey;
  useEffect(() => setState(emptyForm), [key]);
  useEffect(() => {
    if (catalog?.length)
      setState((current) => ({ ...current, section: current.section || catalog[0].sectionCode }));
  }, [catalog]);
  const handleProofSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const sectionCode = state.section.trim().toUpperCase();
      const error = proofError(canSubmit, sectionCode, state.declared, state.actual, state.file);
      if (error || !context || !state.file) {
        setState((current) => ({
          ...current,
          message: error ?? 'No employee tax settings apply to this financial year. Contact HR.',
        }));
        return;
      }
      setState((current) => ({ ...current, busy: true, message: null }));
      try {
        const fileStorageId = await uploadTenantFile(client, state.file);
        if (currentKey.current !== operationKey) return;
        await client.request(SubmitTaxProofLineDocument, {
          input: proofInput(context, sectionCode, state.declared, state.actual, fileStorageId),
        });
        if (currentKey.current !== operationKey) return;
        setState((current) => ({
          ...current,
          declared: '',
          actual: '',
          file: null,
          message: 'Proof line submitted — status PENDING until HR approves.',
        }));
        await refresh();
      } catch (failure) {
        if (currentKey.current === operationKey)
          setState((current) => ({ ...current, message: graphQlUserMessage(failure) }));
      } finally {
        if (currentKey.current === operationKey)
          setState((current) => ({ ...current, busy: false }));
      }
    },
    [canSubmit, client, context, operationKey, refresh, state]
  );
  const setProofFile = (file: File | null) => {
    const error = canSubmit ? null : 'You do not have permission to submit tax proofs.';
    setState((current) => ({
      ...current,
      file: canSubmit ? file : null,
      message: error ?? (file ? validateTenantUploadFile(file, 'Proof file') : null),
    }));
  };
  return {
    proofSectionCode: state.section,
    setProofSectionCode: (section: string) => setState((current) => ({ ...current, section })),
    proofDeclared: state.declared,
    setProofDeclared: (declared: string) => setState((current) => ({ ...current, declared })),
    proofActual: state.actual,
    setProofActual: (actual: string) => setState((current) => ({ ...current, actual })),
    proofFile: state.file,
    setProofFile,
    proofBusy: state.busy,
    proofMsg: state.message,
    handleProofSubmit,
  };
}
