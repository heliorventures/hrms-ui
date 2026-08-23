import { useCallback, useEffect, useRef, useState } from 'react';

import { PunchDaySummaryDocument, PunchTodayDocument } from '../../../api/graphql/graphql';
import AsyncState from '../../../components/common/AsyncState';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageNotice from '../../../components/common/PageNotice';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatBackendTime } from '../../../utils/timeFormat';

import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

type AttendanceRow = {
  id: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInLat?: string | null;
  checkInLng?: string | null;
  checkOutLat?: string | null;
  checkOutLng?: string | null;
  source?: string | null;
  status?: string | null;
};

type Summary = {
  workDate: string;
  totalWorkedMinutes: number;
  openSegment: AttendanceRow | null;
  segments: AttendanceRow[];
};

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported in this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
}

function formatCoord(lat?: string | null, lng?: string | null) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return null;
  return `${lat}, ${lng}`;
}

type GraphClient = ReturnType<typeof useGraphClient>;

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const useDashboardCardClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
};

interface UsePunchMutationOptions {
  client: GraphClient;
  refreshSummary: () => Promise<void>;
  summary: Summary | null;
  summaryPhase: RetainedQueryPhase;
}

const usePunchMutation = ({
  client,
  refreshSummary,
  summary,
  summaryPhase,
}: UsePunchMutationOptions) => {
  const [lastPunch, setLastPunch] = useState<AttendanceRow | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [trackLocation, setTrackLocation] = useState(true);
  const submittingRef = useRef(false);

  const handlePunch = async () => {
    if (submittingRef.current || !summary || summaryPhase !== 'ready') return;
    submittingRef.current = true;
    setMutationError(null);
    setSubmitting(true);
    try {
      let input: { latitude: number; longitude: number } | null = null;
      if (trackLocation) {
        const position = await getCurrentPosition();
        input = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      }
      const result = await client.request<{ punchToday: AttendanceRow }>(PunchTodayDocument, {
        input,
      });
      setLastPunch(result.punchToday);
      await refreshSummary();
    } catch (error) {
      setMutationError(graphQlUserMessage(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return {
    handlePunch,
    lastPunch,
    mutationError,
    setTrackLocation,
    submitting,
    trackLocation,
  };
};

const getButtonLabel = (submitting: boolean, nextIsCheckIn: boolean) => {
  if (submitting) return 'Recording…';
  return nextIsCheckIn ? 'Punch In' : 'Punch Out';
};

const getLastEventCoords = (lastPunch: AttendanceRow | null) => {
  if (!lastPunch) return null;
  const checkOut = formatCoord(lastPunch.checkOutLat, lastPunch.checkOutLng);
  if (checkOut) return `Punch Out: ${checkOut}`;
  const checkIn = formatCoord(lastPunch.checkInLat, lastPunch.checkInLng);
  return checkIn ? `Punch In: ${checkIn}` : null;
};

interface AttendanceSegmentsProps {
  segments: AttendanceRow[];
}

const AttendanceSegments = ({ segments }: AttendanceSegmentsProps) => (
  <ul className="space-y-1 border-t border-gray-100 pt-2 text-gray-600 dark:border-gray-600 dark:text-gray-300">
    {segments.map((segment, index) => {
      const checkInCoords = formatCoord(segment.checkInLat, segment.checkInLng);
      const checkOutCoords = formatCoord(segment.checkOutLat, segment.checkOutLng);
      const checkOutTime = segment.checkOutTime ? formatBackendTime(segment.checkOutTime) : 'open';
      return (
        <li key={segment.id} className="text-xs">
          <div className="flex justify-between">
            <span>Segment {index + 1}</span>
            <span>
              {formatBackendTime(segment.checkInTime ?? null)} → {checkOutTime}
            </span>
          </div>
          {checkInCoords || checkOutCoords ? (
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
              In: {checkInCoords ?? '—'} · Out: {checkOutCoords ?? '—'}
            </p>
          ) : null}
        </li>
      );
    })}
  </ul>
);

interface AttendanceSummaryDetailsProps {
  summary: Summary;
}

const AttendanceSummaryDetails = ({ summary }: AttendanceSummaryDetailsProps) => (
  <div className="space-y-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 dark:text-white">Worked today (completed)</span>
      <span className="text-primary-600 dark:text-primary-400">
        {summary.totalWorkedMinutes} min
      </span>
    </div>
    {summary.segments.length > 0 ? <AttendanceSegments segments={summary.segments} /> : null}
    {summary.segments.length === 0 && !summary.openSegment ? (
      <AsyncState
        kind="empty"
        title="No Attendance Recorded Today."
        description="Use Punch In when you are ready to start tracking time."
      />
    ) : null}
    {summary.openSegment ? (
      <p className="text-xs text-amber-800 dark:text-amber-200">
        Open: checked in at {formatBackendTime(summary.openSegment.checkInTime)} — Select “Punch
        Out” to close this block.
      </p>
    ) : null}
  </div>
);

interface PunchSummaryContentProps {
  error: string | null;
  onRefresh: () => void;
  phase: RetainedQueryPhase;
  summary: Summary | null;
}

const PunchSummaryContent = ({ error, onRefresh, phase, summary }: PunchSummaryContentProps) => {
  if (phase === 'initial-loading' || phase === 'initial-error') {
    return (
      <DashboardCardInitialState
        phase={phase}
        loadingTitle="Loading Attendance Summary…"
        errorTitle="Attendance Summary Could Not Be Loaded"
        error={error}
        onRetry={onRefresh}
      />
    );
  }

  if (!summary) return null;

  return (
    <>
      <DashboardCardRefreshNotice
        phase={phase}
        loadingTitle="Refreshing Attendance Summary…"
        loadingDescription="Showing the last loaded attendance while this updates."
        staleTitle="Attendance Summary May Be Out of Date"
        staleDescription="Showing the last loaded attendance."
        error={error}
        onRetry={onRefresh}
      />
      <AttendanceSummaryDetails summary={summary} />
    </>
  );
};

interface LastPunchDetailsProps {
  lastEventCoords: string | null;
  lastPunch: AttendanceRow;
}

const LastPunchDetails = ({ lastEventCoords, lastPunch }: LastPunchDetailsProps) => (
  <div className="rounded-lg border border-gray-200 p-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
    <div>
      In {formatBackendTime(lastPunch.checkInTime)} · Out{' '}
      {formatBackendTime(lastPunch.checkOutTime)}
      {lastPunch.status ? (
        <span className="ml-2 inline-block">
          <Badge variant="success">{lastPunch.status}</Badge>
        </span>
      ) : null}
    </div>
    {lastPunch.source ? (
      <p className="mt-1 text-gray-500 dark:text-gray-400">Source: {lastPunch.source}</p>
    ) : null}
    {lastEventCoords ? (
      <p className="mt-1 font-mono text-[10px] text-gray-500 dark:text-gray-400">
        {lastEventCoords} (WGS84)
      </p>
    ) : null}
  </div>
);

interface PunchActionAreaProps {
  buttonLabel: string;
  disabled: boolean;
  mutationError: string | null;
  onPunch: () => Promise<void>;
  onTrackLocationChange: (track: boolean) => void;
  submitting: boolean;
  trackLocation: boolean;
}

const PunchActionArea = ({
  buttonLabel,
  disabled,
  mutationError,
  onPunch,
  onTrackLocationChange,
  submitting,
  trackLocation,
}: PunchActionAreaProps) => (
  <>
    {mutationError ? (
      <PageNotice variant="error" title="Punch Could Not Be Recorded">
        {mutationError}
      </PageNotice>
    ) : null}
    <label className="flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        checked={trackLocation}
        disabled={submitting}
        onChange={(event) => onTrackLocationChange(event.target.checked)}
      />
      Record GPS location (saved with punch in / punch out)
    </label>
    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
      You can punch in and out several times a day. Total time adds up each completed in→out block.
    </p>
    <Button
      variant="primary"
      fullWidth
      busy={submitting}
      busyLabel="Recording Attendance…"
      disabled={disabled}
      onClick={() => void onPunch()}
    >
      {buttonLabel}
    </Button>
  </>
);

const PunchInOut = () => {
  const client = useGraphClient('client');
  const currentTime = useDashboardCardClock();
  const loadSummary = useCallback(async () => {
    const result = await client.request<{ punchDaySummary: Summary }>(PunchDaySummaryDocument);
    return result.punchDaySummary;
  }, [client]);
  const {
    data: summary,
    error: summaryError,
    phase: summaryPhase,
    refresh: refreshSummary,
  } = useRetainedQuery(loadSummary);
  const onRefresh = () => void refreshSummary();
  const { handlePunch, lastPunch, mutationError, setTrackLocation, submitting, trackLocation } =
    usePunchMutation({
      client,
      refreshSummary,
      summary,
      summaryPhase,
    });
  const nextIsCheckIn = !summary?.openSegment;
  const buttonLabel = getButtonLabel(submitting, nextIsCheckIn);
  const summaryIsReady = summaryPhase === 'ready' && summary !== null;
  const lastEventCoords = getLastEventCoords(lastPunch);

  return (
    <Card title="Attendance">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatTime(currentTime)}
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(currentTime)}
          </div>
        </div>
        <PunchSummaryContent
          error={summaryError}
          phase={summaryPhase}
          summary={summary}
          onRefresh={onRefresh}
        />
        {summary ? (
          <Button
            variant="quiet"
            size="sm"
            fullWidth
            busy={summaryPhase === 'refreshing'}
            busyLabel="Refreshing Attendance Summary…"
            onClick={onRefresh}
          >
            Refresh Attendance Summary
          </Button>
        ) : null}
        {lastPunch ? (
          <LastPunchDetails lastPunch={lastPunch} lastEventCoords={lastEventCoords} />
        ) : null}
        <PunchActionArea
          buttonLabel={buttonLabel}
          disabled={!summaryIsReady}
          mutationError={mutationError}
          onPunch={handlePunch}
          onTrackLocationChange={setTrackLocation}
          submitting={submitting}
          trackLocation={trackLocation}
        />
      </div>
    </Card>
  );
};

export default PunchInOut;
