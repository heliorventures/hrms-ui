import FeedbackToast from '../../components/common/FeedbackToast';
import PageHeader from '../../components/common/PageHeader';
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
      <PageHeader title="Communications" />
      <div data-tour-anchor="admin-notifications.tabs">
        <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      </div>

      {model.error ? (
        <>
          <FeedbackToast variant={'error'} messageKey={model.error}>
            {model.error}
          </FeedbackToast>
        </>
      ) : null}

      {model.success ? (
        <>
          <FeedbackToast variant={'success'} messageKey={model.success}>
            {model.success}
          </FeedbackToast>
        </>
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
