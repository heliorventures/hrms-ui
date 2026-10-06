import type { CSSProperties } from 'react';

import type { HrLeaveCalendarQuery } from '../../../api/graphql/graphql';

import { hslForLeaveType } from './leaveCalendarModel';

export interface LeaveCalendarSlot {
  leaveTypeId: string;
  half: boolean;
  fromDate: string;
  toDate: string;
  status: string;
}
const LeaveCalendarDayCell = ({
  day,
  hol,
  slot,
  leaveTypes,
}: {
  day: string;
  hol: boolean;
  slot?: LeaveCalendarSlot;
  leaveTypes: HrLeaveCalendarQuery['leaveTypes'];
}) => {
  const lt = slot ? leaveTypes.find((t) => t.id === slot.leaveTypeId) : undefined;

  const typeLine = lt ? `${lt.name} (${lt.code})` : 'Leave';
  const rangeLine = slot != null ? `${slot.fromDate} → ${slot.toDate}` : '';
  const metaParts = [
    typeLine,
    rangeLine,
    slot?.half ? 'Half day' : null,
    slot ? `Status: ${slot.status}` : null,
    hol ? 'Public Holiday (same date)' : null,
  ].filter(Boolean);

  const style = calendarCellStyle(slot, hol);
  const title = calendarCellTitle(slot, hol, day, metaParts);
  return (
    <td
      className="h-6 cursor-default border border-gray-100 p-0 dark:border-gray-800"
      style={style}
      title={title}
      aria-label={`${day} · ${title || 'No approved leave'}`}
    />
  );
};

const calendarCellStyle = (slot: LeaveCalendarSlot | undefined, hol: boolean): CSSProperties => {
  const style: CSSProperties = {};
  if (slot && hol) {
    const color = hslForLeaveType(slot.leaveTypeId);
    style.background = `linear-gradient(135deg, ${color} 52%, rgb(148 163 184 / 0.72) 52%)`;
  } else if (slot) {
    style.backgroundColor = hslForLeaveType(slot.leaveTypeId);
    if (slot.half) style.opacity = 0.62;
  } else if (hol) {
    style.backgroundColor = 'rgb(148 163 184 / 0.42)';
  }

  return style;
};
const calendarCellTitle = (
  slot: LeaveCalendarSlot | undefined,
  hol: boolean,
  day: string,
  parts: (string | null)[]
) => {
  if (slot) return parts.join(' · ');
  return hol ? `Public Holiday · ${day}` : '';
};
export default LeaveCalendarDayCell;
