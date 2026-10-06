import type { ComponentForm, StructureDraftLine } from './payrollCompensationTypes';

export {
  PayrollCompensationBoardDocument as COMPENSATION_BOARD_QUERY,
  UpsertSalaryComponentDocument as UPSERT_SALARY_COMPONENT,
  UpsertSalaryStructureDocument as UPSERT_SALARY_STRUCTURE,
  AssignEmployeeSalaryStructureDocument as ASSIGN_EMPLOYEE_SALARY_STRUCTURE,
} from '../../api/graphql/graphql';

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
