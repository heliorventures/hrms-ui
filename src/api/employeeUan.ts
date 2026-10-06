import { gql, type GraphQLClient } from 'graphql-request';

const employeeUanQuery = gql`
  query EmployeeUanNumber($employeeId: ID!) {
    employeeUanNumber(employeeId: $employeeId)
  }
`;

const setEmployeeUanMutation = gql`
  mutation SetEmployeeUanNumber($input: SetEmployeeUanNumberInput!) {
    setEmployeeUanNumber(input: $input)
  }
`;

export const readEmployeeUan = (client: GraphQLClient, employeeId: string) =>
  client.request<{ employeeUanNumber: string | null }, { employeeId: string }>(employeeUanQuery, {
    employeeId,
  });

export const saveEmployeeUan = (client: GraphQLClient, employeeId: string, uanNumber: string) =>
  client.request<
    { setEmployeeUanNumber: string | null },
    { input: { employeeId: string; uanNumber: string } }
  >(setEmployeeUanMutation, { input: { employeeId, uanNumber } });
