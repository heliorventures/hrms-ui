import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canReviewProfiles = (context: TourContext) =>
  context.canCapability?.('route.organization.profileReviews') ?? false;

export const profileReviewTour: TourDefinition = {
  id: 'organization-profile-reviews',
  routePaths: ['organization/profile-reviews'],
  steps: [
    {
      id: 'profile-review-refresh',
      anchor: 'profile-review-refresh',
      title: 'Refresh the review queues',
      body: 'Refresh reloads pending profile changes and employee evidence for review.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-evidence-queue',
      anchor: 'profile-review-evidence-queue',
      title: 'Verify education and work evidence',
      body: 'Evidence rows show the employee, evidence type, summary, and available attachments. Review an item before changing its verification status.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-evidence-actions',
      anchor: 'profile-review-evidence-actions',
      title: 'Review evidence actions',
      body: 'Secure evidence opens a protected file. Verify accepts the evidence, while Reject opens a dialog requiring a reason shown to the employee. This tour does not open files or change verification status.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-status-filter',
      anchor: 'profile-review-status-filter',
      title: 'Filter profile change requests',
      body: 'Choose Pending, Approved, Rejected, or Cancelled to review that request history.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-request-list',
      anchor: 'profile-review-request-list',
      title: 'Select a change request',
      body: 'Choose a request to load protected current and requested values. Values are decrypted only after a reviewer opens the request.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-request-details',
      anchor: 'profile-review-request-details',
      title: 'Compare requested values and evidence',
      body: 'The details show current and requested field values and provide secure access to any supporting document. Review the evidence before resolving a pending request.',
      isVisible: canReviewProfiles,
    },
    {
      id: 'profile-review-decision-actions',
      anchor: 'profile-review-decision-actions',
      title: 'Approve or reject a change',
      body: 'Approve applies a pending profile change. Reject opens a dialog requiring a reason that is shown to the employee. These actions resolve the request, so this tour does not open the dialog or submit a decision.',
      isVisible: canReviewProfiles,
    },
  ],
};
