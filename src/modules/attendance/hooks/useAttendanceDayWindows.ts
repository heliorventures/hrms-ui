import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AttendanceCorrectionWindowsDocument,
  AttendanceCurrentDayWindowDocument,
  type AttendanceCorrectionWindowsQuery,
  type AttendanceCurrentDayWindowQuery,
} from '../../../api/attendance/graphql';
import type { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery } from '../../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

type GraphClient = ReturnType<typeof useGraphClient>;

type CurrentWindow = AttendanceCurrentDayWindowQuery['attendanceDayWindow'];

function validateCurrentWindow(window: CurrentWindow): void {
  const startsAt = Date.parse(window.startsAt);
  const endsAt = Date.parse(window.endsAt);
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || startsAt >= endsAt) {
    throw new Error('Attendance day window response was invalid.');
  }
  if (Date.now() < startsAt || Date.now() >= endsAt) {
    throw new Error('Attendance day window response was outside the current attendance day.');
  }
}

export function useCurrentAttendanceDayWindow(client: GraphClient, identity: string) {
  const load = useCallback(async () => {
    void identity;
    const result = (await client.request<AttendanceCurrentDayWindowQuery>(
      AttendanceCurrentDayWindowDocument
    )) as Partial<AttendanceCurrentDayWindowQuery>;
    if (!result.attendanceDayWindow) {
      throw new Error('Attendance day window response was incomplete.');
    }
    validateCurrentWindow(result.attendanceDayWindow);
    return result.attendanceDayWindow;
  }, [client, identity]);
  const { data, error, phase, refresh } = useRetainedQuery(load);
  const refreshedBoundary = useRef<string | null>(null);
  const resumeInFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    refreshedBoundary.current = null;
    resumeInFlight.current = null;
  }, [client, identity]);

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

  const dataIsCurrent = Boolean(
    phase === 'ready' &&
    data &&
    Date.now() >= Date.parse(data.startsAt) &&
    Date.now() < Date.parse(data.endsAt)
  );
  return { data: dataIsCurrent ? data : null, error, phase, refresh };
}

interface CorrectionWindowsState {
  client: GraphClient;
  workDate: string;
  data: AttendanceCorrectionWindowsQuery | null;
  error: string | null;
  loading: boolean;
}

export function useAttendanceCorrectionWindows(
  client: GraphClient,
  isOpen: boolean,
  workDate: string
) {
  const generation = useRef(0);
  const mounted = useRef(false);
  const [state, setState] = useState<CorrectionWindowsState>({
    client,
    workDate,
    data: null,
    error: null,
    loading: isOpen,
  });
  const refresh = useCallback(async () => {
    if (!isOpen || !workDate) return;
    const request = ++generation.current;
    setState({ client, workDate, data: null, error: null, loading: true });
    try {
      const data = (await client.request<AttendanceCorrectionWindowsQuery>(
        AttendanceCorrectionWindowsDocument,
        { workDate }
      )) as Partial<AttendanceCorrectionWindowsQuery>;
      if (!data.currentWindow || !data.selectedWindow) {
        throw new Error('Attendance day window response was incomplete.');
      }
      if (mounted.current && generation.current === request) {
        setState({
          client,
          workDate,
          data: data as AttendanceCorrectionWindowsQuery,
          error: null,
          loading: false,
        });
      }
    } catch (error) {
      if (mounted.current && generation.current === request) {
        setState({
          client,
          workDate,
          data: null,
          error: graphQlUserMessage(error),
          loading: false,
        });
      }
    }
  }, [client, isOpen, workDate]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      generation.current += 1;
    };
  }, [refresh]);

  const visible =
    state.client === client && state.workDate === workDate
      ? state
      : { client, workDate, data: null, error: null, loading: isOpen };
  return { ...visible, refresh };
}
