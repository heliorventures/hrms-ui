import Card from '../../../components/common/Card';

const PayrollAdminNotice = () => (
  <Card className="border-amber-200/90 bg-amber-50/80 dark:border-amber-800/80 dark:bg-amber-950/30">
    <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
      India <strong>TDS · PF · ESI · 24Q · Form&nbsp;16 · NEFT</strong> CSVs below are
      reconciliation <strong>stubs</strong> for internal checks — they are <strong>not</strong>{' '}
      TRACES uploads, ECR/binary files, bank-spec NACH, or statutory filed returns. Use certified
      payroll/accounting tooling for compliance submissions.
    </p>
  </Card>
);

export default PayrollAdminNotice;
