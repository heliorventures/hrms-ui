import type { AppChildRoute } from './routeTypes';

export const LOAN_ROUTES: AppChildRoute[] = [
  {
    kind: 'page',
    path: 'loans/my',
    title: 'My loans',
    tenantPath: '/loans/my',
    load: () => import('../modules/loans/MyLoansPage'),
  },
  {
    kind: 'page',
    path: 'loans/admin',
    title: 'Loan administration',
    tenantPath: '/loans/admin',
    load: () => import('../modules/loans/LoanAdminPage'),
  },
  {
    kind: 'page',
    path: 'loans/policies',
    title: 'Loan policies',
    tenantPath: '/loans/policies',
    load: () => import('../modules/loans/LoanPoliciesPage'),
  },
];
