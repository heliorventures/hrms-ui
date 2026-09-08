import { useMemo, useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import AttendanceDailyReportPanel from '../reports/AttendanceDailyReportPanel';
import { availableReports, type ReportKind } from '../reports/reportCatalog';
import { currentReportPeriod, reportPeriodError } from '../reports/reportPeriod';
import ReportPeriodFields from '../reports/ReportPeriodFields';
import ReportResult from '../reports/ReportResult';
import { useReportOwner } from '../reports/useReportOwner';

export { attendanceCsvRows } from '../reports/AttendanceDailyReportPanel';

const ReportWorkspace = () => {
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  const reports = availableReports(clientSession);
  const [selected, setSelected] = useState<ReportKind>(reports[0]?.kind ?? 'ATTENDANCE_DAILY');
  const [period, setPeriod] = useState(() =>
    currentReportPeriod(currentTenant.timezone || 'Asia/Kolkata')
  );
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const definition = reports.find((report) => report.kind === selected);
  const error = reportPeriodError(period.fromDate, period.toDate);
  const filter = useMemo(
    () => ({
      kind: selected === 'ATTENDANCE_DAILY' ? ('ATTENDANCE_PUNCTUALITY' as const) : selected,
      ...period,
      employeeSearch: employeeSearch.trim() || null,
    }),
    [selected, period, employeeSearch]
  );
  if (!definition)
    return (
      <p role="status" className="text-sm text-content-secondary">
        No company reports are available with your permissions.
      </p>
    );
  return (
    <div className="space-y-4">
      <PageHeader title="Reports" />
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-3">
        <label className="min-w-60 space-y-1 text-sm font-medium">
          Report
          <select
            className="block min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 md:min-h-9"
            value={selected}
            onChange={(event) => setSelected(event.target.value as ReportKind)}
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
  return <ReportWorkspace key={owner} />;
};
export default AdminReportsPage;
