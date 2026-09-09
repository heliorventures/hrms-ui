import { ArrowUpRight, CalendarPlus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

import { authorizationStateKey, createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

import LeaveBalanceCard from './components/LeaveBalanceCard';
import OnLeaveToday from './components/OnLeaveToday';
import PunchInOut from './components/PunchInOut';
import UpcomingHolidays from './components/UpcomingHolidays';

const shortcutClass =
  'inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

const HomeShortcuts = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  return (
    <nav aria-label="Home shortcuts" className="flex flex-wrap gap-2">
      {permissions.canCapability('action.leave.submit') && permissions.canRoute('/leave') ? (
        <Link to="/leave" className={shortcutClass}>
          <CalendarPlus aria-hidden="true" className="h-4 w-4 text-accent" /> Request leave
        </Link>
      ) : null}
      {permissions.canRoute('/my-work/tasks') ? (
        <Link to="/my-work/tasks" className={shortcutClass}>
          <ClipboardList aria-hidden="true" className="h-4 w-4 text-accent" /> My Tasks
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-content-muted" />
        </Link>
      ) : null}
    </nav>
  );
};

const Dashboard = () => {
  const { clientSession, user } = useAuth();
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
          <h1 className="text-2xl font-semibold tracking-tight text-content-primary">Home</h1>
          <p className="mt-1 text-sm text-content-secondary">
            Welcome back, {user?.name || 'there'}.
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
