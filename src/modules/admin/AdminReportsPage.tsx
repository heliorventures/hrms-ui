import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import AttendanceDailyReportPanel from '../reports/AttendanceDailyReportPanel';
import {
  availableReports,
  isReportDomain,
  REPORT_DOMAINS,
  type ReportDefinition,
} from '../reports/reportCatalog';
import { currentReportPeriod, reportPeriodError } from '../reports/reportPeriod';
import ReportPeriodFields from '../reports/ReportPeriodFields';
import ReportResult from '../reports/ReportResult';
import { useReportOwner } from '../reports/useReportOwner';

const ReportWorkspace = ({
  reports,
  definition,
  title,
}: {
  reports: ReportDefinition[];
  definition: ReportDefinition;
  title: string;
}) => {
  const { currentTenant } = useTenant();
  const [, setSearchParams] = useSearchParams();
  const selected = definition.kind;
  const [period, setPeriod] = useState(() =>
    currentReportPeriod(currentTenant.timezone || 'Asia/Kolkata')
  );
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const error = reportPeriodError(period.fromDate, period.toDate);
  const filter = useMemo(
    () => ({
      kind: selected === 'ATTENDANCE_DAILY' ? ('ATTENDANCE_PUNCTUALITY' as const) : selected,
      ...period,
      employeeSearch: employeeSearch.trim() || null,
    }),
    [selected, period, employeeSearch]
  );
  return (
    <div className="space-y-4">
      <PageHeader title={title} retainTitle />
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-3">
        <label className="min-w-60 space-y-1 text-sm font-medium">
          Report
          <select
            className="block min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 md:min-h-9"
            value={selected}
            onChange={(event) => {
              const kind = event.target.value;
              if (!reports.some((report) => report.kind === kind)) return;
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.set('report', kind);
                return next;
              });
            }}
          >
            {reports.map((report) => (
              <option key={report.kind} value={report.kind}>
                {report.label}
              </option>
            ))}
          </select>
        </label>
        <ReportPeriodFields
          {...period}
          change={(values) => setPeriod((current) => ({ ...current, ...values }))}
        />
        {selected !== 'ATTENDANCE_DAILY' && (
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setEmployeeSearch(searchDraft);
            }}
          >
            <Input
              label="Employee name or code"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="All employees"
            />
            <Button size="sm" type="submit" variant="outline">
              Apply
            </Button>
          </form>
        )}
      </div>
      <p className="text-sm text-content-secondary">{definition.description}</p>
      {error && (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      )}
      {!error && selected === 'ATTENDANCE_DAILY' && (
        <AttendanceDailyReportPanel key={JSON.stringify(period)} {...period} />
      )}
      {!error && selected !== 'ATTENDANCE_DAILY' && (
        <ReportResult key={JSON.stringify(filter)} filter={filter} />
      )}
    </div>
  );
};

const AdminReportsPage = () => {
  const owner = useReportOwner();
  const { clientSession } = useAuth();
  const [searchParams] = useSearchParams();
  const domain = searchParams.getAll('domain').length > 1 ? '' : searchParams.get('domain');
  if (domain !== null && !isReportDomain(domain)) {
    return <p role="status">Invalid report view.</p>;
  }
  const reports = availableReports(clientSession, domain);
  const requested = searchParams.get('report');
  if (reports.length === 0 && requested === null) {
    return <p role="status">No company reports are available with your permissions.</p>;
  }
  const definition =
    requested === null ? reports[0] : reports.find((report) => report.kind === requested);
  if (!definition || searchParams.getAll('report').length > 1) {
    return <p role="status">This report is unavailable in this view or with your permissions.</p>;
  }
  const title = domain === null ? 'All Reports' : REPORT_DOMAINS[domain].title;
  return (
    <ReportWorkspace
      key={JSON.stringify([owner, domain])}
      reports={reports}
      definition={definition}
      title={title}
    />
  );
};
export default AdminReportsPage;
