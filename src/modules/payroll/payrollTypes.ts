import type {
  EmployeeSalaryBreakupPreviewQuery,
  PayrollComplianceSettingQuery,
  TaxComputationsListQuery,
  TaxProofLinesQuery,
  TaxSectionDefinitionsQuery,
} from '../../api/graphql/graphql';
import type { PayslipDocModel } from './components/PayslipDocument';

export type PayrollTabId = 'salary' | 'payslip' | 'incometax';

export type EmployeeSalaryPreview =
  EmployeeSalaryBreakupPreviewQuery['employeeSalaryBreakupPreview'];

export interface SalaryComponentRow {
  id: string;
  name: string;
  code: string;
  componentType: string;
  isTaxable: boolean;
  isFixed: boolean;
  isActive: boolean;
}

export interface PayrollCycleRow {
  id: string;
  name: string;
  month: number;
  year: number;
  status: string;
  paymentDate?: string | null;
}

export interface PayrollArrearRow {
  id: string;
  employeeId: string;
  amount: string;
  reason?: string | null;
  status: string;
  createdAt: string;
}

export interface PayrollBoardData {
  salaryComponents: SalaryComponentRow[];
  payrollCycles: PayrollCycleRow[];
  payrollArrears?: PayrollArrearRow[];
}

export interface PayrollComplianceFormState {
  employerTanInput: string;
  employerLegalNameInput: string;
  baseComponentInput: string;
  arrearComponentInput: string;
  payslipHeaderInput: string;
  payslipLogoIdInput: string;
}

export interface PayrollCycleFormState {
  newCycleName: string;
  newCycleMonth: number;
  newCycleYear: number;
  newCyclePayDate: string;
}

export interface PayrollArrearFormState {
  arrearEmployeeId: string;
  arrearAmount: string;
  arrearReason: string;
}

export interface TaxConfigurationRow {
  id: string;
  fiscalYear: number;
  regime?: string | null;
  countryCode: string;
  isActive: boolean;
}

export interface TaxSlabRow {
  id: string;
  taxConfigVersionId: string;
  incomeFrom: string;
  incomeTo?: string | null;
  taxRate?: string | null;
}

export interface PayslipRow extends PayslipDocModel {
  payrollCycleId: string;
}

export type PayrollComplianceSettingRow =
  PayrollComplianceSettingQuery['payrollComplianceSetting'];

export type TaxComputationSelfRow = TaxComputationsListQuery['taxComputations'][number];

export type TaxProofLineSelfRow = TaxProofLinesQuery['taxProofLines'][number];

export type TaxSectionCatalogRow = TaxSectionDefinitionsQuery['taxSectionDefinitions'][number];

export interface PayslipPeriodOption {
  cycleId: string;
  label: string;
  payslip: PayslipRow;
  sort: number;
}

export interface PayslipIndiaFyTotals {
  fyAnchor: number;
  gross: number;
  tds: number;
  slipCount: number;
}
