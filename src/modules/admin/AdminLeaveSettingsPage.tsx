import { authorizationStateKey } from '../../auth/permissionService';
import FeedbackToast from '../../components/common/FeedbackToast';
import { useAuth } from '../../contexts/AuthContext';

import CompOffPolicySection from './components/CompOffPolicySection';
import LeaveBalancesSection from './components/LeaveBalancesSection';
import LeaveHolidaysSection from './components/LeaveHolidaysSection';
import LeavePoliciesSection from './components/LeavePoliciesSection';
import { LeaveSettingsHeaderFromModel } from './components/LeaveSettingsHeader';
import LeaveTypesSection from './components/LeaveTypesSection';
import { useAdminLeaveSettings } from './hooks/useAdminLeaveSettings';

const AdminLeaveSettingsPage = () => {
  const model = useAdminLeaveSettings();
  const { clientSession } = useAuth();

  return (
    <div className="space-y-4">
      <LeaveSettingsHeaderFromModel model={model} />
      {model.tab === 'comp-off' ? (
        <CompOffPolicySection key={authorizationStateKey(clientSession)} />
      ) : null}

      {model.error ? (
        <>
          <FeedbackToast variant={'error'} messageKey={model.error}>
            {model.error}
          </FeedbackToast>
        </>
      ) : null}

      {model.tab === 'types' ? <LeaveTypesSection model={model} /> : null}
      {model.tab === 'policies' ? <LeavePoliciesSection model={model} /> : null}
      {model.tab === 'balances' ? <LeaveBalancesSection model={model} /> : null}
      {model.tab === 'holidays' ? <LeaveHolidaysSection model={model} /> : null}
    </div>
  );
};

export default AdminLeaveSettingsPage;
