import { useCallback, useEffect, useRef, useState } from 'react';

import { PunchDaySummaryDocument, PunchTodayDocument } from '../../../api/graphql/graphql';
import { authorizationStateKey, createPermissionService } from '../../../auth/permissionService';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import PageNotice from '../../../components/common/PageNotice';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { useRetainedQuery, type RetainedQueryPhase } from '../../../hooks/useRetainedQuery';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import { formatTenantTime, tenantDateKey } from '../../../utils/tenantTime';
import { formatBackendTime } from '../../../utils/timeFormat';

import AttendanceSummaryDetails from './AttendanceSummaryDetails';
import type { AttendanceRow, Summary } from './attendanceSummaryTypes';
import { DashboardCardInitialState, DashboardCardRefreshNotice } from './DashboardCardQueryState';

function displayRow(row: AttendanceRow, timezone: string): AttendanceRow {
  return {
    ...row,
    checkInTime: row.checkInAt ? formatTenantTime(row.checkInAt, timezone) : row.checkInTime,
    checkOutTime: row.checkOutAt ? formatTenantTime(row.checkOutAt, timezone) : row.checkOutTime,
  };
}

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

const formatTime = (date: Date, timezone: string) =>
  date.toLocaleTimeString('en-IN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const formatDate = (date: Date, timezone: string) =>
  date.toLocaleDateString('en-IN', {
    timeZone: timezone,
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
  timezone: string;
  client: GraphClient;
  refreshSummary: () => Promise<void>;
  summary: Summary | null;
  summaryPhase: RetainedQueryPhase;
}

const usePunchMutation = ({
  timezone,
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
      setLastPunch(displayRow(result.punchToday, timezone));
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
    <PageInformation title="Attendance totals">
      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        You can punch in and out several times a day. Total time adds up each completed in→out
        block.
      </p>
    </PageInformation>
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

interface AuthorizedPunchInOutProps {
  canPunch: boolean;
}

const AuthorizedPunchInOut = ({ canPunch }: AuthorizedPunchInOutProps) => {
  const client = useGraphClient('client');
  const currentTime = useDashboardCardClock();
  const { currentTenant } = useTenant();
  const { timezone } = currentTenant;
  const today = tenantDateKey(currentTime, timezone);
  const loadSummary = useCallback(async () => {
    const result = await client.request<{ punchDaySummary: Summary }>(PunchDaySummaryDocument);
    const summary = result.punchDaySummary;
    if (summary.workDate !== today)
      throw new Error('Attendance summary is for another day. Refresh to load today’s attendance.');
    return {
      ...summary,
      segments: summary.segments.map((row) => displayRow(row, timezone)),
      openSegment: summary.openSegment ? displayRow(summary.openSegment, timezone) : null,
    };
  }, [client, timezone, today]);
  const {
    data: summary,
    error: summaryError,
    phase: summaryPhase,
    refresh: refreshSummary,
  } = useRetainedQuery(loadSummary);
  const onRefresh = () => void refreshSummary();
  const { handlePunch, lastPunch, mutationError, setTrackLocation, submitting, trackLocation } =
    usePunchMutation({
      timezone,
      client,
      refreshSummary,
      summary: summary?.workDate === today ? summary : null,
      summaryPhase,
    });
  const nextIsCheckIn = !summary?.openSegment;
  const buttonLabel = getButtonLabel(submitting, nextIsCheckIn);
  const summaryIsReady = summaryPhase === 'ready' && summary?.workDate === today;
  const lastEventCoords = getLastEventCoords(lastPunch);

  return (
    <Card title="Today’s attendance">
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
          <div className="text-xl font-semibold tabular-nums text-content-primary">
            {formatTime(currentTime, timezone)}
          </div>
          <div className="text-xs text-content-secondary">{formatDate(currentTime, timezone)}</div>
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
            busy={summaryPhase === 'refreshing'}
            busyLabel="Refreshing Attendance Summary…"
            onClick={onRefresh}
          >
            Refresh Attendance Summary
          </Button>
        ) : null}
        {lastPunch ? (
          <details className="rounded-lg bg-surface-selected p-3">
            <summary className="cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Last punch details
            </summary>
            <LastPunchDetails lastPunch={lastPunch} lastEventCoords={lastEventCoords} />
          </details>
        ) : null}
        {canPunch ? (
          <PunchActionArea
            buttonLabel={buttonLabel}
            disabled={!summaryIsReady}
            mutationError={mutationError}
            onPunch={handlePunch}
            onTrackLocationChange={setTrackLocation}
            submitting={submitting}
            trackLocation={trackLocation}
          />
        ) : null}
      </div>
    </Card>
  );
};

const PunchInOut = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  if (!permissions.canCapability('dashboard.attendance')) return null;

  return (
    <AuthorizedPunchInOut
      key={authorizationStateKey(clientSession)}
      canPunch={permissions.canCapability('action.attendance.punch')}
    />
  );
};

export default PunchInOut;
