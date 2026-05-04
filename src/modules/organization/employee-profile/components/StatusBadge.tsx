import type { DocumentApprovalStatus, EmploymentStatusUi, VerificationStatus } from '../types';

const employmentLabels: Record<EmploymentStatusUi, string> = {
  ACTIVE: 'Active',
  TERMINATED: 'Terminated',
  ON_LEAVE: 'On Leave',
  SUSPENDED: 'Suspended',
};

const employmentStyles: Record<EmploymentStatusUi, string> = {
  ACTIVE:
    'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30',
  TERMINATED: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300',
  ON_LEAVE:
    'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200',
  SUSPENDED:
    'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300',
};

export function EmploymentStatusBadge({ status }: { status: EmploymentStatusUi }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${employmentStyles[status]}`}
    >
      {employmentLabels[status]}
    </span>
  );
}

const verifyStyles: Record<VerificationStatus, string> = {
  VERIFIED:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  PENDING:
    'bg-amber-500/10 text-amber-800 dark:text-amber-200',
  UNVERIFIED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  REJECTED: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${verifyStyles[status]}`}
    >
      {status.toLowerCase().replace('_', ' ')}
    </span>
  );
}

const docStyles: Record<DocumentApprovalStatus, string> = {
  APPROVED:
    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  PENDING:
    'bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-200',
  REJECTED: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
};

export function DocumentStatusBadge({ status }: { status: DocumentApprovalStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${docStyles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
