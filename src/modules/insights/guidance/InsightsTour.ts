import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canReadInsights = ({ canCapability }: TourContext) =>
  Boolean(canCapability?.('route.insights'));

export const insightsTour: TourDefinition = {
  id: 'insights',
  routePaths: ['insights'],
  steps: [
    {
      id: 'insights-tabs',
      anchor: 'insights-tabs',
      title: 'Choose an insights view',
      body: 'HR overview shows company metrics for a date range. Workplace insights appear when your account has succession access.',
      isVisible: canReadInsights,
    },
    {
      id: 'insights-workplace',
      anchor: 'insights-tabs',
      title: 'Workplace insights',
      body: 'The Workplace tab summarizes competencies and talent pools available to your account.',
      isVisible: (context) =>
        canReadInsights(context) && Boolean(context.canCapability?.('route.workplace.succession')),
    },
    {
      id: 'insights-period',
      anchor: 'insights-report-period',
      title: 'Set the reporting period',
      body: 'From date and To date define the period used by the HR metrics and report details.',
      isVisible: canReadInsights,
    },
    {
      id: 'insights-refresh',
      anchor: 'insights-refresh',
      title: 'Refresh HR metrics',
      body: 'Refresh reloads data for the selected period. Salary totals represent generated payslips, not payments made.',
      isVisible: canReadInsights,
    },
    {
      id: 'insights-report-details',
      anchor: 'insights-report-details',
      title: 'Open period records',
      body: 'View all period records opens a report for the selected period. The report may contain only records your account can access.',
      isVisible: canReadInsights,
    },
    {
      id: 'insights-pending-requests',
      anchor: 'insights-pending-requests',
      title: 'Review pending requests',
      body: 'When this workload is available, the button opens its report details. It does not approve or change a request.',
      isVisible: canReadInsights,
    },
  ],
};
