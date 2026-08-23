import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import {
  ClientOpsEmployeesDirectoryDocument,
  type ClientOpsEmployeesDirectoryQuery,
} from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

type EmployeeRow = ClientOpsEmployeesDirectoryQuery['employeeDirectoryPage']['rows'][number];

const matchSearch = (employee: EmployeeRow, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const fields = [
    employee.fullName,
    employee.employeeCode,
    employee.status,
    employee.employmentType ?? '',
    employee.departmentName ?? '',
    employee.designationTitle ?? '',
    employee.reportingManagerName ?? '',
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
        const allRows = new Map<string, EmployeeRow>();
        const seenCursors = new Set<string>();
        let after: string | undefined;
        do {
          let result: ClientOpsEmployeesDirectoryQuery;
          try {
            result = await client.request(ClientOpsEmployeesDirectoryDocument, {
              limit: 100,
              after,
            });
          } catch (cause) {
            if (!cancelled && allRows.size > 0) {
              setEmployees([...allRows.values()]);
              setError(
                `Loaded ${allRows.size} employees, but a later directory page failed: ${graphQlUserMessage(cause)}`
              );
              return;
            }
            throw cause;
          }
          for (const row of result.employeeDirectoryPage.rows) {
            allRows.set(row.employeeId, row);
          }
          const next = result.employeeDirectoryPage.nextCursor ?? undefined;
          if (!next || seenCursors.has(next)) break;
          seenCursors.add(next);
          after = next;
        } while (!cancelled);
        if (!cancelled) setEmployees([...allRows.values()]);
      } catch (e) {
        if (!cancelled) {
          setError(graphQlUserMessage(e));
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
            aria-label="Search employees"
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
            Loading Employees...
          </p>
        </Card>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.employeeId} className="flex flex-col">
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
                    Department
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.departmentName ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Designation
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.designationTitle ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Reports to
                  </dt>
                  <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                    {employee.reportingManagerName ?? '—'}
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
                  to={`/organization/employees/${employee.employeeId}`}
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
              : 'No Employees Found.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default OrganizationEmployeesPage;
