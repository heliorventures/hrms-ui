export const OPERATOR_WORKSPACES = [
  {
    label: 'Tenants',
    tasks: [
      { label: 'Tenant directory', path: '/ops/tenants' },
      { label: 'Feature flags', path: '/ops/feature-flags' },
    ],
  },
  {
    label: 'Billing & subscriptions',
    tasks: [
      { label: 'Modules & subscriptions', path: '/ops/modules' },
      { label: 'Billing', path: '/ops/billing' },
    ],
  },
  { label: 'Operators', tasks: [{ label: 'Operator users', path: '/ops/operators' }] },
] as const;
