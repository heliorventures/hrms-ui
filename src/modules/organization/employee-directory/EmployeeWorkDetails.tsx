import { Link } from 'react-router-dom';

import { directoryJoiningDate, type DirectoryEmployee } from './employeeDirectoryModel';

const EmployeeWorkDetails = ({ employee, id }: { employee: DirectoryEmployee; id: string }) => (
  <section
    id={id}
    aria-label={`Work details for ${employee.fullName}`}
    className="app-card rounded-xl border border-line bg-surface p-4 sm:p-5"
  >
    <div key={employee.employeeId} className="app-employee-work-details space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
            Work details
          </p>
          <h2 className="break-words text-lg font-semibold">{employee.fullName}</h2>
          <p className="break-words text-xs text-content-muted">{employee.employeeCode}</p>
        </div>
        <Link
          to={`/organization/employees/${encodeURIComponent(employee.employeeId)}`}
          className="app-button inline-flex min-h-11 items-center rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent hover:bg-surface-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label={`Open profile for ${employee.fullName}`}
        >
          Open profile
        </Link>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-xs text-content-muted">Department / designation</dt>
          <dd className="break-words">
            {employee.departmentName ?? 'Not recorded'} ·{' '}
            {employee.designationTitle ?? 'Not recorded'}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-content-muted">Reports to</dt>
          <dd className="break-words">{employee.reportingManagerName ?? 'Not recorded'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-content-muted">Employment</dt>
          <dd className="break-words">
            {employee.employmentType ?? 'Not recorded'} · {employee.status}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-content-muted">Joined</dt>
          <dd>{directoryJoiningDate(employee.dateOfJoining)}</dd>
        </div>
      </dl>
    </div>
  </section>
);
export default EmployeeWorkDetails;
