import Card from '../../../components/common/Card';

/**
 * Shown when PostgREST/SeaORM reports a missing table (tenant schema not fully migrated).
 */
const PayrollMigrationHint = () => (
  <Card>
    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
      Payroll tables are missing in the database (tenant not migrated for domain 0012).
    </p>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
      Apply the <span className="font-mono">tenant</span> Liquibase changelog for your schema so
      tables such as <span className="font-mono">salary_component</span>,{' '}
      <span className="font-mono">payslip</span>, and{' '}
      <span className="font-mono">payroll_cycle</span> exist. See{' '}
      <span className="font-mono">kabipay-database/README.md</span> and run{' '}
      <span className="font-mono">kabipay-svc/scripts/provision-tenant.ps1</span> for new tenants,
      or re-run the tenant <span className="font-mono">liquibase update</span> for an existing
      schema.
    </p>
  </Card>
);

export default PayrollMigrationHint;
