import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmployeeHeaderProps {
  employeeName: string;
  employeeCode: string;
  actions?: ReactNode;
  embedded?: boolean;
}

export function EmployeeHeader({
  employeeName,
  employeeCode,
  actions,
  embedded,
}: EmployeeHeaderProps) {
  const Heading = embedded ? 'h2' : 'h1';
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/organization/employees"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            People
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          <span className="text-slate-600 dark:text-slate-300">Employee profile</span>
        </nav>
        <Heading className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {employeeName}
        </Heading>
        <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
          {employeeCode}
        </p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
