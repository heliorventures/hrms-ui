import type { ComponentForm, StructureDraftLine } from './payrollCompensationTypes';

export const COMPENSATION_BOARD_QUERY = /* GraphQL */ `
  query PayrollCompensationBoard($employeeLimit: Int! = 300) {
    employees(limit: $employeeLimit) {
      id
      employeeCode
      fullName
      status
      dateOfJoining
    }
    salaryComponents(limit: 200) {
      id
      name
      code
      componentType
      isTaxable
      isFixed
      isActive
    }
    salaryStructures(limit: 100) {
      id
      name
      description
      components {
        id
        salaryComponentId
        componentName
        componentCode
        componentType
        calculationBasis
        calculationValue
        displayOrder
      }
    }
  }
`;

export const UPSERT_SALARY_COMPONENT = /* GraphQL */ `
  mutation UpsertSalaryComponent($input: UpsertSalaryComponentInput!) {
    upsertSalaryComponent(input: $input) {
      id
      name
      code
      componentType
      isActive
    }
  }
`;

export const UPSERT_SALARY_STRUCTURE = /* GraphQL */ `
  mutation UpsertSalaryStructure($input: UpsertSalaryStructureInput!) {
    upsertSalaryStructure(input: $input) {
      id
      name
      components {
        id
        componentCode
        calculationBasis
        calculationValue
      }
    }
  }
`;

export const ASSIGN_EMPLOYEE_SALARY_STRUCTURE = /* GraphQL */ `
  mutation AssignEmployeeSalaryStructure($input: AssignEmployeeSalaryStructureInput!) {
    assignEmployeeSalaryStructure(input: $input) {
      id
      employeeId
      salaryStructureId
      ctc
      effectiveFrom
    }
  }
`;

export const MONEY_PATTERN = /^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/;
export const today = () => new Date().toISOString().slice(0, 10);

export function validMoney(value: string): boolean {
  return MONEY_PATTERN.test(value.trim()) && Number(value) >= 0;
}

export const defaultComponentForm: ComponentForm = {
  name: '',
  code: '',
  componentType: 'EARNING',
  isTaxable: true,
  isFixed: true,
};

export const defaultLineDraft: StructureDraftLine = {
  salaryComponentId: '',
  calculationBasis: 'PERCENT_OF_CTC',
  calculationValue: '',
};
