import { Link } from 'react-router-dom';

import type { ClientOpsEmployeesDirectoryQuery } from '../../api/graphql/graphql';
import Badge from '../../components/common/Badge';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';

type Employee = ClientOpsEmployeesDirectoryQuery['employeeDirectoryPage']['rows'][number];
const columns: DataTableColumn<Employee>[] = [
  {
    id: 'employee',
    header: 'Employee',
    mobilePriority: 'primary',
    cell: (row) => (
      <div>
        <span className="font-semibold">{row.fullName}</span>
        <p className="text-xs text-content-muted">{row.employeeCode}</p>
      </div>
    ),
  },
  {
    id: 'role',
    header: 'Department / role',
    mobilePriority: 'secondary',
    cell: (row) => (
      <div>
        {row.departmentName ?? '—'}
        <p className="text-xs text-content-muted">{row.designationTitle ?? '—'}</p>
      </div>
    ),
  },
  {
    id: 'manager',
    header: 'Reports to',
    mobilePriority: 'secondary',
    cell: (row) => row.reportingManagerName ?? '—',
  },
  {
    id: 'employment',
    header: 'Employment',
    mobilePriority: 'secondary',
    cell: (row) => (
      <div>
        <span className="mr-2">{row.employmentType ?? '—'}</span>
        <Badge variant={row.status.toLowerCase() === 'active' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      </div>
    ),
  },
  {
    id: 'joined',
    header: 'Joined',
    mobilePriority: 'secondary',
    cell: (row) => new Date(row.dateOfJoining).toLocaleDateString('en-IN'),
  },
  {
    id: 'details',
    header: 'Actions',
    mobilePriority: 'secondary',
    cell: (row) => (
      <Link
        className="font-medium text-accent"
        to={`/organization/employees/${row.employeeId}`}
        aria-label={`View details for ${row.fullName}`}
      >
        View details →
      </Link>
    ),
  },
];

const EmployeeDirectoryTable = ({ rows }: { rows: Employee[] }) => (
  <DataTable
    ariaLabel="Employee directory"
    rows={rows}
    columns={columns}
    getRowId={(row) => row.employeeId}
  />
);
export default EmployeeDirectoryTable;
