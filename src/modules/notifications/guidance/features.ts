import type { GuidanceTabSet, StepDestination } from '../../../guidance/tabTypes';

export const notificationGuidanceTabs: readonly GuidanceTabSet[] = [
  {
    routePaths: ['notifications'],
    anchor: 'notifications-tabs',
    tabs: [
      {
        id: 'private',
        label: 'Private notifications',
        body: 'Review your private notifications and their read status.',
      },
      {
        id: 'announcements',
        label: 'Company announcements',
        body: 'Review published company announcements and acknowledgement requests.',
      },
    ],
  },
];
export const notificationStepDestinations: Readonly<Record<string, StepDestination>> = {
  'notifications-private-filter': { tabId: 'private' },
  'notifications-mark-all-read': { tabId: 'private' },
  'notifications-compose-team-post': { tabId: 'announcements' },
  'notifications-compose-announcement': { tabId: 'announcements' },
};
