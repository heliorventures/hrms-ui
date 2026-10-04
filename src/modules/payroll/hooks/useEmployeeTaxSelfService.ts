import type { GraphQLClient } from 'graphql-request';

import { useTaxDeclarationForm } from './useTaxDeclarationForm';
import { useTaxProofForm } from './useTaxProofForm';
import { useTaxSelfServiceData } from './useTaxSelfServiceData';

export function useEmployeeTaxSelfService(
  client: GraphQLClient,
  {
    enabled,
    canSubmit,
    ownerKey,
    fiscalYear,
  }: { enabled: boolean; canSubmit: boolean; ownerKey: string; fiscalYear: number }
) {
  const data = useTaxSelfServiceData(client, ownerKey, fiscalYear, enabled);
  const formKey = `${data.key}:${enabled}`;
  const declaration = useTaxDeclarationForm(
    client,
    data.submissionContext,
    formKey,
    enabled && canSubmit,
    data.refresh
  );
  const proof = useTaxProofForm(
    client,
    data.submissionContext,
    formKey,
    enabled && canSubmit,
    data.taxSectionCatalog,
    data.refresh
  );
  return {
    ...data,
    ...declaration,
    ...proof,
    declFy: String(fiscalYear),
    declRegime: data.submissionContext?.settings.regime ?? '',
  };
}
