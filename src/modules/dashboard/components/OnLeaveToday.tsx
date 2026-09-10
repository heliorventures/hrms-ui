import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { OnLeaveTodayDocument, type OnLeaveTodayQuery } from '../../../api/graphql/graphql';
import AsyncState from '../../../components/common/AsyncState';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useAnchoredPopoverPosition } from '../../../components/common/useAnchoredPopoverPosition';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';
import { toIsoDate } from '../../../utils/calendarRange';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

const LEAVE_REQUEST_LIMIT = 50;
const LEAVE_TYPE_LIMIT = 50;

type LeavePerson = OnLeaveTodayQuery['leaveRequests'][number];
type LeavePayload = OnLeaveTodayQuery;
const selectOnLeaveToday = (payload: LeavePayload | null, today: string) =>
  (payload?.leaveRequests ?? []).filter((leave) => {
    const status = leave.status.toLowerCase();
    const approved = status === 'approved' || status === 'approve';
    const from = String(leave.fromDate).slice(0, 10);
    const to = String(leave.toDate).slice(0, 10);
    return approved && from <= today && to >= today;
  });

interface OnLeaveTodayFooterProps {
  hasData: boolean;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
}

const OnLeaveTodayFooter = ({ hasData, onRefresh, phase }: OnLeaveTodayFooterProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
    {hasData ? (
      <Button
        variant="quiet"
        size="sm"
        busy={phase === 'refreshing'}
        busyLabel="Refreshing Leave Requests…"
        onClick={onRefresh}
      >
        Refresh Leave Requests
      </Button>
    ) : null}
    <Link
      to="/leave/team-calendar"
      className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
    >
      Show All on Calendar →
    </Link>
  </div>
);

const LeaveChip = ({ name }: { name: string }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const tooltipId = useId();
  const { style } = useAnchoredPopoverPosition({ open, triggerRef, panelRef, align: 'start' });
  const cancelClose = () => clearTimeout(closeTimer.current);
  const show = () => {
    cancelClose();
    setOpen(true);
  };
  const hideSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={name}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={show}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()}
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            style={style}
            onMouseEnter={cancelClose}
            onMouseLeave={hideSoon}
            className="fixed z-50 w-max max-w-xs break-words rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content-primary shadow-lg"
          >
            {name}
          </div>,
          document.body
        )}
    </>
  );
};
interface OnLeaveTodayListProps {
  capped: boolean;
  people: LeavePerson[];
}

const OnLeaveTodayList = ({ capped, people }: OnLeaveTodayListProps) => {
  if (people.length === 0 && capped) {
    return (
      <AsyncState
        kind="unavailable"
        title="No Approved Leave Is Shown in the Loaded Results."
        description="More may be available."
      />
    );
  }

  if (people.length === 0) {
    return (
      <AsyncState
        kind="empty"
        title="No One Is on Leave Today."
        description="Approved leave for today will appear here."
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {people.slice(0, 3).map((person) => (
        <LeaveChip key={person.id} name={(person.employeeName ?? 'Employee').trim()} />
      ))}
      {people.length > 3 ? (
        <p className="w-full text-xs text-content-muted">
          Showing 3 people. Open the calendar for more.
        </p>
      ) : null}
    </div>
  );
};

interface OnLeaveTodayCapsProps {
  payload: LeavePayload;
  requestsCapped: boolean;
}

const OnLeaveTodayCaps = ({ payload, requestsCapped }: OnLeaveTodayCapsProps) => (
  <>
    {requestsCapped ? (
      <p role="status" className="mt-3 text-xs text-content-secondary">
        Showing up to {LEAVE_REQUEST_LIMIT} leave requests. More may be available.
      </p>
    ) : null}
    {payload.leaveTypes.length === LEAVE_TYPE_LIMIT ? (
      <p role="status" className="mt-2 text-xs text-content-secondary">
        Showing up to {LEAVE_TYPE_LIMIT} leave types. More may be available.
      </p>
    ) : null}
  </>
);

const OnLeaveToday = () => {
  const client = useGraphClient('client');
  const today = toIsoDate(new Date());
  const loadLeaveRequests = useCallback(
    () =>
      client.request<OnLeaveTodayQuery>(OnLeaveTodayDocument, {
        limit: LEAVE_REQUEST_LIMIT,
        typeLim: LEAVE_TYPE_LIMIT,
        today,
      }),
    [client, today]
  );
  const { data: payload, error, phase, refresh } = useRetainedQuery(loadLeaveRequests);
  const onLeaveToday = useMemo(() => selectOnLeaveToday(payload, today), [payload, today]);
  const hasMissingEmployeeLabels = onLeaveToday.some((person) => !person.employeeName?.trim());
  const leaveRequestsMayBeCapped = payload?.leaveRequests.length === LEAVE_REQUEST_LIMIT;
  const onRefresh = () => void refresh();

  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <Card title="On Leave Today">
        <DashboardCardInitialState
          phase={phase}
          loadingTitle="Loading Leave Requests…"
          errorTitle="Leave Requests Could Not Be Loaded"
          error={error}
          onRetry={onRefresh}
        />
        <OnLeaveTodayFooter hasData={false} phase={phase} onRefresh={onRefresh} />
      </Card>
    );
  }

  if (!payload) return null;

  return (
    <Card title="On Leave Today">
      <DashboardCardRefreshNotice
        phase={phase}
        loadingTitle="Refreshing Leave Requests…"
        loadingDescription="Showing the last loaded leave list while this updates."
        staleTitle="Leave Requests May Be Out of Date"
        staleDescription="Showing the last loaded leave list."
        error={error}
        onRetry={onRefresh}
      />
      {hasMissingEmployeeLabels ? (
        <AsyncState
          kind="unavailable"
          title="Employee Details Could Not Be Loaded."
          description="Refresh the leave list. If the issue continues, ask an administrator to verify employee records."
        />
      ) : (
        <OnLeaveTodayList capped={leaveRequestsMayBeCapped} people={onLeaveToday} />
      )}
      <OnLeaveTodayCaps payload={payload} requestsCapped={leaveRequestsMayBeCapped} />
      <OnLeaveTodayFooter hasData phase={phase} onRefresh={onRefresh} />
    </Card>
  );
};

export default OnLeaveToday;
