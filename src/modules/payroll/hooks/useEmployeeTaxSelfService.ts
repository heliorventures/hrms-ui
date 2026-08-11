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
import { uploadTenantFile, validateTenantUploadFile } from '../../../utils/tenantFileUpload';
import type { TaxConfigurationRow, TaxSectionCatalogRow } from '../payrollTypes';

const TAX_COMPUTATION_LIMIT = 20;
const TAX_SECTION_LIMIT = 120;
const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
const SECTION_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

const parseYear = (raw: string) => {
  const year = Number(raw.trim());
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : NaN;
};

const validateOptionalMoney = (raw: string, label: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!MONEY_PATTERN.test(trimmed)) return `${label} must be a non-negative amount with up to 2 decimal places.`;
  return Number(trimmed) >= 0 ? null : `${label} must be non-negative.`;
};

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
  const [proofFile, setProofFile] = useState<File | null>(null);
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
      const fiscalYear = parseYear(declFy);
      if (Number.isNaN(fiscalYear)) {
        setDeclMsg('Enter a valid fiscal year (India FY anchor year, e.g. 2025).');
        return;
      }
      const amountError =
        validateOptionalMoney(declGross, 'Gross income') ??
        validateOptionalMoney(declDed, 'Total deductions');
      if (amountError) {
        setDeclMsg(amountError);
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
      const fiscalYear = parseYear(declFy);
      if (Number.isNaN(fiscalYear)) {
        setProofMsg('Set a valid FY on the Estimated declaration section (above).');
        return;
      }
      const sectionCode = proofSectionCode.trim().toUpperCase();
      if (!SECTION_CODE_PATTERN.test(sectionCode)) {
        setProofMsg('Choose or enter a valid deduction section code.');
        return;
      }
      const declaredError = validateOptionalMoney(proofDeclared, 'Declared amount');
      const actualError = validateOptionalMoney(proofActual, 'Actual amount');
      if (declaredError || actualError) {
        setProofMsg(declaredError ?? actualError);
        return;
      }
      if (!proofFile) {
        setProofMsg('Proof file is required before submitting a tax proof line.');
        return;
      }
      const proofFileError = validateTenantUploadFile(proofFile, 'Proof file');
      if (proofFileError) {
        setProofMsg(proofFileError);
        return;
      }
      setProofBusy(true);
      try {
        const fileStorageId = await uploadTenantFile(client, proofFile);
        await client.request(SubmitTaxProofLineDocument, {
          input: {
            taxConfigVersionId: configId,
            fiscalYear,
            sectionCode,
            declaredAmount: proofDeclared.trim() || '0',
            actualAmount: proofActual.trim() || proofDeclared.trim() || '0',
            fileStorageId,
          },
        });
        setProofMsg('Proof line submitted — status PENDING until HR approves.');
        setProofDeclared('');
        setProofActual('');
        setProofFile(null);
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
      proofFile,
      proofSectionCode,
    ]
  );

  const handleProofFileChange = useCallback((file: File | null) => {
    setProofFile(file);
    if (!file) {
      setProofMsg(null);
      return;
    }
    const proofFileError = validateTenantUploadFile(file, 'Proof file');
    setProofMsg(proofFileError);
  }, []);

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
    proofFile,
    setProofFile: handleProofFileChange,
    proofBusy,
    proofMsg,
    handleDeclUpsert,
    handleProofSubmit,
  };
}
