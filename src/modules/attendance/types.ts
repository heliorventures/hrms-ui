import type { MyAttendanceBoardQuery } from '../../api/graphql/graphql';

export interface ShiftRow {
  id: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  workHours?: number | null;
  isNightShift: boolean;
}

export interface AttendanceRow {
  id: string;
  employeeId: string;
  workDate: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInLat?: string | null;
  checkInLng?: string | null;
  checkOutLat?: string | null;
  checkOutLng?: string | null;
  status?: string | null;
  source?: string | null;
  lateMinutes?: number | null;
}

export interface FlatSegmentRow extends AttendanceRow {
  segmentMinutes: number | null;
}

export interface AttendanceBoardData {
  shifts: ShiftRow[];
  attendance: AttendanceRow[];
  pageInfo: AttendancePageInfo;
}

export interface AttendancePageInfo {
  endCursor?: string | null;
  hasNextPage: boolean;
}

/**
 * Converts the target-free GraphQL response into the employee attendance page model.
 * The server is the authorization boundary; this additional check prevents a malformed
 * client response from rendering another employee's rows.
 */
export function mapMyAttendanceBoard(
  response: MyAttendanceBoardQuery,
  employeeId: string | undefined
): AttendanceBoardData {
  const attendance = employeeId
    ? response.myAttendance.edges
        .map((edge) => edge.node)
        .filter((row) => row.employeeId === employeeId)
    : [];

  return {
    shifts: response.shifts,
    attendance,
    pageInfo: response.myAttendance.pageInfo,
  };
}
