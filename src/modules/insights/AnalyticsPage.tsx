import { useState } from 'react';

import { createPermissionService } from '../../auth/permissionService';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useReportOwner } from '../reports/useReportOwner';

import HrInsightsPanel from './HrInsightsPanel';
import WorkplaceInsightsPanel from './WorkplaceInsightsPanel';

const InsightsWorkspace = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const [tab, setTab] = useState('hr');
  if (!permissions.canCapability('route.insights'))
    return <p role="status">HR insights require company analytics access.</p>;
  const workplace = permissions.canCapability('route.workplace.succession');
  return (
    <div className="space-y-4">
      <PageHeader title="Insights" />
      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { id: 'hr', label: 'HR overview', panelId: 'analytics-tab-hr' },
          ...(workplace
            ? [{ id: 'workplace', label: 'Workplace', panelId: 'analytics-tab-workplace' }]
            : []),
        ]}
      />
      {tab === 'workplace' && workplace ? <WorkplaceInsightsPanel /> : <HrInsightsPanel />}
    </div>
  );
};
const AnalyticsPage = () => {
  const owner = useReportOwner();
  return <InsightsWorkspace key={owner} />;
};
export default AnalyticsPage;
