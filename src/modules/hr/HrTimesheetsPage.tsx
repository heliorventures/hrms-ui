import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  ApproveTimesheetWeekBatchDocument,
  RejectTimesheetWeekBatchDocument,
  ViewerEmployeeIdDocument,
  type ViewerEmployeeIdQuery,
} from '../../api/graphql/graphql';
import TimesheetBatchPreviewModal from './components/TimesheetBatchPreviewModal';

const TIMESHEET_WEEK_BATCHES_DOCUMENT = `
  query HrTimesheetWeekBatches($status: String, $limit: Int! = 80) {
    timesheetWeekBatches(status: $status, limit: $limit) {
      id
      employeeId
      employeeCode
      employeeName
      weekStartDate
      status
      submittedAt
      workflowInstanceId
      pendingApprovalStage
      viewerMayApprove
    }
  }
`;

type BatchRow = {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  weekStartDate: string;
  status: string;
  submittedAt?: string | null;
  workflowInstanceId?: string | null;
  pendingApprovalStage?: string | null;
  viewerMayApprove?: boolean;
};

const HrTimesheetsPage = () => {
  const client = useGraphClient('client');
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [viewerEmployeeId, setViewerEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<BatchRow | null>(null);
  const [previewFor, setPreviewFor] = useState<BatchRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    const r = await client.request<{ timesheetWeekBatches: BatchRow[] }>(TIMESHEET_WEEK_BATCHES_DOCUMENT, {
      ...(filter === 'pending' ? { status: 'PENDING' } : {}),
      limit: 80,
    });
    setBatches(r.timesheetWeekBatches ?? []);
  }, [client, filter]);

  const loadViewer = useCallback(async () => {
    const response = await client.request<ViewerEmployeeIdQuery>(ViewerEmployeeIdDocument);
    setViewerEmployeeId(response.viewerEmployeeId?.trim() || null);
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setInfoNotice(null);
        await Promise.all([loadViewer(), loadBatches()]);
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadViewer, loadBatches]);

  const employeeLabel = useCallback((row: BatchRow) => {
    const name = row.employeeName?.trim();
    const code = row.employeeCode?.trim();
    if (name && code) return `${name} (${code})`;
    if (name) return name;
    if (code) return code;
    return row.employeeId.slice(0, 8);
  }, []);

  const silentRefresh = useCallback(async () => {
    try {
      await loadBatches();
    } catch (e) {
      setError(graphQlUserMessage(e));
    }
  }, [loadBatches]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    setError(null);
    setInfoNotice(null);
    try {
      const result = await client.request(ApproveTimesheetWeekBatchDocument, { id });
      const exp = result.approveTimesheetWeekBatch;
      const st = exp?.status?.trim().toUpperCase() ?? '';
      if (st === 'PENDING' && exp?.workflowInstanceId) {
        setInfoNotice(
          'Your approval was recorded. The submission stays open until every workflow step is finished - continue with HR or the next approver.',
        );
      } else {
        setInfoNotice('Timesheet approved.');
      }
      setPreviewFor(null);
      await silentRefresh();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectFor) return;
    setBusyId(rejectFor.id);
    setError(null);
    setInfoNotice(null);
    try {
      await client.request(RejectTimesheetWeekBatchDocument, {
        id: rejectFor.id,
        rejectionReason: rejectReason.trim() || null,
      });
      setRejectFor(null);
      setPreviewFor(null);
      setRejectReason('');
      setInfoNotice('Timesheet rejected.');
      await silentRefresh();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const filterTabs = useMemo(
    () =>
      (
        [
          { key: 'pending' as const, label: 'Pending' },
          { key: 'all' as const, label: 'ALL Statuses' },
        ] as const
      ).map((t) => (
        <Button
          key={t.key}
          type="button"
          variant={filter === t.key ? 'primary' : 'outline'}
          className="!py-1 !text-xs"
          onClick={() => setFilter(t.key)}
        >
          {t.label}
        </Button>
      )),
    [filter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheet Approvals</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Same inbox pattern as expenses/travel: <strong>Status</strong> stays workflow-pending until
          all configured steps complete; approve/reject is only enabled when it is your turn (
          <code className="font-mono text-xs">viewerMayApprove</code>). Open details before acting to
          review the submitted rows.
        </p>
      </div>

      <Card title="Queue">
        <div className="mb-4 flex flex-wrap items-center gap-2">{filterTabs}</div>
        {infoNotice ? (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
            {infoNotice}
          </div>
        ) : null}
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : batches.length ? (
          <Table
            data={batches}
            keyExtractor={(row) => row.id}
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (row: BatchRow) => employeeLabel(row),
              },
              {
                key: 'week',
                label: 'Week Starts',
                render: (row: BatchRow) => row.weekStartDate,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: BatchRow) => {
                  const up = row.status?.trim().toUpperCase() ?? '';
                  const label =
                    up === 'PENDING' && row.pendingApprovalStage
                      ? `Pending - ${row.pendingApprovalStage}`
                      : row.status;
                  const variant =
                    up === 'PENDING' && row.viewerMayApprove === false ? 'neutral' : 'info';
                  return <Badge variant={variant}>{label}</Badge>;
                },
              },
              {
                key: 'actions',
                label: '',
                render: (row: BatchRow) => {
                  const pending = row.status?.toUpperCase() === 'PENDING';
                  const ownSubmission = viewerEmployeeId != null && row.employeeId === viewerEmployeeId;
                  const mayAct = pending && row.viewerMayApprove === true && !ownSubmission;
                  const waiting = pending && row.viewerMayApprove === false;
                  const canPreview = pending || row.status?.toUpperCase() === 'REJECTED';
                  if (ownSubmission) {
                    return (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Own Submission
                      </span>
                    );
                  }
                  if (canPreview && !mayAct) {
                    return (
                      <Button
                        type="button"
                        variant="outline"
                        className="!py-1 !text-xs"
                        disabled={busyId === row.id}
                        onClick={() => setPreviewFor(row)}
                      >
                        View
                      </Button>
                    );
                  }
                  if (mayAct) {
                    return (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="!py-1 !text-xs"
                          disabled={busyId === row.id}
                          onClick={() => setPreviewFor(row)}
                        >
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          className="!py-1 !text-xs"
                          disabled={busyId === row.id}
                          onClick={() => void handleApprove(row.id)}
                        >
                          {busyId === row.id ? '...' : 'Approve'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="!py-1 !text-xs"
                          disabled={busyId === row.id}
                          onClick={() => {
                            setPreviewFor(null);
                            setRejectFor(row);
                            setRejectReason('');
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    );
                  }
                  if (waiting) {
                    return (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Awaiting Another Approver
                      </span>
                    );
                  }
                  return '-';
                },
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Batches In This Filter.</p>
        )}
      </Card>

      <Modal
        isOpen={!!rejectFor}
        onClose={() => {
          setRejectFor(null);
          setRejectReason('');
        }}
        title="Reject Timesheet Week"
      >
        <div className="space-y-3">
          <Input
            label="Reason (Optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
          />
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={() => void handleReject()}>
              Confirm Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectFor(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <TimesheetBatchPreviewModal
        batch={previewFor}
        employeeLabel={previewFor ? employeeLabel(previewFor) : ''}
        busy={busyId === previewFor?.id}
        onClose={() => setPreviewFor(null)}
        onApprove={(id) => void handleApprove(id)}
        onReject={(batch) => {
          setPreviewFor(null);
          setRejectFor(batch);
          setRejectReason('');
        }}
      />
    </div>
  );
};

export default HrTimesheetsPage;
