import { useCallback, useEffect, useMemo, useState } from 'react';

import { ClientOpsAdminOrgLabelsDocument } from '../../api/graphql/graphql';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageActions from '../../components/common/PageActions';
import PageInformation from '../../components/common/PageInformation';
import Table from '../../components/common/Table';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import CreateEmployeeModal from './components/CreateEmployeeModal';
import EditEmployeeModal, { type EditEmployeeRow } from './components/EditEmployeeModal';


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
  linkedUserUsername?: string | null;
  reportingManagerName?: string | null;
}

interface EmployeesData {
  employees: EmployeeRow[];
}

const ClientOpsAdminEmployeesWithLoginDocument = `
  query ClientOpsAdminEmployeesWithLogin($limit: Int! = 100) {
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
      reportingManagerId
      userId
      departmentName
      designationTitle
      linkedUserEmail
      linkedUserUsername
      reportingManagerName
    }
  }
`;

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
      const result = await client.request<EmployeesData>(ClientOpsAdminEmployeesWithLoginDocument, {
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
        label: 'Reports To',
        render: (row: EmployeeRow) =>
          row.reportingManagerName ||
          (row.reportingManagerId && nameById.get(row.reportingManagerId)) ||
          row.reportingManagerId ||
          '—',
      },
      {
        key: 'userId',
        label: 'Username',
        render: (employee: EmployeeRow) =>
          employee.linkedUserUsername ?? employee.linkedUserEmail ?? employee.userId ?? '—',
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
    <div className="space-y-4">
      <PageActions>
        <h1 className="sr-only">Employee Management</h1>
        <Button onClick={() => setCreateOpen(true)}>Add Employee</Button>
      </PageActions>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <Card title="Employee List">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Employees...</p>
        ) : employees.length > 0 ? (
          <Table data={employees} columns={columns} keyExtractor={(employee) => employee.id} />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No Employees Found</p>
        )}
      </Card>

      <PageInformation title="Employee management">
        <Card title="Admin Notes">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add and edit employees with their organization assignments and reporting manager.
            Employee code and date of joining are fixed after creation.
          </p>
        </Card>
      </PageInformation>

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
