import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManage = ({ canCapability }: TourContext) =>
  canCapability?.('action.onboarding.manage') ?? false;
const canSelf = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('onboarding:self', ['SELF']) ?? false;
const canUsePage = (context: TourContext) => canSelf(context) || canManage(context);

export const onboardingPageTour: TourDefinition = {
  id: 'workplace-onboarding-page',
  routePaths: ['workplace/onboarding'],
  steps: [
    {
      id: 'onboarding-sections',
      anchor: 'onboarding.sections',
      title: 'Choose joining or exit',
      body: 'Joining Checklist shows assigned tasks. Exit & Separation shows your exit request and separation records. These sections display different actions based on your role and the request status.',
    },
    {
      id: 'onboarding-checklist',
      anchor: 'onboarding.checklist',
      title: 'Update a joining checklist',
      body: 'Each checklist item includes its owner and due date. Mark done or Mark incomplete updates that item, and the updated status appears in the checklist.',
      isVisible: canUsePage,
    },
    {
      id: 'onboarding-exit-request',
      anchor: 'onboarding.exit-request',
      title: 'Submit an exit request',
      body: 'An employee can enter the separation type, resignation date, last working day, and context before submitting. The request then appears in Your Requests for tracking and review.',
      isVisible: canUsePage,
    },
    {
      id: 'onboarding-separation-management',
      anchor: 'onboarding.separation-requests',
      title: 'Process separation requests',
      body: 'Onboarding managers can approve or reject pending requests. Approved requests expose clearance tasks and full-and-final amounts; saving records the draft, while finalizing makes the settlement read-only.',
      isVisible: canManage,
    },
  ],
};
