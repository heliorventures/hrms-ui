import { useCallback, useEffect, useRef } from 'react';

import { AttendancePunchDaySummaryDocument } from '../../../api/attendance/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery } from '../../../hooks/useRetainedQuery';
import { formatTenantTime } from '../../../utils/tenantTime';

import type { AttendanceRow, Summary } from './attendanceSummaryTypes';

export type PunchGraphClient = ReturnType<typeof useGraphClient>;

export function displayAttendanceRow(row: AttendanceRow, timezone: string): AttendanceRow {
  return {
    ...row,
    checkInTime: row.checkInAt ? formatTenantTime(row.checkInAt, timezone) : row.checkInTime,
    checkOutTime: row.checkOutAt ? formatTenantTime(row.checkOutAt, timezone) : row.checkOutTime,
  };
}

function validateCurrentSummary(summary: Summary): void {
  const startsAt = Date.parse(summary.startsAt);
  const endsAt = Date.parse(summary.endsAt);
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || startsAt >= endsAt) {
    throw new Error('Attendance summary returned an invalid attendance day window.');
  }
  if (Date.now() < startsAt || Date.now() >= endsAt) {
    throw new Error('Attendance summary is outside the current attendance day. Refresh it.');
  }
}

export function usePunchDaySummary(client: PunchGraphClient, identity: string) {
  const loadSummary = useCallback(async () => {
    void identity;
    const result = await client.request<{ punchDaySummary: Summary }>(
      AttendancePunchDaySummaryDocument
    );
    validateCurrentSummary(result.punchDaySummary);
    const { punchDaySummary } = result;
    return {
      ...punchDaySummary,
      segments: punchDaySummary.segments.map((row) =>
        displayAttendanceRow(row, punchDaySummary.timezone)
      ),
      openSegment: punchDaySummary.openSegment
        ? displayAttendanceRow(punchDaySummary.openSegment, punchDaySummary.timezone)
        : null,
    };
  }, [client, identity]);
  const { data, error, phase, refresh } = useRetainedQuery(loadSummary);
  const refreshedBoundary = useRef<string | null>(null);
  const resumeInFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const endsAt = data?.endsAt;
    if (!endsAt) return;
    const refreshBoundary = () => {
      if (refreshedBoundary.current === endsAt) return;
      refreshedBoundary.current = endsAt;
      void refresh();
    };
    const delay = Date.parse(endsAt) - Date.now();
    if (delay <= 0) {
      refreshBoundary();
      return;
    }
    const timer = window.setTimeout(refreshBoundary, Math.min(delay, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [data?.endsAt, refresh]);

  useEffect(() => {
    const resume = () => {
      if (resumeInFlight.current) return;
      const request = refresh();
      resumeInFlight.current = request;
      void request.finally(() => {
        if (resumeInFlight.current === request) resumeInFlight.current = null;
      });
    };
    const visible = () => {
      if (document.visibilityState === 'visible') resume();
    };
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [refresh]);

  return { data, error, phase, refresh };
}
