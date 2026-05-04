import { useParams, Link } from 'react-router-dom';
import { EmployeeProfileShell } from './employee-profile/EmployeeProfileShell';

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();

  if (!employeeId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-slate-500 dark:text-slate-400">Missing employee id.</p>
        <Link
          to="/organization/employees"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Employees
        </Link>
      </div>
    );
  }

  return <EmployeeProfileShell employeeId={employeeId} />;
};

export default EmployeeDetailPage;
