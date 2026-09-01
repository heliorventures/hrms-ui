import { UI_FORM_TEXT } from '../../constants/uiText';
import { CANONICAL_EMPLOYEE_STATUSES } from '../employeeStatus';

export type SelectOption = {
  value: string;
  label: string;
};

export type DepartmentOptionSource = {
  id: string;
  name: string;
  code: string;
};

export type DesignationOptionSource = {
  id: string;
  title: string;
};

export type EmployeeOptionSource = {
  id: string;
  employeeCode: string;
  fullName: string;
};

const EMPLOYEE_STATUS_LABELS: Record<(typeof CANONICAL_EMPLOYEE_STATUSES)[number], string> = {
  ACTIVE: 'Active',
  PROBATION: 'Probation',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On leave',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
};

export const EMPLOYEE_STATUS_OPTIONS: SelectOption[] = CANONICAL_EMPLOYEE_STATUSES.map(
  (value) => ({ value, label: EMPLOYEE_STATUS_LABELS[value] })
);

export const EMPTY_EMPLOYEE_FORM_OPTION: SelectOption = {
  value: '',
  label: UI_FORM_TEXT.noneOption,
};

export const LOADING_EMPLOYEE_FORM_OPTION: SelectOption = {
  value: '',
  label: UI_FORM_TEXT.loadingOption,
};

export function buildDepartmentOptions(departments: DepartmentOptionSource[] = []): SelectOption[] {
  return [
    EMPTY_EMPLOYEE_FORM_OPTION,
    ...departments.map((department) => ({
      value: department.id,
      label: `${department.name} (${department.code})`,
    })),
  ];
}

export function buildDesignationOptions(designations: DesignationOptionSource[] = []): SelectOption[] {
  return [
    EMPTY_EMPLOYEE_FORM_OPTION,
    ...designations.map((designation) => ({
      value: designation.id,
      label: designation.title,
    })),
  ];
}

export function buildManagerOptions(
  employees: EmployeeOptionSource[] = [],
  excludedEmployeeId?: string
): SelectOption[] {
  return [
    EMPTY_EMPLOYEE_FORM_OPTION,
    ...employees
      .filter((employee) => employee.id !== excludedEmployeeId)
      .map((employee) => ({
        value: employee.id,
        label: `${employee.fullName} (${employee.employeeCode})`,
      })),
  ];
}
