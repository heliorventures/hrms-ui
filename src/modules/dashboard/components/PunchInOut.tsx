import { useCallback, useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { PunchTodayDocument, PunchDaySummaryDocument } from '../../../api/graphql/graphql';
import { formatBackendTime } from '../../../utils/timeFormat';

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
} | null;

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
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
  if (lat == null || lng == null) return null;
  return `${lat}, ${lng}`;
}

const PunchInOut = () => {
  const client = useGraphClient('client');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [summary, setSummary] = useState<Summary>(null);
  const [lastPunch, setLastPunch] = useState<AttendanceRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [trackLocation, setTrackLocation] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await client.request<{
        punchDaySummary: NonNullable<Summary>;
      }>(PunchDaySummaryDocument);
      setSummary(res.punchDaySummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load punch summary');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [client]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const nextIsCheckIn = !summary?.openSegment;
  const buttonLabel = submitting ? 'Recording…' : nextIsCheckIn ? 'Punch in' : 'Punch out';

  const handlePunch = async () => {
    setError(null);
    setSubmitting(true);
    try {
      let input: { latitude: number; longitude: number } | null = null;
      if (trackLocation) {
        const pos = await getCurrentPosition();
        input = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      }
      const res = await client.request<{ punchToday: AttendanceRow }>(PunchTodayDocument, {
        input,
      });
      setLastPunch(res.punchToday);
      await loadSummary();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Punch failed (if location is required, allow the browser to access it)'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const lastEventCoords = lastPunch
    ? lastPunch.checkOutLat && lastPunch.checkOutLng
      ? `Punch out: ${formatCoord(lastPunch.checkOutLat, lastPunch.checkOutLng)}`
      : lastPunch.checkInLat && lastPunch.checkInLng
        ? `Punch in: ${formatCoord(lastPunch.checkInLat, lastPunch.checkInLng)}`
        : null
    : null;

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

        {loadingSummary && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading today…</p>
        )}

        {!loadingSummary && summary && (
          <div className="space-y-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Worked today (completed)
              </span>
              <span className="text-primary-600 dark:text-primary-400">
                {summary.totalWorkedMinutes} min
              </span>
            </div>
            {summary.segments.length > 0 && (
              <ul className="space-y-1 border-t border-gray-100 pt-2 text-gray-600 dark:border-gray-600 dark:text-gray-300">
                {summary.segments.map((s, i) => (
                  <li key={s.id} className="text-xs">
                    <div className="flex justify-between">
                      <span>Segment {i + 1}</span>
                      <span>
                        {formatBackendTime(s.checkInTime ?? null)} →{' '}
                        {s.checkOutTime ? formatBackendTime(s.checkOutTime) : 'open'}
                      </span>
                    </div>
                    {(formatCoord(s.checkInLat, s.checkInLng) ||
                      formatCoord(s.checkOutLat, s.checkOutLng)) && (
                      <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        In: {formatCoord(s.checkInLat, s.checkInLng) ?? '—'} · Out:{' '}
                        {formatCoord(s.checkOutLat, s.checkOutLng) ?? '—'}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {summary.openSegment && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Open: checked in at {formatBackendTime(summary.openSegment.checkInTime)} — tap
                &quot;Punch out&quot; to close this block.
              </p>
            )}
          </div>
        )}

        {lastPunch && (
          <div className="rounded-lg border border-gray-200 p-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <div>
              In {formatBackendTime(lastPunch.checkInTime)} · Out{' '}
              {formatBackendTime(lastPunch.checkOutTime)}
              {lastPunch.status && (
                <span className="ml-2 inline-block">
                  <Badge variant="success">{lastPunch.status}</Badge>
                </span>
              )}
            </div>
            {lastPunch.source && (
              <p className="mt-1 text-gray-500 dark:text-gray-400">Source: {lastPunch.source}</p>
            )}
            {lastEventCoords && (
              <p className="mt-1 font-mono text-[10px] text-gray-500 dark:text-gray-400">
                {lastEventCoords} (WGS84)
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>}

        <label className="flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            checked={trackLocation}
            onChange={(e) => {
              setTrackLocation(e.target.checked);
            }}
          />
          Record GPS location (saved with punch in / punch out)
        </label>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          You can punch in and out several times a day. Total time adds up each completed in→out
          block.
        </p>

        <Button
          variant="primary"
          fullWidth
          disabled={submitting || loadingSummary}
          onClick={() => {
            void handlePunch();
          }}
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
};

export default PunchInOut;
