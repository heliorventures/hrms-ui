import type {
  ExpensePolicyDepartmentRow,
  ExpensePolicyDesignationRow,
  ExpensePolicyForm,
  ExpensePolicyRoleRow,
  ExpensePolicyRow,
} from './expenseCategoryTypes';

export const EXPENSE_CATEGORY_LIMIT = 150;
export const EXPENSE_POLICY_DIRECTORY_LIMIT = 320;

export const DEFAULT_EXPENSE_CATEGORY_FORM = {
  name: '',
  code: '',
  maxAmountPerClaim: '',
};

export const DEFAULT_EXPENSE_POLICY_FORM: ExpensePolicyForm = {
  editPolicyId: null,
  applicableTo: 'ALL',
  departmentId: '',
  designationId: '',
  roleId: '',
  limitPerDay: '',
  limitPerMonth: '',
  maxAmountPerClaim: '',
  receiptRequired: false,
  approvalRequired: true,
};

export const EXPENSE_POLICY_SCOPE_OPTIONS = [
  { value: 'ALL', label: 'ALL - entire tenant' },
  { value: 'DEPARTMENT', label: 'DEPARTMENT' },
  { value: 'DESIGNATION', label: 'DESIGNATION' },
  { value: 'ROLE', label: 'ROLE' },
];

export const selectFieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export function shortEntityId(id: string): string {
  return `${id.slice(0, 8)}...`;
}

export function formatMaybeAmount(value?: string | null): string {
  if (value === null || value === undefined || value === '') return '-';
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function optionalString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function createExpensePolicyForm(row: ExpensePolicyRow): ExpensePolicyForm {
  return {
    editPolicyId: row.id,
    applicableTo: row.applicableTo,
    departmentId: row.departmentId ?? '',
    designationId: row.designationId ?? '',
    roleId: row.roleId ?? '',
    limitPerDay: row.limitPerDay ?? '',
    limitPerMonth: row.limitPerMonth ?? '',
    maxAmountPerClaim: row.maxAmountPerClaim ?? '',
    receiptRequired: row.receiptRequired,
    approvalRequired: row.approvalRequired,
  };
}

export function buildDepartmentLabels(departments: ExpensePolicyDepartmentRow[]) {
  const labels = new Map<string, string>();
  for (const department of departments) {
    labels.set(
      department.id,
      department.code?.trim() ? `${department.name} (${department.code})` : department.name
    );
  }
  return labels;
}

export function buildDesignationLabels(
  designations: ExpensePolicyDesignationRow[],
  departmentNameById: Map<string, string>
) {
  const labels = new Map<string, string>();
  for (const designation of designations) {
    const levelSuffix =
      typeof designation.level === 'number' && Number.isFinite(designation.level)
        ? ` - L${designation.level}`
        : '';
    const departmentName = designation.departmentId
      ? departmentNameById.get(designation.departmentId)
      : undefined;
    labels.set(
      designation.id,
      `${designation.title}${levelSuffix}${departmentName ? ` - ${departmentName}` : ''}`
    );
  }
  return labels;
}

export function buildRoleLabels(roles: ExpensePolicyRoleRow[]) {
  const labels = new Map<string, string>();
  for (const role of roles) {
    labels.set(role.id, role.isSystemRole ? `${role.name} (system)` : role.name);
  }
  return labels;
}

export function summarizeExpensePolicyScope(
  policy: ExpensePolicyRow,
  departmentLabels: Map<string, string>,
  designationLabels: Map<string, string>,
  roleLabels: Map<string, string>
): string {
  const applicableTo = (policy.applicableTo || '').toUpperCase();
  if (applicableTo === 'ALL') return 'All employees';

  if (applicableTo === 'DEPARTMENT') {
    if (!policy.departmentId) return '-';
    return departmentLabels.get(policy.departmentId) ?? `Unknown department (${shortEntityId(policy.departmentId)})`;
  }

  if (applicableTo === 'DESIGNATION') {
    if (!policy.designationId) return '-';
    return (
      designationLabels.get(policy.designationId) ??
      `Unknown designation (${shortEntityId(policy.designationId)})`
    );
  }

  if (applicableTo === 'ROLE') {
    if (!policy.roleId) return '-';
    return roleLabels.get(policy.roleId) ?? `Unknown role (${shortEntityId(policy.roleId)})`;
  }

  return applicableTo || '-';
}
