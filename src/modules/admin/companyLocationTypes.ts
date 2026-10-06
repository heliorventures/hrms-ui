export interface CompanyLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  active: boolean;
  updatedAt: string;
}
export const EMPTY_LOCATION = { name: '', address: '', city: '', state: '', country: '' };
export interface LocationPage {
  nodes: CompanyLocation[];
  pageInfo: { totalCount: number; currentPage: number; hasNextPage: boolean; hasPrevPage: boolean };
}
export interface LocationAssignment {
  employeeId: string;
  locationId: string | null;
  locationName: string | null;
  effectiveFrom: string | null;
  revision: number;
  businessDate: string;
}
export interface WeeklyOffVersion {
  id: string;
  effectiveFrom: string;
  inheritsDefault: boolean;
  fixedWeekdays: number[];
  saturdayOrdinals: number[];
}
export interface CalendarPolicy {
  activationDate: string | null;
  revision: number;
  locationId: string | null;
  businessDate: string;
  currentVersion: WeeklyOffVersion | null;
  scheduledVersions: WeeklyOffVersion[];
}
