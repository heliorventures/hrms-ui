import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Card from '../../components/common/Card';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  ClientOpsPayrollTaxBoardDocument,
  TaxComputationsListDocument,
  TaxSectionDefinitionsDocument,
  UpsertTaxComputationDocument,
  UpsertTaxConfigurationVersionDocument,
  UpsertTaxSectionDefinitionDocument,
  UpsertTaxSlabDocument,
} from '../../api/graphql/graphql';
import TaxAdminFormsCard from './components/TaxAdminFormsCard';
import TaxComputationsCard from './components/TaxComputationsCard';
import TaxConfigurationSelector from './components/TaxConfigurationSelector';
import TaxConfigurationsCard from './components/TaxConfigurationsCard';
import TaxDeclarationFormCard from './components/TaxDeclarationFormCard';
import TaxSectionsCard from './components/TaxSectionsCard';
import TaxSlabsCard from './components/TaxSlabsCard';
import type {
  TaxBoardData,
  TaxComputationRow,
  TaxSectionDefRow,
} from './payrollTaxTypes';

const TAX_BOARD_LIMIT = 20;
const TAX_SECTIONS_LIMIT = 200;
const TAX_COMPUTATIONS_LIMIT = 10;
const DEFAULT_COUNTRY_CODE = 'IN';
const DEFAULT_DISPLAY_ORDER = 0;

const PayrollTaxPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<TaxBoardData | null>(null);
  const [computations, setComputations] = useState<TaxComputationRow[] | null>(null);
  const [compError, setCompError] = useState<string | null>(null);
  const [compLoading, setCompLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formRegime, setFormRegime] = useState('');
  const [formGross, setFormGross] = useState('');
  const [formDed, setFormDed] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [taxSections, setTaxSections] = useState<TaxSectionDefRow[]>([]);
  const [taxSectionsError, setTaxSectionsError] = useState<string | null>(null);
  const [secCode, setSecCode] = useState('80C');
  const [secLabel, setSecLabel] = useState('Section 80C (ELSS/PPF etc.)');
  const [secRegime, setSecRegime] = useState('ALL');
  const [secMax, setSecMax] = useState('');
  const [secBusy, setSecBusy] = useState(false);
  const [secMsg, setSecMsg] = useState<string | null>(null);
  const [cfgUpsertBusy, setCfgUpsertBusy] = useState(false);
  const [cfgUpsertMsg, setCfgUpsertMsg] = useState<string | null>(null);
  const [cfgFy, setCfgFy] = useState(new Date().getFullYear().toString());
  const [cfgRegime, setCfgRegime] = useState('NEW_REGIME');
  const [cfgCountry, setCfgCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [cfgActive, setCfgActive] = useState(true);
  const [slabBusy, setSlabBusy] = useState(false);
  const [slabMsg, setSlabMsg] = useState<string | null>(null);
  const [slabFrom, setSlabFrom] = useState('0');
  const [slabTo, setSlabTo] = useState('');
  const [slabRate, setSlabRate] = useState('5');
  const [slabSurcharge, setSlabSurcharge] = useState('');
  const [slabCess, setSlabCess] = useState('4');

  const loadTaxBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.request<TaxBoardData>(ClientOpsPayrollTaxBoardDocument, {
        limit: TAX_BOARD_LIMIT,
      });
      setData(result);
      const firstActive =
        result.taxConfigurations.find((config) => config.isActive)?.id ??
        result.taxConfigurations[0]?.id ??
        '';
      setSelectedConfigId((previous) =>
        previous && result.taxConfigurations.some((config) => config.id === previous)
          ? previous
          : firstActive
      );
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [client]);

  const loadTaxSections = useCallback(async () => {
    try {
      setTaxSectionsError(null);
      const response = await client.request<{ taxSectionDefinitions: TaxSectionDefRow[] }>(
        TaxSectionDefinitionsDocument,
        { activeOnly: false, limit: TAX_SECTIONS_LIMIT }
      );
      setTaxSections(response.taxSectionDefinitions);
    } catch (err) {
      setTaxSectionsError(graphQlUserMessage(err));
      setTaxSections([]);
    }
  }, [client]);

  const loadComputations = useCallback(async () => {
    const response = await client.request<{ taxComputations: TaxComputationRow[] }>(
      TaxComputationsListDocument,
      { limit: TAX_COMPUTATIONS_LIMIT }
    );
    setComputations(response.taxComputations);
  }, [client]);

  useEffect(() => {
    void loadTaxBoard();
    void loadTaxSections();
  }, [loadTaxBoard, loadTaxSections]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setCompLoading(true);
        setCompError(null);
        const response = await client.request<{ taxComputations: TaxComputationRow[] }>(
          TaxComputationsListDocument,
          { limit: TAX_COMPUTATIONS_LIMIT }
        );
        if (!cancelled) setComputations(response.taxComputations);
      } catch (err) {
        if (!cancelled) setCompError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setCompLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const selectedConfig = useMemo(
    () => data?.taxConfigurations.find((config) => config.id === selectedConfigId) ?? null,
    [data, selectedConfigId]
  );

  const slabs = useMemo(
    () =>
      (data?.taxSlabs ?? []).filter(
        (slab) => !selectedConfigId || slab.taxConfigVersionId === selectedConfigId
      ),
    [data, selectedConfigId]
  );

  const handleUpsertTaxConfiguration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCfgUpsertBusy(true);
    setCfgUpsertMsg(null);
    try {
      const fiscalYear = Number(cfgFy);
      if (Number.isNaN(fiscalYear)) throw new Error('Invalid fiscal year');
      await client.request(UpsertTaxConfigurationVersionDocument, {
        input: {
          fiscalYear,
          regime: cfgRegime.trim() || null,
          countryCode: cfgCountry.trim() || DEFAULT_COUNTRY_CODE,
          isActive: cfgActive,
        },
      });
      setCfgUpsertMsg('Tax configuration version saved.');
      await loadTaxBoard();
    } catch (err) {
      setCfgUpsertMsg(graphQlUserMessage(err));
    } finally {
      setCfgUpsertBusy(false);
    }
  };

  const handleUpsertSlab = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConfigId) {
      setSlabMsg('Select a tax configuration first.');
      return;
    }
    setSlabBusy(true);
    setSlabMsg(null);
    try {
      await client.request(UpsertTaxSlabDocument, {
        input: {
          taxConfigVersionId: selectedConfigId,
          incomeFrom: slabFrom.trim(),
          incomeTo: slabTo.trim() || null,
          taxRate: slabRate.trim() || null,
          surchargeRate: slabSurcharge.trim() || null,
          cessRate: slabCess.trim() || null,
        },
      });
      setSlabMsg('Slab saved.');
      await loadTaxBoard();
    } catch (err) {
      setSlabMsg(graphQlUserMessage(err));
    } finally {
      setSlabBusy(false);
    }
  };

  const handleUpsertTaxSection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSecBusy(true);
    setSecMsg(null);
    try {
      const regimeScope = secRegime.trim().toUpperCase();
      await client.request(UpsertTaxSectionDefinitionDocument, {
        input: {
          sectionCode: secCode.trim().toUpperCase(),
          sectionLabel: secLabel.trim(),
          regimeScope: regimeScope === 'ALL' ? null : regimeScope || null,
          countryCode: DEFAULT_COUNTRY_CODE,
          displayOrder: DEFAULT_DISPLAY_ORDER,
          isActive: true,
          maxDeductionAmount: secMax.trim() || null,
        },
      });
      setSecMsg('Section saved.');
      await loadTaxSections();
    } catch (err) {
      setSecMsg(graphQlUserMessage(err));
    } finally {
      setSecBusy(false);
    }
  };

  const handleUpsert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedConfigId) {
      setFormMsg('Select a tax configuration first.');
      return;
    }
    setFormMsg(null);
    setFormSubmitting(true);
    try {
      await client.request(UpsertTaxComputationDocument, {
        input: {
          taxConfigVersionId: selectedConfigId,
          fiscalYear: Number(formYear),
          taxRegimeChosen: formRegime.trim() || null,
          grossIncome: formGross.trim() || null,
          totalDeductions: formDed.trim() || null,
          taxableIncome: null,
          finalTax: null,
          tdsPerMonth: null,
        },
      });
      setFormMsg('Saved.');
      await loadComputations();
    } catch (err) {
      setFormMsg(graphQlUserMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tax</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Tax configuration, slab maintenance, employee declarations, and deduction section catalog.
      </p>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <TaxConfigurationSelector
        configs={data?.taxConfigurations ?? []}
        loading={loading}
        selectedConfig={selectedConfig}
        selectedConfigId={selectedConfigId}
        onChange={setSelectedConfigId}
      />
      <TaxConfigurationsCard configs={data?.taxConfigurations ?? []} loading={loading} />
      <TaxSectionsCard
        error={taxSectionsError}
        message={secMsg}
        sectionCode={secCode}
        sectionLabel={secLabel}
        sectionMax={secMax}
        sectionRegime={secRegime}
        sections={taxSections}
        submitting={secBusy}
        onCodeChange={setSecCode}
        onLabelChange={setSecLabel}
        onMaxChange={setSecMax}
        onRegimeChange={setSecRegime}
        onSubmit={handleUpsertTaxSection}
      />
      <TaxSlabsCard loading={loading} slabs={slabs} />
      <TaxAdminFormsCard
        configActive={cfgActive}
        configBusy={cfgUpsertBusy}
        configCountry={cfgCountry}
        configFiscalYear={cfgFy}
        configMessage={cfgUpsertMsg}
        configRegime={cfgRegime}
        slabBusy={slabBusy}
        slabCess={slabCess}
        slabFrom={slabFrom}
        slabMessage={slabMsg}
        slabRate={slabRate}
        slabSurcharge={slabSurcharge}
        slabTo={slabTo}
        onConfigActiveChange={setCfgActive}
        onConfigCountryChange={setCfgCountry}
        onConfigFiscalYearChange={setCfgFy}
        onConfigRegimeChange={setCfgRegime}
        onConfigSubmit={handleUpsertTaxConfiguration}
        onSlabCessChange={setSlabCess}
        onSlabFromChange={setSlabFrom}
        onSlabRateChange={setSlabRate}
        onSlabSubmit={handleUpsertSlab}
        onSlabSurchargeChange={setSlabSurcharge}
        onSlabToChange={setSlabTo}
      />
      <TaxComputationsCard computations={computations} error={compError} loading={compLoading} />
      <TaxDeclarationFormCard
        deductions={formDed}
        fiscalYear={formYear}
        grossIncome={formGross}
        message={formMsg}
        regime={formRegime}
        selectedConfigId={selectedConfigId}
        submitting={formSubmitting}
        onDeductionsChange={setFormDed}
        onFiscalYearChange={setFormYear}
        onGrossIncomeChange={setFormGross}
        onRegimeChange={setFormRegime}
        onSubmit={handleUpsert}
      />
    </div>
  );
};

export default PayrollTaxPage;
