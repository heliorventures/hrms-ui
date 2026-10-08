import type {
  CompanyLocationsQuery,
  EmployeeLocationAssignmentQuery,
  WorkingCalendarFieldsFragment,
} from '../../api/graphql/graphql';
export type LocationPage = CompanyLocationsQuery['companyLocations'];
export type CompanyLocation = LocationPage['nodes'][number];
export type LocationAssignment = EmployeeLocationAssignmentQuery['employeeLocationAssignment'];
export type CalendarPolicy = WorkingCalendarFieldsFragment;
export type WeeklyOffVersion = NonNullable<CalendarPolicy['currentVersion']>;
export const EMPTY_LOCATION = { name: '', address: '', city: '', state: '', country: '' };
