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
}
