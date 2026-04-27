import { FormEvent, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ClientOpsPayrollTaxBoardDocument,
  TaxComputationsListDocument,
  UpsertTaxComputationDocument,
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<TaxBoardData>(ClientOpsPayrollTaxBoardDocument, {
          limit: 20,
        });
        if (!cancelled) {
          setData(result);
          const firstActive =
            result.taxConfigurations.find((config) => config.isActive)?.id ??
            result.taxConfigurations[0]?.id ??
            '';
          setSelectedConfigId(firstActive);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load tax data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

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
        Live tax configuration and slab data from the tax subgraph. Declaration and proof-upload
        workflows are still pending.
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
