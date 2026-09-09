export type AttendanceRow = {
  id: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInLat?: string | null;
  checkInLng?: string | null;
  checkOutLat?: string | null;
  checkOutLng?: string | null;
  source?: string | null;
  status?: string | null;
};

export type Summary = {
  workDate: string;
  totalWorkedMinutes: number;
  openSegment: AttendanceRow | null;
  segments: AttendanceRow[];
};
