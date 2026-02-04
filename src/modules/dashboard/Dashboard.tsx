import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import Badge from '../../components/common/Badge';
import PunchInOut from './components/PunchInOut';
import LeaveBalanceCard from './components/LeaveBalanceCard';
import NotificationsPreview from './components/NotificationsPreview';
import OnLeaveToday from './components/OnLeaveToday';
import UpcomingHolidays from './components/UpcomingHolidays';

const Dashboard = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [isPunchedIn, setIsPunchedIn] = useState(false);

  const handlePunchToggle = () => {
    setIsPunchedIn(!isPunchedIn);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
      <div className="flex-1 space-y-6 lg:min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {currentTenant.name} • {user?.designation}
            </p>
          </div>
          <Badge variant="success">{user?.employeeId}</Badge>
        </div>

        <PunchInOut
          isPunchedIn={isPunchedIn}
          onToggle={handlePunchToggle}
        />

        <div className="space-y-6">
          <LeaveBalanceCard />
          <OnLeaveToday />
          <UpcomingHolidays />
        </div>
      </div>

      <div className="lg:w-[420px] xl:w-[480px] lg:shrink-0">
        <div className="sticky top-4 h-[calc(100vh-5rem)] min-h-[400px] lg:h-[calc(100vh-5rem)]">
          <NotificationsPreview fullHeight />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
