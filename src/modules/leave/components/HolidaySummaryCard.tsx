import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { formatDisplayDate } from '../../../utils/dateDisplay';
import type { LeaveBoardQuery } from '../../../api/graphql/graphql';

interface HolidaySummaryCardProps {
  canManageLeave: boolean;
  holidays: LeaveBoardQuery['upcomingHolidays'];
  loading: boolean;
  onViewAll: () => void;
}

const HolidaySummaryCard = ({
  canManageLeave,
  holidays,
  loading,
  onViewAll,
}: HolidaySummaryCardProps) => (
  <Card
    title={
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span>Upcoming public holidays</span>
        <Button variant="outline" type="button" className="!py-1 !text-xs" onClick={onViewAll}>
          View all
        </Button>
      </span>
    }
  >
    {loading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    ) : holidays.length ? (
      <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
        {holidays.slice(0, 14).map((holiday) => (
          <li key={holiday.id} className="flex flex-wrap justify-between gap-2 py-2">
            <span className="font-medium text-gray-900 dark:text-white">{holiday.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDisplayDate(holiday.holidayDate)} - {holiday.calendarName}
              {holiday.holidayType ? ` - ${holiday.holidayType}` : ''}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No holidays scheduled ahead. Admins can add calendars under Admin &gt; Leave Settings
        {canManageLeave ? ' (/admin/leave-settings)' : ''}.
      </p>
    )}
  </Card>
);

export default HolidaySummaryCard;
