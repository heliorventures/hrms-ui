import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManage = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('benefits:manage', ['ALL']) ?? false;
const canEnroll = ({ hasEmployeeProfile, canPermission }: TourContext) =>
  Boolean(hasEmployeeProfile) &&
  ((canPermission?.('benefits:self') ?? false) || (canPermission?.('benefits:manage') ?? false));
const onTab = (context: TourContext, tab: string, isDefault = false) =>
  context.activeTab ? context.activeTab === tab : isDefault;

export const benefitsPageTour: TourDefinition = {
  id: 'workplace-benefits-page',
  routePaths: ['workplace/benefits'],
  steps: [
    {
      id: 'benefits-sections',
      anchor: 'benefits.sections',
      title: 'Browse benefits',
      body: 'Benefit Plans lists available plans, Benefit Types describes their categories, and My Enrollments shows your existing elections when your account has employee access.',
    },
    {
      id: 'benefit-enrollment-status',
      anchor: 'benefits.sections',
      title: 'Review your enrollments',
      body: 'My Enrollments shows the status, effective date, and contribution amounts for your elections. Browse Benefit Plans to see currently active options.',
      isVisible: (context) => canEnroll(context) && onTab(context, 'enrollments', true),
    },
    {
      id: 'benefit-enrollment',
      anchor: 'benefits.plan.enroll',
      title: 'Enroll in an active plan',
      body: 'An active optional plan can be selected from Benefit Plans. Enrolling records your election, and its status and effective date then appear under My Enrollments. The tour does not enroll you.',
      isVisible: (context) => canEnroll(context) && onTab(context, 'plans'),
    },
    {
      id: 'benefit-plan-management',
      anchor: 'benefits.plans.actions',
      title: 'Manage benefit plans',
      body: 'Benefit managers can create or edit a plan, choose its type, contributions, mandatory status, and activity. The editor validates the plan before Save updates the catalog.',
      isVisible: (context) => canManage(context) && onTab(context, 'plans', !canEnroll(context)),
    },
    {
      id: 'benefit-type-management',
      anchor: 'benefits.types.actions',
      title: 'Manage benefit types',
      body: 'Benefit types group plans by name, code, and category. Create or Edit opens the type editor; Save updates the catalog for future plan configuration.',
      isVisible: (context) => canManage(context) && onTab(context, 'types'),
    },
  ],
};
