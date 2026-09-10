import Card from '../../components/common/Card';
import PageTabs, { PageTabPanel } from '../../components/common/PageTabs';
import { usePageTabs } from '../../hooks/usePageTabs';

import { AnnouncementWorkspace, DirectNotificationWorkspace } from './AdminCommunicationWorkspaces';
import NotificationAutomationSettingsCard from './components/NotificationAutomationSettingsCard';
import { useAdminNotificationsPageModel } from './useAdminNotificationsPageModel';

const AdminNotificationsPage = () => {
  const model = useAdminNotificationsPageModel();
  const tabs = [
    { id: 'announcements', label: 'Announcements' },
    { id: 'direct', label: 'Direct Notifications' },
    ...(model.data?.notificationAutomationSettings
      ? [{ id: 'automation', label: 'Automated Greetings' }]
      : []),
  ];
  const { tab, setTab } = usePageTabs(tabs);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Communications</h1>
      <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />

      {model.error ? (
        <Card>
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {model.error}
          </p>
        </Card>
      ) : null}

      {model.success ? (
        <Card>
          <p
            className="text-sm text-green-700 dark:text-green-300"
            role="status"
            aria-live="polite"
          >
            {model.success}
          </p>
        </Card>
      ) : null}

      <AnnouncementWorkspace model={model} tab={tab} />
      <DirectNotificationWorkspace model={model} tab={tab} />
      {model.data?.notificationAutomationSettings ? (
        <PageTabPanel id="automation" activeTab={tab}>
          <NotificationAutomationSettingsCard
            initialSettings={model.data.notificationAutomationSettings}
          />
        </PageTabPanel>
      ) : null}
    </div>
  );
};

export default AdminNotificationsPage;
