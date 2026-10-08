import type { TourDefinition } from '../../../guidance/tourTypes';

export const adminCompanyLocationsPageTour: TourDefinition = {
  id: 'admin-company-locations-page',
  routePaths: ['admin/company-locations'],
  steps: [
    {
      id: 'company-locations-find',
      anchor: 'company-locations.filters',
      title: 'Find a company location',
      body: 'Search the company location name and use the active-only filter. Locations are company-specific and a normalized active name must be unique.',
    },
    {
      id: 'company-locations-add',
      anchor: 'company-locations.add',
      title: 'Add, edit or retire a location',
      body: 'Add location opens a name and address form. Edit preserves the location ID. Retire is available only after employee, weekly-off policy and holiday-calendar dependencies have been removed. Employee profiles assign a location from today; attendance policy configures its weekly offs.',
      isVisible: ({ canCapability }) => canCapability?.('route.admin.companyLocations') ?? false,
    },
  ],
};
