import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';

interface EmployeeRow {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  employmentType?: string | null;
  dateOfJoining: string;
  departmentId?: string | null;
  designationId?: string | null;
  userId?: string | null;
}

interface EmployeesData {
  employees: EmployeeRow[];
}

const EMPLOYEES_QUERY = gql`
  query EmployeesDirectory($limit: Int! = 100) {
    employees(limit: $limit) {
      id
      employeeCode
      firstName
      lastName
      fullName
      status
      employmentType
      dateOfJoining
      departmentId
      designationId
      userId
    }
  }
`;

const matchSearch = (employee: EmployeeRow, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const fields = [
    employee.fullName,
    employee.employeeCode,
    employee.status,
    employee.employmentType ?? '',
    employee.departmentId ?? '',
    employee.designationId ?? '',
  ].filter(Boolean);
  return fields.some((f) => f.toLowerCase().includes(q));
};

const OrganizationEmployeesPage = () => {
  const client = useGraphClient('client');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<EmployeesData>(EMPLOYEES_QUERY, { limit: 100 });
        if (!cancelled) setEmployees(result.employees ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load employees');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => matchSearch(e, searchQuery));
  }, [employees, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All employees in your organization
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            type="search"
            placeholder="Search by name, employee code, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            className="rounded-lg border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {error && (
        <Card>
          <p className="py-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading employees...
          </p>
        </Card>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {employee.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {employee.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {employee.employeeCode}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Email
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.userId ?? 'Not linked'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Department
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.departmentId ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Designation
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.designationId ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Employment Type
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.employmentType ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Joining Date
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {new Date(employee.dateOfJoining).toLocaleDateString('en-IN')}
                  </dd>
                </div>
                <div className="pt-2">
                  <Badge
                    variant={employee.status.toLowerCase() === 'active' ? 'success' : 'neutral'}
                  >
                    {employee.status}
                  </Badge>
                </div>
              </dl>
              <div className="mt-4">
                <Link
                  to={`/organization/employees/${employee.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  View details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredEmployees.length === 0 && (
        <Card>
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchQuery.trim()
              ? 'No employees match your search. Try a different term.'
              : 'No employees found.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default OrganizationEmployeesPage;
