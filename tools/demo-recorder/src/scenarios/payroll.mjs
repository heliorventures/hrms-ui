import { DemoError, requireDemo } from '../contracts.mjs';
import { anchor, openView, settled } from '../navigation.mjs';
import { installSamplePayroll } from '../payroll-sample.mjs';

export async function recordPayroll(ctx) {
  const { page, presenter: p, config } = ctx;
  if (config.payroll?.dataMode === 'sample') {
    await installSamplePayroll(page, ctx.runtime.gatewayUrl);
    ctx.dataMode = 'sample-payroll';
    p.sample = true;
  }
  await openView(page, config, '/payroll/payslips', 'payroll.pay.sections');
  const salary = page.getByText('Annual CTC', { exact: true });
  await salary.waitFor({ state: 'visible' }).catch(() => {
    throw new DemoError('PAYROLL_DATA_REQUIRED', 'The demo employee has no current salary structure. Seed sample payroll or select an explicitly labeled sample-data recording.');
  });
  await p.show('In My pay, select Salary to review your salary breakdown.', anchor(page, 'payroll.pay.sections'));
  await p.show('Annual CTC here shows regular salary. Employer PF is listed separately.', salary.locator('..'));
  await p.click(page.getByRole('button', { name: 'Payslip', exact: true }), 'Select Payslip to view a pay period.');
  const period = page.getByLabel('Pay period', { exact: true });
  await period.waitFor({ state: 'visible' });
  const label = config.payroll?.payPeriodLabel || await period.locator('option:checked').innerText();
  await p.select(period, label, 'Choose the pay period you want to view.');
  const slip = page.locator('#payslip-print-sheet');
  await slip.waitFor({ state: 'visible' }).catch(() => { throw new DemoError('PAYSLIP_REQUIRED', 'No finalized payslip exists for the selected demo employee and period.'); });
  await p.show('Review earnings, deductions and net pay on the payslip.', slip);
  await p.click(page.getByRole('button', { name: 'Income Tax', exact: true }), 'Select Income Tax to review your annual projection.');
  const year = page.getByLabel('Financial year', { exact: true });
  if (config.payroll?.financialYear) await p.fill(year, String(config.payroll.financialYear), 'Choose the financial year.');
  const projection = anchor(page, 'payroll.pay.tax-projection');
  await settled(projection).catch(() => { throw new DemoError('TAX_DATA_REQUIRED', 'The demo employee has no available tax projection for this financial year.'); });
  const tax = page.getByText('Projected annual income tax', { exact: true }).locator('..');
  requireDemo(/\d/.test(await tax.innerText()), 'TAX_DATA_REQUIRED', 'A valid tax amount is not available for this demo employee.');
  await p.show('Review projected annual tax and monthly withholding. These are estimates.', projection);
}
