import { useEffect, useRef, useState } from 'react';

import type { LeaveRequestsTableSectionProps } from '../../leave/components/LeaveRequestsTableSection';

import LeaveRequestReviewDetails from './LeaveRequestReviewDetails';

const LeaveApprovalReview = (props: LeaveRequestsTableSectionProps) => {
  const { rows, employeeLabel, leaveTypeNameById, viewerId } = props;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const selectRequest = (id: string) => {
    setSelectedId(id);
    requestAnimationFrame(() => {
      detailRef.current?.focus();
      detailRef.current?.scrollIntoView({ block: 'nearest' });
    });
  };
  const queueRef = useRef<HTMLHeadingElement>(null);
  const selected = selectedId ? rows.find((row) => row.id === selectedId) : rows[0];
  useEffect(() => {
    if (!selectedId || rows.some((row) => row.id === selectedId)) return;
    setSelectedId(null);
    if (!document.querySelector('[aria-modal="true"]')) queueRef.current?.focus();
  }, [rows, selectedId]);
  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <div className="min-w-0 space-y-3">
        <h3
          ref={queueRef}
          tabIndex={-1}
          className="text-sm font-medium text-content-secondary focus-visible:ring-2 focus-visible:ring-focus"
        >
          Requests
        </h3>
        {!rows.length ? <p className="text-sm text-content-secondary">{props.emptyLabel}</p> : null}
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-pressed={selected?.id === row.id}
                aria-controls="leave-request-review"
                onClick={() => selectRequest(row.id)}
                className={`w-full rounded-xl border p-4 text-left focus-visible:ring-2 focus-visible:ring-focus ${selected?.id === row.id ? 'border-accent bg-surface-selected' : 'border-line bg-surface hover:border-accent'}`}
              >
                <span className="block break-words text-base font-semibold">
                  {employeeLabel?.(row.employeeId) ?? row.employeeName ?? 'Employee'}
                </span>
                <span className="mt-2 block text-sm text-content-secondary">
                  {leaveTypeNameById.get(row.leaveTypeId) ?? 'Leave'} · {row.daysRequested} days
                </span>
                <span className="mt-1 block text-sm text-content-secondary">
                  {row.fromDate} – {row.toDate}
                </span>
                <span className="mt-2 block text-xs text-content-muted">
                  {row.employeeId === viewerId ? 'Your request · ' : ''}
                  {row.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <section
        ref={detailRef}
        tabIndex={-1}
        id="leave-request-review"
        aria-label="Selected leave request"
        className="min-w-0 rounded-xl border border-line bg-surface p-5"
      >
        {selected ? (
          <LeaveRequestReviewDetails
            {...props}
            row={selected}
            onBack={() => queueRef.current?.focus()}
          />
        ) : (
          <p className="text-sm text-content-secondary">Select a request to review its details.</p>
        )}
      </section>
    </div>
  );
};

export default LeaveApprovalReview;
