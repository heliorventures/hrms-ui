import Card from '../../components/common/Card';
import LeaveBalancesSection from './components/LeaveBalancesSection';
import LeaveHolidaysSection from './components/LeaveHolidaysSection';
import { LeaveSettingsHeaderFromModel } from './components/LeaveSettingsHeader';
import LeavePoliciesSection from './components/LeavePoliciesSection';
import LeaveTypesSection from './components/LeaveTypesSection';
import { useAdminLeaveSettings } from './hooks/useAdminLeaveSettings';

const AdminLeaveSettingsPage = () => {
  const model = useAdminLeaveSettings();

  return (
    <div className="space-y-6">
      <LeaveSettingsHeaderFromModel model={model} />

      {model.error ? (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{model.error}</p>
        </Card>
      ) : null}

      {model.tab === 'types' ? <LeaveTypesSection model={model} /> : null}
      {model.tab === 'policies' ? <LeavePoliciesSection model={model} /> : null}
      {model.tab === 'balances' ? <LeaveBalancesSection model={model} /> : null}
      {model.tab === 'holidays' ? <LeaveHolidaysSection model={model} /> : null}
    </div>
  );
};

export default AdminLeaveSettingsPage;
