import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminAttendancePolicyPageTour: TourDefinition = {
  id: 'admin-attendance-policy-page',
  routePaths: ['admin/attendance-policy'],
  steps: [
    {
      id: 'attendance-policy-boundary',
      anchor: 'attendance-policy.boundary-preview',
      title: 'Schedule the attendance day boundary',
      body: 'A boundary change uses a start time and future effective work date. Preview shows the affected transition and following work dates and their timezone; scheduling requires confirming that exact interval and updates the active tenant policy on its effective date.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.attendancePolicy')),
    },
    {
      id: 'attendance-policy-punch-rules',
      anchor: 'attendance-policy.save-punch-rules',
      title: 'Set live punch restrictions',
      body: 'The live punch policy can enforce a complete latitude, longitude, and distance rule, an IP allowlist, or both. Latitude, longitude, and distance must be configured together. Save changes which punch locations and networks are accepted; this tour does not save the policy.',
      isVisible: ({ canCapability }) => Boolean(canCapability?.('route.admin.attendancePolicy')),
    },
  ],
};
