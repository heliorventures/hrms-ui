import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import {
  authorizationStateKey,
  createPermissionService,
} from '../../auth/permissionService';
import PunchInOut from './components/PunchInOut';
import LeaveBalanceCard from './components/LeaveBalanceCard';
import NotificationsPreview from './components/NotificationsPreview';
import OnLeaveToday from './components/OnLeaveToday';
import UpcomingHolidays from './components/UpcomingHolidays';

const Dashboard = () => {
  const { clientSession, user } = useAuth();
  const { currentTenant } = useTenant();
  const permissions = createPermissionService(clientSession);
  const authorizationKey = authorizationStateKey(clientSession);
  const canReadAttendance = permissions.canCapability('dashboard.attendance');
  const canReadLeave = permissions.canCapability('dashboard.leave');
  const canReadNotifications = permissions.canCapability('dashboard.notifications');

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 dark:border-slate-700/80 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name ?? 'there'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              {currentTenant.name} · {user?.designation ?? 'Employee'}
            </p>
          </div>
        </div>

        {canReadAttendance ? <PunchInOut key={`attendance:${authorizationKey}`} /> : null}

        {canReadLeave ? (
          <div className="space-y-6">
            <LeaveBalanceCard key={`leave-balance:${authorizationKey}`} />
            <OnLeaveToday key={`on-leave:${authorizationKey}`} />
            <UpcomingHolidays key={`holidays:${authorizationKey}`} />
          </div>
        ) : null}
      </div>

      {canReadNotifications ? (
        <div className="lg:w-[420px] xl:w-[480px] lg:shrink-0">
          <div className="sticky top-4 h-[calc(100vh-5rem)] min-h-[400px] lg:h-[calc(100vh-5rem)]">
            <NotificationsPreview key={`notifications:${authorizationKey}`} fullHeight />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
