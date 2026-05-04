import { Briefcase } from 'lucide-react';

import type { EmployeeProfileModel } from '../types';
import { formatCompactDate } from '../lib/masking';

interface WorkExperienceTabProps {
  model: EmployeeProfileModel;
}

export function WorkExperienceTab({ model }: WorkExperienceTabProps) {
  return (
    <ol className="relative space-y-0 border-l border-slate-200 pl-6 dark:border-slate-700">
      {model.workExperience.map((wx) => (
        <li key={wx.id} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
              wx.isCurrent ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-start gap-2">
              <Briefcase className="mt-0.5 h-4 w-4 text-indigo-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {wx.role}
                  </h3>
                  {wx.isCurrent ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{wx.company}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCompactDate(wx.startDate)} —{' '}
                  {wx.endDate ? formatCompactDate(wx.endDate) : 'Present'}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {wx.description}
                </p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
