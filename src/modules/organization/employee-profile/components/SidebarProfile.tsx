import { Calendar, Building2, User } from 'lucide-react';

import type { EmployeeProfileModel } from '../types';
import { EmploymentStatusBadge } from './StatusBadge';
import { formatCompactDate } from '../lib/masking';

interface SidebarProfileProps {
  model: EmployeeProfileModel;
}

function initials(fullName: string): string {
  const p = fullName.trim().split(/\s+/);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function SidebarProfile({ model }: SidebarProfileProps) {
  const { core, statusUi, roleAssignment } = model;
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/60 lg:sticky lg:top-4 lg:self-start">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-semibold text-white shadow-md"
          aria-hidden
        >
          {initials(core.fullName)}
        </div>
        <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {core.fullName}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {roleAssignment.designation}
        </p>
        <div className="mt-2">
          <EmploymentStatusBadge status={statusUi} />
        </div>
      </div>

      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-left text-sm dark:border-slate-800">
        <li className="flex gap-2">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Department</p>
            <p className="text-slate-800 dark:text-slate-200">{roleAssignment.department}</p>
          </div>
        </li>
        <li className="flex gap-2">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Join date</p>
            <p className="text-slate-800 dark:text-slate-200">
              {formatCompactDate(core.dateOfJoining)}
            </p>
          </div>
        </li>
        <li className="flex gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Employee code</p>
            <p className="font-mono text-xs text-slate-800 dark:text-slate-200">
              {core.employeeCode}
            </p>
          </div>
        </li>
      </ul>
    </aside>
  );
}
