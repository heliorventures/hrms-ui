import {
  Payslip,
  SalaryHistoryEntry,
  CompanyPayComponent,
  TaxDeductionSection,
  DeclaredDeduction,
} from '../types';

/** Declared deductions per user per FY (for old regime). Key: `${userId}-${tenantId}-${fy}` */
export const mockDeclaredDeductionsByFy: Record<string, DeclaredDeduction[]> = {
  'user-1-tenant-1-2025-26': [
    { section: '80C', name: 'PPF / ELSS / LIC', amount: 150000 },
    { section: '80CCD(1B)', name: 'NPS (Additional)', amount: 50000 },
    { section: '80D', name: 'Health Insurance', amount: 25000 },
  ],
  'user-1-tenant-1-2024-25': [
    { section: '80C', name: 'PPF / ELSS', amount: 100000 },
    { section: '80D', name: 'Health Insurance', amount: 15000 },
  ],
};

export const mockSalaryHistory: SalaryHistoryEntry[] = [
  {
    id: 'sal-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    effectiveFrom: '2024-07-01',
    effectiveTo: null,
    totalMonthly: 95000,
    components: [
      { name: 'Basic Salary', amount: 50000 },
      { name: 'HRA', amount: 20000 },
      { name: 'Special Allowance', amount: 15000 },
      { name: 'Performance Bonus', amount: 10000 },
    ],
    appraisalReason: 'Annual appraisal - promotion',
  },
  {
    id: 'sal-2',
    userId: 'user-1',
    tenantId: 'tenant-1',
    effectiveFrom: '2023-07-01',
    effectiveTo: '2024-06-30',
    totalMonthly: 85000,
    components: [
      { name: 'Basic Salary', amount: 45000 },
      { name: 'HRA', amount: 18000 },
      { name: 'Special Allowance', amount: 12000 },
      { name: 'Performance Bonus', amount: 10000 },
    ],
    appraisalReason: 'Annual increment',
  },
  {
    id: 'sal-3',
    userId: 'user-1',
    tenantId: 'tenant-1',
    effectiveFrom: '2023-01-15',
    effectiveTo: '2023-06-30',
    totalMonthly: 75000,
    components: [
      { name: 'Basic Salary', amount: 40000 },
      { name: 'HRA', amount: 16000 },
      { name: 'Special Allowance', amount: 10000 },
      { name: 'Performance Bonus', amount: 9000 },
    ],
  },
];

export const mockCompanyPayComponents: CompanyPayComponent[] = [
  { id: 'pc-1', tenantId: 'tenant-1', name: 'Basic Salary', type: 'earning', isTaxable: true },
  { id: 'pc-2', tenantId: 'tenant-1', name: 'HRA', type: 'earning', isTaxable: true },
  { id: 'pc-3', tenantId: 'tenant-1', name: 'Special Allowance', type: 'earning', isTaxable: true },
  { id: 'pc-4', tenantId: 'tenant-1', name: 'Performance Bonus', type: 'earning', isTaxable: true },
  { id: 'pc-5', tenantId: 'tenant-1', name: 'PF (Employee)', type: 'deduction' },
  { id: 'pc-6', tenantId: 'tenant-1', name: 'Professional Tax', type: 'deduction' },
  { id: 'pc-7', tenantId: 'tenant-1', name: 'Income Tax (TDS)', type: 'deduction' },
];

export const OLD_REGIME_DEDUCTIONS: TaxDeductionSection[] = [
  { section: '80C', name: 'Investments (ELSS, LIC, PPF, EPF, etc.)', maxAmount: 150000, subSections: [{ name: 'ELSS', limit: 150000 }, { name: 'PPF', limit: 150000 }, { name: 'Life Insurance', limit: 150000 }, { name: 'Principal repayment (home loan)', limit: 150000 }, { name: 'NSC', limit: 150000 }, { name: 'Others', limit: 150000 }] },
  { section: '80CCC', name: 'Pension (LIC etc.)', maxAmount: 150000 },
  { section: '80CCD(1)', name: 'NPS (Employee contribution)', maxAmount: 150000 },
  { section: '80CCD(1B)', name: 'NPS (Additional)', maxAmount: 50000 },
  { section: '80CCD(2)', name: 'NPS (Employer contribution)', maxAmount: 75000 },
  { section: '80D', name: 'Health Insurance (Self & Family)', maxAmount: 25000, subSections: [{ name: 'Self & Family (below 60)', limit: 25000 }, { name: 'Parents (below 60)', limit: 25000 }, { name: 'Parents (60+)', limit: 50000 }] },
  { section: '80DD', name: 'Disabled dependent', maxAmount: 75000 },
  { section: '80DDB', name: 'Medical (self/dependent)', maxAmount: 40000 },
  { section: '80E', name: 'Interest on education loan', maxAmount: undefined },
  { section: '80G', name: 'Donations', maxAmount: undefined },
  { section: '80GG', name: 'Rent (no HRA)', maxAmount: 60000 },
  { section: '80TTA', name: 'Savings account interest', maxAmount: 10000 },
  { section: '80TTB', name: 'Interest (Senior citizens)', maxAmount: 50000 },
  { section: '24(b)', name: 'Interest on home loan (let out)', maxAmount: 200000 },
  { section: '10(14)', name: 'HRA exemption', maxAmount: undefined },
];

export const NEW_REGIME_DEDUCTIONS: TaxDeductionSection[] = [
  { section: '80CCD(2)', name: 'NPS (Employer contribution)', maxAmount: 75000 },
  { section: '80CCH(2)', name: 'Employer contribution to Agniveer', maxAmount: undefined },
  { section: 'Standard deduction', name: 'Standard deduction (salaried)', maxAmount: 75000 },
];

export const mockPayslips: Payslip[] = [
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    month: '2026-01',
    basicSalary: 50000,
    components: [
      { name: 'Basic Salary', amount: 50000, type: 'earning' },
      { name: 'HRA', amount: 20000, type: 'earning' },
      { name: 'Special Allowance', amount: 15000, type: 'earning' },
      { name: 'Performance Bonus', amount: 10000, type: 'earning' },
      { name: 'PF Contribution', amount: 6000, type: 'deduction' },
      { name: 'Professional Tax', amount: 200, type: 'deduction' },
      { name: 'Income Tax', amount: 8500, type: 'deduction' },
    ],
    grossSalary: 95000,
    totalDeductions: 14700,
    netSalary: 80300,
    taxRegime: 'new',
    generatedOn: '2026-02-01',
  },
  {
    id: 'pay-2',
    tenantId: 'tenant-1',
    userId: 'user-1',
    month: '2025-12',
    basicSalary: 50000,
    components: [
      { name: 'Basic Salary', amount: 50000, type: 'earning' },
      { name: 'HRA', amount: 20000, type: 'earning' },
      { name: 'Special Allowance', amount: 15000, type: 'earning' },
      { name: 'PF Contribution', amount: 6000, type: 'deduction' },
      { name: 'Professional Tax', amount: 200, type: 'deduction' },
      { name: 'Income Tax', amount: 8500, type: 'deduction' },
    ],
    grossSalary: 85000,
    totalDeductions: 14700,
    netSalary: 70300,
    taxRegime: 'new',
    generatedOn: '2026-01-01',
  },
];
