import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import CreateEmployeeModal from './components/CreateEmployeeModal';
import EditEmployeeModal, { type EditEmployeeRow } from './components/EditEmployeeModal';
import { ClientOpsAdminEmployeesDocument, ClientOpsAdminOrgLabelsDocument } from '../../api/graphql/graphql';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

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
  reportingManagerId?: string | null;
  userId?: string | null;
  departmentName?: string | null;
  designationTitle?: string | null;
  linkedUserEmail?: string | null;
  reportingManagerName?: string | null;
}

interface EmployeesData {
  employees: EmployeeRow[];
}

const AdminEmployeesPage = () => {
  const client = useGraphClient('client');
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<EditEmployeeRow | null>(null);
  const [deptNames, setDeptNames] = useState<Record<string, string>>({});
  const [desigTitles, setDesigTitles] = useState<Record<string, string>>({});

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.request<EmployeesData>(ClientOpsAdminEmployeesDocument, {
        limit: 100,
      });
      setEmployees(result.employees ?? []);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const o = await client.request<{
          departments: { id: string; name: string }[];
          designations: { id: string; title: string }[];
        }>(ClientOpsAdminOrgLabelsDocument, { dlim: 100, glim: 100 });
        if (cancelled) return;
        const d: Record<string, string> = {};
        o.departments?.forEach((x) => {
          d[x.id] = x.name;
        });
        const g: Record<string, string> = {};
        o.designations?.forEach((x) => {
          g[x.id] = x.title;
        });
        setDeptNames(d);
        setDesigTitles(g);
      } catch {
        /* list still shows raw ids */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => m.set(e.id, e.fullName));
    return m;
  }, [employees]);

  const columns = useMemo(
    () => [
      {
        key: 'employeeCode',
        label: 'Employee ID',
      },
      {
        key: 'fullName',
        label: 'Name',
      },
      {
        key: 'reportingManagerId',
        label: 'Reports to',
        render: (row: EmployeeRow) =>
          row.reportingManagerName ||
          (row.reportingManagerId && nameById.get(row.reportingManagerId)) ||
          row.reportingManagerId ||
          '—',
      },
      {
        key: 'userId',
        label: 'Linked User',
        render: (employee: EmployeeRow) =>
          employee.linkedUserEmail ?? employee.userId ?? '—',
      },
      {
        key: 'departmentId',
        label: 'Department',
        render: (employee: EmployeeRow) =>
          employee.departmentName ||
          (employee.departmentId && deptNames[employee.departmentId]) ||
          employee.departmentId ||
          '—',
      },
      {
        key: 'designationId',
        label: 'Designation',
        render: (employee: EmployeeRow) =>
          employee.designationTitle ||
          (employee.designationId && desigTitles[employee.designationId]) ||
          employee.designationId ||
          '—',
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
        render: (row: EmployeeRow) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditRow(row);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [deptNames, desigTitles, nameById]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
        <Button onClick={() => setCreateOpen(true)}>Add Employee</Button>
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

      <Card title="Admin notes">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <strong>Add / Edit</strong> use <code className="text-xs">createEmployee</code> /{' '}
          <code className="text-xs">updateEmployee</code> with org picks and optional{' '}
          <strong>reporting manager</strong> (cycle-safe on the server). Employee code and date of
          joining are not editable after create.
        </p>
      </Card>

      <CreateEmployeeModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refetch()}
      />
      <EditEmployeeModal
        isOpen={editRow !== null}
        employee={editRow}
        onClose={() => {
          setEditRow(null);
        }}
        onUpdated={() => void refetch()}
      />
    </div>
  );
};

export default AdminEmployeesPage;
