import { useMockApi } from '../../../hooks/useMockApi';
import { useTenant } from '../../../contexts/TenantContext';
import { mockHolidays } from '../../../mocks/leaves';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const UpcomingHolidays = () => {
  const { currentTenant } = useTenant();
  const today = new Date().toISOString().split('T')[0];

  const { data: holidays, loading } = useMockApi(
    () =>
      mockHolidays
        .filter(
          (h) => h.tenantId === currentTenant.id && h.date >= today
        )
        .slice(0, 5)
        .sort((a, b) => a.date.localeCompare(b.date)),
    { delay: 300 }
  );

  if (loading) {
    return (
      <Card title="Upcoming Holidays">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card title="Upcoming Holidays">
      {holidays && holidays.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <p className="font-medium text-gray-900 dark:text-white">
                {holiday.name}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {new Date(holiday.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <div className="mt-2">
                <Badge
                  variant={holiday.type === 'national' ? 'success' : 'info'}
                  size="sm"
                >
                  {holiday.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No upcoming holidays
        </p>
      )}
    </Card>
  );
};

export default UpcomingHolidays;
