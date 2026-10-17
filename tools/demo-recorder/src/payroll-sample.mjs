// Explicit training fixtures. These amounts never enter the tenant database.
// They demonstrate the UI, not an employee's actual entitlement or tax liability.
const earnings = [
  { id: 'sample-basic', name: 'Basic salary', code: 'BASIC', amount: '75000.00' },
  { id: 'sample-hra', name: 'House rent allowance', code: 'HRA', amount: '45000.00' },
  { id: 'sample-special', name: 'Special allowance', code: 'SPECIAL', amount: '30000.00' },
];

const salary = {
  employeeId: 'sample-employee', employeeSalaryStructureId: 'sample-structure',
  annualCtc: '1800000.00', monthlyGross: '150000.00', monthlyDeductions: '14566.67', monthlyNetBeforeStatutory: '150000.00',
  financials: { annual_gross: '1800000.00', annual_employer_pf: '21600.00', annual_ctc: '1821600.00' },
  lines: earnings.map(item => ({ salaryComponentId: item.id, componentName: item.name, componentCode: item.code, componentType: 'EARNING', calculationBasis: 'FIXED', calculationValue: item.amount, annualAmount: (Number(item.amount) * 12).toFixed(2), monthlyAmount: item.amount, isOverride: false })),
};

const slip = {
  id: 'sample-payslip-september-2026', payrollCycleId: 'sample-september', periodMonth: 9, periodYear: 2026,
  grossSalary: '150000.00', totalDeductions: '14566.67', netSalary: '135433.33',
  pfEmployee: '1800.00', pfEmployer: '1800.00', esiEmployee: '0.00', esiEmployer: '0.00', tdsAmount: '12566.67', professionalTax: '200.00',
  uanNumber: null, esicNumber: null, status: 'FINALIZED', generatedAt: '2026-09-30T12:00:00Z',
  lines: earnings.map(item => ({ id: item.id, salaryComponentId: item.id, componentType: 'EARNING', amount: item.amount })),
};

const presentation = {
  template: 'TABLE',
  employeeDetails: [
    { field: 'EMPLOYEE_NAME', label: 'Employee name', value: 'Demo Employee — sample figures' },
    { field: 'EMPLOYEE_CODE', label: 'Employee code', value: 'DEMO-001' },
    { field: 'DEPARTMENT', label: 'Department', value: 'Training' },
  ],
  lines: earnings.map(item => ({ id: item.id, code: item.code, name: item.name, componentType: 'EARNING', amount: item.amount })),
  statement: {
    gross: '150000.00', incentive: '0.00', total_deductions: '14566.67', net_earned: '135433.33', advance_already_paid: '0.00', remaining_payable: '135433.33',
    lwp_amount: '0.00', lwp_days: '0', lwp_divisor: '30', lwp_basis_amount: '75000.00', gross_rule: 'Sample regular earnings',
  },
};

function projection(variables) {
  const year = variables.fiscalYear ?? 2026;
  const month = variables.month ?? 10;
  return {
    configuration: { regime: 'NEW', method: 'ANNUAL_PROJECTION', percentage: null, basis_components: [], effective_from: `${year}-04-01` },
    fiscal_year: year, annual_earnings: '1800000.00', recorded_tds: '75400.02', history_complete: true,
    selected_monthly_tds: '12566.66', selected_month: { year, month, evidence: 'FUTURE_PROJECTION' },
    months: Array.from({ length: 12 }, (_, index) => ({
      year: index < 9 ? year : year + 1, month: (index + 3) % 12 + 1,
      earnings: '150000.00', tds: index < 6 ? '12566.67' : null, evidence: index < 6 ? 'FINALIZED_PAYROLL' : 'FUTURE_PROJECTION',
      components: { BASIC: '75000.00', HRA: '45000.00', SPECIAL: '30000.00' }, aggregate_source: null, projected_withholding: index < 6 ? null : '12566.66',
    })),
    tax: {
      rule_version: 'ILLUSTRATIVE_SAMPLE', source: 'Training fixture — not a payroll calculation', gross: '1800000.00', standard_deduction: '75000.00', permitted_deductions: '0.00',
      taxable_income: '1725000.00', statutory_taxable_income: '1725000.00',
      slabs: [
        { from: '0', to: '400000', rate: '0', tax: '0' },
        { from: '400000', to: '800000', rate: '0.05', tax: '20000' },
        { from: '800000', to: '1200000', rate: '0.10', tax: '40000' },
        { from: '1200000', to: '1600000', rate: '0.15', tax: '60000' },
        { from: '1600000', to: '1725000', rate: '0.20', tax: '25000' },
      ],
      slab_tax: '145000.00', rebate: '0.00', surcharge: '0.00', marginal_relief: '0.00', cess: '5800.00', display_tax: '150800.00', statutory_tax: '150800.00',
    },
    withholding: { monthly: '12566.66', remaining: '75399.98', requires_acknowledgement: false, excess_withholding: false },
    limitations: ['All figures are illustrative training data.'], note: 'Sample figures only. This is not an actual payroll record or a statement of tax liability.', opening_history: [],
  };
}

export function samplePayrollResponse(query, variables = {}) {
  const operation = /^\s*query\s+(\w+)/.exec(query)?.[1];
  switch (operation) {
    case 'ImportedSalaryPreview': return { employeeSalaryBreakupPreview: structuredClone(salary) };
    case 'ClientOpsPayslipsForPayrollHub': return { payslips: [structuredClone(slip)] };
    case 'PayslipPresentation': return { payslipPresentation: structuredClone(presentation) };
    case 'PayslipUnpaidLeave': return { payslipUnpaidLeave: null };
    case 'PayrollComplianceSetting': return { payrollComplianceSetting: { payslipTemplate: 'TABLE', payslipEmployeeFields: ['EMPLOYEE_NAME', 'EMPLOYEE_CODE', 'DEPARTMENT'], employerTan: null, employerLegalName: 'Helior Demo Company', baseSalaryComponentCode: 'BASIC', arrearSalaryComponentCode: null, payslipHeaderTitle: 'Helior Demo Company — training sample', payslipCompanyAddress: 'Illustrative payroll · No payment or salary assignment was created', payslipLogoFileStorageId: null } };
    case 'CompanyPayslipComponents': return { salaryComponents: earnings.map(item => ({ id: item.id, name: item.name, componentType: 'EARNING', showOnPayslip: true })) };
    case 'EmployeeTaxProjection': return { employeeTaxProjection: projection(variables) };
    case 'TaxComputationsList': return { taxComputations: [] };
    case 'TaxProofLines': return { taxProofLines: [] };
    case 'TaxSectionDefinitions': return { taxSectionDefinitions: [] };
    case 'EmployeeTaxSubmissionContext': return { employeeTaxSubmissionContext: null };
    default: return undefined;
  }
}

export async function installSamplePayroll(page, gatewayUrl) {
  await page.route(gatewayUrl, async route => {
    let body;
    try { body = route.request().postDataJSON(); } catch { await route.fallback(); return; }
    if (/^\s*mutation\b/.test(body?.query ?? '')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ errors: [{ message: 'Sample payroll recording is read only.' }] }) });
      return;
    }
    const data = samplePayrollResponse(body?.query ?? '', body?.variables);
    if (data === undefined) { await route.fallback(); return; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
  });
}
