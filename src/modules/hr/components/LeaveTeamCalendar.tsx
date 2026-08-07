import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { HrLeaveCalendarDocument, type HrLeaveCalendarQuery } from '../../../api/graphql/graphql';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

const MAX_EMPLOYEES = 45;

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function monthRange(year: number, month: number): { days: string[] } {
  const last = new Date(year, month + 1, 0).getDate();
  const days: string[] = [];
  for (let d = 1; d <= last; d++) {
    days.push(`${year}-${pad2(month + 1)}-${pad2(d)}`);
  }
  return { days };
}

function hslForLeaveType(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 62% 42%)`;
}

function parseIsoDate(s: unknown): string {
  return String(s).slice(0, 10);
}

function eachDayInclusive(from: string, to: string): Set<string> {
  const out = new Set<string>();
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const a = new Date(fy, fm - 1, fd);
  const b = new Date(ty, tm - 1, td);
  const cur = new Date(a);
  while (cur <= b) {
    out.add(`${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

interface LeaveTeamCalendarProps {
  enabled?: boolean;
}

const LeaveTeamCalendar = ({ enabled = true }: LeaveTeamCalendarProps) => {
  const client = useGraphClient('client');
  const anchorYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [data, setData] = useState<HrLeaveCalendarQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { days: monthDays } = useMemo(() => monthRange(year, month), [year, month]);
  const monthPrefix = `${year}-${pad2(month + 1)}`;

  const load = useCallback(async () => {
    const r = await client.request<HrLeaveCalendarQuery>(HrLeaveCalendarDocument, {
      reqLim: 400,
      orgLim: 500,
      typeLim: 80,
      holidayFrom: `${year}-01-01`,
      holidayLimit: 450,
    });
    setData(r);
  }, [client, year]);

  useEffect(() => {
    if (!enabled) return;
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [enabled, load]);

  const goPrevMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

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
    for (const req of data?.leaveRequests ?? []) {
      const st = req.status.toLowerCase();
      if (st !== 'approved' && st !== 'approve') continue;
      const from = parseIsoDate(req.fromDate);
      const to = parseIsoDate(req.toDate);
      const span = eachDayInclusive(from, to);
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

  const yearChoices = useMemo(() => {
    const ys = new Set<number>();
    for (let y = anchorYear - 2; y <= anchorYear + 2; y++) ys.add(y);
    ys.add(year);
    return [...ys].sort((a, b) => a - b);
  }, [anchorYear, year]);

  return (
    <Card
      title={
        <span className="flex flex-wrap items-center justify-between gap-3">
          <span>Team leave calendar</span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-normal">
            <button
              type="button"
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600"
              onClick={goPrevMonth}
              aria-label="Previous month"
            >
              ←
            </button>
            <label className="flex items-center gap-1">
              <span className="sr-only">Month</span>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="max-w-[9rem] rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {MONTH_LABELS.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1">
              <span className="sr-only">Year</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600"
              onClick={goNextMonth}
              aria-label="Next month"
            >
              →
            </button>
            <Button
              variant="outline"
              type="button"
              className="!py-1 !text-xs"
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </span>
      }
    >
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Approved leave only. Each column is a day; holidays are slate-tinted; leave types use distinct colors (legend below).
      </p>
      {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading && !data ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto pb-2">
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
                    {emp.fullName || emp.employeeCode || emp.employeeId.slice(0, 8)}
                  </td>
                  {monthDays.map((day) => {
                    const hol = holidaysInMonth.has(day);
                    const slot = approvedByEmployeeDay.get(emp.employeeId)?.get(day);
                    const lt = slot ? leaveTypes.find((t) => t.id === slot.leaveTypeId) : undefined;

                    let style: CSSProperties = {};
                    let title = '';

                    const typeLine = lt ? `${lt.name} (${lt.code})` : 'Leave';
                    const rangeLine =
                      slot != null ? `${slot.fromDate} → ${slot.toDate}` : '';
                    const metaParts = [
                      typeLine,
                      rangeLine,
                      slot?.half ? 'Half day' : null,
                      slot ? `Status: ${slot.status}` : null,
                      hol ? 'Public holiday (same date)' : null,
                    ].filter(Boolean);

                    if (slot && hol) {
                      const color = hslForLeaveType(slot.leaveTypeId);
                      style.background = `linear-gradient(135deg, ${color} 52%, rgb(148 163 184 / 0.72) 52%)`;
                      title = metaParts.join(' · ');
                    } else if (slot) {
                      style.backgroundColor = hslForLeaveType(slot.leaveTypeId);
                      if (slot.half) style.opacity = 0.62;
                      title = metaParts.join(' · ');
                    } else if (hol) {
                      style.backgroundColor = 'rgb(148 163 184 / 0.42)';
                      title = ['Public holiday', day].join(' · ');
                    }

                    return (
                      <td
                        key={day}
                        className="h-6 cursor-default border border-gray-100 p-0 dark:border-gray-800"
                        style={style}
                        title={title}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded bg-slate-400/50 dark:bg-slate-500/40" /> Holiday
        </span>
        {leaveTypes.slice(0, 12).map((t) => (
          <span key={t.id} className="flex items-center gap-1">
            <span className="inline-block h-3 w-5 rounded" style={{ backgroundColor: hslForLeaveType(t.id) }} />
            {t.code}
          </span>
        ))}
      </div>
    </Card>
  );
};

export default LeaveTeamCalendar;
