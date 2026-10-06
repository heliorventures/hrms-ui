import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useEmployeeDisplayName } from '../../contexts/employeeDisplayNameContext';
import { useTenant } from '../../contexts/TenantContext';

import HomeQuickAccess from './components/HomeQuickAccess';
import LeaveBalanceCard from './components/LeaveBalanceCard';
import OnLeaveToday from './components/OnLeaveToday';
import PunchInOut from './components/PunchInOut';
import RecentLeaveRequest from './components/RecentLeaveRequest';
import UpcomingHolidays from './components/UpcomingHolidays';

const Dashboard = () => {
  const { clientSession, tenantId, user } = useAuth();
  const displayName = useEmployeeDisplayName();
  const { currentTenant } = useTenant();
  const permissions = createPermissionService(clientSession);
  const authorizationKey = authorizationStateKey(clientSession);
  const canReadAttendance = permissions.canCapability('dashboard.attendance');
  const canReadLeave = permissions.canCapability('dashboard.leave');
  const hasSummary = canReadAttendance || canReadLeave;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0" data-tour-anchor="dashboard-welcome">
          <h1 className="sr-only">Home</h1>
          <p className="break-words text-2xl font-semibold tracking-tight text-content-primary sm:text-3xl">
            Welcome back, {displayName || 'there'}.
          </p>
          <p className="mt-1 text-xs text-content-muted">
            {new Intl.DateTimeFormat(undefined, {
              timeZone: currentTenant.timezone,
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
        </div>
      </div>
      {hasSummary ? (
        <section
          aria-label="Your day"
          data-tour-anchor="dashboard-your-day"
          className={`grid items-start gap-4 ${canReadAttendance && canReadLeave ? 'md:grid-cols-2' : ''}`}
        >
          <h2 className="sr-only">Your day</h2>
          {canReadAttendance ? <PunchInOut key={`attendance:${authorizationKey}`} /> : null}
          <div className="min-w-0 space-y-4">
            <HomeQuickAccess />
            {canReadLeave ? <LeaveBalanceCard key={`leave-balance:${authorizationKey}`} /> : null}
          </div>
        </section>
      ) : (
        <HomeQuickAccess />
      )}
      {canReadLeave && permissions.canRoute('/leave') ? (
        <RecentLeaveRequest key={`${tenantId}:${user?.id}:${authorizationKey}`} />
      ) : null}
      {canReadLeave ? (
        <section
          aria-label="Around your workplace"
          className="grid items-start gap-6 border-t border-line md:grid-cols-2"
        >
          <h2 className="sr-only">Around your workplace</h2>
          <OnLeaveToday key={`on-leave:${authorizationKey}`} />
          <UpcomingHolidays key={`holidays:${authorizationKey}`} />
        </section>
      ) : null}
      {!hasSummary ? (
        <p className="rounded-xl border border-line bg-surface p-5 text-sm text-content-secondary">
          Use the navigation to open your available tools.
        </p>
      ) : null}
    </div>
  );
};

export default Dashboard;
