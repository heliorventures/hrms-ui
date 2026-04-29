import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ClientOpsPayrollTaxBoardDocument,
  TaxComputationsListDocument,
  TaxSectionDefinitionsDocument,
  UpsertTaxComputationDocument,
  UpsertTaxConfigurationVersionDocument,
  UpsertTaxSectionDefinitionDocument,
  UpsertTaxSlabDocument,
} from '../../api/graphql/graphql';

interface TaxConfigurationRow {
  id: string;
  fiscalYear: number;
  regime?: string | null;
  countryCode: string;
  isActive: boolean;
}

interface TaxSlabRow {
  id: string;
  taxConfigVersionId: string;
  incomeFrom: string;
  incomeTo?: string | null;
  taxRate?: string | null;
  surchargeRate?: string | null;
  cessRate?: string | null;
}

interface TaxBoardData {
  taxConfigurations: TaxConfigurationRow[];
  taxSlabs: TaxSlabRow[];
}

interface TaxSectionDefRow {
  id: string;
  sectionCode: string;
  sectionLabel: string;
  regimeScope?: string | null;
  countryCode: string;
  displayOrder: number;
  isActive: boolean;
  maxDeductionAmount?: string | null;
}

interface TaxComputationRow {
  id: string;
  fiscalYear: number;
  taxConfigVersionId: string;
  taxRegimeChosen?: string | null;
  grossIncome?: string | null;
  totalDeductions?: string | null;
  taxableIncome?: string | null;
  finalTax?: string | null;
  tdsPerMonth?: string | null;
  computedAt: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const PayrollTaxPage = () => {
  const client = useGraphClient('client');
  const [data, setData] = useState<TaxBoardData | null>(null);
  const [computations, setComputations] = useState<TaxComputationRow[] | null>(null);
  const [compError, setCompError] = useState<string | null>(null);
  const [compLoading, setCompLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
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
  const [cfgCountry, setCfgCountry] = useState('IN');
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
        limit: 20,
      });
      setData(result);
      const list = result.taxConfigurations;
      const firstActive =
        list.find((config) => config.isActive)?.id ?? list[0]?.id ?? '';
      setSelectedConfigId((prev) =>
        prev && list.some((c) => c.id === prev) ? prev : firstActive
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tax data');
    } finally {
      setLoading(false);
    }
  }, [client]);

  const loadTaxSections = useCallback(async () => {
    try {
      setTaxSectionsError(null);
      const res = await client.request<{ taxSectionDefinitions: TaxSectionDefRow[] }>(
        TaxSectionDefinitionsDocument,
        { activeOnly: false, limit: 200 }
      );
      setTaxSections(res.taxSectionDefinitions);
    } catch (e) {
      setTaxSectionsError(
        e instanceof Error ? e.message : 'Could not load tax sections (needs tax catalog + permission).'
      );
      setTaxSections([]);
    }
  }, [client]);

  useEffect(() => {
    void loadTaxBoard();
  }, [loadTaxBoard]);

  const handleUpsertTaxConfiguration = async (e: FormEvent) => {
    e.preventDefault();
    setCfgUpsertBusy(true);
    setCfgUpsertMsg(null);
    try {
      const fy = Number(cfgFy);
      if (Number.isNaN(fy))
        throw new Error('Invalid fiscal year');
      await client.request(UpsertTaxConfigurationVersionDocument, {
        input: {
          fiscalYear: fy,
          regime: cfgRegime.trim() || null,
          countryCode: cfgCountry.trim() || 'IN',
          isActive: cfgActive,
        },
      });
      setCfgUpsertMsg('Tax configuration version saved.');
      await loadTaxBoard();
    } catch (err) {
      setCfgUpsertMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setCfgUpsertBusy(false);
    }
  };

  const handleUpsertSlab = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedConfigId) {
      setSlabMsg('Select a tax configuration in the dropdown above first.');
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
      setSlabMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSlabBusy(false);
    }
  };

  useEffect(() => {
    void loadTaxSections();
  }, [loadTaxSections]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setCompLoading(true);
        setCompError(null);
        const res = await client.request<{ taxComputations: TaxComputationRow[] }>(
          TaxComputationsListDocument,
          {
            limit: 10,
          }
        );
        if (!c) setComputations(res.taxComputations);
      } catch (e) {
        if (!c) {
          setCompError(
            e instanceof Error ? e.message : 'Tax declarations need an employee-linked session'
          );
        }
      } finally {
        if (!c) setCompLoading(false);
      }
    })();
    return () => {
      c = true;
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

  const formatOptionalAmount = (value?: string | null) =>
    value == null ? 'No upper limit' : formatCurrency(Number(value));

  const loadComputations = async () => {
    const res = await client.request<{ taxComputations: TaxComputationRow[] }>(
      TaxComputationsListDocument,
      { limit: 10 }
    );
    setComputations(res.taxComputations);
  };

  const handleUpsertTaxSection = async (e: FormEvent) => {
    e.preventDefault();
    setSecBusy(true);
    setSecMsg(null);
    try {
      await client.request(UpsertTaxSectionDefinitionDocument, {
        input: {
          sectionCode: secCode.trim().toUpperCase(),
          sectionLabel: secLabel.trim(),
          regimeScope:
            secRegime.trim().toUpperCase() === 'ALL'
              ? null
              : secRegime.trim().toUpperCase() || null,
          countryCode: 'IN',
          displayOrder: 0,
          isActive: true,
          maxDeductionAmount: secMax.trim() || null,
        },
      });
      setSecMsg('Section saved.');
      await loadTaxSections();
    } catch (err) {
      setSecMsg(err instanceof Error ? err.message : 'Save failed (needs tax:approve / HR)');
    } finally {
      setSecBusy(false);
    }
  };

  const handleUpsert = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedConfigId) {
      setFormMsg('Select a tax configuration first.');
      return;
    }
    setFormMsg(null);
    setFormSubmitting(true);
    try {
      const year = Number(formYear);
      await client.request(UpsertTaxComputationDocument, {
        input: {
          taxConfigVersionId: selectedConfigId,
          fiscalYear: year,
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
      setFormMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tax</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Tax configuration and slab maintenance for HR admins. Employees submit declarations and
        deduction proofs from <strong>Workplace → Pay → Income Tax</strong>; proofs are approved here
        or under tax proof tools when wired.
      </p>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax configuration
          </label>
          <select
            value={selectedConfigId}
            onChange={(e) => setSelectedConfigId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={loading || !data?.taxConfigurations?.length}
          >
            {(data?.taxConfigurations ?? []).map((config) => (
              <option key={config.id} value={config.id}>
                FY {config.fiscalYear} · {config.regime ?? 'N/A'} · {config.countryCode}
              </option>
            ))}
          </select>
        </div>
        {selectedConfig && (
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedConfig.isActive ? 'success' : 'neutral'}>
              {selectedConfig.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="info">{selectedConfig.regime ?? 'N/A'}</Badge>
            <Badge variant="neutral">{selectedConfig.countryCode}</Badge>
          </div>
        )}
      </div>

      <Card title="Tax Configurations">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax configurations...</p>
        ) : data?.taxConfigurations?.length ? (
          <Table
            data={data.taxConfigurations}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'fiscalYear',
                label: 'Fiscal year',
                render: (row: TaxConfigurationRow) => `FY ${row.fiscalYear}`,
              },
              {
                key: 'regime',
                label: 'Regime',
                render: (row: TaxConfigurationRow) => row.regime ?? '—',
              },
              {
                key: 'countryCode',
                label: 'Country',
                render: (row: TaxConfigurationRow) => row.countryCode,
              },
              {
                key: 'isActive',
                label: 'Status',
                render: (row: TaxConfigurationRow) => (
                  <Badge variant={row.isActive ? 'success' : 'neutral'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tax configurations found.</p>
        )}
      </Card>

      <Card title="Income tax deduction sections (catalog)">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          Maintain allowed <span className="font-mono">sectionCode</span> labels for proofs (employee
          declarations align with Income Tax slabs by <strong>tax configuration regime</strong> — old
          vs new — see table above). Use regime scope <span className="font-mono">OLD</span>,{' '}
          <span className="font-mono">NEW</span>, or leave empty / <span className="font-mono">ALL</span>{' '}
          for both. Requires <span className="font-mono">tax:approve</span> or HR admin.
        </p>
        {taxSectionsError && (
          <p className="mb-2 text-sm text-amber-800 dark:text-amber-200">{taxSectionsError}</p>
        )}
        {taxSections.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <Table
              data={taxSections}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'sectionCode', label: 'Code', render: (r) => r.sectionCode },
                { key: 'sectionLabel', label: 'Label', render: (r) => r.sectionLabel },
                {
                  key: 'regimeScope',
                  label: 'Regime',
                  render: (r) => r.regimeScope ?? 'ALL',
                },
                {
                  key: 'maxDeductionAmount',
                  label: 'Cap (₹)',
                  render: (r) => r.maxDeductionAmount ?? '—',
                },
                {
                  key: 'isActive',
                  label: 'Active',
                  render: (r) => (r.isActive ? 'Yes' : 'No'),
                },
              ]}
            />
          </div>
        )}
        <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" onSubmit={handleUpsertTaxSection}>
          <Input
            label="Section code"
            value={secCode}
            onChange={(e) => setSecCode(e.target.value)}
            placeholder="80C"
          />
          <div className="min-w-[14rem] flex-1">
            <Input
              label="Label"
              value={secLabel}
              onChange={(e) => setSecLabel(e.target.value)}
              placeholder="Description for employees"
            />
          </div>
          <Input
            label="Regime (OLD / NEW / ALL)"
            value={secRegime}
            onChange={(e) => setSecRegime(e.target.value)}
            placeholder="ALL"
          />
          <Input
            label="Max deduction (₹, optional)"
            value={secMax}
            onChange={(e) => setSecMax(e.target.value)}
            placeholder="150000"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={secBusy}>
            {secBusy ? 'Saving…' : 'Upsert section'}
          </Button>
        </form>
        {secMsg && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{secMsg}</p>}
      </Card>

      <Card title="Tax Slabs">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax slabs...</p>
        ) : slabs.length ? (
          <Table
            data={slabs}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'incomeFrom',
                label: 'Income from',
                render: (row: TaxSlabRow) => formatCurrency(Number(row.incomeFrom)),
              },
              {
                key: 'incomeTo',
                label: 'Income to',
                render: (row: TaxSlabRow) => formatOptionalAmount(row.incomeTo),
              },
              {
                key: 'taxRate',
                label: 'Tax rate',
                render: (row: TaxSlabRow) => (row.taxRate ? `${row.taxRate}%` : '—'),
              },
              {
                key: 'surchargeRate',
                label: 'Surcharge',
                render: (row: TaxSlabRow) => (row.surchargeRate ? `${row.surchargeRate}%` : '—'),
              },
              {
                key: 'cessRate',
                label: 'Cess',
                render: (row: TaxSlabRow) => (row.cessRate ? `${row.cessRate}%` : '—'),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tax slabs found for the selected configuration.
          </p>
        )}
      </Card>

      <Card title="HR admin — tax versions & slabs">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Create a <strong>tax configuration version</strong> per fiscal year and regime (e.g. duplicate
          FY with <span className="font-mono">OLD_REGIME</span> vs{' '}
          <span className="font-mono">NEW_REGIME</span>). Then add <strong>slabs</strong> for the version selected in
          the dropdown at the top of the page. Requires <span className="font-mono">tax:approve</span> or HR
          admin.
        </p>
        <form
          className="mb-6 flex flex-wrap items-end gap-3 border-b border-gray-200 pb-6 dark:border-gray-600"
          onSubmit={handleUpsertTaxConfiguration}
        >
          <Input label="Fiscal year (start)" value={cfgFy} onChange={(e) => setCfgFy(e.target.value)} />
          <Input
            label="Regime label"
            value={cfgRegime}
            onChange={(e) => setCfgRegime(e.target.value)}
            placeholder="NEW_REGIME"
          />
          <Input
            label="Country"
            value={cfgCountry}
            onChange={(e) => setCfgCountry(e.target.value)}
            placeholder="IN"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfgActive}
              onChange={(e) => setCfgActive(e.target.checked)}
            />
            Active
          </label>
          <Button type="submit" variant="secondary" size="sm" disabled={cfgUpsertBusy}>
            {cfgUpsertBusy ? 'Saving…' : 'Save tax version'}
          </Button>
        </form>
        {cfgUpsertMsg && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{cfgUpsertMsg}</p>
        )}

        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Add slab for the <strong>selected</strong> configuration (top of page).
        </p>
        <form className="flex flex-wrap items-end gap-3" onSubmit={handleUpsertSlab}>
          <Input
            label="Income from (₹)"
            value={slabFrom}
            onChange={(e) => setSlabFrom(e.target.value)}
          />
          <Input
            label="Income to (optional)"
            value={slabTo}
            onChange={(e) => setSlabTo(e.target.value)}
            placeholder="empty = no upper limit"
          />
          <Input
            label="Tax rate %"
            value={slabRate}
            onChange={(e) => setSlabRate(e.target.value)}
          />
          <Input
            label="Surcharge %"
            value={slabSurcharge}
            onChange={(e) => setSlabSurcharge(e.target.value)}
          />
          <Input label="Cess %" value={slabCess} onChange={(e) => setSlabCess(e.target.value)} />
          <Button type="submit" variant="primary" size="sm" disabled={slabBusy}>
            {slabBusy ? 'Saving…' : 'Save slab'}
          </Button>
        </form>
        {slabMsg && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{slabMsg}</p>}
      </Card>

      <Card title="Your tax computations (saved)">
        {compLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading declarations…</p>
        )}
        {compError && !compLoading && (
          <p className="text-sm text-amber-800 dark:text-amber-200">{compError}</p>
        )}
        {!compLoading && !compError && computations && computations.length > 0 && (
          <Table
            data={computations}
            keyExtractor={(row) => row.id}
            columns={[
              { key: 'fy', label: 'FY', render: (r: TaxComputationRow) => r.fiscalYear },
              {
                key: 'regime',
                label: 'Regime',
                render: (r: TaxComputationRow) => r.taxRegimeChosen ?? '—',
              },
              {
                key: 'gross',
                label: 'Gross',
                render: (r: TaxComputationRow) =>
                  r.grossIncome ? formatCurrency(Number(r.grossIncome)) : '—',
              },
              {
                key: 'final',
                label: 'Est. tax',
                render: (r: TaxComputationRow) =>
                  r.finalTax ? formatCurrency(Number(r.finalTax)) : '—',
              },
            ]}
          />
        )}
        {!compLoading && !compError && computations && computations.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No saved computations yet.</p>
        )}
      </Card>

      <Card title="Update declaration (totals)">
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Uses the tax configuration selected above. Requires a signed-in employee.
        </p>
        <form onSubmit={handleUpsert} className="max-w-lg space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Fiscal year"
              value={formYear}
              onChange={(e) => setFormYear(e.target.value)}
              inputMode="numeric"
              fullWidth
              required
            />
            <Input
              label="Regime (optional)"
              value={formRegime}
              onChange={(e) => setFormRegime(e.target.value)}
              fullWidth
              placeholder="e.g. NEW_REGIME"
            />
          </div>
          <Input
            label="Gross income (optional)"
            value={formGross}
            onChange={(e) => setFormGross(e.target.value)}
            fullWidth
            inputMode="decimal"
            placeholder="e.g. 1200000"
          />
          <Input
            label="Total deductions (optional)"
            value={formDed}
            onChange={(e) => setFormDed(e.target.value)}
            fullWidth
            inputMode="decimal"
            placeholder="e.g. 150000"
          />
          {formMsg && <p className="text-sm text-gray-600 dark:text-gray-300">{formMsg}</p>}
          <Button type="submit" variant="primary" disabled={formSubmitting || !selectedConfigId}>
            {formSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PayrollTaxPage;
