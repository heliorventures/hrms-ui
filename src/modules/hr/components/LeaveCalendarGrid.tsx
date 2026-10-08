import { useMemo } from 'react';

import type { HrLeaveCalendarQuery } from '../../../api/graphql/graphql';

import LeaveCalendarDayCell from './LeaveCalendarDayCell';
import {
  MAX_EMPLOYEES,
  parseIsoDate,
  eachDayInclusive,
  hslForLeaveType,
} from './leaveCalendarModel';

const useCalendarGrid = (data: HrLeaveCalendarQuery | null, monthPrefix: string) => {
  const holidaysInMonth = useMemo(() => {
    const set = new Set<string>();
    for (const h of data?.upcomingHolidays ?? []) {
      const d = parseIsoDate(h.holidayDate);
      if (d.startsWith(monthPrefix)) set.add(d);
    }
    return set;
  }, [data?.upcomingHolidays, monthPrefix]);

  const approvedByEmployeeDay = useMemo(() => {
    const map = new Map<
      string,
      Map<
        string,
        { leaveTypeId: string; half: boolean; fromDate: string; toDate: string; status: string }
      >
    >();
    const firstDay = `${monthPrefix}-01`;
    const [year, month] = monthPrefix.split('-').map(Number);
    const lastDay = `${monthPrefix}-${new Date(year, month, 0).getDate()}`;
    for (const req of data?.leaveRequests ?? []) {
      const st = req.status.toLowerCase();
      if (st !== 'approved' && st !== 'approve') continue;
      const from = parseIsoDate(req.fromDate);
      const to = parseIsoDate(req.toDate);
      const span = eachDayInclusive(from < firstDay ? firstDay : from, to > lastDay ? lastDay : to);
      for (const day of span) {
        if (!day.startsWith(monthPrefix)) continue;
        let inner = map.get(req.employeeId);
        if (!inner) {
          inner = new Map();
          map.set(req.employeeId, inner);
        }
        inner.set(day, {
          leaveTypeId: req.leaveTypeId,
          half: !!req.isHalfDay,
          fromDate: from,
          toDate: to,
          status: req.status,
        });
      }
    }
    return map;
  }, [data?.leaveRequests, monthPrefix]);

  const employees = useMemo(() => {
    const rows = [...(data?.orgChart ?? [])];
    rows.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const withLeave = new Set(approvedByEmployeeDay.keys());
    const prioritized = [
      ...rows.filter((r) => withLeave.has(r.employeeId)),
      ...rows.filter((r) => !withLeave.has(r.employeeId)),
    ];
    return prioritized.slice(0, MAX_EMPLOYEES);
  }, [data?.orgChart, approvedByEmployeeDay]);

  const leaveTypes = data?.leaveTypes ?? [];

  return { holidaysInMonth, approvedByEmployeeDay, employees, leaveTypes };
};
const LeaveCalendarGrid = ({
  data,
  monthDays,
  monthPrefix,
}: {
  data: HrLeaveCalendarQuery | null;
  monthDays: string[];
  monthPrefix: string;
}) => {
  const { holidaysInMonth, approvedByEmployeeDay, employees, leaveTypes } = useCalendarGrid(
    data,
    monthPrefix
  );
  return (
    <>
      <div className="overflow-x-auto pb-2" data-tour-anchor="leave.team-calendar-grid">
        <table className="border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[140px] border border-gray-200 bg-white px-2 py-1 text-left dark:border-gray-700 dark:bg-gray-900">
                Employee
              </th>
              {monthDays.map((d) => (
                <th
                  key={d}
                  className="min-w-[22px] border border-gray-100 px-0 py-1 text-center font-normal text-gray-500 dark:border-gray-800"
                  title={d}
                >
                  {Number(d.slice(8, 10))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.employeeId}>
                <td className="sticky left-0 z-10 max-w-[200px] truncate border border-gray-200 bg-white px-2 py-0.5 dark:border-gray-700 dark:bg-gray-900">
                  {emp.fullName || emp.employeeCode || 'Employee details unavailable'}
                </td>
                {monthDays.map((day) => (
                  <LeaveCalendarDayCell
                    key={day}
                    day={day}
                    hol={holidaysInMonth.has(day)}
                    slot={approvedByEmployeeDay.get(emp.employeeId)?.get(day)}
                    leaveTypes={leaveTypes}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded bg-slate-400/50 dark:bg-slate-500/40" />{' '}
          Holiday
        </span>
        {leaveTypes.slice(0, 12).map((t) => (
          <span key={t.id} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-5 rounded"
              style={{ backgroundColor: hslForLeaveType(t.id) }}
            />
            {t.code}
          </span>
        ))}
      </div>
      {(data?.orgChart.length ?? 0) > MAX_EMPLOYEES && (
        <p className="mt-2 text-xs text-content-secondary">
          Calendar shows up to {MAX_EMPLOYEES} employees, with approved leave first. Use the leave
          list to review all loaded requests.
        </p>
      )}
    </>
  );
};
export default LeaveCalendarGrid;
