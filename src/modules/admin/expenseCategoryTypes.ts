import type {
  AdminExpenseCategoriesQuery,
  ExpensePoliciesForAdminQuery,
  ExpensePolicyDirectoryQuery,
} from '../../api/graphql/graphql';

export type ExpenseCategoryRow = AdminExpenseCategoriesQuery['expenseCategories'][number];
export type ExpensePolicyRow = ExpensePoliciesForAdminQuery['expensePoliciesForAdmin'][number];
export type ExpensePolicyDepartmentRow = ExpensePolicyDirectoryQuery['departments'][number];
export type ExpensePolicyDesignationRow = ExpensePolicyDirectoryQuery['designations'][number];
export type ExpensePolicyRoleRow = ExpensePolicyDirectoryQuery['expenseAssignableRoles'][number];

export interface ExpenseCategoryForm {
  name: string;
  code: string;
  maxAmountPerClaim: string;
}

export interface ExpensePolicyForm {
  editPolicyId: string | null;
  applicableTo: string;
  departmentId: string;
  designationId: string;
  roleId: string;
  limitPerDay: string;
  limitPerMonth: string;
  maxAmountPerClaim: string;
  receiptRequired: boolean;
  approvalRequired: boolean;
}
