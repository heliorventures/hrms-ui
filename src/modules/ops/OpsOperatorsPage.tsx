import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import { useGraphClient } from '@/hooks/useGraphClient';
import { OPS_OPERATOR_ROLES, OPS_OPERATOR_USERS } from './opsGraph';

type OpUserRow = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
};

type OpRoleRow = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

const OpsOperatorsPage = () => {
  const client = useGraphClient('operator');
  const [users, setUsers] = useState<OpUserRow[]>([]);
  const [roles, setRoles] = useState<OpRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([
        client.request<{ operatorUsers: OpUserRow[] }>(OPS_OPERATOR_USERS, { limit: 100 }),
        client.request<{ operatorRoles: OpRoleRow[] }>(OPS_OPERATOR_ROLES, { limit: 50 }),
      ]);
      setUsers(u.operatorUsers ?? []);
      setRoles(r.operatorRoles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load operator data');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operator users"
        description="Platform staff (read-only here). Demo: ops-admin@kabipay.local — add more rows via SQL or a future invite API."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Refresh
          </button>
        }
      />

      <Card title="Note">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Operator accounts are not yet created from this UI. Use{' '}
          <code className="text-xs">seed-demo-data.ps1</code> or insert into{' '}
          <code className="text-xs">kabipay_ops.operator_user</code> with an Argon2id hash.
        </p>
      </Card>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <Card title="Roles">
            <Table<OpRoleRow>
              data={roles}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'code', label: 'Code' },
                { key: 'name', label: 'Name' },
                { key: 'description', label: 'Description', render: (r) => r.description ?? '—' },
              ]}
            />
          </Card>

          <Card title="Users">
            <Table<OpUserRow>
              data={users}
              keyExtractor={(r) => r.id}
              columns={[
                { key: 'email', label: 'Email' },
                { key: 'fullName', label: 'Name' },
                {
                  key: 'isActive',
                  label: 'Active',
                  render: (r) => (r.isActive ? 'Yes' : 'No'),
                },
                { key: 'lastLoginAt', label: 'Last login', render: (r) => r.lastLoginAt ?? '—' },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default OpsOperatorsPage;
