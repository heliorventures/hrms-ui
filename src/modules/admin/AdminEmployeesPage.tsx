import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';

interface EmployeeRow {
  id: string;
  employeeCode: string;
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
  query AdminEmployees($limit: Int! = 100) {
    employees(limit: $limit) {
      id
      employeeCode
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

const AdminEmployeesPage = () => {
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

  const columns = [
    {
      key: 'employeeCode',
      label: 'Employee ID',
    },
    {
      key: 'fullName',
      label: 'Name',
    },
    {
      key: 'userId',
      label: 'Linked User',
      render: (employee: EmployeeRow) => employee.userId ?? '—',
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (employee: EmployeeRow) => employee.departmentId ?? '—',
    },
    {
      key: 'designationId',
      label: 'Designation',
      render: (employee: EmployeeRow) => employee.designationId ?? '—',
    },
    {
      key: 'dateOfJoining',
      label: 'Joining Date',
      render: (employee: EmployeeRow) =>
        new Date(employee.dateOfJoining).toLocaleDateString('en-IN'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (employee: EmployeeRow) => (
        <Badge variant={employee.status.toLowerCase() === 'active' ? 'success' : 'neutral'}>
          {employee.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <Button size="sm" variant="outline" disabled title="Employee mutations are not wired yet">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
        <Button disabled title="Employee creation mutation is not wired yet">
          Add Employee
        </Button>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Employee List">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading employees...</p>
        ) : employees.length > 0 ? (
          <Table data={employees} columns={columns} keyExtractor={(employee) => employee.id} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No employees found</p>
        )}
      </Card>

      <Card title="Pending Admin Actions">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This screen now reads live employee data from the employee subgraph. Add/edit actions
          remain disabled until employee write mutations are implemented.
        </p>
      </Card>
    </div>
  );
};

export default AdminEmployeesPage;
