import { useMemo } from 'react';
import type { AttendanceRecord } from '../../../types';
import { toDateInputValue } from '../../../utils/dateInput';

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  currentMonth: string; // YYYY-MM
}

const getStatusColor = (status: string, isSelected: boolean) => {
  if (isSelected) {
    return 'ring-2 ring-primary-600 dark:ring-primary-400 bg-primary-100 dark:bg-primary-900/50';
  }
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
    case 'half-day':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    case 'absent':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    case 'holiday':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
    case 'leave':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const AttendanceCalendar = ({
  attendance,
  selectedDate,
  onSelectDate,
  currentMonth,
}: AttendanceCalendarProps) => {
  const attendanceByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance.forEach((a) => map.set(a.date, a));
    return map;
  }, [attendance]);

  const { days } = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();

    const days: { date: string; isCurrentMonth: boolean; record?: AttendanceRecord }[] = [];

    // Previous month padding
    for (let i = 0; i < startPad; i++) {
      const d = new Date(year, month - 1, -startPad + i + 1);
      const date = toDateInputValue(d);
      days.push({
        date,
        isCurrentMonth: false,
        record: attendanceByDate.get(date),
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        record: attendanceByDate.get(dateStr),
      });
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month, i);
      const date = toDateInputValue(d);
      days.push({
        date,
        isCurrentMonth: false,
        record: attendanceByDate.get(date),
      });
    }

    return { days };
  }, [currentMonth, attendanceByDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, isCurrentMonth, record }) => {
          const status = record?.status ?? 'absent';
          const isSelected = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex min-h-[2.5rem] items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isCurrentMonth
                  ? getStatusColor(status, isSelected)
                  : 'text-gray-300 dark:text-gray-600'
              } ${!isCurrentMonth ? 'cursor-default' : 'hover:opacity-90 cursor-pointer'}`}
            >
              {new Date(date + 'T12:00:00').getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
