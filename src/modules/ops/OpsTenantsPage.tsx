import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useGraphClient } from '@/hooks/useGraphClient';
import { useDialogs } from '@/contexts/DialogContext';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  OPS_PROVISION_TENANT,
  OPS_RUN_TENANT_MIGRATIONS,
  OPS_TENANTS,
  OPS_UPDATE_TENANT,
} from './opsGraph';

type TenantRow = {
  id: string;
  name: string;
  status: string;
  plan?: string | null;
  country?: string | null;
  currency?: string | null;
  subdomain?: string | null;
  createdAt: string;
};

const OpsTenantsPage = () => {
  const client = useGraphClient('operator');
  const { confirm } = useDialogs();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [provisionOpen, setProvisionOpen] = useState(false);
  const [pvName, setPvName] = useState('');
  const [pvCode, setPvCode] = useState('');
  const [pvCountry, setPvCountry] = useState('IN');
  const [pvCurrency, setPvCurrency] = useState('INR');
  const [pvSchema, setPvSchema] = useState('');
  const [pvRunMigrations, setPvRunMigrations] = useState(true);
  const [pvSubmitting, setPvSubmitting] = useState(false);

  const [editRow, setEditRow] = useState<TenantRow | null>(null);
  const [edName, setEdName] = useState('');
  const [edStatus, setEdStatus] = useState('');
  const [edPlan, setEdPlan] = useState('');
  const [edSubmitting, setEdSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.request<{ tenants: TenantRow[] }>(OPS_TENANTS, { limit: 200 });
      setRows(data.tenants ?? []);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const onProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pvName.trim() || !pvCode.trim()) return;
    setPvSubmitting(true);
    setToast(null);
    setError(null);
    try {
      const res = await client.request<{
        provisionTenant: {
          schemaName: string;
          migrationsRan: boolean;
          detail?: string | null;
          tenant: { id: string; name: string; status: string };
        };
      }>(OPS_PROVISION_TENANT, {
        input: {
          name: pvName.trim(),
          code: pvCode.trim().toLowerCase(),
          country: pvCountry.trim() || null,
          currency: pvCurrency.trim() || null,
          schemaNameOverride: pvSchema.trim() || null,
          runMigrations: pvRunMigrations,
        },
      });
      const p = res.provisionTenant;
      setToast(
        `Provisioned ${p.tenant.name} (${p.tenant.status}). Schema: ${p.schemaName}. Migrations: ${p.migrationsRan ? 'ok' : 'skipped/failed'}.${p.detail ? ` ${p.detail}` : ''}`
      );
      setProvisionOpen(false);
      setPvName('');
      setPvCode('');
      setPvSchema('');
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setPvSubmitting(false);
    }
  };

  const onRunMigrations = async (t: TenantRow) => {
    const ok = await confirm({
      title: 'Run tenant migrations',
      message: `Run database migrations for ${t.name}? This is an operator task and may take time to finish before the tenant is fully usable.`,
      confirmLabel: 'Run migrations',
      variant: 'danger',
    });
    if (!ok) return;
    setBusyId(t.id);
    setToast(null);
    setError(null);
    try {
      const res = await client.request<{
        runTenantMigrations: { tenant: { status: string }; detail?: string | null };
      }>(OPS_RUN_TENANT_MIGRATIONS, { tenantId: t.id });
      setToast(`Migrations finished. Status: ${res.runTenantMigrations.tenant.status}.${res.runTenantMigrations.detail ? ` ${res.runTenantMigrations.detail}` : ''}`);
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (t: TenantRow) => {
    setEditRow(t);
    setEdName(t.name);
    setEdStatus(t.status);
    setEdPlan(t.plan ?? '');
  };

  const onUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRow) return;
    setEdSubmitting(true);
    setToast(null);
    setError(null);
    try {
      await client.request(OPS_UPDATE_TENANT, {
        input: {
          tenantId: editRow.id,
          name: edName.trim() || null,
          status: edStatus.trim() || null,
          plan: edPlan.trim() || null,
        },
      });
      setToast('Tenant updated.');
      setEditRow(null);
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setEdSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tenants"
        description="Provision organizations, run DB migrations, and manage lifecycle (operator JWT required)."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setProvisionOpen(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Provision tenant
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        }
      />

      {toast && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {toast}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {provisionOpen && (
        <Card title="Provision New Tenant">
          <form onSubmit={onProvision} className="max-w-xl space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uses the same deterministic UUID as <code>provision-tenant.ps1</code>. Set{' '}
              <code>KABIPAY_DATABASE_DIR</code> on the API host for Liquibase when “Run migrations” is on.
            </p>
            <Input label="Display Name" value={pvName} onChange={(e) => setPvName(e.target.value)} required />
            <Input
              label="Code (Subdomain Key, 2–32 Chars)"
              value={pvCode}
              onChange={(e) => setPvCode(e.target.value)}
              placeholder="acme"
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Country" value={pvCountry} onChange={(e) => setPvCountry(e.target.value)} />
              <Input label="Currency" value={pvCurrency} onChange={(e) => setPvCurrency(e.target.value)} />
            </div>
            <Input
              label="Schema Override (Optional)"
              value={pvSchema}
              onChange={(e) => setPvSchema(e.target.value)}
              placeholder="tenant_abc12345"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pvRunMigrations}
                onChange={(e) => setPvRunMigrations(e.target.checked)}
                className="rounded border-slate-300"
              />
              Run Liquibase tenant migrations
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={pvSubmitting}>
                {pvSubmitting ? 'Provisioning…' : 'Provision'}
              </Button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                onClick={() => setProvisionOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {editRow && (
        <Card title={`Edit tenant — ${editRow.name}`}>
          <form onSubmit={onUpdateTenant} className="max-w-xl space-y-3">
            <Input label="Name" value={edName} onChange={(e) => setEdName(e.target.value)} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                value={edStatus}
                onChange={(e) => setEdStatus(e.target.value)}
              >
                {['PROVISIONING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Plan (Optional)" value={edPlan} onChange={(e) => setEdPlan(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" disabled={edSubmitting}>
                {edSubmitting ? 'Saving...' : 'Save'}
              </Button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                onClick={() => setEditRow(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Directory">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && (
          <Table<TenantRow>
            data={rows}
            keyExtractor={(t) => t.id}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'status', label: 'Status' },
              { key: 'plan', label: 'Plan', render: (t) => t.plan ?? '—' },
              { key: 'subdomain', label: 'Subdomain', render: (t) => t.subdomain ?? '—' },
              {
                key: 'id',
                label: 'Tenant ID',
                render: (t) => <span className="font-mono text-xs">{t.id}</span>,
              },
              {
                key: '__actions',
                label: 'Actions',
                render: (t) => (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => void onRunMigrations(t)}
                      className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Run migrations
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="text-xs font-medium text-slate-600 hover:underline dark:text-slate-400"
                    >
                      Edit
                    </button>
                    <Link
                      to={`/ops/feature-flags?tenant=${encodeURIComponent(t.id)}`}
                      className="text-xs font-medium text-slate-600 hover:underline dark:text-slate-400"
                    >
                      Flags
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default OpsTenantsPage;
