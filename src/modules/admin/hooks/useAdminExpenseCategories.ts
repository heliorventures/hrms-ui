import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDialogs } from '../../../contexts/DialogContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
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
} from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import type {
  ExpenseCategoryForm,
  ExpenseCategoryRow,
  ExpensePolicyDepartmentRow,
  ExpensePolicyDesignationRow,
  ExpensePolicyForm,
  ExpensePolicyRoleRow,
  ExpensePolicyRow,
} from '../expenseCategoryTypes';
import {
  buildDepartmentLabels,
  buildDesignationLabels,
  buildRoleLabels,
  createExpensePolicyForm,
  DEFAULT_EXPENSE_CATEGORY_FORM,
  DEFAULT_EXPENSE_POLICY_FORM,
  EXPENSE_CATEGORY_LIMIT,
  EXPENSE_POLICY_DIRECTORY_LIMIT,
  optionalString,
  summarizeExpensePolicyScope,
} from '../expenseCategoryUtils';
import {
  buildDepartmentOptions,
  buildDesignationOptions,
  buildRoleOptions,
} from '../expensePolicyPickerOptions';

export function useAdminExpenseCategories() {
  const client = useGraphClient('client');
  const { confirm } = useDialogs();
  const [rows, setRows] = useState<ExpenseCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseCategoryForm>(DEFAULT_EXPENSE_CATEGORY_FORM);
  const [policyCategoryId, setPolicyCategoryId] = useState('');
  const [policyRows, setPolicyRows] = useState<ExpensePolicyRow[]>([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState<ExpensePolicyForm>(DEFAULT_EXPENSE_POLICY_FORM);
  const [policySaving, setPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [policyPickerBusy, setPolicyPickerBusy] = useState(false);
  const [policyPickerDepartments, setPolicyPickerDepartments] = useState<ExpensePolicyDepartmentRow[]>([]);
  const [policyPickerDesignations, setPolicyPickerDesignations] = useState<ExpensePolicyDesignationRow[]>([]);
  const [policyPickerRoles, setPolicyPickerRoles] = useState<ExpensePolicyRoleRow[]>([]);
  const [policyPickerOrgError, setPolicyPickerOrgError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const result = await client.request<AdminExpenseCategoriesQuery>(AdminExpenseCategoriesDocument, {
      limit: EXPENSE_CATEGORY_LIMIT,
    });
    return result.expenseCategories;
  }, [client]);

  const loadPolicies = useCallback(
    async (categoryId: string) => {
      const result = await client.request<ExpensePoliciesForAdminQuery>(ExpensePoliciesForAdminDocument, {
        expenseCategoryId: categoryId,
      });
      return result.expensePoliciesForAdmin;
    },
    [client]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadCategories();
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCategories]);

  useEffect(() => {
    if (!rows.length) {
      setPolicyCategoryId('');
      setPolicyRows([]);
      return;
    }
    setPolicyCategoryId((current) =>
      current && rows.some((row) => row.id === current) ? current : rows[0].id
    );
  }, [rows]);

  useEffect(() => {
    if (!policyCategoryId) {
      setPolicyRows([]);
      return;
    }
    let cancelled = false;
    void (async () => {
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
  }, [loadPolicies, policyCategoryId]);

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
        const result = await client.request<ExpensePolicyDirectoryQuery>(ExpensePolicyDirectoryDocument, {
          lim: EXPENSE_POLICY_DIRECTORY_LIMIT,
        });
        if (cancelled) return;
        setPolicyPickerDepartments(result.departments ?? []);
        setPolicyPickerDesignations(result.designations ?? []);
        setPolicyPickerRoles(result.expenseAssignableRoles ?? []);
      } catch (err) {
        if (!cancelled) {
          setPolicyPickerDepartments([]);
          setPolicyPickerDesignations([]);
          setPolicyPickerRoles([]);
          setPolicyPickerOrgError(graphQlUserMessage(err));
        }
      } finally {
        if (!cancelled) setPolicyPickerBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, rows.length]);

  const refreshCategories = useCallback(async () => {
    setRows(await loadCategories());
  }, [loadCategories]);

  const departmentNameById = useMemo(() => {
    const labels = new Map<string, string>();
    for (const department of policyPickerDepartments) labels.set(department.id, department.name);
    return labels;
  }, [policyPickerDepartments]);

  const departmentLabels = useMemo(
    () => buildDepartmentLabels(policyPickerDepartments),
    [policyPickerDepartments]
  );
  const designationLabels = useMemo(
    () => buildDesignationLabels(policyPickerDesignations, departmentNameById),
    [departmentNameById, policyPickerDesignations]
  );
  const roleLabels = useMemo(() => buildRoleLabels(policyPickerRoles), [policyPickerRoles]);

  const summarizePolicyScope = useCallback(
    (policy: ExpensePolicyRow) =>
      summarizeExpensePolicyScope(policy, departmentLabels, designationLabels, roleLabels),
    [departmentLabels, designationLabels, roleLabels]
  );

  const departmentOptions = useMemo(
    () => buildDepartmentOptions(policyPickerDepartments, policyForm.departmentId),
    [policyForm.departmentId, policyPickerDepartments]
  );

  const designationOptions = useMemo(
    () =>
      buildDesignationOptions(
        policyPickerDesignations,
        departmentNameById,
        policyForm.designationId
      ),
    [departmentNameById, policyForm.designationId, policyPickerDesignations]
  );

  const roleOptions = useMemo(
    () => buildRoleOptions(policyPickerRoles, policyForm.roleId),
    [policyForm.roleId, policyPickerRoles]
  );

  const openNewCategory = () => {
    setEditId(null);
    setForm(DEFAULT_EXPENSE_CATEGORY_FORM);
    setModalOpen(true);
  };

  const openEditCategory = (row: ExpenseCategoryRow) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      code: row.code,
      maxAmountPerClaim: row.maxAmountPerClaim ?? '',
    });
    setModalOpen(true);
  };

  const closeCategoryModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
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
          maxAmountPerClaim: form.maxAmountPerClaim.trim() === '' ? null : form.maxAmountPerClaim.trim(),
        },
      });
      await refreshCategories();
      closeCategoryModal();
    } catch (err) {
      setError(graphQlUserMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (row: ExpenseCategoryRow) => {
    const ok = await confirm({
      title: `Delete category "${row.name}"?`,
      message:
        'The category will be archived. Employees can no longer select it when filing new claims.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setError(null);
      await client.request(DeleteExpenseCategoryAdminDocument, { expenseCategoryId: row.id });
      await refreshCategories();
    } catch (err) {
      setError(graphQlUserMessage(err));
    }
  };

  const openNewPolicy = () => {
    if (!policyCategoryId) return;
    setPolicyForm({ ...DEFAULT_EXPENSE_POLICY_FORM, editPolicyId: null });
    setPolicyError(null);
    setPolicyModalOpen(true);
  };

  const openEditPolicy = (policy: ExpensePolicyRow) => {
    setPolicyForm(createExpensePolicyForm(policy));
    setPolicyError(null);
    setPolicyModalOpen(true);
  };

  const closePolicyModal = () => {
    setPolicyModalOpen(false);
    setPolicyError(null);
  };

  const savePolicy = async (event: FormEvent) => {
    event.preventDefault();
    if (!policyCategoryId) return;
    const applicableTo = policyForm.applicableTo.trim().toUpperCase();
    try {
      setPolicySaving(true);
      setPolicyError(null);
      await client.request(UpsertExpensePolicyAdminDocument, {
        input: {
          id: policyForm.editPolicyId ?? undefined,
          expenseCategoryId: policyCategoryId,
          applicableTo,
          departmentId: applicableTo === 'DEPARTMENT' ? optionalString(policyForm.departmentId) : undefined,
          designationId:
            applicableTo === 'DESIGNATION' ? optionalString(policyForm.designationId) : undefined,
          roleId: applicableTo === 'ROLE' ? optionalString(policyForm.roleId) : undefined,
          limitPerDay: optionalString(policyForm.limitPerDay),
          limitPerMonth: optionalString(policyForm.limitPerMonth),
          maxAmountPerClaim: optionalString(policyForm.maxAmountPerClaim),
          receiptRequired: policyForm.receiptRequired,
          approvalRequired: policyForm.approvalRequired,
        },
      });
      setPolicyRows(await loadPolicies(policyCategoryId));
      closePolicyModal();
    } catch (err) {
      setPolicyError(graphQlUserMessage(err));
    } finally {
      setPolicySaving(false);
    }
  };

  const deletePolicy = async (policy: ExpensePolicyRow) => {
    const ok = await confirm({
      title: 'Delete Expense Policy?',
      message:
        'Submit-time caps and receipt rules are resolved from policies for each employee. Removing a row changes enforcement immediately.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setPolicyError(null);
      await client.request(DeleteExpensePolicyAdminDocument, { expensePolicyId: policy.id });
      if (policyCategoryId) setPolicyRows(await loadPolicies(policyCategoryId));
    } catch (err) {
      setPolicyError(graphQlUserMessage(err));
    }
  };

  return {
    rows,
    loading,
    error,
    modalOpen,
    saving,
    editId,
    form,
    setForm,
    policyCategoryId,
    setPolicyCategoryId,
    policyRows,
    policyLoading,
    policyModalOpen,
    policyForm,
    setPolicyForm,
    policySaving,
    policyError,
    policyPickerBusy,
    policyPickerOrgError,
    policyPickerDepartments,
    policyPickerDesignations,
    policyPickerRoles,
    departmentOptions,
    designationOptions,
    roleOptions,
    summarizePolicyScope,
    openNewCategory,
    openEditCategory,
    closeCategoryModal,
    saveCategory,
    deleteCategory,
    openNewPolicy,
    openEditPolicy,
    closePolicyModal,
    savePolicy,
    deletePolicy,
  };
}

export type AdminExpenseCategoriesModel = ReturnType<typeof useAdminExpenseCategories>;
