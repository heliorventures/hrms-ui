import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import Card from '../../../components/common/Card';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';

import PeriodEditor from './PeriodEditor';

const employeesQuery = /* GraphQL */ `
  query PeriodInputEmployees {
    employees(limit: 500) {
      id
      employeeCode
      fullName
    }
  }
`;
interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
}
const PayrollPeriodInputs = ({ client }: { client: GraphQLClient }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    client
      .request<{ employees: Employee[] }>(employeesQuery)
      .then((result) => {
        if (active) setEmployees(result.employees);
      })
      .catch((reason: unknown) => {
        if (active) setError(graphQlUserMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [client]);
  return (
    <Card title="Monthly payroll inputs">
      <p className="mb-3 text-sm text-slate-600">
        Review salary, LWP, incentive, advance and deductions before running payroll. Generated or
        processed periods cannot be changed.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Employee
          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="rounded border border-slate-300 p-2"
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode} — {employee.fullName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Year
          <input
            type="number"
            min="1900"
            max="2200"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="rounded border border-slate-300 p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Month
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="rounded border border-slate-300 p-2"
          />
        </label>
      </div>
      {employeeId && (
        <PeriodEditor
          key={`${employeeId}:${year}:${month}`}
          client={client}
          employeeId={employeeId}
          year={year}
          month={month}
        />
      )}
    </Card>
  );
};
export default PayrollPeriodInputs;
