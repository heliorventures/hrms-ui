import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../../components/common/Button';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery } from '../../../hooks/useRetainedQuery';

const RECENT_LEAVE = `query HomeRecentLeave {
  viewerEmployeeId
  pagedLeaveRequests(limit: 20, offset: 0) {
    id employeeId leaveTypeId fromDate toDate status pendingApprovalStage appliedAt
  }
  leaveTypes(limit: 50) { id name }
}`;

interface Result {
  viewerEmployeeId: string | null;
  pagedLeaveRequests: {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    status: string;
    pendingApprovalStage?: string | null;
    appliedAt: string;
  }[];
  leaveTypes: { id: string; name: string }[];
}

const RecentLeaveRequest = () => {
  const client = useGraphClient('client');
  const load = useCallback(() => client.request<Result>(RECENT_LEAVE), [client]);
  const { data, error, phase, refresh } = useRetainedQuery(load);
  const request = data?.pagedLeaveRequests
    .filter((row) => row.employeeId === data.viewerEmployeeId)
    .sort((left, right) => right.appliedAt.localeCompare(left.appliedAt))[0];
  if (phase === 'initial-loading')
    return (
      <p role="status" className="text-sm text-content-muted">
        Loading request status…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 text-sm text-content-secondary"
      >
        <p>Request status could not be refreshed.</p>
        <Button variant="quiet" size="sm" onClick={() => void refresh()}>
          Try again
        </Button>
      </div>
    );
  if (!request) return null;
  return (
    <section
      aria-label="Recent leave request"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-selected p-5"
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">
          {data?.leaveTypes.find((type) => type.id === request.leaveTypeId)?.name ?? 'Leave'} ·{' '}
          {request.fromDate} – {request.toDate}
        </h2>
        <p className="mt-1 text-sm text-content-secondary">
          {request.status}
          {request.pendingApprovalStage ? ` · Awaiting ${request.pendingApprovalStage}` : ''}
        </p>
        {phase === 'refreshing' ? (
          <p role="status" className="text-xs text-content-muted">
            Refreshing status…
          </p>
        ) : null}
      </div>
      <Link
        to="/leave"
        className="inline-flex min-h-11 items-center rounded-lg bg-surface px-4 text-sm font-medium text-accent focus-visible:ring-2 focus-visible:ring-focus"
      >
        View my requests →
      </Link>
    </section>
  );
};

export default RecentLeaveRequest;
