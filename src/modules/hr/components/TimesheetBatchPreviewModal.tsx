import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { parseIsoDate } from '../../../utils/calendarRange';
import { timesheetWeekRangeIso } from '../../../utils/timesheetWeek';

const TIMESHEET_BATCH_PREVIEW_DOCUMENT = `
  query TimesheetBatchPreview(
    $employeeId: ID!
    $fromDate: NaiveDate
    $toDate: NaiveDate
    $limit: Int! = 100
  ) {
    timesheetEntries(
      employeeId: $employeeId
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
    ) {
      id
      workDate
      hoursWorked
      projectCode
      description
      status
      batchId
    }
  }
`;

export interface TimesheetBatchPreview {
  id: string;
  employeeId: string;
  weekStartDate: string;
  status: string;
}

interface PreviewEntry {
  id: string;
  workDate: string;
  hoursWorked: string;
  projectCode?: string | null;
  description?: string | null;
  status: string;
  batchId?: string | null;
}

interface PreviewQuery {
  timesheetEntries: PreviewEntry[];
}

interface TimesheetBatchPreviewModalProps {
  batch: TimesheetBatchPreview | null;
  employeeLabel: string;
  busy: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (batch: TimesheetBatchPreview) => void;
}

const TimesheetBatchPreviewModal = ({
  batch,
  employeeLabel,
  busy,
  onClose,
  onApprove,
  onReject,
}: TimesheetBatchPreviewModalProps) => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<PreviewEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekRange = useMemo(
    () => (batch ? timesheetWeekRangeIso(parseIsoDate(batch.weekStartDate)) : null),
    [batch]
  );

  useEffect(() => {
    if (!batch || !weekRange) return;
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.request<PreviewQuery>(TIMESHEET_BATCH_PREVIEW_DOCUMENT, {
          employeeId: batch.employeeId,
          fromDate: weekRange.start,
          toDate: weekRange.end,
          limit: 100,
        });
        if (!cancelled) setRows(response.timesheetEntries ?? []);
      } catch (err) {
        if (!cancelled) setError(graphQlUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batch, client, weekRange]);

  const totalHours = rows.reduce((sum, row) => sum + Number(row.hoursWorked || 0), 0);
  const pending = batch?.status?.trim().toUpperCase() === 'PENDING';

  return (
    <Modal isOpen={batch != null} onClose={onClose} title="Timesheet Details">
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-white">{employeeLabel}</p>
          {weekRange ? (
            <p>
              Week: {weekRange.start} to {weekRange.end}
            </p>
          ) : null}
          <p>Total Hours: {Number.isFinite(totalHours) ? totalHours.toFixed(2) : '0.00'}</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading entries...</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : rows.length ? (
          <Table
            data={rows}
            keyExtractor={(row) => row.id}
            columns={[
              { key: 'date', label: 'Date', render: (row) => row.workDate },
              { key: 'hours', label: 'Hours', render: (row) => row.hoursWorked },
              { key: 'project', label: 'Project', render: (row) => row.projectCode ?? '-' },
              { key: 'notes', label: 'Notes', render: (row) => row.description ?? '-' },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <Badge variant="info">{row.status}</Badge>,
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No entries found for this week.</p>
        )}

        {batch && pending ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={busy || loading || rows.length === 0}
              onClick={() => onApprove(batch.id)}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || loading}
              onClick={() => onReject(batch)}
            >
              Reject
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default TimesheetBatchPreviewModal;
