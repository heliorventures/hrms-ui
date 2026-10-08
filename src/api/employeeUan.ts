import type { GraphQLClient } from 'graphql-request';

import {
  EmployeeUanNumberDocument as employeeUanQuery,
  SetEmployeeUanNumberDocument as setEmployeeUanMutation,
} from './graphql/graphql';

export const readEmployeeUan = (client: GraphQLClient, employeeId: string) =>
  client.request(employeeUanQuery, {
    employeeId,
  });

export const saveEmployeeUan = (client: GraphQLClient, employeeId: string, uanNumber: string) =>
  client.request(setEmployeeUanMutation, { input: { employeeId, uanNumber } });
