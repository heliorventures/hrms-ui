import type { TourDefinition } from '../../../guidance/tourTypes';

export const assetsPageTour: TourDefinition = {
  id: 'workplace-assets-page',
  routePaths: ['workplace/assets'],
  steps: [
    {
      id: 'assets-sections',
      anchor: 'assets.sections',
      title: 'Choose an asset section',
      body: 'Inventory and Categories are available to users with inventory access. Assignments and Returns shows asset assignments allowed by your scope; History shows permitted past activity.',
    },
    {
      id: 'assets-my-assignments',
      anchor: 'assets.sections',
      title: 'Review assigned assets',
      body: 'My Assets shows the assignments available to you. Assignment details remain in the page and are not included in this tour.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('assets:self', ['SELF'])),
    },
    {
      id: 'assets-management',
      anchor: 'assets.inventory-action',
      title: 'Manage inventory and categories',
      body: 'Authorized asset managers can create or edit inventory records and categories. The related dialogs collect asset or category details, and saving changes the inventory catalog. Retiring an asset removes it from active inventory; a category can be retired only after all its assets are retired or moved. This tour does not open a dialog or save changes.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('assets:manage', ['ALL'])),
    },
    {
      id: 'assets-categories',
      anchor: 'assets.category-action',
      title: 'Maintain asset categories',
      body: 'New Category opens the category form. Saving adds a category that can be used to organize inventory. This tour does not open the form or save changes.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('assets:manage', ['ALL'])),
    },
    {
      id: 'assets-assignment',
      anchor: 'assets.assignment-action',
      title: 'Assign or return an asset',
      body: 'Assign Asset opens an assignment form for an available asset and employee. A return form records the return date and condition. Saving either form changes the assignment record; this tour performs neither action.',
      isVisible: ({ canScopedPermission }) =>
        Boolean(canScopedPermission?.('assets:manage', ['ALL'])),
    },
  ],
};
