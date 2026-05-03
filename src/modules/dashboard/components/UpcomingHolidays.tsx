import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { ClientOpsUpcomingHolidaysDocument } from '../../../api/graphql/graphql';

interface HRow {
  id: string;
  holidayDate: string;
  name: string;
  calendarName: string;
  holidayType?: string | null;
}

const UpcomingHolidays = () => {
  const client = useGraphClient('client');
  const [rows, setRows] = useState<HRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.request<{ upcomingHolidays: HRow[] }>(
          ClientOpsUpcomingHolidaysDocument,
          {
            limit: 12,
          }
        );
        if (!c) setRows(res.upcomingHolidays);
      } catch (e) {
        if (!c) {
          setError(e instanceof Error ? e.message : 'Failed to load holidays');
        }
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [client]);

  return (
    <Card title="Upcoming holidays">
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
      {error && !loading && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((h) => (
            <li
              key={h.id}
              className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{h.name}</span>
                {h.holidayType && (
                  <Badge variant="neutral" size="sm">
                    {h.holidayType}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(h.holidayDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {h.calendarName}
              </p>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && rows && rows.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming holidays in range.</p>
      )}
      <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
        <Link
          to="/leave/holidays"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Show all holidays →
        </Link>
      </div>
    </Card>
  );
};

export default UpcomingHolidays;
