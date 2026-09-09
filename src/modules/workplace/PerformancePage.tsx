import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { createPermissionService } from '../../auth/permissionService';
import { useAuth } from '../../contexts/AuthContext';

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
  const tabs = [
    ...(canSelf ? [{ id: 'my', label: 'My Performance' }] : []),
    ...(canEvaluate ? [{ id: 'team', label: 'Team Reviews' }] : []),
    ...(canManage
      ? [
          { id: 'setup', label: 'Setup' },
          { id: 'process', label: 'Process' },
          { id: 'review', label: 'Review' },
        ]
      : []),
  ];
  const tab = tabs.find((item) => item.id === params.get('tab'))?.id ?? tabs[0]?.id;
  const selectTab = (id: string) => setParams({ tab: id });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-content-primary">Performance</h1>
      <div
        role="tablist"
        aria-label="Performance workflow"
        className="flex flex-wrap gap-2 border-b border-line pb-3"
      >
        {tabs.map((item, index) => (
          <button
            key={item.id}
            id={`performance-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls="performance-panel"
            tabIndex={tab === item.id ? 0 : -1}
            className={`rounded-md px-4 py-2 text-sm font-medium ${tab === item.id ? 'bg-accent text-content-inverse' : 'text-content-secondary hover:bg-surface-selected'}`}
            onClick={() => selectTab(item.id)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
              if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
              if (event.key === 'Home') next = 0;
              if (event.key === 'End') next = tabs.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                selectTab(tabs[next].id);
                document.getElementById(`performance-tab-${tabs[next].id}`)?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab ? (
        <div id="performance-panel" role="tabpanel" aria-labelledby={`performance-tab-${tab}`}>
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
            >
              <summary className="cursor-pointer py-2 text-sm text-content-secondary">
                Legacy cycles and goals
              </summary>
              {showLegacy && <LegacyPerformanceCatalog />}
            </details>
          )}
        </div>
      ) : (
        <p>No performance access is assigned to your account.</p>
      )}
    </div>
  );
};

export default PerformancePage;
