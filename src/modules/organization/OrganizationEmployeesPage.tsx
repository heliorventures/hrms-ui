import { useEffect, useMemo, useState } from 'react';

import {
  ClientOpsEmployeesDirectoryDocument,
  type ClientOpsEmployeesDirectoryQuery,
} from '../../api/graphql/graphql';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import EmployeeDirectoryTable from './EmployeeDirectoryTable';

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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 data-optional-heading="true" className="page-heading">
            Employee Directory
          </h1>
        </div>
        <div className="app-search-slot w-full sm:w-80">
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
        <EmployeeDirectoryTable rows={filteredEmployees} />
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
