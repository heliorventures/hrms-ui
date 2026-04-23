import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useGraphClient } from '../../../hooks/useGraphClient';

const PUNCH = gql`
  mutation PunchToday {
    punchToday {
      id
      workDate
      checkInTime
      checkOutTime
      status
    }
  }
`;

const PUNCH_SUMMARY = gql`
  query PunchDaySummary {
    punchDaySummary {
      workDate
      totalWorkedMinutes
      openSegment {
        id
        checkInTime
        checkOutTime
        status
      }
      segments {
        id
        checkInTime
        checkOutTime
        status
      }
    }
  }
`;

type AttendanceRow = {
  id: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status?: string | null;
};

type Summary = {
  workDate: string;
  totalWorkedMinutes: number;
  openSegment: AttendanceRow | null;
  segments: AttendanceRow[];
} | null;

const PunchInOut = () => {
  const client = useGraphClient('client');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [summary, setSummary] = useState<Summary>(null);
  const [lastPunch, setLastPunch] = useState<AttendanceRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await client.request<{
        punchDaySummary: NonNullable<Summary>;
      }>(PUNCH_SUMMARY);
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
      const res = await client.request<{ punchToday: AttendanceRow }>(PUNCH);
      setLastPunch(res.punchToday);
      await loadSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Punch failed');
    } finally {
      setSubmitting(false);
    }
  };

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
                  <li key={s.id} className="flex justify-between text-xs">
                    <span>Segment {i + 1}</span>
                    <span>
                      {s.checkInTime ?? '—'} → {s.checkOutTime ?? 'open'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {summary.openSegment && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Open: checked in at {summary.openSegment.checkInTime} — tap &quot;Punch out&quot; to
                close this block.
              </p>
            )}
          </div>
        )}

        {lastPunch && (
          <div className="rounded-lg border border-gray-200 p-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            Last action: In {lastPunch.checkInTime ?? '—'} · Out {lastPunch.checkOutTime ?? '—'}
            {lastPunch.status && (
              <span className="ml-2 inline-block">
                <Badge variant="success">{lastPunch.status}</Badge>
              </span>
            )}
          </div>
        )}

        {error && <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>}

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          You can punch in and out several times a day. Total time adds up each completed in→out
          block.
        </p>

        <Button
          variant="primary"
          fullWidth
          disabled={submitting || loadingSummary}
          onClick={handlePunch}
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
};

export default PunchInOut;
