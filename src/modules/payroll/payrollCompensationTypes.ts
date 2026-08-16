export interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
  status: string;
  dateOfJoining: string;
}

export interface SalaryComponentRow {
  id: string;
  name: string;
  code: string;
  componentType: string;
  isTaxable: boolean;
  isFixed: boolean;
  isActive: boolean;
}

export interface SalaryStructureComponentRow {
  id: string;
  salaryComponentId: string;
  componentName: string;
  componentCode: string;
  componentType: string;
  calculationBasis: string;
  calculationValue?: string | null;
  displayOrder: number;
}

export interface SalaryStructureRow {
  id: string;
  name: string;
  description?: string | null;
  components: SalaryStructureComponentRow[];
}

export interface SalaryBreakupPreview {
  annualCtc: string;
  monthlyGross: string;
  monthlyDeductions: string;
  monthlyNetBeforeStatutory: string;
  lines: {
    salaryComponentId: string;
    componentName: string;
    componentCode: string;
    componentType: string;
    calculationBasis: string;
    calculationValue: string;
    annualAmount: string;
    monthlyAmount: string;
    isOverride: boolean;
  }[];
}

export interface BoardResult {
  employees: EmployeeRow[];
  salaryComponents: SalaryComponentRow[];
  salaryStructures: SalaryStructureRow[];
}

export interface StructureDraftLine {
  salaryComponentId: string;
  calculationBasis: string;
  calculationValue: string;
}

export interface ComponentForm {
  name: string;
  code: string;
  componentType: string;
  isTaxable: boolean;
  isFixed: boolean;
}

export interface AssignmentForm {
  employeeId: string;
  salaryStructureId: string;
  annualCtc: string;
  effectiveFrom: string;
}
