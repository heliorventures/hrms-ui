import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { createPermissionService } from '../../auth/permissionService';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import { useAuth } from '../../contexts/AuthContext';
import { PageWorkspaceContext } from '../../navigation/pageWorkspaceContext';

import LegacyPerformanceCatalog from './LegacyPerformanceCatalog';
import PerformanceLifecyclePanel from './PerformanceLifecyclePanel';

const PerformancePage = () => {
  const { clientSession } = useAuth();
  const permissions = createPermissionService(clientSession);
  const canManage = permissions.canScopedPermission('performance:manage', ['ALL']);
  const canEvaluate = permissions.canScopedPermission('performance:evaluate', ['TEAM']);
  const canSelf = permissions.canScopedPermission('performance:self', ['SELF']);
  const [params, setParams] = useSearchParams();
  const [showLegacy, setShowLegacy] = useState(false);
  const pageWorkspace = useContext(PageWorkspaceContext);
  const tabs = [
    ...(canSelf ? [{ id: 'my', label: 'My Review' }] : []),
    ...(canEvaluate ? [{ id: 'team', label: 'Team Reviews' }] : []),
    ...(canManage
      ? [
          { id: 'setup', label: 'Setup' },
          { id: 'process', label: 'Process' },
          { id: 'review', label: 'Review' },
          { id: 'administration', label: 'Administration' },
        ]
      : []),
  ];
  const tab = tabs.find((item) => item.id === params.get('tab'))?.id ?? tabs[0]?.id;
  const selectTab = (id: string) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', id);
      next.delete('review');
      return next;
    });
  return (
    <div className="space-y-4">
      <div data-tour-anchor="performance.workflow.tabs">
        <PageHeader
          title={`Performance — ${tabs.find((item) => item.id === tab)?.label ?? 'Reviews'}`}
          description="Open an assigned review or manage the performance cycle using your available tasks."
          selector={
            !pageWorkspace && tabs.length > 1 ? (
              <Select
                aria-label="Performance task"
                value={tab ?? ''}
                onChange={(event) => selectTab(event.target.value)}
                options={tabs.map((item) => ({ value: item.id, label: item.label }))}
              />
            ) : undefined
          }
        />
      </div>
      {tab ? (
        <section id="performance-panel" aria-label={tabs.find((item) => item.id === tab)?.label}>
          <PerformanceLifecyclePanel
            key={clientSession?.employeeId ?? 'admin'}
            canManage={canManage}
            canEvaluate={canEvaluate}
            canSelf={canSelf}
            actorEmployeeId={clientSession?.employeeId}
            tab={tab}
            initialReviewId={params.get('review')}
          />
          {tab === 'setup' && canManage && (
            <details
              className="mt-4"
              open={showLegacy}
              onToggle={(event) => setShowLegacy(event.currentTarget.open)}
              data-tour-anchor="performance.legacy-catalog"
            >
              <summary className="cursor-pointer py-2 text-sm text-content-secondary">
                Legacy cycles and goals
              </summary>
              {showLegacy && <LegacyPerformanceCatalog />}
            </details>
          )}
        </section>
      ) : (
        <p>No performance access is assigned to your account.</p>
      )}
    </div>
  );
};

export default PerformancePage;
