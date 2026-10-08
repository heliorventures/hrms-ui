import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const announcementsTab = ({ activeTab }: TourContext) => activeTab === 'announcements';

export const notificationsTour: TourDefinition = {
  id: 'notifications',
  routePaths: ['notifications'],
  steps: [
    {
      id: 'notifications-tabs',
      anchor: 'notifications-tabs',
      title: 'Switch notification lists',
      body: 'My Notifications contains private alerts. Announcements & Team Posts contains shared updates.',
    },
    {
      id: 'notifications-private-filter',
      anchor: 'notifications-private-filter',
      title: 'Filter private alerts',
      body: 'Switch between all and unread private notifications. This does not filter company announcements.',
      isVisible: ({ activeTab }) => activeTab === 'private',
    },
    {
      id: 'notifications-mark-all-read',
      anchor: 'notifications-mark-all-read',
      title: 'Mark private alerts read',
      body: 'This marks your private notifications as read. It does not affect other users or announcements.',
      isVisible: ({ activeTab }) => activeTab === 'private',
    },
    {
      id: 'notifications-compose-team-post',
      anchor: 'notifications-compose',
      title: 'Create a team post',
      body: 'This opens the team post form. Review its audience and content before publishing; the tour does not open or submit the form.',
      isVisible: (context) =>
        announcementsTab(context) && !context.canCapability?.('action.notifications.manage'),
    },
    {
      id: 'notifications-compose-announcement',
      anchor: 'notifications-compose',
      title: 'Create an announcement',
      body: 'HR can choose an audience and schedule an announcement. The form can include attachments or video; review those settings before publishing.',
      isVisible: (context) =>
        announcementsTab(context) &&
        Boolean(context.canCapability?.('action.notifications.manage')),
    },
    {
      id: 'notifications-admin-console',
      anchor: 'notifications-admin-console',
      title: 'Manage notification delivery',
      body: 'The admin console contains tenant notification automation and delivery settings.',
      isVisible: (context) => Boolean(context.canCapability?.('action.notifications.manage')),
    },
    {
      id: 'notifications-preferences',
      anchor: 'notifications-preferences-link',
      title: 'Adjust your notification preferences',
      body: 'Notification preferences lets you control in-app alerts and bulletin categories for your account.',
    },
  ],
};
