import type { TourDefinition } from '../../../guidance/tourTypes';

export const dashboardTour: TourDefinition = {
  id: 'dashboard',
  routePaths: ['dashboard'],
  steps: [
    {
      id: 'dashboard-welcome',
      anchor: 'dashboard-welcome',
      title: 'Your Home page',
      body: 'Start here for the current date, your available shortcuts, and personal work summaries.',
    },
    {
      id: 'dashboard-quick-access',
      anchor: 'dashboard-quick-access',
      title: 'Open common tools',
      body: 'Quick access links are limited to tools available to your account.',
    },
    {
      id: 'dashboard-your-day',
      anchor: 'dashboard-your-day',
      title: 'Review your attendance and leave',
      body: 'These summaries appear when your account can view the corresponding attendance or leave data.',
      isVisible: ({ canCapability }) =>
        Boolean(canCapability?.('dashboard.attendance') || canCapability?.('dashboard.leave')),
    },
    {
      id: 'dashboard-punch',
      anchor: 'dashboard-punch-action',
      title: 'Record attendance',
      body: 'Punch In or Punch Out records an attendance event. The tour only explains this control; use it when you intend to record a punch.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.attendance.punch')),
    },
    {
      id: 'dashboard-request-leave',
      anchor: 'dashboard-request-leave',
      title: 'Start a leave request',
      body: 'Request leave opens the Leave Center with the request form selected. Review dates and policy there before submitting.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('action.leave.submit')),
    },
  ],
};
