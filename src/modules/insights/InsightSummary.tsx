import type { HrInsights } from '../reports/reportDocuments';

interface MetricProps {
  label: string;
  value: number | string | null;
  prominent?: boolean;
}

const Metric = ({ label, value, prominent = false }: MetricProps) =>
  value === null ? null : (
    <div
      className={prominent ? 'app-card rounded-xl border border-line-subtle bg-surface' : 'min-w-0'}
    >
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd
        className={`${prominent ? 'text-3xl' : 'text-xl'} mt-1 break-words font-semibold tabular-nums`}
      >
        {value}
      </dd>
    </div>
  );

const InsightSummary = ({ data }: { data: HrInsights }) => {
  const values = [
    data.activeHeadcount,
    data.netSalaryGenerated,
    data.joiners,
    data.exits,
    data.generatedPayslips,
    data.pendingRequests,
    data.incompleteDays,
  ];
  if (values.every((value) => value === null))
    return (
      <p role="status" className="text-sm text-content-secondary">
        No company metrics are available with your current permissions.
      </p>
    );
  const attention = data.pendingRequests !== null || data.incompleteDays !== null;
  const needsAttention = (data.pendingRequests ?? 0) > 0 || (data.incompleteDays ?? 0) > 0;
  return (
    <div className="space-y-3">
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Current active employees" value={data.activeHeadcount} prominent />
        <Metric label="Net salary generated" value={data.netSalaryGenerated} prominent />
        {attention && (
          <div
            className={`app-card rounded-xl border ${needsAttention ? 'border-status-warning/40 bg-status-warning/10' : 'border-line-subtle bg-surface'}`}
          >
            <dt className="mb-2 text-sm font-semibold">
              {needsAttention ? 'Needs attention' : 'Work queue'}
            </dt>
            <dd>
              <dl className="grid grid-cols-2 gap-3">
                <Metric label="Pending requests" value={data.pendingRequests} />
                <Metric label="Incomplete attendance days" value={data.incompleteDays} />
              </dl>
            </dd>
          </div>
        )}
      </dl>
      <dl className="flex flex-wrap gap-x-8 gap-y-3 px-1">
        <Metric label="Joiners in period" value={data.joiners} />
        <Metric label="Exits in period" value={data.exits} />
        <Metric label="Generated payslips" value={data.generatedPayslips} />
      </dl>
      <p className="text-xs text-content-muted">
        Salary totals reflect generated payslips, not money paid.
      </p>
    </div>
  );
};
export default InsightSummary;
