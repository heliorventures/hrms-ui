import type { GraphQLClient } from 'graphql-request';

import {
  EmployeeEsicNumberDocument as employeeEsicQuery,
  SetEmployeeEsicNumberDocument as setEmployeeEsicMutation,
} from './graphql/graphql';

export const readEmployeeEsic = (client: GraphQLClient, employeeId: string) =>
  client.request(employeeEsicQuery, { employeeId });

export const saveEmployeeEsic = (client: GraphQLClient, employeeId: string, esicNumber: string) =>
  client.request(setEmployeeEsicMutation, { input: { employeeId, esicNumber } });
