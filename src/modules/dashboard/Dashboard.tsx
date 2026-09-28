import { CalendarPlus, ClipboardList } from 'lucide-react';

import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import PageActionLink from '../../components/common/PageActionLink';
import { useAuth } from '../../contexts/AuthContext';
import { useEmployeeDisplayName } from '../../contexts/employeeDisplayNameContext';
import { useTenant } from '../../contexts/TenantContext';

import LeaveBalanceCard from './components/LeaveBalanceCard';
import OnLeaveToday from './components/OnLeaveToday';
import PunchInOut from './components/PunchInOut';
import UpcomingHolidays from './components/UpcomingHolidays';

const HomeShortcuts = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  return (
    <nav aria-label="Home shortcuts" className="ml-auto flex flex-wrap justify-end gap-2">
      {permissions.canCapability('action.leave.submit') && permissions.canRoute('/leave') ? (
        <PageActionLink
          to="/leave?apply=1"
          label="Request leave"
          icon={<CalendarPlus className="h-5 w-5" />}
        />
      ) : null}
      {permissions.canRoute('/my-work/tasks') ? (
        <PageActionLink
          to="/my-work/tasks"
          label="My Tasks"
          icon={<ClipboardList className="h-5 w-5" />}
        />
      ) : null}
    </nav>
  );
};

const Dashboard = () => {
  const { clientSession } = useAuth();
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
        <div className="min-w-0">
          <h1 className="sr-only">Home</h1>
          <p className="break-words text-lg font-semibold text-content-primary sm:text-xl">
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
        <HomeShortcuts />
      </div>
      {hasSummary ? (
        <section
          aria-label="Your day"
          className={`grid items-start gap-4 ${canReadAttendance && canReadLeave ? 'md:grid-cols-2' : ''}`}
        >
          <h2 className="sr-only">Your day</h2>
          {canReadAttendance ? <PunchInOut key={`attendance:${authorizationKey}`} /> : null}
          {canReadLeave ? <LeaveBalanceCard key={`leave-balance:${authorizationKey}`} /> : null}
        </section>
      ) : null}
      {canReadLeave ? (
        <section
          aria-label="Around your workplace"
          className="grid items-start gap-4 md:grid-cols-2"
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
