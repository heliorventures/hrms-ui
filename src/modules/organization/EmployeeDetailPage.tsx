import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useGraphClient } from '../../hooks/useGraphClient';
import { ClientOpsEmployeeDetailDocument } from '../../api/graphql/graphql';

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
  reportingManagerId?: string | null;
  departmentName?: string | null;
  designationTitle?: string | null;
  linkedUserEmail?: string | null;
  reportingManagerName?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeDetailData {
  employee: EmployeeRow | null;
}

const EmployeeDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const client = useGraphClient('client');
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.request<EmployeeDetailData>(ClientOpsEmployeeDetailDocument, {
          id: employeeId,
        });
        if (!cancelled) setEmployee(result.employee ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load employee');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, employeeId]);

  if (!employeeId || (!loading && !employee)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">{error ?? 'Employee not found.'}</p>
        <Link
          to="/organization/employees"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          ← Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/organization/employees"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Back to Employees
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            Employee Details{employee ? ` – ${employee.fullName}` : ''}
          </h1>
        </div>
      </div>

      {loading && (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading employee details...</p>
        </Card>
      )}

      {!loading && employee && (
        <>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Employee Code
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.employeeCode}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Linked login
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.linkedUserEmail ??
                    (employee.userId ? 'Linked account (email unavailable)' : '—')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Employment Type
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.employmentType ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  <Badge
                    variant={employee.status.toLowerCase() === 'active' ? 'success' : 'neutral'}
                  >
                    {employee.status}
                  </Badge>
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  First Name
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.firstName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Last Name
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Joining Date
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {new Date(employee.dateOfJoining).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Job">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Department
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.departmentName ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Designation
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.designationTitle ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Reports to
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {employee.reportingManagerName ?? '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card title="System References">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Department ID
                </p>
                <p className="mt-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                  {employee.departmentId ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Designation ID
                </p>
                <p className="mt-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                  {employee.designationId ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Reporting manager ID
                </p>
                <p className="mt-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                  {employee.reportingManagerId ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Linked user ID
                </p>
                <p className="mt-1 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                  {employee.userId ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Created At
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {new Date(employee.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Updated At
                </p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {new Date(employee.updatedAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Pending Profile Tabs">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The old About/Profile/Job/Documents tabs depended on mock profile data that is not yet
              backed by subgraph queries. This page now shows only the fields currently exposed by
              the live employee service.
            </p>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
