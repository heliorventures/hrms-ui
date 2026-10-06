import type { ClientOpsEmployeesDirectoryQuery } from '../../../api/graphql/graphql';

export type DirectoryEmployee =
  ClientOpsEmployeesDirectoryQuery['employeeDirectoryPage']['rows'][number];

export const matchesDirectorySearch = (employee: DirectoryEmployee, query: string): boolean => {
  const search = query.trim().toLowerCase();
  const fields = [
    employee.fullName,
    employee.employeeCode,
    employee.status,
    employee.employmentType,
    employee.departmentName,
    employee.designationTitle,
    employee.reportingManagerName,
  ];
  return fields.some((field) => field?.toLowerCase().includes(search));
};

export const directoryInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

export const directoryJoiningDate = (value: unknown): string => {
  if (typeof value !== 'string') return 'Not recorded';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
