import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ApproveTimesheetWeekBatchDocument,
  OrgChartDocument,
  RejectTimesheetWeekBatchDocument,
  TimesheetWeekBatchesDocument,
  type OrgChartQuery,
} from '../../api/graphql/graphql';

type BatchRow = {
  id: string;
  employeeId: string;
  weekStartDate: string;
  status: string;
  submittedAt?: string | null;
  workflowInstanceId?: string | null;
};

const HrTimesheetsPage = () => {
  const client = useGraphClient('client');
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [orgLabels, setOrgLabels] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectFor, setRejectFor] = useState<BatchRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadOrg = useCallback(async () => {
    const r = await client.request<OrgChartQuery>(OrgChartDocument, { limit: 500 });
    const m = new Map<string, string>();
    for (const row of r.orgChart ?? []) {
      const label = `${row.fullName}${row.employeeCode ? ` (${row.employeeCode})` : ''}`;
      m.set(row.employeeId, label);
    }
    setOrgLabels(m);
  }, [client]);

  const loadBatches = useCallback(async () => {
    const r = await client.request(TimesheetWeekBatchesDocument, {
      ...(filter === 'pending' ? { status: 'PENDING' } : {}),
      limit: 80,
    });
    const rows = (r.timesheetWeekBatches ?? []) as BatchRow[];
    setBatches(rows);
  }, [client, filter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadOrg(), loadBatches()]);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load timesheet approvals');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOrg, loadBatches]);

  const silentRefresh = useCallback(async () => {
    try {
      await loadBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    }
  }, [loadBatches]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await client.request(ApproveTimesheetWeekBatchDocument, { id });
      await silentRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectFor) return;
    setBusyId(rejectFor.id);
    setError(null);
    try {
      await client.request(RejectTimesheetWeekBatchDocument, {
        id: rejectFor.id,
        rejectionReason: rejectReason.trim() || null,
      });
      setRejectFor(null);
      setRejectReason('');
      await silentRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  const filterTabs = useMemo(
    () =>
      (
        [
          { key: 'pending' as const, label: 'Pending' },
          { key: 'all' as const, label: 'All statuses' },
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheet approvals</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Weekly batches submitted by employees in your scope (same permission model as leave
          approvals — workflow steps may still apply).
        </p>
      </div>

      <Card title="Queue">
        <div className="mb-4 flex flex-wrap items-center gap-2">{filterTabs}</div>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
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
                render: (row: BatchRow) =>
                  orgLabels.get(row.employeeId) ?? row.employeeId.slice(0, 8),
              },
              {
                key: 'week',
                label: 'Week starts',
                render: (row: BatchRow) => row.weekStartDate,
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: BatchRow) => <Badge variant="info">{row.status}</Badge>,
              },
              {
                key: 'wf',
                label: 'Workflow',
                render: (row: BatchRow) => row.workflowInstanceId ?? '—',
              },
              {
                key: 'actions',
                label: '',
                render: (row: BatchRow) =>
                  row.status?.toUpperCase() === 'PENDING' ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        className="!py-1 !text-xs"
                        disabled={busyId === row.id}
                        onClick={() => void handleApprove(row.id)}
                      >
                        {busyId === row.id ? '…' : 'Approve'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="!py-1 !text-xs"
                        disabled={busyId === row.id}
                        onClick={() => {
                          setRejectFor(row);
                          setRejectReason('');
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    '—'
                  ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No batches in this filter.</p>
        )}
      </Card>

      <Modal
        isOpen={!!rejectFor}
        onClose={() => setRejectFor(null)}
        title="Reject timesheet week"
      >
        <div className="space-y-3">
          <Input
            label="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
          />
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={() => void handleReject()}>
              Confirm reject
            </Button>
            <Button type="button" variant="outline" onClick={() => setRejectFor(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HrTimesheetsPage;
