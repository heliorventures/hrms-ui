import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useGraphClient } from '@/hooks/useGraphClient';
import { graphQlUserMessage } from '@/utils/graphqlUserMessage';
import {
  SUBSCRIPTION_OVERAGE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  type ModuleRow,
  type SubRow,
  type TenantRow,
} from './moduleTypes';
import {
  OPS_MODULES,
  OPS_REMOVE_SUBSCRIPTION,
  OPS_SET_MODULE_ACTIVE,
  OPS_SUBSCRIPTIONS,
  OPS_TENANTS,
  OPS_UPSERT_SUBSCRIPTION,
} from './opsGraph';

const OpsModulesPage = () => {
  const client = useGraphClient('operator');
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [tenantFilter, setTenantFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modBusy, setModBusy] = useState<string | null>(null);

  const [subOpen, setSubOpen] = useState(false);
  const [subId, setSubId] = useState<string | null>(null);
  const [subTenantId, setSubTenantId] = useState('');
  const [subModuleId, setSubModuleId] = useState('');
  const [subSeats, setSubSeats] = useState(10);
  const [subStatus, setSubStatus] = useState('ACTIVE');
  const [subOverage, setSubOverage] = useState('BLOCK');
  const [subSubmitting, setSubSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, t, s] = await Promise.all([
        client.request<{ modules: ModuleRow[] }>(OPS_MODULES, { limit: 200 }),
        client.request<{ tenants: TenantRow[] }>(OPS_TENANTS, { limit: 200 }),
        client.request<{ tenantSubscriptions: SubRow[] }>(OPS_SUBSCRIPTIONS, {
          tenantId: tenantFilter || undefined,
          limit: 500,
        }),
      ]);
      setModules(m.modules ?? []);
      setTenants(t.tenants ?? []);
      setSubs(s.tenantSubscriptions ?? []);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client, tenantFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const moduleNameById = useMemo(() => {
    const m = new Map<string, string>();
    modules.forEach((x) => m.set(x.id, x.name));
    return m;
  }, [modules]);

  const tenantNameById = useMemo(() => {
    const m = new Map<string, string>();
    tenants.forEach((x) => m.set(x.id, x.name));
    return m;
  }, [tenants]);

  const openNewSubscription = () => {
    setSubId(null);
    setSubTenantId(tenantFilter || tenants[0]?.id || '');
    setSubModuleId(modules[0]?.id || '');
    setSubSeats(10);
    setSubStatus('ACTIVE');
    setSubOverage('BLOCK');
    setSubOpen(true);
  };

  const openEditSubscription = (r: SubRow) => {
    setSubId(r.id);
    setSubTenantId(r.tenantId);
    setSubModuleId(r.moduleId);
    setSubSeats(r.contractedSeats);
    setSubStatus(r.status);
    setSubOverage(r.overagePolicy);
    setSubOpen(true);
  };

  const onSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTenantId || !subModuleId) return;
    setSubSubmitting(true);
    setToast(null);
    setError(null);
    try {
      await client.request(OPS_UPSERT_SUBSCRIPTION, {
        input: {
          tenantId: subTenantId,
          moduleId: subModuleId,
          status: subStatus,
          contractedSeats: subSeats,
          overagePolicy: subOverage,
          activatedAt: null,
          expiresAt: null,
        },
      });
      setToast(subId ? 'Subscription updated.' : 'Subscription created.');
      setSubOpen(false);
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSubSubmitting(false);
    }
  };

  const onRemoveSubscription = async (r: SubRow) => {
    if (!window.confirm(`Remove subscription for module ${moduleNameById.get(r.moduleId) ?? r.moduleId}?`)) {
      return;
    }
    setError(null);
    try {
      await client.request(OPS_REMOVE_SUBSCRIPTION, { subscriptionId: r.id });
      setToast('Subscription removed.');
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const toggleModuleActive = async (m: ModuleRow) => {
    setModBusy(m.id);
    setError(null);
    try {
      await client.request(OPS_SET_MODULE_ACTIVE, {
        moduleId: m.id,
        isActive: !m.isActive,
      });
      setToast(`Module ${m.code} is now ${!m.isActive ? 'active' : 'inactive'}.`);
      await load();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setModBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Modules & subscriptions"
        description="Catalog toggles and per-tenant module subscriptions (GraphQL mutations on kabipay-ops)."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openNewSubscription}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add subscription
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

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600 dark:text-slate-400">
          Filter subscriptions by tenant
          <select
            className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
          >
            <option value="">All tenants</option>
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
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {subOpen && (
        <Card title={subId ? 'Edit subscription' : 'New subscription'}>
          <form onSubmit={onSaveSubscription} className="max-w-lg space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Tenant</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                value={subTenantId}
                onChange={(e) => setSubTenantId(e.target.value)}
                required
                disabled={!!subId}
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Module</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                value={subModuleId}
                onChange={(e) => setSubModuleId(e.target.value)}
                required
                disabled={!!subId}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Contracted seats"
              type="number"
              min={0}
              value={String(subSeats)}
              onChange={(e) => setSubSeats(Number(e.target.value) || 0)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                >
                  {SUBSCRIPTION_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Overage</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  value={subOverage}
                  onChange={(e) => setSubOverage(e.target.value)}
                >
                  {SUBSCRIPTION_OVERAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={subSubmitting}>
                {subSubmitting ? 'Saving…' : 'Save'}
              </Button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                onClick={() => setSubOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card title="Module catalog">
            <Table<ModuleRow>
              data={modules}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'code', label: 'Code' },
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category', render: (r) => r.category ?? '—' },
                {
                  key: 'isActive',
                  label: 'Active',
                  render: (r) => (r.isActive ? 'Yes' : 'No'),
                },
                { key: 'isCore', label: 'Core', render: (r) => (r.isCore ? 'Yes' : 'No') },
                {
                  key: '__modact',
                  label: 'Catalog',
                  render: (r) => (
                    <button
                      type="button"
                      disabled={modBusy === r.id}
                      onClick={() => void toggleModuleActive(r)}
                      className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  ),
                },
              ]}
            />
          </Card>

          <Card title="Tenant subscriptions">
            <Table<SubRow>
              data={subs}
              keyExtractor={(r) => r.id}
              columns={[
                {
                  key: 'tenantId',
                  label: 'Tenant',
                  render: (r) => tenantNameById.get(r.tenantId) ?? r.tenantId.slice(0, 8),
                },
                {
                  key: 'moduleId',
                  label: 'Module',
                  render: (r) => moduleNameById.get(r.moduleId) ?? r.moduleId.slice(0, 8),
                },
                { key: 'status', label: 'Status' },
                {
                  key: 'contractedSeats',
                  label: 'Seats',
                  render: (r) => `${r.currentSeatUsage} / ${r.contractedSeats}`,
                },
                {
                  key: 'activatedAt',
                  label: 'Activated',
                  render: (r) => r.activatedAt ?? '—',
                },
                {
                  key: '__subact',
                  label: 'Actions',
                  render: (r) => (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditSubscription(r)}
                        className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onRemoveSubscription(r)}
                        className="text-xs text-rose-600 hover:underline dark:text-rose-400"
                      >
                        Remove
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default OpsModulesPage;
