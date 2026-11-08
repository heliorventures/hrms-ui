import assert from 'node:assert/strict';
import test from 'node:test';

import { samplePayrollResponse } from '../src/payroll-sample.mjs';

test('sample payroll only intercepts named read operations, never submissions or unknown queries', () => {
  assert.equal(samplePayrollResponse('mutation SubmitExpense { submitExpense { id } }'), undefined);
  assert.equal(samplePayrollResponse('query Unknown { anything }'), undefined);
  assert.ok(samplePayrollResponse('query ImportedSalaryPreview { employeeSalaryBreakupPreview { monthlyGross } }').employeeSalaryBreakupPreview);
});

test('illustrative salary, payslip and settlement totals reconcile without numeric fallbacks', () => {
  const salary = samplePayrollResponse('query ImportedSalaryPreview { }').employeeSalaryBreakupPreview;
  const slip = samplePayrollResponse('query ClientOpsPayslipsForPayrollHub { }').payslips[0];
  const presentation = samplePayrollResponse('query PayslipPresentation { }').payslipPresentation;
  assert.equal(Number(salary.monthlyGross) * 12, Number(salary.financials.annual_gross));
  assert.equal(Number(salary.financials.annual_gross) + Number(salary.financials.annual_employer_pf), Number(salary.financials.annual_ctc));
  assert.equal(Math.round((Number(slip.grossSalary) - Number(slip.totalDeductions)) * 100), Math.round(Number(slip.netSalary) * 100));
  assert.equal(presentation.statement.remaining_payable, slip.netSalary);
});
