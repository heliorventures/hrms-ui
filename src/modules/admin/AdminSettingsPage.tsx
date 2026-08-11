import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { ClientOpsAdminSettingsEmployeesDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName: string;
  status: string;
  employmentType?: string | null;
  userId?: string | null;
}

interface EmployeeSettingsData {
  employees: EmployeeRow[];
}

const AdminSettingsPage = () => {
  const client = useGraphClient('client');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<EmployeeSettingsData>(
          ClientOpsAdminSettingsEmployeesDocument,
          {
            limit: 100,
          }
        );
        if (!cancelled) setEmployees(result.employees ?? []);
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Employee Directory Snapshot">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Employees...</p>
        ) : employees.length > 0 ? (
          <Table
            data={employees}
            keyExtractor={(row) => row.id}
            columns={[
              { key: 'employeeCode', label: 'Employee ID' },
              { key: 'fullName', label: 'Name' },
              {
                key: 'userId',
                label: 'Linked User',
                render: (row: EmployeeRow) => row.userId ?? '—',
              },
              {
                key: 'employmentType',
                label: 'Employment',
                render: (row: EmployeeRow) => row.employmentType ?? '—',
              },
              {
                key: 'status',
                label: 'Status',
                render: (row: EmployeeRow) => (
                  <Badge variant={row.status.toLowerCase() === 'active' ? 'success' : 'neutral'}>
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Employees Found.</p>
        )}
      </Card>

      <Card title="Pending Admin Controls">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          These controls previously mutated local mock state only. They now remain intentionally
          disabled until real backend mutations are available.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Leave Types & Balances</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Needs backend leave-balance queries plus write mutations.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Override</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Needs attendance override mutation support in the attendance service.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
