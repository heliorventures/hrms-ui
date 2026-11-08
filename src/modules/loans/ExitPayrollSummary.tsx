import { payrollPeriod, type ExitPayrollContext } from './exitPayrollContext';

const ExitPayrollSummary = ({ context }: { context: ExitPayrollContext }) => (
  <section className="space-y-2 rounded-lg border border-line-subtle p-3 text-sm">
    <h3 className="font-semibold">Payroll coverage</h3>
    <p className="text-content-secondary">
      Issued salary remains in Payroll. These references do not add FNF earnings or permit another
      deduction from an issued payslip.
    </p>
    {context.recentIssuedPayslips.length ? (
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {context.recentIssuedPayslips.map((slip, index) => (
          <div key={slip.id} className="flex justify-between gap-3">
            <dt>
              {index === 0 ? 'Last issued salary' : 'Issued salary'} · {payrollPeriod(slip)}
            </dt>
            <dd className="tabular-nums">{slip.amount}</dd>
          </div>
        ))}
      </dl>
    ) : (
      <p>No issued salary record was found for this employee.</p>
    )}
    <p>
      Prepared draft payroll periods:{' '}
      {context.draftCycles.length ? context.draftCycles.map(payrollPeriod).join(', ') : 'None'}.
      Only prepared draft cycles can receive proposed final payroll recovery.
    </p>
    <p className="text-xs text-content-secondary">
      Shows the latest 12 issued payslips. Issued amounts do not confirm a bank payment.
    </p>
  </section>
);
export default ExitPayrollSummary;
