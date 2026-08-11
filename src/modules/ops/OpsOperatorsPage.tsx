import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import PageHeader from '@/components/common/PageHeader';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useGraphClient } from '@/hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  OPS_CREATE_OPERATOR_USER,
  OPS_OPERATOR_ROLES,
  OPS_OPERATOR_ROLES_FOR_USER,
  OPS_OPERATOR_USERS,
  OPS_SET_OPERATOR_USER_ROLES,
} from './opsGraph';

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
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [rolesSubject, setRolesSubject] = useState<OpUserRow | null>(null);
  const [rolesModalLoading, setRolesModalLoading] = useState(false);
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean>>({});
  const [rolesSaving, setRolesSaving] = useState(false);

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
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setActionError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCreateOpen(true);
  };

  const onCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await client.request(OPS_CREATE_OPERATOR_USER, {
        input: {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
        },
      });
      setToast('Operator user created. Use “Edit roles” on the user row to grant ADMIN / SUPPORT (or other roles).');
      setCreateOpen(false);
      setPassword('');
      await load();
    } catch (err) {
      setActionError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openRolesEditor = async (user: OpUserRow) => {
    setActionError(null);
    setRolesSubject(user);
    setRoleChecks({});
    setRolesModalLoading(true);
    try {
      const data = await client.request<{ operatorRolesForUser: { id: string }[] }>(
        OPS_OPERATOR_ROLES_FOR_USER,
        { operatorUserId: user.id },
      );
      const assigned = new Set((data.operatorRolesForUser ?? []).map((x) => x.id));
      const next: Record<string, boolean> = {};
      for (const role of roles) {
        next[role.id] = assigned.has(role.id);
      }
      setRoleChecks(next);
    } catch (err) {
      setActionError(graphQlUserMessage(err));
      setRolesSubject(null);
    } finally {
      setRolesModalLoading(false);
    }
  };

  const closeRolesEditor = () => {
    setRolesSubject(null);
    setRoleChecks({});
  };

  const onSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolesSubject) return;
    setRolesSaving(true);
    setActionError(null);
    try {
      const roleIds = Object.entries(roleChecks)
        .filter(([, on]) => on)
        .map(([id]) => id);
      await client.request(OPS_SET_OPERATOR_USER_ROLES, {
        operatorUserId: rolesSubject.id,
        roleIds,
      });
      setToast(`Roles updated for ${rolesSubject.email}.`);
      closeRolesEditor();
      await load();
    } catch (err) {
      setActionError(graphQlUserMessage(err));
    } finally {
      setRolesSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Operator Users"
        description="Platform staff: create accounts (Argon2 on server) and assign roles via kabipay_ops.operator_user_role."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" onClick={openCreate}>
              Add Operator User
            </Button>
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
          <button
            type="button"
            className="ml-2 text-emerald-700 underline dark:text-emerald-300"
            onClick={() => setToast(null)}
          >
            Dismiss
          </button>
        </p>
      )}
      {actionError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      )}

      <Card title="Note">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Demo sign-in: <code className="text-xs">ops-admin@kabipay.local</code> from seed data. JWT permissions follow
          roles assigned below (e.g. ADMIN, SUPPORT).
        </p>
      </Card>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Operator User" size="md">
        <form onSubmit={onCreateUser} className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Password must be at least 8 characters.</p>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required fullWidth />
          <Input label="Phone (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!rolesSubject}
        onClose={closeRolesEditor}
        title={rolesSubject ? `Roles — ${rolesSubject.email}` : 'Roles'}
        size="md"
      >
        {rolesModalLoading && <p className="text-sm text-slate-500">Loading Current Roles...</p>}
        {!rolesModalLoading && rolesSubject && (
          <form onSubmit={onSaveRoles} className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Checked roles replace all assignments for this user (you can clear every box to remove all roles).
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-600">
              {roles.length === 0 ? (
                <p className="text-sm text-slate-500">No Roles Defined In Catalog.</p>
              ) : (
                roles.map((role) => (
                  <label key={role.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={roleChecks[role.id] ?? false}
                      onChange={(e) =>
                        setRoleChecks((prev) => ({
                          ...prev,
                          [role.id]: e.target.checked,
                        }))
                      }
                    />
                    <span>
                      <span className="font-mono text-xs">{role.code}</span> — {role.name}
                    </span>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeRolesEditor}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={rolesSaving || roles.length === 0}>
                {rolesSaving ? 'Saving...' : 'Save Roles'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {!loading && !error && (
        <>
          <Card title="Roles (Catalog)">
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
                { key: 'lastLoginAt', label: 'Last Login', render: (r) => r.lastLoginAt ?? '—' },
                {
                  key: 'id',
                  label: '',
                  render: (r) => (
                    <Button type="button" variant="outline" size="sm" onClick={() => void openRolesEditor(r)}>
                      Edit roles
                    </Button>
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

export default OpsOperatorsPage;
