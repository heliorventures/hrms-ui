import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { canAccessTenantPath } from '../../auth/navAccess';
import Card from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';

const HrHomePage = () => {
  const { can, clientSession } = useAuth();
  const navOpts = useMemo(() => ({ can, clientSession }), [can, clientSession]);
  const canConfigureLeaveSettings = canAccessTenantPath('/admin/leave-settings', navOpts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR workbench</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          People administration and operational workflows. Tenant-wide configuration for roles,
          leave policies, and platform settings lives under <span className="font-mono text-xs">Admin</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="People admin">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create and update employee records, assignments, and HR workflows.
          </p>
          <Link
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            to="/hr/people"
          >
            Open people admin →
          </Link>
        </Card>
        <Card title="Leave">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Self-service apply and balances on <span className="font-mono text-xs">/leave</span>; HR-focused
            approval queue with employee names.
            {canConfigureLeaveSettings ? (
              <>
                {' '}
                Leave types, policies, and holidays are configured under{' '}
                <span className="font-mono text-xs">Admin → Leave settings</span>.
              </>
            ) : (
              <>
                {' '}
                Configuration of leave types and holidays requires{' '}
                <span className="font-mono text-xs">leave:manage</span> (tenant admin / HR).
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
            <Link
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/leave"
            >
              Employee leave →
            </Link>
            <Link
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/hr/leaves"
            >
              Approval queue →
            </Link>
            {canConfigureLeaveSettings ? (
              <Link
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                to="/admin/leave-settings"
              >
                Leave types, policies, balances & holidays →
              </Link>
            ) : null}
          </div>
        </Card>
        <Card title="Workflows">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Configure approval graphs used by leave and expenses.
          </p>
          <Link
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            to="/workplace/workflows"
          >
            Open workflow designer →
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default HrHomePage;
