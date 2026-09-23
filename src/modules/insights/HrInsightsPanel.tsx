import { useCallback, useState } from 'react';

import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import PageInformation from '../../components/common/PageInformation';
import { useTenant } from '../../contexts/TenantContext';
import { useGraphClient } from '../../hooks/useGraphClient';
import { useRetainedQuery } from '../../hooks/useRetainedQuery';
import { REPORTS } from '../reports/reportCatalog';
import { HrInsightsDocument, type HrInsights, type HrReportKind } from '../reports/reportDocuments';
import { currentReportPeriod, reportPeriodError } from '../reports/reportPeriod';
import ReportPeriodFields from '../reports/ReportPeriodFields';
import ReportResult from '../reports/ReportResult';

import HrInsightCharts from './HrInsightCharts';
import InsightSummary from './InsightSummary';

const InsightsData = ({ period }: { period: { fromDate: string; toDate: string } }) => {
  const client = useGraphClient('client');
  const [report, setReport] = useState<HrReportKind | null>(null);
  const load = useCallback(
    () => client.request<{ hrInsights: HrInsights }>(HrInsightsDocument, period),
    [client, period]
  );
  const query = useRetainedQuery(load);
  const data = query.data?.hrInsights;
  const busy = query.phase === 'initial-loading' || query.phase === 'refreshing';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageInformation title="Metrics guide">
          <p className="text-xs text-content-secondary">
            Punctuality counts employee-days. Salary totals are generated payslips in payroll
            currency.
          </p>
        </PageInformation>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            void query.refresh();
          }}
        >
          Refresh
        </Button>
      </div>
      {busy && (
        <p role="status" className="text-sm text-content-secondary">
          Loading HR insights…
        </p>
      )}
      {query.error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-status-danger">
          {query.error}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void query.refresh();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {data && (
        <>
          <InsightSummary data={data} />
          <HrInsightCharts data={data} open={setReport} />
          {data.pendingRequests !== null && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-3">
              <p className="text-sm">
                Pending workload:{' '}
                {data.includedPendingDomains.join(', ') || 'no accessible domains'}
              </p>
              <Button size="sm" variant="outline" onClick={() => setReport('PENDING_REQUESTS')}>
                View pending requests
              </Button>
            </div>
          )}
        </>
      )}
      {report && (
        <Modal
          isOpen
          title={REPORTS.find((item) => item.kind === report)?.label ?? 'Report details'}
          size="xl"
          onClose={() => setReport(null)}
          footer={
            <Button variant="outline" onClick={() => setReport(null)}>
              Close
            </Button>
          }
        >
          <ReportResult
            key={`${report}|${JSON.stringify(period)}`}
            filter={{ kind: report, ...period }}
          />
        </Modal>
      )}
    </div>
  );
};

const HrInsightsPanel = () => {
  const { currentTenant } = useTenant();
  const [period, setPeriod] = useState(() =>
    currentReportPeriod(currentTenant.timezone || 'Asia/Kolkata')
  );
  const error = reportPeriodError(period.fromDate, period.toDate);
  return (
    <section
      id="analytics-tab-hr"
      role="tabpanel"
      aria-labelledby="analytics-tab-hr-tab"
      className="space-y-4"
    >
      <ReportPeriodFields
        {...period}
        change={(values) => setPeriod((current) => ({ ...current, ...values }))}
      />
      {error ? (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      ) : (
        <InsightsData key={JSON.stringify(period)} period={period} />
      )}
    </section>
  );
};
export default HrInsightsPanel;
