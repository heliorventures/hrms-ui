import { UI_FORM_TEXT } from '../../constants/uiText';

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

export const EMPLOYEE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PROBATION', label: 'Probation' },
];

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
