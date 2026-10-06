import profileDocument from '../../../api/documents/employeePrivateProfile.graphql?raw';
import type { EmployeePrivateProfileQuery } from '../../../api/graphql/graphql';

export const EmployeePrivateProfileLocationDocument = profileDocument;
export type EmployeeProfileLocationQuery = Omit<EmployeePrivateProfileQuery, 'employee'> & {
  employee:
    | (NonNullable<EmployeePrivateProfileQuery['employee']> & {
        locationId?: string | null;
        locationName?: string | null;
        locationAssignmentEffectiveFrom?: string | null;
      })
    | null;
};
