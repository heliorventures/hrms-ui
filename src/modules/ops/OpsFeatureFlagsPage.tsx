import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useGraphClient } from '@/hooks/useGraphClient';
import { OPS_FEATURE_FLAGS, OPS_TENANTS, OPS_UPSERT_FEATURE_FLAG } from './opsGraph';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

type TenantOpt = { id: string; name: string };

type FlagRow = {
  id: string;
  tenantId: string;
  featureName: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

const OpsFeatureFlagsPage = () => {
  const client = useGraphClient('operator');
  const [searchParams] = useSearchParams();
  const [tenants, setTenants] = useState<TenantOpt[]>([]);
  const [tenantId, setTenantId] = useState(() => searchParams.get('tenant') ?? '');
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [featureName, setFeatureName] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadTenants = useCallback(async () => {
    try {
      const t = await client.request<{ tenants: TenantOpt[] }>(OPS_TENANTS, { limit: 200 });
      const list = t.tenants ?? [];
      setTenants(list);
      setTenantId((prev) => prev || (list[0]?.id ?? ''));
    } catch (e) {
      setError(graphQlUserMessage(e));
    }
  }, [client]);

  const loadFlags = useCallback(async () => {
    if (!tenantId) {
      setFlags([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const d = await client.request<{ featureFlags: FlagRow[] }>(OPS_FEATURE_FLAGS, {
        tenantId,
        limit: 200,
      });
      setFlags(d.featureFlags ?? []);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client, tenantId]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    const t = searchParams.get('tenant');
    if (t) setTenantId(t);
  }, [searchParams]);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const onUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !featureName.trim()) return;
    setSaving(true);
    setToast(null);
    setError(null);
    try {
      await client.request(OPS_UPSERT_FEATURE_FLAG, {
        tenantId,
        featureName: featureName.trim(),
        isEnabled,
      });
      setFeatureName('');
      setToast('Feature flag saved.');
      await loadFlags();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleRow = async (row: FlagRow) => {
    setSaving(true);
    setToast(null);
    setError(null);
    try {
      await client.request(OPS_UPSERT_FEATURE_FLAG, {
        tenantId: row.tenantId,
        featureName: row.featureName,
        isEnabled: !row.isEnabled,
      });
      setToast(`Updated “${row.featureName}”.`);
      await loadFlags();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Feature Flags"
        description="Per-tenant toggles in kabipay_ops.feature_flag (beyond module subscriptions)."
        actions={
          <button
            type="button"
            onClick={() => void loadFlags()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Refresh
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600 dark:text-slate-400">
          Tenant
          <select
            className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          >
            <option value="">Select…</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {toast && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {toast}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <Card title="Add Or Update Flag">
        <form onSubmit={onUpsert} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Input
            label="Feature Key"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="e.g. payroll_beta"
            className="min-w-[200px]"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="rounded border-slate-300"
            />
            Enabled
          </label>
          <Button type="submit" disabled={saving || !tenantId || !featureName.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Card>

      <Card title="Flags For Tenant">
        {!tenantId && <p className="text-sm text-slate-500">Choose A Tenant.</p>}
        {tenantId && loading && <p className="text-sm text-slate-500">Loading...</p>}
        {tenantId && !loading && (
          <Table<FlagRow>
            data={flags}
            keyExtractor={(r) => r.id}
            columns={[
              { key: 'featureName', label: 'Feature' },
              {
                key: 'isEnabled',
                label: 'Enabled',
                render: (r) => (r.isEnabled ? 'Yes' : 'No'),
              },
              {
                key: 'id',
                label: 'Actions',
                render: (r) => (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void toggleRow(r)}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Toggle
                  </button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default OpsFeatureFlagsPage;
