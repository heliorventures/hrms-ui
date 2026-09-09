import { useRef } from 'react';

import { authorizationStateKey } from '../../../auth/permissionService';
import Card from '../../../components/common/Card';
import PageInformation from '../../../components/common/PageInformation';
import Tabs from '../../../components/common/Tabs';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import { useGraphClient } from '../../../hooks/useGraphClient';

import { PrejoiningCandidatesPanel } from './PrejoiningCandidatesPanel';
import { PrejoiningConfigPanel } from './PrejoiningConfigPanel';
import { PrejoiningWorkspaceDialogs } from './PrejoiningWorkspaceDialogs';
import { usePrejoiningAdminModel } from './usePrejoiningAdminModel';

const PrejoiningAdminWorkspace = () => {
  const model = usePrejoiningAdminModel();
  const { tab, setTab, error, notice, canManage, canReview, tabs } = model;
  if (!canManage && !canReview) {
    return (
      <Card title="Pre-joining">
        <p className="text-sm text-content-secondary">
          You do not have access to pre-joining configuration or candidate review.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="sr-only">Pre-joining</h1>
        <PageInformation title="Pre-joining">
          <p className="text-sm text-content-secondary">
            Configure private candidate forms, review submissions, and confirm joined employees.
          </p>
        </PageInformation>
      </div>
      {notice ? (
        <p role="status" className="text-sm text-status-success">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-status-danger">
          {error}
        </p>
      ) : null}
      <Tabs
        tabs={tabs}
        value={tab}
        onValueChange={(value) => setTab(value as 'config' | 'candidates')}
      />

      {tab === 'config' && canManage ? <PrejoiningConfigPanel model={model} /> : null}
      {tab === 'candidates' && canReview ? <PrejoiningCandidatesPanel model={model} /> : null}
      <PrejoiningWorkspaceDialogs model={model} />
    </div>
  );
};

const PrejoiningAdminPage = () => {
  const client = useGraphClient('client');
  const { clientSession } = useAuth();
  const { currentTenant } = useTenant();
  const identity = useRef({ client, version: 0 });
  if (identity.current.client !== client)
    identity.current = { client, version: identity.current.version + 1 };
  const ownerKey = `${currentTenant.id}|${authorizationStateKey(clientSession)}|${identity.current.version}`;
  return <PrejoiningAdminWorkspace key={ownerKey} />;
};
export default PrejoiningAdminPage;
