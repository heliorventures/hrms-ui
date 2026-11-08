import type { TourDefinition } from '../../../guidance/tourTypes';

export const loanTours: readonly TourDefinition[] = [
  {
    id: 'my-loans-page',
    routePaths: ['loans/my'],
    steps: [
      {
        id: 'my-loans-requests',
        anchor: null,
        title: 'Request a loan',
        body: 'Select a published company policy and enter the amount, purpose and repayment preference. Review values before confirming. A saved draft can be edited and submitted; returned requests show the decision reason.',
        isVisible: ({ canScopedPermission }) =>
          canScopedPermission?.('loan:submit', ['SELF', 'ALL']) ?? false,
      },
      {
        id: 'my-loans-balances',
        anchor: null,
        title: 'Review your loan account',
        body: 'Open a loan to see approved terms, recorded payments and the ledger. The posted balance excludes unposted interest. Preview the repayment schedule for projections; approval alone does not record a disbursement.',
      },
    ],
  },
  {
    id: 'loan-administration-page',
    routePaths: ['loans/admin'],
    steps: [
      {
        id: 'loan-admin-accounts',
        anchor: null,
        title: 'Review loan accounts',
        body: 'Search Accounts to inspect approved terms, recorded payments and the ledger. The posted balance excludes unposted interest. Repayment schedules are projections; approval alone does not record funding.',
      },
      {
        id: 'loan-admin-requests',
        anchor: null,
        title: 'Review loan requests',
        body: 'Search the request queue and review the current approval step. Final approvers enter policy-compliant terms and review the repayment projection before confirming. Return or reject with a reason.',
        isVisible: ({ canScopedPermission }) =>
          canScopedPermission?.('loan:approve', ['TEAM', 'DEPARTMENT', 'ALL']) ?? false,
      },
      {
        id: 'loan-admin-payments',
        anchor: null,
        title: 'Record payments and deductions',
        body: 'Open Accounts to inspect balances and history. Record disbursements and repayments only after payment outside this system. Configure deductions or monthly overrides with a reason and review the preview before saving. Earlier payments and corrections require a separate financial review.',
        isVisible: ({ canScopedPermission }) =>
          (['loan:disburse', 'loan:repay', 'loan:manage', 'loan:correct'] as const).some(
            (permission) => canScopedPermission?.(permission, ['ALL']) ?? false
          ),
      },
    ],
  },
  {
    id: 'loan-policies-page',
    routePaths: ['loans/policies'],
    steps: [
      {
        id: 'loan-policy-publish',
        anchor: null,
        title: 'Publish a company loan policy',
        body: 'Configure an active loan approval workflow first. Enter reviewed eligibility, currency, exposure, interest, recovery and exit rules, then review and publish the immutable version. Retire an overlapping policy before publishing its replacement.',
      },
      {
        id: 'loan-policy-versions',
        anchor: null,
        title: 'Review policy versions',
        body: 'Review current and retired versions in the policy list. Existing loans retain their approved policy and terms. Publishing or retiring a policy does not transfer money or change an existing loan balance.',
      },
    ],
  },
];
