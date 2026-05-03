import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import UuidEntitySearchSelect, {
  type UuidEntityOption,
} from '../../components/common/UuidEntitySearchSelect';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useDialogs } from '../../contexts/DialogContext';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  AdminExpenseCategoriesDocument,
  DeleteExpenseCategoryAdminDocument,
  DeleteExpensePolicyAdminDocument,
  ExpensePoliciesForAdminDocument,
  ExpensePolicyDirectoryDocument,
  UpsertExpenseCategoryAdminDocument,
  UpsertExpensePolicyAdminDocument,
  type AdminExpenseCategoriesQuery,
  type ExpensePoliciesForAdminQuery,
  type ExpensePolicyDirectoryQuery,
} from '../../api/graphql/graphql';

type CategoryRow = AdminExpenseCategoriesQuery['expenseCategories'][number];
type PolicyRow = ExpensePoliciesForAdminQuery['expensePoliciesForAdmin'][number];

function shortEntityId(u: string): string {
  return `${u.slice(0, 8)}…`;
}

function formatMaybeAmount(s?: string | null): string {
  if (s === null || s === undefined || s === '') return '—';
  const n = Number(s);
  if (Number.isNaN(n)) return s;
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const AdminExpenseCategoriesPage = () => {
  const client = useGraphClient('client');
  const { confirm } = useDialogs();
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const initialForm = useMemo(() => ({ name: '', code: '', maxAmountPerClaim: '' }), []);
  const [form, setForm] = useState(initialForm);

  const initialPolicyForm = useMemo(
    () => ({
      editPolicyId: null as string | null,
      applicableTo: 'ALL',
      departmentId: '',
      designationId: '',
      roleId: '',
      limitPerDay: '',
      limitPerMonth: '',
      maxAmountPerClaim: '',
      receiptRequired: false,
      approvalRequired: true,
    }),
    []
  );
  const [policyCategoryId, setPolicyCategoryId] = useState('');
  const [policyRows, setPolicyRows] = useState<PolicyRow[]>([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState(initialPolicyForm);
  const [policySaving, setPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  type PolicyDeptRow = ExpensePolicyDirectoryQuery['departments'][number];
  type PolicyDesRow = ExpensePolicyDirectoryQuery['designations'][number];
  type PolicyRoleRow = ExpensePolicyDirectoryQuery['expenseAssignableRoles'][number];

  const [policyPickerBusy, setPolicyPickerBusy] = useState(false);
  const [policyPickerDepartments, setPolicyPickerDepartments] = useState<PolicyDeptRow[]>([]);
  const [policyPickerDesignations, setPolicyPickerDesignations] = useState<PolicyDesRow[]>([]);
  const [policyPickerRoles, setPolicyPickerRoles] = useState<PolicyRoleRow[]>([]);
  const [policyPickerOrgError, setPolicyPickerOrgError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await client.request<AdminExpenseCategoriesQuery>(AdminExpenseCategoriesDocument, {
      limit: 150,
    });
    return r.expenseCategories;
  }, [client]);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await load();
        if (!c) setRows(data);
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const loadPolicies = useCallback(
    async (categoryId: string) => {
      const r = await client.request<ExpensePoliciesForAdminQuery>(ExpensePoliciesForAdminDocument, {
        expenseCategoryId: categoryId,
      });
      return r.expensePoliciesForAdmin;
    },
    [client]
  );

  useEffect(() => {
    if (!rows.length) {
      setPolicyCategoryId('');
      setPolicyRows([]);
      return;
    }
    setPolicyCategoryId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : rows[0].id));
  }, [rows]);

  useEffect(() => {
    if (!policyCategoryId) {
      setPolicyRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setPolicyLoading(true);
        setPolicyError(null);
        const data = await loadPolicies(policyCategoryId);
        if (!cancelled) setPolicyRows(data);
      } catch (err) {
        if (!cancelled) {
          setPolicyRows([]);
          setPolicyError(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setPolicyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [policyCategoryId, loadPolicies]);

  /** Load once categories exist — shared by the policies table labels and policy modal pickers. */
  useEffect(() => {
    if (!rows.length) {
      setPolicyPickerDepartments([]);
      setPolicyPickerDesignations([]);
      setPolicyPickerRoles([]);
      setPolicyPickerOrgError(null);
      setPolicyPickerBusy(false);
      return;
    }

    let cancelled = false;
    setPolicyPickerOrgError(null);
    setPolicyPickerBusy(true);
    void (async () => {
      try {
        const r = await client.request<ExpensePolicyDirectoryQuery>(ExpensePolicyDirectoryDocument, {
          lim: 320,
        });
        if (cancelled) return;
        setPolicyPickerDepartments(r.departments ?? []);
        setPolicyPickerDesignations(r.designations ?? []);
        setPolicyPickerRoles(r.expenseAssignableRoles ?? []);
      } catch (e) {
        if (!cancelled) {
          setPolicyPickerDepartments([]);
          setPolicyPickerDesignations([]);
          setPolicyPickerRoles([]);
          setPolicyPickerOrgError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setPolicyPickerBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rows, client]);

  const deptNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of policyPickerDepartments) m.set(d.id, d.name);
    return m;
  }, [policyPickerDepartments]);

  const policyDeptLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of policyPickerDepartments) {
      m.set(d.id, d.code?.trim() ? `${d.name} (${d.code})` : d.name);
    }
    return m;
  }, [policyPickerDepartments]);

  const policyDesLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of policyPickerDesignations) {
      const levelSuffix =
        typeof d.level === 'number' && Number.isFinite(d.level) ? ` · L${d.level}` : '';
      const deptNm = d.departmentId ? deptNameById.get(d.departmentId) : undefined;
      const deptSuffix = deptNm ? ` · ${deptNm}` : '';
      m.set(d.id, `${d.title}${levelSuffix}${deptSuffix}`);
    }
    return m;
  }, [policyPickerDesignations, deptNameById]);

  const policyRoleLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of policyPickerRoles) {
      m.set(r.id, r.isSystemRole ? `${r.name} (system)` : r.name);
    }
    return m;
  }, [policyPickerRoles]);

  const summarizePolicyScope = useCallback(
    (p: PolicyRow): string => {
      const at = (p.applicableTo || '').toUpperCase();
      if (at === 'ALL') return 'All employees';
      if (at === 'DEPARTMENT') {
        const id = p.departmentId;
        if (!id) return '—';
        return policyDeptLabelById.get(id) ?? `Unknown department (${shortEntityId(id)})`;
      }
      if (at === 'DESIGNATION') {
        const id = p.designationId;
        if (!id) return '—';
        return policyDesLabelById.get(id) ?? `Unknown designation (${shortEntityId(id)})`;
      }
      if (at === 'ROLE') {
        const id = p.roleId;
        if (!id) return '—';
        return policyRoleLabelById.get(id) ?? `Unknown role (${shortEntityId(id)})`;
      }
      return at || '—';
    },
    [policyDeptLabelById, policyDesLabelById, policyRoleLabelById]
  );

  const departmentOptions = useMemo((): UuidEntityOption[] => {
    const base: UuidEntityOption[] = policyPickerDepartments.map((d) => ({
      id: d.id,
      title: d.name,
      subtitle: d.code ?? undefined,
    }));
    const id = policyForm.departmentId.trim();
    if (id && !base.some((b) => b.id === id)) {
      base.push({
        id,
        title: 'Unknown department (from policy)',
        subtitle: `${id.slice(0, 8)}…`,
      });
    }
    return base;
  }, [policyPickerDepartments, policyForm.departmentId]);

  const designationOptions = useMemo((): UuidEntityOption[] => {
    const base: UuidEntityOption[] = policyPickerDesignations.map((d) => {
      let subtitle: string | undefined;
      if (d.departmentId) subtitle = deptNameById.get(d.departmentId) ?? `Dept ${d.departmentId.slice(0, 8)}…`;
      const level = typeof d.level === 'number' && Number.isFinite(d.level) ? d.level : null;
      return {
        id: d.id,
        title: level !== null ? `${d.title} · L${level}` : d.title,
        subtitle,
      };
    });
    const id = policyForm.designationId.trim();
    if (id && !base.some((b) => b.id === id)) {
      base.push({
        id,
        title: 'Unknown designation (from policy)',
        subtitle: `${id.slice(0, 8)}…`,
      });
    }
    return base;
  }, [policyPickerDesignations, policyForm.designationId, deptNameById]);

  const roleOptions = useMemo((): UuidEntityOption[] => {
    const base: UuidEntityOption[] = policyPickerRoles.map((r) => {
      const raw = r.description?.trim();
      let subtitle: string | undefined;
      if (raw) subtitle = raw.length > 96 ? `${raw.slice(0, 96)}…` : raw;
      return {
        id: r.id,
        title: r.name + (r.isSystemRole ? ' (system)' : ''),
        subtitle,
      };
    });
    const id = policyForm.roleId.trim();
    if (id && !base.some((b) => b.id === id)) {
      base.push({
        id,
        title: 'Unknown role (from policy)',
        subtitle: `${id.slice(0, 8)}…`,
      });
    }
    return base;
  }, [policyPickerRoles, policyForm.roleId]);

  const openNew = () => {
    setEditId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (row: CategoryRow) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      code: row.code,
      maxAmountPerClaim: row.maxAmountPerClaim ?? '',
    });
    setModalOpen(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError('Name and code are required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await client.request(UpsertExpenseCategoryAdminDocument, {
        input: {
          id: editId ?? undefined,
          name: form.name.trim(),
          code: form.code.trim(),
          maxAmountPerClaim:
            form.maxAmountPerClaim.trim() === '' ? null : form.maxAmountPerClaim.trim(),
        },
      });
      setRows(await load());
      setModalOpen(false);
      setEditId(null);
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const runDelete = async (row: CategoryRow) => {
    const ok = await confirm({
      title: `Delete category “${row.name}”?`,
      message:
        'The category will be archived (employees can no longer select it when filing new claims).',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteExpenseCategoryAdminDocument, { expenseCategoryId: row.id });
      setRows(await load());
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const openNewPolicy = () => {
    if (!policyCategoryId) return;
    setPolicyForm({ ...initialPolicyForm, editPolicyId: null });
    setPolicyError(null);
    setPolicyModalOpen(true);
  };

  const openEditPolicy = (p: PolicyRow) => {
    setPolicyForm({
      editPolicyId: p.id,
      applicableTo: p.applicableTo,
      departmentId: p.departmentId ?? '',
      designationId: p.designationId ?? '',
      roleId: p.roleId ?? '',
      limitPerDay: p.limitPerDay ?? '',
      limitPerMonth: p.limitPerMonth ?? '',
      maxAmountPerClaim: p.maxAmountPerClaim ?? '',
      receiptRequired: p.receiptRequired,
      approvalRequired: p.approvalRequired,
    });
    setPolicyError(null);
    setPolicyModalOpen(true);
  };

  const savePolicy = async (e: FormEvent) => {
    e.preventDefault();
    if (!policyCategoryId) return;
    const toOptStr = (s: string) => (s.trim() ? s.trim() : undefined);
    const toOptId = (s: string) => (s.trim() ? s.trim() : undefined);
    const at = policyForm.applicableTo.trim().toUpperCase();
    try {
      setPolicySaving(true);
      setPolicyError(null);
      await client.request(UpsertExpensePolicyAdminDocument, {
        input: {
          id: policyForm.editPolicyId ?? undefined,
          expenseCategoryId: policyCategoryId,
          applicableTo: at,
          departmentId: at === 'DEPARTMENT' ? toOptId(policyForm.departmentId) : undefined,
          designationId: at === 'DESIGNATION' ? toOptId(policyForm.designationId) : undefined,
          roleId: at === 'ROLE' ? toOptId(policyForm.roleId) : undefined,
          limitPerDay: toOptStr(policyForm.limitPerDay),
          limitPerMonth: toOptStr(policyForm.limitPerMonth),
          maxAmountPerClaim: toOptStr(policyForm.maxAmountPerClaim),
          receiptRequired: policyForm.receiptRequired,
          approvalRequired: policyForm.approvalRequired,
        },
      });
      setPolicyRows(await loadPolicies(policyCategoryId));
      setPolicyModalOpen(false);
    } catch (err) {
      setPolicyError(graphQlUserMessage(err));
    } finally {
      setPolicySaving(false);
    }
  };

  const runDeletePolicy = async (p: PolicyRow) => {
    const ok = await confirm({
      title: 'Delete expense policy?',
      message:
        'Submit-time caps and receipt rules are resolved from policies for each employee. Removing a row changes enforcement immediately.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setPolicyError(null);
      await client.request(DeleteExpensePolicyAdminDocument, { expensePolicyId: p.id });
      if (policyCategoryId) setPolicyRows(await loadPolicies(policyCategoryId));
    } catch (err) {
      setPolicyError(graphQlUserMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense categories</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Types of claims employees choose when submitting expenses. Requires{' '}
            <span className="font-mono text-xs">expense:manage</span> (HR / admin).
          </p>
        </div>
        <Button onClick={() => openNew()}>Add category</Button>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      ) : null}

      <Card title="Configured categories">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        ) : rows.length ? (
          <Table
            data={rows}
            keyExtractor={(r) => r.id}
            columns={[
              {
                key: 'name',
                label: 'Name',
                render: (r) => (
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">{r.code}</div>
                  </div>
                ),
              },
              {
                key: 'cap',
                label: 'Max / claim',
                render: (r) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatMaybeAmount(r.maxAmountPerClaim)}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="!py-1 !px-2 !text-xs"
                      onClick={() => openEdit(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="!py-1 !px-2 !text-xs"
                      onClick={() => void runDelete(r)}
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expense categories yet.</p>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Expense policies by category
          </h3>
          {rows.length ? (
            <Button type="button" variant="secondary" className="!py-1 !px-3 !text-xs" onClick={openNewPolicy}>
              Add policy
            </Button>
          ) : null}
        </div>
        {!rows.length ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a category first.</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={policyCategoryId}
                onChange={(e) => setPolicyCategoryId(e.target.value)}
                className="max-w-md w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Policies apply the most specific match (department → designation → role → ALL). Caps and receipt
                rules are merged for the winning tier.
              </p>
            </div>
            {policyPickerBusy ? (
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Loading org directory (names in the grid update when ready).
              </p>
            ) : null}
            {policyError ? (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">{policyError}</p>
            ) : null}
            {policyLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading policies…</p>
            ) : policyRows.length ? (
              <Table
                data={policyRows}
                keyExtractor={(p) => p.id}
                columns={[
                  {
                    key: 'applicable',
                    label: 'Applicable',
                    render: (p) => (
                      <div>
                        <div className="font-mono text-xs font-medium">{p.applicableTo}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{summarizePolicyScope(p)}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'caps',
                    label: 'Limits',
                    render: (p) => (
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        <div>Day: {formatMaybeAmount(p.limitPerDay)}</div>
                        <div>Month: {formatMaybeAmount(p.limitPerMonth)}</div>
                        <div>Policy max / claim: {formatMaybeAmount(p.maxAmountPerClaim)}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'flags',
                    label: 'Rules',
                    render: (p) => (
                      <div className="text-xs">
                        Receipt: {p.receiptRequired ? 'yes' : 'no'} · Approval:{' '}
                        {p.approvalRequired ? 'yes' : 'no'}
                      </div>
                    ),
                  },
                  {
                    key: 'policyActions',
                    label: '',
                    render: (p) => (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="!py-1 !px-2 !text-xs"
                          onClick={() => openEditPolicy(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="!py-1 !px-2 !text-xs"
                          onClick={() => void runDeletePolicy(p)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No policies for this category — category-level max only applies.
              </p>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        title={editId ? 'Edit category' : 'New category'}
      >
        <form onSubmit={(e) => void save(e)} className="space-y-4">
          <Input
            label="Display name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            required
          />
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            fullWidth
            required
            disabled={!!editId}
          />
          {editId ? (
            <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
              Codes are fixed once created — create a new row if you need a different code.
            </p>
          ) : null}
          <Input
            label="Max amount per claim (optional)"
            value={form.maxAmountPerClaim}
            onChange={(e) => setForm((f) => ({ ...f, maxAmountPerClaim: e.target.value }))}
            fullWidth
            inputMode="decimal"
          />
          <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
            Leave blank for no ceiling. Amounts match your tenant currency (for example INR).
          </p>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={policyModalOpen}
        onClose={() => {
          setPolicyModalOpen(false);
          setPolicyError(null);
        }}
        title={policyForm.editPolicyId ? 'Edit expense policy' : 'New expense policy'}
      >
        <form onSubmit={(e) => void savePolicy(e)} className="space-y-4">
          {policyError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{policyError}</p>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Applicable to
            </label>
            <select
              value={policyForm.applicableTo}
              onChange={(e) => setPolicyForm((pf) => ({ ...pf, applicableTo: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">ALL — entire tenant</option>
              <option value="DEPARTMENT">DEPARTMENT</option>
              <option value="DESIGNATION">DESIGNATION</option>
              <option value="ROLE">ROLE</option>
            </select>
          </div>
          {policyPickerBusy ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Loading org directory for pickers…
            </p>
          ) : null}
          {policyPickerOrgError ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{policyPickerOrgError}</p>
          ) : null}
          {policyForm.applicableTo === 'DEPARTMENT' ? (
            <>
              {policyPickerOrgError && policyPickerDepartments.length === 0 ? (
                <Input
                  label="Department ID (paste UUID)"
                  value={policyForm.departmentId}
                  onChange={(e) =>
                    setPolicyForm((pf) => ({ ...pf, departmentId: e.target.value }))
                  }
                  fullWidth
                  required
                />
              ) : (
                <UuidEntitySearchSelect
                  label="Department"
                  placeholder="Search by name or code…"
                  emptyLabel="Choose a department…"
                  options={departmentOptions}
                  valueId={policyForm.departmentId}
                  disabled={policyPickerBusy}
                  required
                  onChangeId={(departmentId) => setPolicyForm((pf) => ({ ...pf, departmentId }))}
                />
              )}
            </>
          ) : null}
          {policyForm.applicableTo === 'DESIGNATION' ? (
            <>
              {policyPickerOrgError && policyPickerDesignations.length === 0 ? (
                <Input
                  label="Designation ID (paste UUID)"
                  value={policyForm.designationId}
                  onChange={(e) =>
                    setPolicyForm((pf) => ({ ...pf, designationId: e.target.value }))
                  }
                  fullWidth
                  required
                />
              ) : (
                <UuidEntitySearchSelect
                  label="Designation"
                  placeholder="Search by title…"
                  emptyLabel="Choose a designation…"
                  options={designationOptions}
                  valueId={policyForm.designationId}
                  disabled={policyPickerBusy}
                  required
                  onChangeId={(designationId) => setPolicyForm((pf) => ({ ...pf, designationId }))}
                />
              )}
            </>
          ) : null}
          {policyForm.applicableTo === 'ROLE' ? (
            <>
              {policyPickerOrgError && policyPickerRoles.length === 0 ? (
                <Input
                  label="Role ID (paste UUID)"
                  value={policyForm.roleId}
                  onChange={(e) => setPolicyForm((pf) => ({ ...pf, roleId: e.target.value }))}
                  fullWidth
                  required
                />
              ) : (
                <UuidEntitySearchSelect
                  label="Tenant role"
                  placeholder="Search by role name…"
                  emptyLabel="Choose a role…"
                  options={roleOptions}
                  valueId={policyForm.roleId}
                  disabled={policyPickerBusy}
                  required
                  onChangeId={(roleId) => setPolicyForm((pf) => ({ ...pf, roleId }))}
                />
              )}
            </>
          ) : null}
          <Input
            label="Limit per day (optional decimal)"
            value={policyForm.limitPerDay}
            onChange={(e) => setPolicyForm((pf) => ({ ...pf, limitPerDay: e.target.value }))}
            fullWidth
            inputMode="decimal"
          />
          <Input
            label="Limit per month (optional decimal)"
            value={policyForm.limitPerMonth}
            onChange={(e) => setPolicyForm((pf) => ({ ...pf, limitPerMonth: e.target.value }))}
            fullWidth
            inputMode="decimal"
          />
          <Input
            label="Policy max amount per claim (optional)"
            value={policyForm.maxAmountPerClaim}
            onChange={(e) =>
              setPolicyForm((pf) => ({ ...pf, maxAmountPerClaim: e.target.value }))
            }
            fullWidth
            inputMode="decimal"
          />
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={policyForm.receiptRequired}
              onChange={(e) =>
                setPolicyForm((pf) => ({ ...pf, receiptRequired: e.target.checked }))
              }
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Receipt required on submit
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={policyForm.approvalRequired}
              onChange={(e) =>
                setPolicyForm((pf) => ({ ...pf, approvalRequired: e.target.checked }))
              }
              className="rounded border-gray-300 dark:border-gray-600"
            />
            Approval required (workflows / approvers)
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={policySaving}>
              {policySaving ? 'Saving…' : 'Save policy'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPolicyModalOpen(false);
                setPolicyError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExpenseCategoriesPage;
