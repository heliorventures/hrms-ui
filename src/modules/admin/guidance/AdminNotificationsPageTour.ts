import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminNotificationsPageTour: TourDefinition = {
  id: 'admin-notifications-page',
  routePaths: ['admin/notifications'],
  steps: [
    {
      id: 'admin-notifications-announcements',
      anchor: 'admin-notifications.tabs',
      title: 'Publish tenant announcements',
      body: 'Announcements can be created or edited with a title, message, audience, schedule, expiry, and optional media. Publishing or deleting changes messages visible to employees; this tour does not open the editor, upload files, or submit changes.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.notifications')),
    },
    {
      id: 'admin-notifications-direct',
      anchor: 'admin-notifications.tabs',
      title: 'Send direct notifications',
      body: 'Direct Notifications selects employee recipients and sends a titled message with an optional destination link. Sending creates notifications, while delete removes one from the in-app history. This tour does not send or delete a notification.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.notifications.manage')),
    },
    {
      id: 'admin-notifications-automation',
      anchor: 'admin-notifications.tabs',
      title: 'Configure automated greetings',
      body: 'If Automated Greetings appears in the tabs, it controls birthday and work-anniversary delivery, tenant-local delivery time, message templates, and optional company-wide sharing. Saving changes future automated messages. This tour does not save the settings.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.notifications')),
    },
  ],
};
