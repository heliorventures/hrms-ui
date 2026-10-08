import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminAttendancePolicyPageTour: TourDefinition = {
  id: 'admin-attendance-policy-page',
  routePaths: ['admin/attendance-policy'],
  steps: [
    {
      id: 'attendance-policy-weekly-offs',
      anchor: 'attendance-policy.weekly-offs',
      title: 'Configure weekly offs by location',
      body: 'Activate the working calendar explicitly from today. Set the company default or choose an active company location, then select fixed weekdays and selected Saturdays such as second and fourth. Preview the month, choose an effective date and save the policy. Location inheritance uses the dated company default; a scheduled roster takes precedence. Existing leave requests retain their saved chargeable dates.',
      isVisible: ({ canCapability }) => canCapability?.('route.admin.attendancePolicy') ?? false,
    },
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
