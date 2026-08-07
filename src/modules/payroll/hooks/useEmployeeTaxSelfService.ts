import { type FormEvent, useCallback, useEffect, useState } from 'react';
import type { GraphQLClient } from 'graphql-request';
import {
  SubmitTaxProofLineDocument,
  TaxComputationsListDocument,
  TaxProofLinesDocument,
  TaxSectionDefinitionsDocument,
  UpsertTaxComputationDocument,
  type TaxComputationsListQuery,
  type TaxProofLinesQuery,
  type TaxSectionDefinitionsQuery,
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type { TaxConfigurationRow, TaxSectionCatalogRow } from '../payrollTypes';

const TAX_COMPUTATION_LIMIT = 20;
const TAX_SECTION_LIMIT = 120;

export function useEmployeeTaxSelfService(
  client: GraphQLClient,
  enabled: boolean,
  activeTaxConfig: TaxConfigurationRow | null
) {
  const [taxComputationsSelf, setTaxComputationsSelf] =
    useState<TaxComputationsListQuery['taxComputations'] | null>(null);
  const [taxProofLinesSelf, setTaxProofLinesSelf] =
    useState<TaxProofLinesQuery['taxProofLines'] | null>(null);
  const [loadingEmployeeTax, setLoadingEmployeeTax] = useState(false);
  const [employeeTaxError, setEmployeeTaxError] = useState<string | null>(null);
  const [declFy, setDeclFy] = useState(() => String(new Date().getFullYear()));
  const [declRegime, setDeclRegime] = useState('');
  const [declGross, setDeclGross] = useState('');
  const [declDed, setDeclDed] = useState('');
  const [declSubmitting, setDeclSubmitting] = useState(false);
  const [declMsg, setDeclMsg] = useState<string | null>(null);
  const [taxSectionCatalog, setTaxSectionCatalog] = useState<TaxSectionCatalogRow[] | null>(null);
  const [proofSectionCode, setProofSectionCode] = useState('');
  const [proofDeclared, setProofDeclared] = useState('');
  const [proofActual, setProofActual] = useState('');
  const [proofBusy, setProofBusy] = useState(false);
  const [proofMsg, setProofMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTaxConfig) return;
    setDeclFy(String(activeTaxConfig.fiscalYear));
    setDeclRegime(activeTaxConfig.regime?.trim() ? activeTaxConfig.regime.trim() : '');
  }, [activeTaxConfig]);

  useEffect(() => {
    if ((taxSectionCatalog?.length ?? 0) === 0 || proofSectionCode) return;
    setProofSectionCode(taxSectionCatalog?.[0]?.sectionCode ?? '');
  }, [taxSectionCatalog, proofSectionCode]);

  const loadEmployeeTax = useCallback(async () => {
    const fiscalYear = activeTaxConfig?.fiscalYear ?? null;
    const [computations, proofs, catalog] = await Promise.all([
      client.request<TaxComputationsListQuery>(TaxComputationsListDocument, {
        limit: TAX_COMPUTATION_LIMIT,
      }),
      client.request<TaxProofLinesQuery>(TaxProofLinesDocument, {
        employeeId: null,
        taxConfigVersionId: activeTaxConfig?.id ?? null,
        fiscalYear,
      }),
      client.request<TaxSectionDefinitionsQuery>(TaxSectionDefinitionsDocument, {
        activeOnly: true,
        limit: TAX_SECTION_LIMIT,
      }),
    ]);
    setTaxComputationsSelf(computations.taxComputations);
    setTaxProofLinesSelf(proofs.taxProofLines);
    setTaxSectionCatalog(catalog.taxSectionDefinitions);
  }, [activeTaxConfig?.fiscalYear, activeTaxConfig?.id, client]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      try {
        setLoadingEmployeeTax(true);
        setEmployeeTaxError(null);
        await loadEmployeeTax();
      } catch (err) {
        if (!cancelled) {
          setEmployeeTaxError(graphQlUserMessage(err));
          setTaxComputationsSelf([]);
          setTaxProofLinesSelf([]);
          setTaxSectionCatalog([]);
        }
      } finally {
        if (!cancelled) setLoadingEmployeeTax(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, loadEmployeeTax]);

  const handleDeclUpsert = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setDeclMsg(null);
      const configId = activeTaxConfig?.id;
      if (!configId) {
        setDeclMsg('No active tax configuration. Ask HR to set up tax slabs for your tenant.');
        return;
      }
      const fiscalYear = Number(declFy.trim());
      if (!Number.isFinite(fiscalYear)) {
        setDeclMsg('Enter a valid fiscal year (India FY anchor year, e.g. 2025).');
        return;
      }
      setDeclSubmitting(true);
      try {
        await client.request(UpsertTaxComputationDocument, {
          input: {
            taxConfigVersionId: configId,
            fiscalYear,
            taxRegimeChosen: declRegime.trim() || null,
            grossIncome: declGross.trim() || null,
            totalDeductions: declDed.trim() || null,
            taxableIncome: null,
            finalTax: null,
            tdsPerMonth: null,
          },
        });
        setDeclMsg('Saved your estimated declaration.');
        await loadEmployeeTax();
      } catch (err) {
        setDeclMsg(graphQlUserMessage(err));
      } finally {
        setDeclSubmitting(false);
      }
    },
    [activeTaxConfig?.id, client, declDed, declFy, declGross, declRegime, loadEmployeeTax]
  );

  const handleProofSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setProofMsg(null);
      const configId = activeTaxConfig?.id;
      if (!configId) {
        setProofMsg('No active tax configuration. Ask HR to configure tax slabs.');
        return;
      }
      const fiscalYear = Number(declFy.trim());
      if (!Number.isFinite(fiscalYear)) {
        setProofMsg('Set a valid FY on the Estimated declaration section (above).');
        return;
      }
      const sectionCode = proofSectionCode.trim().toUpperCase();
      if (!sectionCode) {
        setProofMsg('Choose or enter a deduction section.');
        return;
      }
      setProofBusy(true);
      try {
        await client.request(SubmitTaxProofLineDocument, {
          input: {
            taxConfigVersionId: configId,
            fiscalYear,
            sectionCode,
            declaredAmount: proofDeclared.trim() || '0',
            actualAmount: proofActual.trim() || proofDeclared.trim() || '0',
            fileStorageId: null,
          },
        });
        setProofMsg('Proof line submitted — status PENDING until HR approves.');
        setProofDeclared('');
        setProofActual('');
        await loadEmployeeTax();
      } catch (err) {
        setProofMsg(graphQlUserMessage(err));
      } finally {
        setProofBusy(false);
      }
    },
    [
      activeTaxConfig?.id,
      client,
      declFy,
      loadEmployeeTax,
      proofActual,
      proofDeclared,
      proofSectionCode,
    ]
  );

  return {
    taxComputationsSelf,
    taxProofLinesSelf,
    loadingEmployeeTax,
    employeeTaxError,
    declFy,
    setDeclFy,
    declRegime,
    setDeclRegime,
    declGross,
    setDeclGross,
    declDed,
    setDeclDed,
    declSubmitting,
    declMsg,
    taxSectionCatalog,
    proofSectionCode,
    setProofSectionCode,
    proofDeclared,
    setProofDeclared,
    proofActual,
    setProofActual,
    proofBusy,
    proofMsg,
    handleDeclUpsert,
    handleProofSubmit,
  };
}
